import type { Request, Response } from "express";
import { Campaign } from "../models/campaign.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { client } from "../config/algoliaClient";

export const getLeadThreadController = async (req: Request, res: Response) => {
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

    const lead = campaign.leads.find((l) => l.email === leadEmail);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Get the step that was last sent to this lead
    const sentStepIndex = lead.status === "pending" ? null : lead.currentStep;
    const sentStep =
      sentStepIndex !== null
        ? campaign.steps.find((s) => s.order === sentStepIndex)
        : null;

    // Fetch ALL replies from this lead — sorted by date ascending
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
            "from",
          ],
        },
      });

      // Sort by date ascending so conversation flows naturally
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
      replies, // array of all replies, sorted oldest first
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
