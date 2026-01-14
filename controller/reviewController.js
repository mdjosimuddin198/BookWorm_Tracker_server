import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

export const postReview = async (req, res) => {
  const { userEmail, bookId, comment } = req.body;

  if (!bookId || !comment)
    return res.status(400).json({ message: "bookId and comment required" });

  const db = await connectDB();
  const books = await db.collection("books");

  try {
    await books.updateOne(
      { _id: new ObjectId(bookId) },
      {
        $push: {
          reviews: {
            userEmail,
            comment,
            approved: false, // admin needs to approve
            createdAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({ message: "Review submitted for approval" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
