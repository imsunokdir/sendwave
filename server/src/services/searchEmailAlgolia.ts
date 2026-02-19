import { client } from "../config/algoliaClient";

export const searchEmails = async (query: string) => {
  const result = await client.search({
    requests: [
      {
        indexName: "emails",
        query,
      },
    ],
  });

  return result;
};

export const searchWithFilters = async (
  query: string,
  folder: string,
  account: string,
) => {
  const result = await client.search({
    requests: [
      {
        indexName: "emails",
        query,
        filters: `folder:"${folder}" AND account:"${account}"`,
      },
    ],
  });

  return result;
};
