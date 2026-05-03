import {ShoppingBag} from 'lucide-react';
import {useCartCount} from '@/hooks/useCart';

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({onClick}: CartIconProps) {
  const itemCount = useCartCount();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingBag className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
