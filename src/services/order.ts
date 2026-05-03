import type { CreateOrderRequest, CreateOrderResponse, Order, OrderStatus, ShippingAddress } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  code: number;
  errorCode: string;

  constructor(message: string, code: number, errorCode: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.errorCode = errorCode;
  }

  isInventoryUnavailable(): boolean {
    return this.errorCode === 'INVENTORY_UNAVAILABLE' || this.code === 409 && this.message.includes('inventory');
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'unknown_error',
      code: response.status,
      message: `HTTP ${response.status}`,
    }));
    throw new ApiError(error.message || `Request failed`, error.code || response.status, error.error || 'unknown');
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function createOrder(data: CreateOrderRequest, idempotencyKey?: string): Promise<CreateOrderResponse> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const response = await fetch(`${API_URL}/api/v1/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result = await handleResponse<CreateOrderResponse & { duplicate?: boolean }>(response);
  return { order: result.order, mfInvoiceId: result.mfInvoiceId, mfPaymentUrl: result.mfPaymentUrl };
}

export async function getOrder(orderId: string, token?: string): Promise<{ order: Order & { items: any[] } }> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1/orders/${orderId}`, { headers });
  return handleResponse<{ order: Order & { items: any[] } }>(response);
}

export async function getOrderByNumber(orderNumber: string, email: string): Promise<{ order: Order }> {
  const response = await fetch(
    `${API_URL}/api/v1/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
  );
  return handleResponse<{ order: Order }>(response);
}

export async function updateOrder(
  orderId: string,
  updates: { shippingAddress?: ShippingAddress },
  token?: string
): Promise<{ order: Order }> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1/orders/${orderId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  return handleResponse<{ order: Order }>(response);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  token?: string
): Promise<{ order: Order }> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/v1/orders/${orderId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  return handleResponse<{ order: Order }>(response);
}

export interface PaymentMethod {
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

export interface InitiatePaymentResponse {
  PaymentMethodId: number;
  PaymentURL: string;
  InvoiceId: number;
}

export interface ExecutePaymentResponse {
  InvoiceId: number;
  InvoiceURL: string;
  PaymentMethodId: number;
}

export async function initiateMyFatoorahPayment(
  amount: number,
  currency: string = 'QAR'
): Promise<{ PaymentMethods: PaymentMethod[] }> {
  const response = await fetch(`${API_URL}/api/v1/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InvoiceAmount: amount, CurrencyIso: currency }),
  });
  const data = await handleResponse<{ Data: { PaymentMethods: PaymentMethod[]; InvoiceId: number; PaymentURL: string } }>(response);
  return { PaymentMethods: data.Data.PaymentMethods };
}

export async function getMyFatoorahPaymentMethods(amount: number, currency: string = 'QAR'): Promise<PaymentMethod[]> {
  const { PaymentMethods } = await initiateMyFatoorahPayment(amount, currency);
  return PaymentMethods;
}

export async function executeMyFatoorahPayment(request: {
  orderId: string;
  paymentMethodId: number;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  successUrl: string;
  errorUrl: string;
  InvoiceItems?: { ItemName: string; Quantity: number; UnitPrice: number }[];
}): Promise<{ InvoiceId: number; InvoiceURL: string; PaymentMethodId: number }> {
  const response = await fetch(`${API_URL}/api/v1/payments/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await handleResponse<{ Data: { InvoiceId: number; InvoiceURL: string; PaymentMethodId: number } }>(response);
  return data.Data;
}

export async function getMyFatoorahPaymentStatus(key: string, keyType: 'InvoiceId' | 'PaymentId' | 'CustomerReference' = 'InvoiceId'): Promise<{
  InvoiceId: number;
  InvoiceStatus: string;
  InvoiceValue: number;
  PaidAt?: string;
  CustomerName: string;
  CustomerEmail: string;
}> {
  const response = await fetch(`${API_URL}/api/v1/payments/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Key: key, KeyType: keyType }),
  });
  const data = await handleResponse<{ Data: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceValue: number;
    PaidAt?: string;
    CustomerName: string;
    CustomerEmail: string;
  } }>(response);
  return data.Data;
}

export const orderService = {
  createOrder,
  getOrder,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
  initiateMyFatoorahPayment,
  getMyFatoorahPaymentMethods,
  executeMyFatoorahPayment,
  getMyFatoorahPaymentStatus,
  ApiError,
};

export default orderService;
