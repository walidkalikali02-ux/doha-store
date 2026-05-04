import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/common/Button';
import {
  useShippingData,
  usePaymentData,
  useCartItems,
  useCartSummary,
  useCheckoutActions,
} from '@/stores';
import {formatPrice} from '@/utils/helpers';
import {analytics} from '@/lib/analytics';

export function Review() {
  const navigate = useNavigate();
  const shippingData = useShippingData();
  const paymentData = usePaymentData();
  const cartItems = useCartItems();
  const {subtotal} = useCartSummary();
  const {setOrder, setCurrentStep} = useCheckoutActions();

  const shippingCost = shippingData?.shippingMethod
    ? getShippingCost(shippingData.shippingMethod)
    : 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (shippingData) {
      analytics.trackPageView({
        pageName: 'checkout_review',
        pageCategory: 'checkout',
      });
      analytics.trackCheckoutStep(3, {
        shippingMethod: shippingData.shippingMethod,
        totalAmount: total,
        itemCount: cartItems.length,
        products: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
      });
    }
  }, [shippingData, total, cartItems]);

  const handlePlaceOrder = () => {
    analytics.trackEvent({
      eventName: 'place_order_click',
      eventCategory: 'checkout',
      eventLabel: 'review_step',
      eventValue: total,
    });

    setOrder({
      orderNumber: `ORD-${Date.now()}`,
      subtotal,
      shippingCost,
      taxAmount: 0,
      discountAmount: 0,
      total,
    });
    setCurrentStep('confirmation');
    navigate('/checkout/confirmation');
  };

  if (!shippingData) {
    navigate('/checkout/shipping');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">المنتجات</h2>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-stone-500">
                  {item.size} / {item.grind.replace('_', ' ')} × {item.quantity}
                </p>
              </div>
              <span className="font-medium">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">عنوان الشحن</h2>
        <div className="text-stone-600">
          <p>
            {shippingData.address.firstName} {shippingData.address.lastName}
          </p>
          <p>{shippingData.address.address1}</p>
          {shippingData.address.address2 && <p>{shippingData.address.address2}</p>}
          <p>
            {shippingData.address.city}, {shippingData.address.state}{' '}
            {shippingData.address.postalCode}
          </p>
          <p>{shippingData.address.country}</p>
          <p className="mt-2">{shippingData.phone}</p>
          <p>{shippingData.email}</p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">الدفع</h2>
        <p className="text-stone-600">
          {paymentData?.method === 'stripe' ? 'بطاقة ائتمان' : 'طريقة دفع أخرى'}
          {paymentData?.cardLast4 && ` انتهاء بـ ${paymentData.cardLast4}`}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>المجموع الفرعي</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>الشحن</span>
            <span>{shippingCost === 0 ? 'مجاني' : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-bold">
            <span>الإجمالي</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => navigate('/checkout/payment')}>
          ← العودة للدفع
        </Button>
        <Button onClick={handlePlaceOrder} size="lg">
          تأكيد الطلب
        </Button>
      </div>
    </div>
  );
}

function getShippingCost(method: string): number {
  const costs: Record<string, number> = {
    standard: 0,
    express: 1250,
    overnight: 2500,
    local_pickup: 0,
  };
  return costs[method] || 0;
}
