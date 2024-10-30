import mongoose from "mongoose";
import 'dotenv/config';

export const connectToDatabase = async () => {
  const DB = process.env.DB_URL; // Ensure this variable is set in your .env file

  try {
    await mongoose.connect(DB, {
      // Connection options
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true, // Use the new server discovery and monitoring engine
      connectTimeoutMS: 30000, // Set connection timeout to 30 seconds
      socketTimeoutMS: 60000, // Keep socket open for 60 seconds
      retryWrites: true, // Enable retryable writes
      writeConcern: { w: 1, j: true } // Adjust write concern for acknowledgments
    });
    
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
