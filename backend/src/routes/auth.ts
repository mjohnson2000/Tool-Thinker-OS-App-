import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { generateToken, verifyToken } from '../utils/token';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const resetPasswordSchema = z.object({
  email: z.string().email()
});

// Profile update schema
const profileUpdateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  profilePic: z.string().max(1000000).optional()
});

// Signup route
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Create verification token
    const verificationToken = generateToken();

    // Create new user
    const user = new User({
      email,
      password,
      verificationToken
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate auth token
    const token = user.generateAuthToken();

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          email: user.email,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate auth token
    const token = user.generateAuthToken();

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          profilePic: user.profilePic,
          isVerified: user.isVerified,
          isSubscribed: user.isSubscribed,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });
    // Generate token and expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expiry);
    await user.save();
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetUrl = `http://localhost:5173/reset-password/${token}`; // adjust frontend URL as needed
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
    res.json({ message: 'Reset email sent' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      throw new AppError(400, 'Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Token validation route
router.get('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token); // returns { id: string }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          name: user.name,
          profilePic: user.profilePic,
          isVerified: user.isVerified,
          isSubscribed: user.isSubscribed,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Middleware to authenticate user via JWT
function requireAuth(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError(401, 'No token provided');
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token); // returns { id: string }
    req.userId = decoded.id;
    next();
  } catch (err) {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

console.log('Registering PATCH /profile');
router.patch('/profile', requireAuth, async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  try {
    const { name, profilePic } = profileUpdateSchema.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) throw new AppError(404, 'User not found');
    if (name !== undefined) user.name = name;
    if (profilePic !== undefined) user.profilePic = profilePic;
    await user.save();
    res.json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          name: user.name,
          profilePic: user.profilePic,
          isVerified: user.isVerified,
          isSubscribed: user.isSubscribed,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter }; 