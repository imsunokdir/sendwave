import type { Request, Response } from "express";
import {
  autoReplyInterested,
  getDraftReply,
  sendSingleReply,
  bulkMarkLeads,
  autoReplyByCategory,
} from "../services/smartReply.service";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";

// ── Auto reply to all Interested leads ────────────────────────────────────────
export const autoReplyInterestedController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await autoReplyInterested(req.params.id, req.user!.id);
    res.status(200).json({ message: "Auto-reply complete", ...result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get AI draft for a single lead ────────────────────────────────────────────
export const getDraftReplyController = async (req: Request, res: Response) => {
  try {
    const { leadEmail } = req.query;
    if (!leadEmail)
      return res.status(400).json({ message: "leadEmail is required" });

    const result = await getDraftReply(
      req.params.id,
      req.user!.id,
      leadEmail as string,
    );
    if (!result)
      return res.status(404).json({ message: "Could not generate draft" });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Manual trigger — "Send now" button
// export const autoReplyByRulesController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const { category } = req.query; // optional ?category=Interested
//     const result = await autoReplyByCategory(
//       req.params.id,
//       req.user!.id,
//       category as string | undefined,
//     );
//     res.status(200).json({ message: "Auto-reply complete", ...result });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };

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

// Toggle auto-reply rule for a category
// export const updateReplyRulesController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const { category, enabled } = req.body;

//     const validCategories = [
//       "Interested",
//       "Meeting Booked",
//       "Not Interested",
//       "Out of Office",
//       "Spam",
//     ];

//     if (!validCategories.includes(category))
//       return res.status(400).json({ message: "Invalid category" });

//     const campaign = await Campaign.findOneAndUpdate(
//       { _id: req.params.id, user: req.user!.id },
//       { $set: { [`replyRules.${category}`]: enabled } },
//       { new: true },
//     );

//     if (!campaign)
//       return res.status(404).json({ message: "Campaign not found" });

//     res.status(200).json({
//       message: "Reply rules updated",
//       replyRules: campaign.replyRules,
//     });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const updateCategoriesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { categories } = req.body;

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

// ── Send a single reviewed reply ──────────────────────────────────────────────
export const sendSingleReplyController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { leadEmail, subject, body } = req.body;
    if (!leadEmail || !subject || !body) {
      return res
        .status(400)
        .json({ message: "leadEmail, subject and body are required" });
    }
    await sendSingleReply(
      req.params.id,
      req.user!.id,
      leadEmail,
      subject,
      body,
    );
    res.status(200).json({ message: "Reply sent" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── Bulk mark leads by category ───────────────────────────────────────────────
export const bulkMarkLeadsController = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.body;
    if (!category || !status) {
      return res
        .status(400)
        .json({ message: "category and status are required" });
    }
    const result = await bulkMarkLeads(
      req.params.id,
      req.user!.id,
      category,
      status,
    );
    res.status(200).json({ message: "Leads updated", ...result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
