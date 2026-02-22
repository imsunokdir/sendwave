import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import { EmailAccount } from "../models/emailAccounts.model";
import { fetchEmailsAndIndex } from "../services/fetchEmails";

export const startEmailSyncWorker = () => {
  const worker = new Worker(
    "email-sync",
    async (job: Job) => {
      const { accountId } = job.data;
      console.log(`Processing sync job for account: ${accountId}`);

      const account = await EmailAccount.findById(accountId);
      if (!account) throw new Error(`Account ${accountId} not found`);

      await EmailAccount.findByIdAndUpdate(accountId, {
        syncStatus: "syncing",
      });

      try {
        const folders = ["INBOX"];

        for (const folder of folders) {
          console.log(`Syncing folder ${folder} for ${account.email}...`);
          await fetchEmailsAndIndex(account, folder, "incremental");
        }

        await EmailAccount.findByIdAndUpdate(accountId, {
          syncStatus: "idle",
          lastSyncedDate: new Date(),
          errorMessage: null,
        });

        console.log(`Sync complete for ${account.email}`);
      } catch (error) {
        await EmailAccount.findByIdAndUpdate(accountId, {
          syncStatus: "error",
          errorMessage: (error as Error).message,
        });
        throw error;
      }
    },
    { connection: redisConnection },
  );

  worker.on("completed", (job) => console.log(`Job ${job.id} completed!`));
  worker.on("failed", (job, err) =>
    console.error(`Job ${job?.id} failed:`, err),
  );

  console.log("Email sync worker started!");
};
