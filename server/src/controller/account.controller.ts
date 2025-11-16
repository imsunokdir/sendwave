import { Request, Response } from "express";
import { elasticClient } from "../services/elasticSearch";

export const getAllEmailAccounts = async (req: Request, res: Response) => {
  try {
    const result = await elasticClient.search({
      index: "emails",
      size: 0, // we don’t need actual documents
      aggs: {
        accounts: {
          terms: { field: "account.keyword", size: 100 }, // use .keyword for exact match
        },
      },
    });

    console.log("acc res:", result);

    const accounts = (
      (result.aggregations as any)?.accounts?.buckets || []
    ).map((b: any) => b.key);

    res.json({ accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};
