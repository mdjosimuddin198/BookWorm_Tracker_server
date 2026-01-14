import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getShelf, postShlef } from "../controller/shelfController.js";

const router = express.Router();

router.post("/add-or-update", postShlef);
router.get("/add-or-update", getShelf);

export default router;
