import connectToDatabase from '../../utils/db.js';
import Expense from '../../models/Expense.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    await connectToDatabase();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { category, amount, description, date } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const expense = new Expense({
      user: userId,        // associate expense with user
      category,
      amount,
      description,
      date: new Date(date),
    });

    await expense.save();

    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    console.error('Error saving expense:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
