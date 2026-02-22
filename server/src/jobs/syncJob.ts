import { EmailAccount } from "../models/emailAccounts.model";
import { fetchEmailsAndIndex } from "../services/fetchEmails";
import { getLatestUID } from "../utility/imapConnect";

export const startSyncJob = async (
  account: any,
  days: number,
  folders: string[] = ["INBOX"],
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
        await fetchEmailsAndIndex(account, folder, "historical", days);
      }

      // Re-bookmark to current latest UID after historical sync
      const freshAccount = await EmailAccount.findById(account._id);

      for (const folder of folders) {
        const currentLatestUID = await getLatestUID(account, folder);
        freshAccount!.lastSyncedUID.set(folder, currentLatestUID);
        console.log(`📌 Bookmarked ${folder} at UID ${currentLatestUID}`);
      }

      await EmailAccount.findByIdAndUpdate(account._id, {
        syncStatus: "idle",
        initialSyncCompleted: true,
        lastSyncedUID: freshAccount!.lastSyncedUID,
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
