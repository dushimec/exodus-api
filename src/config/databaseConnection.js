import mongoose from "mongoose";
import 'dotenv/config'

export const connectToDatabase = async () => {
  const DB = process.env.DB_URL
  try {
    await mongoose.connect(DB, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
