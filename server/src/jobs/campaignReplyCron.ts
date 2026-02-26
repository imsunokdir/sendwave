import cron from "node-cron";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { checkAndMarkReply } from "../services/replyDetection";
import { createImapClient } from "../utility/imapConnect";
import { simpleParser } from "mailparser";
import { indexEmail } from "../services/indexEmailsAlgolia";
import { categorizeEmail } from "../ai/hgnFaceCategorization";
import { autoReply } from "../services/smartReply.service";

// ── Hardcoded categories ───────────────────────────────────────────────────────
const DEFAULT_LABELS = ["Interested", "Not Interested", "Spam", "Confused"];
const STOP_SEQUENCE_CATEGORIES = ["Not Interested", "Spam"];

const getActiveCampaignLeadEmails = async (): Promise<Set<string>> => {
  const activeCampaigns = await Campaign.find({ status: "active" })
    .select("_id")
    .lean();
  const campaignIds = activeCampaigns.map((c) => c._id);
  const leads = await Lead.find({ campaignId: { $in: campaignIds } })
    .select("email")
    .lean();
  const emails = new Set<string>();
  for (const lead of leads) emails.add(lead.email.toLowerCase().trim());
  return emails;
};

export const startCampaignReplyCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const activeCampaigns = await Campaign.find({ status: "active" })
        .select("emailAccount user autoReply")
        .lean();
      if (activeCampaigns.length === 0) return;

      const accountIds = [
        ...new Set(activeCampaigns.map((c) => c.emailAccount.toString())),
      ];
      const leadEmails = await getActiveCampaignLeadEmails();

      for (const accountId of accountIds) {
        const account = await EmailAccount.findById(accountId);
        if (!account) continue;

        try {
          const imapClient = await createImapClient(account);
          await imapClient.connect();
          await imapClient.mailboxOpen("INBOX");

          const lastUID = account.lastSyncedUID?.get("INBOX") || 0;

          if (lastUID === 0) {
            const status = await imapClient.status("INBOX", { uidNext: true });
            const currentLatestUID = (status.uidNext ?? 1) - 1;
            account.lastSyncedUID = account.lastSyncedUID || new Map();
            account.lastSyncedUID.set("INBOX", currentLatestUID);
            await EmailAccount.findByIdAndUpdate(accountId, {
              lastSyncedUID: account.lastSyncedUID,
            });
            await imapClient.logout();
            continue;
          }

          for await (const msg of imapClient.fetch(
            { uid: `${lastUID + 1}:*` },
            { envelope: true, source: true, uid: true },
          )) {
            if (!msg.source || msg.uid <= lastUID) continue;

            const parsed = await simpleParser(msg.source);
            const fromEmail = parsed.from?.value?.[0]?.address
              ?.toLowerCase()
              .trim();

            if (fromEmail && leadEmails.has(fromEmail)) {
              console.log(`📩 Campaign reply detected from ${fromEmail}`);

              const leadDoc = await Lead.findOne({
                email: fromEmail,
                campaignId: { $in: activeCampaigns.map((c) => c._id) },
                status: { $nin: ["opted-out", "responded"] },
              });

              await checkAndMarkReply(fromEmail);

              // ── Categorize BEFORE indexing ─────────────────────────────
              const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;
              const category = await categorizeEmail(emailText, DEFAULT_LABELS);
              console.log(`🏷️ Category: ${category}`);

              // ── Index with category already set ────────────────────────
              await indexEmail(
                accountId,
                msg,
                parsed,
                "INBOX",
                account.email,
                account.user.toString(),
                leadDoc?.campaignId?.toString(),
                category ?? "Uncategorized",
              );

              if (!leadDoc) {
                console.log(
                  `⚠️ Lead ${fromEmail} not found or already handled`,
                );
              } else {
                const campaignDoc = await Campaign.findById(leadDoc.campaignId);
                if (!campaignDoc) {
                  console.log(`⚠️ Campaign not found for lead ${fromEmail}`);
                } else {
                  // ── Stop sequence for negative categories ──────────────
                  if (category && STOP_SEQUENCE_CATEGORIES.includes(category)) {
                    await Lead.findByIdAndUpdate(leadDoc._id, {
                      $set: { status: "opted-out" },
                    });
                    console.log(
                      `🛑 Sequence stopped for ${fromEmail} [${category}]`,
                    );
                  }

                  // ── Auto reply — global campaign toggle ────────────────
                  if (campaignDoc.autoReply) {
                    console.log(`🤖 Auto-replying to ${fromEmail}`);
                    await autoReply(
                      campaignDoc._id.toString(),
                      campaignDoc.user.toString(),
                      fromEmail,
                    );
                  } else {
                    console.log(
                      `ℹ️ Auto-reply disabled for campaign "${campaignDoc.name}"`,
                    );
                  }
                }
              }
            }

            // Always update UID
            account.lastSyncedUID.set("INBOX", msg.uid);
            await EmailAccount.findByIdAndUpdate(accountId, {
              lastSyncedUID: account.lastSyncedUID,
            });
          }

          await imapClient.logout();
        } catch (err: any) {
          console.error(
            `❌ Reply check failed for account ${accountId}:`,
            err.message,
          );
        }
      }
    } catch (err: any) {
      console.error("❌ Campaign reply cron error:", err.message);
    }
  });

  console.log("📬 Campaign reply cron started!");
};
