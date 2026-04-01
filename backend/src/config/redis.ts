import { env } from './env';
import { createClient } from 'redis';

export const redis = createClient({ url: env.REDIS_URL });
redis.connect().catch((err) => {
  console.error('Redis connection error', err);
});
