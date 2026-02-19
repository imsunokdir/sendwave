import { Request, Response } from "express";
import { client } from "../config/algoliaClient";

export const testMe = async (req: Request, res: Response) => {
  try {
    const data = { name: "imsu" };
    console.log("heyyy");
    res.json(data);
  } catch (error: any) {
    console.error("Error in testMe controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fixNullCategories = async () => {
  const nullEmails: string[] = [];

  await client.browseObjects({
    indexName: "emails",
    browseParams: {
      query: "",
      filters:
        "NOT category:Uncategorized AND NOT category:Interested AND NOT category:NotInterested AND NOT category:Spam",
    },
    aggregator: (response) => {
      response.hits.forEach((hit: any) => {
        if (!hit.category || hit.category === null) {
          nullEmails.push(hit.objectID);
        }
      });
    },
  });

  console.log(
    `Found ${nullEmails.length} emails with null category, resetting...`,
  );

  // Batch update all null category emails back to "Uncategorized"
  await client.partialUpdateObjects({
    indexName: "emails",
    objects: nullEmails.map((objectID) => ({
      objectID,
      category: "Uncategorized",
    })),
    createIfNotExists: false,
  });

  console.log("Done! All null categories reset to Uncategorized.");
};
