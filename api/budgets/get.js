const connectToDatabase = require('../../utils/db.js');
const Budget = require('../../models/Budget.js');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    // Find or create budget for this user
    let userBudget = await Budget.findOne({ user: decoded.id });
    
    if (!userBudget) {
      // Create default budgets for new users
      userBudget = await Budget.create({
        user: decoded.id,
        budgets: {
          Food: 5000,
          Education: 3000,
          Clothing: 2000,
          Housing: 10000,
          'Personal Needs': 2000,
          Healthcare: 3000,
          Leisure: 2000,
          Bills: 5000,
          Other: 1000
        }
      });
    }

    // Convert Map to plain object
    const budgetsObject = userBudget.budgets instanceof Map 
      ? Object.fromEntries(userBudget.budgets)
      : userBudget.budgets;

    return res.status(200).json({ budgets: budgetsObject });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error fetching budgets' });
  }
}
