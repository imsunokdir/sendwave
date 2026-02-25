import { pineconeIndex } from "../config/pinecone";
// import { generateEmbedding } from "./embeddings";
import { v4 as uuidv4 } from "uuid";
import { generateEmbedding } from "./pineEmbeddings";

// Save context to Pinecone
export const saveOutreachContext = async (
  text: string,
  campaignId: string,
): Promise<string> => {
  const id = uuidv4(); // ← generate id first
  const embedding = await generateEmbedding(text);

  await pineconeIndex.upsert({
    records: [
      {
        id,
        values: embedding,
        metadata: { text, campaignId },
      },
    ],
  });

  console.log(`Saved outreach context for campaign ${campaignId}: "${text}"`);
  return id; // ← return it
};

// Delete context from Pinecone
export const deleteOutreachContext = async (id: string) => {
  await pineconeIndex.deleteOne({ id });
  console.log(`Deleted outreach context: ${id}`);
};

// Get all context from Pinecone
export const getAllOutreachContext = async () => {
  const list = await pineconeIndex.listPaginated();
  const ids = (list.vectors ?? [])
    .map((v) => v.id)
    .filter((id): id is string => !!id); // removes undefined

  if (ids.length === 0) return [];

  const fetched = await pineconeIndex.fetch({ ids });
  return Object.values(fetched.records).map((record) => ({
    _id: record.id,
    text: record.metadata?.text as string,
  }));
};

// Search relevant context for a given email
export const searchRelevantContext = async (
  emailText: string,
  campaignId: string,
) => {
  const embedding = await generateEmbedding(emailText);

  const results = await pineconeIndex.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
    filter: { campaignId: { $eq: campaignId } }, // ← filter by campaign
  });

  return results.matches?.map((m) => m.metadata?.text).join("\n") ?? "";
};
