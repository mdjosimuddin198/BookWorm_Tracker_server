import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import reviewRoutes from "./routes/review.js";
import shelfRoutes from "./routes/shelf.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import videoRoutes from "./routes/video.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/shelf", shelfRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api", videoRoutes);
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("bookworm server is running successfully...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
