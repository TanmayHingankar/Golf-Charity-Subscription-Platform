import cron from 'node-cron';
import { createMonthlyDraw } from '../services/drawService';
import { enqueueRunDraw } from './runDraw.job';

// Runs monthly on the 1st at 00:05
export function startScheduler() {
  cron.schedule('5 0 1 * *', async () => {
    const draw = await createMonthlyDraw('random');
    await enqueueRunDraw(draw.id);
  });
}
