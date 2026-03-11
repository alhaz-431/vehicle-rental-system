import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'Unauthorized: No token provided');
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number; email: string; role: string;
    };
    req.user = decoded;
    next();
  } catch {
    sendError(res, 401, 'Unauthorized: Invalid or expired token');
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    sendError(res, 403, 'Forbidden: Admin access required');
    return;
  }
  next();
};