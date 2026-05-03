import { z } from 'zod';
import type { OrderStatus } from '../types/order';

export const OrderStatusValues: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
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
}).strict('Only status field is allowed');

export const TrackQuerySchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Valid email is required'),
});

export const IdempotencyKeySchema = z.string().min(1, 'Idempotency key cannot be empty').max(100, 'Idempotency key too long');

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const DiscountCodeSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
  orderTotal: z.number().positive().optional(),
});

export const ShippingRateQuerySchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
});

export function createErrorResponse(res: any, status: number, error: string, message: string, details?: unknown) {
  return res.status(status).json({
    error,
    code: status,
    message,
    ...(details !== undefined && { details }),
  });
}

export { z };