import {useState} from 'react';
import {Link} from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Calendar,
  Truck,
  Percent,
  Star,
  ChevronRight,
  Coffee,
} from 'lucide-react';

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextDeliveryDate: string;
  price: number;
  quantity: number;
  grind: string;
  roastLevel: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: RefreshCw,
    description: 'Deliveries ongoing',
  },
  paused: {
    label: 'Paused',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Pause,
    description: 'Temporarily paused',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Trash2,
    description: 'Subscription ended',
  },
};

const frequencyConfig = {
  weekly: {label: 'Every week', deliveries: 4, savings: '15%'},
  biweekly: {label: 'Every 2 weeks', deliveries: 2, savings: '10%'},
  monthly: {label: 'Every month', deliveries: 1, savings: '5%'},
};

const benefits = [
  {icon: Percent, title: 'Save up to 15%', desc: 'Automatic discounts on every delivery'},
  {icon: Truck, title: 'Free Shipping', desc: 'Always free on subscription orders'},
  {icon: Calendar, title: 'Flexible Schedule', desc: 'Skip, pause, or cancel anytime'},
  {icon: Star, title: 'Early Access', desc: 'Try new roasts before anyone else'},
];

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Ethiopian Yirgacheffe',
      productImage: '/coffee1.jpg',
      status: 'active',
      frequency: 'biweekly',
      nextDeliveryDate: '2024-01-28',
      price: 2520,
      quantity: 250,
      grind: 'Whole Bean',
      roastLevel: 'Medium',
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Colombian Supremo',
      productImage: '/coffee2.jpg',
      status: 'paused',
      frequency: 'monthly',
      nextDeliveryDate: '2024-02-15',
      price: 2340,
      quantity: 500,
      grind: 'Espresso',
      roastLevel: 'Dark',
    },
  ]);
  const [filter, setFilter] = useState('all');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handlePause = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? {...sub, status: sub.status === 'paused' ? 'active' : 'paused'} : sub
      )
    );
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      setSubscriptions(prev =>
        prev.map(sub => (sub.id === id ? {...sub, status: 'cancelled'} : sub))
      );
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const monthlySavings = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.price * 0.15, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-gray-500">Manage your coffee deliveries</p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
          <p className="text-sm text-gray-500">Total Subscriptions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-coffee-600">{formatCurrency(monthlySavings)}</p>
          <p className="text-sm text-gray-500">Monthly Savings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-amber-600">
            {subscriptions.filter(s => s.status === 'paused').length}
          </p>
          <p className="text-sm text-gray-500">Paused</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'active', 'paused', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-coffee-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-coffee-700 text-white text-xs rounded-full">
                {subscriptions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-8 w-8 text-coffee-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Never run out of coffee again. Subscribe to your favorite roasts and enjoy automatic
            deliveries with discounts.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
          >
            Browse Coffee
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map(sub => {
            const status = statusConfig[sub.status];
            const StatusIcon = status.icon;
            const freq = frequencyConfig[sub.frequency];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-10 w-10 text-gray-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{sub.productName}</h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {sub.roastLevel} Roast • {sub.grind} • {sub.quantity}g
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(sub.price)}
                          </p>
                          <p className="text-sm text-gray-500">per delivery</p>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <RefreshCw className="h-4 w-4 text-coffee-600" />
                          <span>{freq.label}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Save {freq.savings}
                          </span>
                        </div>
                        {sub.status === 'active' && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-coffee-600" />
                            <span>Next: {formatDate(sub.nextDeliveryDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar for Active */}
                      {sub.status === 'active' && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Last delivery</span>
                            <span>Next delivery</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-coffee-500 rounded-full w-2/3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/account/subscriptions/${sub.id}`}
                      className="text-sm font-medium text-coffee-600 hover:text-coffee-700 flex items-center gap-1"
                    >
                      Manage Subscription
                      <ChevronRight className="h-4 w-4" />
                    </Link>

                    {sub.status === 'active' && (
                      <button
                        onClick={() => handlePause(sub.id)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </button>
                    )}

                    {sub.status === 'paused' && (
                      <button
                        onClick={() => handlePause(sub.id)}
                        className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </button>
                    )}

                    {sub.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(sub.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-8 bg-gradient-to-br from-coffee-50 to-amber-50 rounded-xl p-6 border border-coffee-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-coffee-600" />
          Why Subscribe?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map(benefit => (
            <div key={benefit.title} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <benefit.icon className="h-5 w-5 text-coffee-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{benefit.title}</p>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
