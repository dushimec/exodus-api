// user route
import { Router } from "express";
const authRoutes = Router();
import {
  signup,
  login,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
  makePayment,
  getUserCount,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/users/:id", authenticateToken, getUserById);
authRoutes.get("/", authenticateToken, getAllUsers);
authRoutes.get("/count", authenticateToken, getUserCount);
authRoutes.put("/users/:id", authenticateToken, updateUserById);
authRoutes.delete("/users/:id", authenticateToken, deleteUserById);

export default authRoutes;
