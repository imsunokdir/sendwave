// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// import emailRouter from "./routes/email.route";
// import { startIMAPConnections } from "./startup/imapStartup";
// import { startRecategorizationJob } from "./ai/reCategorizejob";
// import { checkOllamaStatus } from "./ai/ollamaAiCategorization";

// import {
//   initializeVectorDB,
//   seedTrainingData,
//   checkVectorDBHealth,
// } from "./services/vectorStore";
// import testRouter from "./routes/test.route";
// import accountRouter from "./ai/account.routes";
// import { fixFoldersForAccount } from "./update/updateFolderForAccounts";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const app = express();
// app.use(express.json());

// // Use CORS middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

// // routes

// app.use("/emails", emailRouter);
// app.use("/accounts", accountRouter);

// // ---------- Server Startup ----------
// const startServer = async () => {
//   try {
//     // Check ChromaDB health
//     const chromaHealthy = await checkVectorDBHealth();
//     if (!chromaHealthy) {
//       console.error(
//         "❌ ChromaDB is not running. Start it with: docker-compose up -d"
//       );
//       process.exit(1);
//     }

//     // Initialize Vector DB
//     await initializeVectorDB();

//     // Seed training data (if empty)
//     await seedTrainingData();

//     // Check Ollama status
//     const ollamaReady = await checkOllamaStatus();
//     if (!ollamaReady) {
//       console.warn("⚠️ Ollama is not ready. Start it with: ollama serve");
//     }

//     // Start IMAP connections
//     await startIMAPConnections();

//     // Start background recategorization job only if Ollama is ready
//     if (ollamaReady) {
//       startRecategorizationJob();
//     }

//     // Start Express server
//     app.listen(PORT, () => {
//       console.log(`🚀 Server started on port: ${PORT}`);
//     });
//   } catch (error: any) {
//     console.error("❌ Server startup failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();

// ****************************

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// import emailRouter from "./routes/email.route";
// import { startIMAPConnections } from "./startup/imapStartup";
// import { startRecategorizationJob } from "./ai/reCategorizejob";
// import { checkOllamaStatus } from "./ai/ollamaAiCategorization";

// import {
//   initializeVectorDB,
//   seedTrainingData,
//   checkVectorDBHealth,
// } from "./services/vectorStore";
// import testRouter from "./routes/test.route";
// import accountRouter from "./ai/account.routes";
// import { fixFoldersForAccount } from "./update/updateFolderForAccounts";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const app = express();
// app.use(express.json());

// // Use CORS middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

// // routes

// app.use("/emails", emailRouter);
// app.use("/accounts", accountRouter);

// // ---------- Server Startup ----------
// const startServer = async () => {
//   try {
//     // Check ChromaDB health
//     const chromaHealthy = await checkVectorDBHealth();
//     if (!chromaHealthy) {
//       console.error(
//         "❌ ChromaDB is not running. Start it with: docker-compose up -d"
//       );
//       process.exit(1);
//     }

//     // Initialize Vector DB
//     await initializeVectorDB();

//     // Seed training data (if empty)
//     await seedTrainingData();

//     // Check Ollama status
//     const ollamaReady = await checkOllamaStatus();
//     if (!ollamaReady) {
//       console.warn("⚠️ Ollama is not ready. Start it with: ollama serve");
//     }

//     // Start IMAP connections
//     await startIMAPConnections();

//     // Start background recategorization job only if Ollama is ready
//     if (ollamaReady) {
//       startRecategorizationJob();
//     }

//     // Start Express server
//     app.listen(PORT, () => {
//       console.log(`🚀 Server started on port: ${PORT}`);
//     });
//   } catch (error: any) {
//     console.error("❌ Server startup failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();

// ****************************

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import emailRouter from "./routes/email.route";
import { startIMAPConnections } from "./startup/imapStartup";
import { startRecategorizationJob } from "./ai/reCategorizejob";
import { checkOllamaStatus } from "./ai/ollamaAiCategorization";

import {
  initializeVectorDB,
  seedTrainingData,
  checkVectorDBHealth,
} from "./services/vectorStore";

import testRouter from "./routes/test.route";
import accountRouter from "./ai/account.routes";
import { fixFoldersForAccount } from "./update/updateFolderForAccounts";
import { connectMongo } from "./config/mongo";
import authRouter from "./routes/auth.routes";
import syncRouter from "./routes/syncRoutes";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Routes
app.use("/emails", emailRouter);
app.use("/accounts", accountRouter);
app.use("/auth", authRouter);
app.use("/sync", syncRouter);
app.use("/test", testRouter);

// ---------------- BACKGROUND JOBS STARTER ----------------
// const startBackgroundJobs = async () => {
//   try {
//     console.log("🔍 Checking ChromaDB health...");
//     const chromaHealthy = await checkVectorDBHealth();
//     if (!chromaHealthy) {
//       console.error(
//         "❌ ChromaDB not running. Start with: docker-compose up -d"
//       );
//       return; // Do NOT exit server, keep frontend alive
//     }

//     console.log("📦 Initializing Vector DB...");
//     await initializeVectorDB();

//     console.log("🌱 Seeding training data (if needed)...");
//     await seedTrainingData();

//     console.log("🤖 Checking Ollama status...");
//     const ollamaReady = await checkOllamaStatus();

//     // console.log("📬 Starting IMAP connections...");
//     // await startIMAPConnections();

//     // if (ollamaReady) {
//     //   console.log("🔁 Starting Background Recategorization Job...");
//     //   startRecategorizationJob();
//     // } else {
//     //   console.warn("⚠️ Recategorization skipped — Ollama not ready");
//     // }

//     // console.log("✅ Background jobs started successfully!");
//   } catch (error: any) {
//     console.error("❌ Failed to start background jobs:", error.message);
//   }
// };

// ---------------- SERVER STARTUP ----------------
const startServer = async () => {
  try {
    // Connect to MongoDB first
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ MongoDB connected successfully!");

    // Start Express server
    app.listen(PORT, async () => {
      console.log(`🚀 Server started on port: ${PORT}`);
      // console.log("⏳ Starting background services...");
      // startBackgroundJobs(); // Start after server is running
      // await startIMAPConnections();
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

// Start the server
startServer();
