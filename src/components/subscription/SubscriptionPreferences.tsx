import {useState} from 'react';

interface SubscriptionPreferencesProps {
  productId: string;
  onUpdate: (preferences: {
    grind?: 'whole_bean' | 'espresso' | 'filter' | 'french_press';
    frequency: 'weekly' | 'biweekly' | 'monthly';
    quantity: number;
  }) => void;
  initialPreferences?: {
    grind?: 'whole_bean' | 'espresso' | 'filter' | 'french_press';
    frequency: 'weekly' | 'biweekly' | 'monthly';
    quantity: number;
  };
}

const grindOptions = [
  {value: 'whole_bean', label: 'Whole Bean', description: 'Best for freshness'},
  {value: 'espresso', label: 'Espresso', description: 'Fine grind'},
  {value: 'filter', label: 'Filter', description: 'Medium grind'},
  {value: 'french_press', label: 'French Press', description: 'Coarse grind'},
];

const quantityOptions = [
  {value: 250, label: '250g'},
  {value: 500, label: '500g'},
  {value: 1000, label: '1kg'},
];

export function SubscriptionPreferences({
  onUpdate,
  initialPreferences,
}: SubscriptionPreferencesProps) {
  const [grind, setGrind] = useState<string | undefined>(initialPreferences?.grind);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>(
    initialPreferences?.frequency ?? 'monthly'
  );
  const [quantity, setQuantity] = useState(initialPreferences?.quantity ?? 250);

  const handleUpdate = () => {
    onUpdate({
      ...(grind ? {grind: grind as 'whole_bean' | 'espresso' | 'filter' | 'french_press'} : {}),
      frequency,
      quantity,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grind Type (Optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grindOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGrind(option.value === grind ? undefined : option.value)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                grind === option.value
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
              <p className="text-xs text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
        {grind && (
          <button
            type="button"
            onClick={() => setGrind(undefined)}
            className="mt-2 text-sm text-coffee-600 hover:text-coffee-500"
          >
            Clear selection (default: whole bean)
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Frequency</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            {value: 'weekly', label: 'Weekly'},
            {value: 'biweekly', label: 'Every 2 Weeks'},
            {value: 'monthly', label: 'Monthly'},
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrequency(option.value as typeof frequency)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                frequency === option.value
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="grid grid-cols-3 gap-2">
          {quantityOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setQuantity(option.value)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                quantity === option.value
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleUpdate}
        className="w-full py-2 px-4 bg-coffee-600 text-white rounded-md font-medium hover:bg-coffee-700 transition-colors"
      >
        Update Subscription
      </button>
    </div>
  );
}
