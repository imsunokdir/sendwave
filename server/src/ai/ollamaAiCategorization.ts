// import dotenv from "dotenv";

// dotenv.config();

// const OLLAMA_BASE_URL = process.env.OLLAMA_URL;
// const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

// export const categorizeEmail = async (text: string): Promise<string> => {
//   const categories = [
//     "Interested",
//     "Meeting Booked",
//     "Not Interested",
//     "Spam",
//     "Out of Office",
//   ];

//   const prompt = `You are an email categorizer. Categorize this email into EXACTLY ONE of these categories: ${categories.join(
//     ", "
//   )}.

// Email content:
// "${text.substring(0, 800)}"

// Respond with ONLY the category name, nothing else.`;

//   try {
//     const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: OLLAMA_MODEL,
//         prompt: prompt,
//         stream: false,
//         options: {
//           temperature: 0.1,
//           num_predict: 20,
//           stop: ["\n", ".", ","],
//         },
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.status}`);
//     }

//     const data = await response.json();
//     let category = data.response?.trim() || "Uncategorized";

//     // Find matching category
//     const foundCategory = categories.find((cat) =>
//       category.toLowerCase().includes(cat.toLowerCase())
//     );

//     if (foundCategory) {
//       category = foundCategory;
//     }

//     console.log(`✅ [Local LLM] Categorized as: ${category}`);

//     return category;
//   } catch (err: any) {
//     console.error(`❌ Ollama categorization failed: ${err.message}`);

//     if (err.code === "ECONNREFUSED" || err.message.includes("fetch failed")) {
//       console.error("   ⚠️ Ollama is not running! Start it with: ollama serve");
//     }

//     return "Uncategorized";
//   }
// };

// export const isQuotaExhausted = (): boolean => false;

// export const checkOllamaStatus = async (): Promise<boolean> => {
//   try {
//     const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
//     if (response.ok) {
//       const data = await response.json();
//       const hasModel = data.models?.some((m: any) => m.name === OLLAMA_MODEL);

//       if (!hasModel) {
//         console.warn(`⚠️ Model "${OLLAMA_MODEL}" not found`);
//         console.warn(`   Install it with: ollama pull ${OLLAMA_MODEL}`);
//         return false;
//       }

//       console.log(`✅ Ollama is running with model: ${OLLAMA_MODEL}`);
//       return true;
//     }
//     return false;
//   } catch (err) {
//     console.error("❌ Ollama is not running");
//     console.error("   Start it with: ollama serve");
//     return false;
//   }
// };
