import cron from "node-cron";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { checkAndMarkReply } from "../services/replyDetection";
import { createImapClient } from "../utility/imapConnect";
import { simpleParser } from "mailparser";
import { indexEmail } from "../services/indexEmailsAlgolia";
import { categorizeEmail } from "../ai/hgnFaceCategorization";
import { client } from "../config/algoliaClient";
import { autoReply } from "../services/smartReply.service"; // ← updated import

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
  cron.schedule("*/2 * * * *", async () => {
    try {
      const activeCampaigns = await Campaign.find({ status: "active" })
        .select("emailAccount categories user autoReply") // ← add autoReply
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
          const imapClient = createImapClient(account);
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

              await checkAndMarkReply(fromEmail);
              await indexEmail(
                accountId,
                msg,
                parsed,
                "INBOX",
                account.email,
                account.user.toString(),
              );

              const leadDoc = await Lead.findOne({
                email: fromEmail,
                status: { $nin: ["opted-out", "responded"] },
              });

              if (!leadDoc) {
                console.log(
                  `⚠️ Lead ${fromEmail} not found or already handled`,
                );
              } else {
                const campaignDoc = await Campaign.findById(leadDoc.campaignId);
                if (!campaignDoc) {
                  console.log(`⚠️ Campaign not found for lead ${fromEmail}`);
                } else {
                  const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;

                  // ── Categorize for labeling only (optional) ──────────────
                  const labels =
                    campaignDoc.categories?.map((c) => c.name) ?? [];
                  if (labels.length > 0) {
                    const category = await categorizeEmail(emailText, labels);
                    console.log(`🏷️ Category: ${category}`);

                    if (category) {
                      // Update Algolia label
                      await client.partialUpdateObject({
                        indexName: "emails",
                        objectID: `${accountId}-INBOX-${msg.uid}`,
                        attributesToUpdate: { category },
                        createIfNotExists: false,
                      });

                      // Stop sequence if configured
                      const matchedCategory = campaignDoc.categories?.find(
                        (c) => c.name === category,
                      );
                      if (matchedCategory?.stopSequence) {
                        await Lead.findByIdAndUpdate(leadDoc._id, {
                          $set: { status: "opted-out" },
                        });
                        console.log(`🛑 Sequence stopped for ${fromEmail}`);
                      }
                    }
                  }

                  // ── Auto reply — global campaign toggle ──────────────────
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
