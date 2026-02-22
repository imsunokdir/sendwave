import type { Request, Response } from "express";
import {
  saveCampaignContext,
  getCampaignContext,
  deleteCampaignContext,
} from "../services/campaignContext";

export const saveCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });
    const id = await saveCampaignContext(req.params.id, text);
    res.status(201).json({ message: "Context saved", id });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    const context = await getCampaignContext(req.params.id);
    res.status(200).json(context);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    await deleteCampaignContext(req.params.contextId);
    res.status(200).json({ message: "Context deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
