import {useState} from 'react';

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: (orderId: string, newStatus: string, note?: string) => Promise<void>;
}

const statusOptions = [
  {value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800'},
  {value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800'},
  {value: 'roasting', label: 'Roasting', color: 'bg-orange-100 text-orange-800'},
  {value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800'},
  {value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800'},
  {value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800'},
  {value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800'},
];

export function StatusUpdater({orderId, currentStatus, onStatusChange}: StatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentStatusOption = statusOptions.find(s => s.value === currentStatus);

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(orderId, selectedStatus, note || undefined);
      setIsOpen(false);
      setNote('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          currentStatusOption?.color ?? 'bg-gray-100 text-gray-800'
        }`}
      >
        {currentStatusOption?.label ?? currentStatus}
      </button>
    );
  }

  return (
    <div className="inline-block">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 min-w-[250px]">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note about this status change..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSelectedStatus(currentStatus);
                setNote('');
              }}
              className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusChange}
              disabled={isLoading || selectedStatus === currentStatus}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-coffee-600 rounded-md hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
