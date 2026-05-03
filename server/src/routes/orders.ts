import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import * as orderService from '../services/orders';
import * as orderItemsService from '../services/orderItems';
import type { OrderStatus } from '../types/order';
import type { CreateOrderRequest } from '../types/order';
import { ORDER_STATUS_TRANSITIONS, isValidTransition } from '../types/order-status';
import { MyfatoorahApiError, getMyFatoorahClient } from '../lib/myfatoorah';
import { logOrderCreation, logStatusTransition, logError, logTrackingLookup, getLogger } from '../lib/logger';
import { logAudit, sanitizeForAudit } from '../lib/audit';
import { requireAdminAuth } from '../middleware/adminAuth';

const router = express.Router();

export const OrderStatusValues: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
  'refunded',
];

export const CartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  variantId: z.string().uuid('Invalid variant ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
  name: z.string().min(1, 'Product name is required'),
});

export const ShippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

export const CreateOrderBodySchema = z.object({
  email: z.string().email('Invalid email format'),
  customerId: z.string().uuid('Invalid customer ID format').optional(),
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  shippingAddress: ShippingAddressSchema,
  shippingMethodId: z.string().min(1, 'Shipping method ID is required'),
  discountCode: z.string().optional(),
  paymentMethodId: z.number().int().positive('Payment method ID must be positive'),
}).strict('Unknown fields are not allowed');

export const UpdateOrderBodySchema = z.object({
  shippingAddress: ShippingAddressSchema,
}).strict('Only shippingAddress can be updated');

export const UpdateStatusBodySchema = z.object({
  status: z.enum(OrderStatusValues as unknown as [OrderStatus, ...OrderStatus[]], {
    errorMap: () => ({ message: `Status must be one of: ${OrderStatusValues.join(', ')}` }),
  }),
  note: z.string().max(500, 'Note must be 500 characters or less').optional(),
}).strict('Only status and note fields are allowed');

export const TrackQuerySchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Valid email is required'),
});

export const IdempotencyKeySchema = z.string().min(1, 'Idempotency key cannot be empty').max(100, 'Idempotency key too long');

const ORDER_NUMBER_REGEX = /^ORD-\d{8}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/;

export const TrackQuerySchema = z.object({
  orderNumber: z.string().regex(ORDER_NUMBER_REGEX, 'Invalid order number format'),
  email: z.string().email('Valid email is required'),
});

const ErrorStatusMap: Record<string, number> = {
  [orderService.OrderErrorCodes.INVENTORY_UNAVAILABLE]: 409,
  [orderService.OrderErrorCodes.INVALID_DISCOUNT]: 422,
  [orderService.OrderErrorCodes.INVALID_ADDRESS]: 422,
  [orderService.OrderErrorCodes.ORDER_NOT_FOUND]: 404,
  [orderService.OrderErrorCodes.ORDER_UPDATE_FAILED]: 400,
  [orderService.OrderErrorCodes.INVALID_STATE_TRANSITION]: 409,
  [orderService.OrderErrorCodes.INVALID_STATUS_TRANSITION]: 422,
  [orderService.OrderErrorCodes.ORDER_IMMUTABLE]: 409,
};

function sendError(res: Response, status: number, error: string, message: string, details?: unknown) {
  res.status(status).json({
    error,
    code: status,
    message,
    ...(details !== undefined && { details }),
  });
}

function handleOrderError(res: Response, error: orderService.OrderError) {
  const status = ErrorStatusMap[error.code] || 400;
  const isRetryable = error.code === orderService.OrderErrorCodes.INVENTORY_UNAVAILABLE &&
    error.message.includes('another transaction');
  if (isRetryable) {
    res.setHeader('Retry-After', '2');
  }
  sendError(res, status, error.code.toLowerCase(), error.message);
}

