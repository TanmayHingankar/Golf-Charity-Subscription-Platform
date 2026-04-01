import db from '../config/db';

export async function attachProof(winnerId: string, userId: string, url: string) {
  const winner = await db('winners').where({ id: winnerId, user_id: userId }).first();
  if (!winner) throw { statusCode: 404, message: 'Winner not found' };
  const [row] = await db('winners').where({ id: winnerId }).update({ proof_url: url }).returning('*');
  return row;
}

export async function updateWinnerStatus(id: string, status: 'approved' | 'rejected' | 'paid', payout_ref?: string) {
  const [row] = await db('winners').where({ id }).update({ status, payout_status: status === 'paid' ? 'paid' : 'pending', payout_ref }).returning('*');
  if (!row) throw { statusCode: 404, message: 'Winner not found' };
  return row;
}

export async function listWinners(drawId?: string) {
  const query = db('winners').orderBy('created_at', 'desc');
  if (drawId) query.where({ draw_id: drawId });
  return query;
}
