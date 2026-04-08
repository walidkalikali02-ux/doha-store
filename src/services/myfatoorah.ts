import axios from 'axios';

const MYFATOORAH_API_KEY = import.meta.env.VITE_MYFATOORAH_API_KEY || '';
const MYFATOORAH_BASE_URL = import.meta.env.VITE_MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';

export interface InitiatePaymentRequest {
  InvoiceAmount: number;
  CurrencyIso: string;
}

export interface ExecutePaymentRequest {
  InvoiceValue: number;
  CustomerName: string;
  CustomerEmail: string;
  CustomerMobile: string;
  CustomerReference: string;
  DisplayCurrencyIso: string;
  PaymentMethodId: number;
  SuccessUrl: string;
  ErrorUrl: string;
  Language?: string;
}

export interface PaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: string[];
  Data: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string;
    UserDefinedField: string;
  };
}

export interface PaymentMethod {
  PaymentMethodId: number;
  PaymentMethodAr: string;
  PaymentMethodEn: string;
  PaymentCode: string;
  IsDirectPayment: boolean;
  CurrencyIso: string;
  IsAttached: boolean;
}

const api = axios.create({
  baseURL: MYFATOORAH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
  },
});

export async function initiatePayment(amount: number, currency: string = 'QAR'): Promise<{ PaymentMethods: PaymentMethod[] }> {
  const response = await api.post('/v2/InitiatePayment', {
    InvoiceAmount: amount,
    CurrencyIso: currency,
  });
  return response.data.Data;
}

export async function executePayment(request: ExecutePaymentRequest): Promise<PaymentResponse> {
  const response = await api.post('/v2/ExecutePayment', request);
  return response.data;
}

export async function getPaymentStatus(invoiceId: string, keyType: 'InvoiceId' | 'CustomerReference' = 'InvoiceId'): Promise<PaymentResponse> {
  const response = await api.post('/v2/PaymentStatus', {
    Key: invoiceId,
    KeyType: keyType,
  });
  return response.data;
}

export { MYFATOORAH_BASE_URL };