import express from "express";
import bodyParser from "body-parser";
import { connectToDatabase } from "./src/config/databaseConnection.js";
import session from "express-session";
import passport from "passport";
import authRoutes from "./src/routes/auth.routes.js";
import postRoutes from "./src/routes/posts.routes.js";
import morgan from "morgan";
import cloudinary from "cloudinary";
import bookingRoute from "./src/routes/booking.routes.js";
import productRouter from "./src/routes/product.routes.js";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", (req, res) => {
  res.send("Welcome to Exodus API");
});

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(morgan("tiny"));

connectToDatabase();

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/booking", bookingRoute);
app.use("/products", productRouter);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
