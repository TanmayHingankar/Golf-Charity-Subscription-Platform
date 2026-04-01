import db from '../config/db';
import stripe from '../config/stripe';
import { env } from '../config/env';
import { findUserById } from './authService';
import { recordDonation } from './charityService';

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan: 'monthly' | 'yearly';
  price_cents: number;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export const getSubscription = async (userId: string) => {
  return db<SubscriptionRecord>('subscriptions').where({ user_id: userId }).orderBy('created_at', 'desc').first();
};

export const updateSubscriptionFromStripe = async (subscription: any, userId?: string) => {
  const ownerId = userId || subscription.metadata?.userId;
  if (!ownerId) throw { statusCode: 400, message: 'Missing userId on subscription metadata' };

  const plan = subscription.items?.data?.[0]?.price?.nickname === 'yearly' ? 'yearly' : 'monthly';
  const price_cents = subscription.items?.data?.[0]?.price?.unit_amount || 0;
  const status = subscription.status;
  const current_period_end = new Date((subscription.current_period_end || 0) * 1000).toISOString();
  const cancel_at_period_end = subscription.cancel_at_period_end;

  const [row] = await db<SubscriptionRecord>('subscriptions')
    .insert({
      user_id: ownerId,
      stripe_subscription_id: subscription.id,
      plan,
      price_cents,
      status,
      current_period_end,
      cancel_at_period_end,
    })
    .onConflict('stripe_subscription_id')
    .merge()
    .returning('*');

  await db('users').where({ id: ownerId }).update({
    is_subscribed: status === 'active' || status === 'trialing',
    stripe_customer_id: subscription.customer,
  });

  // record donation portion of subscription for user's charity choice
  const user = await findUserById(ownerId);
  if (user?.charity_id) {
    const pct = user.charity_pct || 10;
    const amount = Math.floor((price_cents * pct) / 100);
    await recordDonation(ownerId, user.charity_id, amount, 'subscription');
  }

  return row;
};

export const createCheckoutSession = async (userId: string, plan: 'monthly' | 'yearly') => {
  const priceLookup: Record<string, string> = {
    monthly: env.STRIPE_PRICE_MONTHLY,
    yearly: env.STRIPE_PRICE_YEARLY,
  };
  const price = priceLookup[plan];
  if (!price) throw { statusCode: 400, message: 'Pricing not configured' };

  const user = await findUserById(userId);
  if (!user) throw { statusCode: 404, message: 'User not found' };

  // Ensure a Stripe customer exists
  let customerId = (user as any).stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId } });
    customerId = customer.id;
    await db('users').where({ id: userId }).update({ stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/subscription`,
    metadata: { userId },
  });

  return session;
};

export async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateSubscriptionFromStripe(subscription, session.metadata?.userId);
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await updateSubscriptionFromStripe(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await updateSubscriptionFromStripe(subscription);
      break;
    }
    default:
      break;
  }
}
