import {SIZE_LABELS, GRIND_OPTIONS, GRIND_LABELS} from '@/utils/constants';
import type {SizeOption, GrindOption, ProductVariant} from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedSize: SizeOption | null;
  selectedGrind: GrindOption | null;
  onSelectSize: (size: SizeOption) => void;
  onSelectGrind: (grind: GrindOption) => void;
}

export function VariantSelector({
  variants,
  selectedSize,
  selectedGrind,
  onSelectSize,
  onSelectGrind,
}: VariantSelectorProps) {
  // Get available sizes from variants
  const availableSizes = [...new Set(variants.map(v => v.size))];

  // Get available grinds for selected size
  const availableGrinds = selectedSize
    ? variants.filter(v => v.size === selectedSize && v.status === 'active').map(v => v.grind)
    : [];

  // Check if selected combination is in stock
  const selectedVariant = variants.find(v => v.size === selectedSize && v.grind === selectedGrind);
  const isInStock =
    selectedVariant?.availableQuantity !== undefined && selectedVariant.availableQuantity > 0;

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Size {selectedSize && `- ${SIZE_LABELS[selectedSize]}`}
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => {
            const hasStock = variants.some(v => v.size === size && v.availableQuantity > 0);
            return (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                disabled={!hasStock}
                className={`px-4 py-2 rounded-md border font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-amber-600 bg-amber-50 text-amber-700'
                    : hasStock
                      ? 'border-stone-300 hover:border-amber-400'
                      : 'border-stone-200 text-stone-400 cursor-not-allowed line-through'
                }`}
              >
                {SIZE_LABELS[size]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grind Selector */}
      {selectedSize && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Grind {selectedGrind && `- ${GRIND_LABELS[selectedGrind]}`}
          </label>
          <div className="flex flex-wrap gap-2">
            {GRIND_OPTIONS.map(grind => {
              const isAvailable = availableGrinds.includes(grind);
              return (
                <button
                  key={grind}
                  onClick={() => isAvailable && onSelectGrind(grind)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-md border font-medium transition-colors ${
                    selectedGrind === grind
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : isAvailable
                        ? 'border-stone-300 hover:border-amber-400'
                        : 'border-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {GRIND_LABELS[grind]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      {selectedVariant && (
        <div className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
          {isInStock ? `In Stock (${selectedVariant.availableQuantity} available)` : 'Out of Stock'}
        </div>
      )}
    </div>
  );
}
