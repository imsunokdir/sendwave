import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import redisConnection from "../config/redis";
import { Campaign } from "../models/campaign.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { decrypt } from "../utility/encryptionUtility";

export const startCampaignWorker = () => {
  const worker = new Worker(
    "campaign-sender",
    async (job: Job) => {
      const { campaignId, leadEmail, stepIndex } = job.data;
      console.log(
        `📤 Sending step ${stepIndex} to ${leadEmail} for campaign ${campaignId}`,
      );

      // ── Fetch campaign ──────────────────────────────────────────────────────
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.status !== "active") {
        console.log(`⏸ Campaign ${campaignId} is not active, skipping`);
        return;
      }

      // ── Fetch the sending email account ─────────────────────────────────────
      const account = await EmailAccount.findById(campaign.emailAccount);
      if (!account)
        throw new Error(`Email account not found for campaign ${campaignId}`);

      // ── Find the lead ───────────────────────────────────────────────────────
      const lead = campaign.leads.find((l) => l.email === leadEmail);
      if (!lead) throw new Error(`Lead ${leadEmail} not found`);
      if (lead.status === "replied" || lead.status === "opted-out") {
        console.log(`⏭ Skipping ${leadEmail} — status: ${lead.status}`);
        return;
      }

      // ── Get the step ────────────────────────────────────────────────────────
      const step = campaign.steps.find((s) => s.order === stepIndex);
      if (!step) throw new Error(`Step ${stepIndex} not found`);

      // ── Send email via SMTP ─────────────────────────────────────────────────
      const password = decrypt(account.passwordEnc);

      const transporter = nodemailer.createTransport({
        host: account.imapHost.replace("imap.", "smtp."), // derive SMTP from IMAP host
        port: 465,
        secure: true,
        auth: {
          user: account.email,
          pass: password,
        },
      });

      await transporter.sendMail({
        from: account.email,
        to: leadEmail,
        subject: step.subject,
        text: step.body,
      });

      console.log(`✅ Sent step ${stepIndex} to ${leadEmail}`);

      // ── Update lead status ──────────────────────────────────────────────────
      await Campaign.updateOne(
        { _id: campaignId, "leads.email": leadEmail },
        {
          $set: {
            "leads.$.status": "contacted",
            "leads.$.currentStep": stepIndex,
            "leads.$.lastContactedAt": new Date(),
          },
          $inc: { "stats.sent": 1 },
        },
      );
    },
    { connection: redisConnection },
  );

  worker.on("completed", (job) =>
    console.log(`✅ Campaign job ${job.id} completed`),
  );
  worker.on("failed", async (job, err) => {
    console.error(`❌ Campaign job ${job?.id} failed:`, err.message);

    if (job?.data) {
      const { campaignId, leadEmail } = job.data;
      await Campaign.updateOne(
        { _id: campaignId, "leads.email": leadEmail },
        { $set: { "leads.$.status": "failed" }, $inc: { "stats.failed": 1 } },
      );
    }
  });

  console.log("📬 Campaign sender worker started!");
};
