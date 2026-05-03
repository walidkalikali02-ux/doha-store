import {supabaseAdmin} from '../lib/supabase';

export interface ShippingAddress {
  city?: string;
  area?: string;
  state?: string;
  country?: string;
}

export interface CartItem {
  id?: string;
  productId: string;
  quantity: number;
  price?: number;
  weight?: number;
}

export interface ShippingMethod {
  method: string;
  label: string;
  cost: number;
  estimatedDays: string;
}

export interface ShippingOption {
  method: string;
  cost: number;
  estimatedDays: string;
}

export interface ZoneInfo {
  id: string;
  name: string;
  code: string;
}

const DEFAULT_FREE_THRESHOLD = 100;

export function determineZone(address: ShippingAddress): string {
  const city = (address.city || '').toUpperCase();
  const area = (address.area || '').toUpperCase();

  if (city.includes('DOHA') || area.includes('DOHA') || (area.includes('WEST BAY') || area.includes('CORNICHE'))) {
    return 'DOHACITY';
  }
  if (city.includes('AL RAYYAN') || area.includes('AL RAYYAN')) {
    return 'ALRAYYAN';
  }
  if (city.includes('AL WAKRAH') || city.includes('WAKRAH') || area.includes('AL WAKRAH')) {
    return 'ALWAKRAH';
  }
  return 'OTHER';
}

function calculateRateCost(
  baseRate: number,
  weightRate: number,
  cartWeight: number,
  freeThreshold: number,
  cartValue: number
): number {
  if (cartValue > freeThreshold) {
    return 0;
  }
  return Number(baseRate) + Number(weightRate) * cartWeight;
}

function formatEstimatedDays(min: number, max: number): string {
  if (min === max) {
    return `${min} day${min > 1 ? 's' : ''}`;
  }
  return `${min}-${max} days`;
}

function getMethodLabel(method: string): string {
  switch (method) {
    case 'standard':
      return 'Standard Shipping';
    case 'express':
      return 'Express Shipping';
    case 'overnight':
      return 'Overnight Shipping';
    default:
      return method;
  }
}

export async function getShippingRates(
  address: ShippingAddress,
  cartItems: CartItem[]
): Promise<{methods: ShippingMethod[]}> {
  const cartWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
  const cartValue = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const zoneCode = determineZone(address);

  const {data: zone} = await supabaseAdmin
    .from('shipping_zones')
    .select('*')
    .eq('code', zoneCode)
    .single();

  if (!zone) {
    return {
      methods: [
        {method: 'standard', label: 'Standard Shipping', cost: 25, estimatedDays: '5-7 days'},
        {method: 'express', label: 'Express Shipping', cost: 45, estimatedDays: '2-3 days'},
        {method: 'overnight', label: 'Overnight Shipping', cost: 75, estimatedDays: '1 day'},
      ],
    };
  }

  const {data: rates, error} = await supabaseAdmin
    .from('shipping_rates')
    .select('*')
    .eq('zone_id', zone.id)
    .eq('is_active', true)
    .order('method', {ascending: true});

  if (error || !rates || rates.length === 0) {
    return {
      methods: [
        {method: 'standard', label: 'Standard Shipping', cost: 25, estimatedDays: '5-7 days'},
        {method: 'express', label: 'Express Shipping', cost: 45, estimatedDays: '2-3 days'},
        {method: 'overnight', label: 'Overnight Shipping', cost: 75, estimatedDays: '1 day'},
      ],
    };
  }

  const methods: ShippingMethod[] = rates.map(rate => ({
    method: rate.method,
    label: getMethodLabel(rate.method),
    cost: calculateRateCost(
      rate.base_rate,
      rate.weight_rate,
      cartWeight,
      rate.free_threshold || DEFAULT_FREE_THRESHOLD,
      cartValue
    ),
    estimatedDays: formatEstimatedDays(rate.estimated_days_min, rate.estimated_days_max),
  }));

  return {methods};
}

export default {getShippingRates};