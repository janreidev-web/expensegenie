// api/signup.js
import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, username, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Note: We don't fail the signup if email fails to send
      // The user can request a new verification email later
    }

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      message: 'Account created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
