import express from "express";
import {
  approvedReview,
  deleteReview,
  postReview,
} from "../controller/reviewController.js";

const router = express.Router();

router.post("/add", postReview);
router.patch("/:id/approve/:index", approvedReview);
router.delete("/:bookId/delete/:index", deleteReview);

export default router;
