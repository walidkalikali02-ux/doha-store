import {Link} from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Clock,
  CreditCard,
  MapPin,
  Gift,
  User,
  ChevronRight,
  Package,
  Star,
  Settings,
  LogOut,
} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth';

export function AccountDashboard() {
  const {user, logout} = useAuth();

  const menuItems = [
    {
      title: 'My Orders',
      description: 'View order history & track shipments',
      icon: ShoppingBag,
      href: '/account/orders',
      color: 'bg-blue-100 text-blue-600',
      badge: '2 active',
    },
    {
      title: 'Subscriptions',
      description: 'Manage your coffee subscriptions',
      icon: Clock,
      href: '/account/subscriptions',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Wishlist',
      description: 'Saved items for later',
      icon: Heart,
      href: '/account/saved',
      color: 'bg-pink-100 text-pink-600',
      badge: '5 items',
    },
    {
      title: 'Loyalty Rewards',
      description: '2,450 points available',
      icon: Gift,
      href: '/account/loyalty',
      color: 'bg-amber-100 text-amber-600',
      badge: '$24.50',
    },
    {
      title: 'Payment Methods',
      description: 'Manage cards & payment options',
      icon: CreditCard,
      href: '/account/payment-methods',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Addresses',
      description: 'Shipping & billing addresses',
      icon: MapPin,
      href: '/account/addresses',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-7829',
      date: '2024-01-15',
      total: 54.0,
      status: 'Shipped',
      items: 'Ethiopian Yirgacheffe, Colombian Supremo',
    },
    {
      id: 'ORD-7825',
      date: '2024-01-10',
      total: 32.5,
      status: 'Delivered',
      items: 'Kenya AA, House Blend',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-coffee-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.firstName || 'Guest'}!</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/account/profile"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2,450</p>
              <p className="text-sm text-gray-500">Points</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-gray-500">Wishlist</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">4.9</p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-coffee-300 hover:shadow-sm transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-coffee-600 transition-colors">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-coffee-100 text-coffee-700 text-xs font-medium rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-coffee-600 transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/account/orders"
              className="text-sm text-coffee-600 hover:text-coffee-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-coffee-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{order.id}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{order.items}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{order.date}</span>
                  <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Need Help */}
          <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-4 border border-coffee-200">
            <h3 className="font-medium text-gray-900 mb-1">Need help?</h3>
            <p className="text-sm text-gray-600 mb-3">Our support team is here to assist you.</p>
            <Link
              to="/contact"
              className="inline-flex items-center text-sm font-medium text-coffee-700 hover:text-coffee-800"
            >
              Contact Support
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
