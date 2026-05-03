import {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowLeft, Package, Truck, CheckCircle, Clock, Coffee} from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  placedAt: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantId: string;
    variantDescription: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image: string;
  }>;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    description?: string;
  }>;
}

const statusSteps = [
  {key: 'pending', label: 'Pending', icon: Clock},
  {key: 'processing', label: 'Processing', icon: Package},
  {key: 'roasting', label: 'Roasting', icon: Coffee},
  {key: 'shipped', label: 'Shipped', icon: Truck},
  {key: 'delivered', label: 'Delivered', icon: CheckCircle},
];

export function OrderDetail() {
  const {orderId} = useParams<{orderId: string}>();
  const [order] = useState<OrderDetail | null>(null);
  const [isLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch order from API using orderId
  }, [orderId]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const currentStepIndex = order ? statusSteps.findIndex(s => s.key === order.status) : -1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Order not found</h2>
        <p className="mt-2 text-gray-500">
          This order doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/account/orders"
          className="mt-4 inline-flex items-center text-coffee-600 hover:text-coffee-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center text-sm text-coffee-600 hover:text-coffee-500 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium rounded-md bg-coffee-600 text-white hover:bg-coffee-700"
        >
          Reorder
        </button>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {order.trackingNumber && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Tracking number:{' '}
              <span className="font-medium text-gray-900">{order.trackingNumber}</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h3>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 && (
              <>
                <br />
                {order.shippingAddress.address2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Billing Address */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Billing Address</h3>
          <p className="text-sm text-gray-600">
            {order.billingAddress.firstName} {order.billingAddress.lastName}
            <br />
            {order.billingAddress.address1}
            {order.billingAddress.address2 && (
              <>
                <br />
                {order.billingAddress.address2}
              </>
            )}
            <br />
            {order.billingAddress.city}, {order.billingAddress.state}{' '}
            {order.billingAddress.postalCode}
            <br />
            {order.billingAddress.country}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {order.items.map(item => (
            <div key={item.id} className="p-6 flex gap-4">
              <img
                src={item.image}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.productName}</h3>
                <p className="text-sm text-gray-500">{item.variantDescription}</p>
                <p className="mt-1 text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatCurrency(order.tax)}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
