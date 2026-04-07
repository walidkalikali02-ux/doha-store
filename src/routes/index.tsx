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
import {AdminDashboard} from '@/pages/Admin/Dashboard';
import {AdminOrders} from '@/pages/Admin/Orders';
import {AdminOrderDetail} from '@/pages/Admin/OrderDetail';
import {AdminProducts} from '@/pages/Admin/Products';
import {AdminCustomers} from '@/pages/Admin/Customers';
import {AdminReviews} from '@/pages/Admin/Reviews';
import {Products} from '@/pages/Products';
import {Tools} from '@/pages/Tools';
import {About} from '@/pages/About';
import {Contact} from '@/pages/Contact';
import {ProductDetail} from '@/pages/ProductDetail';
import {Navbar} from '@/components/Navbar';

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <CartProvider>
          <LegacyCartProvider>
            <Navbar />
            <Outlet />
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
        path: '/wholesale',
        element: (
          <div className="py-24 text-center text-3xl font-black">مبيعات الجملة - قريباً</div>
        ),
      },
      {
        path: '/blog',
        element: <div className="py-24 text-center text-3xl font-black">المدونة - قريباً</div>,
      },
      {
        path: '/branches',
        element: <div className="py-24 text-center text-3xl font-black">فروعنا - قريباً</div>,
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
            path: 'customers',
            element: <AdminCustomers />,
          },
          {
            path: 'reviews',
            element: <AdminReviews />,
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
