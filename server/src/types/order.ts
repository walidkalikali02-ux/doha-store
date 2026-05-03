export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed'
  | 'refunded';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
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
  mfInvoiceId: string | null;
  mfPaymentUrl: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface MyFatoorahPaymentMethod {
  PaymentMethodId: number;
  PaymentMethodEn: string;
  PaymentMethodAr: string;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  IsDirectPayment: boolean;
  IsEmbeddedSupported: boolean;
  ImageUrl: string;
}

export interface InitiatePaymentRequest {
  InvoiceAmount: number;
  CurrencyIso: string;
}

export interface InitiatePaymentResponse {
  paymentMethodId: number;
  paymentURL: string;
  invoiceId: number;
}

export interface ExecutePaymentRequest {
  InvoiceValue: number;
  CustomerName: string;
  CustomerEmail: string;
  CustomerMobile: string;
  CustomerReference: string;
  DisplayCurrencyIso?: string;
  PaymentMethodId: number;
  SuccessUrl: string;
  ErrorUrl: string;
  Language?: string;
}

export interface ExecutePaymentResponse {
  invoiceId: number;
  invoiceURL: string;
  paymentMethodId: number;
}

export interface GetPaymentStatusResponse {
  invoiceId: number;
  invoiceStatus: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  invoiceValue: number;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
}

export interface MyFatoorahWebhookPayload {
  event: 'InvoiceCreated' | 'InvoicePaymentCompleted' | 'InvoicePaymentFailed';
  dateTime: string;
  countryId: number;
  signature: string;
  referenceId: string;
  invoiceId: number;
  invoiceStatus: string;
  invoiceValue: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
}

export interface CreateOrderRequest {
  email: string;
  customerId?: string;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    name: string;
  }[];
  shippingAddress: ShippingAddress;
  shippingMethodId: string;
  discountCode?: string;
  paymentMethodId: number;
}

export interface UpdateOrderRequest {
  orderId: string;
  status?: OrderStatus;
  shippingAddress?: ShippingAddress;
  mfInvoiceId?: string;
  mfPaymentUrl?: string;
}

export interface CreateOrderResponse {
  order: Order;
  mfInvoiceId: number;
  mfPaymentUrl: string;
}