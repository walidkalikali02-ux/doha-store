import {formatPrice} from '@/utils/helpers';
import {Button} from '@/components/common/Button';
import type {CartSummary as CartSummaryType} from '@/types';

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export function CartSummary({summary, onCheckout, isLoading}: CartSummaryProps) {
  const savings = summary.subtotal - summary.total + summary.discount;

  return (
    <div className="bg-stone-50 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">Subtotal</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-stone-600">Shipping</span>
          <span className="font-medium">
            {summary.estimatedShipping === 0
              ? 'Calculated at checkout'
              : formatPrice(summary.estimatedShipping)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-600">Tax</span>
          <span className="font-medium">
            {summary.estimatedTax === 0
              ? 'Calculated at checkout'
              : formatPrice(summary.estimatedTax)}
          </span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-green-600 text-xs">
            <span>You save</span>
            <span className="font-medium">{formatPrice(savings)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Estimated Total</span>
          <span>{formatPrice(summary.total)}</span>
        </div>
      </div>

      {onCheckout && (
        <Button onClick={onCheckout} isLoading={isLoading ?? false} className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      )}

      <p className="text-xs text-stone-500 text-center">
        Shipping and taxes calculated at checkout
      </p>
    </div>
  );
}
