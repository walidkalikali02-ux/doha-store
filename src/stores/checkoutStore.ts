import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {useShallow} from 'zustand/react/shallow';
import type {Address, PaymentMethod, ShippingMethod} from '@/types';
import type {GuestFormData} from '@/schemas/guest.schema';

const GUEST_EMAIL_KEY = 'roastery_guest_email';

type GuestData = GuestFormData & {
  orderTrackingToken?: string;
  orderTrackingUrl?: string;
};

interface CheckoutState {
  userType: 'guest' | 'authenticated' | null;
  guestData: GuestData | null;
  shipping: {
    address: Address;
    shippingMethod: ShippingMethod;
    email: string;
    phone: string;
  } | null;
  payment: {
    method: PaymentMethod;
    cardLast4?: string;
    cardBrand?: string;
    billingAddressSameAsShipping: boolean;
    billingAddress?: Address;
  } | null;
  order: {
    orderNumber: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    discountCode?: string;
    notes?: string;
  } | null;
  discount: {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
    value: number;
  } | null;
  currentStep: 'account' | 'shipping' | 'payment' | 'review' | 'confirmation';
  step: number;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethodId: string | null;
  paymentMethodId: number | null;
  isProcessing: boolean;
  error: string | null;
  setUserType: (type: 'guest' | 'authenticated') => void;
  setGuestData: (data: GuestFormData) => void;
  setShipping: (data: NonNullable<CheckoutState['shipping']>) => void;
  setPayment: (data: NonNullable<CheckoutState['payment']>) => void;
  setOrder: (data: NonNullable<CheckoutState['order']>) => void;
  setCurrentStep: (step: CheckoutState['currentStep']) => void;
  setStep: (step: number) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setShippingMethod: (methodId: string) => void;
  setPaymentMethod: (methodId: number) => void;
  updateShippingAddress: (address: Partial<Address>) => void;
  updateShippingMethod: (method: ShippingMethod) => void;
  updatePaymentMethod: (method: PaymentMethod) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  setOrderTracking: (token: string, url: string) => void;
  setDiscount: (discount: NonNullable<CheckoutState['discount']> | null) => void;
  clearCheckout: () => void;
  clearShipping: () => void;
  clearPayment: () => void;
  clearGuestData: () => void;
  reset: () => void;
}

