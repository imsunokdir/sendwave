import { ConnectionOptions } from "bullmq";

const redisConnection: ConnectionOptions = process.env.REDIS_URL
  ? {
      url: process.env.REDIS_URL,
      tls: { rejectUnauthorized: false },
    }
  : {
      host: "127.0.0.1",
      port: 6379,
    };

export default redisConnection;
