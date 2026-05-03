import express from 'express';
import type {Request, Response} from 'express';
import rateLimit from 'express-rate-limit';
import {validateDiscount, applyDiscount} from '../services/discount';
import {logDiscountValidation, logDiscountUse} from '../lib/logger';

const router = express.Router();

const validateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: {valid: false, error: 'Too many requests, please try again later'},
  keyGenerator: (req: Request) => req.ip || 'unknown',
});

router.post('/validate', validateLimiter, async (req: Request, res: Response) => {
  try {
    const {code, orderSubtotal} = req.body;

    if (!code || typeof code !== 'string') {
      logDiscountValidation({
        code: 'MISSING',
        valid: false,
        reason: 'Code not provided',
      });
      return res.status(400).json({valid: false, error: 'Code is required'});
    }

    if (typeof orderSubtotal !== 'number' || orderSubtotal < 0) {
      logDiscountValidation({
        code: code.trim(),
        valid: false,
        reason: 'Invalid subtotal',
      });
      return res.status(400).json({valid: false, error: 'Order subtotal must be a non-negative number'});
    }

    const result = await validateDiscount(code.trim(), orderSubtotal);

    if (!result.valid) {
      logDiscountValidation({
        code: code.trim(),
        valid: false,
        reason: result.error,
      });
      return res.json({valid: false, error: result.error});
    }

    logDiscountValidation({
      code: code.trim(),
      valid: true,
    });

    const {discount_amount} = applyDiscount(
      {type: result.discount!.type, value: result.discount!.value},
      orderSubtotal
    );

    return res.json({
      valid: true,
      discount_amount,
      type: result.discount!.type,
      value: result.discount!.value,
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return res.status(500).json({valid: false, error: 'Internal server error'});
  }
});

export default router;