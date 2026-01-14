import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  deleteBook,
  getBook,
  getBooks,
  postBook,
  updateBook,
} from "../controller/booksController.js";

// authMiddleware add

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getBook);

router.post("/", postBook);

router.patch("/:id", updateBook);

router.delete("/:id", deleteBook);

export default router;
