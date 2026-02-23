import type { Request, Response } from "express";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";

export const getCampaignStatsController = async (
  req: Request,
  res: Response,
) => {
  try {
    // Get all campaigns for this user
    const campaigns = await Campaign.find({ user: req.user!.id })
      .select("_id")
      .lean();
    const campaignIds = campaigns.map((c) => c._id);

    // Aggregate lead counts by status across all campaigns
    const statusCounts = await Lead.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {
      pending: 0,
      contacted: 0,
      replied: 0,
      responded: 0,
      "opted-out": 0,
      failed: 0,
    };

    for (const { _id, count } of statusCounts) {
      byStatus[_id] = count;
    }

    res.status(200).json({ byStatus });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
