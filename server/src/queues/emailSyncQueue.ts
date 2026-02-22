import { Queue } from "bullmq";
import redisConnection from "../config/redis";

export const emailSyncQueue = new Queue("email-sync", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
