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


/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the product
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of all products
 */

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category name
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: Products in the specified category
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/aggregate:
 *   get:
 *     summary: Aggregate products by category
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Aggregated products by category
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/most-ordered:
 *   get:
 *     summary: Get the most ordered products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of the most ordered products
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/recent:
 *   get:
 *     summary: Get the most recent products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of the most recent products
 */

/**
 * @swagger
 * /products/book:
 *   post:
 *     summary: Book a product
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Product booked successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /products/{id}/bookings:
 *   get:
 *     summary: Get all bookings for a product
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Bookings for the specified product
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/cancel-booking:
 *   delete:
 *     summary: Cancel a product booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking canceled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /products/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of all bookings
 *       401:
 *         description: Unauthorized
 */
