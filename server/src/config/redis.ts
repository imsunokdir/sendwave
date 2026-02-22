import { ConnectionOptions } from "bullmq";
require("dotenv").config();

const redisConnection: ConnectionOptions = {
  host: new URL(process.env.UPSTASH_REDIS_REST_URL as string).hostname,
  port: 6379,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: {
    rejectUnauthorized: false,
  },
};

export default redisConnection;
