// import dotenv from "dotenv";
// import type { EmailType } from "../types/EmailTypes";
// import { retrieveRelevantContext } from "../services/vectorStore";

// dotenv.config();

// const OLLAMA_BASE_URL = process.env.OLLAMA_URL;
// const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

// export const generateRAGRepliesOllama = async (
//   email: EmailType
// ): Promise<string[]> => {
//   try {
//     console.log(`🟦 Generating RAG replies via Ollama: ${email.subject}`);

//     // Build the query for vector search
//     const queryText = `
// Subject: ${email.subject}
// From: ${email.from}
// Content: ${email.text?.substring(0, 400)}
//     `.trim();

//     // 🔍 Fetch top 3 context docs from Chroma
//     const { documents: contexts } = await retrieveRelevantContext(queryText, 3);
//     console.log("ontext:", contexts);

//     const contextBlock =
//       contexts.length > 0
//         ? contexts.map((c, i) => `CONTEXT ${i + 1}:\n${c}`).join("\n\n")
//         : "NO RELEVANT CONTEXT FOUND";

//     const prompt = `
// You are a professional email assistant using RAG (Retrieval-Augmented Generation).

// Use the following context ONLY IF relevant:

// ${contextBlock}

// EMAIL TO RESPOND TO:
// From: ${email.from}
// Subject: ${email.subject}
// Content: ${email.text?.substring(0, 600) || "(No content)"}

// TASK:
// Generate EXACTLY 3 professional replies.
// Each reply should be 2–3 sentences.
// Return ONLY a JSON array like:
// ["Reply 1", "Reply 2", "Reply 3"]
// `;

//     // 🔥 Talk to Ollama
//     const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: OLLAMA_MODEL,
//         prompt,
//         stream: false,
//         options: {
//           temperature: 0.4,
//           num_predict: 300,
//         },
//       }),
//     });

//     console.log("REspinse ollalal**********:", response);

//     if (!response.ok) {
//       throw new Error(`Ollama error: ${response.status}`);
//     }

//     const data = await response.json();
//     let text = data.response || "";

//     // Clean markdown blocks
//     text = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     // Try parsing JSON
//     try {
//       const parsed = JSON.parse(text);
//       if (Array.isArray(parsed)) return parsed.slice(0, 3);
//     } catch (err) {
//       console.warn("⚠️ JSON parse failed, using fallback replies");
//     }

//     return fallbackReplies();
//   } catch (err: any) {
//     console.error("❌ Ollama RAG reply generation failed:", err.message);
//     return fallbackReplies();
//   }
// };

// const fallbackReplies = (): string[] => [
//   "Thank you for your email. I will review this and get back to you soon.",
//   "I appreciate you reaching out. Let me check the details and follow up shortly.",
//   "Thanks for contacting me. I will revert with more information soon.",
// ];
