import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import authRoutes from './routes/auth';
import scoreRoutes from './routes/scores';
import charityRoutes from './routes/charity';
import drawRoutes from './routes/draw';
import adminRoutes from './routes/admin';
import subscriptionRoutes from './routes/subscription';
import winnerRoutes from './routes/winners';
import { handleErrors } from './middlewares/errorHandler';
import { subscriptionWebhookHandler } from './routes/subscription';
import { authLimiter, globalLimiter } from './middlewares/rateLimit';

const app = express();

app.use(cors());
app.use(helmet({ referrerPolicy: { policy: 'no-referrer' } }));
app.use(compression());
app.use(morgan('dev'));

// Stripe webhook must receive raw body and must run before JSON parser
app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), subscriptionWebhookHandler);

app.use(globalLimiter);
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// rate limit auth endpoints
app.use('/api/auth', authLimiter);

// static proofs
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/winners', winnerRoutes);

app.use(handleErrors);

export default app;
