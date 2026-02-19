import { categorizeEmail } from "src/ai/ollamaAiCategorization";
import { elasticClient } from "./elasticSearch";

// Type for email document in Elasticsearch
interface IElasticEmail {
  text?: string;
  snippet?: string;
  accountId?: string;
  folder?: string;
  category?: string;
  [key: string]: any;
}

/**
 * Categorize a list of emails from Elasticsearch.
 * Accepts either email IDs, days, or folder filters.
 */
export const categorizeEmails = async (options: {
  emailIds: string[];
  days?: number;
  folders?: string[];
}) => {
  try {
    const { emailIds, days, folders } = options;

    // Build Elasticsearch query
    const query: any = { bool: { must: [] } };

    if (emailIds && emailIds.length > 0) {
      query.bool.must.push({ ids: { values: emailIds } });
    }

    if (days) {
      const fromDate = new Date(Date.now() - days * 86400 * 1000).toISOString();
      query.bool.must.push({ range: { date: { gte: fromDate } } });
    }

    if (folders && folders.length > 0) {
      query.bool.must.push({ terms: { folder: folders } });
    }

    // Typed ES search
    const { hits } = await elasticClient.search<IElasticEmail>({
      index: "emails",
      size: 1000,
      query,
    });

    if (!hits.hits.length) {
      console.log("⚠ No emails found to categorize");
      return;
    }

    for (const hit of hits.hits) {
      if (!hit._id) {
        console.error("⚠ Skipping email with missing _id", hit);
        continue;
      }

      const email = hit._source as IElasticEmail;

      // Categorize the email
      const category = await categorizeEmail(email.text || email.snippet || "");

      // Update ES document
      await elasticClient.update({
        index: "emails",
        id: hit._id, // now safe
        doc: { category },
      });

      console.log(`✅ Email ${hit._id} categorized as: ${category}`);
    }
  } catch (err: any) {
    console.error("❌ Categorization error:", err.message || err);
  }
};
