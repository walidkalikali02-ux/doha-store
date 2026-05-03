import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import type { Order, OrderStatus, ShippingAddress } from '../types/order';
import type { CreateOrderResponse } from '../types/order';
import { isValidTransition } from '../types/order-status';
import { validateDiscount, applyDiscount as calculateDiscountAmount } from '../services/discount';
import { getShippingRates } from '../services/shipping';

export class OrderError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'OrderError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const OrderErrorCodes = {
  INVENTORY_UNAVAILABLE: 'INVENTORY_UNAVAILABLE',
  INVALID_DISCOUNT: 'INVALID_DISCOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_UPDATE_FAILED: 'ORDER_UPDATE_FAILED',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  ORDER_IMMUTABLE: 'ORDER_IMMUTABLE',
} as const;

export const terminalStatuses: OrderStatus[] = ['delivered', 'cancelled'];

const PO_BOX_PATTERNS_SERVER = [
  /p\.?\s*o\.?\s*box/i,
  /post\s*box/i,
  /box\s*\d+/i,
];

function isPOBoxServer(address: string): boolean {
  return PO_BOX_PATTERNS_SERVER.some(pattern => pattern.test(address));
}

export const ShippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required').max(500),
  line2: z.string().optional().max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().optional().max(100),
  postalCode: z.string().optional().max(20),
  country: z.string().min(1, 'Country is required').max(100),
})
  .refine(
    (data) => {
      const address = [data.line1, data.line2, data.city].filter(Boolean).join(' ');
      return !isPOBoxServer(address);
    },
    {
      message: 'PO Box addresses are not allowed for express/overnight shipping',
      path: ['line1'],
    }
  );

export const UpdateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema.optional(),
}).strict();

export interface CreateOrderInput {
  cartItems: { productId: string; variantId: string; quantity: number; unitPrice: number; name: string }[];
  customerId: string | null;
  guestEmail: string;
  shippingAddress: ShippingAddress;
  discountCode?: string;
  shippingMethodId: string;
}

export interface UpdateOrderInput {
  shippingAddress?: ShippingAddress;
}

export async function findById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Order;
}

export async function findByOrderNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Order;
}

export async function findByCustomer(customerId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Order[]) || [];
}

export async function findByMfInvoiceId(mfInvoiceId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('mf_invoice_id', mfInvoiceId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Order;
}

export async function findByIdempotencyKey(key: string): Promise<Order | null> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('idempotency_key', key)
    .gte('created_at', twentyFourHoursAgo)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Order;
}

export interface AdminOrderListParams {
  search?: string;
  status?: OrderStatus;
  sortBy?: 'createdAt' | 'total';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AdminOrderListResult {
  orders: Order[];
  total: number;
}

export async function findAdminList(params: AdminOrderListParams): Promise<AdminOrderListResult> {
  const { search, status, sortBy = 'createdAt', sortDir = 'desc', limit = 50, offset = 0 } = params;

  let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    query = query.or(
      `order_number.ilike.%${searchLower}%,guest_email.ilike.%${searchLower}%`
    );
  }

  const sortColumn = sortBy === 'createdAt' ? 'created_at' : 'total';
  query = query.order(sortColumn, { ascending: sortDir === 'asc' });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    orders: (data || []) as Order[],
    total: count || 0,
  };
}

const INTERNAL_FIELDS = ['mf_invoice_id', 'mf_payment_url', 'idempotency_key'];

export interface PublicOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

function toPublicOrder(order: Order): PublicOrder {
  const { mfInvoiceId, mfPaymentUrl, idempotencyKey, ...rest } = order as Order & {
    mfInvoiceId: string | null;
    mfPaymentUrl: string | null;
    idempotencyKey: string | null;
  };
  void mfInvoiceId;
  void mfPaymentUrl;
  void idempotencyKey;
  return rest as PublicOrder;
}

export async function findPublicByOrderNumber(orderNumber: string, email: string): Promise<PublicOrder | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  const order = data as Order;

  if (order.customer_id) {
    const { data: customer } = await supabaseAdmin.auth.admin.getUserById(order.customer_id);
    if (!customer || customer.email?.toLowerCase() !== email.toLowerCase()) {
      return null;
    }
  } else if (order.guest_email?.toLowerCase() !== email.toLowerCase()) {
    return null;
  }

  return toPublicOrder(order);
}

const ORDER_NUMBER_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ORDER_NUMBER_RETRY_ATTEMPTS = 3;

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += ORDER_NUMBER_CHARS.charAt(Math.floor(Math.random() * ORDER_NUMBER_CHARS.length));
  }
  return `ORD-${year}${month}${day}-${random}`;
}

