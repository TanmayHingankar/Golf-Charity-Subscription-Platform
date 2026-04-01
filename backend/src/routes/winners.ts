import express from 'express';
import multer from 'multer';
import { Request } from 'express';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { attachProof, updateWinnerStatus, listWinners } from '../services/winnerService';
import { uploadBuffer } from '../services/fileService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateJWT);

router.get('/', requireRole(['admin']), async (req, res, next) => {
  try {
    const winners = await listWinners(req.query.draw_id as string | undefined);
    res.json({ winners });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/proof', upload.single('file'), async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    if (!(req as MulterRequest).file) return res.status(400).json({ message: 'File required' });
    const url = await uploadBuffer((req as MulterRequest).file!.buffer, (req as MulterRequest).file!.mimetype);
    const updated = await attachProof(req.params.id as string, userId, url);
    res.json({ winner: updated, proof_url: url });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', requireRole(['admin']), async (req, res, next) => {
  try {
    const updated = await updateWinnerStatus(req.params.id as string, 'approved');
    res.json({ winner: updated });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reject', requireRole(['admin']), async (req, res, next) => {
  try {
    const updated = await updateWinnerStatus(req.params.id as string, 'rejected');
    res.json({ winner: updated });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pay', requireRole(['admin']), async (req, res, next) => {
  try {
    const updated = await updateWinnerStatus(req.params.id as string, 'paid', req.body.payout_ref);
    res.json({ winner: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
