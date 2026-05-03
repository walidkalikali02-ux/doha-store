import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export function validateWebhookSignature(payload: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return true;
  } catch {
    return false;
  }
}

export default stripe;