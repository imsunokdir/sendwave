import { ConnectionOptions } from "bullmq";

const redisConnection: ConnectionOptions = process.env.REDIS_URL
  ? {
      url: process.env.REDIS_URL,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: "localhost",
      port: 6379,
    };

export default redisConnection;
