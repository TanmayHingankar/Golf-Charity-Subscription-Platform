import bcrypt from 'bcrypt';
import db from '../config/db';

const TOKEN_TTL_DAYS = 30;

export async function persistRefreshToken(userId: string, token: string) {
  const token_hash = await bcrypt.hash(token, 10);
  const expires_at = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db('refresh_tokens').insert({ user_id: userId, token_hash, expires_at });
}

export async function revokeRefreshToken(token: string, userId: string) {
  const rows = await db('refresh_tokens').where({ user_id: userId, revoked: false });
  for (const row of rows) {
    const match = await bcrypt.compare(token, row.token_hash);
    if (match) {
      await db('refresh_tokens').where({ id: row.id }).update({ revoked: true });
      return true;
    }
  }
  return false;
}

export async function rotateRefreshToken(oldToken: string, userId: string) {
  const rows = await db('refresh_tokens').where({ user_id: userId, revoked: false });
  for (const row of rows) {
    const match = await bcrypt.compare(oldToken, row.token_hash);
    if (match) {
      if (new Date(row.expires_at) < new Date()) {
        await db('refresh_tokens').where({ id: row.id }).update({ revoked: true });
        throw { statusCode: 401, message: 'Refresh token expired' };
      }
      await db('refresh_tokens').where({ id: row.id }).update({ revoked: true });
      return true;
    }
  }
  throw { statusCode: 401, message: 'Invalid refresh token' };
}
