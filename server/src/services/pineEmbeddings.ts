import { pipeline } from "@xenova/transformers";

let embedder: any = null;

// Load model once and reuse
const getEmbedder = async () => {
  if (!embedder) {
    console.log("Loading embedding model...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Embedding model loaded!");
  }
  return embedder;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
};
