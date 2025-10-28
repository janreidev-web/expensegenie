const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For GET requests, always return successfully even if there's an error
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(200).json({ goals: [] });
      }

      const token = authHeader.split(' ')[1];
      if (!uri) {
        console.error('[Goals API] MONGODB_URI not configured');
        return res.status(200).json({ goals: [] });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      if (!userId) {
        return res.status(200).json({ goals: [] });
      }

      const client = new MongoClient(uri);
      await client.connect();

      const db = client.db('expensetracker');
      const goalsCollection = db.collection('goals');

      const goals = await goalsCollection
        .find({ userId, status: 'active' })
        .sort({ createdAt: -1 })
        .toArray();

      await client.close();
      return res.status(200).json({ goals: goals || [] });
    } catch (error) {
      console.error('[Goals API] GET error:', error);
      return res.status(200).json({ goals: [] });
    }
  }

  // For POST requests, use normal error handling
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];

  let client;
  
  try {
    // Verify MongoDB URI is configured
    if (!uri) {
      console.error('[Goals API] MONGODB_URI not configured');
      return res.status(500).json({ error: 'Database configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      console.error('[Goals API] userId not found in token');
      return res.status(401).json({ error: 'Invalid token: missing userId' });
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expensetracker');
    const goalsCollection = db.collection('goals');

    // POST - Save goal
    if (req.method === 'POST') {
      try {
        const { goalName, goalAmount, months, plan, pricingInfo } = req.body;

        const newGoal = {
          userId,
          goalName,
          goalAmount,
          months,
          targetDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
          currentSavings: 0,
          plan: plan,
          pricingInfo: pricingInfo || null,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await goalsCollection.insertOne(newGoal);
        return res.status(200).json({ message: 'Goal saved successfully', goal: newGoal });
      } catch (dbError) {
        console.error('[Goals API] Database error on POST:', dbError);
        return res.status(500).json({ error: 'Database error saving goal', details: dbError.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[Goals API] Error:', error.message, error.stack);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Server error', details: error.message });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('[Goals API] Error closing connection:', closeError);
      }
    }
  }
}
