import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAdminOrderDetail, useUpdateOrderStatus, useRefundOrder} from '../../hooks/useAdminOrders';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  User,
  Mail,
  RotateCcw,
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  mfInvoiceId: string | null;
  mfPaymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, {label: string; color: string; bgColor: string; icon: typeof Clock}> = {
  pending: {label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock},
  confirmed: {label: 'Confirmed', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle},
  processing: {label: 'Processing', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Package},
  shipped: {label: 'Shipped', color: 'text-indigo-600', bgColor: 'bg-indigo-50', icon: Package},
  delivered: {label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle},
  cancelled: {label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle},
  payment_failed: {label: 'Payment Failed', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle},
  refunded: {label: 'Refunded', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: RotateCcw},
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  payment_failed: ['pending', 'cancelled'],
  refunded: [],
};

const STATUS_HISTORY: Record<string, string[]> = {
  pending: ['Pending'],
  confirmed: ['Pending', 'Confirmed'],
  processing: ['Pending', 'Confirmed', 'Processing'],
  shipped: ['Pending', 'Confirmed', 'Processing', 'Shipped'],
  delivered: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'],
  cancelled: ['Pending', 'Cancelled'],
  payment_failed: ['Pending', 'Payment Failed'],
  refunded: ['Pending', 'Refunded'],
};

const REFUNDABLE_STATUSES = ['confirmed', 'processing'];

