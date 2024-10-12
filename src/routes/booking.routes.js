import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
} from "../controllers/bookingController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const bookingRoute = express.Router();

bookingRoute.post("/:postId", authenticateToken, createBooking);
bookingRoute.get("/", authenticateToken, getBookings);
bookingRoute.get("/:id", authenticateToken, getBookingById);
bookingRoute.put("/:id", authenticateToken, updateBooking);
bookingRoute.delete("/:id", authenticateToken, deleteBooking);
bookingRoute.patch("/:id/cancel", authenticateToken, cancelBooking);
bookingRoute.patch("/:id/approve", authenticateToken, approveBooking);

export default bookingRoute;
