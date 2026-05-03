import {useEffect, useState} from 'react';
import {PRODUCTS as seedProducts, type Product} from '@/legacyTypes';
import {getAdminProducts, type AdminProductRecord} from '@/utils/adminProducts';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800';

function mapSeedProduct(seed: Product): Product {
  return {...seed};
}

function mapAdminProduct(admin: AdminProductRecord, seed?: Product): Product {
  return {
    id: admin.id,
    name: admin.name,
    nameAr: admin.name,
    price: Math.max(0, Math.round(admin.price / 100)),
    description: admin.description,
    descriptionAr: admin.description,
    image: admin.images[0] || seed?.image || DEFAULT_IMAGE,
    category: seed?.category || 'coffee',
    origin: seed?.origin,
    originAr: seed?.originAr,
    roastLevel: seed?.roastLevel,
    roastLevelAr: seed?.roastLevelAr,
  };
}

export function getStoreProducts(): Product[] {
  const adminProducts = getAdminProducts();
  const seedMap = new Map(seedProducts.map(product => [product.id, product]));

  const mergedSeedProducts = seedProducts.map(seed => {
    const admin = adminProducts.find(product => product.id === seed.id);
    return admin ? mapAdminProduct(admin, seed) : mapSeedProduct(seed);
  });

  const customAdminProducts = adminProducts
    .filter(product => !seedMap.has(product.id))
    .map(product => mapAdminProduct(product));

  return [...mergedSeedProducts, ...customAdminProducts];
}

export function getStoreProductById(productId: string): Product | undefined {
  return getStoreProducts().find(product => product.id === productId);
}

export function useStoreProducts() {
  const [products, setProducts] = useState<Product[]>(() => getStoreProducts());

  useEffect(() => {
    const refresh = () => setProducts(getStoreProducts());

    window.addEventListener('admin-products-updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('admin-products-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return products;
}

export function useStoreProduct(productId: string) {
  const products = useStoreProducts();
  return products.find(product => product.id === productId);
}
