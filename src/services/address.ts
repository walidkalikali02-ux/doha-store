import {api} from './api';
import type {ApiResponse} from '@/types';

export interface Address {
  id: string;
  userId: string;
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  countryCode?: string;
  phone?: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  phone?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: string;
}

export const addressService = {
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return api.get<ApiResponse<Address[]>>('/user/addresses');
  },

  async getAddress(id: string): Promise<ApiResponse<Address>> {
    return api.get<ApiResponse<Address>>(`/user/addresses/${id}`);
  },

  async createAddress(data: CreateAddressData): Promise<ApiResponse<Address>> {
    return api.post<ApiResponse<Address>>('/user/addresses', data);
  },

  async updateAddress(data: UpdateAddressData): Promise<ApiResponse<Address>> {
    const {id, ...updateData} = data;
    return api.patch<ApiResponse<Address>>(`/user/addresses/${id}`, updateData);
  },

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/user/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<ApiResponse<Address>> {
    return api.patch<ApiResponse<Address>>(`/user/addresses/${id}/default`, {});
  },
};
