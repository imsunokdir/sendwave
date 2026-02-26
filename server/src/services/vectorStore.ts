// import { ChromaClient } from "chromadb";
// import dotenv from "dotenv";
// import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

// dotenv.config();

// const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
// const COLLECTION_NAME = "email_reply_context";

// let client: ChromaClient;
// let isInitialized = false;

// // Get or create a Chroma client
// const getClient = () => {
//   if (!client) {
//     client = new ChromaClient({
//       host: "host.docker.internal", // For Docker to connect to localhost
//       port: 8000,
//       ssl: false,
//     });
//   }
//   return client;
// };

// // Initialize vector database and create collection if not exists
// export const initializeVectorDB = async () => {
//   try {
//     const chromaClient = getClient();

//     const collection = await chromaClient.getOrCreateCollection({
//       name: COLLECTION_NAME,
//       embeddingFunction: new DefaultEmbeddingFunction(),
//     });

//     isInitialized = true;
//     console.log("✅ Vector database initialized");
//     return collection;
//   } catch (error: any) {
//     console.error("❌ Failed to initialize vector database:", error.message);
//     throw error;
//   }
// };

// // Health check
// export const checkVectorDBHealth = async (): Promise<boolean> => {
//   try {
//     const chromaClient = getClient();
//     const heartbeat = await chromaClient.heartbeat();
//     console.log(`✅ ChromaDB is healthy (heartbeat: ${heartbeat}ns)`);
//     return true;
//   } catch (error: any) {
//     console.error("❌ ChromaDB health check failed:", error.message);
//     console.error("   Make sure ChromaDB is running: docker-compose up -d");
//     return false;
//   }
// };

// // Store training data
// export const storeTrainingData = async (data: {
//   id: string;
//   content: string;
//   metadata?: Record<string, any>;
// }) => {
//   try {
//     const chromaClient = getClient();
//     const collection = await chromaClient.getOrCreateCollection({
//       name: COLLECTION_NAME,
//       embeddingFunction: new DefaultEmbeddingFunction(),
//     });

//     await collection.add({
//       ids: [data.id],
//       documents: [data.content],
//       metadatas: data.metadata ? [data.metadata] : undefined,
//     });

//     console.log(`✅ Stored training data: ${data.id}`);
//   } catch (error: any) {
//     console.error(`❌ Failed to store training data: ${error.message}`);
//     throw error;
//   }
// };

// // Retrieve relevant context using vector similarity
// // export const retrieveRelevantContext = async (
// //   query: string,
// //   topK: number = 3
// // ): Promise<{ documents: string[]; metadatas: Record<string, any>[] }> => {
// //   try {
// //     const chromaClient = getClient();
// //     const collection = await chromaClient.getCollection({
// //       name: COLLECTION_NAME,
// //       embeddingFunction: new DefaultEmbeddingFunction(),
// //     });

// //     const results = await collection.query({
// //       queryTexts: [query],
// //       nResults: topK,
// //     });

// //     const documents = (results.documents[0] || []).filter(
// //       (d): d is string => d !== null
// //     );
// //     const metadatas = (results.metadatas[0] || []).filter(
// //       (m): m is Record<string, any> => m !== null
// //     );

// //     console.log(`✅ Retrieved ${documents.length} relevant contexts`);

// //     return { documents, metadatas };
// //   } catch (error: any) {
// //     console.error(`❌ Failed to retrieve context: ${error.message}`);
// //     return { documents: [], metadatas: [] };
// //   }
// // };

// export const retrieveRelevantContext = async (
//   query: string,
//   topK: number = 3
// ): Promise<{ documents: string[]; metadatas: Record<string, any>[] }> => {
//   try {
//     const chromaClient = getClient(); // Always use getOrCreateCollection, not getCollection!
//     const collection = await chromaClient.getOrCreateCollection({
//       name: COLLECTION_NAME,
//       embeddingFunction: new DefaultEmbeddingFunction(),
//     });

//     const results = await collection.query({
//       queryTexts: [query],
//       nResults: topK,
//     });

//     const documents = (results.documents[0] || []).filter(
//       (d): d is string => d !== null
//     );
//     const metadatas = (results.metadatas[0] || []).filter(
//       (m): m is Record<string, any> => m !== null
//     );

