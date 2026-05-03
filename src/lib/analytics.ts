type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutStepData {
  shippingMethod?: string;
  totalAmount?: number;
  itemCount?: number;
  currency?: string;
  products?: Array<{
    id: string;
    name: string;
    category?: string;
    price: number;
    quantity: number;
  }>;
}

interface PurchaseData {
  orderId: string;
  revenue: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    category?: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod?: string;
  shippingMethod?: string;
}

interface ErrorEventData {
  errorType: string;
  errorMessage: string;
  errorCode?: string;
  step?: CheckoutStep;
  additionalData?: Record<string, unknown>;
}

interface PageViewData {
  pageName: string;
  pageCategory?: string;
  additionalData?: Record<string, unknown>;
}

interface EventData {
  eventName: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
  additionalData?: Record<string, unknown>;
}

class Analytics {
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    this.enabled = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.debug = import.meta.env.DEV;
  }

  private log(message: string, data?: unknown) {
    if (this.debug) {
      console.log(`[Analytics] ${message}`, data ?? '');
    }
  }

  private pushToDataLayer(event: string, data: Record<string, unknown>) {
    if (!this.enabled) return;

    const dataLayer =
      (window as unknown as {dataLayer?: Array<Record<string, unknown>>}).dataLayer ?? [];
    dataLayer.push({
      event,
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.log(`Event: ${event}`, data);
  }

  trackPageView(data: PageViewData) {
    this.pushToDataLayer('page_view', {
      page_name: data.pageName,
      page_category: data.pageCategory,
      ...data.additionalData,
    });
  }

  trackCheckoutStep(step: CheckoutStep, data: CheckoutStepData) {
    const stepNames: Record<CheckoutStep, string> = {
      1: 'shipping',
      2: 'payment',
      3: 'review',
      4: 'confirmation',
    };

    this.pushToDataLayer('checkout_step', {
      checkout_step: step,
      checkout_step_name: stepNames[step],
      shipping_method: data.shippingMethod,
      total_amount: data.totalAmount,
      item_count: data.itemCount,
      products: data.products,
    });
  }

  trackCheckoutStart(data: CheckoutStepData) {
    this.pushToDataLayer('begin_checkout', {
      currency: data.currency ?? 'QAR',
      value: data.totalAmount,
      items: data.products,
      item_count: data.itemCount,
    });
  }

  trackShippingSelected(shippingMethod: string, shippingCost: number) {
    this.pushToDataLayer('shipping_selected', {
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      currency: 'QAR',
    });
  }

  trackPaymentSelected(paymentMethod: string) {
    this.pushToDataLayer('payment_selected', {
      payment_method: paymentMethod,
    });
  }

  trackPurchase(data: PurchaseData) {
    this.pushToDataLayer('purchase', {
      transaction_id: data.orderId,
      value: data.revenue,
      currency: data.currency ?? 'QAR',
      tax: data.tax,
      shipping: data.shipping,
      payment_method: data.paymentMethod,
      shipping_method: data.shippingMethod,
      items: data.items,
    });
  }

  trackError(data: ErrorEventData) {
    this.pushToDataLayer('checkout_error', {
      error_type: data.errorType,
      error_message: data.errorMessage,
      error_code: data.errorCode,
      checkout_step: data.step,
      ...data.additionalData,
    });
  }

  trackEvent(data: EventData) {
    this.pushToDataLayer('custom_event', {
      event_name: data.eventName,
      event_category: data.eventCategory,
      event_label: data.eventLabel,
      event_value: data.eventValue,
      ...data.additionalData,
    });
  }

  trackAddToCart(data: {
    productId: string;
    productName: string;
    category?: string;
    price: number;
    quantity: number;
  }) {
    this.pushToDataLayer('add_to_cart', {
      item_id: data.productId,
      item_name: data.productName,
      item_category: data.category,
      price: data.price,
      quantity: data.quantity,
      currency: 'QAR',
    });
  }

  trackRemoveFromCart(data: {productId: string; productName: string; quantity: number}) {
    this.pushToDataLayer('remove_from_cart', {
      item_id: data.productId,
      item_name: data.productName,
      quantity: data.quantity,
    });
  }

  trackViewItem(data: {productId: string; productName: string; category?: string; price: number}) {
    this.pushToDataLayer('view_item', {
      item_id: data.productId,
      item_name: data.productName,
      item_category: data.category,
      price: data.price,
      currency: 'QAR',
    });
  }

  trackSearch(searchTerm: string, resultsCount: number) {
    this.pushToDataLayer('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  trackUserAction(action: string, additionalData?: Record<string, unknown>) {
    this.pushToDataLayer('user_action', {
      action,
      ...additionalData,
    });
  }

  setUserId(userId: string) {
    this.pushToDataLayer('set_user_id', {
      user_id: userId,
    });
  }

  clearUserId() {
    this.pushToDataLayer('clear_user_id', {});
  }
}

export const analytics = new Analytics();

export type {CheckoutStep, CheckoutStepData, PurchaseData, ErrorEventData, PageViewData, EventData};
