import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductsByCategoryName,
  updateProduct,
  deleteProduct,
  aggregateProductsByCategory,
  getMostOrderedProducts,
  getRecentProducts,
  bookProduct,
  getBookingsByProductId,
  cancelBooking,
  getAllBookings,
} from "../controllers/productController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { singleUpload } from "../utils/multer.js";

const productRouter = express.Router();

// Product routes
productRouter.post("/", singleUpload,authenticateToken, createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/category/:category", getProductsByCategoryName);
productRouter.put("/:id", authenticateToken, updateProduct);
productRouter.delete("/:id", authenticateToken, deleteProduct);
productRouter.get("/aggregate", authenticateToken, aggregateProductsByCategory);
productRouter.get("/most-ordered", authenticateToken, getMostOrderedProducts);
productRouter.get("/recent", getRecentProducts);

// Booking routes
productRouter.post("/book", authenticateToken, bookProduct);
productRouter.get("/:id/bookings", getBookingsByProductId);
productRouter.delete("/cancel-booking", authenticateToken, cancelBooking);

// Optional: Admin route to get all bookings
productRouter.get("/bookings", authenticateToken, getAllBookings);

export default productRouter;