function isTerminalStatus(status: OrderStatus): boolean {
  return terminalStatuses.includes(status);
}

export async function update(orderId: string, input: UpdateOrderInput): Promise<Order> {
  const validated = UpdateOrderSchema.parse(input);

  const order = await findById(orderId);
  if (!order) {
    throw new OrderError('Order not found', OrderErrorCodes.ORDER_NOT_FOUND, 404);
  }

  if (isTerminalStatus(order.status)) {
    throw new OrderError(
      `Order is in terminal state (${order.status}) and cannot be modified`,
      OrderErrorCodes.ORDER_IMMUTABLE,
      409
    );
  }

  if (validated.shippingAddress !== undefined) {
    if (order.status !== 'pending') {
      throw new OrderError(
        'Shipping address can only be updated when order is in pending status',
        OrderErrorCodes.ORDER_IMMUTABLE,
        409
      );
    }

    const parsed = ShippingAddressSchema.parse(validated.shippingAddress);
    const updates = { shipping_address: parsed };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  return order;
}

export async function updateStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  const { data: lockResult, error: lockError } = await supabaseAdmin.rpc('pg_advisory_lock', {
    lock_id: Math.abs(orderId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 2147483647,
  });

  if (lockError) {
    console.warn('Advisory lock failed, proceeding with update:', lockError.message);
  }

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    throw new OrderError('Order not found', OrderErrorCodes.ORDER_NOT_FOUND, 404);
  }

  if (isTerminalStatus(order.status)) {
    throw new OrderError(
      `Order is in terminal state (${order.status}) and cannot be modified`,
      OrderErrorCodes.ORDER_IMMUTABLE,
      409
    );
  }

  if (!isValidTransition(order.status, newStatus)) {
    throw new OrderError(
      `Invalid status transition from ${order.status} to ${newStatus}`,
      OrderErrorCodes.INVALID_STATUS_TRANSITION,
      409
    );
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

function validateShippingAddress(address: ShippingAddress): void {
  try {
    ShippingAddressSchema.parse(address);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new OrderError(
        err.errors.map((e) => e.message).join(', '),
        OrderErrorCodes.INVALID_ADDRESS
      );
    }
    throw err;
  }
}

async function validateInventory(
  items: { productId: string; variantId: string; quantity: number }[]
): Promise<{ productId: string; available: number; requested: number }[]> {
  const unavailable: { productId: string; available: number; requested: number }[] = [];

  for (const item of items) {
    const { data, error } = await supabaseAdmin.rpc('check_inventory', {
      p_product_id: item.productId,
      p_variant_id: item.variantId,
      p_quantity: item.quantity,
    });

    if (error) {
      if (error.code === 'P0001') {
        throw new OrderError(
          'Unable to reserve inventory - item is being processed by another order. Please retry.',
          OrderErrorCodes.INVENTORY_UNAVAILABLE,
          409
        );
      }
      console.error(`Inventory check failed for product ${item.productId}:`, error);
      throw new OrderError(
        `Inventory unavailable for product ${item.productId}`,
        OrderErrorCodes.INVENTORY_UNAVAILABLE
      );
    }

    if (!data) {
      const { data: invData } = await supabaseAdmin
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.productId)
        .eq('variant_id', item.variantId)
        .single();

      const available = invData?.quantity ?? 0;
      unavailable.push({ productId: item.productId, available, requested: item.quantity });
    }
  }

  return unavailable;
}

async function reserveInventoryWithLock(orderId: string, items: { productId: string; variantId: string; quantity: number }[]): Promise<void> {
  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('reserve_inventory_with_lock', {
      p_order_id: orderId,
      p_product_id: item.productId,
      p_variant_id: item.variantId,
      p_quantity: item.quantity,
    });

    if (error) {
      if (error.code === 'P0001' || error.message?.includes('lock')) {
        throw new OrderError(
          'Unable to reserve inventory - another transaction is in progress. Please retry in a moment.',
          OrderErrorCodes.INVENTORY_UNAVAILABLE,
          409
        );
      }
      console.error('Failed to reserve inventory:', error);
      throw new OrderError(
        'Failed to reserve inventory',
        OrderErrorCodes.INVENTORY_UNAVAILABLE
      );
    }
  }
}

