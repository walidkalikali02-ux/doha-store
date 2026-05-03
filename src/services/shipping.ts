import {api} from './api';
import type {ApiResponse} from '@/types';

interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  estimatedDays: number;
}

export const shippingService = {
  async calculateRates(
    country: string,
    postalCode: string,
    weight: number
  ): Promise<ApiResponse<ShippingRate[]>> {
    return api.get<ApiResponse<ShippingRate[]>>('/shipping/rates', {
      params: {country, postalCode, weight},
    });
  },

  async trackShipment(trackingNumber: string): Promise<
    ApiResponse<{
      status: string;
      estimatedDelivery: string;
      events: {date: string; location: string; status: string}[];
    }>
  > {
    return api.get<
      ApiResponse<{
        status: string;
        estimatedDelivery: string;
        events: {date: string; location: string; status: string}[];
      }>
    >(`/shipping/track/${trackingNumber}`);
  },
};
