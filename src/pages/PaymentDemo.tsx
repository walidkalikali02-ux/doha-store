import { useState } from 'react';
import { useMyFatoorah } from '@/hooks/useMyFatoorah';

export function PaymentDemo() {
  const [amount, setAmount] = useState(100);
  const { loading, error, paymentMethods, initiatePayment, executePayment, redirectToPayment } = useMyFatoorah();
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  const handleInitiatePayment = async () => {
    const methods = await initiatePayment(amount, 'QAR');
    if (methods?.length > 0) {
      setSelectedMethod(methods[0].PaymentMethodId);
    }
  };

  const handleExecutePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      await executePayment({
        InvoiceValue: amount,
        CustomerName: 'Test Customer',
        CustomerEmail: 'test@example.com',
        CustomerMobile: '+97450000000',
        CustomerReference: `ORDER-${Date.now()}`,
        DisplayCurrencyIso: 'QAR',
        PaymentMethodId: selectedMethod,
        SuccessUrl: `${window.location.origin}/payment/success`,
        ErrorUrl: `${window.location.origin}/payment/error`,
      });
      redirectToPayment();
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-20">
      <div className="max-w-md mx-auto px-6">
        <h1 className="text-2xl font-bold text-center mb-8">MyFatoorah Payment Demo</h1>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount (QAR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
            />
          </div>

          <button
            onClick={handleInitiatePayment}
            disabled={loading}
            className="w-full bg-brand-gold text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mb-4"
          >
            {loading ? 'Loading...' : 'Get Payment Methods'}
          </button>

          {paymentMethods.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                value={selectedMethod || ''}
                onChange={(e) => setSelectedMethod(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold"
              >
                {paymentMethods.map((method) => (
                  <option key={method.PaymentMethodId} value={method.PaymentMethodId}>
                    {method.PaymentMethodEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {paymentMethods.length > 0 && (
            <button
              onClick={handleExecutePayment}
              disabled={loading || !selectedMethod}
              className="w-full bg-[#0F766E] text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a demo/test environment</p>
          <p className="mt-1">Test Card: 5123 4500 0000 0008</p>
          <p>Expiry: 05/25 | CVV: 100</p>
        </div>
      </div>
    </div>
  );
}