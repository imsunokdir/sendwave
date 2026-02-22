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
    removeOnComplete: true,
    removeOnFail: false,
  },
});
