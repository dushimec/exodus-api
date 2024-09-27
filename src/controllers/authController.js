import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// creating user registration
const signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const emailExists = await User.findOne({ email });
    const userExists = await User.findOne({ username });

    if (!name || !email || !username || !password) {
      throw new Error("Please fill all field to create account");
    }

    if (emailExists) throw new Error("User witht that email already exists");
    if (userExists) throw new Error("User with that username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, username, password: hashedPassword });
    await user.save();
    res
      .status(201)
      .json({ user, message: "User created successfully" })
      .select("-password");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// login page
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );
    res.json({ token, user }).select(-password);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admini privileges required" });
    }
    const user = await User.find();
    if (!user) {
      return res.status(404).json({ message: "No User found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update user by ID
const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get numbars of users
const getUserCount = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(404)
        .json({ message: "Access denied. Admin Previleges required" });
    }
    // const userCount = await User.countDocuments();
    // res.status(200).json({userCount})

    const userCount = await User.aggregate([
      {
        $group: { _id: null, count: { $sum: 1 } },
      },
    ]);
    if (userCount.length > 0) {
      res.json({ userCount: userCount[0].count });
    } else {
      res.json({ userCount: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signup,
  login,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
  getUserCount,
};
