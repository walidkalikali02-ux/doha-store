import { useState, useCallback } from 'react';
import { initiatePayment as apiInitiatePayment, executePayment as apiExecutePayment, PaymentMethod } from '@/services/myfatoorah';

export function useMyFatoorah() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const initiatePayment = useCallback(async (amount: number, currency: string = 'QAR') => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiInitiatePayment(amount, currency);
      setPaymentMethods(data.PaymentMethods || []);
      return data.PaymentMethods;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const executePayment = useCallback(async (request: {
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
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExecutePayment({
        orderId: request.CustomerReference,
        paymentMethodId: request.PaymentMethodId,
        customerName: request.CustomerName,
        customerEmail: request.CustomerEmail,
        customerMobile: request.CustomerMobile || undefined,
        successUrl: request.SuccessUrl,
        errorUrl: request.ErrorUrl,
      });
      setPaymentUrl(response.InvoiceURL);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment execution failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToPayment = useCallback(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  return {
    loading,
    error,
    paymentMethods,
    paymentUrl,
    initiatePayment,
    executePayment,
    redirectToPayment,
    clearError: () => setError(null),
  };
}