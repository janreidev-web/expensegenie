// api/signup.js
import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
    origin: '*', // Change to your frontend URL in production
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
