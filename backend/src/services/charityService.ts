import db from '../config/db';

export interface CharityRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  min_pct: number;
  created_at: string;
}

export async function listCharities() {
  return db<CharityRecord>('charities').orderBy('name', 'asc');
}

export async function getCharityById(id: string) {
  return db<CharityRecord>('charities').where({ id }).first();
}

export async function createCharity(payload: Partial<CharityRecord>) {
  const [charity] = await db<CharityRecord>('charities').insert({
    ...payload,
    min_pct: payload.min_pct || 10,
    slug: payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
  }).returning('*');
  return charity;
}

export async function updateCharity(id: string, payload: Partial<CharityRecord>) {
  const [charity] = await db<CharityRecord>('charities').where({ id }).update(payload).returning('*');
  return charity;
}

export async function deleteCharity(id: string) {
  return db<CharityRecord>('charities').where({ id }).delete();
}

export async function recordDonation(userId: string, charityId: string, amount_cents: number, source: string) {
  await db('donations').insert({ user_id: userId, charity_id: charityId, amount_cents, source });
}

export async function charityAnalytics() {
  const totals = await db('donations').select('charity_id').sum({ total: 'amount_cents' }).groupBy('charity_id');
  return totals;
}
