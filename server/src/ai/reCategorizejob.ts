// import { elasticClient } from "../services/elasticSearch";
// import { categorizeEmail, isQuotaExhausted } from "./ollamaAiCategorization";
// // import { categorizeEmail, isQuotaExhausted } from "../ai/groqAiCategorization";

// export const recategorizePendingEmails = async () => {
//   try {
//     console.log("🔄 Starting re-categorization job...");

//     // Skip if quota is still exhausted
//     if (isQuotaExhausted()) {
//       console.log("⏳ Quota still exhausted, skipping job");
//       return;
//     }

//     // Find emails that need categorization
//     const result = await elasticClient.search({
//       index: "emails",
//       size: 50, // Process 50 at a time (stay under rate limit)
//       query: {
//         bool: {
//           should: [
//             { term: { "category.keyword": "Pending Categorization" } },
//             { term: { "category.keyword": "Uncategorized" } },
//           ],
//         },
//       },
//       sort: [{ date: { order: "desc" } }], // Newest first
//     });

//     const pendingEmails = result.hits.hits;

//     if (pendingEmails.length === 0) {
//       console.log("✅ No pending emails to categorize");
//       return;
//     }

//     console.log(`📧 Found ${pendingEmails.length} emails to re-categorize`);

//     let successCount = 0;
//     let failCount = 0;
//     let quotaHitCount = 0;

//     for (const hit of pendingEmails) {
//       const email: any = hit._source;
//       const docId = hit._id;

//       // Check quota before each categorization
//       if (isQuotaExhausted()) {
//         console.log(
//           `🚫 Quota exhausted during job. Processed ${successCount} emails.`
//         );
//         break;
//       }

//       try {
//         // Re-categorize
//         const newCategory = await categorizeEmail(email.text || "");

//         // Check if we got a valid category (not pending/uncategorized)
//         if (
//           newCategory !== "Pending Categorization" &&
//           newCategory !== "Uncategorized"
//         ) {
//           // Update in Elasticsearch
//           await elasticClient.update({
//             index: "emails",
//             id: docId as string,
//             doc: { category: newCategory },
//           });

//           console.log(`✅ Re-categorized: "${email.subject}" → ${newCategory}`);
//           successCount++;
//         } else if (newCategory === "Pending Categorization") {
//           quotaHitCount++;
//           break; // Stop if we hit quota
//         } else {
//           failCount++;
//         }

//         // Small delay to avoid rapid requests (Groq: 30/min = 2 seconds per request)
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//       } catch (err: any) {
//         console.error(
//           `❌ Failed to re-categorize "${email.subject}":`,
//           err.message
//         );
//         failCount++;
//       }
//     }

//     console.log(`
// 🎯 Re-categorization complete:
//    ✅ Success: ${successCount}
//    ❌ Failed: ${failCount}
//    ⏳ Quota hit: ${quotaHitCount > 0 ? "Yes" : "No"}
//    📧 Remaining: ${pendingEmails.length - successCount - failCount}
//     `);
//   } catch (err) {
//     console.error("❌ Re-categorization job error:", err);
//   }
// };

// // Schedule the job to run every 2 minutes
// export const startRecategorizationJob = () => {
//   console.log("⏰ Re-categorization job started");

//   // Run immediately after 30 seconds (give initial sync time to complete)
//   setTimeout(() => {
//     recategorizePendingEmails();
//   }, 30000);

//   // Then run every 2 minutes
//   setInterval(() => {
//     recategorizePendingEmails();
//   }, 2 * 60 * 1000); // 2 minutes

//   console.log("   → Runs every 2 minutes to catch pending emails");
// };
