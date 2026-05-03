import { useQuery, useMutation } from '@tanstack/react-query';
import { cartService } from '../services/cart';
import { useCartStore } from '../stores/cartStore';

export function useCart() {
  const store = useCartStore();

  return {
    ...store,
    refreshCart: () => {},
  };
}

export default useCart;