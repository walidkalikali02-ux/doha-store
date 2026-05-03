import {useQuery, useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useMemo, useState} from 'react';
import {productService} from '@/services/products';
import {QUERY_KEYS} from '@/lib/queryClient';
import type {Product, ProductFilters, ProductSortOption, SizeOption, GrindOption} from '@/types';

interface UseProductsParams {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  enabled?: boolean;
}

interface UseProductSearchParams {
  query: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseProductsInfiniteParams {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  limit?: number;
  enabled?: boolean;
}

export function useProducts(params: UseProductsParams = {}) {
  const {filters, sort, enabled = true} = params;

  return useQuery({
    queryKey: [QUERY_KEYS.products, {filters, sort}],
    queryFn: async () => {
      const response = await productService.getProducts(filters);
      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(productId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.product(productId),
    queryFn: async () => {
      const response = await productService.getProduct(productId);
      return response;
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.productBySlug(slug),
    queryFn: async () => {
      const response = await productService.getProduct(slug);
      return response;
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProducts(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.featured,
    queryFn: async () => {
      const response = await productService.getProducts({inStock: true});
      return response;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useNewArrivals(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.newArrivals,
    queryFn: async () => {
      const response = await productService.getProducts({inStock: true});
      return response;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBestSellers(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.bestSellers,
    queryFn: async () => {
      const response = await productService.getProducts({inStock: true});
      return response;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProductSearch(params: UseProductSearchParams) {
  const {query, enabled = true} = params;

  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: async () => {
      const response = await productService.searchProducts(query);
      return response;
    },
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProductsInfinite(params: UseProductsInfiniteParams = {}) {
  const {filters, limit = 20, enabled = true} = params;

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.products, 'infinite', {filters, limit}],
    queryFn: async ({pageParam = 1}) => {
      const response = await productService.getProducts(filters, {page: pageParam, perPage: limit});
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const data = lastPage.data;
      if (!data || data.length < limit) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReviews(productId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews(productId),
    queryFn: async () => {
      return {data: []};
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return useCallback(
    async (productId: string) => {
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.product(productId),
        queryFn: async () => {
          const response = await productService.getProduct(productId);
          return response;
        },
      });
    },
    [queryClient]
  );
}

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return useCallback(
    async (productIds: string[]) => {
      await Promise.all(
        productIds.map(productId =>
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.product(productId),
            queryFn: async () => {
              const response = await productService.getProduct(productId);
              return response;
            },
          })
        )
      );
    },
    [queryClient]
  );
}

export function useProductsByCategory(categoryId: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'category', categoryId],
    queryFn: async () => {
      const response = await productService.getProducts({category: categoryId});
      return response;
    },
    enabled: enabled && !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSortOption>('newest');

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  }, []);

  const updateSort = useCallback((newSort: ProductSortOption) => {
    setSort(newSort);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSort('newest');
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => {
      const newFilters: ProductFilters = {...prev};
      if (prev.category === category) {
        delete newFilters.category;
      } else {
        newFilters.category = category;
      }
      return newFilters;
    });
  }, []);

  const toggleRoastLevel = useCallback((roastLevel: RoastLevel) => {
    setFilters(prev => {
      const newFilters: ProductFilters = {...prev};
      if (prev.roastLevel === roastLevel) {
        delete newFilters.roastLevel;
      } else {
        newFilters.roastLevel = roastLevel;
      }
      return newFilters;
    });
  }, []);

  const setPriceRange = useCallback((priceMin?: number, priceMax?: number) => {
    setFilters(prev => {
      const newFilters: ProductFilters = {...prev};
      if (priceMin !== undefined) newFilters.priceMin = priceMin;
      if (priceMax !== undefined) newFilters.priceMax = priceMax;
      return newFilters;
    });
  }, []);

  return {
    filters,
    sort,
    updateFilters,
    updateSort,
    resetFilters,
    toggleCategory,
    toggleRoastLevel,
    setPriceRange,
  };
}

export function useProductVariant(product: Product | null | undefined) {
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | null>(null);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizes = new Set(product.variants.map(v => v.size));
    return Array.from(sizes);
  }, [product?.variants]);

  const availableGrinds = useMemo(() => {
    if (!product?.variants) return [];
    const grinds = new Set(product.variants.map(v => v.grind));
    return Array.from(grinds);
  }, [product?.variants]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedSize || !selectedGrind) return null;

    return product.variants.find(v => v.size === selectedSize && v.grind === selectedGrind) || null;
  }, [product?.variants, selectedSize, selectedGrind]);

  const price = useMemo(() => {
    if (!product) return 0;
    const variantPrice = selectedVariant?.priceAdjustment || 0;
    return product.basePrice + variantPrice;
  }, [product, selectedVariant]);

  const selectDefaults = useCallback(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0] ?? null);
    }
    if (availableGrinds.length > 0) {
      setSelectedGrind(availableGrinds[0] ?? null);
    }
  }, [availableSizes, availableGrinds]);

  return {
    selectedSize,
    selectedGrind,
    selectedVariant,
    availableSizes,
    availableGrinds,
    price,
    setSelectedSize,
    setSelectedGrind,
    selectDefaults,
  };
}

type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';
