import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import redisConnection from "../config/redis";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { EmailAccount } from "../models/emailAccounts.model";
// import { decrypt } from "../utility/encryptionUtility";
import { getValidAccessToken } from "../services/tokenRefresh";

export const startCampaignWorker = () => {
  const worker = new Worker(
    "campaign-sender",
    async (job: Job) => {
      const { campaignId, leadId, stepIndex } = job.data;
      console.log(
        `📤 Sending step ${stepIndex} for lead ${leadId} in campaign ${campaignId}`,
      );

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.status !== "active") {
        console.log(`⏸ Campaign ${campaignId} is not active, skipping`);
        return;
      }

      const account = await EmailAccount.findById(campaign.emailAccount);
      if (!account)
        throw new Error(`Email account not found for campaign ${campaignId}`);

      const lead = await Lead.findById(leadId);
      if (!lead) throw new Error(`Lead ${leadId} not found`);
      if (
        lead.status === "replied" ||
        lead.status === "opted-out" ||
        lead.status === "responded"
      ) {
        console.log(`⏭ Skipping ${lead.email} — status: ${lead.status}`);
        return;
      }

      const step = campaign.steps.find((s) => s.order === stepIndex);
      if (!step) throw new Error(`Step ${stepIndex} not found`);

      const accessToken = await getValidAccessToken(account._id.toString());
      const transporter = nodemailer.createTransport({
        host: account.imapHost.replace("imap.", "smtp."),
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: account.email,
          accessToken,
        },
      });

      await transporter.sendMail({
        from: account.email,
        to: lead.email,
        subject: step.subject,
        text: step.body,
      });

      console.log(`✅ Sent step ${stepIndex} to ${lead.email}`);

      // Update lead status
      await Lead.findByIdAndUpdate(leadId, {
        $set: {
          status: "contacted",
          currentStep: stepIndex,
          lastContactedAt: new Date(),
        },
      });

      // Increment campaign sent stat
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { "stats.sent": 1 },
      });
    },
    {
      connection: redisConnection,
      concurrency: 5,
      stalledInterval: 60000, // check stalled jobs every 60s (default 30s)
      lockDuration: 60000, // lock jobs for 60s
      removeOnComplete: { count: 10 }, // keep only last 10 completed
      removeOnFail: { count: 20 }, // keep only last 20 failed
    },
  );

  worker.on("completed", (job) =>
    console.log(`✅ Campaign job ${job.id} completed`),
  );
  worker.on("failed", async (job, err) => {
    console.error(`❌ Campaign job ${job?.id} failed:`, err.message);
    if (job?.data?.leadId) {
      await Lead.findByIdAndUpdate(job.data.leadId, {
        $set: { status: "failed" },
      });
      await Campaign.findByIdAndUpdate(job.data.campaignId, {
        $inc: { "stats.failed": 1 },
      });
    }
  });

  console.log("📬 Campaign sender worker started!");
};
