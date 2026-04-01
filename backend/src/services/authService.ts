import db from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { persistRefreshToken, rotateRefreshToken } from './tokenService';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  charity_id?: string;
  charity_pct: number;
  is_subscribed: boolean;
  stripe_customer_id?: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const user = await db<UserRecord>('users').where({ email }).first();
  return user || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const user = await db<UserRecord>('users').where({ id }).first();
  return user || null;
}

export async function registerUser(email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) throw { statusCode: 409, message: 'Email already registered' };

  const password_hash = await bcrypt.hash(password, 12);
  const [user] = await db<UserRecord>('users')
    .insert({ email, password_hash, role: 'user', charity_pct: 10, is_subscribed: false })
    .returning('*');
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { statusCode: 401, message: 'Invalid credentials' };

  return user;
}

export async function generateTokens(user: UserRecord) {
  const payload = { role: user.role };
  const secret = env.JWT_SECRET;
  const refreshSecret = env.JWT_REFRESH_SECRET;

  const accessToken = jwt.sign(payload, secret, { subject: user.id, expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshSecret, { subject: user.id, expiresIn: '7d' });

  await persistRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function rotateTokens(userId: string, incomingRefresh: string) {
  await rotateRefreshToken(incomingRefresh, userId);
  const payload = { role: (await findUserById(userId))?.role || 'user' };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { subject: userId, expiresIn: '15m' });
  const newRefresh = jwt.sign(payload, env.JWT_REFRESH_SECRET, { subject: userId, expiresIn: '7d' });
  await persistRefreshToken(userId, newRefresh);
  return { accessToken, refreshToken: newRefresh };
}
