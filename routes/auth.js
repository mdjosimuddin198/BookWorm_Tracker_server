import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getProfile,
  loginUser,
  registerUser,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected route
router.get("/profile", authMiddleware, getProfile);

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
