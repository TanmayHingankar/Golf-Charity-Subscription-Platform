import db from '../config/db';

export async function computePrizeSplit(results: Record<'5' | '4' | '3', string[]>, incomingJackpot: number) {
  const SPLIT = { 5: 0.4, 4: 0.35, 3: 0.25 };
  const subs = await db('subscriptions').whereIn('status', ['active', 'trialing']).select('price_cents');
  const basePool = subs.reduce((sum, row) => sum + (row.price_cents || 0), 0);

  let jackpotRollover = incomingJackpot || 0;
  if (results['5'].length === 0) {
    jackpotRollover += Math.floor(basePool * SPLIT[5]);
  }

  const payoutPerTier: Record<'5' | '4' | '3', number> = {
    5: results['5'].length ? Math.floor((basePool * SPLIT[5]) / results['5'].length) : 0,
    4: results['4'].length ? Math.floor((basePool * SPLIT[4]) / results['4'].length) : 0,
    3: results['3'].length ? Math.floor((basePool * SPLIT[3]) / results['3'].length) : 0,
  };

  return { payoutPerTier, jackpotRollover, basePool };
}
