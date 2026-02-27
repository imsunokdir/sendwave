import IORedis from "ioredis";
require("dotenv").config();

// Create Redis connection
const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      tls: { rejectUnauthorized: false },
    })
  : new IORedis({
      host: "127.0.0.1",
      port: 6379,
    });

export default redisConnection;
