import {useState} from 'react';
import {Heart, ShoppingBag} from 'lucide-react';
import type {CartItem, Product} from '@/types';

interface SavedItem extends CartItem {
  savedAt: Date;
  productDetails?: Product;
}

interface SaveForLaterProps {
  savedItems: SavedItem[];
  onMoveToCart: (variantId: string, quantity: number) => Promise<void>;
  onRemove: (variantId: string) => Promise<void>;
  isLoading?: boolean;
}

export function SaveForLater({
  savedItems,
  onMoveToCart,
  onRemove,
  isLoading = false,
}: SaveForLaterProps) {
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveToCart = async (item: SavedItem) => {
    setMovingId(item.variantId);
    try {
      await onMoveToCart(item.variantId, item.quantity);
    } finally {
      setMovingId(null);
    }
  };

  if (savedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Heart className="w-5 h-5" />
        Saved for Later
        <span className="text-sm font-normal text-gray-500">({savedItems.length})</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedItems.map(item => {
          const isMoving = movingId === item.variantId;
          const productImage = item.productDetails?.images[0]?.url ?? item.product.image;

          return (
            <div
              key={item.variantId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                <img
                  src={productImage}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.variant.size} · {item.variant.grind.replace('_', ' ')}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.unitPrice / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  disabled={isLoading || isMoving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-coffee-600 text-white hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isMoving ? 'Moving...' : 'Move to Cart'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.variantId)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type {SavedItem};
