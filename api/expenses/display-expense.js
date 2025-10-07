import connectToDatabase from "../../utils/db.js";
import Expense from "../../models/Expense.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    // Fetch only this user's expenses
    const expenses = await Expense.find({ user: user.id }).sort({ date: -1 });

    res.status(200).json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
}
