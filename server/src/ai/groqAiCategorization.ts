import Groq from "groq-sdk";
import dotenv from "dotenv";
import { dot } from "node:test/reporters";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Rate limiting tracking
let quotaExhausted = false;
let quotaResetTime: number | null = null;

// Parse retry time from error response
const parseRetryTime = (error: any): number => {
  // Check for Retry-After header or error message
  const retryAfter = error?.response?.headers?.["retry-after"];
  if (retryAfter) {
    return parseInt(retryAfter) * 1000; // Convert seconds to ms
  }

  // Parse from error message like "retry in 30s"
  const match = error?.message?.match(/retry.*?(\d+)/i);
  if (match) {
    return parseInt(match[1]) * 1000;
  }

  return 60 * 1000; // Default 1 minute
};

export const categorizeEmail = async (text: string): Promise<string> => {
  // Check if quota is still exhausted
  if (quotaExhausted && quotaResetTime) {
    const now = Date.now();
    if (now < quotaResetTime) {
      const secondsLeft = Math.ceil((quotaResetTime - now) / 1000);
      console.warn(`⏳ Quota exhausted. Resets in ${secondsLeft}s`);
      return "Pending Categorization";
    } else {
      // Reset quota flag
      quotaExhausted = false;
      quotaResetTime = null;
      console.log("✅ Quota cooldown expired, resuming...");
    }
  }

  const categories = [
    "Interested",
    "Meeting Booked",
    "Not Interested",
    "Spam",
    "Out of Office",
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an email categorizer. Categorize emails into exactly ONE of these categories: ${categories.join(
            ", "
          )}. Respond with ONLY the category name.`,
        },
        {
          role: "user",
          content: `Categorize: ${text.substring(0, 1000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const category =
      completion.choices[0]?.message?.content?.trim() || "Uncategorized";

    console.log(`✅ Categorized as: ${category}`);
    return category;
  } catch (err: any) {
    console.error(`❌ Groq categorization failed: ${err.message}`);

    // Handle rate limit (429)
    if (err.status === 429 || err.message?.includes("rate limit")) {
      const retryAfter = parseRetryTime(err);
      quotaExhausted = true;
      quotaResetTime = Date.now() + retryAfter;

      console.error(
        `🚫 Rate limit hit! Pausing for ${Math.ceil(retryAfter / 1000)}s`
      );
      console.error("   Groq free tier: 30 requests/min");
      return "Pending Categorization";
    }

    // Handle authentication errors
    if (err.status === 401) {
      console.error(
        "   Invalid API key! Get one from: https://console.groq.com"
      );
    }

    return "Uncategorized";
  }
};

// Check if quota is currently exhausted
export const isQuotaExhausted = (): boolean => {
  if (quotaExhausted && quotaResetTime) {
    return Date.now() < quotaResetTime;
  }
  return false;
};

// Manually reset quota status (for testing)
export const resetQuota = (): void => {
  quotaExhausted = false;
  quotaResetTime = null;
  console.log("✅ Quota status manually reset");
};
