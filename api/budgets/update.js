import connectToDatabase from '../../utils/db.js';
import Budget from '../../models/Budget.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const { budgets } = req.body;

  if (!budgets || typeof budgets !== 'object') {
    return res.status(400).json({ error: 'Invalid budgets data' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Budget Update] Decoded user ID:', decoded.id);
    console.log('[Budget Update] Budgets to update:', budgets);
    
    await connectToDatabase();

    // Update or create budget
    const userBudget = await Budget.findOneAndUpdate(
      { user: decoded.id },
      { budgets },
      { new: true, upsert: true, runValidators: true }
    );

    console.log('[Budget Update] Budget updated successfully for user:', decoded.id);

    const budgetsObject = userBudget.budgets instanceof Map 
      ? Object.fromEntries(userBudget.budgets)
      : userBudget.budgets;

    return res.status(200).json({ 
      message: 'Budgets updated successfully',
      budgets: budgetsObject 
    });
  } catch (error) {
    console.error('[Budget Update] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    return res.status(500).json({ error: 'Server error updating budgets', details: error.message });
  }
}
