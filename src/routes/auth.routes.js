import { Router } from "express";
import {
  signup,
  login,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
  getUserCount,
  getProfileFromToken,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import passport from "passport";
import { singleUpload } from "../utils/multer.js";

const authRoutes = Router();

authRoutes.post("/signup", singleUpload, signup);
authRoutes.post("/login", login);
authRoutes.get("/users/:id", authenticateToken, getUserById);
authRoutes.get("/", authenticateToken, getAllUsers);
authRoutes.get("/count", authenticateToken, getUserCount);
authRoutes.put("/users/:id", authenticateToken, updateUserById);
authRoutes.delete("/users/:id", authenticateToken, deleteUserById);
authRoutes.get("/profile", authenticateToken, getProfileFromToken);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

authRoutes.get("/logout", logout);

export default authRoutes;
