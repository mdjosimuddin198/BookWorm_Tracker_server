import express from "express";
import { getUsers, updateUserRole } from "../controller/usersController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/users", getUsers);
router.patch("/users/:id", updateUserRole);

export default router;
