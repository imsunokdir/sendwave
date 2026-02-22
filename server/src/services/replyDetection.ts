import { Campaign } from "../models/campaign.model";

export const checkAndMarkReply = async (fromEmail: string): Promise<void> => {
  try {
    const email = fromEmail.toLowerCase().trim();

    const campaign = await Campaign.findOne({
      status: "active",
      "leads.email": email,
    });

    if (!campaign) return;

    const lead = campaign.leads.find((l) => l.email === email);
    if (!lead) return;

    // Always update repliedAt so we track the latest reply time
    // Only increment stats.replied if this is the first reply
    const isFirstReply = lead.status !== "replied";

    await Campaign.updateOne(
      { _id: campaign._id, "leads.email": email },
      {
        $set: {
          "leads.$.status": "replied",
          "leads.$.repliedAt": new Date(),
        },
        ...(isFirstReply ? { $inc: { "stats.replied": 1 } } : {}),
      },
    );

    console.log(
      `✉️ Lead ${email} replied in campaign "${campaign.name}" (first reply: ${isFirstReply})`,
    );
  } catch (err: any) {
    console.error("❌ Reply detection error:", err.message);
  }
};
