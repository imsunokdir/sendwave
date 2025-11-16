import { seedTrainingData } from "./vectorStore";

(async () => {
  try {
    await seedTrainingData();
    console.log("✅ Training data seeded!");
  } catch (err) {
    console.error("❌ Failed to seed training data:", err);
  }
})();
