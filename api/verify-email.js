// api/verify-email.js
import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'GET', 'OPTIONS'],
    origin: '*',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.method === 'POST' ? req.body.token : req.query.token;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: 'Email already verified. You can now log in.' 
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      message: 'Email verified successfully! You can now log in.',
      verified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Server error during verification' });
  }
}