function handleGenericError(res: Response, error: unknown, next: NextFunction) {
  if (error instanceof orderService.OrderError) {
    handleOrderError(res, error);
    return;
  }
  if (error instanceof z.ZodError) {
    sendError(res, 422, 'validation_error', 'Invalid request data', error.errors);
    return;
  }
  next(error);
}

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (idempotencyKey) {
      const parsed = IdempotencyKeySchema.safeParse(idempotencyKey);
      if (!parsed.success) {
        return sendError(res, 400, 'invalid_idempotency_key', parsed.error.errors[0].message);
      }

      const existingOrder = await orderService.findByIdempotencyKey(idempotencyKey);
      if (existingOrder) {
        return res.status(200).json({
          order: existingOrder,
          mfInvoiceId: existingOrder.mfInvoiceId ? Number(existingOrder.mfInvoiceId) : 0,
          mfPaymentUrl: existingOrder.mfPaymentUrl || '',
          duplicate: true,
        });
      }
    }

    const validation = CreateOrderBodySchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 422, 'validation_error', 'Invalid request body', validation.error.errors);
    }

    const body = validation.data as CreateOrderRequest;

    const input: orderService.CreateOrderInput = {
      cartItems: body.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        name: item.name,
      })),
      customerId: body.customerId || null,
      guestEmail: body.email,
      shippingAddress: body.shippingAddress,
      discountCode: body.discountCode,
      shippingMethodId: body.shippingMethodId,
    };

    const result = await orderService.createOrder(input, idempotencyKey);

    logOrderCreation({
      orderId: result.order.id,
      customerId: body.customerId || null,
      guestEmail: body.email,
      total: result.order.total,
      itemCount: body.items.length,
    });

    res.status(201).json({
      order: result.order,
      mfInvoiceId: result.mfInvoiceId,
      mfPaymentUrl: result.mfPaymentUrl,
    });
  } catch (error) {
    if (error instanceof orderService.OrderError) {
      logError({
        errorCode: error.code,
        errorMessage: error.message,
        orderId: error.code === 'ORDER_NOT_FOUND' ? req.params.orderId : undefined,
      });
      return handleOrderError(res, error);
    }
    if (error instanceof z.ZodError) {
      return sendError(res, 422, 'validation_error', 'Invalid request body', error.errors);
    }
    next(error);
  }
});

router.get('/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'unauthorized', 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await (await import('../lib/supabase')).supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return sendError(res, 401, 'unauthorized', 'Invalid or expired token');
    }

    const order = await orderService.findById(req.params.orderId);
    if (!order) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    if (order.customerId !== user.id) {
      return sendError(res, 403, 'forbidden', 'You do not have permission to view this order');
    }

    const orderWithItems = await orderItemsService.findOrderWithItems(req.params.orderId);

    res.json({ order: orderWithItems });
  } catch (error) {
    next(error);
  }
});

const trackRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limit_exceeded', code: 429, message: 'Too many requests' },
});

router.get('/track', trackRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = TrackQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    const { orderNumber, email } = validation.data;

    const order = await orderService.findPublicByOrderNumber(orderNumber, email);
    const found = !!order;

    logTrackingLookup({
      orderNumber,
      guestEmail: email,
      found,
      requestId: req.id,
    });

    if (!order) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.patch('/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'unauthorized', 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await (await import('../lib/supabase')).supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return sendError(res, 401, 'unauthorized', 'Invalid or expired token');
    }

    const validation = UpdateOrderBodySchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 400, 'invalid_field', validation.error.errors[0].message);
    }

    const order = await orderService.findById(req.params.orderId);
    if (!order) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    if (order.customerId !== user.id) {
      return sendError(res, 403, 'forbidden', 'You do not have permission to modify this order');
    }

    const updated = await orderService.update(req.params.orderId, validation.data);
    res.json({ order: updated });
  } catch (error) {
    if (error instanceof orderService.OrderError) {
      return handleOrderError(res, error);
    }
    if (error instanceof z.ZodError) {
      return sendError(res, 422, 'validation_error', 'Invalid request data', error.errors);
    }
    next(error);
  }
});

router.patch('/:orderId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'unauthorized', 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await (await import('../lib/supabase')).supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return sendError(res, 401, 'unauthorized', 'Invalid or expired token');
    }

    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'service_role';
    if (!isAdmin) {
      return sendError(res, 403, 'forbidden', 'Admin access required');
    }

    const validation = UpdateStatusBodySchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 400, 'missing_status', validation.error.errors[0].message);
    }

    const currentOrder = await orderService.findById(req.params.orderId);
    if (!currentOrder) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    const fromStatus = currentOrder.status;
    const updated = await orderService.updateStatus(req.params.orderId, validation.data.status);

    logStatusTransition({
      orderId: req.params.orderId,
      fromStatus,
      toStatus: validation.data.status,
      actor: user.id,
    });

    await logAudit({
      adminId: user.id,
      action: 'UPDATE',
      entityType: 'order',
      entityId: req.params.orderId,
      oldValues: sanitizeForAudit({ status: fromStatus }),
      newValues: sanitizeForAudit({ status: validation.data.status }),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ order: updated });
  } catch (error) {
    if (error instanceof orderService.OrderError) {
      return handleOrderError(res, error);
    }
    if (error instanceof z.ZodError) {
      return sendError(res, 422, 'validation_error', 'Invalid request data', error.errors);
    }
    next(error);
  }
});

