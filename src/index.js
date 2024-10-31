// index.js
import app from "../app.js";
import { connectToDatabase } from "../src/config/databaseConnection.js";
import "dotenv/config";

// Connect to the database
connectToDatabase();

// Export the app for Vercel's serverless environment
export default app;
