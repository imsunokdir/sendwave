// import Groq from "groq-sdk";
// import { searchRelevantContext } from "./pineOutreachContext";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export const generateReplySuggestion = async (
//   emailText: string,
// ): Promise<string | null> => {
//   try {
//     const context = await searchRelevantContext(emailText);

//     if (!context) {
//       console.log("No relevant context found in Pinecone");
//       return null;
//     }

//     const prompt = `You are an email assistant. Use the context below to suggest a professional reply to the email.

// Context:
// ${context}

// Email received:
// ${emailText}

// Write a short, professional reply:`;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 200,
//     });

//     const reply = completion.choices[0]?.message?.content?.trim();
//     return reply ?? null;
//   } catch (error: any) {
//     console.error("Error generating reply:", error.message);
//     return null;
//   }
// };
