import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

export const getBooks = async (req, res) => {
  try {
    const db = await connectDB();
    const books = await db.collection("books").find().toArray();

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const db = await connectDB();
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(id) });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postBook = async (req, res) => {
  try {
    const { title, author, genres, description, cover, pages, publishedYear } =
      req.body;

    // Basic validation
    if (!title || !author || !genres || genres.length === 0) {
      return res.status(400).json({
        message: "Title, author and at least one genre are required",
      });
    }

    const db = await connectDB();

    const newBook = {
      title,
      author,
      cover: cover || "",
      genres, // array
      description: description || "",
      pages: pages || null,
      publishedYear: publishedYear || null,

      // auto/default fields
      rating: 0,
      totalRatings: 0,
      shelfCount: 0,
      reviews: [],
      userId: req.userId, // 🔐 who added the book
      createdAt: new Date(),
    };

    const result = await db.collection("books").insertOne(newBook);

    res.status(201).json({
      message: "Book added successfully",
      bookId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const { title, author, genres, description, cover, pages, publishedYear } =
      req.body;

    // Prevent empty update
    if (
      !title &&
      !author &&
      !genres &&
      !description &&
      !cover &&
      !pages &&
      !publishedYear
    ) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const db = await connectDB();

    const updateDoc = {
      ...(title && { title }),
      ...(author && { author }),
      ...(genres && { genres }),
      ...(description && { description }),
      ...(cover && { cover }),
      ...(pages && { pages }),
      ...(publishedYear && { publishedYear }),
      updatedAt: new Date(),
    };

    const result = await db.collection("books").updateOne(
      {
        _id: new ObjectId(id),
        userId: req.userId, // 🔐 only owner can edit
      },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const db = await connectDB();
    const result = await db.collection("books").deleteOne({
      _id: new ObjectId(id),
      userId: req.userId, // 🔐 owner only
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or unauthorized" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
