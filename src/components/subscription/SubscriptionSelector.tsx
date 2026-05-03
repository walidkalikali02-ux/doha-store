import {useState} from 'react';
import {Check} from 'lucide-react';

type Frequency = 'weekly' | 'biweekly' | 'monthly';

interface SubscriptionSelectorProps {
  productId: string;
  selectedFrequency?: Frequency;
  onSelectFrequency: (frequency: Frequency) => void;
  discountedPrice?: number;
  originalPrice: number;
}

const frequencyOptions: Array<{
  value: Frequency;
  label: string;
  discount: number;
  description: string;
}> = [
  {value: 'weekly', label: 'Weekly', discount: 15, description: 'Delivered every week'},
  {
    value: 'biweekly',
    label: 'Every 2 Weeks',
    discount: 12,
    description: 'Delivered every other week',
  },
  {value: 'monthly', label: 'Monthly', discount: 10, description: 'Delivered once a month'},
];

export function SubscriptionSelector({
  selectedFrequency,
  onSelectFrequency,
  discountedPrice,
  originalPrice,
}: SubscriptionSelectorProps) {
  const [isSubscription, setIsSubscription] = useState(!!selectedFrequency);

  const handleToggle = () => {
    if (isSubscription) {
      setIsSubscription(false);
    } else {
      setIsSubscription(true);
      if (!selectedFrequency) {
        onSelectFrequency('monthly');
      }
    }
  };

  const getPrice = (discount: number) => {
    return discountedPrice ?? Math.round(originalPrice * (1 - discount / 100));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            !isSubscription
              ? 'border-coffee-600 bg-coffee-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">One-time purchase</p>
              <p className="text-sm text-gray-500">Buy once, no commitment</p>
            </div>
            {!isSubscription && <Check className="h-5 w-5 text-coffee-600" />}
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            ${(originalPrice / 100).toFixed(2)}
          </p>
        </button>

        <button
          type="button"
          onClick={handleToggle}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            isSubscription
              ? 'border-coffee-600 bg-coffee-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Subscribe & Save</p>
              <p className="text-sm text-green-600 font-medium">Save up to 15%</p>
            </div>
            {isSubscription && <Check className="h-5 w-5 text-coffee-600" />}
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            from ${(getPrice(15) / 100).toFixed(2)}
          </p>
        </button>
      </div>

      {isSubscription && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900">Choose your frequency:</p>
          <div className="grid grid-cols-3 gap-3">
            {frequencyOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectFrequency(option.value)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  selectedFrequency === option.value
                    ? 'border-coffee-600 bg-coffee-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-green-600 font-medium">{option.discount}% off</p>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                {selectedFrequency === option.value && (
                  <Check className="h-4 w-4 text-coffee-600 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Subscription benefits:</strong> Free shipping on all orders, skip or cancel
              anytime, priority access to new roasts, and exclusive member pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
