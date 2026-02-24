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
import { autoReplyByCategory } from "../services/smartReply.service";

// Build set of all active campaign lead emails for quick lookup
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
        .select("emailAccount")
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

              // const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;
              // const category = await categorizeEmail(emailText);

              // console.log("catgeory reply:", category);

              const leadDoc = await Lead.findOne({ email: fromEmail });
              if (!leadDoc) continue;

              const campaignWithCategories = await Campaign.findById(
                leadDoc.campaignId,
              );
              if (!campaignWithCategories) continue;

              // Build label list from campaign's custom categories
              const labels = campaignWithCategories.categories.map(
                (c) => c.name,
              );
              if (labels.length === 0) continue; // no categories defined, skip

              const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;
              const category = await categorizeEmail(emailText, labels); // ← pass labels

              if (category) {
                await client.partialUpdateObject({
                  indexName: "emails",
                  objectID: `${accountId}-INBOX-${msg.uid}`,
                  attributesToUpdate: { category },
                  createIfNotExists: false,
                });
                console.log(
                  `🏷️ Categorized reply from ${fromEmail} as "${category}"`,
                );

                // Find matched category config
                const matchedCategory = campaignWithCategories.categories.find(
                  (c) => c.name === category,
                );

                if (matchedCategory) {
                  // Stop sequence if configured
                  if (matchedCategory.stopSequence) {
                    await Lead.findByIdAndUpdate(leadDoc._id, {
                      $set: { status: "opted-out" },
                    });
                    console.log(
                      `🛑 Sequence stopped for ${fromEmail} [${category}]`,
                    );
                  }

                  // Auto-reply if configured
                  if (matchedCategory.autoReply) {
                    await autoReplyByCategory(
                      campaignWithCategories._id.toString(),
                      campaignWithCategories.user.toString(),
                      fromEmail,
                      matchedCategory,
                    );
                  }
                }
              }
            }

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
