import {useEffect, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  CheckCircle,
  Mail,
  RefreshCw,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Download,
  Share2,
  ShoppingBag,
  Copy,
  Check,
  Clock,
  Phone,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {useOrderData, useShippingData, usePaymentData, useCheckoutActions} from '@/stores';
import {useCartItems, useCartSummary} from '@/stores';
import {getSessionRecovery} from '@/stores/orderStore';
import {getPaymentStatus} from '@/services/myfatoorah';
import {orderService} from '@/services/order';
import {analytics} from '@/lib/analytics';
import {
  OrderTimeline,
  type OrderStatus,
  type TimelineStep,
} from '@/components/orders/OrderTimeline';
import {useToast} from '@/components/common';

export function Confirmation() {
  const navigate = useNavigate();
  const toast = useToast();
  const orderData = useOrderData();
  const shippingData = useShippingData();
  const paymentData = usePaymentData();
  const cartItems = useCartItems();
  const {subtotal} = useCartSummary();
  const {clearCheckout} = useCheckoutActions();
  const [emailResent, setEmailResent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    analytics.trackPageView({
      pageName: 'checkout_confirmation',
      pageCategory: 'checkout',
    });

    const checkPendingOrder = async () => {
      const sessionRecovery = getSessionRecovery();
      if (!sessionRecovery?.orderId) return;

      const order = await orderService.getOrder(sessionRecovery.orderId);
      if (!order.order || order.order.status !== 'pending') return;

      setIsVerifyingPayment(true);
      try {
        const status = await getPaymentStatus(sessionRecovery.mfInvoiceId || '', 'InvoiceId');
        const isPaid = ['paid', 'completed', 'captured'].includes(status.InvoiceStatus.toLowerCase());

        if (isPaid) {
          await orderService.updateOrderStatus(sessionRecovery.orderId, 'confirmed');
          setPaymentVerified(true);
          toast.success('تم تأكيد الدفع', 'تم تأكيد طلبك بنجاح');
        }
      } catch (err) {
        console.warn('Payment verification failed:', err);
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    checkPendingOrder();
    if (orderData) {
      analytics.trackPurchase({
        orderId: orderData.orderNumber,
        revenue: orderData.total,
        tax: orderData.taxAmount,
        shipping: orderData.shippingCost,
        currency: 'QAR',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
        paymentMethod: paymentData?.method || 'unknown',
        shippingMethod: shippingData?.shippingMethod || 'standard',
      });

      analytics.trackCheckoutStep(4, {
        totalAmount: orderData.total,
        itemCount: cartItems.length,
        products: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
      });
    }
  }, [orderData, cartItems, subtotal, paymentData, shippingData, toast]);

  const handleResendEmail = async () => {
    if (emailResent || isResending) return;

    setIsResending(true);
    try {
      // TODO: Implement actual email resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailResent(true);
      toast.success('تم إرسال البريد', 'تم إرسال بريد التأكيد بنجاح');
    } catch {
      toast.error('خطأ', 'فشل في إرسال البريد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareOrder = () => {
    const shareUrl = `${window.location.origin}/track/${orderData?.orderNumber}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'طلبي من دوحة Roastery',
          text: `تتبع طلبي رقم ${orderData?.orderNumber}`,
          url: shareUrl,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareUrl);
          toast.success('تم النسخ', 'تم نسخ رابط التتبع');
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('تم النسخ', 'تم نسخ رابط التتبع');
    }
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
    toast.info('قريباً', 'سيتم إتاحة تحميل الفاتورة قريباً');
  };

  const handleContinueShopping = () => {
    clearCheckout();
    navigate('/shop');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ar-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Mock order status for demonstration
  const orderStatus: OrderStatus = 'processing';

  const timelineSteps: TimelineStep[] = [
    {
      id: 1,
      label: 'تم تأكيد الطلب',
      labelEn: 'Order Confirmed',
      status: 'completed',
      date: formatDate(new Date().toISOString()),
    },
    {id: 2, label: 'قيد التحضير', labelEn: 'Processing', status: 'current'},
    {id: 3, label: 'تم الشحن', labelEn: 'Shipped', status: 'pending'},
    {id: 4, label: 'تم التسليم', labelEn: 'Delivered', status: 'pending'},
  ];

  if (!orderData) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">لا توجد بيانات طلب</h1>
        <p className="text-stone-600 mb-6">يرجى إتمام عملية الشراء أولاً</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          التسوق الآن
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 1, scale: 1}}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isVerifyingPayment ? (
              <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isVerifyingPayment ? 'جاري التحقق من الدفع...' : paymentVerified ? 'تم تأكيد طلبك!' : 'تم تأكيد طلبك بنجاح!'}
          </h1>
          {isVerifyingPayment && (
            <p className="text-stone-500 text-sm">يرجى الانتظار بينما نتحقق من حالة دفعك</p>
          )}
          {!isVerifyingPayment && (
            <p className="text-stone-600">شكراً لك على طلبك من دوحة Roastery</p>
          )}
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1}}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 mb-1">رقم الطلب</p>
              <p className="text-2xl font-bold text-stone-900">{orderData.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyOrderNumber}
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="نسخ رقم الطلب"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Email Notice */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                تم إرسال بريد التأكيد إلى{' '}
                <span className="font-medium">{shippingData?.email || 'بريدك الإلكتروني'}</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                لم تستلم البريد؟ تحقق من مجلد البريد العشوائي (Spam)
              </p>
              <button
                onClick={handleResendEmail}
                disabled={emailResent || isResending}
                className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {emailResent
                  ? 'تم إعادة الإرسال'
                  : isResending
                    ? 'جاري الإرسال...'
                    : 'إعادة إرسال البريد'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3}}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-stone-900 mb-6">حالة الطلب</h2>
          <OrderTimeline steps={timelineSteps} currentStatus={orderStatus} />
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.4}}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-stone-900 mb-4">ملخص الطلب</h2>

          {/* Items */}
          <div className="border-b border-stone-200 pb-4 mb-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-stone-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-500">الكمية: {item.quantity}</p>
                </div>
                <p className="font-medium text-stone-900">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">المجموع الفرعي</span>
              <span className="text-stone-900">{formatPrice(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">الشحن</span>
              <span className={orderData.shippingCost === 0 ? 'text-green-600' : 'text-stone-900'}>
                {orderData.shippingCost === 0 ? 'مجاني' : formatPrice(orderData.shippingCost)}
              </span>
            </div>
            {orderData.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-500">الخصم</span>
                <span className="text-green-600">-{formatPrice(orderData.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-lg">
              <span className="text-stone-900">الإجمالي</span>
              <span className="text-amber-600">{formatPrice(orderData.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping & Payment Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-900">عنوان الشحن</h3>
            </div>
            {shippingData && (
              <div className="text-sm space-y-1 text-stone-700">
                <p className="font-medium">
                  {shippingData.address.firstName} {shippingData.address.lastName}
                </p>
                <p>{shippingData.address.address1}</p>
                {shippingData.address.address2 && <p>{shippingData.address.address2}</p>}
                <p>
                  {shippingData.address.city}
                  {shippingData.address.state && `, ${shippingData.address.state}`}
                </p>
                <p>{shippingData.address.country}</p>
                {shippingData.address.phone && (
                  <p className="flex items-center gap-1 mt-2">
                    <Phone className="w-4 h-4" />
                    {shippingData.address.phone}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.6}}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-900">طريقة الدفع</h3>
            </div>
            <div className="text-sm text-stone-700">
              <p className="font-medium">
                {paymentData?.method === 'myfatoorah' ? 'MyFatoorah' : 'بطاقة ائتمان'}
              </p>
              {paymentData?.cardLast4 && (
                <p className="text-stone-500 mt-1">**** **** **** {paymentData.cardLast4}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Estimated Delivery */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.7}}
          className="bg-amber-50 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">الوقت المتوقع للتوصيل</p>
              <p className="text-sm text-amber-700">
                {shippingData?.shippingMethod === 'express'
                  ? '2-3 أيام عمل'
                  : shippingData?.shippingMethod === 'overnight'
                    ? 'اليوم التالي'
                    : '5-7 أيام عمل'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.8}}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Link
              to={`/track/${orderData.orderNumber}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Truck className="w-5 h-5" />
              تتبع الطلب
            </Link>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
            >
              <Download className="w-5 h-5" />
              تحميل الفاتورة
            </button>
          </div>

          <button
            onClick={handleShareOrder}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            مشاركة الطلب
          </button>

          <button
            onClick={handleContinueShopping}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            متابعة التسوق
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Confirmation;
