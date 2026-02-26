import { Queue } from "bullmq";
import redisConnection from "../config/redis";

export const campaignQueue = new Queue("campaign-sender", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 10 }, // keeping only last 10 (im on free tier)
    removeOnFail: { count: 20 }, // keeping only last 20 failed (im on free tier)
  },
});
