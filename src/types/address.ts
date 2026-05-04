export interface Address {
  id?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  label?: string;
  buildingNo?: string;
  streetName?: string;
  area?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
  code?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

export type { PaymentMethod as PaymentMethodType };
