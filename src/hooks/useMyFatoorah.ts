import { useState, useCallback } from 'react';
import { initiatePayment as apiInitiatePayment, executePayment as apiExecutePayment, PaymentMethod, ExecutePaymentRequest } from '@/services/myfatoorah';

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

  const executePayment = useCallback(async (request: ExecutePaymentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExecutePayment(request);
      if (response.IsSuccess && response.Data?.InvoiceURL) {
        setPaymentUrl(response.Data.InvoiceURL);
        return response;
      }
      throw new Error(response.Message || 'Payment execution failed');
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