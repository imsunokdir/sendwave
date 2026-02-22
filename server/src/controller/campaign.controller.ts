import type { Request, Response } from "express";
import {
  createCampaign,
  getUserCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  setCampaignStatus,
  addLeadsToCampaign,
  parseLeadsFromText,
  parseLeadsFromCSV,
} from "../services/campaign.service";

// ─── Create ───────────────────────────────────────────────────────────────────
export const createCampaignController = async (req: Request, res: Response) => {
  try {
    const { name, emailAccount, steps, schedule } = req.body;
    if (!name || !emailAccount || !steps?.length) {
      return res
        .status(400)
        .json({
          message: "name, emailAccount and at least one step are required",
        });
    }
    const campaign = await createCampaign(req.user!.id, {
      name,
      emailAccount,
      steps,
      schedule,
    });
    res.status(201).json({ campaign });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get all ──────────────────────────────────────────────────────────────────
export const getCampaignsController = async (req: Request, res: Response) => {
  try {
    const campaigns = await getUserCampaigns(req.user!.id);
    res.status(200).json({ campaigns });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get one ──────────────────────────────────────────────────────────────────
export const getCampaignController = async (req: Request, res: Response) => {
  try {
    const campaign = await getCampaignById(req.params.id, req.user!.id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json({ campaign });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateCampaignController = async (req: Request, res: Response) => {
  try {
    const { name, steps, schedule, emailAccount } = req.body;
    const campaign = await updateCampaign(req.params.id, req.user!.id, {
      name,
      steps,
      schedule,
      emailAccount,
    });
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json({ campaign });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
export const deleteCampaignController = async (req: Request, res: Response) => {
  try {
    await deleteCampaign(req.params.id, req.user!.id);
    res.status(200).json({ message: "Campaign deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Launch / Pause ───────────────────────────────────────────────────────────
export const setCampaignStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status } = req.body;
    if (!["active", "paused", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const campaign = await setCampaignStatus(
      req.params.id,
      req.user!.id,
      status,
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json({ campaign });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Upload leads ─────────────────────────────────────────────────────────────
export const uploadLeadsController = async (req: Request, res: Response) => {
  try {
    const { raw, csv } = req.body;

    if (!raw && !csv) {
      return res
        .status(400)
        .json({ message: "Provide raw text or csv content" });
    }

    const leads = csv ? parseLeadsFromCSV(csv) : parseLeadsFromText(raw);

    if (leads.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid email addresses found" });
    }

    const result = await addLeadsToCampaign(req.params.id, req.user!.id, leads);
    res.status(200).json({ message: "Leads added", ...result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
