import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/common/Button';
import {useMyFatoorah} from '@/hooks/useMyFatoorah';
import {useCart} from '@/hooks/useCartLegacy';

export function Payment() {
  const navigate = useNavigate();
  const {totalPrice} = useCart();
  const {loading, error, paymentMethods, initiatePayment, executePayment, redirectToPayment} = useMyFatoorah();
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'myfatoorah'>('myfatoorah');

  useEffect(() => {
    if (!initialized && totalPrice > 0) {
      initiatePayment(totalPrice, 'QAR');
      setInitialized(true);
    }
  }, [totalPrice, initialized, initiatePayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMethodId) {
      try {
        await executePayment({
          InvoiceValue: totalPrice,
          CustomerName: 'Customer',
          CustomerEmail: 'customer@example.com',
          CustomerMobile: '+97450000000',
          CustomerReference: `ORDER-${Date.now()}`,
          DisplayCurrencyIso: 'QAR',
          PaymentMethodId: selectedMethodId,
          SuccessUrl: `${window.location.origin}/checkout/confirmation`,
          ErrorUrl: `${window.location.origin}/checkout/payment?error=1`,
        });
        redirectToPayment();
      } catch (err) {
        console.error('Payment failed:', err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">طريقة الدفع</h2>

          <div className="space-y-3">
            <label
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'myfatoorah'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-stone-200 hover:border-amber-400'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="myfatoorah"
                checked={paymentMethod === 'myfatoorah'}
                onChange={e => setPaymentMethod(e.target.value as 'myfatoorah')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <div className="ml-3">
                <span className="font-medium">MyFatoorah (بطاقة ائتمان / مدى)</span>
                <p className="text-sm text-stone-500">دفع آمن عبر MyFatoorah</p>
              </div>
            </label>

            {paymentMethod === 'myfatoorah' && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-stone-700">اختر طريقة الدفع:</p>
                {loading && !paymentMethods.length ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm text-stone-500">جاري تحميل طرق الدفع...</p>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.PaymentMethodId}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMethodId === method.PaymentMethodId
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.PaymentMethodId}
                          checked={selectedMethodId === method.PaymentMethodId}
                          onChange={() => setSelectedMethodId(method.PaymentMethodId)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-3">{method.PaymentMethodEn}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">لا توجد طرق دفع متاحة</p>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/checkout/shipping')}>
            ← العودة إلى الشحن
          </Button>
          <Button 
            type="submit" 
            size="lg" 
            disabled={!selectedMethodId || loading}
          >
            {loading ? 'جاري المعالجة...' : 'متابعة الدفع'}
          </Button>
        </div>
      </form>
    </div>
  );
}
