import {useEffect, useState} from 'react';
import {useCart} from '../hooks/useCartLegacy';
import {useCartAnalytics} from '../hooks/useCartAnalytics';
import {useCartStore} from '@/stores/cartStore';
import {Plus, Minus, ShoppingBag, ChevronLeft, Tag, Check, X, Loader2, AlertTriangle} from 'lucide-react';
import {Link} from 'react-router-dom';
import {api} from '@/services/api';

export const Cart = () => {
  const {cart, removeFromCart, updateQuantity, totalPrice} = useCart();
  const {trackCartView} = useCartAnalytics();
  const {discountCode, setDiscountCode} = useCartStore();
  const [inputCode, setInputCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [soldOutItems, setSoldOutItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    trackCartView();
  }, [trackCartView]);

  useEffect(() => {
    const checkInventory = async () => {
      const soldOut = new Set<string>();
      for (const item of cart) {
        try {
          const response = await fetch(`/api/v1/products/${item.id}/inventory`);
          if (response.ok) {
            const data = await response.json();
            if (data.quantity === 0) {
              soldOut.add(item.id);
            }
          }
        } catch (error) {
          console.warn('Failed to check cart inventory:', error);
        }
      }
      setSoldOutItems(soldOut);
    };
    if (cart.length > 0) {
      checkInventory();
    }
  }, [cart]);

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;

    setIsApplying(true);
    setError('');

    try {
      const subtotal = totalPrice;
      const response = await api.post<{
        valid: boolean;
        discount_amount: number;
        type: 'percentage' | 'fixed';
        value: number;
        error?: string;
      }>('/discounts/validate', {
        code: inputCode.trim().toUpperCase(),
        orderSubtotal: subtotal,
      });

      if (response.valid) {
        setDiscountCode(inputCode.trim().toUpperCase());
        setDiscountAmount(response.discount_amount);
        setDiscountType(response.type);
        setDiscountValue(response.value);
      } else {
        setError(response.error || 'رمز الخصم غير صالح');
      }
    } catch {
      setError('فشل في التحقق من كود الخصم');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCode = () => {
    setDiscountCode(null);
    setInputCode('');
    setDiscountAmount(0);
    setDiscountType(null);
    setDiscountValue(0);
    setError('');
  };

  const savings = discountAmount;
  const finalTotal = totalPrice - savings;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'QAR',
      maximumFractionDigits: 0,
    }).format(value);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-20 h-20 bg-brand-gray-50 text-brand-gray-200 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-3xl font-black text-brand-black mb-4 uppercase tracking-tighter">
          سلة التسوق فارغة
        </h2>
        <p className="text-brand-gray-500 mb-10 text-center max-w-md">
          يبدو أنك لم تضف أي منتجات إلى سلتك بعد. استكشف محاصيلنا المختصة وأدواتنا الرائعة.
        </p>
        <Link to="/products" className="btn-primary">
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-brand-black mb-4 uppercase tracking-tighter">
            سلة التسوق
          </h1>
          <div className="w-20 h-1 bg-brand-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border-t border-brand-gray-200">
              {cart.map(item => (
                <div
                  key={item.id}
                  data-testid="cart-item"
                  className={`py-8 border-b border-brand-gray-200 flex flex-col sm:flex-row items-center gap-8 ${
                    soldOutItems.has(item.id) ? 'bg-red-50 border-red-200 rounded-lg p-4' : ''
                  }`}
                >
                  {soldOutItems.has(item.id) && (
                    <div className="absolute right-4 top-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <AlertTriangle size={12} />
                      غير متوفر
                    </div>
                  )}
                  <Link
                    to={`/product/${item.id}`}
                    className="w-32 h-40 flex-shrink-0 bg-brand-gray-50 overflow-hidden relative"
                  >
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>

                  <div className="flex-1 text-center sm:text-right">
                    <Link to={`/product/${item.id}`} className="block">
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-wider mb-1 hover:text-brand-gold transition-colors">
                        {item.nameAr}
                      </h3>
                      <p className="text-xs text-brand-gray-500 uppercase tracking-widest mb-4">
                        {item.originAr || 'محصول مختص'}
                      </p>
                    </Link>

                    <div className="flex items-center justify-center sm:justify-start gap-6">
                      <div className="flex items-center border border-brand-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-brand-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-brand-gray-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-bold text-brand-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>

                  <div className="text-lg font-black text-brand-black">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-gray-500 hover:text-brand-black transition-colors"
              >
                <ChevronLeft size={16} /> العودة للمتجر
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray-50 p-8 sticky top-32">
              <h2 className="text-xl font-black text-brand-black mb-8 uppercase tracking-tighter">
                ملخص الطلب
              </h2>

              {/* Discount Code Section */}
              <div className="mb-8 p-4 bg-white rounded-lg border border-brand-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={16} className="text-brand-gold" />
                  <span className="text-sm font-bold text-brand-black">كود الخصم</span>
                </div>

                {discountCode ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span className="font-bold text-green-800">{discountCode}</span>
                      </div>
                      <button
                        onClick={handleRemoveCode}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <X size={14} />
                        إزالة
                      </button>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      خصم {discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountAmount)}
                    </p>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-lg font-bold text-green-700">-{formatCurrency(savings)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={e => {
                          setInputCode(e.target.value.toUpperCase());
                          setError('');
                        }}
                        placeholder="أدخل كود الخصم"
                        disabled={isApplying}
                        className="flex-1 px-3 py-2 border border-brand-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                      />
                      <button
                        onClick={handleApplyCode}
                        disabled={!inputCode.trim() || isApplying}
                        className="px-4 py-2 bg-brand-black text-white text-sm font-bold rounded hover:bg-brand-gray-800 disabled:opacity-50 transition-colors"
                      >
                        {isApplying ? <Loader2 size={14} className="animate-spin" /> : 'تطبيق'}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-brand-gray-500 uppercase tracking-widest">
                  <span>المجموع الفرعي</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم</span>
                    <span>-{formatCurrency(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brand-gray-500 uppercase tracking-widest">
                  <span>الشحن</span>
                  <span className="text-brand-gold font-bold">مجاني</span>
                </div>
                <div className="border-t border-brand-gray-200 pt-6 flex justify-between font-black text-2xl text-brand-black">
                  <span>الإجمالي</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
                {savings > 0 && (
                  <p className="text-xs text-green-600 text-center">
                    وفّرت {formatCurrency(savings)}!
                  </p>
                )}
              </div>
              <Link to="/checkout/shipping" className="w-full btn-primary block text-center">
                إتمام الطلب
              </Link>
              <div className="mt-8 space-y-4">
                <p className="text-[10px] text-brand-gray-500 text-center leading-relaxed">
                  بإتمامك للطلب، أنت توافق على الشروط والأحكام الخاصة بمحمصة الدوحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
