import {Clock} from 'lucide-react';

type Frequency = 'weekly' | 'biweekly' | 'monthly';

interface FrequencySelectorProps {
  selectedFrequency: Frequency;
  onSelectFrequency: (frequency: Frequency) => void;
  showDiscount?: boolean;
  compact?: boolean;
}

const frequencyOptions: Array<{
  value: Frequency;
  label: string;
  shortLabel: string;
  discount: number;
}> = [
  {value: 'weekly', label: 'Weekly', shortLabel: '1 week', discount: 15},
  {value: 'biweekly', label: 'Every 2 Weeks', shortLabel: '2 weeks', discount: 12},
  {value: 'monthly', label: 'Monthly', shortLabel: '4 weeks', discount: 10},
];

export function FrequencySelector({
  selectedFrequency,
  onSelectFrequency,
  showDiscount = true,
  compact = false,
}: FrequencySelectorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <select
          value={selectedFrequency}
          onChange={e => onSelectFrequency(e.target.value as Frequency)}
          className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
        >
          {frequencyOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
              {showDiscount && ` (${option.discount}% off)`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-700">
        <Clock className="h-5 w-5" />
        <span className="font-medium">Delivery Frequency</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {frequencyOptions.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectFrequency(option.value)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedFrequency === option.value
                ? 'border-coffee-600 bg-coffee-50 ring-1 ring-coffee-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <p className="font-medium text-gray-900">{option.label}</p>
            <p className="mt-1 text-sm text-gray-500">Every {option.shortLabel}</p>
            {showDiscount && (
              <p className="mt-2 text-sm font-medium text-green-600">{option.discount}% discount</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
