import {Minus, Plus, Trash2} from 'lucide-react';
import {formatPrice} from '@/utils/helpers';
import type {CartItem} from '@/types';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemComponent({item, onUpdateQuantity, onRemove}: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-stone-200">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-stone-100 rounded-md overflow-hidden">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-stone-900 truncate">{item.product.name}</h3>
        <p className="text-sm text-stone-500 mt-1">
          {item.variant.size} / {item.variant.grind.replace('_', ' ')}
        </p>
        <p className="text-sm font-medium text-stone-900 mt-1">{formatPrice(item.unitPrice)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 rounded-md border border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-md border border-stone-300 hover:bg-stone-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
