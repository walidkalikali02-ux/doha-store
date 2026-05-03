import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft, Package, RefreshCw, Settings, CreditCard} from 'lucide-react';
import {SkipDeliveryButton} from '@/components/subscription/SkipDeliveryButton';
import {PauseSubscription} from '@/components/subscription/PauseSubscription';
import {SubscriptionPreferences} from '@/components/subscription/SubscriptionPreferences';

interface SubscriptionDetail {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextDeliveryDate: string;
  price: number;
  quantity: number;
  grind?: 'whole_bean' | 'espresso' | 'filter' | 'french_press';
  createdAt: string;
  deliveriesCount: number;
  paymentMethod?: {
    brand: string;
    last4: string;
  };
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
}

export function SubscriptionDetail() {
  // TODO: Fetch subscription using subscriptionId from useParams
  const [subscription] = useState<SubscriptionDetail | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const handleSkip = async (id: string) => {
    console.log('Skipping delivery for:', id);
  };

  const handlePause = async (id: string) => {
    console.log('Pausing subscription:', id);
  };

  const handleResume = async (id: string) => {
    console.log('Resuming subscription:', id);
  };

  const handleUpdatePreferences = (preferences: {
    grind?: 'whole_bean' | 'espresso' | 'filter' | 'french_press';
    frequency: 'weekly' | 'biweekly' | 'monthly';
    quantity: number;
  }) => {
    console.log('Updating preferences:', preferences);
    setShowPreferences(false);
  };

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Subscription not found</h2>
        <p className="mt-2 text-gray-500">
          This subscription doesn't exist or you don't have access to it.
        </p>
        <Link
          to="/account/subscriptions"
          className="mt-4 inline-flex items-center text-coffee-600 hover:text-coffee-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          to="/account/subscriptions"
          className="inline-flex items-center text-sm text-coffee-600 hover:text-coffee-500 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to subscriptions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subscription.productName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Subscription since {formatDate(subscription.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'paused'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coffee-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-coffee-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Delivery</p>
              <p className="font-medium text-gray-900">
                {formatDate(subscription.nextDeliveryDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coffee-100 rounded-lg">
              <Package className="h-5 w-5 text-coffee-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="font-medium text-gray-900">{subscription.deliveriesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coffee-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-coffee-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Per Delivery</p>
              <p className="font-medium text-gray-900">{formatCurrency(subscription.price)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Subscription Details</h2>
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="flex items-center gap-2 text-sm text-coffee-600 hover:text-coffee-500"
          >
            <Settings className="h-4 w-4" />
            Edit
          </button>
        </div>

        {showPreferences ? (
          <SubscriptionPreferences
            productId={subscription.productId}
            onUpdate={handleUpdatePreferences}
            initialPreferences={{
              frequency: subscription.frequency,
              quantity: subscription.quantity,
              ...(subscription.grind ? {grind: subscription.grind} : {}),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="font-medium text-gray-900 capitalize">{subscription.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium text-gray-900">{subscription.quantity}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Grind</p>
              <p className="font-medium text-gray-900 capitalize">
                {subscription.grind?.replace('_', ' ') ?? 'Whole Bean'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment</p>
              <p className="font-medium text-gray-900">
                {subscription.paymentMethod
                  ? `${subscription.paymentMethod.brand} •••• ${subscription.paymentMethod.last4}`
                  : 'Not set'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
        <p className="text-gray-700">
          {subscription.shippingAddress.firstName} {subscription.shippingAddress.lastName}
          <br />
          {subscription.shippingAddress.address1}
          {subscription.shippingAddress.address2 && (
            <>
              <br />
              {subscription.shippingAddress.address2}
            </>
          )}
          <br />
          {subscription.shippingAddress.city}, {subscription.shippingAddress.state}{' '}
          {subscription.shippingAddress.postalCode}
          <br />
          {subscription.shippingAddress.country}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Subscription</h2>
        <div className="space-y-4">
          <PauseSubscription
            subscriptionId={subscription.id}
            status={subscription.status}
            onPause={handlePause}
            onResume={handleResume}
            nextDeliveryDate={subscription.nextDeliveryDate}
          />

          {subscription.status === 'active' && (
            <SkipDeliveryButton
              subscriptionId={subscription.id}
              nextDeliveryDate={subscription.nextDeliveryDate}
              onSkip={handleSkip}
            />
          )}
        </div>
      </div>
    </div>
  );
}
