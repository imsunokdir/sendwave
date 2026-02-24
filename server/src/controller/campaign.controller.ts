import type { Request, Response } from "express";
import {
  createCampaign,
  getUserCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  setCampaignStatus,
  addLeadsToCampaign,
  getCampaignLeads,
} from "../services/campaign.service";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { autoReplyByCategory } from "../services/smartReply.service";

export const createCampaignController = async (req: Request, res: Response) => {
  try {
    const { name, emailAccount, steps, schedule, categories } = req.body; // ← add categories
    if (!name || !emailAccount || !steps || !schedule) {
      return res.status(400).json({
        message: "name, emailAccount, steps and schedule are required",
      });
    }
    const campaign = await createCampaign(req.user!.id, {
      name,
      emailAccount,
      steps,
      schedule,
      categories: categories ?? [], // ← add this
    });
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignsController = async (req: Request, res: Response) => {
  try {
    const campaigns = await getUserCampaigns(req.user!.id);
    res.status(200).json(campaigns);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignController = async (req: Request, res: Response) => {
  try {
    const campaign = await getCampaignById(req.params.id, req.user!.id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCampaignController = async (req: Request, res: Response) => {
  try {
    const { name, steps, schedule } = req.body;
    const campaign = await updateCampaign(req.params.id, req.user!.id, {
      name,
      steps,
      schedule,
    });
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCampaignController = async (req: Request, res: Response) => {
  try {
    await deleteCampaign(req.params.id, req.user!.id);
    res.status(200).json({ message: "Campaign deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const setCampaignStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status } = req.body;
    const campaign = await setCampaignStatus(
      req.params.id,
      req.user!.id,
      status,
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadLeadsController = async (req: Request, res: Response) => {
  try {
    const { raw, csv } = req.body;
    if (!raw && !csv)
      return res.status(400).json({ message: "raw or csv text is required" });
    const result = await addLeadsToCampaign(
      req.params.id,
      raw || csv,
      csv ? "csv" : "raw",
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignLeadsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string | undefined;
    const result = await getCampaignLeads(req.params.id, page, limit, status);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategoriesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { categories } = req.body; // full array of ICampaignCategory

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { $set: { categories } },
      { new: true },
    );

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ categories: campaign.categories });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Manually trigger auto-reply for a specific category
export const triggerCategoryReplyController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { categoryName } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const category = campaign.categories.find((c) => c.name === categoryName);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Find all replied leads for this campaign
    const leads = await Lead.find({
      campaignId: campaign._id,
      status: "replied",
    });
    let sent = 0,
      failed = 0;

    for (const lead of leads) {
      try {
        await autoReplyByCategory(
          campaign._id.toString(),
          campaign.user.toString(),
          lead.email,
          category,
        );
        sent++;
      } catch {
        failed++;
      }
    }

    res.status(200).json({ message: "Done", sent, failed });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