function StatusBadge({status}: {status: string}) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bgColor} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-QR', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0,
  }).format(price / 100);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function AdminOrderDetail() {
  const {orderId} = useParams<{orderId: string}>();
  const navigate = useNavigate();

  const {data, isLoading, error} = useAdminOrderDetail(orderId ?? null);
  const updateStatus = useUpdateOrderStatus();
  const refundOrder = useRefundOrder();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundNote, setRefundNote] = useState('');

  const order = data?.order ?? null;
  const validNextStatuses = order ? (VALID_TRANSITIONS[order.status] || []) : [];
  const statusHistory = order ? (STATUS_HISTORY[order.status] || []) : [];
  const canRefund = order && REFUNDABLE_STATUSES.includes(order.status);
  const isRefunded = order?.status === 'refunded';

  const handleStatusUpdate = () => {
    if (!order || !pendingStatus) return;
    updateStatus.mutate(
      {orderId: order.id, status: pendingStatus as OrderStatus},
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setPendingStatus(null);
          setStatusNote('');
        },
        onError: (err: Error) => {
          alert(err.message || 'Failed to update status');
        },
      }
    );
  };

  const handleRefund = () => {
    if (!order) return;
    refundOrder.mutate(order.id, {
      onSuccess: () => {
        setShowRefundDialog(false);
        setRefundNote('');
      },
      onError: (err: Error) => {
        alert(err.message || 'Failed to process refund');
      },
    });
  };

  const openConfirmDialog = (status: string) => {
    setPendingStatus(status);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
    setStatusNote('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-4 border-[#c6a355] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-[#f9f9f9] rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#737373]" />
          </button>
          <h1 className="text-xl font-bold text-[#000000]">Order Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error?.message || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-[#f9f9f9] rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#737373]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#000000]">Order #{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-[#737373] mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canRefund && (
            <button
              onClick={() => setShowRefundDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refund
            </button>
          )}
          {validNextStatuses.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#737373]">Update status:</span>
              <select
                className="px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]"
                onChange={(e) => {
                  if (e.target.value) openConfirmDialog(e.target.value);
                }}
                value=""
              >
                <option value="">Select new status...</option>
                {validNextStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status]?.label || status}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-sm text-[#737373]">No status updates available</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e5e5]">
              <h2 className="font-semibold text-[#000000]">Items</h2>
            </div>
            <ul className="divide-y divide-[#f2f2f2]">
              {order.items.map((item) => (
                <li key={item.id} className="px-6 py-4 flex gap-4">
                  <div className="w-16 h-16 bg-[#f9f9f9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-[#737373]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#000000]">Product {item.productId}</p>
                    <p className="text-sm text-[#737373]">Variant: {item.variantId}</p>
                    <p className="text-xs text-[#737373]">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#000000]">{formatPrice(item.totalPrice)}</p>
                    <p className="text-xs text-[#737373]">{formatPrice(item.unitPrice)} each</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl border border-[#e3e3e3] p-6">
            <h2 className="font-semibold text-[#000000] mb-4">Status History</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {statusHistory.map((status, index) => {
                const isLast = index === statusHistory.length - 1;
                return (
                  <div key={status} className="flex items-center">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isLast ? statusConfig[status]?.bgColor : 'bg-[#f2f2f2]'
                    } ${isLast ? statusConfig[status]?.color : 'text-[#737373]'}`}>
                      {statusConfig[status]?.label || status}
                    </div>
                    {!isLast && (
                      <ChevronRight className="h-4 w-4 text-[#737373] mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-xl border border-[#e3e3e3] p-6">
            <h2 className="font-semibold text-[#000000] mb-4">Pricing</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#737373]">Subtotal</dt>
                <dd className="font-medium text-[#000000]">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[#737373]">Discount</dt>
                  <dd className="text-green-600">-{formatPrice(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#737373]">Shipping</dt>
                <dd className="font-medium text-[#000000]">
                  {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#e5e5e5]">
                <dt className="font-bold text-[#000000]">Total</dt>
                <dd className="font-bold text-[#000000]">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-[#e3e3e3] p-6">
            <h2 className="font-semibold text-[#000000] mb-4">Customer</h2>
            <div className="space-y-3">
              {order.guestEmail ? (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#737373]" />
                    <span className="text-sm text-[#000000]">{order.guestEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[#737373]" />
                    <span className="text-sm text-[#737373]">Guest Order</span>
                  </div>
                </>
              ) : order.customerId ? (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-[#737373]" />
                  <span className="text-sm text-[#000000]">Customer ID: {order.customerId}</span>
                </div>
              ) : (
                <p className="text-sm text-[#737373]">No customer information</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-[#e3e3e3] p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[#c6a355]" />
              <h2 className="font-semibold text-[#000000]">Shipping Address</h2>
            </div>
            <address className="text-sm text-[#737373] not-italic space-y-1">
              <p className="font-medium text-[#000000]">{order.shippingAddress?.line1 || '—'}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress?.postalCode && ` ${order.shippingAddress.postalCode}`}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </address>
          </div>

          {/* MyFatoorah Info */}
          {order.mfInvoiceId && (
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-[#c6a355]" />
                <h2 className="font-semibold text-[#000000]">MyFatoorah</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Invoice ID</p>
                  <p className="font-mono text-sm text-[#000000]">{order.mfInvoiceId}</p>
                </div>
                {order.mfPaymentUrl && (
                  <a
                    href={order.mfPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#c6a355] hover:underline"
                  >
                    View in MyFatoorah
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Confirm Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={closeConfirmDialog}
          >
            <motion.div
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#000000] mb-2">Confirm Status Change</h3>
              <p className="text-sm text-[#737373] mb-4">
                Change order status from{' '}
                <strong>{statusConfig[order.status]?.label}</strong> to{' '}
                <strong>{statusConfig[pendingStatus || '']?.label}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#737373] mb-1">
                  Note (optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355] resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmDialog}
                  className="flex-1 px-4 py-2 border border-[#e3e3e3] rounded-lg text-sm font-medium text-[#737373] hover:bg-[#f9f9f9] transition-colors"
                  disabled={updateStatus.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2 bg-[#c6a355] text-white rounded-lg text-sm font-medium hover:bg-[#b08f3d] transition-colors disabled:opacity-50"
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Confirm Dialog */}
      <AnimatePresence>
        {showRefundDialog && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowRefundDialog(false)}
          >
            <motion.div
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#000000] mb-2">Process Refund</h3>
              <p className="text-sm text-[#737373] mb-4">
                This will refund <strong>{formatPrice(order.total)}</strong> for order{' '}
                <strong>#{order.orderNumber}</strong> via MyFatoorah.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#737373] mb-1">
                  Refund note (optional)
                </label>
                <textarea
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  placeholder="Reason for refund..."
                  className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355] resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRefundDialog(false)}
                  className="flex-1 px-4 py-2 border border-[#e3e3e3] rounded-lg text-sm font-medium text-[#737373] hover:bg-[#f9f9f9] transition-colors"
                  disabled={refundOrder.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={refundOrder.isPending}
                >
                  {refundOrder.isPending ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminOrderDetail;