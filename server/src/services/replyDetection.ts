import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";

export const checkAndMarkReply = async (fromEmail: string): Promise<void> => {
  try {
    const email = fromEmail.toLowerCase().trim();

    // Find campaign lead by email
    const lead = await Lead.findOne({ email });
    if (!lead) return;

    const campaign = await Campaign.findOne({
      _id: lead.campaignId,
      status: "active",
    });
    if (!campaign) return;

    const isFirstReply = lead.status !== "replied";

    await Lead.findByIdAndUpdate(lead._id, {
      $set: { status: "replied", repliedAt: new Date() },
    });

    if (isFirstReply) {
      await Campaign.findByIdAndUpdate(campaign._id, {
        $inc: { "stats.replied": 1 },
      });
    }

    console.log(
      `✉️ Lead ${email} replied in campaign "${campaign.name}" (first: ${isFirstReply})`,
    );
  } catch (err: any) {
    console.error("❌ Reply detection error:", err.message);
  }
};
