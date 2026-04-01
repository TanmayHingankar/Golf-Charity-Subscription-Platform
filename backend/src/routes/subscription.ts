import express from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { createCheckoutSession, getSubscription, handleStripeEvent } from '../services/subscriptionService';
import { webhookLimiter, writeLimiter } from '../middlewares/rateLimit';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = express.Router();

router.post(
  '/checkout',
  authenticateJWT,
  writeLimiter,
  validate(z.object({ body: z.object({ plan: z.enum(['monthly', 'yearly']) }) })),
  async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const { plan } = (req as any).validated.body;
    if (plan !== 'monthly' && plan !== 'yearly') {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const session = await createCheckoutSession(userId, plan);
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
  }
);

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const sub = await getSubscription(userId);
    res.json({ subscription: sub });
  } catch (err) {
    next(err);
  }
});

router.post('/cancel', authenticateJWT, async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const sub = await getSubscription(userId);
    if (!sub) return res.status(404).json({ message: 'No subscription found' });
    const stripe = await import('../config/stripe').then((m) => m.default);
    await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    res.json({ message: 'Cancellation scheduled at period end' });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/stats', authenticateJWT, requireRole(['admin']), async (_req, res, next) => {
  try {
    const total = await import('../config/db').then((m) => m.default('subscriptions').count('id as count').first());
    res.json({ total: total?.count || 0 });
  } catch (err) {
    next(err);
  }
});

export default router;

// Separate webhook handler (mounted before JSON parser in app.ts)
export const subscriptionWebhookHandler = [
  webhookLimiter,
  async (req: any, res: any, next: any) => {
    try {
      const stripe = await import('../config/stripe').then((m) => m.default);
      const sig = req.headers['stripe-signature'];
      if (!sig) return res.status(400).send('Missing signature');
      const { env } = await import('../config/env');
      const event = stripe.webhooks.constructEvent(req.body, sig as string, env.STRIPE_WEBHOOK_SECRET);
      await handleStripeEvent(event);
      return res.json({ received: true });
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  },
];
