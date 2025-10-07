import connectToDatabase from "../../utils/db.js";
import Expense from "../../models/Expense.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];

  const { id, category, amount, description, date } = req.body;

  if (!id || !category || amount == null || !description || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    // Make sure the expense belongs to this user
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (expense.user.toString() !== user.id) {
      return res.status(403).json({ error: "Forbidden: Not your expense" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { category, amount, description, date },
      { new: true }
    );

    res.status(200).json({ message: "Expense updated successfully", expense: updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    res.status(500).json({ error: "Failed to update expense" });
  }
}
