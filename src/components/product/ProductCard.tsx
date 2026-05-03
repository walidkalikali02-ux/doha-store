import {formatPrice} from '@/utils/helpers';
import type {Product} from '@/types';
import {Badge} from './Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({product, onAddToCart, onQuickView}: ProductCardProps) {
  const lowestPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map(v => product.basePrice + v.priceAdjustment))
      : product.basePrice;

  const hasStock = product.variants.some(v => v.availableQuantity > 0);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badges.map(badge => (
            <Badge key={badge} variant={badge as 'new' | 'sale' | 'limited'} />
          ))}
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-white"
          >
            Quick View
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-stone-900 mb-1 line-clamp-1">{product.name}</h3>

        {product.originCountry && (
          <p className="text-sm text-stone-500 mb-2">{product.originCountry}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-stone-900">{formatPrice(lowestPrice)}</span>
            {product.variants.length > 1 && <span className="text-sm text-stone-500 ml-1">+</span>}
          </div>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-stone-600">
              <span>★</span>
              <span>{product.averageRating?.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            disabled={!hasStock}
            className="w-full mt-3 py-2 px-4 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
          >
            {hasStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
