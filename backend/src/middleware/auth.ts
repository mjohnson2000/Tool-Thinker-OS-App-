import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
  };
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isSubscribed: user.isSubscribed
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default auth; 