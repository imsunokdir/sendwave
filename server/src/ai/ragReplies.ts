import type { EmailType } from "../types/EmailTypes";
import { retrieveRelevantContext } from "../services/vectorStore";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

export const generateRAGReplies = async (
  email: EmailType
): Promise<string[]> => {
  try {
    console.log(`🔍 Generating RAG-based replies for: ${email.subject}`);

    const emailQuery = `
      Subject: ${email.subject}
      From: ${email.from}
      Content: ${email.text?.substring(0, 500)}
    `.trim();

    const { documents: contexts } = await retrieveRelevantContext(
      emailQuery,
      3
    );

    if (contexts.length === 0) {
      console.warn("⚠️ No relevant context found in vector DB, using fallback");
      return generateFallbackReplies(email);
    }

    console.log(
      `📚 Retrieved ${contexts.length} relevant contexts from vector DB`
    );

    const contextString = contexts
      .map((ctx, idx) => `CONTEXT ${idx + 1}:\n${ctx}`)
      .join("\n\n");

    const prompt = `You are a professional email assistant using Retrieval-Augmented Generation (RAG). 

You have been provided with relevant context and guidelines retrieved from a knowledge base. Use this context to generate appropriate email replies.

${contextString}

EMAIL TO RESPOND TO:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.text?.substring(0, 600) || "(No content)"}

TASK:
Generate exactly 3 different professional reply options based on the context above.

REQUIREMENTS:
1. Follow the guidelines provided in the context
2. Be professional, concise, and polite (2-3 sentences per reply)
3. If the context mentions a calendar link, include it in your replies
4. Tailor the tone to match the email's intent
5. Make each reply slightly different in approach

Respond ONLY with a JSON array of exactly 3 replies:
["Reply 1", "Reply 2", "Reply 3"]

Do not include any explanation, just the JSON array.`;

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 500,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const output = data.response?.trim() || "";

    try {
      const cleanOutput = output
        .replace(/```json\n?|\n?```/g, "")
        .replace(/^[^[]*/, "")
        .replace(/[^\]]*$/, "")
        .trim();

      const replies = JSON.parse(cleanOutput);

      if (Array.isArray(replies) && replies.length > 0) {
        const validReplies = replies
          .filter((r) => typeof r === "string" && r.trim().length > 0)
          .slice(0, 3);

        if (validReplies.length > 0) {
          console.log(`✅ Generated ${validReplies.length} RAG-based replies`);
          return validReplies;
        }
      }
    } catch (parseError) {
      console.warn("⚠️ Failed to parse LLM response, using fallback");
    }

    return generateFallbackReplies(email);
  } catch (error: any) {
    console.error(`❌ RAG reply generation failed: ${error.message}`);
    return generateFallbackReplies(email);
  }
};

const generateFallbackReplies = (email: EmailType): string[] => {
  const subject = email.subject?.toLowerCase() || "";
  const content = email.text?.toLowerCase() || "";

  const isAboutInterview =
    subject.includes("interview") ||
    subject.includes("shortlist") ||
    content.includes("interview") ||
    content.includes("technical round") ||
    content.includes("schedule") ||
    content.includes("call");

  if (isAboutInterview) {
    return [
      `Thank you for considering my application! I'm very interested in this opportunity and would be happy to discuss further. You can book a convenient time here: https://cal.com/yourname`,
      `I appreciate you reaching out regarding the ${email.subject}. I'm excited about this opportunity and available for a discussion. Please feel free to schedule a time: https://cal.com/yourname`,
      `Thanks for shortlisting my profile! I'm available for a technical interview and eager to discuss my qualifications. Let's connect: https://cal.com/yourname`,
    ];
  }

  const isInterested =
    content.includes("interested") ||
    content.includes("explore") ||
    content.includes("discuss") ||
    subject.includes("opportunity");

  if (isInterested) {
    return [
      `Thank you for your interest! I'd be happy to discuss this further. Would you like to schedule a call? You can book a time here: https://cal.com/yourname`,
      `I appreciate you reaching out. Let's connect to explore this opportunity in detail. Please schedule a convenient time: https://cal.com/yourname`,
      `Thanks for getting in touch! I'm interested in learning more. Feel free to book a meeting: https://cal.com/yourname`,
    ];
  }

  return [
    `Thank you for your email. I'd be happy to discuss this further. You can schedule a time to connect here: https://cal.com/yourname`,
    `I appreciate you reaching out. Let's schedule a call to discuss this in detail: https://cal.com/yourname`,
    `Thanks for getting in touch! I'm available to discuss this further. Please book a convenient time: https://cal.com/yourname`,
  ];
};
