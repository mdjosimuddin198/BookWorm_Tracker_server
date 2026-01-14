import express from "express";
import { postReview } from "../controller/reviewController.js";

const router = express.Router();

router.post("/add", postReview);

export default router;
