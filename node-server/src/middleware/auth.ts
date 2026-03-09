import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const prisma = new PrismaClient();

export interface JwtPayload {
  userId: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** For GET requests: allow unauthenticated access, use default user (moezaky) when no token. */
export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
      return;
    } catch {
      // fall through to default user
    }
  }
  const defaultUser = await prisma.user.findUnique({ where: { username: 'moezaky' } });
  if (defaultUser) {
    req.user = { userId: defaultUser.id, username: defaultUser.username };
  }
  next();
}
