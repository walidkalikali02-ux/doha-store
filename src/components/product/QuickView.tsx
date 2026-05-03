import {X, Minus, Plus} from 'lucide-react';
import {useState} from 'react';
import {Modal} from '@/components/common/Modal';
import {Button} from '@/components/common/Button';
import {ProductImageGallery} from './ProductImageGallery';
import {VariantSelector} from './VariantSelector';
import type {Product, SizeOption, GrindOption} from '@/types';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, size: SizeOption, grind: GrindOption, quantity: number) => void;
}

export function QuickView({product, isOpen, onClose, onAddToCart}: QuickViewProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedSize && selectedGrind) {
      onAddToCart?.(product, selectedSize, selectedGrind, quantity);
      onClose();
    }
  };

  const lowestPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map(v => product.basePrice + v.priceAdjustment))
      : product.basePrice;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative max-w-4xl w-full mx-auto bg-white rounded-lg overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900">{product.name}</h2>
              {product.originCountry && (
                <p className="text-stone-500 mt-1">{product.originCountry}</p>
              )}
            </div>

            <p className="text-stone-600">{product.descriptionShort}</p>

            <div className="text-2xl font-semibold text-stone-900">${lowestPrice.toFixed(2)}</div>

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              selectedSize={selectedSize}
              selectedGrind={selectedGrind}
              onSelectSize={setSelectedSize}
              onSelectGrind={setSelectedGrind}
            />

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-stone-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1 rounded border border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded border border-stone-300 hover:bg-stone-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedGrind}
              size="lg"
              className="w-full"
            >
              {selectedSize && selectedGrind ? 'Add to Cart' : 'Select Options'}
            </Button>

            {/* View Full Details */}
            <a
              href={`/product/${product.slug}`}
              className="block text-center text-amber-600 hover:text-amber-700 text-sm"
            >
              View Full Product Details →
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
