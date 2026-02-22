import type { Request, Response } from "express";
import {
  autoReplyInterested,
  getDraftReply,
  sendSingleReply,
  bulkMarkLeads,
} from "../services/smartReply.service";

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
