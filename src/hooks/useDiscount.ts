import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {api} from '@/services/api';
import {useToast} from '@/components/common';
import {QUERY_KEYS} from '@/lib/queryClient';

interface DiscountResponse {
  code: string;
  discountPercent: number;
  discountAmount: number;
  isValid: boolean;
  message?: string;
  expiresAt?: string;
  minimumOrderAmount?: number;
  appliedTo?: 'all' | 'category' | 'product';
}

interface ValidateDiscountParams {
  code: string;
  cartTotal: number;
}

interface DiscountSuggestion {
  code: string;
  discountPercent: number;
  description: string;
  minimumOrderAmount: number;
  expiresAt: string;
}

export function useApplyDiscount() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (code: string): Promise<DiscountResponse> => {
      const response = await api.post<DiscountResponse>('/cart/discount/apply', {
        code,
      });
      return response;
    },

    onMutate: async code => {
      await queryClient.cancelQueries({queryKey: QUERY_KEYS.cart});

      const previousCart = queryClient.getQueryData(QUERY_KEYS.cart);

      queryClient.setQueryData(QUERY_KEYS.cart, (old: unknown) => {
        if (!old) return old;
        return {
          ...(old as object),
          discountCode: code,
          discountApplied: true,
        };
      });

      return {previousCart};
    },

    onSuccess: data => {
      if (data.isValid) {
        toast.success('تم تطبيق الخصم', `خصم ${data.discountPercent}% بنجاح`);
        queryClient.invalidateQueries({queryKey: QUERY_KEYS.cart});
      } else {
        toast.error('كود خصم غير صالح', data.message ?? 'يرجى المحاولة مرة أخرى');
      }
    },

    onError: (error: Error) => {
      const message = error.message ?? 'فشل في تطبيق كود الخصم';
      toast.error('خطأ في تطبيق الخصم', message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: QUERY_KEYS.cart});
    },
  });
}

export function useRemoveDiscount() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (): Promise<{success: boolean}> => {
      const response = await api.delete<{success: boolean}>('/cart/discount');
      return response;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({queryKey: QUERY_KEYS.cart});

      const previousCart = queryClient.getQueryData(QUERY_KEYS.cart);

      queryClient.setQueryData(QUERY_KEYS.cart, (old: unknown) => {
        if (!old) return old;
        return {
          ...(old as object),
          discountCode: null,
          discountApplied: false,
          discountAmount: 0,
          discountPercent: 0,
        };
      });

      return {previousCart};
    },

    onSuccess: () => {
      toast.success('تم إزالة الخصم', 'تم إزالة كود الخصم بنجاح');
    },

    onError: (error: Error) => {
      const message = error.message ?? 'فشل في إزالة كود الخصم';
      toast.error('خطأ في إزالة الخصم', message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: QUERY_KEYS.cart});
    },
  });
}

export function useValidateDiscount() {
  return useMutation({
    mutationFn: async (params: ValidateDiscountParams): Promise<DiscountResponse> => {
      const response = await api.post<DiscountResponse>('/cart/discount/validate', {
        code: params.code,
        cartTotal: params.cartTotal,
      });
      return response;
    },
  });
}

export function useDiscountSuggestions() {
  const [suggestions] = useState<DiscountSuggestion[]>([
    {
      code: 'WELCOME15',
      discountPercent: 15,
      description: 'خصم 15% على طلبك الأول',
      minimumOrderAmount: 2000,
      expiresAt: '2025-12-31',
    },
    {
      code: 'COFFEE10',
      discountPercent: 10,
      description: 'خصم 10% على جميع منتجات القهوة',
      minimumOrderAmount: 1500,
      expiresAt: '2025-12-31',
    },
    {
      code: 'FREESHIP',
      discountPercent: 0,
      description: 'شحن مجاني على الطلبات فوق 5 د.ك',
      minimumOrderAmount: 5000,
      expiresAt: '2025-12-31',
    },
    {
      code: 'RAMADAN20',
      discountPercent: 20,
      description: 'خصم 20% بمناسبة رمضان',
      minimumOrderAmount: 3000,
      expiresAt: '2025-04-30',
    },
  ]);

  return {suggestions};
}

export function useDiscount() {
  const applyMutation = useApplyDiscount();
  const removeMutation = useRemoveDiscount();
  const validateMutation = useValidateDiscount();
  const {suggestions} = useDiscountSuggestions();

  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const applyDiscount = useCallback(
    async (code: string) => {
      const result = await applyMutation.mutateAsync(code);
      if ((result as DiscountResponse).isValid) {
        setAppliedCode(code);
        return true;
      }
      return false;
    },
    [applyMutation]
  );

  const removeDiscount = useCallback(async () => {
    await removeMutation.mutateAsync();
    setAppliedCode(null);
  }, [removeMutation]);

  const validateDiscount = useCallback(
    async (code: string, cartTotal: number) => {
      const result = await validateMutation.mutateAsync({code, cartTotal});
      return result as DiscountResponse;
    },
    [validateMutation]
  );

  const isApplying = applyMutation.isPending;
  const isRemoving = removeMutation.isPending;
  const isValidating = validateMutation.isPending;

  return {
    applyDiscount,
    removeDiscount,
    validateDiscount,
    appliedCode,
    suggestions,
    isApplying,
    isRemoving,
    isValidating,
    applyError: applyMutation.error,
    removeError: removeMutation.error,
  };
}

export type {DiscountResponse, DiscountSuggestion};
