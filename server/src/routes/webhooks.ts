import express, { Request, Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

router.post('/stripe', async (_req: Request, res: Response) => {
  res.json({ message: 'Stripe webhook - TODO' });
});

router.post('/myfatoorah', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const webhookSecret = process.env.MYFATOORAH_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      res.status(401).json({ error: 'unauthorized', code: 401, message: 'Missing signature' });
      return;
    }

    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('base64');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      res.status(401).json({ error: 'unauthorized', code: 401, message: 'Invalid signature' });
      return;
    }

    const payload = JSON.parse(rawBody.toString());
    console.log('MyFatoorah webhook received:', payload);

    res.json({ received: true });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: 'webhook_error', code: 500, message: err.message });
  }
});

export default router;