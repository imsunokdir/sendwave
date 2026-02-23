import type { Request, Response } from "express";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { client } from "../config/algoliaClient";

export const getLeadThreadController = async (req: Request, res: Response) => {
  console.log("hey");
  try {
    const { id } = req.params;
    const { leadEmail } = req.query;

    if (!leadEmail)
      return res.status(400).json({ message: "leadEmail is required" });

    const campaign = await Campaign.findOne({ _id: id, user: req.user!.id });
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    const account = await EmailAccount.findById(campaign.emailAccount);
    if (!account)
      return res.status(404).json({ message: "Email account not found" });

    const lead = await Lead.findOne({
      campaignId: id,
      email: leadEmail,
    }).lean();
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const sentStep =
      lead.status !== "pending"
        ? campaign.steps.find((s) => s.order === lead.currentStep)
        : null;

    let replies: any[] = [];
    try {
      const results = await client.searchSingleIndex({
        indexName: "emails",
        searchParams: {
          query: "",
          filters: `accountId:"${account._id.toString()}" AND folder:"INBOX" AND from:"${leadEmail}"`,
          hitsPerPage: 20,
          attributesToRetrieve: [
            "text",
            "subject",
            "category",
            "date",
            "snippet",
          ],
        },
      });

      replies = (results.hits as any[])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((hit) => ({
          subject: hit.subject,
          text: hit.text,
          snippet: hit.snippet,
          category: hit.category,
          date: hit.date,
        }));
    } catch (err: any) {
      console.error("Algolia search error:", err.message);
    }

    res.status(200).json({
      lead: {
        email: lead.email,
        status: lead.status,
        currentStep: lead.currentStep,
        lastContactedAt: lead.lastContactedAt,
        repliedAt: lead.repliedAt,
      },
      sentEmail: sentStep
        ? {
            subject: sentStep.subject,
            body: sentStep.body,
            sentAt: lead.lastContactedAt,
          }
        : null,
      replies,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
