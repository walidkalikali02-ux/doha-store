import {useParams} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {ProductImageGallery} from '@/components/product/ProductImageGallery';
import {VariantSelector} from '@/components/product/VariantSelector';
import {Skeleton} from '@/components/common/Loading';
import {formatPrice} from '@/utils/helpers';
import type {Product, SizeOption, GrindOption} from '@/types';

export function Product() {
  const {slug} = useParams<{slug: string}>();
  const [product] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // TODO: Fetch product from API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton variant="rectangular" className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedGrind) return;
    console.log('Adding to cart:', {product, selectedSize, selectedGrind, quantity});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>
            {product.originCountry && (
              <p className="text-stone-500 mt-1">{product.originCountry}</p>
            )}
          </div>

          <div className="text-2xl font-semibold">{formatPrice(product.basePrice)}</div>

          <p className="text-stone-600">{product.descriptionShort}</p>

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedSize={selectedSize}
            selectedGrind={selectedGrind}
            onSelectSize={setSelectedSize}
            onSelectGrind={setSelectedGrind}
          />

          {/* Quantity and Add to Cart */}
          <div className="flex gap-4">
            <select
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="px-4 py-2 border border-stone-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedGrind}
              className="flex-1 bg-amber-600 text-white py-2 px-6 rounded-md font-medium hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
