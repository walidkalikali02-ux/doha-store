import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 409 && error.response?.data?.error === 'discount_invalid') {
      const customError = new Error(error.response.data.message || 'Discount code is invalid');
      customError.name = 'DISCOUNT_INVALID';
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

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

export interface ExecutePaymentRequest {
  orderId: string;
  paymentMethodId: number;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  successUrl: string;
  errorUrl: string;
  InvoiceItems?: { ItemName: string; Quantity: number; UnitPrice: number }[];
}

export interface ExecutePaymentResponse {
  InvoiceId: number;
  InvoiceURL: string;
  PaymentMethodId: number;
}

export interface GetPaymentStatusRequest {
  Key: string;
  KeyType: 'InvoiceId' | 'PaymentId' | 'CustomerReference';
}

export interface PaymentStatusResponse {
  InvoiceId: number;
  InvoiceStatus: string;
  InvoiceValue: number;
  PaidAt?: string;
  CustomerName: string;
  CustomerEmail: string;
}

export async function initiatePayment(
  amount: number,
  currency: string = 'QAR'
): Promise<{ PaymentMethods: PaymentMethod[] }> {
  const response = await api.post('/api/v1/payments/initiate', {
    InvoiceAmount: amount,
    CurrencyIso: currency,
  });
  return response.data.Data;
}

export async function executePayment(
  request: ExecutePaymentRequest
): Promise<ExecutePaymentResponse> {
  const response = await api.post('/api/v1/payments/execute', request);
  return response.data.Data;
}

export async function getPaymentStatus(
  key: string,
  keyType: 'InvoiceId' | 'PaymentId' | 'CustomerReference' = 'InvoiceId'
): Promise<PaymentStatusResponse> {
  const response = await api.post('/api/v1/payments/status', {
    Key: key,
    KeyType: keyType,
  });
  return response.data.Data;
}