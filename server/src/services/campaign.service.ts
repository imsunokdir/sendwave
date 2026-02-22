import { Campaign } from "../models/campaign.model";
import type { ICampaign, ICampaignStep, ILead } from "../models/campaign.model";
import { Types } from "mongoose";

// ─── Create campaign ───────────────────────────────────────────────────────────
export const createCampaign = async (
  userId: string,
  data: {
    name: string;
    emailAccount: string;
    steps: ICampaignStep[];
    schedule?: Partial<ICampaign["schedule"]>;
  },
) => {
  const campaign = await Campaign.create({
    user: new Types.ObjectId(userId),
    emailAccount: new Types.ObjectId(data.emailAccount),
    name: data.name,
    steps: data.steps,
    schedule: data.schedule ?? {},
  });
  return campaign;
};

// ─── Get all campaigns for user ───────────────────────────────────────────────
export const getUserCampaigns = async (userId: string) => {
  return Campaign.find({ user: userId })
    .select("-leads") // don't return full lead list in list view
    .sort({ createdAt: -1 });
};

// ─── Get single campaign ──────────────────────────────────────────────────────
export const getCampaignById = async (campaignId: string, userId: string) => {
  return Campaign.findOne({ _id: campaignId, user: userId });
};

// ─── Update campaign ──────────────────────────────────────────────────────────
export const updateCampaign = async (
  campaignId: string,
  userId: string,
  updates: Partial<
    Pick<ICampaign, "name" | "steps" | "schedule" | "emailAccount">
  >,
) => {
  return Campaign.findOneAndUpdate(
    { _id: campaignId, user: userId },
    { $set: updates },
    { new: true },
  );
};

// ─── Delete campaign ──────────────────────────────────────────────────────────
export const deleteCampaign = async (campaignId: string, userId: string) => {
  return Campaign.findOneAndDelete({ _id: campaignId, user: userId });
};

// ─── Toggle status (launch / pause) ──────────────────────────────────────────
export const setCampaignStatus = async (
  campaignId: string,
  userId: string,
  status: ICampaign["status"],
) => {
  return Campaign.findOneAndUpdate(
    { _id: campaignId, user: userId },
    { $set: { status } },
    { new: true },
  );
};

// ─── Parse leads from raw text (paste or txt file) ───────────────────────────
export const parseLeadsFromText = (raw: string): ILead[] => {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = raw.match(emailRegex) ?? [];
  const unique = [...new Set(matches)];
  return unique.map((email) => ({ email, status: "pending", currentStep: 0 }));
};

// ─── Parse leads from CSV text ────────────────────────────────────────────────
export const parseLeadsFromCSV = (csvText: string): ILead[] => {
  const lines = csvText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

  // Try to find which column has emails by checking the first data row
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const emailColIndex = headers.findIndex((h) => h.includes("email"));

  const dataLines = emailColIndex >= 0 ? lines.slice(1) : lines;

  const emails: string[] = [];
  for (const line of dataLines) {
    if (emailColIndex >= 0) {
      const cols = line.split(",");
      const val = cols[emailColIndex]?.trim().replace(/"/g, "");
      if (val && emailRegex.test(val)) emails.push(val);
      emailRegex.lastIndex = 0;
    } else {
      // No header — extract any email found in the line
      const found = line.match(emailRegex);
      if (found) emails.push(...found);
    }
  }

  const unique = [...new Set(emails)];
  return unique.map((email) => ({ email, status: "pending", currentStep: 0 }));
};

// ─── Add leads to existing campaign ──────────────────────────────────────────
export const addLeadsToCampaign = async (
  campaignId: string,
  userId: string,
  newLeads: ILead[],
) => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  // Avoid duplicate emails
  const existing = new Set(campaign.leads.map((l) => l.email));
  const filtered = newLeads.filter((l) => !existing.has(l.email));

  campaign.leads.push(...filtered);
  campaign.stats.totalLeads = campaign.leads.length;
  await campaign.save();

  return { added: filtered.length, skipped: newLeads.length - filtered.length };
};
