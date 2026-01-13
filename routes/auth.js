import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";
import connectDB from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, profileImage } = req.body;
  const db = await connectDB();
  const users = await db.collection("users");

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({
      name,
      email,
      password: hashedPassword,
      profileImage,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const users = await db.collection("users");

  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected route
router.get("/profile", authMiddleware, async (req, res) => {
  const db = await connectDB();
  const users = await db.collection("users");
  const user = await users.findOne({ _id: req.userId });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ id: user._id, name: user.name, email: user.email });
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
