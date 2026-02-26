// import { ai } from "./gemini";
// import type { EmailType } from "../types/EmailTypes";

// export const generateSuggestedReplies = async (
//   email: EmailType
// ): Promise<string[]> => {
//   console.log("generating suggestiuons");
//   const prompt = `
// You are an AI assistant helping to draft professional email replies.
// Email from: ${email.from}
// Subject: ${email.subject}
// Email content: "${email.text}"

// Generate 3 concise replies that are polite, relevant, and could be used to respond directly.
// Make one reply a direct meeting scheduling suggestion if the email is about interviews.
// Respond ONLY with a JSON array of replies like: ["reply1", "reply2", "reply3"]
// `;

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//       config: {
//         temperature: 0.2,
//       },
//     });

//     const output = response.text ?? "";

//     try {
//       // Try to parse as JSON
//       const cleanOutput = output.replace(/```json\n?|\n?```/g, "").trim();
//       const replies = JSON.parse(cleanOutput);
//       console.log("replies log:", replies.slice(0, 3));
//       if (Array.isArray(replies)) return replies.slice(0, 3);
//     } catch {
//       // Fallback: split by line breaks
//       return output
//         .split(/\r?\n/)
//         .map((r) => r.trim())
//         .filter(Boolean)
//         .slice(0, 3);
//     }

//     return [];
//   } catch (err: any) {
//     console.warn("AI suggestion failed:", err.message);
//     return [
//       "Thank you for your email — I'll get back to you soon.",
//       "Appreciate your message. Let's set up a time to chat.",
//       "Thanks for reaching out. I'll respond shortly.",
//     ];
//   }
// };
