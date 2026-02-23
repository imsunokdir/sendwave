import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import type { ICampaign } from "../models/campaign.model";

// ── Create ────────────────────────────────────────────────────────────────────
export const createCampaign = async (
  userId: string,
  data: {
    name: string;
    emailAccount: string;
    steps: ICampaign["steps"];
    schedule: ICampaign["schedule"];
  },
) => {
  return Campaign.create({ user: userId, ...data });
};

// ── Get all ───────────────────────────────────────────────────────────────────
export const getUserCampaigns = async (userId: string) => {
  return Campaign.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

// ── Get one ───────────────────────────────────────────────────────────────────
export const getCampaignById = async (id: string, userId: string) => {
  return Campaign.findOne({ _id: id, user: userId }).lean();
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updateCampaign = async (
  id: string,
  userId: string,
  data: Partial<Pick<ICampaign, "name" | "steps" | "schedule">>,
) => {
  return Campaign.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: data },
    { new: true },
  ).lean();
};

// ── Delete ────────────────────────────────────────────────────────────────────
export const deleteCampaign = async (id: string, userId: string) => {
  const campaign = await Campaign.findOneAndDelete({ _id: id, user: userId });
  if (campaign) await Lead.deleteMany({ campaignId: id });
};

// ── Set status ────────────────────────────────────────────────────────────────
export const setCampaignStatus = async (
  id: string,
  userId: string,
  status: ICampaign["status"],
) => {
  return Campaign.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { status } },
    { new: true },
  ).lean();
};

// ── Add leads ─────────────────────────────────────────────────────────────────
export const addLeadsToCampaign = async (
  campaignId: string,
  rawText: string,
  type: "raw" | "csv" = "raw",
): Promise<{ added: number; skipped: number }> => {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = rawText.match(emailRegex) ?? [];
  const emails = [...new Set(matches.map((e) => e.toLowerCase().trim()))];

  let added = 0;
  let skipped = 0;

  for (const email of emails) {
    try {
      await Lead.create({ campaignId, email });
      added++;
    } catch (err: any) {
      if (err.code === 11000)
        skipped++; // duplicate
      else throw err;
    }
  }

  if (added > 0) {
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { "stats.totalLeads": added },
    });
  }

  return { added, skipped };
};

// ── Get leads with pagination ─────────────────────────────────────────────────
export const getCampaignLeads = async (
  campaignId: string,
  page: number = 1,
  limit: number = 50,
  status?: string,
) => {
  const filter: any = { campaignId };
  if (status && status !== "all") filter.status = status;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};
