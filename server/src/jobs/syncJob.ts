import { fetchEmailsSinceDays } from "../services/fetchEmails";
import { EmailAccount } from "../models/emailAccounts.model";
import { indexEmail } from "../services/elasticSearch";

export const startSyncJob = async (
  account: any,
  days: number,
  folders: string[] = ["INBOX"]
) => {
  console.log(`🚀 Starting sync for ${account.email}`);

  setImmediate(async () => {
    try {
      await EmailAccount.findByIdAndUpdate(account._id, {
        syncStatus: "syncing",
        errorMessage: null,
        progress: 0,
      });

      let totalEmails = 0;
      let processed = 0;

      // Count total emails across all folders
      for (const folder of folders) {
        const mails = await fetchEmailsSinceDays(account, days, folder);
        totalEmails += mails.length;
      }

      if (totalEmails === 0) {
        console.log(`⚠ No emails found for ${account.email}`);
      }

      // Fetch & index each folder
      for (const folder of folders) {
        const emails = await fetchEmailsSinceDays(account, days, folder);

        for (const mail of emails) {
          await indexEmail(account._id.toString(), mail, folder);

          processed++;
          const progress = Math.round((processed / totalEmails) * 100);

          await EmailAccount.findByIdAndUpdate(account._id, { progress });
        }
      }

      await EmailAccount.findByIdAndUpdate(account._id, {
        syncStatus: "idle",
        initialSyncCompleted: true,
        progress: 100,
      });

      console.log(`✅ Sync completed: ${account.email}`);
    } catch (err: any) {
      console.error("❌ Sync Error:", err.message);

      await EmailAccount.findByIdAndUpdate(account._id, {
        syncStatus: "error",
        errorMessage: err.message,
      });
    }
  });
};
