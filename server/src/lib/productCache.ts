import {createClient, SupabaseClient} from '@supabase/supabase-js';

const PRODUCT_CACHE_TTL = 30;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class NodeCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) {
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

const productCache = new NodeCache();

export interface CachedProduct {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  featured: boolean;
  variants: CachedVariant[];
}

export interface CachedVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

function getCacheKey(productId: string): string {
  return `product:${productId}`;
}

function getCacheKeyAll(): string {
  return 'products:all';
}

export async function getCachedProduct(
  supabase: SupabaseClient,
  productId: string
): Promise<CachedProduct | null> {
  const cached = productCache.get<CachedProduct>(getCacheKey(productId));
  if (cached) {
    return cached;
  }

  const {data: product, error: productError} = await supabase
    .from('product_definitions')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return null;
  }

  const {data: variants} = await supabase
    .from('inventory_items')
    .select('*')
    .eq('product_id', productId)
    .eq('type', 'PRODUCT');

  const cachedProduct: CachedProduct = {
    id: product.id,
    name: product.name,
    nameAr: product.name_ar,
    description: product.description,
    descriptionAr: product.description_ar,
    price: Number(product.price),
    imageUrl: product.image,
    category: product.category,
    featured: product.featured || false,
    variants: (variants || []).map((v: any) => ({
      id: v.id,
      sku: v.image || '',
      name: v.bean_origin || product.name,
      price: Number(product.price),
      quantity: Number(v.stock) || 0,
    })),
  };

  productCache.set(getCacheKey(productId), cachedProduct, PRODUCT_CACHE_TTL);

  return cachedProduct;
}

export async function getCachedProducts(
  supabase: SupabaseClient,
  options: {category?: string; featured?: boolean; limit?: number} = {}
): Promise<CachedProduct[]> {
  const cacheKey = `products:${JSON.stringify(options)}`;
  const cached = productCache.get<CachedProduct[]>(cacheKey);
  if (cached) {
    return cached;
  }

  let query = supabase
    .from('product_definitions')
    .select('*')
    .eq('is_active', true);

  if (options.category) {
    query = query.eq('category', options.category);
  }

  if (options.featured !== undefined) {
    query = query.eq('featured', options.featured);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const {data: products, error} = await query;

  if (error || !products) {
    return [];
  }

  const productIds = products.map((p: any) => p.id);

  const {data: variants} = await supabase
    .from('inventory_items')
    .select('*')
    .in('product_id', productIds)
    .eq('type', 'PRODUCT');

  const variantsByProduct = (variants || []).reduce((acc: Record<string, any[]>, v: any) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(v);
    return acc;
  }, {});

  const cachedProducts: CachedProduct[] = products.map((product: any) => ({
    id: product.id,
    name: product.name,
    nameAr: product.name_ar,
    description: product.description,
    descriptionAr: product.description_ar,
    price: Number(product.price),
    imageUrl: product.image,
    category: product.category,
    featured: product.featured || false,
    variants: (variantsByProduct[product.id] || []).map((v: any) => ({
      id: v.id,
      sku: v.image || '',
      name: v.bean_origin || product.name,
      price: Number(product.price),
      quantity: Number(v.stock) || 0,
    })),
  }));

  productCache.set(cacheKey, cachedProducts, PRODUCT_CACHE_TTL);

  return cachedProducts;
}

export function invalidateProductCache(productId?: string): void {
  if (productId) {
    productCache.del(getCacheKey(productId));
  }
  productCache.invalidatePattern(/^products:/);
}

export default {
  getCachedProduct,
  getCachedProducts,
  invalidateProductCache,
};