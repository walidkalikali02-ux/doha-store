import type {Product} from '@/types';
import {ProductCard} from './ProductCard';
import {ProductGridSkeleton} from '@/components/skeletons';

interface ProductGridProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({
  products = [],
  onAddToCart,
  onQuickView,
  columns = 4,
  isLoading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} columns={columns} />;
  }

  if (!products.length) {
    return null;
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          {...(onAddToCart ? {onAddToCart} : {})}
          {...(onQuickView ? {onQuickView} : {})}
        />
      ))}
    </div>
  );
}
