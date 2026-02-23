import { client } from "../config/algoliaClient";
import { Campaign } from "../models/campaign.model";
import { Lead } from "../models/lead.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { searchCampaignContext } from "./campaignContext";
import { decrypt } from "../utility/encryptionUtility";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Fetch lead reply from Algolia ─────────────────────────────────────────────
export const getLeadReplyFromAlgolia = async (
  fromEmail: string,
  accountId: string,
): Promise<{ text: string; subject: string; category: string } | null> => {
  try {
    const results = await client.searchSingleIndex({
      indexName: "emails",
      searchParams: {
        query: "",
        filters: `accountId:"${accountId}" AND folder:"INBOX" AND from:"${fromEmail}"`,
        hitsPerPage: 1,
        attributesToRetrieve: ["text", "subject", "category"],
      },
    });
    const hit = results.hits[0] as any;
    if (!hit) return null;
    return {
      text: hit.text || "",
      subject: hit.subject || "",
      category: hit.category || "Uncategorized",
    };
  } catch {
    return null;
  }
};

// ── Generate AI reply ─────────────────────────────────────────────────────────
export const generateCampaignReply = async (
  campaignId: string,
  emailText: string,
): Promise<string | null> => {
  try {
    const context = await searchCampaignContext(campaignId, emailText);
    const prompt = `You are an email assistant helping with outreach campaigns. Use the context below to write a short, professional reply.

${context ? `Context:\n${context}\n` : ""}
Email received:
${emailText}

Write a concise, friendly reply (2-4 sentences max):`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });
    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};

// ── Send reply via SMTP ───────────────────────────────────────────────────────
export const sendReplyEmail = async (
  account: any,
  toEmail: string,
  subject: string,
  body: string,
): Promise<void> => {
  const password = decrypt(account.passwordEnc);
  const transporter = nodemailer.createTransport({
    host: account.imapHost.replace("imap.", "smtp."),
    port: 465,
    secure: true,
    auth: { user: account.email, pass: password },
  });
  await transporter.sendMail({
    from: account.email,
    to: toEmail,
    subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
    text: body,
  });
};

// ── Auto reply to all Interested leads ────────────────────────────────────────
export const autoReplyInterested = async (
  campaignId: string,
  userId: string,
): Promise<{ sent: number; failed: number }> => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  const account = await EmailAccount.findById(campaign.emailAccount);
  if (!account) throw new Error("Email account not found");

  const repliedLeads = await Lead.find({ campaignId, status: "replied" });
  let sent = 0,
    failed = 0;

  for (const lead of repliedLeads) {
    try {
      const reply = await getLeadReplyFromAlgolia(
        lead.email,
        account._id.toString(),
      );
      if (!reply || reply.category !== "Interested") continue;

      const aiReply = await generateCampaignReply(campaignId, reply.text);
      if (!aiReply) {
        failed++;
        continue;
      }

      await sendReplyEmail(account, lead.email, reply.subject, aiReply);
      await Lead.findByIdAndUpdate(lead._id, { $set: { status: "responded" } });
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
};

// ── Get AI draft for single lead ──────────────────────────────────────────────
export const getDraftReply = async (
  campaignId: string,
  userId: string,
  leadEmail: string,
): Promise<{ draft: string; subject: string; category: string } | null> => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  const account = await EmailAccount.findById(campaign.emailAccount);
  if (!account) throw new Error("Email account not found");

  const reply = await getLeadReplyFromAlgolia(
    leadEmail,
    account._id.toString(),
  );
  if (!reply) return null;

  const draft = await generateCampaignReply(campaignId, reply.text);
  if (!draft) return null;

  return { draft, subject: reply.subject, category: reply.category };
};

// ── Send single reviewed reply ────────────────────────────────────────────────
export const sendSingleReply = async (
  campaignId: string,
  userId: string,
  leadEmail: string,
  subject: string,
  body: string,
): Promise<void> => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  const account = await EmailAccount.findById(campaign.emailAccount);
  if (!account) throw new Error("Email account not found");

  await sendReplyEmail(account, leadEmail, subject, body);

  await Lead.findOneAndUpdate(
    { campaignId, email: leadEmail },
    { $set: { status: "responded" } },
  );
};

// ── Bulk mark leads by category ───────────────────────────────────────────────
export const bulkMarkLeads = async (
  campaignId: string,
  userId: string,
  category: string,
  newStatus: "opted-out" | "contacted" | "responded",
): Promise<{ updated: number }> => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  const account = await EmailAccount.findById(campaign.emailAccount);
  if (!account) throw new Error("Email account not found");

  const repliedLeads = await Lead.find({ campaignId, status: "replied" });
  let updated = 0;

  for (const lead of repliedLeads) {
    const reply = await getLeadReplyFromAlgolia(
      lead.email,
      account._id.toString(),
    );
    if (!reply || reply.category !== category) continue;
    await Lead.findByIdAndUpdate(lead._id, { $set: { status: newStatus } });
    updated++;
  }

  return { updated };
};
