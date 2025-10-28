// api/resend-verification.js
import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

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

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, a verification email has been sent.' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        error: 'Email is already verified. You can log in now.' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.username, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please try again later.' 
      });
    }

    return res.status(200).json({ 
      message: 'Verification email sent successfully. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