router.get('/admin/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const { search, status, sortBy, sortDir, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const result = await orderService.findAdminList({
      search: search as string | undefined,
      status: status as OrderStatus | undefined,
      sortBy: (sortBy as 'createdAt' | 'total') || 'createdAt',
      sortDir: (sortDir as 'asc' | 'desc') || 'desc',
      limit: limitNum,
      offset,
    });

    const pages = Math.ceil(result.total / limitNum);

    res.json({
      orders: result.orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerId: o.customer_id,
        guestEmail: o.guest_email,
        status: o.status,
        total: o.total,
        mfInvoiceId: o.mf_invoice_id,
        createdAt: o.created_at,
      })),
      total: result.total,
      page: pageNum,
      pages,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/orders/:orderId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const validation = UpdateStatusBodySchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 400, 'missing_status', validation.error.errors[0].message);
    }

    const { status: newStatus, note } = validation.data;

    const currentOrder = await orderService.findById(req.params.orderId);
    if (!currentOrder) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    const fromStatus = currentOrder.status;

    if (!isValidTransition(fromStatus, newStatus)) {
      const allowed = ORDER_STATUS_TRANSITIONS[fromStatus] || [];
      return sendError(res, 400, 'invalid_status_transition', `Cannot transition from ${fromStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`);
    }

    const updated = await orderService.updateStatus(req.params.orderId, newStatus);

    logStatusTransition({
      orderId: req.params.orderId,
      fromStatus,
      toStatus: newStatus,
      actor: adminUser.id,
      note,
    });

    res.json({ order: updated });
  } catch (error) {
    if (error instanceof orderService.OrderError) {
      return handleOrderError(res, error);
    }
    if (error instanceof z.ZodError) {
      return sendError(res, 422, 'validation_error', 'Invalid request data', error.errors);
    }
    next(error);
  }
});

router.get('/admin/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const order = await orderService.findById(req.params.orderId);
    if (!order) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    const orderWithItems = await orderItemsService.findOrderWithItems(req.params.orderId);

    res.json({ order: orderWithItems });
  } catch (error) {
    next(error);
  }
});

const RefundBodySchema = z.object({
  refundAmount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less'),
}).strict('Only refundAmount and reason are allowed');

router.post('/admin/orders/:orderId/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const validation = RefundBodySchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 400, 'validation_error', validation.error.errors[0].message);
    }

    const { refundAmount, reason } = validation.data;

    const order = await orderService.findById(req.params.orderId);
    if (!order) {
      return sendError(res, 404, 'order_not_found', 'Order not found');
    }

    if (!order.mfInvoiceId) {
      return sendError(res, 400, 'no_invoice', 'Order has no MyFatoorah invoice ID');
    }

    let client;
    try {
      client = getMyFatoorahClient();
    } catch (err) {
      return res.status(503).json({
        error: 'payment_provider_unavailable',
        code: 503,
        message: 'Payment provider is not configured',
      });
    }

    let refundResult;
    try {
      refundResult = await client.makeRefund({
        KeyType: 'InvoiceId',
        Key: order.mfInvoiceId,
        RefundChargeOnCustomer: false,
        ServiceChargeOnCustomer: false,
        Amount: refundAmount,
        Comment: reason,
      });
    } catch (err) {
      if (err instanceof MyfatoorahApiError) {
        return res.status(422).json({
          error: 'refund_failed',
          code: 422,
          message: err.message,
          details: err.validationErrors,
        });
      }
      throw err;
    }

    const updated = await orderService.updateStatus(req.params.orderId, 'refunded');

    logStatusTransition({
      orderId: req.params.orderId,
      fromStatus: order.status,
      toStatus: 'refunded',
      actor: adminUser.id,
      note: `Refund ${refundAmount} - ${reason}. RefundId: ${refundResult.RefundId}`,
    });

    res.json({
      refund: {
        refundId: refundResult.RefundId,
        amount: refundResult.Amount,
        status: refundResult.Status,
        refundReference: refundResult.RefundReference,
      },
      order: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;