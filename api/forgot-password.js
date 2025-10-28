import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'OPTIONS'],
    origin: '*',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, always return success even if user doesn't exist
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, user.username, resetToken);
    
    if (!emailResult.success) {
      console.error('[Forgot Password] Failed to send email:', emailResult.error);
      return res.status(500).json({ 
        error: 'Failed to send reset email. Please try again later.' 
      });
    }

    return res.status(200).json({ 
      message: 'Password reset instructions have been sent to your email.' 
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error.message);
    return res.status(500).json({ error: 'Server error during password reset request' });
  }
}
