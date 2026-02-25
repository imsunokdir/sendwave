import type { Request, Response } from "express";
import {
  saveCampaignContext,
  getCampaignContext,
  deleteCampaignContext,
} from "../services/campaignContext";
import {
  deleteOutreachContext,
  saveOutreachContext,
} from "../services/pineOutreachContext";
import { CampaignContext } from "../models/campaignContext.model";

export const saveCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { text } = req.body;
    const campaignId = req.params.id;
    if (!text) return res.status(400).json({ message: "text is required" });

    // Save to Pinecone → get id back
    const pineconeId = await saveOutreachContext(text, campaignId);

    // Save to MongoDB for display
    const ctx = await CampaignContext.create({ campaignId, text, pineconeId });

    res.status(201).json({ message: "Context saved", id: ctx._id });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    const items = await CampaignContext.find({
      campaignId: req.params.id,
    }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCampaignContextController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { contextId } = req.params;

    // Find in MongoDB to get pineconeId
    const ctx = await CampaignContext.findById(contextId);
    if (!ctx) return res.status(404).json({ message: "Context not found" });

    // Delete from Pinecone
    await deleteOutreachContext(ctx.pineconeId);

    // Delete from MongoDB
    await CampaignContext.findByIdAndDelete(contextId);

    res.status(200).json({ message: "Context deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
