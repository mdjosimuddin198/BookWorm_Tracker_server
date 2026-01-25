import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

export const postReview = async (req, res) => {
  const { userEmail, userImage, bookId, comment } = req.body;

  if (!bookId || !comment)
    return res.status(400).json({ message: "id and comment required" });

  const db = await connectDB();
  const books = await db.collection("books");

  try {
    await books.updateOne(
      { _id: new ObjectId(bookId) },
      {
        $push: {
          reviews: {
            userEmail,
            userImage,
            comment,
            approved: false,
            createdAt: new Date(),
          },
        },
      },
    );

    res.status(200).json({ message: "Review submitted for approval" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approvedReview = async (req, res) => {
  const { id, index } = req.params;
  const idx = parseInt(index);

  const db = await connectDB();
  const books = await db.collection("books");
  const book = await books.findOne({
    _id: new ObjectId(id),
  });

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews || !book.reviews[idx]) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (book.reviews[idx].approved) {
    return res.status(400).json({ message: "Review already approved" });
  }
  const updateField = {};
  updateField[`reviews.${idx}.approved`] = true;

  await books.updateOne({ _id: new ObjectId(id) }, { $set: updateField });

  res.status(200).json({
    message: "Review approved successfully",
  });
};

export const deleteReview = async (req, res) => {
  try {
    const { bookId, index } = req.params;
    const reviewIndex = parseInt(index);

    if (isNaN(reviewIndex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review index",
      });
    }

    const db = await connectDB();
    const books = db.collection("books");

    const book = await books.findOne({
      _id: new ObjectId(bookId),
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (reviewIndex < 0 || reviewIndex >= book.reviews.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid review index",
      });
    }

    //  Step 1: index এ null বসানো
    await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $unset: { [`reviews.${reviewIndex}`]: 1 } },
    );

    // Step 2: null remove করা
    await books.updateOne(
      { _id: new ObjectId(bookId) },
      { $pull: { reviews: null } },
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
