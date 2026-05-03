import {useState} from 'react';
import {Link} from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronRight,
  RotateCcw,
  Download,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  placedAt: string;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-7829',
    status: 'shipped',
    total: 54.0,
    itemCount: 2,
    placedAt: '2024-01-15',
    estimatedDelivery: '2024-01-18',
    items: [
      {name: 'Ethiopian Yirgacheffe', quantity: 1, price: 28.0, image: '/coffee1.jpg'},
      {name: 'Colombian Supremo', quantity: 1, price: 26.0, image: '/coffee2.jpg'},
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-7825',
    status: 'delivered',
    total: 32.5,
    itemCount: 2,
    placedAt: '2024-01-10',
    estimatedDelivery: '2024-01-13',
    items: [
      {name: 'Kenya AA', quantity: 1, price: 18.5, image: '/coffee3.jpg'},
      {name: 'House Blend', quantity: 1, price: 14.0, image: '/coffee4.jpg'},
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-7812',
    status: 'processing',
    total: 67.0,
    itemCount: 3,
    placedAt: '2024-01-08',
    estimatedDelivery: '2024-01-15',
    items: [
      {name: 'Costa Rica Tarrazu', quantity: 2, price: 24.0, image: '/coffee5.jpg'},
      {name: 'Guatemala Antigua', quantity: 1, price: 19.0, image: '/coffee6.jpg'},
    ],
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Order received',
  },
  processing: {
    icon: Package,
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Preparing shipment',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'On its way',
  },
  delivered: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Arrived',
  },
  cancelled: {
    icon: Clock,
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Order cancelled',
  },
};

export function Orders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleReorder = (orderId: string) => {
    console.log('Reordering order:', orderId);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop Now
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
          </p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
          <p className="text-sm text-gray-500">Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">
            ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search orders or products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 bg-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">When you place orders, they will appear here.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
          >
            Browse Collection
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.color.split(' ')[0]}`}
                      >
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {new Date(order.placedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.itemCount} items</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Order placed</span>
                      {order.status !== 'cancelled' && <span>Est. delivery</span>}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          order.status === 'delivered'
                            ? 'bg-green-500 w-full'
                            : order.status === 'shipped'
                              ? 'bg-purple-500 w-3/4'
                              : order.status === 'processing'
                                ? 'bg-blue-500 w-1/2'
                                : order.status === 'cancelled'
                                  ? 'bg-red-500 w-full'
                                  : 'bg-yellow-500 w-1/4'
                        }`}
                      />
                    </div>
                    {order.estimatedDelivery && order.status !== 'delivered' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Estimated delivery:{' '}
                        <span className="font-medium">
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-sm font-medium text-coffee-600 hover:text-coffee-700 flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide details' : 'View details'}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleReorder(order.id)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reorder
                      </button>
                    )}
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 ml-auto">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50/50 p-4 sm:p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
