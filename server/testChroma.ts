import { ChromaClient } from "chromadb";

(async () => {
  try {
    const client = new ChromaClient({ path: "http://localhost:8000" });
    const collections = await client.listCollections();
    console.log("✅ ChromaDB is reachable. Collections:", collections);
  } catch (error) {
    console.error("❌ Cannot connect to ChromaDB:", error);
  }
})();
