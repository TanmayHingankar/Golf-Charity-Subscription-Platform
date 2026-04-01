import { Queue, Worker, JobsOptions } from 'bullmq';
import { env } from '../config/env';
import { runDraw } from '../services/drawService';

const connection = { url: env.REDIS_URL };

export const drawQueue = new Queue('draws', { connection });

export const enqueueRunDraw = async (drawId: string, opts: JobsOptions = {}) => {
  await drawQueue.add('run-draw', { drawId }, opts);
};

// Worker (used in worker.ts entry)
export const registerDrawWorker = () =>
  new Worker(
    'draws',
    async (job) => {
      const { drawId } = job.data;
      return runDraw(drawId);
    },
    { connection }
  );
