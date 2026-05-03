import {useState} from 'react';
import {Tag, Loader2, X, Check} from 'lucide-react';
import {Button} from '@/components/common/Button';

interface DiscountInputProps {
  onApply?: (code: string) => Promise<{valid: boolean; error?: string}>;
  discount?: {code: string; amount: number; type: 'percentage' | 'fixed'; value: number} | null;
  onRemove?: () => void;
  isLoading?: boolean;
}

export function DiscountInput({onApply, discount, onRemove}: DiscountInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('الرجاء إدخال رمز الخصم');
      return;
    }
    setError('');
    setIsApplying(true);
    try {
      const result = await onApply?.(code.trim().toUpperCase());
      if (!result?.valid) {
        setError(result?.error || 'رمز الخصم غير صالح');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (discount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-800">{discount.code}</span>
              </div>
              <p className="text-green-600 text-sm">
                خصم {discount.type === 'percentage' ? `${discount.value}%` : `${discount.amount} QAR`}
              </p>
            </div>
          </div>
          {onRemove && (
            <button onClick={onRemove} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              <X className="w-4 h-4" />
              إزالة
            </button>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-green-200">
          <p className="text-lg font-bold text-green-700">-{discount.amount} QAR</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">رمز الخصم</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="أدخل رمز الخصم"
          disabled={isApplying}
          className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-stone-100"
        />
        <Button
          type="submit"
          isLoading={isApplying}
          className="px-6"
          disabled={!code.trim() || isApplying}
        >
          {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تطبيق'}
        </Button>
      </div>
      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </form>
  );
}