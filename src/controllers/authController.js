import dotenv from "dotenv";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";
import { getDataUri } from "../utils/getDatauri.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "User with that email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudinaryResult = await cloudinaryUpload(fileUri.content);
      newUser.profile = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    }

    const savedUser = await newUser.save();
    const userWithoutPassword = { ...savedUser.toObject(), password: undefined };
    res.status(201).json({ user: userWithoutPassword, message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      if (user.profile && user.profile.public_id) {
        await cloudinaryDelete(user.profile.public_id);
      }

      const fileUri = getDataUri(req.file);
      const cloudinaryResult = await cloudinaryUpload(fileUri.content);
      req.body.profile = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profile && user.profile.public_id) {
      await cloudinaryDelete(user.profile.public_id);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required" });
    }

    const users = await User.find().select("-password");
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfileFromToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Reset link sent to email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logged out successfully." });
};

export {
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
};
