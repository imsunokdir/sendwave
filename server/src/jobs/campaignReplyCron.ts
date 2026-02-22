import cron from "node-cron";
import { Campaign } from "../models/campaign.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { checkAndMarkReply } from "../services/replyDetection";
import { createImapClient } from "../utility/imapConnect";
import { simpleParser } from "mailparser";
// import { indexEmail } from "./indexEmailsAlgolia";
import { categorizeEmail } from "../ai/hgnFaceCategorization";
import { client } from "../config/algoliaClient";
import { indexEmail } from "../services/indexEmailsAlgolia";

// Build a set of all lead emails across active campaigns for quick lookup
const getActiveCampaignLeadEmails = async (): Promise<Set<string>> => {
  const campaigns = await Campaign.find({ status: "active" })
    .select("leads")
    .lean();
  const emails = new Set<string>();
  for (const campaign of campaigns) {
    for (const lead of campaign.leads) {
      emails.add(lead.email.toLowerCase().trim());
    }
  }
  return emails;
};

export const startCampaignReplyCron = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      // Get accounts with active campaigns
      const activeCampaigns = await Campaign.find({ status: "active" })
        .select("emailAccount")
        .lean();
      if (activeCampaigns.length === 0) return;

      const accountIds = [
        ...new Set(activeCampaigns.map((c) => c.emailAccount.toString())),
      ];

      // Build lead email set once per run
      const leadEmails = await getActiveCampaignLeadEmails();

      for (const accountId of accountIds) {
        const account = await EmailAccount.findById(accountId);
        if (!account) continue;

        try {
          const imapClient = createImapClient(account);
          await imapClient.connect();
          await imapClient.mailboxOpen("INBOX");

          const lastUID = account.lastSyncedUID?.get("INBOX") || 0;

          // First run — just bookmark, don't process old emails
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
            if (!msg.source) continue;
            if (msg.uid <= lastUID) continue;

            const parsed = await simpleParser(msg.source);
            const fromEmail = parsed.from?.value?.[0]?.address
              ?.toLowerCase()
              .trim();

            if (!fromEmail) {
              account.lastSyncedUID.set("INBOX", msg.uid);
              await EmailAccount.findByIdAndUpdate(accountId, {
                lastSyncedUID: account.lastSyncedUID,
              });
              continue;
            }

            // Only process if sender is a campaign lead — skip everything else
            if (leadEmails.has(fromEmail)) {
              console.log(`📩 Campaign reply detected from ${fromEmail}`);

              // 1. Mark as replied in campaign
              await checkAndMarkReply(fromEmail);

              // 2. Index in Algolia so AI reply has the text
              await indexEmail(
                accountId,
                msg,
                parsed,
                "INBOX",
                account.email,
                account.user.toString(),
              );

              // 3. Categorize with AI (Interested, Not Interested etc)
              const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;
              const category = await categorizeEmail(emailText);

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
              }
            }

            // Always update last seen UID
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

  console.log("📬 Campaign reply cron started! Runs every 2 minutes.");
};
