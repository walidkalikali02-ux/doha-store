import {Link, Outlet, useLocation} from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Coffee,
  Search,
  Bell,
  HelpCircle,
  Store,
  BarChart3,
  Tag,
} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth';
import {useState} from 'react';

const navigation = [
  {name: 'Dashboard', href: '/admin', icon: LayoutDashboard},
  {name: 'Orders', href: '/admin/orders', icon: ShoppingBag},
  {name: 'Products', href: '/admin/products', icon: Package},
  {name: 'Categories', href: '/admin/categories', icon: Tag},
  {name: 'Customers', href: '/admin/customers', icon: Users},
  {name: 'Reviews', href: '/admin/reviews', icon: Star},
  {name: 'Analytics', href: '/admin/analytics', icon: BarChart3},
];

const secondaryNavigation = [
  {name: 'Settings', href: '/admin/settings', icon: Settings},
  {name: 'Help', href: '/admin/help', icon: HelpCircle},
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const {user, logout} = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white border-l border-[#e3e3e3] z-50 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#e5e5e5]">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-lg flex items-center justify-center">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#000000]">Doha Roastery</span>
              <span className="block text-xs text-[#737373]">Admin</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-[#737373] hover:text-[#000000]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
            Main Menu
          </p>
          {navigation.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-[#000000] text-white'
                    : 'text-[#737373] hover:bg-[#f9f9f9] hover:text-[#000000]'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-[#c6a355]' : ''}`} />
                <span>{item.name}</span>
                {item.name === 'Orders' && (
                  <span className="mr-auto bg-[#c6a355] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    12
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <nav className="p-3 border-t border-[#e5e5e5] space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
            Support
          </p>
          {secondaryNavigation.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-[#f9f9f9] text-[#000000]'
                    : 'text-[#737373] hover:bg-[#f9f9f9] hover:text-[#000000]'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-[#c6a355]' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#e5e5e5] bg-white">
          <div className="bg-[#f9f9f9] rounded-lg p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.charAt(0) ?? user?.email?.charAt(0) ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#000000] truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[#737373] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#737373] hover:text-[#000000] hover:bg-white rounded transition-colors"
              >
                <Store className="h-4 w-4" />
                View Store
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <Breadcrumb pathname={location.pathname} />
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="w-full relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search orders, products, customers..."
                  className="w-full pr-10 pl-4 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Store Live
              </span>
              <button className="relative p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="md:hidden p-2 text-[#737373] hover:text-[#000000]">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Breadcrumb Component
function Breadcrumb({pathname}: {pathname: string}) {
  const segments = pathname.split('/').filter(Boolean);
  const current = segments[segments.length - 1] || 'dashboard';

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link to="/admin" className="text-[#737373] hover:text-[#000000] transition-colors">
        Admin
      </Link>
      {segments.length > 1 && (
        <>
          <span className="text-[#e5e5e5]">/</span>
          <span className="text-[#000000] font-medium capitalize">{current}</span>
        </>
      )}
    </nav>
  );
}
