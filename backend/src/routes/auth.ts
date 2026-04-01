import express from 'express';
import { registerUser, authenticateUser, generateTokens, findUserById, rotateTokens } from '../services/authService';
import { authenticateJWT } from '../middlewares/auth';
import { revokeRefreshToken } from '../services/tokenService';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

router.post(
  '/register',
  validate(z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8) }) })),
  async (req, res, next) => {
  try {
    const { email, password } = (req as any).validated.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await registerUser(email, password);
    const tokens = await generateTokens(user);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, tokens });
  } catch (error) {
    next(error);
  }
  });

router.post(
  '/login',
  validate(z.object({ body: z.object({ email: z.string().email(), password: z.string().min(8) }) })),
  async (req, res, next) => {
  try {
    const { email, password } = (req as any).validated.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await authenticateUser(email, password);
    const tokens = await generateTokens(user);
    res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, tokens });
  } catch (error) {
    next(error);
  }
  });

router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    const { user } = req as any;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const dbUser = await findUserById(user.userId);
    if (!dbUser) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, charity_id: dbUser.charity_id, charity_pct: dbUser.charity_pct, is_subscribed: dbUser.is_subscribed } });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticateJWT, async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const { charity_id, charity_pct } = req.body;
    if (!charity_id || !charity_pct || charity_pct < 10) return res.status(400).json({ message: 'charity_id and charity_pct>=10 required' });
    const [row] = await import('../config/db').then((m) => m.default('users').where({ id: userId }).update({ charity_id, charity_pct }).returning('*'));
    res.json({ user: row });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token, user_id } = req.body;
    if (!refresh_token || !user_id) return res.status(400).json({ message: 'refresh_token and user_id required' });
    const tokens = await rotateTokens(user_id, refresh_token);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticateJWT, async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ message: 'refresh_token required' });
    const userId = (req as any).user.userId;
    await revokeRefreshToken(refresh_token, userId);
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
});

export default router;
