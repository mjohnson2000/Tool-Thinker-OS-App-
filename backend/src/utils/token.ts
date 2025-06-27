import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// JWT verification for authentication
export function verifyToken(token: string): { id: string } {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, secret) as { id: string };
} 