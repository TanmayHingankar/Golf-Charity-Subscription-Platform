import express from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import db from '../config/db';
import { charityAnalytics } from '../services/charityService';

const router = express.Router();
router.use(authenticateJWT, requireRole(['admin']));

router.get('/users', async (_req, res, next) => {
  try {
    const users = await db('users').select('id', 'email', 'role', 'created_at', 'is_subscribed');
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', async (_req, res, next) => {
  try {
    const totalUsers = await db('users').count('id as count').first();
    const activeSubs = await db('subscriptions').where({ status: 'active' }).count('id as count').first();
    const drawCount = await db('draws').count('id as count').first();
    const donations = await charityAnalytics();
    res.json({ totalUsers: totalUsers?.count || 0, activeSubs: activeSubs?.count || 0, drawCount: drawCount?.count || 0, donations });
  } catch (err) {
    next(err);
  }
});

export default router;
