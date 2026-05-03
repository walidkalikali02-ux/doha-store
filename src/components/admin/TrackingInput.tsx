import {useState} from 'react';
import {Truck, CheckCircle, X} from 'lucide-react';

interface TrackingInputProps {
  orderId: string;
  currentTracking?: string;
  carrier?: string;
  onAddTracking: (orderId: string, trackingNumber: string, carrier: string) => Promise<void>;
}

const carriers = [
  {value: 'usps', label: 'USPS'},
  {value: 'ups', label: 'UPS'},
  {value: 'fedex', label: 'FedEx'},
  {value: 'dhl', label: 'DHL'},
  {value: 'other', label: 'Other'},
];

export function TrackingInput({
  orderId,
  currentTracking,
  carrier: currentCarrier,
  onAddTracking,
}: TrackingInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking ?? '');
  const [selectedCarrier, setSelectedCarrier] = useState(currentCarrier ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!trackingNumber.trim() || !selectedCarrier) return;

    setIsLoading(true);
    try {
      await onAddTracking(orderId, trackingNumber.trim(), selectedCarrier);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentTracking) {
    const carrierLabel = carriers.find(c => c.value === currentCarrier)?.label ?? currentCarrier;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Truck className="h-4 w-4" />
          <span>
            {carrierLabel}: {currentTracking}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs text-coffee-600 hover:text-coffee-500"
        >
          Update
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-coffee-600 hover:text-coffee-500"
      >
        <Truck className="h-4 w-4" />
        Add tracking
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Add Tracking Number</h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
          <select
            value={selectedCarrier}
            onChange={e => setSelectedCarrier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          >
            <option value="">Select carrier</option>
            {carriers.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !trackingNumber.trim() || !selectedCarrier}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-coffee-600 rounded-md hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
