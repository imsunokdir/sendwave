import { v4 as uuidv4 } from "uuid";
import { pineconeIndex } from "../config/pinecone";
import { generateEmbedding } from "./pineEmbeddings";
// import { generateEmbedding } from "./generateEmbedding"; // use your existing embedding function

// ── Save context for a specific campaign ──────────────────────────────────────
export const saveCampaignContext = async (
  campaignId: string,
  text: string,
): Promise<string> => {
  const embedding = await generateEmbedding(text);
  const id = uuidv4();

  await pineconeIndex.upsert({
    records: [
      {
        id,
        values: embedding,
        metadata: { text, campaignId, type: "campaign-context" },
      },
    ],
  });

  console.log(`Saved campaign context for ${campaignId}: "${text}"`);
  return id;
};

// ── Get all context for a campaign ───────────────────────────────────────────
export const getCampaignContext = async (campaignId: string) => {
  const list = await pineconeIndex.listPaginated({
    prefix: "", // list all, filter by metadata below
  });

  const ids = (list.vectors ?? [])
    .map((v) => v.id)
    .filter((id): id is string => !!id);

  if (ids.length === 0) return [];

  const fetched = await pineconeIndex.fetch({ ids });

  return Object.values(fetched.records)
    .filter((r) => r.metadata?.campaignId === campaignId)
    .map((r) => ({ _id: r.id, text: r.metadata?.text as string }));
};

// ── Delete a context snippet ──────────────────────────────────────────────────
export const deleteCampaignContext = async (id: string): Promise<void> => {
  await pineconeIndex.deleteOne({ id });
};

// ── Search relevant context for a campaign (used for AI reply) ────────────────
export const searchCampaignContext = async (
  campaignId: string,
  emailText: string,
): Promise<string> => {
  const embedding = await generateEmbedding(emailText);

  const results = await pineconeIndex.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
    filter: { campaignId: { $eq: campaignId } },
  });

  return results.matches?.map((m) => m.metadata?.text).join("\n") ?? "";
};
