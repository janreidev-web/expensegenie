import Cors from 'cors';
import initMiddleware from '../utils/init-middleware.js';
import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendVerificationCodeEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { generateVerificationCode, getCodeExpiry } from '../utils/codeGenerator.js';

const cors = initMiddleware(
  Cors({
    methods: ['POST', 'GET', 'OPTIONS'],
    origin: '*',
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  const { action } = req.query;

  switch (action) {
    case 'signup':
      return handleSignup(req, res);
    case 'login':
      return handleLogin(req, res);
    case 'verify-email':
      return handleVerifyEmail(req, res);
    case 'resend-verification':
      return handleResendVerification(req, res);
    case 'forgot-password':
      return handleForgotPassword(req, res);
    case 'reset-password':
      return handleResetPassword(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// SIGNUP
async function handleSignup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

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
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = getCodeExpiry();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

// LOGIN
async function handleLogin(req, res) {
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in. Check your inbox for the 6-digit verification code.',
        emailNotVerified: true,
        email: user.email,
      });
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
    console.error('[Login] Error:', error.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
}

// VERIFY EMAIL
async function handleVerifyEmail(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = req.method === 'POST' ? req.body.code : req.query.code;
  const token = req.method === 'POST' ? req.body.token : req.query.token;

  if (!code && !token) {
    return res.status(400).json({ error: 'Verification code or token is required' });
  }

  if (code && (!/^\d{6}$/.test(code))) {
    return res.status(400).json({ error: 'Invalid code format. Code must be 6 digits.' });
  }

  try {
    await connectToDatabase();

    let user;

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

    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: 'Email already verified. You can now log in.' 
      });
    }

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

// RESEND VERIFICATION
async function handleResendVerification(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, a verification email has been sent.' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        error: 'Email is already verified. You can log in now.' 
      });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = getCodeExpiry();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    const emailResult = await sendVerificationCodeEmail(email, user.username, verificationCode);
    
    if (!emailResult.success) {
      console.error('[Resend] Failed to send verification email:', emailResult.error);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please try again later.' 
      });
    }

    return res.status(200).json({ 
      message: 'Verification email sent successfully. Please check your inbox.' 
    });
  } catch (error) {
    console.error('[Resend] Error:', error.message);
    return res.status(500).json({ error: 'Server error during resend' });
  }
}

// FORGOT PASSWORD
async function handleForgotPassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

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

// RESET PASSWORD
async function handleResetPassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('[Reset Password] Error:', error.message);
    return res.status(500).json({ error: 'Server error during password reset' });
  }
}
