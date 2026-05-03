import { useState, useId, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Share2,
  Copy,
  Truck,
} from 'lucide-react';
import { useOrderByNumber } from '@/hooks/useOrder';
import type { Order } from '@/types/order';

const statusConfig: Record<string, { label: string; labelAr: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', labelAr: 'في الانتظار', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmed', labelAr: 'تم التأكيد', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle },
  processing: { label: 'Processing', labelAr: 'قيد التحضير', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Package },
  shipped: { label: 'Shipped', labelAr: 'تم الشحن', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Package },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', labelAr: 'ملغى', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
  payment_failed: { label: 'Payment Failed', labelAr: 'فشل الدفع', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
};

const timelineSteps = [
  { key: 'pending', label: 'تم استلام الطلب', labelEn: 'Order Placed', days: 0 },
  { key: 'confirmed', label: 'تم التأكيد', labelEn: 'Confirmed', days: 1 },
  { key: 'processing', label: 'قيد التحضير', labelEn: 'Processing', days: 2 },
  { key: 'shipped', label: 'تم الشحن', labelEn: 'Shipped', days: 4 },
  { key: 'delivered', label: 'تم التسليم', labelEn: 'Delivered', days: 7 },
];

function getEstimatedDate(orderDate: string, days: number): string {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat('ar-QR', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getShippingEstimate(status: string, orderDate?: string): { label: string; date: string; isRange: boolean } | null {
  if (!orderDate) return null;
  const baseDate = new Date(orderDate);

  switch (status) {
    case 'pending':
    case 'confirmed':
    case 'processing':
      return {
        label: 'الوقت المتوقع للتوصيل',
        date: getEstimatedDate(orderDate, 5),
        isRange: true,
      };
    case 'shipped':
      return {
        label: 'من المتوقع الوصول',
        date: getEstimatedDate(orderDate, 3),
        isRange: false,
      };
    case 'delivered':
      return null;
    default:
      return null;
  }
}

function maskInvoiceId(id: string | null | undefined): string {
  if (!id) return '—';
  if (id.length <= 6) return `••••${id.slice(-4)}`;
  return `••••••${id.slice(-4)}`;
}

function formatPrice(price: number, currency: string = 'QAR'): string {
  return new Intl.NumberFormat('ar-QR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price / 100);
}

interface FormErrors {
  orderNumber?: string;
  email?: string;
  general?: string;
}

export function Track() {
  const navigate = useNavigate();
  const location = useLocation();
  const formId = useId();
  const orderNumberId = `${formId}-order-number`;
  const emailId = `${formId}-email`;
  const errorId = `${formId}-error`;

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);

  const { order, isLoading, error, refetch } = useOrderByNumber(
    hasSearched ? orderNumber : '',
    hasSearched ? email : ''
  );

  const isOrderNotFound = hasSearched && !isLoading && !order && !error;
  const generalError = error || (isOrderNotFound ? 'ORDER_NOT_FOUND' : null);

  useEffect(() => {
    if (!order || !hasSearched) return;
    const ACTIVE_STATUSES: Order['status'][] = ['pending', 'confirmed', 'processing', 'payment_failed'];
    if (ACTIVE_STATUSES.includes(order.status)) {
      const interval = setInterval(() => refetch(), 30000);
      return () => clearInterval(interval);
    }
  }, [order, hasSearched, refetch]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!orderNumber.trim()) {
      newErrors.orderNumber = 'رقم الطلب مطلوب';
    } else if (orderNumber.trim().length < 3) {
      newErrors.orderNumber = 'رقم الطلب قصير جداً';
    }

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setHasSearched(true);
  };

  const handleNewSearch = () => {
    setHasSearched(false);
    setOrderNumber('');
    setEmail('');
    setErrors({});
  };

  const currentStepIndex = order ? timelineSteps.findIndex(s => s.key === order.status) : -1;
  const config = order ? statusConfig[order.status] || statusConfig.pending : null;
  const hasGeneralError = !!generalError;
  const shareUrl = order ? `${window.location.origin}/track?order=${order.orderNumber}` : '';
  const estimatedDelivery = getShippingEstimate(order?.status || 'pending', order?.createdAt);

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `تتبع طلب ${order.orderNumber}`,
          text: `تتبع طلبك رقم ${order.orderNumber} من دوحة روستري`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <div className="bg-brand-black text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black mb-2">تتبع طلبك</h1>
          <p className="text-brand-gray-400">أدخل رقم الطلب والبريد الإلكتروني لتتبع طلبك</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!order ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-premium p-8"
            >
              <form
                id={`${formId}-form`}
                onSubmit={handleSearch}
                noValidate
                aria-describedby={hasGeneralError ? errorId : undefined}
              >
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor={orderNumberId}
                      className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-wider"
                    >
                      رقم الطلب
                      <span className="text-red-500 mr-1" aria-hidden="true">*</span>
                      <span className="sr-only">(مطلوب)</span>
                    </label>
                    <input
                      type="text"
                      id={orderNumberId}
                      name="orderNumber"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value);
                        if (errors.orderNumber) {
                          setErrors(prev => ({ ...prev, orderNumber: undefined }));
                        }
                      }}
                      placeholder="مثال: ORD-2024-001234"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors ${
                        errors.orderNumber ? 'border-red-500 bg-red-50' : 'border-brand-gray-200'
                      }`}
                      dir="ltr"
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!!errors.orderNumber}
                      aria-describedby={errors.orderNumber ? `${orderNumberId}-error` : undefined}
                    />
                    <AnimatePresence>
                      {errors.orderNumber && (
                        <motion.p
                          id={`${orderNumberId}-error`}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-2 text-sm text-red-600 flex items-center gap-1"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {errors.orderNumber}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label
                      htmlFor={emailId}
                      className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-wider"
                    >
                      البريد الإلكتروني
                      <span className="text-red-500 mr-1" aria-hidden="true">*</span>
                      <span className="sr-only">(مطلوب)</span>
                    </label>
                    <input
                      type="email"
                      id={emailId}
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-brand-gray-200'
                      }`}
                      dir="ltr"
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? `${emailId}-error` : undefined}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          id={`${emailId}-error`}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-2 text-sm text-red-600 flex items-center gap-1"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {hasGeneralError && (
                      <motion.div
                        id={errorId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          {generalError === 'ORDER_NOT_FOUND'
                            ? 'لم يتم العثور على طلب بهذا الرقم والبريد الإلكتروني'
                            : generalError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-gold text-white font-bold rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          aria-hidden="true"
                        />
                        <span>جاري البحث...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" aria-hidden="true" />
                        <span>تتبع الطلب</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-brand-gray-100">
                <p className="text-center text-sm text-brand-gray-500">
                  تحتاج مساعدة؟{' '}
                  <button
                    onClick={() => navigate('/contact')}
                    className="text-brand-gold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-gold rounded"
                  >
                    تواصل معنا
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-white rounded-lg shadow-premium p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">رقم الطلب</p>
                    <p className="text-2xl font-black text-brand-black flex items-center gap-2" dir="ltr">
                      {order.orderNumber}
                      <button
                        onClick={handleCopyLink}
                        className="p-1 text-brand-gray-400 hover:text-brand-gold transition-colors"
                        aria-label="نسخ رقم الطلب"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </p>
                    {order.createdAt && (
                      <p className="text-xs text-brand-gray-400 mt-1">
                        تم الطلب في: {new Date(order.createdAt).toLocaleDateString('ar-QR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {config && (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor}`}>
                        <config.icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                        <span className={`text-sm font-bold ${config.color}`}>{config.labelAr}</span>
                      </div>
                    )}
                    <button
                      onClick={handleShare}
                      className="p-2 text-brand-gray-400 hover:text-brand-gold hover:bg-brand-gray-50 rounded-lg transition-colors"
                      aria-label="مشاركة الطلب"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {order.mfInvoiceId && (
                  <div className="bg-brand-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-brand-gray-400" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-brand-gray-500">رقم الفاتورة</p>
                        <p className="text-sm font-mono text-brand-black" dir="ltr">
                          {maskInvoiceId(order.mfInvoiceId)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {shareUrl && (
                  <div className="mt-4 pt-4 border-t border-brand-gray-100">
                    <p className="text-xs text-brand-gray-500 mb-2">رابط التتبع</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 px-3 py-2 bg-brand-gray-50 border border-brand-gray-200 rounded-lg text-xs text-brand-gray-600 truncate"
                        dir="ltr"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        aria-label="رابط التتبع"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/5 rounded-lg transition-colors"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'تم' : 'نسخ'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-premium p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-lg font-bold text-brand-black">حالة الطلب</h2>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-gray-500 hover:text-brand-gold hover:bg-brand-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    aria-label="مشاركة رابط التتبع"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                        <span className="text-green-600">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                        <span>مشاركة</span>
                      </>
                    )}
                  </button>
                </div>

                {estimatedDelivery && (
                  <div className="mb-6 p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-lg flex items-center gap-3">
                    <Truck className="h-5 w-5 text-brand-gold flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-brand-black">{estimatedDelivery.label}</p>
                      <p className="text-lg font-black text-brand-gold">
                        {estimatedDelivery.date}
                        {estimatedDelivery.isRange && ' +'}
                      </p>
                    </div>
                  </div>
                )}

                <nav aria-label="Order status timeline">
                  <div className="relative">
                    <div
                      className="absolute top-6 left-0 right-0 h-0.5 bg-brand-gray-200"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute top-6 left-0 h-0.5 bg-brand-gold transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative flex justify-between">
                      {timelineSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isPast = index < currentStepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/30'
                                  : 'bg-brand-gray-100 text-brand-gray-400'
                              } ${isCurrent ? 'ring-4 ring-brand-gold/20 scale-110' : ''}`}
                              aria-current={isCurrent ? 'step' : undefined}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6" aria-hidden="true" />
                              ) : (
                                <span className="text-sm font-bold" aria-hidden="true">{index + 1}</span>
                              )}
                            </div>
                            <p className={`mt-2 text-xs font-bold text-center transition-colors ${
                              isCompleted ? 'text-brand-black' : 'text-brand-gray-400'
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-brand-gray-400">{step.labelEn}</p>
                            {isPast && (
                              <p className="text-[10px] text-green-600 mt-0.5">
                                {getEstimatedDate(order.createdAt || new Date().toISOString(), step.days)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg shadow-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-gray-100">
                  <h2 className="text-lg font-bold text-brand-black">المنتجات</h2>
                </div>
                <ul className="divide-y divide-brand-gray-100" role="list">
                  {order.items.map((item) => (
                    <li key={item.id} className="p-6 flex gap-4">
                      <div className="w-20 h-20 bg-brand-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-8 w-8 text-brand-gray-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-black truncate">{item.productName}</p>
                        <p className="text-sm text-brand-gray-500">{item.variantDescription}</p>
                        <p className="text-xs text-brand-gray-400 mt-1">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-brand-black">{formatPrice(item.totalPrice)}</p>
                        <p className="text-xs text-brand-gray-400">{formatPrice(item.unitPrice)} each</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping Address & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-premium p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-brand-black">عنوان الشحن</h3>
                  </div>
                  <address className="text-sm text-brand-gray-600 not-italic space-y-1">
                    <p className="font-medium text-brand-black">{order.shippingAddress?.line1 || '—'}</p>
                    {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>
                      {order.shippingAddress?.city}
                      {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                      {order.shippingAddress?.postalCode && ` ${order.shippingAddress.postalCode}`}
                    </p>
                    <p>{order.shippingAddress?.country}</p>
                  </address>
                </div>

                <div className="bg-white rounded-lg shadow-premium p-6">
                  <h3 className="text-lg font-bold text-brand-black mb-4">ملخص الطلب</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-brand-gray-500">المجموع الفرعي</dt>
                      <dd className="font-medium text-brand-black">{formatPrice(order.subtotal)}</dd>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-brand-gray-500">الخصم</dt>
                        <dd className="text-green-600">-{formatPrice(order.discountAmount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-brand-gray-500">الشحن</dt>
                      <dd className="font-medium text-brand-black">
                        {order.shippingCost === 0 ? 'مجاني' : formatPrice(order.shippingCost)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-brand-gray-500">الضريبة</dt>
                      <dd className="font-medium text-brand-black">{formatPrice(order.taxAmount)}</dd>
                    </div>
                    <div className="pt-2 border-t border-brand-gray-200 flex justify-between">
                      <dt className="font-bold text-brand-black">الإجمالي</dt>
                      <dd className="font-bold text-brand-black">{formatPrice(order.total)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleNewSearch}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-brand-gray-300 text-brand-black font-bold rounded-lg hover:bg-brand-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  تتبع طلب آخر
                </button>
                <button
                  onClick={() => navigate(`/order/${order.orderNumber}/confirmation`)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-white font-bold rounded-lg hover:bg-brand-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  عرض تفاصيل الطلب
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Track;