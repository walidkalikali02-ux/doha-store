import {formatPrice} from '@/utils/helpers';
import type {CartItem} from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  discount?: number;
  discountCode?: string;
  onRemoveDiscount?: () => void;
}

export function OrderSummary({
  items,
  subtotal,
  shipping = 0,
  discount = 0,
  discountCode,
  onRemoveDiscount,
}: OrderSummaryProps) {
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">Order Summary</h2>

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

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {shipping > 0 ? (
          <div className="flex justify-between">
            <span className="text-stone-600">Shipping</span>
            <span className="font-medium">{formatPrice(shipping)}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-stone-600">Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
        )}

        {discount > 0 && discountCode && (
          <div className="flex justify-between">
            <span className="text-stone-600">
              Discount <span className="text-green-600">({discountCode})</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
              {onRemoveDiscount && (
                <button
                  onClick={onRemoveDiscount}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <hr className="border-stone-200" />

      {/* Total */}
      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
