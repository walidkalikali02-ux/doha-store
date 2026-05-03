import axios, { AxiosInstance } from 'axios';
import { createHmac } from 'crypto';

const BASE_URL = process.env.MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';

export interface MyFatoorahApiError extends Error {
  code: string;
  statusCode: number;
  validationErrors?: Record<string, string[]>;
}

export class MyfatoorahApiError extends Error implements MyFatoorahApiError {
  code: string;
  statusCode: number;
  validationErrors?: Record<string, string[]>;

  constructor(message: string, code: string, statusCode: number, validationErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'MyfatoorahApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

export interface InitiatePaymentRequest {
  InvoiceAmount: number;
  CurrencyIso: string;
}

export interface InitiatePaymentResponse {
  PaymentMethodId: number;
  PaymentURL: string;
  InvoiceId: number;
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
  InvoiceId: number;
  InvoiceURL: string;
  PaymentMethodId: number;
}

export interface PaymentStatusRequest {
  Key: string;
  KeyType: 'InvoiceId' | 'PaymentId' | 'CustomerReference';
}

export interface PaymentStatusResponse {
  InvoiceId: number;
  InvoiceStatus: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  InvoiceValue: number;
  PaidAt?: string;
  CustomerName: string;
  CustomerEmail: string;
}

export interface RefundRequest {
  KeyType: 'InvoiceId';
  Key: string;
  RefundChargeOnCustomer: boolean;
  ServiceChargeOnCustomer: boolean;
  Amount: number;
  Comment: string;
}

export interface RefundResponse {
  RefundId: number;
  KeyType: string;
  Key: string;
  Amount: number;
  Status: 'Pending' | 'Completed' | 'Rejected';
  RefundReference: string;
}

interface MyFatoorahResponse<T> {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: Record<string, string[]> | null;
  Data: T | null;
}

export class MyFatoorahClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, baseUrl: string = BASE_URL) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
      timeout: 30000,
    });
  }

  private parseResponse<T>(response: MyFatoorahResponse<T>): T {
    if (!response.IsSuccess || !response.Data) {
      const error = new MyfatoorahApiError(
        response.Message,
        'MYFATOORAH_API_ERROR',
        400,
        response.ValidationErrors || undefined
      );
      throw error;
    }
    return response.Data;
  }

  async initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const response = await this.client.post<MyFatoorahResponse<InitiatePaymentResponse>>(
      '/v2/InitiatePayment',
      data
    );
    return this.parseResponse(response.data);
  }

  async executePayment(data: ExecutePaymentRequest): Promise<ExecutePaymentResponse> {
    const response = await this.client.post<MyFatoorahResponse<ExecutePaymentResponse>>(
      '/v2/ExecutePayment',
      data
    );
    return this.parseResponse(response.data);
  }

  async getPaymentStatus(data: PaymentStatusRequest): Promise<PaymentStatusResponse> {
    const response = await this.client.post<MyFatoorahResponse<PaymentStatusResponse>>(
      '/v2/PaymentStatus',
      data
    );
    return this.parseResponse(response.data);
  }

  async makeRefund(data: RefundRequest): Promise<RefundResponse> {
    const response = await this.client.post<MyFatoorahResponse<RefundResponse>>(
      '/v2/MakeRefund',
      data
    );
    return this.parseResponse(response.data);
  }
}

export function verifyMyFatoorahWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret);
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  const expectedSignature = hmac.update(data).digest('base64');
  try {
    return hmac.timingSafeEqual(Buffer.from(signature), expectedSignature);
  } catch {
    return false;
  }
}

let clientInstance: MyFatoorahClient | null = null;

export function getMyFatoorahClient(): MyFatoorahClient {
  if (!clientInstance) {
    const apiKey = process.env.MYFATOORAH_API_KEY;
    if (!apiKey) {
      throw new Error('MYFATOORAH_API_KEY is not configured');
    }
    clientInstance = new MyFatoorahClient(apiKey);
  }
  return clientInstance;
}

export default MyFatoorahClient;