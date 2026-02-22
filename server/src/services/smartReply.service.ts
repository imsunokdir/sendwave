import { client } from "../config/algoliaClient";
import { Campaign } from "../models/campaign.model";
import { EmailAccount } from "../models/emailAccounts.model";
import { searchCampaignContext } from "./campaignContext";
import { decrypt } from "../utility/encryptionUtility";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Fetch lead's latest reply from Algolia ────────────────────────────────────
export const getLeadReplyFromAlgolia = async (
  fromEmail: string,
  accountId: string,
): Promise<{ text: string; subject: string; category: string } | null> => {
  try {
    const results = await client.searchSingleIndex({
      indexName: "emails",
      searchParams: {
        query: "",
        filters: `from:"${fromEmail}" AND accountId:"${accountId}" AND folder:"INBOX"`,
        hitsPerPage: 1,
        attributesToRetrieve: ["text", "subject", "category", "date"],
      },
    });

    const hit = results.hits[0] as any;
    if (!hit) return null;

    return {
      text: hit.text || "",
      subject: hit.subject || "",
      category: hit.category || "Uncategorized",
    };
  } catch (err: any) {
    console.error(`Failed to fetch reply for ${fromEmail}:`, err.message);
    return null;
  }
};

// ── Generate AI reply using campaign context ───────────────────────────────────
export const generateCampaignReply = async (
  campaignId: string,
  emailText: string,
): Promise<string | null> => {
  try {
    const context = await searchCampaignContext(campaignId, emailText);

    const prompt = `You are an email assistant helping with outreach campaigns. Use the context below to write a short, professional reply to the email.

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
  } catch (err: any) {
    console.error("Failed to generate reply:", err.message);
    return null;
  }
};

// ── Send reply via SMTP ────────────────────────────────────────────────────────
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

  const repliedLeads = campaign.leads.filter((l) => l.status === "replied");

  let sent = 0;
  let failed = 0;

  for (const lead of repliedLeads) {
    try {
      // Get their reply from Algolia
      const reply = await getLeadReplyFromAlgolia(
        lead.email,
        account._id.toString(),
      );
      if (!reply) {
        failed++;
        continue;
      }

      // Only auto-reply to Interested
      if (reply.category !== "Interested") continue;

      // Generate AI reply
      const aiReply = await generateCampaignReply(campaignId, reply.text);
      if (!aiReply) {
        failed++;
        continue;
      }

      // Send it
      await sendReplyEmail(account, lead.email, reply.subject, aiReply);

      // Mark lead as opted-out of further sequence (they replied, we replied back)
      await Campaign.updateOne(
        { _id: campaignId, "leads.email": lead.email },
        { $set: { "leads.$.status": "opted-out" } },
      );

      sent++;
    } catch (err: any) {
      console.error(`Failed to auto-reply to ${lead.email}:`, err.message);
      failed++;
    }
  }

  return { sent, failed };
};

// ── Get AI draft for a single lead (for one-by-one review) ────────────────────
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

// ── Send a single reply (after review) ────────────────────────────────────────
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

  await Campaign.updateOne(
    { _id: campaignId, "leads.email": leadEmail },
    { $set: { "leads.$.status": "opted-out" } },
  );
};

// ── Bulk mark leads ───────────────────────────────────────────────────────────
export const bulkMarkLeads = async (
  campaignId: string,
  userId: string,
  category: string,
  newStatus: "opted-out" | "contacted",
): Promise<{ updated: number }> => {
  const campaign = await Campaign.findOne({ _id: campaignId, user: userId });
  if (!campaign) throw new Error("Campaign not found");

  const account = await EmailAccount.findById(campaign.emailAccount);
  if (!account) throw new Error("Email account not found");

  const repliedLeads = campaign.leads.filter((l) => l.status === "replied");
  let updated = 0;

  for (const lead of repliedLeads) {
    const reply = await getLeadReplyFromAlgolia(
      lead.email,
      account._id.toString(),
    );
    if (!reply || reply.category !== category) continue;

    await Campaign.updateOne(
      { _id: campaignId, "leads.email": lead.email },
      { $set: { "leads.$.status": newStatus } },
    );
    updated++;
  }

  return { updated };
};
