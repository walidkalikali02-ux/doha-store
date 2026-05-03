import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  Users,
  Package,
  AlertCircle,
  Coffee,
  Calendar,
  Loader2,
  Plus,
  Star,
  ChevronRight,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  BarChart3,
  DollarSign,
  MousePointer,
  Edit,
} from 'lucide-react';
import {motion} from 'motion/react';
import {getAdminProducts} from '@/utils/adminProducts';

// Types
interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
  date: string;
  items: number;
}

interface Activity {
  id: string;
  type: 'order' | 'customer' | 'review' | 'product' | 'campaign';
  title: string;
  description: string;
  time: string;
}

// Status configurations
const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Pending',
  },
  paid: {bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Paid'},
  processing: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Processing',
  },
  shipped: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    label: 'Shipped',
  },
  delivered: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Delivered',
  },
  cancelled: {bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Cancelled'},
};

// Metric Card
interface MetricProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
  loading?: boolean;
}

function MetricCard({title, value, change, changeLabel, icon: Icon, trend, loading}: MetricProps) {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut'}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5 hover:shadow-lg hover:border-[#c6a355]/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f9f9f9] border border-[#e5e5e5] flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#3d2b1f]" />
          </div>
          <span className="text-sm font-medium text-[#737373]">{title}</span>
        </div>
      </div>

      <div>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#e5e5e5]" />
        ) : (
          <span className="text-2xl font-bold text-[#000000]">{value}</span>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              isPositive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-[#737373]">{changeLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Status Badge
function StatusBadge({status}: {status: string}) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}

// Orders Section
function OrdersSection({orders}: {orders: Order[]}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.1}}
      className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Recent Orders</h2>
          <p className="text-sm text-[#737373]">Latest customer orders and their status</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] rounded-lg transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#c6a355] hover:text-[#3d2b1f] hover:bg-[#f9f9f9] rounded-lg transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#f9f9f9]/50">
              <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                Order
              </th>
              <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                Status
              </th>
              <th className="text-right text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                Total
              </th>
              <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                Date
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2f2f2]">
            {orders.map(order => (
              <tr
                key={order.id}
                className="group hover:bg-[#f9f9f9] transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#3d2b1f]">#{order.id}</span>
                    <span className="text-xs text-[#737373]">· {order.items} items</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#000000]">{order.customer}</p>
                      <p className="text-xs text-[#737373]">{order.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-bold text-[#000000]">
                    ${(order.total / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-[#737373]">{order.date}</span>
                </td>
                <td className="px-5 py-3">
                  <ChevronRight className="h-4 w-4 text-[#e5e5e5] group-hover:text-[#c6a355] transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-[#f2f2f2]">
        {orders.map(order => (
          <div
            key={order.id}
            className="p-4 hover:bg-[#f9f9f9] transition-colors cursor-pointer"
            onClick={() => navigate(`/admin/orders/${order.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-[#3d2b1f]">#{order.id}</span>
                <p className="text-xs text-[#737373] mt-0.5">{order.date}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {order.customer.charAt(0)}
                </div>
                <span className="text-sm font-medium text-[#000000]">{order.customer}</span>
              </div>
              <span className="text-sm font-bold text-[#000000]">
                ${(order.total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9]/30 flex items-center justify-between">
        <span className="text-xs text-[#737373]">Showing {orders.length} of 156 orders</span>
        <button className="text-xs font-medium text-[#c6a355] hover:text-[#3d2b1f]">
          Export CSV
        </button>
      </div>
    </motion.div>
  );
}

// Low Stock Alert
interface StockItem {
  id: string;
  name: string;
  variant: string;
  sku: string;
  stock: number;
  threshold: number;
}

function LowStockAlert({items}: {items: StockItem[]}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.2}}
      className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#000000]">Low Stock Alert</h2>
            <p className="text-xs text-[#737373]">{items.length} items need attention</p>
          </div>
        </div>
        <Link
          to="/admin/products"
          className="text-sm font-medium text-[#c6a355] hover:text-[#3d2b1f]"
        >
          Manage
        </Link>
      </div>

      <div className="divide-y divide-[#f2f2f2]">
        {items.map(item => {
          const isCritical = item.stock <= 5;
          const percentage = Math.min((item.stock / item.threshold) * 100, 100);

          return (
            <div key={item.id} className="px-5 py-3 hover:bg-[#f9f9f9]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f9f9f9] rounded-lg flex items-center justify-center border border-[#e5e5e5]">
                    <Coffee className="h-5 w-5 text-[#c6a355]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#000000]">{item.name}</p>
                    <p className="text-xs text-[#737373]">
                      {item.variant} · <span className="font-mono">{item.sku}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}
                  >
                    {item.stock} left
                  </p>
                  <p className="text-xs text-[#737373]">Min: {item.threshold}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#f2f2f2] rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{width: `${percentage}%`}}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}
                >
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Activity Feed
function ActivityFeed({activities}: {activities: Activity[]}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return {icon: ShoppingBag, bg: 'bg-green-50', color: 'text-green-600'};
      case 'customer':
        return {icon: Users, bg: 'bg-blue-50', color: 'text-blue-600'};
      case 'review':
        return {icon: Star, bg: 'bg-yellow-50', color: 'text-yellow-600'};
      case 'product':
        return {icon: Package, bg: 'bg-purple-50', color: 'text-purple-600'};
      case 'campaign':
        return {icon: Megaphone, bg: 'bg-pink-50', color: 'text-pink-600'};
      default:
        return {icon: ShoppingBag, bg: 'bg-gray-50', color: 'text-gray-600'};
    }
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.25}}
      className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#e5e5e5]">
        <h2 className="text-base font-semibold text-[#000000]">Recent Activity</h2>
        <p className="text-sm text-[#737373]">Latest store updates</p>
      </div>
      <div className="px-5 divide-y divide-[#f2f2f2]">
        {activities.map(activity => {
          const {icon: Icon, bg, color} = getIcon(activity.type);
          return (
            <div
              key={activity.id}
              className="flex gap-3 py-3 hover:bg-[#f9f9f9] -mx-2 px-2 rounded-lg transition-colors"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#000000]">{activity.title}</p>
                <p className="text-xs text-[#737373]">{activity.description}</p>
              </div>
              <span className="text-xs text-[#737373] flex-shrink-0">{activity.time}</span>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9]/30">
        <button className="w-full text-center text-sm font-medium text-[#c6a355] hover:text-[#3d2b1f]">
          View all activity
        </button>
      </div>
    </motion.div>
  );
}

// Sales Chart
function SalesChart() {
  const data = [
    {day: 'Mon', value: 4200},
    {day: 'Tue', value: 3800},
    {day: 'Wed', value: 5400},
    {day: 'Thu', value: 4600},
    {day: 'Fri', value: 6200},
    {day: 'Sat', value: 7800},
    {day: 'Sun', value: 6500},
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.2}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Sales Overview</h2>
          <p className="text-sm text-[#737373]">Daily sales performance</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <TrendingUp className="h-3 w-3" />
          +12.5%
        </span>
      </div>

      <div className="flex items-end gap-2 h-[120px]">
        {data.map(item => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center h-[100px]">
                <div
                  className="w-full max-w-[32px] bg-gradient-to-t from-[#c6a355] to-[#d4b97a] rounded-t transition-all group-hover:from-[#b8944a] cursor-pointer"
                  style={{height: `${height}%`}}
                />
              </div>
              <span className="text-xs text-[#737373] font-medium">{item.day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Quick Actions
function QuickActions() {
  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.15}}
      className="bg-gradient-to-br from-[#3d2b1f] to-[#5a4233] rounded-xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#c6a355] uppercase tracking-wider">
            Quick Actions
          </span>
          <p className="text-white/70 text-sm mt-0.5">Manage your store efficiently</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#3d2b1f] rounded-lg font-semibold text-sm hover:bg-[#f9f9f9] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-colors border border-white/20"
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ProductShortcuts() {
  const [products, setProducts] = useState(() => getAdminProducts().slice(0, 4));

  useEffect(() => {
    const refresh = () => setProducts(getAdminProducts().slice(0, 4));
    const handleStorage = () => refresh();

    refresh();
    window.addEventListener('admin-products-updated', handleStorage);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('admin-products-updated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.18}}
      className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Product Management</h2>
          <p className="text-sm text-[#737373]">Create or edit products from the dashboard</p>
        </div>
        <Link
          to="/admin/products"
          className="text-sm font-medium text-[#c6a355] hover:text-[#3d2b1f]"
        >
          View all
        </Link>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create product
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#f9f9f9] text-[#000000] rounded-lg font-medium text-sm hover:bg-[#f2f2f2] transition-colors border border-[#e3e3e3]"
          >
            <Package className="h-4 w-4" />
            Manage products
          </Link>
        </div>

        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e5e5] px-4 py-3 hover:bg-[#f9f9f9] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#000000] truncate">{product.name}</p>
                <p className="text-xs text-[#737373]">{product.sku}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-[#737373]">{product.status}</span>
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-md border border-[#e3e3e3] px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#000000] hover:bg-white transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Main Dashboard
export function Dashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  const metrics = [
    {
      title: 'Total Sales',
      value: '$24,580',
      change: 12.5,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: '156',
      change: 8.2,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: ShoppingBag,
    },
    {
      title: 'Avg. Order',
      value: '$157.56',
      change: 3.1,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: BarChart3,
    },
    {
      title: 'Conversion',
      value: '3.24%',
      change: -0.8,
      changeLabel: 'vs last week',
      trend: 'down' as const,
      icon: MousePointer,
    },
  ];

  const orders: Order[] = [
    {
      id: 'DOH-1234',
      customer: 'Ahmed Al-Rashid',
      email: 'ahmed@email.com',
      total: 5400,
      status: 'paid',
      date: 'Today, 2:34 PM',
      items: 3,
    },
    {
      id: 'DOH-1233',
      customer: 'Fatima Hassan',
      email: 'fatima@email.com',
      total: 3200,
      status: 'processing',
      date: 'Today, 11:20 AM',
      items: 2,
    },
    {
      id: 'DOH-1232',
      customer: 'Mohammed Khalil',
      email: 'mohammed@email.com',
      total: 8900,
      status: 'shipped',
      date: 'Yesterday',
      items: 5,
    },
    {
      id: 'DOH-1231',
      customer: 'Sarah Al-Mansouri',
      email: 'sarah@email.com',
      total: 4500,
      status: 'delivered',
      date: 'Yesterday',
      items: 3,
    },
    {
      id: 'DOH-1230',
      customer: 'Omar Fayed',
      email: 'omar@email.com',
      total: 2100,
      status: 'pending',
      date: 'Jan 14, 2024',
      items: 1,
    },
  ];

  const stockItems: StockItem[] = [
    {
      id: '1',
      name: 'Ethiopian Yirgacheffe',
      variant: '250g · Whole Bean',
      sku: 'EY-250-WB',
      stock: 12,
      threshold: 20,
    },
    {
      id: '2',
      name: 'Colombian Supremo',
      variant: '500g · Espresso',
      sku: 'CS-500-ES',
      stock: 5,
      threshold: 15,
    },
    {
      id: '3',
      name: 'Sumatra Mandheling',
      variant: '1kg · French Press',
      sku: 'SM-1K-FP',
      stock: 3,
      threshold: 10,
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'order',
      title: 'New order received',
      description: 'Order #DOH-1234 for $54.00',
      time: '2m ago',
    },
    {
      id: '2',
      type: 'customer',
      title: 'New customer',
      description: 'Ahmed Al-Rashid joined',
      time: '15m ago',
    },
    {
      id: '3',
      type: 'product',
      title: 'Product updated',
      description: 'Ethiopian Yirgacheffe stock',
      time: '1h ago',
    },
    {
      id: '4',
      type: 'review',
      title: 'New 5-star review',
      description: 'On Colombian Supremo',
      time: '3h ago',
    },
    {
      id: '5',
      type: 'campaign',
      title: 'Campaign launched',
      description: 'Summer promotion started',
      time: '5h ago',
    },
  ];

  const dateRanges = [
    {value: 'today', label: 'Today'},
    {value: '7d', label: '7 days'},
    {value: '30d', label: '30 days'},
  ];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Dashboard</h1>
          <p className="text-sm text-[#737373] mt-0.5">
            Welcome back! Here is your store overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-[#e3e3e3] p-0.5">
            {dateRanges.map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                  dateRange === range.value
                    ? 'bg-[#000000] text-white'
                    : 'text-[#737373] hover:text-[#000000]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 text-[#737373] hover:text-[#000000] hover:bg-white border border-[#e3e3e3] rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
          </button>

          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-white">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} loading={loading} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          <OrdersSection orders={orders} />
          <QuickActions />
          <ProductShortcuts />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SalesChart />
          <LowStockAlert items={stockItems} />
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut', delay: 0.3}}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#737373]">Active Customers</p>
              <p className="text-2xl font-bold text-[#000000] mt-1">892</p>
              <p className="text-xs text-green-600 mt-1">+23 this week</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#737373]">Products in Stock</p>
              <p className="text-2xl font-bold text-[#000000] mt-1">47</p>
              <p className="text-xs text-orange-600 mt-1">3 low stock</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#737373]">Online Visitors</p>
              <p className="text-2xl font-bold text-[#000000] mt-1">24</p>
              <p className="text-xs text-[#737373] mt-1">Currently active</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <div className="relative">
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
