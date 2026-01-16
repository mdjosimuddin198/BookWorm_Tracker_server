import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

export const getVideos = async (req, res) => {
  const db = await connectDB();
  const videos = await db.collection("videos");
  const result = await videos.find().toArray();
  res.send(result);
};

export const updateVideos = async (req, res) => {
  const db = await connectDB();
  const videos = await db.collection("videos");
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateData = req.body;
  const updateDoc = {
    $set: updateData,
  };
  const result = await videos.updateOne(filter, updateDoc, option);
  res.send(result);
};
