import {useState, useEffect} from 'react';
import {ProductGrid} from '@/components/product/ProductGrid';
import {ProductFilters} from '@/components/product/ProductFilters';
import {SkeletonProductGrid} from '@/components/common/Loading';
import type {Product, ProductFilters as FilterType} from '@/types';

export function Shop() {
  const [products] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});

  useEffect(() => {
    // TODO: Fetch products from API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product);
  };

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop Coffee</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <SkeletonProductGrid />
          ) : (
            <ProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
            />
          )}
        </main>
      </div>
    </div>
  );
}
