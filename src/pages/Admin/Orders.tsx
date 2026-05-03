import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  ArrowUpDown,
  Calendar,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {useAdminOrders} from '../../hooks/useAdminOrders';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed';
  total: number;
  mfInvoiceId: string | null;
  createdAt: string;
}

const statusConfig = {
  pending: {label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200'},
  confirmed: {label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200'},
  processing: {label: 'Processing', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
  shipped: {label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200'},
  delivered: {label: 'Delivered', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200'},
  cancelled: {label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200'},
  payment_failed: {
    label: 'Payment Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

function StatusBadge({status}: {status: Order['status']}) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-QA', {
    style: 'currency',
    currency: 'QAR',
    maximumFractionDigits: 0,
  }).format(price / 100);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function AdminOrders() {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'total'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const {data, isLoading} = useAdminOrders({
    search: searchQuery || undefined,
    status: statusFilter,
    sortBy,
    sortDir: sortOrder,
    page,
    limit,
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSort = (column: 'createdAt' | 'total') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(column);
    setSortOrder('desc');
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleAllOrders = () => {
    setSelectedOrders(prev => (prev.length === orders.length ? [] : orders.map(o => o.id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Orders</h1>
          <p className="mt-0.5 text-sm text-[#737373]">Manage and track customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm font-medium text-[#737373] transition-colors hover:bg-white hover:text-[#000000]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/admin/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
          >
            <Plus className="h-4 w-4" />
            Create order
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <input
              type="search"
              placeholder="Search orders by ID, customer, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] px-4 py-2.5 pr-10 text-sm transition-all focus:border-[#c6a355] focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-sm focus:border-[#c6a355] focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="payment_failed">Payment Failed</option>
            </select>

            <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm font-medium text-[#737373] transition-colors hover:bg-[#f9f9f9] hover:text-[#000000]">
              <Filter className="h-4 w-4" />
              More filters
            </button>

            <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-sm font-medium text-[#737373] transition-colors hover:bg-[#f9f9f9] hover:text-[#000000]">
              <Calendar className="h-4 w-4" />
              Date range
            </button>
          </div>
        </div>

        {statusFilter !== 'all' && (
          <div className="mt-3 flex items-center gap-2 border-t border-[#f2f2f2] pt-3">
            <span className="text-xs text-[#737373]">Active filters:</span>
            <span className="inline-flex items-center gap-1 rounded bg-[#f9f9f9] px-2 py-1 text-xs font-medium">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="hover:text-red-600" type="button">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white"
      >
        {selectedOrders.length > 0 && (
          <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#f9f9f9] px-5 py-3">
            <span className="text-sm font-medium text-[#000000]">{selectedOrders.length} selected</span>
            <div className="flex items-center gap-2">
              <button className="rounded border border-[#e3e3e3] px-3 py-1.5 text-sm font-medium text-[#737373] transition-colors hover:bg-white hover:text-[#000000]">
                Print packing slips
              </button>
              <button className="rounded border border-[#e3e3e3] px-3 py-1.5 text-sm font-medium text-[#737373] transition-colors hover:bg-white hover:text-[#000000]">
                Fulfill orders
              </button>
              <button className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
                Archive
              </button>
            </div>
          </div>
        )}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f9f9f9]/50">
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={toggleAllOrders}
                    className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-[#000000]">
                    Order
                    <ArrowUpDown className={`h-3 w-3 ${sortBy === 'createdAt' ? 'text-[#c6a355]' : ''}`} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-[#737373]">
                  <button onClick={() => handleSort('total')} className="ml-auto flex items-center gap-1 hover:text-[#000000]">
                    Total
                    <ArrowUpDown className={`h-3 w-3 ${sortBy === 'total' ? 'text-[#c6a355]' : ''}`} />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">MF Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#737373]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#737373]">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="group transition-colors hover:bg-[#f9f9f9]">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-sm font-semibold text-[#3d2b1f] transition-colors hover:text-[#c6a355]"
                      >
                        #{order.orderNumber}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c6a355] to-[#3d2b1f] text-xs font-semibold text-white">
                          {order.guestEmail ? order.guestEmail.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-sm font-medium text-[#000000]">{order.guestEmail || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-bold text-[#000000]">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm text-[#737373]">{order.mfInvoiceId || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-[#737373]">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1 text-[#737373] opacity-0 transition-opacity hover:text-[#000000] group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[#f2f2f2] md:hidden">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[#737373]">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#737373]">No orders found</div>
          ) : (
            orders.map(order => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="w-full p-4 text-left transition-colors hover:bg-[#f9f9f9]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#3d2b1f]">#{order.orderNumber}</div>
                    <div className="text-xs text-[#737373]">{formatDate(order.createdAt)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#000000]">{order.guestEmail || '—'}</span>
                  <span className="text-sm font-bold text-[#000000]">{formatPrice(order.total)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {!isLoading && visibleOrders.length === 0 && (
          <div className="border-t border-[#f2f2f2] px-5 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f9f9f9]">
              <Search className="h-8 w-8 text-[#737373]" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-[#000000]">No orders found</h3>
            <p className="text-sm text-[#737373]">Try adjusting your search or filters</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-[#f9f9f9]/30 px-5 py-3">
          <span className="text-xs text-[#737373]">
            Showing {orders.length} of {total} orders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-[#e3e3e3] px-3 py-1.5 text-xs font-medium text-[#737373] transition-colors hover:bg-white hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-[#737373]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="rounded border border-[#e3e3e3] bg-white px-3 py-1.5 text-xs font-medium text-[#000000] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