const initialState = {
  userType: null,
  guestData: null,
  shipping: null,
  payment: null,
  order: null,
  currentStep: 'account' as const,
  step: 0,
  shippingAddress: null,
  billingAddress: null,
  shippingMethodId: null,
  paymentMethodId: null,
  isProcessing: false,
  error: null,
  discount: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setUserType: type => set({userType: type}, {name: 'checkout-set-user-type'}),
      setGuestData: data => {
        if (typeof window !== 'undefined' && data.email) {
          sessionStorage.setItem(GUEST_EMAIL_KEY, data.email);
        }
        set({guestData: data, currentStep: 'shipping'}, {name: 'checkout-set-guest-data'});
      },
      setShipping: data =>
        set(
          {
            shipping: data,
            shippingAddress: data.address,
            shippingMethodId: data.shippingMethod,
            currentStep: 'payment',
          },
          {name: 'checkout-set-shipping'}
        ),
      setPayment: data =>
        set(
          {
            payment: data,
            currentStep: 'review',
          },
          {name: 'checkout-set-payment'}
        ),
      setOrder: data =>
        set(
          {
            order: data,
            currentStep: 'confirmation',
          },
          {name: 'checkout-set-order'}
        ),
      setCurrentStep: currentStep => set({currentStep}, {name: 'checkout-set-current-step'}),
      setStep: step => set({step}, {name: 'checkout-set-step'}),
      setShippingAddress: address =>
        set(
          state => ({
            shippingAddress: address,
            shipping: state.shipping ? {...state.shipping, address} : state.shipping,
          }),
          {name: 'checkout-set-shipping-address'}
        ),
      setBillingAddress: address => set({billingAddress: address}, {name: 'checkout-set-billing'}),
      setShippingMethod: methodId =>
        set(
          state => ({
            shippingMethodId: methodId,
            shipping: state.shipping ? {...state.shipping, shippingMethod: methodId as ShippingMethod} : state.shipping,
          }),
          {name: 'checkout-set-shipping-method'}
        ),
      setPaymentMethod: methodId =>
        set({paymentMethodId: methodId}, {name: 'checkout-set-payment-method'}),
      updateShippingAddress: address =>
        set(
          state => {
            if (!state.shipping) return state;
            const updatedAddress = {...state.shipping.address, ...address};
            return {
              shipping: {...state.shipping, address: updatedAddress},
              shippingAddress: updatedAddress,
            };
          },
          {name: 'checkout-update-shipping-address'}
        ),
      updateShippingMethod: method =>
        set(
          state => ({
            shippingMethodId: method,
            shipping: state.shipping ? {...state.shipping, shippingMethod: method} : state.shipping,
          }),
          {name: 'checkout-update-shipping-method'}
        ),
      updatePaymentMethod: method =>
        set(
          state => ({
            payment: state.payment ? {...state.payment, method} : state.payment,
          }),
          {name: 'checkout-update-payment-method'}
        ),
      setProcessing: isProcessing => set({isProcessing}, {name: 'checkout-set-processing'}),
      setError: error => set({error}, {name: 'checkout-set-error'}),
      setOrderTracking: (token, url) =>
        set(
          state =>
            state.guestData
              ? {guestData: {...state.guestData, orderTrackingToken: token, orderTrackingUrl: url}}
              : state,
          {name: 'checkout-set-order-tracking'}
        ),
      clearCheckout: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(GUEST_EMAIL_KEY);
        }
        set({...initialState}, {name: 'checkout-clear'});
      },
      clearShipping: () => set({shipping: null, shippingAddress: null, shippingMethodId: null, currentStep: 'shipping'}, {name: 'checkout-clear-shipping'}),
      clearPayment: () => set({payment: null, paymentMethodId: null, currentStep: 'payment'}, {name: 'checkout-clear-payment'}),
      clearGuestData: () => set({guestData: null}, {name: 'checkout-clear-guest-data'}),
      setDiscount: discount =>
        set({
          discount,
          order: discount && state.order
            ? {
                ...state.order,
                discountCode: discount.code,
                discountAmount: discount.amount,
                total:
                  (state.order.subtotal ?? 0) +
                  (state.order.shippingCost ?? 0) +
                  (state.order.taxAmount ?? 0) -
                  discount.amount,
              }
            : state.order,
        }, {name: 'checkout-set-discount'}),
      reset: () => {
        get().clearCheckout();
      },
    }),
    { name: 'CheckoutStore' }
  )
);

export function useUserType() {
  return useCheckoutStore(state => state.userType);
}

export function useGuestData() {
  return useCheckoutStore(state => state.guestData);
}

export function useShippingData() {
  return useCheckoutStore(state => state.shipping);
}

export function usePaymentData() {
  return useCheckoutStore(state => state.payment);
}

export function useOrderData() {
  return useCheckoutStore(state => state.order);
}

export function useCurrentStep() {
  return useCheckoutStore(state => state.currentStep);
}

export function useCheckoutActions() {
  return useCheckoutStore(
    useShallow(state => ({
      setUserType: state.setUserType,
      setGuestData: state.setGuestData,
      setShipping: state.setShipping,
      setPayment: state.setPayment,
      setOrder: state.setOrder,
      setCurrentStep: state.setCurrentStep,
      updateShippingAddress: state.updateShippingAddress,
      updateShippingMethod: state.updateShippingMethod,
      updatePaymentMethod: state.updatePaymentMethod,
      setOrderTracking: state.setOrderTracking,
      clearCheckout: state.clearCheckout,
      clearShipping: state.clearShipping,
      clearPayment: state.clearPayment,
      clearGuestData: state.clearGuestData,
      reset: state.reset,
    }))
  );
}

export default useCheckoutStore;
