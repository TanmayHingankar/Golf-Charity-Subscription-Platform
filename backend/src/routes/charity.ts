import express from 'express';
import { listCharities, getCharityById } from '../services/charityService';
import { createCharity, updateCharity, deleteCharity } from '../services/charityService';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const charities = await listCharities();
    res.json({ charities });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const charity = await getCharityById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateJWT, requireRole(['admin']), async (req, res, next) => {
  try {
    const charity = await createCharity(req.body);
    res.status(201).json({ charity });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateJWT, requireRole(['admin']), async (req, res, next) => {
  try {
    const charity = await updateCharity(req.params.id as string, req.body);
    res.json({ charity });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateJWT, requireRole(['admin']), async (req, res, next) => {
  try {
    await deleteCharity(req.params.id as string);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
