// routes/recommendationRoutes.js
import express from "express";

import { getRecommendation } from "../controller/recommendationController.js";

const router = express.Router();

// GET /api/recommendations/:userId
router.get("/", getRecommendation);

export default router;
