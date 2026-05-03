import {ShoppingBag} from 'lucide-react';
import {Link} from 'react-router-dom';

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    itemCount: number;
    placedAt: string;
    estimatedDelivery?: string;
  };
  onReorder?: (orderId: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  roasting: 'bg-orange-100 text-orange-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  roasting: 'Roasting',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function OrderCard({order, onReorder}: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            to={`/account/orders/${order.id}`}
            className="text-lg font-medium text-gray-900 hover:text-coffee-600"
          >
            Order #{order.orderNumber}
          </Link>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.placedAt)}</p>
          <p className="mt-1 text-sm text-gray-600">
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} •{' '}
            {formatCurrency(order.total)}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[order.status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
          {order.estimatedDelivery &&
            order.status !== 'delivered' &&
            order.status !== 'cancelled' && (
              <p className="mt-1 text-sm text-gray-500">
                Est. delivery: {formatDate(order.estimatedDelivery)}
              </p>
            )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          to={`/account/orders/${order.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View details
        </Link>
        {onReorder && (
          <button
            type="button"
            onClick={() => onReorder(order.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-coffee-600 hover:bg-coffee-700"
          >
            <ShoppingBag className="h-4 w-4" />
            Reorder
          </button>
        )}
      </div>
    </div>
  );
}