async function reserveInventory(orderId: string, items: { productId: string; variantId: string; quantity: number }[]): Promise<void> {
  const { error } = await supabaseAdmin
    .from('inventory_reservations')
    .insert(
      items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }))
    );

  if (error) {
    console.error('Failed to reserve inventory:', error);
  }
}

async function releaseInventoryReservations(orderId: string): Promise<void> {
  await supabaseAdmin
    .from('inventory_reservations')
    .delete()
    .eq('order_id', orderId);
}

async function applyDiscount(code: string | undefined, subtotal: number): Promise<{ discountAmount: number; discountId: string | null }> {
  if (!code) return { discountAmount: 0, discountId: null };

  const result = await validateDiscount(code, subtotal);
  if (!result.valid) {
    const errorMessage = result.error?.includes('expired')
      ? 'This discount code has expired'
      : result.error?.includes('limit')
      ? 'This discount code has reached its usage limit'
      : result.error?.includes('not yet active')
      ? 'This discount code is not yet active'
      : result.error || 'Invalid discount code';

    throw new OrderError(errorMessage, OrderErrorCodes.INVALID_DISCOUNT);
  }

  const { discount_amount } = calculateDiscountAmount(
    { type: result.discount!.type, value: result.discount!.value },
    subtotal
  );

  await supabaseAdmin.rpc('increment_discount_uses', { discount_id: result.discount!.id });

  return { discountAmount: discount_amount, discountId: result.discount!.id };
}

export async function createOrder(input: CreateOrderInput, idempotencyKey?: string): Promise<CreateOrderResponse> {
  const key = idempotencyKey || `${input.customerId || input.guestEmail}-${Date.now()}`;

  validateShippingAddress(input.shippingAddress);

  const unavailable = await validateInventory(input.cartItems);
  if (unavailable.length > 0) {
    const error = unavailable[0];
    throw new OrderError(
      `Inventory unavailable for product ${error.productId}: ${error.available} available, ${error.requested} requested`,
      OrderErrorCodes.INVENTORY_UNAVAILABLE,
      409
    );
  }

  const subtotal = input.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const { discountAmount } = await applyDiscount(input.discountCode, subtotal);

  const shippingAddressForRates = {
    city: input.shippingAddress.city,
    area: input.shippingAddress.state,
    country: input.shippingAddress.country,
  };
  const cartItemsForShipping = input.cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.unitPrice,
    weight: 0.5,
  }));

  let shippingCost = 0;
  try {
    const { methods } = await getShippingRates(shippingAddressForRates, cartItemsForShipping);
    const selectedMethod = methods.find(m => m.method === input.shippingMethodId);
    if (selectedMethod) {
      shippingCost = selectedMethod.cost;
    }
  } catch (shippingError) {
    console.error('Failed to calculate shipping cost:', shippingError);
  }

  const total = subtotal - discountAmount + shippingCost;

  let order;
  let orderError;
  let attempt = 0;

  do {
    const orderNumber = generateOrderNumber();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customerId || null,
        guest_email: input.guestEmail,
        status: 'pending' as OrderStatus,
        subtotal,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        total,
        shipping_address: input.shippingAddress,
        mf_invoice_id: null,
        mf_payment_url: null,
        idempotency_key: key,
      })
      .select()
      .single();

    order = data;
    orderError = error;

    if (orderError && orderError.code === '23505' && attempt < ORDER_NUMBER_RETRY_ATTEMPTS - 1) {
      attempt++;
      continue;
    }
    break;
  } while (attempt < ORDER_NUMBER_RETRY_ATTEMPTS);

  if (orderError) {
    if (orderError.code === '23505') {
      const existingOrder = await findByIdempotencyKey(key);
      if (existingOrder) {
        return {
          order: existingOrder as Order,
          mfInvoiceId: existingOrder.mfInvoiceId ? Number(existingOrder.mfInvoiceId) : 0,
          mfPaymentUrl: existingOrder.mfPaymentUrl || '',
        };
      }
    }
    throw orderError;
  }

  await reserveInventoryWithLock(order.id, input.cartItems);

  const orderItems = input.cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    await releaseInventoryReservations(order.id);
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  return {
    order: order as Order,
    mfInvoiceId: 0,
    mfPaymentUrl: '',
  };
}

export default {
  findById,
  findByOrderNumber,
  findByCustomer,
  findByMfInvoiceId,
  findByIdempotencyKey,
  findPublicByOrderNumber,
  createOrder,
  update,
  updateStatus,
  OrderError,
  OrderErrorCodes,
  ShippingAddressSchema,
  UpdateOrderSchema,
  isTerminalStatus,
  PublicOrder,
};