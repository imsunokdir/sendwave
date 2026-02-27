import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import emailRouter from "./routes/email.route";

import testRouter from "./routes/test.route";
// import accountRouter from "./ai/account.routes";
import { connectMongo } from "./config/mongo";
import authRouter from "./routes/auth.routes";
import syncRouter from "./routes/syncRoutes";
// import { startEmailSyncWorker } from "./workers/emailSyncWorker";
// import { startEmailSyncCron } from "./jobs/emailSyncCron";
import outreachRouter from "./routes/outreach.routes";
import cookieParser from "cookie-parser";
import campaignRouter from "./routes/campaign.routes";
import { startCampaignWorker } from "./workers/campaignWorker";
import { startCampaignCron } from "./jobs/campaignCron";
import { startCampaignReplyCron } from "./jobs/campaignReplyCron";
// import oauthRouter from "./routes/oauth.routes";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Accept",
  optionsSuccessStatus: 204,
  maxAge: 0,
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));

// Routes
app.use("/emails", emailRouter);
// app.use("/accounts", accountRouter);
app.use("/auth", authRouter);
app.use("/sync", syncRouter);
app.use("/outreach", outreachRouter);
app.use("/test", testRouter);
app.use("/campaigns", campaignRouter);
// app.use("/oauth", oauthRouter);

// ---------------- SERVER STARTUP ----------------
const startServer = async () => {
  try {
    // Connect to MongoDB first
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ MongoDB connected successfully!");

    // Start Express server
    app.listen(PORT, async () => {
      console.log(`🚀 Server started on port: ${PORT}`);
      // startEmailSyncWorker();
      // startEmailSyncCron();
      startCampaignWorker();
      startCampaignCron();
      startCampaignReplyCron();
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

// Start the server
startServer();
