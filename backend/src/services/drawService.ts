import db from '../config/db';
import { computePrizeSplit } from './prizeService';
import { addAudit } from './auditService';
import crypto from 'crypto';

export interface DrawRecord {
  id: string;
  draw_month: string;
  status: 'pending' | 'completed';
  method: 'random' | 'algorithmic';
  numbers: number[];
  jackpot_rollover: number;
  executed_at?: string;
  created_at: string;
}

export interface WinnerRecord {
  id: string;
  draw_id: string;
  user_id: string;
  match_count: number;
  prize_cents: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  proof_url?: string;
  created_at: string;
}

const generateRandomNumbers = (seed?: string) => {
  const rng = seed ? seeded(seed) : Math.random;
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(rng() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
};

const seeded = (seed: string) => {
  let x = crypto.createHash('sha256').update(seed).digest().readUInt32LE(0);
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
};

export async function createMonthlyDraw(method: 'random' | 'algorithmic' = 'random') {
  const month = new Date().toISOString().slice(0, 7);
  const existing = await db<DrawRecord>('draws').where({ draw_month: month }).first();
  if (existing) throw { statusCode: 400, message: 'Draw already exists for this month' };

  const numbers = method === 'random' ? generateRandomNumbers() : generateRandomNumbers();

  const [draw] = await db<DrawRecord>('draws').insert({ draw_month: month, status: 'pending', method, numbers, jackpot_rollover: 0 }).returning('*');
  return draw;
}

export async function snapshotEntries(drawId: string, trx = db) {
  const entries = await trx('scores')
    .select('user_id')
    .groupBy('user_id')
    .having(db.raw('count(*) > 0'));

  const userScores = await trx('scores').whereIn('user_id', entries.map((e: any) => e.user_id)).orderBy('played_at', 'desc');

  const userMap = userScores.reduce((acc: Record<string, number[]>, row: any) => {
    acc[row.user_id] = acc[row.user_id] || [];
    if (acc[row.user_id].length < 5) acc[row.user_id].push(row.value);
    return acc;
  }, {});

  const rows = Object.entries(userMap).map(([user_id, vals]) => ({
    draw_id: drawId,
    user_id,
    snapshot_numbers: vals,
  }));
  if (rows.length) await trx('draw_entries').insert(rows);
  return rows;
}

const algorithmicNumbers = (entries: { snapshot_numbers: number[] }[], seed: string) => {
  const rng = seeded(seed);
  const freq = new Map<number, number>();
  entries.forEach((e) => e.snapshot_numbers.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1)));
  const weighted = Array.from(freq.entries()).map(([n, f]) => ({ n, score: f + rng() }));
  weighted.sort((a, b) => b.score - a.score);
  const chosen: number[] = [];
  for (const item of weighted) {
    if (chosen.length >= 5) break;
    chosen.push(item.n);
  }
  while (chosen.length < 5) {
    const n = Math.floor(rng() * 45) + 1;
    if (!chosen.includes(n)) chosen.push(n);
  }
  return chosen.sort((a, b) => a - b);
};

export async function runDraw(drawId: string) {
  return db.transaction(async (trx) => {
    const draw = await trx<DrawRecord>('draws').where({ id: drawId }).forUpdate().first();
    if (!draw) throw { statusCode: 404, message: 'Draw not found' };
    if (draw.status !== 'pending') throw { statusCode: 400, message: 'Draw already executed' };

    const snapshots = await snapshotEntries(drawId, trx);
    const seed = `${draw.draw_month}-${draw.id}`;
    const numbers = draw.method === 'algorithmic' ? algorithmicNumbers(snapshots, seed) : generateRandomNumbers(seed);

    const results: Record<'5' | '4' | '3', string[]> = { '5': [], '4': [], '3': [] };
    snapshots.forEach((entry) => {
      const match = entry.snapshot_numbers.filter((n) => numbers.includes(n)).length;
      if (match >= 3) results[match.toString() as '3' | '4' | '5'].push(entry.user_id);
    });

    const { payoutPerTier, jackpotRollover, basePool } = await computePrizeSplit(results, draw.jackpot_rollover);

    const payouts: WinnerRecord[] = [];
    for (const tier of ['5', '4', '3'] as const) {
      const winners = results[tier];
      const portion = payoutPerTier[tier];
      for (const userId of winners) {
        const [winner] = await trx<WinnerRecord>('winners').insert({
          draw_id: drawId,
          user_id: userId,
          match_count: Number(tier),
          prize_cents: portion,
          status: 'pending',
        }).returning('*');
        payouts.push(winner);
      }
    }

    await trx<DrawRecord>('draws').where({ id: drawId }).update({ status: 'completed', numbers, jackpot_rollover: jackpotRollover, executed_at: new Date().toISOString() });
    await addAudit('draw_run', 'draw', drawId, { numbers, payouts, basePool, jackpotRollover });
    return { draw: { ...draw, numbers }, results, payouts, jackpotRollover, basePool };
  });
}
