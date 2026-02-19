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
import { generateRAGRepliesGemini } from "../ai/ragReplies";
import { ai } from "src/ai/gemini";
import { generateRAGRepliesOllama } from "../ai/ollamaSuggestedReplies";
import { EmailAccount } from "../models/emailAccounts.model";
import { client } from "../config/algoliaClient";
import { batchCategorizeEmails } from "../ai/batchCatgegorize";

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
      limit ? parseInt(limit) : 10,
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
        category,
      );
    } else {
      // Otherwise fetch all emails normally
      results = await getAllEmails(
        account,
        folder,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10,
        category,
      );
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Failed to fetch emails:", error.message);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

// export const getEmailsAlgolia = async (req: Request, res: Response) => {
//   try {
//     const userEmail = req.user?.email;
//     if (!userEmail) return res.status(401).json({ message: "Unauthorized" });

//     const folder = req.params.folder;
//     const hitsPerPage = Number(req.query.limit) || 50;

//     const result = await client.search({
//       requests: [
//         {
//           indexName: "emails",
//           query: "", // empty = fetch all emails
//           filters: `email:"${userEmail}" AND folder:"${folder}"`,
//           hitsPerPage,
//         },
//       ],
//     });

//     res.json({ success: true, result });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getEmailsAlgolia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const folder = req.params.folder; // required
    const hitsPerPage = Number(req.query.limit) || 50;

    // Optional: array of email accounts to filter
    const selectedEmails = req.query.emails
      ? (req.query.emails as string).split(",").map((e) => e.trim())
      : [];

    // Build filters
    let filters = `user:"${userId}" AND folder:"${folder}"`;

    if (selectedEmails.length > 0) {
      // If specific email accounts selected, filter by them
      const emailFilters = selectedEmails
        .map((e) => `email:"${e}"`)
        .join(" OR ");
      filters += ` AND (${emailFilters})`;
    }

    const result = await client.search({
      requests: [
        {
          indexName: "emails",
          query: "", // empty = fetch all matching emails
          // filters,
          hitsPerPage,
        },
      ],
    });

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchEmailAlgolia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const q = (req.params.query || "").trim(); // free text search
    const folder = req.query.folder as string; // optional folder
    const selectedEmails = req.query.emails
      ? (req.query.emails as string).split(",").map((e) => e.trim())
      : [];
    const hitsPerPage = Number(req.query.limit) || 50;

    // Base filter: current user
    let filters = `user:"${userId}"`;

    if (folder) filters += ` AND folder:"${folder}"`;

    if (selectedEmails.length > 0) {
      const emailFilters = selectedEmails
        .map((e) => `email:"${e}"`)
        .join(" OR ");
      filters += ` AND (${emailFilters})`;
    }

    // Algolia search
    const result = await client.search({
      requests: [
        {
          indexName: "emails",
          query: q, // empty = return all emails
          filters,
          hitsPerPage,
        },
      ],
    });

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
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
  res: Response,
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

    const suggestedReplies = await generateRAGRepliesOllama(email);

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

export const getUserEmailAccounts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // only return _id and email
    const accounts = await EmailAccount.find({ user: userId }).select(
      "_id email",
    );

    return res.json({ accounts });
  } catch (err: any) {
    console.error("Error fetching user email accounts:", err.message);
    return res.status(500).json({ message: "Server error" });
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

export const fetchAndCategorizeEmails = async () => {
  let page = 0;
  const hitsPerPage = 100;
  let hasMore = true;

  while (hasMore) {
    const { hits, nbPages } = await client.searchSingleIndex({
      indexName: "emails",
      searchParams: {
        query: "",
        filters: "category:Uncategorized",
        hitsPerPage,
        page,
      },
    });

    if (hits.length === 0 || page >= (nbPages ?? 1) - 1) {
      hasMore = false;
    }

    const emails = hits.map((hit: any) => ({
      id: hit.objectID,
      text: `Subject: ${hit.subject}\nFrom: ${hit.from}\n\n${hit.text}`,
    }));

    console.log(`Processing page ${page + 1} of ${nbPages}...`);
    await batchCategorizeEmails(emails);

    page++;

    // Breathing room between pages
    if (hasMore) await new Promise((res) => setTimeout(res, 1000));
  }

  console.log("Fetching and categorization complete!");
};
