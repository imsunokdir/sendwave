// import { ai } from "./gemini";

// // Rate limiting: 10 requests per minute (free tier gemini)
// const RATE_LIMIT = 10;
// const RATE_WINDOW = 60 * 1000;
// let requestCount = 0;
// let windowStart = Date.now();

// // Track quota status
// let quotaExhausted = false;
// let quotaResetTime: number | null = null;

// // wait for rate limit reset
// const waitForRateLimit = async () => {
//   const now = Date.now();

//   // Reset counter if window expired
//   if (now - windowStart >= RATE_WINDOW) {
//     requestCount = 0;
//     windowStart = now;
//     return;
//   }

//   // If quota limit hit, wait until wndow resets
//   if (requestCount >= RATE_LIMIT) {
//     const waitTime = RATE_WINDOW - (now - windowStart);
//     console.log(
//       `⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`
//     );
//     await new Promise((resolve) => setTimeout(resolve, waitTime));
//     requestCount = 0;
//     windowStart = Date.now();
//   }
// };

// // parse retry time from error message
// const parseRetryTime = (errorMessage: string): number => {
//   const match = errorMessage.match(/retry in (\d+\.?\d*)s/i);
//   if (match) {
//     return parseFloat(match[1]) * 1000; // Convert to ms
//   }
//   return 60 * 1000; // Default 1 minute
// };

// export const categorizeEmail = async (text: string): Promise<string> => {
//   // Check if quota is exhausted
//   if (quotaExhausted && quotaResetTime) {
//     const now = Date.now();
//     if (now < quotaResetTime) {
//       const minutesLeft = Math.ceil((quotaResetTime - now) / 1000 / 60);
//       console.warn(`⏳ Quota exhausted. Resets in ~${minutesLeft} min`);
//       return "Pending Categorization";
//     } else {
//       // Reset quota flag after cooldown
//       quotaExhausted = false;
//       quotaResetTime = null;
//       console.log("✅ Quota cooldown expired, resuming categorization");
//     }
//   }

//   // Wait for rate limit if needed
//   await waitForRateLimit();

//   const categories = [
//     "Interested",
//     "Meeting Booked",
//     "Not Interested",
//     "Spam",
//     "Out of Office",
//   ];

//   const prompt = `
//   Categorize the following email into one of these labels: ${categories.join(
//     ", "
//   )}.
//   Email content: "${text.substring(0, 500)}"
//   Respond ONLY with the category name.
//   `;

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     requestCount++; // Increment after successful request

//     const category = response.text?.trim() ?? "Uncategorized";
//     console.log(`✅ Categorized as: ${category}`);
//     return category;
//   } catch (err: any) {
//     const errorMessage = err.message || "";

//     // Check if it's a quota/rate limit error
//     if (
//       errorMessage.includes("quota") ||
//       errorMessage.includes("429") ||
//       errorMessage.includes("RESOURCE_EXHAUSTED") ||
//       err.status === 429
//     ) {
//       // Parse retry time from error message
//       const retryAfter = parseRetryTime(errorMessage);
//       quotaExhausted = true;
//       quotaResetTime = Date.now() + retryAfter + 5000; // Add 5s buffer

//       const minutesWait = Math.ceil(retryAfter / 1000 / 60);
//       console.error(
//         `🚫 QUOTA/RATE LIMIT HIT! Pausing categorization for ~${minutesWait} min`
//       );
//       console.error(`   Error: ${errorMessage.substring(0, 200)}`);

//       return "Pending Categorization";
//     }

//     // Other errors
//     console.warn(
//       `⚠️ AI categorization failed: ${errorMessage.substring(0, 100)}`
//     );
//     return "Uncategorized";
//   }
// };

// // Export function to manually reset quota (useful for testing)
// export const resetQuota = () => {
//   quotaExhausted = false;
//   quotaResetTime = null;
//   requestCount = 0;
//   windowStart = Date.now();
//   console.log("✅ Quota status reset manually");
// };

// // Check if quota is currently exhausted
// export const isQuotaExhausted = () => quotaExhausted;

// // Get current rate limit status
// export const getRateLimitStatus = () => ({
//   requestCount,
//   limit: RATE_LIMIT,
//   windowStart: new Date(windowStart).toISOString(),
//   quotaExhausted,
//   quotaResetTime: quotaResetTime
//     ? new Date(quotaResetTime).toISOString()
//     : null,
// });
