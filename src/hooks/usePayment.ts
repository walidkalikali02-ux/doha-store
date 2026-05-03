import {useMutation, useQuery} from '@tanstack/react-query';
import {useMyFatoorah} from './useMyFatoorah';
import {useToast} from '@/components/common';

interface InitiatePaymentParams {
  amount: number;
  currency: string;
}

interface ExecutePaymentParams {
  invoiceValue: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerReference: string;
  displayCurrencyIso: string;
  paymentMethodId: number;
  successUrl: string;
  errorUrl: string;
  language: string;
}

export function usePaymentMethods(amount: number) {
  const {initiatePayment, paymentMethods} = useMyFatoorah();

  return useQuery({
    queryKey: ['paymentMethods', amount],
    queryFn: async () => {
      await initiatePayment(amount, 'KWD');
      return paymentMethods;
    },
    enabled: amount > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useInitiatePayment() {
  const {initiatePayment} = useMyFatoorah();
  const toast = useToast();

  return useMutation({
    mutationFn: async (params: InitiatePaymentParams) => {
      await initiatePayment(params.amount, params.currency);
      return {success: true};
    },

    onError: (error: Error) => {
      toast.error('خطأ في تحميل طرق الدفع', 'يرجى المحاولة مرة أخرى');
      console.error('Initiate payment error:', error);
    },
  });
}

export function useExecutePayment() {
  const {executePayment, redirectToPayment} = useMyFatoorah();
  const toast = useToast();

  return useMutation({
    mutationFn: async (params: ExecutePaymentParams) => {
      const result = await executePayment({
        InvoiceValue: params.invoiceValue,
        CustomerName: params.customerName,
        CustomerEmail: params.customerEmail,
        CustomerMobile: params.customerMobile,
        CustomerReference: params.customerReference,
        DisplayCurrencyIso: params.displayCurrencyIso,
        PaymentMethodId: params.paymentMethodId,
        SuccessUrl: params.successUrl,
        ErrorUrl: params.errorUrl,
        Language: params.language,
      });
      return result;
    },

    onSuccess: () => {
      toast.success('جاري التوجيه', 'سيتم تحويلك لبوابة الدفع الآمنة');
      redirectToPayment();
    },

    onError: (error: Error) => {
      toast.error('خطأ في الدفع', 'فشل في معالجة الدفع. يرجى المحاولة مرة أخرى');
      console.error('Execute payment error:', error);
    },
  });
}

export function useProcessPayment() {
  const executePayment = useExecutePayment();

  const processPayment = async (
    paymentMethodId: number,
    total: number,
    customerData: {name: string; email: string; phone: string}
  ) => {
    await executePayment.mutateAsync({
      invoiceValue: total,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerMobile: customerData.phone,
      customerReference: `ORD-${Date.now()}`,
      displayCurrencyIso: 'KWD',
      paymentMethodId,
      successUrl: `${window.location.origin}/checkout/confirmation`,
      errorUrl: `${window.location.origin}/checkout/payment?error=1`,
      language: 'AR',
    });
  };

  return {
    processPayment,
    isLoading: executePayment.isPending,
    error: executePayment.error,
  };
}

export function usePaymentStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('paymentId');
  const error = urlParams.get('error');

  return {
    paymentId,
    hasError: error === '1',
    isProcessing: !!paymentId && !error,
  };
}
