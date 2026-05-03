export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId: string;
  paymentMethodId: string;
  paymentIntentId: string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'payment_failed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export function createOrder(data: Partial<Order>): Order {
  return {
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber(),
    customerId: data.customerId || null,
    email: data.email || '',
    status: 'pending',
    items: data.items || [],
    subtotal: data.subtotal || 0,
    shippingCost: data.shippingCost || 0,
    taxAmount: data.taxAmount || 0,
    discountAmount: data.discountAmount || 0,
    total: data.total || 0,
    shippingAddress: data.shippingAddress || { line1: '', city: '', state: '', postalCode: '', country: '' },
    billingAddress: data.billingAddress || { line1: '', city: '', state: '', postalCode: '', country: '' },
    shippingMethodId: data.shippingMethodId || '',
    paymentMethodId: data.paymentMethodId || '',
    paymentIntentId: null,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export default { createOrder };