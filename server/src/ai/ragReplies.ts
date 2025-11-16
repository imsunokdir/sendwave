import type { EmailType } from "../types/EmailTypes";
import { retrieveRelevantContext } from "../services/vectorStore";
import { ai } from "./gemini";

export const generateRAGRepliesGemini = async (
  email: EmailType
): Promise<string[]> => {
  try {
    console.log(`🔍 Generating RAG replies for: ${email.subject}`);

    const emailQuery = `
      Subject: ${email.subject}
      From: ${email.from}
      Content: ${email.text?.substring(0, 500)}
    `.trim();

    const { documents: contexts } = await retrieveRelevantContext(
      emailQuery,
      3
    );
    console.log("contexts:**", contexts);

    if (contexts.length === 0) return generateFallbackReplies(email);

    const contextString = contexts
      .map((ctx, idx) => `CONTEXT ${idx + 1}:\n${ctx}`)
      .join("\n\n");

    const prompt = `
You are a professional email assistant using Retrieval-Augmented Generation (RAG). 
Use the context below to generate 3 professional reply options.

${contextString}

EMAIL TO RESPOND TO:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text?.substring(0, 600) || "(No content)"}

TASK:
Generate exactly 3 professional replies, 2-3 sentences each.
Respond ONLY with a JSON array of 3 replies: ["Reply 1", "Reply 2", "Reply 3"].
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("Raw Gemini response:", response);

    // Extract text safely
    let output = "";

    if (response.text && response.text.trim().length > 0) {
      output = response.text;
    } else if (response.candidates && response.candidates.length > 0) {
      // Search for type === 'output_text' in candidate content
      const candidate = response.candidates[0];
      if (Array.isArray(candidate.content)) {
        const textPart = candidate.content.find(
          (c) => c.type === "output_text"
        );
        if (textPart?.text) {
          output = textPart.text;
        }
      }
    }

    if (!output) {
      console.warn("⚠️ No content returned from Gemini");
      return generateFallbackReplies(email);
    }

    // Parse JSON array
    try {
      const cleanOutput = output
        .replace(/```json\n?|\n?```/g, "")
        .replace(/^[^[]*/, "")
        .replace(/[^\]]*$/, "")
        .trim();

      const replies = JSON.parse(cleanOutput);
      return Array.isArray(replies)
        ? replies.slice(0, 3)
        : generateFallbackReplies(email);
    } catch (err) {
      console.warn("⚠️ Failed to parse Gemini JSON, using fallback", err);
      return generateFallbackReplies(email);
    }
  } catch (err) {
    console.error("❌ Gemini RAG reply generation failed:", err);
    return generateFallbackReplies(email);
  }
};

const generateFallbackReplies = (email: EmailType): string[] => [
  `Thank you for your email. I'd be happy to discuss this further.`,
  `I appreciate you reaching out. Let's schedule a call to discuss in detail.`,
  `Thanks for getting in touch! Please book a convenient time to connect.`,
];
