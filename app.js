// app.js
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/posts.routes.js";
import morgan from "morgan";
import cloudinary from "cloudinary";
import bookingRoute from "./src/routes/booking.routes.js";
import productRouter from "./src/routes/product.routes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080", // Match your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow credentials (cookies, etc.)
  },
});

// CORS configuration with credentials support
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080", // Match your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in production
      httpOnly: true,
      sameSite: "lax", // Adjust as needed
    },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Body Parser and Morgan
app.use(bodyParser.json());
app.use(morgan("tiny"));

const api = process.env.API_URL;
// API Routes
app.use(`${api}/auth`, authRoutes);
app.use(`${api}/posts`, postRoutes);
app.use(`${api}/booking`, bookingRoute);
app.use(`${api}/products`, productRouter);

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Default Route - Should be last
app.get("/", (req, res) => {
  res.send("Welcome to Oldfox API");
});

// Export only app and httpServer
export { app, httpServer };