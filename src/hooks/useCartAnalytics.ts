import {useCallback, useEffect, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useCartStore, useCartItems, useCartSummary} from '@/stores/cartStore';
import {analytics} from '@/lib/analytics';

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  grind: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function useCartAnalytics() {
  const location = useLocation();
  const items = useCartItems();
  const summary = useCartSummary();
  const previousItemsRef = useRef<CartItem[]>([]);
  const abandonmentTrackedRef = useRef(false);

  const trackAddToCart = useCallback(
    (item: CartItem) => {
      analytics.trackAddToCart({
        productId: item.productId,
        productName: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
      });

      analytics.trackEvent({
        eventName: 'add_to_cart',
        eventCategory: 'cart',
        eventLabel: item.name,
        eventValue: item.totalPrice,
        additionalData: {
          item_id: item.id,
          variant_id: item.variantId,
          size: item.size,
          grind: item.grind,
          cart_total: summary.total,
          cart_item_count: summary.itemCount,
        },
      });
    },
    [summary]
  );

  const trackRemoveFromCart = useCallback(
    (item: CartItem) => {
      analytics.trackRemoveFromCart({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
      });

      analytics.trackEvent({
        eventName: 'remove_from_cart',
        eventCategory: 'cart',
        eventLabel: item.name,
        eventValue: item.totalPrice,
        additionalData: {
          item_id: item.id,
          variant_id: item.variantId,
          cart_total: summary.total,
          cart_item_count: summary.itemCount,
        },
      });
    },
    [summary]
  );

  const trackQuantityUpdate = useCallback(
    (item: CartItem, oldQuantity: number, newQuantity: number) => {
      analytics.trackEvent({
        eventName: 'update_cart_quantity',
        eventCategory: 'cart',
        eventLabel: item.name,
        eventValue: newQuantity,
        additionalData: {
          item_id: item.id,
          variant_id: item.variantId,
          old_quantity: oldQuantity,
          new_quantity: newQuantity,
          unit_price: item.unitPrice,
          old_total: oldQuantity * item.unitPrice,
          new_total: newQuantity * item.unitPrice,
          cart_total: summary.total,
          cart_item_count: summary.itemCount,
        },
      });

      if (newQuantity > oldQuantity) {
        analytics.trackAddToCart({
          productId: item.productId,
          productName: item.name,
          price: item.unitPrice,
          quantity: newQuantity - oldQuantity,
        });
      } else if (newQuantity < oldQuantity) {
        analytics.trackRemoveFromCart({
          productId: item.productId,
          productName: item.name,
          quantity: oldQuantity - newQuantity,
        });
      }
    },
    [summary]
  );

  const trackCartView = useCallback(() => {
    analytics.trackPageView({
      pageName: 'cart',
      pageCategory: 'ecommerce',
      additionalData: {
        cart_value: summary.total,
        cart_items: summary.itemCount,
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
      },
    });
  }, [summary, items]);

  const trackCartAbandonment = useCallback(() => {
    if (items.length === 0 || abandonmentTrackedRef.current) {
      return;
    }

    abandonmentTrackedRef.current = true;

    analytics.trackEvent({
      eventName: 'cart_abandoned',
      eventCategory: 'cart',
      eventLabel: 'Cart Abandonment',
      eventValue: summary.total,
      additionalData: {
        cart_value: summary.total,
        cart_items: summary.itemCount,
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
        abandonment_page: location.pathname,
        abandonment_timestamp: new Date().toISOString(),
      },
    });
  }, [items, summary, location.pathname]);

  const trackBeginCheckout = useCallback(() => {
    analytics.trackCheckoutStart({
      totalAmount: summary.total,
      itemCount: summary.itemCount,
      products: items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    });
  }, [summary, items]);

  useEffect(() => {
    const previousItems = previousItemsRef.current;

    for (const currentItem of items) {
      const previousItem = previousItems.find(p => p.id === currentItem.id);

      if (!previousItem) {
        trackAddToCart(currentItem);
      } else if (previousItem.quantity !== currentItem.quantity) {
        trackQuantityUpdate(currentItem, previousItem.quantity, currentItem.quantity);
      }
    }

    for (const previousItem of previousItems) {
      if (!items.find(i => i.id === previousItem.id)) {
        trackRemoveFromCart(previousItem);
      }
    }

    previousItemsRef.current = [...items];
  }, [items, trackAddToCart, trackQuantityUpdate, trackRemoveFromCart]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (items.length > 0 && !location.pathname.includes('/checkout')) {
        trackCartAbandonment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [items, location.pathname, trackCartAbandonment]);

  return {
    trackAddToCart,
    trackRemoveFromCart,
    trackQuantityUpdate,
    trackCartView,
    trackCartAbandonment,
    trackBeginCheckout,
  };
}

export function useCartWithAnalytics() {
  const store = useCartStore();
  const cartAnalytics = useCartAnalytics();
  const navigate = useNavigate();

  const addItemWithTracking = useCallback(
    (
      product: Parameters<typeof store.addItem>[0],
      variantId: Parameters<typeof store.addItem>[1],
      size: Parameters<typeof store.addItem>[2],
      grind: Parameters<typeof store.addItem>[3],
      quantity: Parameters<typeof store.addItem>[4]
    ) => {
      store.addItem(product, variantId, size, grind, quantity);
    },
    [store]
  );

  const removeItemWithTracking = useCallback(
    (id: string) => {
      const item = store.items.find((i: CartItem) => i.id === id);
      if (item) {
        cartAnalytics.trackRemoveFromCart(item);
      }
      store.removeItem(id);
    },
    [store, cartAnalytics]
  );

  const updateQuantityWithTracking = useCallback(
    (id: string, quantity: number) => {
      const item = store.items.find((i: CartItem) => i.id === id);
      if (item) {
        cartAnalytics.trackQuantityUpdate(item, item.quantity, quantity);
      }
      store.updateQuantity(id, quantity);
    },
    [store, cartAnalytics]
  );

  const clearCartWithTracking = useCallback(() => {
    store.items.forEach((item: CartItem) => {
      cartAnalytics.trackRemoveFromCart(item);
    });
    store.clearCart();
  }, [store, cartAnalytics]);

  const proceedToCheckout = useCallback(() => {
    cartAnalytics.trackBeginCheckout();
    navigate('/checkout/shipping');
  }, [navigate, cartAnalytics]);

  return {
    ...store,
    addItem: addItemWithTracking,
    removeItem: removeItemWithTracking,
    updateQuantity: updateQuantityWithTracking,
    clearCart: clearCartWithTracking,
    proceedToCheckout,
    ...cartAnalytics,
  };
}
