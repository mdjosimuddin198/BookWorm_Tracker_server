import connectDB from "../config/db.js";

export const postShlef = async (req, res) => {
  const { userEmail, bookId, shelfType, totalPages, pagesRead } = req.body;
  // shelfType: 'want' | 'reading' | 'read'

  if (!userEmail || !bookId || !shelfType) {
    return res
      .status(400)
      .json({ message: "userEmail, bookId and shelfType required" });
  }

  const db = await connectDB();
  const shelves = db.collection("shelves");

  try {
    await shelves.updateOne(
      { userEmail },
      {
        $pull: {
          want: { bookId },
          reading: { bookId },
          read: { bookId },
        },
      },
      { upsert: true }
    );

    // 👉 WANT
    if (shelfType === "want") {
      await shelves.updateOne(
        { userEmail },
        { $addToSet: { want: { bookId, addedAt: new Date() } } },
        { upsert: true }
      );
    }

    // 👉 READING
    if (shelfType === "reading") {
      if (!totalPages || pagesRead === undefined) {
        return res.status(400).json({
          message: "totalPages and pagesRead required for reading shelf",
        });
      }

      if (pagesRead >= totalPages) {
        await shelves.updateOne(
          { userEmail },
          { $addToSet: { read: { bookId, finishedAt: new Date() } } },
          { upsert: true }
        );
      } else {
        await shelves.updateOne(
          { userEmail },
          {
            $addToSet: {
              reading: {
                bookId,
                totalPages,
                pagesRead,
                startedAt: new Date(),
              },
            },
          },
          { upsert: true }
        );
      }
    }

    // 👉 READ
    if (shelfType === "read") {
      await shelves.updateOne(
        { userEmail },
        { $addToSet: { read: { bookId, finishedAt: new Date() } } },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "Shelf updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getShelf = async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ message: "userEmail is required" });
  }

  try {
    const db = await connectDB();
    const shelves = db.collection("shelves");

    const data = await shelves.findOne({ userEmail });

    if (!data) {
      return res.json({
        want: [],
        reading: [],
        read: [],
      });
    }

    // reading shelf-এ progress % calculate
    const readingWithProgress = data.reading?.map((book) => ({
      ...book,
      progressPercent: Math.round((book.pagesRead / book.totalPages) * 100),
    }));

    res.json({
      want: data.want || [],
      reading: readingWithProgress || [],
      read: data.read || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
