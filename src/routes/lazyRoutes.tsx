import {lazy, Suspense, ComponentType} from 'react';
import {PageSkeleton} from '@/components/skeletons';

function withSuspense<P extends object>(
  LazyComponent: React.LazyExoticComponent<ComponentType<P>>,
  variant: 'default' | 'product' | 'checkout' | 'account' | 'admin' = 'default'
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={<PageSkeleton variant={variant} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

function extractDefault<K extends string>(
  module: Record<K, ComponentType>,
  key: K
): {default: ComponentType} {
  return {default: module[key]};
}

export const LazyHome = lazy(() => import('@/pages/Home').then(m => extractDefault(m, 'Home')));
export const LazyShop = lazy(() => import('@/pages/Shop').then(m => extractDefault(m, 'Shop')));
export const LazyProduct = lazy(() =>
  import('@/pages/Product').then(m => extractDefault(m, 'Product'))
);
export const LazyProducts = lazy(() =>
  import('@/pages/Products').then(m => extractDefault(m, 'Products'))
);
export const LazyCart = lazy(() => import('@/pages/Cart').then(m => extractDefault(m, 'Cart')));
export const LazyAbout = lazy(() => import('@/pages/About').then(m => extractDefault(m, 'About')));
export const LazyContact = lazy(() =>
  import('@/pages/Contact').then(m => extractDefault(m, 'Contact'))
);
export const LazyTools = lazy(() => import('@/pages/Tools').then(m => extractDefault(m, 'Tools')));
export const LazyProductDetail = lazy(() =>
  import('@/pages/ProductDetail').then(m => extractDefault(m, 'ProductDetail'))
);

export const LazyLogin = lazy(() =>
  import('@/pages/Auth/Login').then(m => extractDefault(m, 'Login'))
);
export const LazyRegister = lazy(() =>
  import('@/pages/Auth/Register').then(m => extractDefault(m, 'Register'))
);
export const LazyForgotPassword = lazy(() =>
  import('@/pages/Auth/ForgotPassword').then(m => extractDefault(m, 'ForgotPassword'))
);
export const LazyResetPassword = lazy(() =>
  import('@/pages/Auth/ResetPassword').then(m => extractDefault(m, 'ResetPassword'))
);
export const LazyVerifyEmail = lazy(() =>
  import('@/pages/Auth/VerifyEmail').then(m => extractDefault(m, 'VerifyEmail'))
);

export const LazyAccountDashboard = lazy(() =>
  import('@/pages/Account/Dashboard').then(m => extractDefault(m, 'AccountDashboard'))
);
export const LazyProfile = lazy(() =>
  import('@/pages/Account/Profile').then(m => extractDefault(m, 'Profile'))
);
export const LazyAddresses = lazy(() =>
  import('@/pages/Account/Addresses').then(m => extractDefault(m, 'Addresses'))
);
export const LazyPaymentMethods = lazy(() =>
  import('@/pages/Account/PaymentMethods').then(m => extractDefault(m, 'PaymentMethods'))
);
export const LazyOrders = lazy(() =>
  import('@/pages/Account/Orders').then(m => extractDefault(m, 'Orders'))
);
export const LazyOrderDetail = lazy(() =>
  import('@/pages/Account/OrderDetail').then(m => extractDefault(m, 'OrderDetail'))
);
export const LazySubscriptions = lazy(() =>
  import('@/pages/Account/Subscriptions').then(m => extractDefault(m, 'Subscriptions'))
);
export const LazySubscriptionDetail = lazy(() =>
  import('@/pages/Account/SubscriptionDetail').then(m => extractDefault(m, 'SubscriptionDetail'))
);
export const LazyLoyalty = lazy(() =>
  import('@/pages/Account/Loyalty').then(m => extractDefault(m, 'Loyalty'))
);
export const LazyReferral = lazy(() =>
  import('@/pages/Account/Referral').then(m => extractDefault(m, 'Referral'))
);

export const LazyCheckoutShipping = lazy(() =>
  import('@/pages/Checkout/Shipping').then(m => extractDefault(m, 'Shipping'))
);
export const LazyCheckoutPayment = lazy(() =>
  import('@/pages/Checkout/Payment').then(m => extractDefault(m, 'Payment'))
);
export const LazyCheckoutReview = lazy(() =>
  import('@/pages/Checkout/Review').then(m => extractDefault(m, 'Review'))
);
export const LazyCheckoutConfirmation = lazy(() =>
  import('@/pages/Checkout/Confirmation').then(m => extractDefault(m, 'Confirmation'))
);

export const LazyAdminDashboard = lazy(() =>
  import('@/pages/Admin/Dashboard').then(m => extractDefault(m, 'Dashboard'))
);
export const LazyAdminOrders = lazy(() =>
  import('@/pages/Admin/Orders').then(m => extractDefault(m, 'AdminOrders'))
);
export const LazyAdminOrderDetail = lazy(() =>
  import('@/pages/Admin/OrderDetail').then(m => extractDefault(m, 'AdminOrderDetail'))
);
export const LazyAdminProducts = lazy(() =>
  import('@/pages/Admin/Products').then(m => extractDefault(m, 'AdminProducts'))
);
export const LazyAdminCustomers = lazy(() =>
  import('@/pages/Admin/Customers').then(m => extractDefault(m, 'AdminCustomers'))
);
export const LazyAdminReviews = lazy(() =>
  import('@/pages/Admin/Reviews').then(m => extractDefault(m, 'Reviews'))
);

export const LazyWriteReview = lazy(() =>
  import('@/pages/Reviews/WriteReview').then(m => extractDefault(m, 'WriteReview'))
);

export const SuspendedHome = withSuspense(LazyHome);
export const SuspendedShop = withSuspense(LazyShop);
export const SuspendedProduct = withSuspense(LazyProduct, 'product');
export const SuspendedProducts = withSuspense(LazyProducts);
export const SuspendedCart = withSuspense(LazyCart);
export const SuspendedAbout = withSuspense(LazyAbout);
export const SuspendedContact = withSuspense(LazyContact);
export const SuspendedTools = withSuspense(LazyTools);
export const SuspendedProductDetail = withSuspense(LazyProductDetail, 'product');

export const SuspendedLogin = withSuspense(LazyLogin);
export const SuspendedRegister = withSuspense(LazyRegister);
export const SuspendedForgotPassword = withSuspense(LazyForgotPassword);
export const SuspendedResetPassword = withSuspense(LazyResetPassword);
export const SuspendedVerifyEmail = withSuspense(LazyVerifyEmail);

export const SuspendedAccountDashboard = withSuspense(LazyAccountDashboard, 'account');
export const SuspendedProfile = withSuspense(LazyProfile, 'account');
export const SuspendedAddresses = withSuspense(LazyAddresses, 'account');
export const SuspendedPaymentMethods = withSuspense(LazyPaymentMethods, 'account');
export const SuspendedOrders = withSuspense(LazyOrders, 'account');
export const SuspendedOrderDetail = withSuspense(LazyOrderDetail, 'account');
export const SuspendedSubscriptions = withSuspense(LazySubscriptions, 'account');
export const SuspendedSubscriptionDetail = withSuspense(LazySubscriptionDetail, 'account');
export const SuspendedLoyalty = withSuspense(LazyLoyalty, 'account');
export const SuspendedReferral = withSuspense(LazyReferral, 'account');

export const SuspendedCheckoutShipping = withSuspense(LazyCheckoutShipping, 'checkout');
export const SuspendedCheckoutPayment = withSuspense(LazyCheckoutPayment, 'checkout');
export const SuspendedCheckoutReview = withSuspense(LazyCheckoutReview, 'checkout');
export const SuspendedCheckoutConfirmation = withSuspense(LazyCheckoutConfirmation, 'checkout');

export const SuspendedAdminDashboard = withSuspense(LazyAdminDashboard, 'admin');
export const SuspendedAdminOrders = withSuspense(LazyAdminOrders, 'admin');
export const SuspendedAdminOrderDetail = withSuspense(LazyAdminOrderDetail, 'admin');
export const SuspendedAdminProducts = withSuspense(LazyAdminProducts, 'admin');
export const SuspendedAdminCustomers = withSuspense(LazyAdminCustomers, 'admin');
export const SuspendedAdminReviews = withSuspense(LazyAdminReviews, 'admin');

export const SuspendedWriteReview = withSuspense(LazyWriteReview);

export const lazyRouteConfig = {
  home: {path: '/', component: LazyHome},
  shop: {path: '/shop', component: LazyShop},
  product: {path: '/product/:id', component: LazyProduct},
  products: {path: '/products', component: LazyProducts},
  cart: {path: '/cart', component: LazyCart},
  about: {path: '/about', component: LazyAbout},
  contact: {path: '/contact', component: LazyContact},
  tools: {path: '/tools', component: LazyTools},
  productDetail: {path: '/products/:id', component: LazyProductDetail},
};

export function preloadRoute(routeName: keyof typeof lazyRouteConfig): void {
  const route = lazyRouteConfig[routeName];
  if (route && 'component' in route) {
    void route.component;
  }
}
