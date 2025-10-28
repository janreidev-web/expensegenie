// api/signup.js
import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, sendVerificationCodeEmail } from '../utils/emailService.js';
import { generateVerificationCode, getCodeExpiry } from '../utils/codeGenerator.js';

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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Validate username
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code (6-digit)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = getCodeExpiry(); // 15 minutes

    // Also keep token for backward compatibility (optional)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
      verificationCode,
      verificationCodeExpires,
    });

    // Send verification code email
    const emailResult = await sendVerificationCodeEmail(email, username, verificationCode);
    
    if (!emailResult.success) {
      console.error('[Signup] Failed to send verification email:', emailResult.error);
    }

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      message: 'Account created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('[Signup] Error:', error.message);
    return res.status(500).json({ error: 'Server error during signup' });
  }
}
