import { EmailAccount } from "../models/emailAccounts.model";
import { fetchEmailsAndIndex } from "../services/fetchEmails";

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

      for (const folder of folders) {
        await fetchEmailsAndIndex(account, days, folder);
      }

      // Mark sync as complete
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
