import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3';
import { env } from '../config/env';
import crypto from 'crypto';

const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX = 5 * 1024 * 1024;

export async function uploadBuffer(buf: Buffer, mime: string) {
  if (!ALLOWED.includes(mime)) throw { statusCode: 400, message: 'Invalid file type' };
  if (buf.length > MAX) throw { statusCode: 400, message: 'File too large' };
  const key = `proofs/${crypto.randomUUID()}`;
  await s3.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: buf, ContentType: mime, ACL: 'private' }));
  return `s3://${env.S3_BUCKET}/${key}`;
}
