import Product from "../models/product.js";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, details } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const uploadResult = await cloudinaryUpload(imageFile.path);
    
    const newProduct = new Product({
      name,
      price,
      details,
      images: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getProductsByCategoryName = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, details } = req.body;
    const imageFile = req.file;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (imageFile) {
      // Delete the old image from Cloudinary
      await cloudinaryDelete(product.images.public_id);

      // Upload the new image to Cloudinary
      const uploadResult = await cloudinaryUpload(imageFile.path);
      product.images.public_id = uploadResult.public_id;
      product.images.url = uploadResult.secure_url;
    }

    product.name = name;
    product.price = price;
    product.details = details;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Delete the image from Cloudinary
    await cloudinaryDelete(product.images.public_id);
    
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const aggregateProductsByCategory = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getMostOrderedProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ bookings: -1 }).limit(10);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getRecentProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const bookProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const { userId } = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.bookings.push({ userId });
    await product.save();

    res.status(200).json({ message: "Product booked successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getBookingsByProductId = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("bookings.userId");

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(product.bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { productId } = req.body;
    const { userId } = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.bookings = product.bookings.filter(booking => booking.userId.toString() !== userId);
    await product.save();

    res.status(200).json({ message: "Booking canceled successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const products = await Product.find().populate("bookings.userId");
    const allBookings = products.flatMap(product => product.bookings);
    res.status(200).json(allBookings);
  } catch (error) {
    res.status(500).json({ message: error.message || "An unknown error occurred." });
  }
};
