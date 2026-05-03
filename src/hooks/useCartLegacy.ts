import {useContext} from 'react';
import {CartContext} from '../context/CartContext';

export function useCartLegacy() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

// Named export for backwards compatibility
export {useCartLegacy as useCart};
