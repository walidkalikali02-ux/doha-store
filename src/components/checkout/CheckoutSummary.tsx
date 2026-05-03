import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Tag, Check, X, Loader2, Sparkles, ChevronDown, ChevronUp} from 'lucide-react';
import {formatPrice} from '@/utils/helpers';
import type {CartItem} from '@/types';
import {useCheckoutStore} from '@/stores/checkoutStore';
import {api} from '@/services/api';
import {useToast} from '@/components/common';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  tax?: number;
  showDiscountInput?: boolean;
}

export function CheckoutSummary({
  items,
  subtotal,
  shipping = 0,
  tax = 0,
  showDiscountInput = true,
}: CheckoutSummaryProps) {
  const {discount, setDiscount} = useCheckoutStore();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const discountAmount = discount?.amount ?? 0;
  const total = subtotal + shipping + tax - discountAmount;

  const handleApplyCode = async () => {
    if (!inputValue.trim()) return;

    setIsApplying(true);
    setError('');

    try {
      const response = await api.post<{valid: boolean; discount_amount: number; type: 'percentage' | 'fixed'; value: number; error?: string}>('/discounts/validate', {
        code: inputValue.trim().toUpperCase(),
        orderSubtotal: subtotal,
      });

      if (response.valid) {
        setDiscount({
          code: inputValue.trim().toUpperCase(),
          amount: response.discount_amount,
          type: response.type,
          value: response.value,
        });
        toast.success('تم تطبيق الخصم', `خصم ${response.discount_amount} QAR`);
      } else {
        setError(response.error || 'رمز الخصم غير صالح');
      }
    } catch (err) {
      setError('فشل في التحقق من كود الخصم');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCode = async () => {
    setIsRemoving(true);
    try {
      setDiscount(null);
      toast.success('تم إزالة الخصم');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-6" dir="rtl">
      <h2 className="text-lg font-bold text-stone-900">ملخص الطلب</h2>

      {/* Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-stone-500">
                {item.variant.size} / {item.variant.grind.replace('_', ' ')} × {item.quantity}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      <hr className="border-stone-200" />

      {/* Discount Code */}
      {showDiscountInput && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-stone-900">كود الخصم</span>
          </div>

          {discount ? (
            <motion.div
              initial={{opacity: 0, y: -5}}
              animate={{opacity: 1, y: 0}}
              className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <span className="font-medium text-green-800">{discount.code}</span>
                  <span className="text-sm text-green-600 mr-2">
                    ({discount.type === 'percentage' ? `${discount.value}%` : 'خصم ثابت'})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCode}
                disabled={isRemoving}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>إزالة</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="أدخل كود الخصم"
                  disabled={isApplying}
                  className="flex-1 px-3 py-2 border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 text-right"
                  maxLength={20}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                />
                <button
                  type="button"
                  onClick={handleApplyCode}
                  disabled={!inputValue.trim() || isApplying}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تطبيق'}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{opacity: 0, y: -5}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -5}}
                    className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      <hr className="border-stone-200" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">المجموع الفرعي</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {shipping > 0 ? (
          <div className="flex justify-between">
            <span className="text-stone-600">الشحن</span>
            <span className="font-medium">{formatPrice(shipping)}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-stone-600">الشحن</span>
            <span className="font-medium text-green-600">مجاني</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-stone-600">الضريبة</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
        )}

        {discountAmount > 0 && discount && (
          <motion.div
            initial={{opacity: 0, y: -5}}
            animate={{opacity: 1, y: 0}}
            className="flex justify-between text-green-600"
          >
            <span>الخصم ({discount.code})</span>
            <span className="font-medium">-{formatPrice(discountAmount)}</span>
          </motion.div>
        )}
      </div>

      <hr className="border-stone-200" />

      {/* Total */}
      <div className="flex justify-between text-lg font-bold">
        <span>الإجمالي</span>
        <span className="text-amber-600">{formatPrice(total)}</span>
      </div>

      {discountAmount > 0 && (
        <p className="text-xs text-green-600 text-center">
          أنت توفر {formatPrice(discountAmount)} على هذا الطلب!
        </p>
      )}
    </div>
  );
}

export default CheckoutSummary;