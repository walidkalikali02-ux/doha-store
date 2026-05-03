import {AlertTriangle, Package} from 'lucide-react';

interface LowStockItem {
  id: string;
  productName: string;
  variant: string;
  sku: string;
  quantity: number;
  threshold: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  onReorder?: (itemId: string) => void;
}

export function LowStockAlert({items, onReorder}: LowStockAlertProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-medium text-red-900">Low Stock Alert</h3>
          <span className="ml-auto bg-red-600 text-white text-sm font-medium px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.variant} • SKU: {item.sku}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">{item.quantity} left</p>
                <p className="text-xs text-gray-500">Threshold: {item.threshold}</p>
              </div>
              {onReorder && (
                <button
                  type="button"
                  onClick={() => onReorder(item.id)}
                  className="px-3 py-1.5 text-sm font-medium text-coffee-600 hover:text-coffee-700 border border-coffee-600 rounded-md hover:bg-coffee-50"
                >
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
