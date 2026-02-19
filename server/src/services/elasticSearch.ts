import { Client } from "@elastic/elasticsearch";
import { simpleParser } from "mailparser";
import { categorizeEmail } from "../ai/ollamaAiCategorization";
import { sendInterestedNotifications } from "./notify";
import { EmailType } from "src/types/EmailTypes";
// import { categorizeEmail } from "../ai/groqAiCategorization";
// import { categorizeEmail } from "../ai/geminiCategorization";
import dotenv from "dotenv";

dotenv.config();

export const elasticClient = new Client({
  node: process.env.ELASTIC_URL,
});

// export const indexEmail = async (
//   user: string,
//   msg: any,
//   folder: string = "INBOX"
// ) => {
//   try {
//     const from = msg.envelope?.from?.[0]?.address || "Unknown Sender";
//     const subject = msg.envelope?.subject || "(No Subject)";
//     const snippet = msg.source?.toString().slice(0, 200) || "";
//     const emailBody = msg.source.toString();

//     const parsed = await simpleParser(msg.source);

//     // Default category if AI fails
//     let category = "Uncategorized";

//     try {
//       category = await categorizeEmail(parsed.text || "");
//       if (category === "Interested") {
//         await sendInterestedNotifications({
//           account: user,
//           from,
//           subject,
//           snippet,
//         });
//       }
//     } catch (err: any) {
//       console.warn(
//         `⚠️ Failed to categorize email UID ${msg.uid} for ${user}: ${err.message}. Using default category.`
//       );
//     }

//     // Prepare document for Elasticsearch
//     const doc = {
//       account: user,
//       folder, // use the folder parameter
//       subject,
//       from: msg.envelope?.from?.map((f: any) => f.address).join(", ") || "",
//       to: msg.envelope?.to?.map((t: any) => t.address).join(", ") || "",
//       date: msg.envelope?.date,
//       flags: msg.flags || [],
//       text: parsed.text || "",
//       html: parsed.html || "",
//       category,
//     };

//     // console.log("date msg:", msg);

//     await elasticClient.index({
//       index: "emails",
//       id: `${user}-${folder}-${msg.uid}`, // include folder in ID to avoid collisions
//       document: doc,
//     });

//     console.log(
//       `Indexed email: ${doc.subject} | Folder: ${folder} | Category: ${category}`
//     );
//   } catch (err) {
//     console.error("Error indexing email:", err);
//   }
// };

// export const searchEmails = async (
//   query: string,
//   account?: string,
//   folder?: string,
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const from = (page - 1) * limit;
//   const result = await elasticClient.search({
//     index: "emails",
//     from,
//     size: limit,
//     query: {
//       bool: {
//         must: [
//           { multi_match: { query, fields: ["subject", "text", "from", "to"] } },
//         ],
//         filter: [
//           ...(account ? [{ term: { account } }] : []),
//           ...(folder ? [{ term: { folder } }] : []),
//         ],
//       },
//     },
//   });

//   return result.hits.hits.map((hit) => hit._source);
// };

// export const indexEmail = async (
//   accountId: string,
//   msg: any,
//   folder: string = "INBOX",
//   emailAddress?: string
// ) => {
//   try {
//     const parsed = await simpleParser(msg.source);

//     const doc = {
//       accountId,
//       email: emailAddress ?? "",
//       folder,

//       subject: msg.envelope?.subject || "(No Subject)",
//       from: msg.envelope?.from?.map((f: any) => f.address).join(", ") || "",
//       to: msg.envelope?.to?.map((t: any) => t.address).join(", ") || "",

//       date: msg.envelope?.date,
//       flags: msg.flags || [],

//       text: parsed.text || "",
//       html: parsed.html || "",
//       snippet: parsed.text?.slice(0, 200) ?? "",
//       category: "Uncategorized", // default for now
//     };

//     await elasticClient.index({
//       index: "emails",
//       id: `${accountId}-${folder}-${msg.uid}`,
//       document: doc,
//     });

