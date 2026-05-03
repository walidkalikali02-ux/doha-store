import {QueryClient, DefaultOptions} from '@tanstack/react-query';
import {AppError, NetworkError} from '@/utils/errorHandling';

const MAX_RETRIES = 3;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof NetworkError) {
    return failureCount < MAX_RETRIES;
  }

  if (error instanceof AppError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return false;
    }
    if (error.statusCode >= 500) {
      return failureCount < MAX_RETRIES;
    }
    return false;
  }

  if (error instanceof Error) {
    const networkErrors = ['fetch', 'network', 'timeout', 'abort'];
    const errorMessage = error.message.toLowerCase();
    if (networkErrors.some(e => errorMessage.includes(e))) {
      return failureCount < MAX_RETRIES;
    }
  }

  return failureCount < MAX_RETRIES;
}

function onError(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error('[React Query Error]', {
      error,
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof NetworkError) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:error', {
          detail: {
            type: 'network',
            message: error.messageAr,
            recoverable: error.recoverable,
          },
        })
      );
    }
  }
}

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: shouldRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    throwOnError: false,
  },
  mutations: {
    retry: false,
    throwOnError: false,
    onError,
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});

export function clearQueryCache(): void {
  queryClient.clear();
}

export function invalidateQueries(queryKey?: unknown[]): void {
  if (queryKey) {
    queryClient.invalidateQueries({queryKey});
  } else {
    queryClient.invalidateQueries();
  }
}

export function prefetchQuery<T>(queryKey: unknown[], queryFn: () => Promise<T>): void {
  queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

export function setQueryData<T>(queryKey: unknown[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

export function getQueryData<T>(queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

export function removeQueries(queryKey: unknown[]): void {
  queryClient.removeQueries({queryKey});
}

export const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productBySlug: (slug: string) => ['products', 'slug', slug] as const,
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  user: ['user'] as const,
  userProfile: (id: string) => ['user', 'profile', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  cart: ['cart'] as const,
  reviews: (productId: string) => ['reviews', productId] as const,
  search: (query: string) => ['search', query] as const,
  featured: ['products', 'featured'] as const,
  newArrivals: ['products', 'new-arrivals'] as const,
  bestSellers: ['products', 'best-sellers'] as const,
  subscriptions: ['subscriptions'] as const,
  subscription: (id: string) => ['subscriptions', id] as const,
} as const;
