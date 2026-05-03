import { supabaseAdmin } from '../lib/supabase';
import type { Order, OrderItem } from '../types/order';

export interface CreateOrderItemInput {
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export async function findByOrderId(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return (data as OrderItem[]) || [];
}

export async function createMany(items: CreateOrderItemInput[]): Promise<OrderItem[]> {
  if (items.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('order_items')
    .insert(
      items.map((item) => ({
        order_id: item.orderId,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }))
    )
    .select();

  if (error) throw error;
  return data as OrderItem[];
}

export async function updateQuantity(itemId: string, quantity: number): Promise<OrderItem> {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as OrderItem;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function findOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null;
    throw orderError;
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;

  return {
    ...(order as Order),
    items: (items as OrderItem[]) || [],
  };
}

export async function findOrderByOrderNumberWithItems(orderNumber: string): Promise<OrderWithItems | null> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null;
    throw orderError;
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError) throw itemsError;

  return {
    ...(order as Order),
    items: (items as OrderItem[]) || [],
  };
}

export default {
  findByOrderId,
  createMany,
  updateQuantity,
  findOrderWithItems,
  findOrderByOrderNumberWithItems,
};