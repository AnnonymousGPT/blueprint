import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: 'CLIENT' | 'ADMIN' | 'EXPERT';
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      id: string;
      phone: string;
      role: 'CLIENT' | 'ADMIN' | 'EXPERT';
    };

    // Verify user exists and is ACTIVE
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!dbUser || dbUser.status !== 'ACTIVE' || dbUser.deletedAt) {
      return res.status(403).json({ error: 'User account is suspended or deleted.' });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ error: 'Session expired or invalid token.' });
  }
};

export const requireRole = (roles: Array<'CLIENT' | 'ADMIN' | 'EXPERT'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient authorization level.' });
    }

    return next();
  };
};

