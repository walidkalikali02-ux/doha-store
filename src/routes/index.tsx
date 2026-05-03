import {createBrowserRouter, Navigate, Outlet} from 'react-router-dom';
import {AdminLayout} from '@/components/admin/AdminLayout';
import {CartProvider} from '@/contexts/CartContext';
import {AuthProvider} from '@/contexts/AuthContext';
import {CartProvider as LegacyCartProvider} from '@/context/CartContext';
import {ProtectedRoute, PublicOnlyRoute} from '@/components/routing/RouteGuards';
import {Login} from '@/pages/Auth/Login';
import {Register} from '@/pages/Auth/Register';
import {ForgotPassword} from '@/pages/Auth/ForgotPassword';
import {ResetPassword} from '@/pages/Auth/ResetPassword';
import {VerifyEmail} from '@/pages/Auth/VerifyEmail';
import {Home} from '@/pages/Home';
import {Shop} from '@/pages/Shop';
import {Product} from '@/pages/Product';
import {Cart} from '@/pages/Cart';
import {CheckoutLayout} from '@/pages/Checkout/Layout';
import {Shipping} from '@/pages/Checkout/Shipping';
import {Payment} from '@/pages/Checkout/Payment';
import {Review} from '@/pages/Checkout/Review';
import {Confirmation} from '@/pages/Checkout/Confirmation';
import {PaymentDemo} from '@/pages/Checkout/PaymentDemo';
import {EmbeddedPaymentDemo} from '@/pages/Checkout/EmbeddedPaymentDemo';
import {QatarPaymentDemo} from '@/pages/Checkout/QatarPaymentDemo';
import {AccountDashboard} from '@/pages/Account/Dashboard';
import {Profile} from '@/pages/Account/Profile';
import {Addresses} from '@/pages/Account/Addresses';
import {PaymentMethods} from '@/pages/Account/PaymentMethods';
import {Orders} from '@/pages/Account/Orders';
import {OrderDetail} from '@/pages/Account/OrderDetail';
import {Subscriptions} from '@/pages/Account/Subscriptions';
import {SubscriptionDetail} from '@/pages/Account/SubscriptionDetail';
import {Loyalty} from '@/pages/Account/Loyalty';
import {Referral} from '@/pages/Account/Referral';
import {Dashboard as AdminDashboard} from '@/pages/Admin/Dashboard';
import {AdminOrders} from '@/pages/Admin/Orders';
import {AdminOrderDetail} from '@/pages/Admin/OrderDetail';
import {AdminProducts} from '@/pages/Admin/Products';
import {AdminCategories} from '@/pages/Admin/Categories';
import {AdminCustomers} from '@/pages/Admin/Customers';
import {Reviews as AdminReviews} from '@/pages/Admin/Reviews';
import {AdminAnalytics} from '@/pages/Admin/Analytics';
import {Products} from '@/pages/Products';
import {Tools} from '@/pages/Tools';
import {About} from '@/pages/About';
import {Contact} from '@/pages/Contact';
import {Wholesale} from '@/pages/Wholesale';
import {ProductDetail} from '@/pages/ProductDetail';
import {Track} from '@/pages/Track';
import {Navbar} from '@/components/Navbar';
import {Footer} from '@/components/Footer';

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <CartProvider>
          <LegacyCartProvider>
            <Navbar />
            <Outlet />
            <Footer />
          </LegacyCartProvider>
        </CartProvider>
      </AuthProvider>
    ),
    children: [
      // Public routes
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/shop',
        element: <Shop />,
      },
      {
        path: '/shop/:category',
        element: <Shop />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/tools',
        element: <Tools />,
      },
      {
        path: '/product/:slug',
        element: <Product />,
      },
      {
        path: '/product/:id',
        element: <ProductDetail />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/track',
        element: <Track />,
      },
      {
        path: '/track/:orderNumber',
        element: <Track />,
      },
      {
        path: '/wholesale',
        element: <Wholesale />,
      },
      {
        path: '/blog',
        element: <div className="py-24 text-center text-3xl font-black">المدونة - قريباً</div>,
      },
      {
        path: '/branches',
        element: <div className="py-24 text-center text-3xl font-black">فروعنا - قريباً</div>,
      },
      {
        path: '/payment-demo',
        element: <PaymentDemo />,
      },
      {
        path: '/embedded-payment-demo',
        element: <EmbeddedPaymentDemo />,
      },
      {
        path: '/qatar-payment-demo',
        element: <QatarPaymentDemo />,
      },

      // Auth routes (public only)
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <PublicOnlyRoute>
            <ResetPassword />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },

      // 403 Forbidden
      {
        path: '/403',
        element: (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-black text-[#c6a355]">403</h1>
              <h2 className="text-2xl font-bold text-[#000000] mt-4">Access Denied</h2>
              <p className="text-[#737373] mt-2">You don't have permission to access this page.</p>
              <a
                href="/"
                className="inline-block mt-6 px-6 py-3 bg-[#000000] text-white rounded-lg font-medium hover:bg-[#333333] transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        ),
      },

      // Checkout flow
      {
        path: '/checkout',
        element: <CheckoutLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="shipping" replace />,
          },
          {
            path: 'shipping',
            element: <Shipping />,
          },
          {
            path: 'payment',
            element: <Payment />,
          },
          {
            path: 'review',
            element: <Review />,
          },
          {
            path: 'confirmation',
            element: <Confirmation />,
          },
        ],
      },

      // Account routes (protected)
      {
        path: '/account',
        element: (
          <ProtectedRoute>
            <AccountDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/addresses',
        element: (
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/payment-methods',
        element: (
          <ProtectedRoute>
            <PaymentMethods />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/subscriptions',
        element: (
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/subscriptions/:id',
        element: (
          <ProtectedRoute>
            <SubscriptionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/loyalty',
        element: (
          <ProtectedRoute>
            <Loyalty />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account/referral',
        element: (
          <ProtectedRoute>
            <Referral />
          </ProtectedRoute>
        ),
      },

      // Admin routes (admin only)
      {
        path: '/admin',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'orders',
            element: <AdminOrders />,
          },
          {
            path: 'orders/:id',
            element: <AdminOrderDetail />,
          },
          {
            path: 'products',
            element: <AdminProducts />,
          },
          {
            path: 'categories',
            element: <AdminCategories />,
          },
          {
            path: 'customers',
            element: <AdminCustomers />,
          },
          {
            path: 'reviews',
            element: <AdminReviews />,
          },
          {
            path: 'analytics',
            element: <AdminAnalytics />,
          },
        ],
      },
      // Fallback for unmatched routes
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
