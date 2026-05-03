import {PRODUCTS as seedProducts} from '@/legacyTypes';

export type AdminProductStatus = 'active' | 'draft' | 'archived';

export interface AdminProductRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  quantity: number;
  lowStockThreshold: number;
  status: AdminProductStatus;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductInput {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  quantity: number;
  lowStockThreshold: number;
  status: AdminProductStatus;
  images: string[];
  tags: string[];
}

const STORAGE_KEY = 'doharoastery.admin-products.v1';

function createId() {
  return `prod_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function now() {
  return new Date().toISOString();
}

function mapSeedProducts(): AdminProductRecord[] {
  return seedProducts.slice(0, 8).map((product, index) => ({
    id: product.id,
    name: product.name,
    sku: `SKU-${String(index + 1).padStart(3, '0')}`,
    category: product.category === 'coffee' ? 'single-origin' : 'tools',
    description: product.description,
    price: product.price * 100,
    compareAtPrice: undefined,
    costPerItem: undefined,
    quantity: 24 - index * 2,
    lowStockThreshold: 10,
    status: 'active',
    images: [product.image],
    tags: [product.category, product.nameAr],
    createdAt: now(),
    updatedAt: now(),
  }));
}

function ensureSeeded(): AdminProductRecord[] {
  const stored = readAdminProducts();
  if (stored.length > 0) {
    return stored;
  }

  const seeded = mapSeedProducts();
  writeAdminProducts(seeded);
  return seeded;
}

export function readAdminProducts(): AdminProductRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminProductRecord[];
  } catch {
    return [];
  }
}

export function writeAdminProducts(products: AdminProductRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('admin-products-updated'));
}

export function getAdminProducts(): AdminProductRecord[] {
  return ensureSeeded();
}

export function getAdminProductById(productId: string): AdminProductRecord | undefined {
  return getAdminProducts().find(product => product.id === productId);
}

export function createAdminProduct(input: AdminProductInput): AdminProductRecord {
  const products = getAdminProducts();
  const record: AdminProductRecord = {
    id: createId(),
    ...input,
    createdAt: now(),
    updatedAt: now(),
  };
  writeAdminProducts([record, ...products]);
  return record;
}

export function updateAdminProduct(productId: string, input: AdminProductInput): AdminProductRecord {
  const products = getAdminProducts();
  const next = products.map(product =>
    product.id === productId
      ? {
          ...product,
          ...input,
          updatedAt: now(),
        }
      : product
  );
  const updated = next.find(product => product.id === productId);
  if (!updated) {
    throw new Error('Product not found');
  }
  writeAdminProducts(next);
  return updated;
}

export function deleteAdminProduct(productId: string) {
  const products = getAdminProducts().filter(product => product.id !== productId);
  writeAdminProducts(products);
}

export function duplicateAdminProduct(productId: string): AdminProductRecord {
  const product = getAdminProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const copy: AdminProductRecord = {
    ...product,
    id: createId(),
    name: `${product.name} Copy`,
    sku: `${product.sku}-COPY`,
    status: 'draft',
    createdAt: now(),
    updatedAt: now(),
  };

  const products = getAdminProducts();
  writeAdminProducts([copy, ...products]);
  return copy;
}

export function resetAdminProducts() {
  writeAdminProducts(mapSeedProducts());
}
