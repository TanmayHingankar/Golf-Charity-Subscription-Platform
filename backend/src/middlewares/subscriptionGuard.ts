import { NextFunction, Request, Response } from 'express';
import db from '../config/db';

// Ensures the user has an active subscription
export const requireSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await db('users').select('is_subscribed').where({ id: userId }).first();
  if (!user?.is_subscribed) return res.status(402).json({ message: 'Subscription required' });
  return next();
};
