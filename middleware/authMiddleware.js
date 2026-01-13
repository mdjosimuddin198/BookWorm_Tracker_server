import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = new ObjectId(decoded.id); // MongoDB needs ObjectId
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
