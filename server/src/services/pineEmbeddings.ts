import { InferenceClient } from "@huggingface/inference";
require("dotenv").config();

const hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return Array.from(result as number[]);
};