//     console.log(`✅ Retrieved ${documents.length} relevant contexts`);
//     return { documents, metadatas };
//   } catch (error: any) {
//     console.error(`❌ Failed to retrieve context: ${error.message}`);
//     return { documents: [], metadatas: [] };
//   }
// };

// // Seed initial training data
// export const seedTrainingData = async () => {
//   try {
//     const chromaClient = getClient();
//     const collection = await chromaClient.getOrCreateCollection({
//       name: COLLECTION_NAME,
//       embeddingFunction: new DefaultEmbeddingFunction(),
//     });

//     const count = await collection.count();
//     if (count > 0) {
//       console.log(
//         `⏭️ Training data already exists (${count} entries), skipping seed`
//       );
//       return;
//     }

//     const trainingData = [
//       {
//         id: "job-interview-response",
//         content: `When someone invites you for a job interview or technical discussion, respond professionally:
// - Express enthusiasm and gratitude
// - Confirm your interest in the position
// - Provide your calendar booking link: https://cal.com/example
// - Mention your availability
// - Keep the tone professional and eager`,
//         metadata: {
//           category: "job_application",
//           intent: "interview_invitation",
//           response_type: "meeting_booking",
//         },
//       },
//       {
//         id: "resume-shortlisted",
//         content: `If someone says your resume has been shortlisted or they want to schedule an interview:
// - Thank them for considering your application
// - Express excitement about the opportunity
// - Share your meeting booking link: https://cal.com/example
// - Mention you're available to discuss your qualifications
// Example: "Thank you for shortlisting my profile! I'm excited about this opportunity and available for a technical interview. You can book a convenient time here: https://cal.com/yourname"`,
//         metadata: {
//           category: "job_application",
//           intent: "shortlisted",
//           response_type: "meeting_booking",
//         },
//       },
//       {
//         id: "meeting-request",
//         content: `When someone wants to schedule a meeting or call:
// - Acknowledge their request promptly
// - Show enthusiasm for the discussion
// - Provide your calendar link: https://cal.com/example
// - Be flexible about timing
// - Keep it concise and professional`,
//         metadata: {
//           category: "general",
//           intent: "meeting_request",
//           response_type: "meeting_booking",
//         },
//       },
//       {
//         id: "interested-lead",
//         content: `If someone expresses interest in your services, product, or profile:
// - Thank them for their interest
// - Offer to discuss further details
// - Suggest scheduling a call
// - Share booking link: https://cal.com/example
// - Highlight key benefits briefly`,
//         metadata: {
//           category: "sales",
//           intent: "interested",
//           response_type: "meeting_booking",
//         },
//       },
//       {
//         id: "follow-up-meeting",
//         content: `For follow-up emails about previous conversations:
// - Reference the previous discussion
// - Confirm your continued interest
// - Provide clear next steps
// - Share updated availability via: https://cal.com/example
// - Maintain professional tone`,
//         metadata: {
//           category: "follow_up",
//           intent: "follow_up",
//           response_type: "meeting_booking",
//         },
//       },
//     ];

//     await collection.add({
//       ids: trainingData.map((d) => d.id),
//       documents: trainingData.map((d) => d.content),
//       metadatas: trainingData.map((d) => d.metadata),
//     });

//     console.log(`✅ Seeded ${trainingData.length} training data entries`);
//   } catch (error: any) {
//     console.error(`❌ Failed to seed training data: ${error.message}`);
//     throw error;
//   }
// };

// // Get collection stats
// export const getCollectionStats = async () => {
//   try {
//     const chromaClient = getClient();
//     const collection = await chromaClient.getCollection({
//       name: COLLECTION_NAME,
//       embeddingFunction: new DefaultEmbeddingFunction(),
//     });
//     const count = await collection.count();

//     return {
//       name: COLLECTION_NAME,
//       count,
//       initialized: isInitialized,
//     };
//   } catch (error: any) {
//     return {
//       name: COLLECTION_NAME,
//       count: 0,
//       initialized: false,
//       error: error.message,
//     };
//   }
// };
