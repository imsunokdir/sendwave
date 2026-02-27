import { ConnectionOptions } from "bullmq";

const redisConnection: ConnectionOptions = {
  host: "localhost",
  port: 6379,
};

export default redisConnection;
