import express from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { createMonthlyDraw, runDraw } from '../services/drawService';

const router = express.Router();

router.use(authenticateJWT);

router.post('/create', requireRole(['admin']), async (req, res, next) => {
  try {
    const method = req.body.method === 'algorithmic' ? 'algorithmic' : 'random';
    const draw = await createMonthlyDraw(method);
    res.status(201).json({ draw });
  } catch (err) {
    next(err);
  }
});

router.post('/:drawId/run', requireRole(['admin']), async (req, res, next) => {
  try {
    const rawDrawId = req.params.drawId;
    const drawId = Array.isArray(rawDrawId) ? rawDrawId[0] : rawDrawId;
    const result = await runDraw(drawId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const draws = await (await import('../config/db')).default('draws').orderBy('created_at', 'desc');
    res.json({ draws });
  } catch (err) {
    next(err);
  }
});

export default router;
