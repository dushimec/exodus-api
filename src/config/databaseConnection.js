import mongoose from "mongoose";
require("dotenv").config();

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
