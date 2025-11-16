import { Request, Response } from "express";
import {
  elasticClient,
  getAllEmails,
  getEmailById,
  searchEmails,
} from "../services/elasticSearch";
import { recategorizePendingEmails } from "../ai/reCategorizejob";
import { generateSuggestedReplies } from "../ai/geminiSuggestedReplies";
import { EmailType } from "../types/EmailTypes";
import nodemailer from "nodemailer";
import { generateRAGReplies } from "../ai/ragReplies";

type EmailsResponse = {
  emails: EmailType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const searchEmailsC = async (req: Request, res: Response) => {
  const { q, account, folder, page, limit } = req.query as {
    q: string;
    account?: string;
    folder?: string;
    page?: string;
    limit?: string;
  };

  try {
    const results = await searchEmails(
      q,
      account,
      folder,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
};

// export const getAllEmailsController = async (req: Request, res: Response) => {
//   const { account, folder, page, limit } = req.query as {
//     account?: string;
//     folder?: string;
//     page?: string;
//     limit?: string;
//   };

//   try {
//     const results = await getAllEmails(
//       account,
//       folder,
//       page ? parseInt(page) : 1,
//       limit ? parseInt(limit) : 10
//     );

//     // console.log("res all emails:", results);

//     res.json({ results });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch emails" });
//   }
// };

// export const getAllEmailsController = async (req: Request, res: Response) => {
//   const { account, folder, page, limit, query } = req.query as {
//     account?: string;
//     folder?: string;
//     page?: string;
//     limit?: string;
//     query?: string;
//   };
//   console.log("query:", query);
//   try {
//     let results;

//     if (query?.trim()) {
//       // If search query exists, use searchEmails
//       results = await searchEmails(
//         query,
//         account,
//         folder,
//         page ? parseInt(page) : 1,
//         limit ? parseInt(limit) : 10
//       );
//     } else {
//       // Otherwise fetch all emails normally
//       results = await getAllEmails(
//         account,
//         folder,
//         page ? parseInt(page) : 1,
//         limit ? parseInt(limit) : 10
//       );
//     }

//     console.log("Resits:", { results });

//     res.json({ results });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch emails" });
//   }
// };

export const getAllEmailsController = async (req: Request, res: Response) => {
  const { account, folder, page, limit, query, category } = req.query as {
    account?: string;
    folder?: string;
    page?: string;
    limit?: string;
    query?: string;
    category?: string;
  };

  try {
    let results;

    if (query?.trim()) {
      // If search query exists, use searchEmails
      results = await searchEmails(
        query,
        account,
        folder,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        category
      );
    } else {
      // Otherwise fetch all emails normally
      results = await getAllEmails(
        account,
        folder,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        category
      );
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Failed to fetch emails:", error.message);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

export const getEmailByIdController = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const email = await getEmailById(id);

    if (!email) {
      return res.status(404).json({ error: "Email not foundd" });
    }

    res.json({ email });
  } catch (error) {
    console.error("Failed to fetch email by ID:", error);
    res.status(500).json({ error: "Failed to fetch email" });
  }
};

export const reCatgorizeEmails = async (req: Request, res: Response) => {
  recategorizePendingEmails();
  res.json({
    message: "Re-categorization job started manually",
    note: "Check server logs for progress",
  });
};

export const getSuggestedRepliesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { emailId } = req.body;

    const result = await getEmailById(emailId);

    if (!result || !result.email) {
      return res.status(404).json({
        error: "Email not found",
        message: `No email found with id: ${emailId}`,
      });
    }

    const email = result.email as EmailType;

    const suggestedReplies = await generateRAGReplies(email);

    res.json({
      emailId: email.id,
      subject: email.subject,
      from: email.from,
      suggestedReplies,
      method: "RAG",
    });
  } catch (error: any) {
    console.error("Error generating suggested replies:", error);
    res.status(500).json({
      error: "Failed to generate suggested replies",
      message: error.message,
    });
  }
};

// export const sendEmail = async (req: Request, res: Response) => {
//   const { to, subject, text, html, from } = req.body;

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from,
//       to,
//       subject,
//       text,
//       html,
//     });

//     res.json({ success: true });
//   } catch (err: any) {
//     console.error("Error sending email:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// server/src/controllers/emailAccountsController.ts

// export const getAllEmailAccounts = async (req: Request, res: Response) => {
//   try {
//     const result = await elasticClient.search({
//       index: "emails",
//       size: 0, // we don’t need actual documents
//       aggs: {
//         accounts: {
//           terms: { field: "account.keyword", size: 100 }, // use .keyword for exact match
//         },
//       },
//     });

//     console.log("acc res:", result);

//     const accounts = (
//       (result.aggregations as any)?.accounts?.buckets || []
//     ).map((b: any) => b.key);

//     res.json({ accounts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch accounts" });
//   }
// };

// export const getAllEmailAccounts = async (req: Request, res: Response) => {
//   res.json({ message: "hey from server" });
// };
