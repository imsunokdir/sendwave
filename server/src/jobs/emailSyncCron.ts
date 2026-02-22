import cron from "node-cron";
import { emailSyncQueue } from "../queues/emailSyncQueue";
import { EmailAccount } from "../models/emailAccounts.model";

export const startEmailSyncCron = () => {
  // Runs every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    console.log("Cron triggered: checking for new emails...");

    try {
      // Fetch all active email accounts
      const accounts = await EmailAccount.find({
        initialSyncCompleted: true,
        syncStatus: "idle", // only sync accounts that aren't already syncing
        isActive: true,
      });

      console.log(`Found ${accounts.length} accounts to sync`);

      // Add a job to the queue for each account
      for (const account of accounts) {
        await emailSyncQueue.add(`sync-${account.email}`, {
          accountId: account._id.toString(),
        });
        console.log(`Added sync job for ${account.email}`);
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  console.log("Email sync cron started! Runs every 2 minutes.");
};
