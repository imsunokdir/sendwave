import { client } from "../config/algoliaClient";
import { categorizeEmail } from "./hgnFaceCategorization";
import pLimit from "p-limit";

// Limit concurrent API calls to 5 at a time

export const batchCategorizeEmails = async (emails: any[]) => {
  console.log(`Starting categorization for ${emails.length} emails...`);
  // Limit concurrent API calls to 5 at a time

  const limit = pLimit(5);

  const results = await Promise.all(
    emails.map((email) =>
      limit(async () => {
        try {
          console.log(`Categorizing email ID: ${email.id} ...`);
          const category = await categorizeEmail(email.text);
          if (category === null) {
            console.log(
              `Email ID: ${email.id} failed, leaving as Uncategorized`,
            );
            return { emailId: email.id, category: "Uncategorized" };
          }
          console.log(`Email ID: ${email.id} categorized as "${category}"`);

          await client.partialUpdateObject({
            indexName: "emails",
            objectID: email.id,
            attributesToUpdate: { category },
            createIfNotExists: true,
          });

          return { emailId: email.id, category };
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
          return { emailId: email.id, category: "Uncategorized" };
        }
      }),
    ),
  );

  console.log(
    `All emails processed! ${results.filter((r) => r.category).length}/${emails.length} succeeded.`,
  );
  return results;
};
