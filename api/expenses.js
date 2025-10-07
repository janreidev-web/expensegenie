import connectToDatabase from '../utils/db.js';
import Expense from '../models/Expense.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to MongoDB
    await connectToDatabase();

    // Fetch user's expenses from DB
    const expenses = await Expense.find({ user: decoded.id }).sort({ date: -1 });

    return res.status(200).json({ expenses });
  } catch (error) {
    console.error('API Error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    return res.status(500).json({ error: 'Server error fetching expenses' });
  }
}
