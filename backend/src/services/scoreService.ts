import db from '../config/db';
import { UserRecord } from './authService';

export interface ScoreRecord {
  id: string;
  user_id: string;
  value: number;
  played_at: string;
  created_at: string;
}

export async function getUserScores(userId: string): Promise<ScoreRecord[]> {
  return db<ScoreRecord>('scores')
    .where({ user_id: userId })
    .orderBy('played_at', 'desc')
    .limit(5);
}

export async function addScore(userId: string, value: number, playedAt: string): Promise<ScoreRecord> {
  if (value < 1 || value > 45) throw { statusCode: 400, message: 'Score must be between 1 and 45' };

  const playedDate = new Date(playedAt);
  if (Number.isNaN(playedDate.getTime())) throw { statusCode: 400, message: 'Invalid date' };
  const isoString = playedDate.toISOString();

  const [score] = await db<ScoreRecord>('scores').insert({ user_id: userId, value, played_at: isoString }).returning('*');

  const total = await db<ScoreRecord>('scores').where({ user_id: userId }).count<{ count: string }>('id as count').first();
  const count = parseInt(total?.count || '0', 10);
  if (count > 5) {
    const oldest = await db<ScoreRecord>('scores')
      .where({ user_id: userId })
      .orderBy('played_at', 'asc')
      .limit(count - 5)
      .select('id');

    if (oldest.length) {
      await db('scores').whereIn('id', oldest.map((r) => r.id)).delete();
    }
  }

  return score;
}
