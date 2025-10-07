import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    return res.status(500).json({ error: "Server misconfiguration: JWT_SECRET not set" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`Login failed: User with email ${email} not found.`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`Login failed: Incorrect password for email ${email}.`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      token,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Login handler error:", error);
    return res.status(500).json({ error: 'Server error' });
  }
}