//     console.log(
//       `Indexed: UID ${msg.uid} | Folder: ${folder} | Account: ${accountId}`
//     );
//   } catch (err) {
//     console.error("Error indexing email:", err);
//   }
// };

export const indexEmail = async (
  accountId: string,
  msg: any,
  folder: string = "INBOX",
  emailAddress?: string,
) => {
  try {
    const parsed = await simpleParser(msg.source);

    const doc = {
      accountId,
      email: emailAddress ?? "",
      folder,

      uid: msg.uid, // <-- NEW IMPORTANT LINE

      subject: msg.envelope?.subject || "(No Subject)",
      from: msg.envelope?.from?.map((f: any) => f.address).join(", ") || "",
      to: msg.envelope?.to?.map((t: any) => t.address).join(", ") || "",

      date: msg.envelope?.date,
      flags: msg.flags || [],

      text: parsed.text || "",
      html: parsed.html || "",
      snippet: parsed.text?.slice(0, 200) ?? "",
      category: "Uncategorized",
    };

    await elasticClient.index({
      index: "emails",
      id: `${accountId}-${folder}-${msg.uid}`,
      document: doc,
    });

    console.log(
      `Indexed: UID ${msg.uid} | Folder: ${folder} | Account: ${accountId}`,
    );
  } catch (err) {
    console.error("Error indexing email:", err);
  }
};

export const searchEmails = async (
  query: string,
  account?: string,
  folder?: string,
  page: number = 1,
  limit: number = 10,
  category?: string,
): Promise<{
  emails: EmailType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> => {
  const from = (page - 1) * limit;

  // console.log("account search:*********************", account);

  const result = await elasticClient.search({
    index: "emails",
    from,
    size: limit,
    query: {
      bool: {
        must: [
          { multi_match: { query, fields: ["subject", "text", "from", "to"] } },
        ],
        filter: [
          ...(account ? [{ term: { "account.keyword": account } }] : []),
          ...(folder ? [{ term: { "folder.keyword": folder } }] : []),
          ...(category ? [{ term: { "category.keyword": category } }] : []),
        ],
      },
    },
  });

  let total: number;
  if (typeof result.hits.total === "number") {
    total = result.hits.total;
  } else {
    total = result.hits.total?.value ?? 0;
  }

  const emails: EmailType[] = result.hits.hits.map((hit: any) => ({
    id: hit._id,
    ...hit._source,
  }));

  return {
    emails,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getAllEmails = async (
  account?: string,
  folder?: string,
  page: number = 1,
  limit: number = 10,
  category?: string,
) => {
  const from = (page - 1) * limit;
  // console.log("account all mails:*********************", account);

  const filterQuery: any = {
    bool: {
      must: [],
    },
  };

  if (account)
    filterQuery.bool.must.push({ term: { "account.keyword": account } });
  if (folder)
    filterQuery.bool.must.push({ term: { "folder.keyword": folder } });
  if (category)
    filterQuery.bool.must.push({ term: { "category.keyword": category } });

  const query =
    filterQuery.bool.must.length > 0 ? filterQuery : { match_all: {} };

  const results = await elasticClient.search({
    index: "emails",
    from,
    size: limit,
    sort: [{ date: { order: "desc" } }],
    query,
  });

  // FIX: handle ES7 and ES8 styles
  let total: number;
  if (typeof results.hits.total === "number") {
    total = results.hits.total;
  } else {
    total = results.hits.total?.value ?? 0;
  }

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    emails: results.hits.hits.map((h: any) => ({
      id: h._id,
      ...h._source,
    })),
  };
};

export const getEmailById = async (id: string) => {
  try {
    const result = await elasticClient.get({
      index: "emails",
      id,
    });

    if (!result._source) {
      return null; // email not found
    }

    const email = {
      id: result._id,
      ...result._source,
    };

    return {
      email,
    };
  } catch (err: any) {
    if (err.meta?.statusCode === 404) {
      return null;
    }
    console.error("Error fetching email by ID:", err);
    throw err;
  }
};
