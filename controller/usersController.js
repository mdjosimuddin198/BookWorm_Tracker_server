import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

export const getUsers = async (req, res) => {
  const db = await connectDB();
  const usersCollection = db.collection("users");
  const result = await usersCollection.find().toArray();
  res.send(result);
};

export const updateUserRole = async (req, res) => {
  const db = await connectDB();
  const usersCollection = db.collection("users");
  const { id } = req.params;
  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const newRole = user.role === "admin" ? "user" : "admin";

  await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: newRole } },
  );

  res.send({
    success: true,
    message: `Role updated to ${newRole}`,
    role: newRole,
  });
};
