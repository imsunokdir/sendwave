import cron from "node-cron";
import { Queue } from "bullmq";
import redisConnection from "../config/redis";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";

const campaignQueue = new Queue("campaign-sender", {
  connection: redisConnection,
});

export const startCampaignCron = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const currentHour = istTime.getUTCHours();
      const currentMinute = istTime.getUTCMinutes();
      const currentDay = istTime.getUTCDay();

      const campaigns = await Campaign.find({ status: "active" });

      for (const campaign of campaigns) {
        const { sendHour, sendMinute = 0, sendDays } = campaign.schedule;

        if (!sendDays.includes(currentDay)) continue;
        if (currentHour !== sendHour) continue;
        if (Math.abs(currentMinute - sendMinute) > 7) continue;

        // Process leads in batches of 100
        let page = 0;
        const batchSize = 100;

        while (true) {
          const leads = await Lead.find({
            campaignId: campaign._id,
            status: { $in: ["pending", "contacted"] },
          })
            .skip(page * batchSize)
            .limit(batchSize)
            .lean();

          if (leads.length === 0) break;

          for (const lead of leads) {
            // Skip if already contacted today (IST)
            if (lead.lastContactedAt) {
              const lastContactIST = new Date(
                new Date(lead.lastContactedAt).getTime() + istOffset,
              );
              const todayIST = new Date(istTime);
              if (
                lastContactIST.getUTCFullYear() === todayIST.getUTCFullYear() &&
                lastContactIST.getUTCMonth() === todayIST.getUTCMonth() &&
                lastContactIST.getUTCDate() === todayIST.getUTCDate()
              )
                continue;
            }

            // Determine which step to send
            const nextStep =
              lead.status === "pending"
                ? campaign.steps.find((s) => s.order === 0)
                : campaign.steps.find((s) => s.order === lead.currentStep + 1);

            if (!nextStep) continue;

            // Check delay for follow-up steps
            if (nextStep.order > 0 && lead.lastContactedAt) {
              const daysSince = Math.floor(
                (now.getTime() - new Date(lead.lastContactedAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              if (daysSince < nextStep.delayDays) continue;
            }

            await campaignQueue.add("send-email", {
              campaignId: campaign._id.toString(),
              leadId: lead._id.toString(),
              stepIndex: nextStep.order,
            });
          }

          if (leads.length < batchSize) break;
          page++;
        }

        console.log(`📅 Queued emails for campaign "${campaign.name}"`);
      }
    } catch (err: any) {
      console.error("❌ Campaign cron error:", err.message);
    }
  });

  console.log("⏰ Campaign cron started!");
};
