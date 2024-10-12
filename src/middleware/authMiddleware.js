import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js"; // Import User model

dotenv.config();

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) throw new Error("Access denied. Token is missing.");

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT secret is not defined."); // Handle case where secret is undefined
    }

    const decodedToken = jwt.verify(token.split(" ")[1], secret);

    const foundUser = await User.findById(decodedToken.userId).select("isAdmin profile"); // Selecting necessary fields
    if (!foundUser) {
      throw new Error("User not found.");
    }

    req.user = foundUser; // Directly assign the found user

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  
  next();
};

export { authenticateToken };
