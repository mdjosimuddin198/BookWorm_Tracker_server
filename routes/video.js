import express from "express";
import { getVideos, updateVideos } from "../controller/videoController.js";
const router = express.Router();

router.get("/videos", getVideos);
router.put("/videos/:id", updateVideos);

export default router;
