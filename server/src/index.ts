import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import { ordersRouter, webhooksRouter, productsRouter, discountsRouter, shippingRouter, paymentsRouter } from './routes';
import { logError } from './lib/logger';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export const app = express();

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || randomUUID();
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limit_exceeded', code: 429, message: 'Too many requests' },
});

app.use(limiter);

app.post(
  '/api/v1/webhooks/myfatoorah',
  express.raw({ type: 'application/json' }),
  webhooksRouter
);

app.use(express.json());

export const apiV1 = express.Router();

apiV1.use('/orders', ordersRouter);
apiV1.use('/webhooks/stripe', webhooksRouter);
apiV1.use('/admin', productsRouter);
apiV1.use('/discounts', discountsRouter);
apiV1.use('/shipping', shippingRouter);
apiV1.use('/payments', paymentsRouter);

app.use('/api/v1', apiV1);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found', code: 404, message: 'Endpoint not found' });
});

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logError({
    errorCode: err.name || 'INTERNAL_ERROR',
    errorMessage: err.message || 'Internal server error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  const code = err.name === 'ValidationError' ? 400 : 500;
  const message = err.message || 'Internal server error';

  res.status(code).json({ error: err.name.toLowerCase(), code, message });
}

app.use(errorHandler);

export default app;