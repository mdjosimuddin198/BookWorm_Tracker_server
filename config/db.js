import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

const connectDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("MongoDB connected");
  }
  return db;
};

export default connectDB;
