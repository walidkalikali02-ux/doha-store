import {useState} from 'react';
import {FileText, Printer, Download} from 'lucide-react';

interface BulkActionsProps {
  selectedIds: string[];
  onStatusUpdate: (ids: string[], status: string) => Promise<void>;
  onPrintLabels: (ids: string[]) => Promise<void>;
  onExport: (ids: string[]) => void;
}

export function BulkActions({
  selectedIds,
  onStatusUpdate,
  onPrintLabels,
  onExport,
}: BulkActionsProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      await onStatusUpdate(selectedIds, selectedStatus);
      setIsStatusOpen(false);
      setSelectedStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintLabels = async () => {
    setIsLoading(true);
    try {
      await onPrintLabels(selectedIds);
    } catch (error) {
      console.error('Failed to print labels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg border border-gray-200 shadow-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium text-gray-900">{selectedIds.length} selected</span>

      <div className="h-6 w-px bg-gray-200" />

      <div className="relative">
        {isStatusOpen ? (
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg border border-gray-200 shadow-lg p-3 min-w-[200px]">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 mb-2"
            >
              <option value="">Select status</option>
              <option value="processing">Processing</option>
              <option value="roasting">Roasting</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(false);
                  setSelectedStatus('');
                }}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={isLoading || !selectedStatus}
                className="flex-1 px-3 py-1.5 text-sm bg-coffee-600 text-white rounded-md hover:bg-coffee-700 disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <FileText className="h-4 w-4" />
          Update Status
        </button>
      </div>

      <button
        type="button"
        onClick={handlePrintLabels}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <Printer className="h-4 w-4" />
        Print Labels
      </button>

      <button
        type="button"
        onClick={() => onExport(selectedIds)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}
