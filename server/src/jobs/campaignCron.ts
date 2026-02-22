import cron from "node-cron";
import { Campaign } from "../models/campaign.model";
import { campaignQueue } from "../queues/campaignQueue";

export const startCampaignCron = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    console.log(
      "📅 Campaign cron triggered: checking leads due for sending...",
    );

    try {
      const now = new Date();

      // Convert to IST
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);

      const currentHour = istTime.getUTCHours();
      const currentMinute = istTime.getUTCMinutes();
      const currentDay = istTime.getUTCDay();

      const campaigns = await Campaign.find({ status: "active" });
      console.log(`Found ${campaigns.length} active campaigns`);

      for (const campaign of campaigns) {
        const { sendHour, sendDays, sendMinute = 0 } = campaign.schedule;

        // Day check
        if (!sendDays.includes(currentDay)) continue;

        // Hour check
        if (currentHour !== sendHour) continue;

        // Minute window (±1 min tolerance)
        if (Math.abs(currentMinute - sendMinute) > 1) continue;

        for (const lead of campaign.leads) {
          if (["replied", "opted-out", "failed"].includes(lead.status))
            continue;

          const nextStepIndex =
            lead.currentStep === 0 && lead.status === "pending"
              ? 0
              : lead.currentStep + 1;

          const nextStep = campaign.steps.find(
            (s) => s.order === nextStepIndex,
          );
          if (!nextStep) continue;

          if (lead.lastContactedAt) {
            const daysSinceContact = Math.floor(
              (now.getTime() - new Date(lead.lastContactedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            if (daysSinceContact < nextStep.delayDays) continue;
          }

          if (lead.lastContactedAt) {
            const lastContact = new Date(lead.lastContactedAt);
            if (lastContact.toDateString() === istTime.toDateString()) continue;
          }

          await campaignQueue.add(
            `send-${campaign._id}-${lead.email}-step${nextStepIndex}`,
            {
              campaignId: campaign._id.toString(),
              leadEmail: lead.email,
              stepIndex: nextStepIndex,
            },
          );

          console.log(`📨 Queued step ${nextStepIndex} for ${lead.email}`);
        }
      }
    } catch (err) {
      console.error("❌ Campaign cron error:", err);
    }
  });

  console.log("📅 Campaign cron started! Runs every minute.");
};
