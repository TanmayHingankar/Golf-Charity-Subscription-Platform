import express from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { requireSubscription } from '../middlewares/subscriptionGuard';
import { getUserScores, addScore } from '../services/scoreService';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

router.use(authenticateJWT, requireSubscription);

router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const scores = await getUserScores(userId);
    res.json({ scores });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validate(z.object({ body: z.object({ value: z.number().int().min(1).max(45), played_at: z.string() }) })),
  async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const { value, played_at } = (req as any).validated.body;
    const score = await addScore(userId, Number(value), played_at);
    res.status(201).json({ score });
  } catch (error) {
    next(error);
  }
  }
);

export default router;
