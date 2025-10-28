const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { goalName, goalAmount, months, plan, pricingInfo } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expensetracker');
    const goalsCollection = db.collection('goals');

    const newGoal = {
      userId,
      goalName,
      goalAmount,
      months,
      targetDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000), // Approximate
      currentSavings: 0,
      plan: plan,
      pricingInfo: pricingInfo || null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await goalsCollection.insertOne(newGoal);
    await client.close();

    return res.status(200).json({ message: 'Goal saved successfully', goal: newGoal });
  } catch (error) {
    console.error('[Save Goal] Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error saving goal' });
  }
}
