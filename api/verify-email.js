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

  // Support both code (6-digit) and token (backward compatibility)
  const code = req.method === 'POST' ? req.body.code : req.query.code;
  const token = req.method === 'POST' ? req.body.token : req.query.token;

  if (!code && !token) {
    return res.status(400).json({ error: 'Verification code or token is required' });
  }

  // Validate 6-digit code format
  if (code && (!/^\d{6}$/.test(code))) {
    return res.status(400).json({ error: 'Invalid code format. Code must be 6 digits.' });
  }

  try {
    await connectToDatabase();

    let user;

    // Try to verify using 6-digit code first
    if (code) {
      user = await User.findOne({ 
        verificationCode: code,
        verificationCodeExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification code. Please request a new verification code.' 
        });
      }
    } 
    // Fall back to token-based verification
    else if (token) {
      user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification token. Please request a new verification email.' 
        });
      }
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: 'Email already verified. You can now log in.' 
      });
    }

    // Mark email as verified and clear verification data
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      message: 'Email verified successfully! You can now log in.',
      verified: true,
    });
  } catch (error) {
    console.error('[Verify Email] Error:', error.message);
    return res.status(500).json({ error: 'Server error during verification' });
  }
}
