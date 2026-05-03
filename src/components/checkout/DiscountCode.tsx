import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Tag, Check, X, Loader2, Sparkles, ChevronDown, ChevronUp} from 'lucide-react';
import {useDiscount} from '@/hooks/useDiscount';
import type {DiscountSuggestion} from '@/hooks/useDiscount';

interface DiscountCodeProps {
  appliedCode?: string | null;
  discountPercent?: number;
  discountAmount?: number;
  onCodeApplied?: (code: string, percent: number, amount: number) => void;
  onCodeRemoved?: () => void;
  cartTotal?: number;
  showSuggestions?: boolean;
}

export function DiscountCode({
  appliedCode: externalCode,
  discountPercent = 0,
  discountAmount = 0,
  onCodeApplied,
  onCodeRemoved,
  cartTotal = 0,
  showSuggestions = true,
}: DiscountCodeProps) {
  const [inputValue, setInputValue] = useState('');
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const {applyDiscount, removeDiscount, suggestions, isApplying, isRemoving, applyError} =
    useDiscount();

  const appliedCode = externalCode ?? null;

  const handleApplyCode = async () => {
    if (!inputValue.trim()) return;

    const code = inputValue.trim().toUpperCase();
    const success = await applyDiscount(code);

    if (success) {
      setInputValue('');
      onCodeApplied?.(code, discountPercent, discountAmount);
    }
  };

  const handleRemoveCode = async () => {
    await removeDiscount();
    onCodeRemoved?.();
  };

  const handleSuggestionClick = (suggestion: DiscountSuggestion) => {
    setInputValue(suggestion.code);
    setShowCodeSuggestions(false);
  };

  const inputClasses = `
    flex-1 px-4 py-3 bg-white border-2 rounded-none transition-all duration-300 outline-none
    ${appliedCode ? 'border-green-500 bg-green-50' : 'border-brand-gray-200 focus:border-brand-gold'}
  `;

  const buttonClasses = `
    px-6 py-3 font-bold uppercase tracking-wider transition-all duration-300
    ${
      appliedCode
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-brand-black text-white hover:bg-brand-gray-800'
    }
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <Tag className="h-5 w-5 text-brand-gold" />
        <h3 className="text-lg font-bold text-brand-black">كود الخصم</h3>
      </div>

      {appliedCode ? (
        <motion.div
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          className="bg-green-50 border-2 border-green-500 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800">{appliedCode}</p>
                <p className="text-sm text-green-600">
                  خصم {discountPercent}% - {formatPrice(discountAmount)} مضاف
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCode}
              disabled={isRemoving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4" />
                  إزالة
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value.toUpperCase())}
                placeholder="أدخل كود الخصم"
                disabled={isApplying}
                className={inputClasses}
                maxLength={20}
              />
              {inputValue && !isApplying && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleApplyCode}
              disabled={!inputValue.trim() || isApplying}
              className={buttonClasses}
            >
              {isApplying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تطبيق'}
            </button>
          </div>

          <AnimatePresence>
            {applyError && (
              <motion.div
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2"
              >
                <X className="h-4 w-4" />
                {applyError.message}
              </motion.div>
            )}
          </AnimatePresence>

          {showSuggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCodeSuggestions(!showCodeSuggestions)}
                className="flex items-center gap-2 text-sm text-brand-gray-500 hover:text-brand-black transition-colors"
              >
                <Sparkles className="h-4 w-4 text-brand-gold" />
                <span>أكواد مقترحة</span>
                {showCodeSuggestions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <AnimatePresence>
                {showCodeSuggestions && (
                  <motion.div
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    className="space-y-2 pt-2"
                  >
                    {suggestions.map(suggestion => {
                      const isApplicable =
                        cartTotal >= suggestion.minimumOrderAmount ||
                        suggestion.minimumOrderAmount === 0;

                      return (
                        <motion.button
                          key={suggestion.code}
                          type="button"
                          initial={{opacity: 0, x: -10}}
                          animate={{opacity: 1, x: 0}}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={!isApplicable || isApplying}
                          className={`
                            w-full flex items-center justify-between p-3 border-2 rounded-none transition-all
                            ${
                              isApplicable
                                ? 'border-brand-gray-200 hover:border-brand-gold hover:bg-brand-gold/5'
                                : 'border-brand-gray-100 bg-brand-gray-50 opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                              w-10 h-10 flex items-center justify-center font-bold
                              ${
                                suggestion.discountPercent > 0
                                  ? 'bg-brand-gold/10 text-brand-gold'
                                  : 'bg-blue-50 text-blue-600'
                              }
                            `}
                            >
                              {suggestion.discountPercent > 0
                                ? `${suggestion.discountPercent}%`
                                : 'FREE'}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-brand-black">{suggestion.code}</p>
                              <p className="text-xs text-brand-gray-500">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                          {!isApplicable && (
                            <p className="text-xs text-brand-gray-400">
                              الحد الأدنى: {formatPrice(suggestion.minimumOrderAmount)}
                            </p>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-KW', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0,
  }).format(price / 100);
}

export default DiscountCode;
