export interface QueryConfig {
  staleTime: number;
  gcTime: number;
  retry: number | ((failureCount: number, error: Error) => boolean);
  retryDelay: number | ((attemptIndex: number) => number);
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  refetchOnMount: boolean | 'always';
}

export const defaultQueryConfig: QueryConfig = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  retry: (failureCount: number, error: Error): boolean => {
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: true,
};

export const cacheKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...cacheKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...cacheKeys.products.lists(), filters] as const,
    details: () => [...cacheKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.products.details(), id] as const,
    featured: () => [...cacheKeys.products.all, 'featured'] as const,
    search: (query: string) => [...cacheKeys.products.all, 'search', query] as const,
  },
  cart: {
    all: ['cart'] as const,
    detail: () => [...cacheKeys.cart.all, 'detail'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...cacheKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...cacheKeys.orders.lists(), filters] as const,
    details: () => [...cacheKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.orders.details(), id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...cacheKeys.subscriptions.all, 'list'] as const,
    detail: (id: string) => [...cacheKeys.subscriptions.all, 'detail', id] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...cacheKeys.user.all, 'profile'] as const,
    addresses: () => [...cacheKeys.user.all, 'addresses'] as const,
    paymentMethods: () => [...cacheKeys.user.all, 'paymentMethods'] as const,
  },
  loyalty: {
    all: ['loyalty'] as const,
    account: () => [...cacheKeys.loyalty.all, 'account'] as const,
    history: () => [...cacheKeys.loyalty.all, 'history'] as const,
    stats: () => [...cacheKeys.loyalty.all, 'stats'] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    list: (productId: string) => [...cacheKeys.reviews.all, 'list', productId] as const,
    stats: (productId: string) => [...cacheKeys.reviews.all, 'stats', productId] as const,
  },
  admin: {
    all: ['admin'] as const,
    orders: () => [...cacheKeys.admin.all, 'orders'] as const,
    products: () => [...cacheKeys.admin.all, 'products'] as const,
    customers: () => [...cacheKeys.admin.all, 'customers'] as const,
    reviews: () => [...cacheKeys.admin.all, 'reviews'] as const,
    dashboard: () => [...cacheKeys.admin.all, 'dashboard'] as const,
  },
} as const;

export const queryOptions = {
  staleTime: {
    none: 0,
    short: 1000 * 30,
    medium: 1000 * 60 * 5,
    long: 1000 * 60 * 30,
    day: 1000 * 60 * 60 * 24,
  },
  gcTime: {
    none: 0,
    short: 1000 * 60,
    medium: 1000 * 60 * 10,
    long: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
  },
};

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function createCacheKey(...parts: (string | number)[]): string[] {
  return parts.map(String);
}

export function isStale(timestamp: number, staleTime: number): boolean {
  return Date.now() - timestamp > staleTime;
}

export function getCacheAge(timestamp: number): number {
  return Date.now() - timestamp;
}
