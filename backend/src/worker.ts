import { registerDrawWorker } from './jobs/runDraw.job';

// start worker
registerDrawWorker();

// keep process alive
process.on('SIGINT', () => process.exit(0));
