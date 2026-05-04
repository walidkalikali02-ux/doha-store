import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  Package,
  CheckCircle,
  Smartphone,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import {useMyFatoorah} from '@/hooks/useMyFatoorah';
import {useCheckoutActions, useShippingData, useCartSummary, useCartItems} from '@/stores';
import {useOrderStore} from '@/stores/orderStore';
import {usePaymentRetry} from '@/hooks/useOrder';
import {analytics} from '@/lib/analytics';

const getPaymentIcon = (methodCode: string) => {
  const code = methodCode.toLowerCase();
  if (code.includes('card') || code.includes('visa') || code.includes('master')) {
    return CreditCard;
  }
  if (code.includes('apple')) {
    return Wallet;
  }
  if (code.includes('google')) {
    return Smartphone;
  }
  return CreditCard;
};

function getShippingCost(method: string): number {
  const costs: Record<string, number> = {
    standard: 0,
    express: 1250,
    overnight: 2500,
    local_pickup: 0,
  };
  return costs[method] || 0;
}

export function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutActions = useCheckoutActions();
  const {setPayment} = checkoutActions;
  const shippingData = useShippingData();
  const cartItems = useCartItems();
  const {subtotal} = useCartSummary();
  const orderStore = useOrderStore();

  const errorCode = searchParams.get('error');
  const errorReason = searchParams.get('reason');
  const orderIdFromError = searchParams.get('orderId');

  const {loading, error, paymentMethods, initiatePayment, executePayment, redirectToPayment} =
    useMyFatoorah();

  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const {initiateRetry, selectedPaymentMethodId, hasPaymentMethod} = usePaymentRetry(orderIdFromError);

  const shippingCost = shippingData?.shippingMethod
    ? getShippingCost(shippingData.shippingMethod)
    : 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (!shippingData) {
      navigate('/checkout/shipping');
      return;
    }
    checkoutActions.setCurrentStep?.('payment');
    analytics.trackPageView({
      pageName: 'checkout_payment',
      pageCategory: 'checkout',
    });
    analytics.trackCheckoutStep(2, {
      shippingMethod: shippingData.shippingMethod,
      totalAmount: total,
      itemCount: cartItems.length,
    });
  }, [shippingData, navigate, checkoutActions, total, cartItems.length]);

  useEffect(() => {
    if (orderIdFromError && hasPaymentMethod) {
      setSelectedMethodId(selectedPaymentMethodId);
    }
  }, [orderIdFromError, hasPaymentMethod, selectedPaymentMethodId]);

  useEffect(() => {
    const init = async () => {
      try {
        await initiatePayment(total, 'QAR');
      } catch {
        setInitError('فشل في تحميل طرق الدفع. يرجى المحاولة مرة أخرى.');
      }
    };
    init();
  }, [total, initiatePayment]);

  const handleRetry = async () => {
    if (!orderIdFromError || !selectedMethodId) return;

    setIsRetrying(true);
    setRetryError(null);

    try {
      const newPaymentUrl = await initiateRetry();
      if (newPaymentUrl) {
        window.location.href = newPaymentUrl;
      } else {
        setRetryError('فشل في إعادة تحميل صفحة الدفع. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في إعادة المحاولة';
      setRetryError(msg);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethodId || !shippingData) return;

    const selectedMethod = paymentMethods.find(m => m.PaymentMethodId === selectedMethodId);
    if (selectedMethod) {
      analytics.trackPaymentSelected(selectedMethod.PaymentCode);
    }

    orderStore.setPaymentMethodId(selectedMethodId);

    setIsSubmitting(true);
    try {
      setPayment({
        method: 'stripe',
        billingAddressSameAsShipping: true,
      });

      await executePayment({
        InvoiceValue: total,
        CustomerName: `${shippingData.address.firstName} ${shippingData.address.lastName}`,
        CustomerEmail: shippingData.email,
        CustomerMobile: shippingData.phone,
        CustomerReference: `ORDER-${Date.now()}`,
        DisplayCurrencyIso: 'QAR',
        PaymentMethodId: selectedMethodId,
        SuccessUrl: `${window.location.origin}/checkout/confirmation`,
        ErrorUrl: `${window.location.origin}/checkout/payment?error=1`,
        Language: 'AR',
      });
      redirectToPayment();
    } catch (err) {
      const isDiscountInvalid = err instanceof Error && err.name === 'DISCOUNT_INVALID';
      const errorMessage = isDiscountInvalid
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Payment failed';

      if (isDiscountInvalid) {
        setDiscountError(err.message);
        analytics.trackError({
          errorType: 'discount_invalid',
          errorMessage: err.message,
          step: 2,
        });
      } else {
        analytics.trackError({
          errorType: 'payment_error',
          errorMessage,
          step: 2,
          additionalData: {
            paymentMethodId: selectedMethodId,
          },
        });
      }

      console.error('Payment failed:', err);
      setIsSubmitting(false);
    }
  };

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  }, []);

  const displayError = error || initError || discountError;

  const hasErrorFromRedirect = errorCode || errorReason;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Error Banner from Redirect */}
      <AnimatePresence>
        {hasErrorFromRedirect && (
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className="bg-red-50 border-b border-red-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800 text-sm">فشل الدفع</p>
                    <p className="text-sm text-red-600">
                      {errorReason === 'payment_failed' && 'تم رفض عملية الدفع. يرجى المحاولة مرة أخرى.'}
                      {errorReason === 'expired' && 'انتهت صلاحية الدفع. يرجى المحاولة مرة أخرى.'}
                      {errorReason === 'invalid_callback' && 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'}
                      {!errorReason && 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
                    </p>
                  </div>
                </div>
                {orderIdFromError && hasPaymentMethod && (
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isRetrying ? (
                      <>
                        <motion.div
                          animate={{rotate: 360}}
                          transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                          className="w-4 h-4 border-2 border-white border-t-transparent"
                        />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        المحاولة مرة أخرى
                      </>
                    )}
                  </button>
                )}
              </div>
              {retryError && (
                <p className="mt-2 text-sm text-red-600 mr-8">{retryError}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Progress Header */}
      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        className="bg-white border-b border-brand-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/checkout/shipping')}
              className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors group"
            >
              <ChevronRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">العودة للشحن</span>
            </button>

            <div className="flex items-center gap-1">
              <span className="section-subtitle !mb-0 !text-[8px]">الخطوة ٢ من ٣</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Form */}
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5}}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section: Payment Method */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-black text-white flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-black">طريقة الدفع</h2>
                    <p className="text-xs text-brand-gray-500">Payment Method</p>
                  </div>
                </div>

                <div className="bg-white p-6 shadow-premium">
                  {/* Security Badge */}
                  <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-100 mb-6">
                    <div className="w-10 h-10 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-sm">دفع آمن 100%</p>
                      <p className="text-xs text-green-600">جميع المعاملات مشفرة ببروتوكول SSL</p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  {loading && paymentMethods.length === 0 ? (
                    <div className="py-12 text-center">
                      <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        className="w-8 h-8 border-2 border-brand-gold border-t-transparent mx-auto mb-4"
                      />
                      <p className="text-sm text-brand-gray-500">جاري تحميل طرق الدفع...</p>
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method, index) => {
                        const Icon = getPaymentIcon(method.PaymentCode);
                        const isSelected = selectedMethodId === method.PaymentMethodId;

                        return (
                          <motion.label
                            key={method.PaymentMethodId}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.05}}
                            onClick={() => setSelectedMethodId(method.PaymentMethodId)}
                            className={`relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'bg-brand-gray-50 border-l-4 border-l-brand-gold'
                                : 'bg-white border-l-4 border-l-transparent hover:bg-brand-gray-50/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.PaymentMethodId}
                              checked={isSelected}
                              onChange={() => setSelectedMethodId(method.PaymentMethodId)}
                              className="sr-only"
                            />

                            <div
                              className={`w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
                                isSelected
                                  ? 'bg-brand-gold text-white'
                                  : 'bg-brand-gray-100 text-brand-gray-500'
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>

                            <div className="flex-1">
                              <span className="font-bold text-brand-black block">
                                {method.PaymentMethodAr}
                              </span>
                              <span className="text-xs text-brand-gray-500">
                                {method.PaymentMethodEn}
                              </span>
                            </div>

                            {isSelected && (
                              <motion.div
                                layoutId="payment-check"
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                              >
                                <div className="w-6 h-6 bg-brand-gold text-white flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              </motion.div>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-brand-gray-300 mx-auto mb-4" />
                      <p className="text-brand-gray-500">لا توجد طرق دفع متاحة حالياً</p>
                    </div>
                  )}

                  {/* Powered by */}
                  <div className="mt-6 pt-6 border-t border-brand-gray-100">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-brand-gray-400">مدعوم بواسطة</span>
                      <span className="text-sm font-bold text-brand-black">MyFatoorah</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Error Message */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    className="bg-red-50 border-r-4 border-red-500 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-800 text-sm">
                          {discountError ? 'كود الخصم' : 'حدث خطأ'}
                        </p>
                        <p className="text-sm text-red-600">{displayError}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button - Mobile Only */}
              <div className="lg:hidden">
                <motion.button
                  type="submit"
                  disabled={!selectedMethodId || loading || isSubmitting}
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        className="w-4 h-4 border-2 border-white border-t-transparent"
                      />
                      جاري التوجيه لبوابة الدفع...
                    </span>
                  ) : (
                    <>
                      إتمام الدفع
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5, delay: 0.2}}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="bg-white shadow-premium lg:sticky lg:top-24">
              {/* Header */}
              <div className="p-6 border-b border-brand-gray-100">
                <h2 className="text-lg font-bold text-brand-black">ملخص الطلب</h2>
                <p className="text-xs text-brand-gray-500">Order Summary</p>
              </div>

              {/* Items */}
              <div className="p-6 border-b border-brand-gray-100">
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-brand-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-brand-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-black text-sm truncate">{item.name}</p>
                        <p className="text-xs text-brand-gray-500">
                          {item.size} / {item.grind.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-brand-gray-500 mt-1">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-brand-black text-sm">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">
                    المجموع الفرعي ({cartItems.length} منتج)
                  </span>
                  <span className="font-medium text-brand-black">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">الشحن</span>
                  <span className="text-green-600 font-medium">مجاني</span>
                </div>

                <div className="pt-4 border-t border-brand-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-brand-black">الإجمالي</span>
                      <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider">
                        Total
                      </p>
                    </div>
                    <motion.span
                      key={total}
                      initial={{scale: 0.8, opacity: 0}}
                      animate={{scale: 1, opacity: 1}}
                      className="text-2xl font-black text-brand-black"
                    >
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block p-6 pt-0">
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!selectedMethodId || loading || isSubmitting}
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        className="w-4 h-4 border-2 border-white border-t-transparent"
                      />
                      جاري التوجيه لبوابة الدفع...
                    </span>
                  ) : (
                    <>
                      إتمام الدفع
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-gray-500">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                  <span>دفع آمن مشفّر 100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
