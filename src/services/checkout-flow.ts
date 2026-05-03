import { orderService } from './order';
import type { CreateOrderRequest, Order } from '../types/order';
import type { PaymentMethod, ExecutePaymentResponse } from '../services/order';

export interface CheckoutFlowState {
  order: Order | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  paymentUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function initiatePayment(
  amount: number,
  currency: string = 'QAR'
): Promise<{ PaymentMethods: PaymentMethod[] }> {
  const response = await fetch(`${API_URL}/api/myfatoorah/initiate-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ InvoiceAmount: amount, CurrencyIso: currency }),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate payment');
  }

  const data = await response.json();
  return data.Data;
}

export async function executePayment(request: {
  InvoiceValue: number;
  CustomerName: string;
  CustomerEmail: string;
  CustomerMobile: string;
  CustomerReference: string;
  PaymentMethodId: number;
  SuccessUrl: string;
  ErrorUrl: string;
  DisplayCurrencyIso?: string;
  Language?: string;
}): Promise<ExecutePaymentResponse> {
  const response = await fetch(`${API_URL}/api/myfatoorah/execute-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to execute payment');
  }

  const data = await response.json();
  return data.Data;
}

export interface CheckoutInput {
  email: string;
  customerId?: string;
  items: { productId: string; variantId: string; quantity: number; unitPrice: number; name: string }[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  shippingMethodId: string;
  discountCode?: string;
  paymentMethodId: number;
}

export async function createOrderThenInitiatePayment(input: CheckoutInput): Promise<{
  order: Order;
  paymentMethods: PaymentMethod[];
}> {
  const createOrderRequest: CreateOrderRequest = {
    email: input.email,
    customerId: input.customerId,
    items: input.items,
    shippingAddress: input.shippingAddress,
    shippingMethodId: input.shippingMethodId,
    discountCode: input.discountCode,
    paymentMethodId: input.paymentMethodId,
  };

  const orderResult = await orderService.createOrder(createOrderRequest);

  const totalAmount = orderResult.order.total;
  const paymentMethodsResult = await initiatePayment(totalAmount);

  return {
    order: orderResult.order,
    paymentMethods: paymentMethodsResult.PaymentMethods,
  };
}

export async function executePaymentForOrder(orderId: string, paymentMethodId: number, customerEmail: string): Promise<string> {
  const successUrl = `${window.location.origin}/checkout/success?orderId=${orderId}`;
  const errorUrl = `${window.location.origin}/checkout/error?orderId=${orderId}`;

  const order = await orderService.getOrder(orderId);

  const executeResult = await executePayment({
    InvoiceValue: order.order.total,
    CustomerName: 'Customer',
    CustomerEmail: customerEmail,
    CustomerMobile: '',
    CustomerReference: orderId,
    PaymentMethodId: paymentMethodId,
    SuccessUrl: successUrl,
    ErrorUrl: errorUrl,
    DisplayCurrencyIso: 'QAR',
    Language: 'en',
  });

  return executeResult.InvoiceURL;
}

export function redirectToPaymentPage(paymentUrl: string): void {
  window.location.href = paymentUrl;
}

export const checkoutFlow = {
  createOrderThenInitiatePayment,
  executePaymentForOrder,
  redirectToPaymentPage,
  initiatePayment,
  executePayment,
};

export default checkoutFlow;