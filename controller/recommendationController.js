import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

export const getRecommendation = async (req, res) => {
  try {
    const { email } = req.query; // query param: ?email=user@gmail.com
    if (!email) return res.status(400).json({ message: "Email is required" });

    const db = await connectDB();
    const shelves = db.collection("shelves");
    const books = db.collection("books");

    // Find user
    const user = await shelves.findOne({ userEmail: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert bookIds to ObjectId for queries
    const readBooks = (user.read || []).map((b) => new ObjectId(b.bookId));
    const wantBooks = (user.want || []).map((b) => new ObjectId(b.bookId));
    const readingBooks = (user.reading || []).map(
      (b) => new ObjectId(b.bookId)
    );

    const excludedBooks = [...readBooks, ...wantBooks, ...readingBooks];

    // ---------------------------
    // Personalized recommendation
    // ---------------------------
    if (readBooks.length >= 3) {
      const readBookDocs = await books
        .find({ _id: { $in: readBooks } })
        .toArray();

      // Count genres
      const genreCount = {};
      readBookDocs.forEach((book) => {
        (book.genres || []).forEach((g) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      });

      // Top 2 genres
      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([g]) => g);

      // Candidate books from top genres excluding already interacted books
      const candidates = await books
        .find({ genres: { $in: topGenres }, _id: { $nin: excludedBooks } })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(20)
        .toArray();

      const recommendations = candidates.map((book) => {
        const matchedGenres = (book.genres || []).filter((g) =>
          topGenres.includes(g)
        );
        return {
          ...book,
          why: `Matches your preference for ${matchedGenres.join(", ")} (${
            matchedGenres.length
          } books read)`,
        };
      });

      // Remove duplicates if any (safety)
      const uniqueMap = new Map();
      recommendations.forEach((book) =>
        uniqueMap.set(book._id.toString(), book)
      );

      return res.json(Array.from(uniqueMap.values()).slice(0, 12));
    }

    // ---------------------------
    // Fallback: user read < 3 books
    // ---------------------------
    const popularBooks = await books
      .find({ _id: { $nin: excludedBooks } })
      .sort({ rating: -1, shelfCount: -1 })
      .limit(10)
      .toArray();

    const randomBooks = await books
      .aggregate([
        { $match: { _id: { $nin: excludedBooks } } },
        { $sample: { size: 10 } }, // sample more for better selection
      ])
      .toArray();

    // Combine and remove duplicates
    const combined = [...popularBooks, ...randomBooks];
    const uniqueMap = new Map();
    combined.forEach((book) => uniqueMap.set(book._id.toString(), book));

    const fallbackBooks = Array.from(uniqueMap.values()).map((book) => ({
      ...book,
      why: "Popular book or recommended for new readers",
    }));

    return res.json(fallbackBooks.slice(0, 12));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};
