import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  addressService,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from '@/services/address';

export function useSavedAddresses() {
  const queryClient = useQueryClient();

  const addresses = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await addressService.getAddresses();
      if (!response.success) {
        throw new Error(response.data ? 'Failed to fetch addresses' : 'Unknown error');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const saveAddress = useMutation({
    mutationFn: async (data: CreateAddressData) => {
      const response = await addressService.createAddress(data);
      if (!response.success) {
        throw new Error('Failed to save address');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['addresses']});
    },
  });

  const updateAddress = useMutation({
    mutationFn: async (data: UpdateAddressData) => {
      const response = await addressService.updateAddress(data);
      if (!response.success) {
        throw new Error('Failed to update address');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['addresses']});
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const response = await addressService.deleteAddress(id);
      if (!response.success) {
        throw new Error('Failed to delete address');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['addresses']});
    },
  });

  const setDefaultAddress = useMutation({
    mutationFn: async (id: string) => {
      const response = await addressService.setDefaultAddress(id);
      if (!response.success) {
        throw new Error('Failed to set default address');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['addresses']});
    },
  });

  const defaultAddress = addresses.data?.find((addr: Address) => addr.isDefault);
  const otherAddresses = addresses.data?.filter((addr: Address) => !addr.isDefault) ?? [];

  return {
    addresses: addresses.data ?? [],
    defaultAddress,
    otherAddresses,
    isLoading: addresses.isLoading,
    isError: addresses.isError,
    error: addresses.error,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: addresses.refetch,
  };
}
