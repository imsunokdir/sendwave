import mongoose from "mongoose";

export const connectMongo = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Mongo uri not found in .env");
    }

    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error");
    process.exit(1);
  }
};
