export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export function createOrderItem(data: Partial<OrderItem>): OrderItem {
  return {
    id: crypto.randomUUID(),
    orderId: data.orderId || '',
    productId: data.productId || '',
    variantId: data.variantId || '',
    name: data.name || '',
    sku: data.sku || '',
    quantity: data.quantity || 1,
    price: data.price || 0,
    total: data.total || 0,
  };
}

export default { createOrderItem };