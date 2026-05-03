import {Sparkles, Info} from 'lucide-react';
import {useState} from 'react';

interface RoastersChoiceProps {
  onSelect: (preferences: {
    roastPreference: 'light' | 'medium' | 'dark' | 'mixed';
    quantity: '250g' | '500g' | '1kg';
    notes?: string;
  }) => void;
  price: number;
}

const roastOptions = [
  {value: 'light', label: 'Light Roast', description: 'Bright, fruity, acidic'},
  {value: 'medium', label: 'Medium Roast', description: 'Balanced, smooth'},
  {value: 'dark', label: 'Dark Roast', description: 'Bold, rich, full-bodied'},
  {value: 'mixed', label: "Roaster's Mix", description: 'Variety of roasts'},
];

const quantityOptions = [
  {value: '250g', label: '250g', description: '~8-10 cups'},
  {value: '500g', label: '500g', description: '~16-20 cups'},
  {value: '1kg', label: '1kg', description: '~32-40 cups'},
];

export function RoastersChoice({onSelect, price}: RoastersChoiceProps) {
  const [selectedRoast, setSelectedRoast] = useState<'light' | 'medium' | 'dark' | 'mixed'>(
    'medium'
  );
  const [selectedQuantity, setSelectedQuantity] = useState<'250g' | '500g' | '1kg'>('500g');
  const [notes, setNotes] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 2,
  }).format(price / 100);

  const handleSubmit = () => {
    onSelect({
      roastPreference: selectedRoast,
      quantity: selectedQuantity,
      ...(notes.trim() ? {notes: notes.trim()} : {}),
    });
  };

  return (
    <div className="bg-gradient-to-br from-coffee-50 to-amber-50 rounded-xl p-6 border border-coffee-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-coffee-600 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Roaster's Choice</h3>
          <p className="text-sm text-gray-600">Let our experts curate your coffee</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">
          Our roasters select the freshest, highest-quality beans each week. You'll receive a
          rotating selection of our finest single-origin coffees based on your preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roast Preference</label>
          <div className="grid grid-cols-2 gap-2">
            {roastOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRoast(option.value as typeof selectedRoast)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedRoast === option.value
                    ? 'border-coffee-600 bg-coffee-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
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
                onClick={() => setSelectedQuantity(option.value as typeof selectedQuantity)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedQuantity === option.value
                    ? 'border-coffee-600 bg-coffee-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Preferences & Notes (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          {showInfo && (
            <p className="text-xs text-gray-500 mb-2">
              Tell us about flavors you enjoy (e.g., "fruity coffees", "chocolatey notes") or
              coffees you'd like to avoid.
            </p>
          )}
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g., I prefer fruit-forward coffees, no dark roasts please"
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-coffee-200">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formattedPrice}</p>
            <p className="text-sm text-gray-500">per delivery</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}
