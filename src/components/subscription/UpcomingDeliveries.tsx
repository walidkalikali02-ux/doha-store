import {Package, Truck, Calendar} from 'lucide-react';

interface UpcomingDelivery {
  id: string;
  date: string;
  status: 'scheduled' | 'processing' | 'shipped';
  items: Array<{
    productName: string;
    variant: string;
    quantity: number;
    image: string;
  }>;
  trackingNumber?: string;
}

interface UpcomingDeliveriesProps {
  deliveries: UpcomingDelivery[];
  subscriptionId?: string;
}

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  processing: 'Processing',
  shipped: 'Shipped',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-green-100 text-green-800',
};

export function UpcomingDeliveries({deliveries}: UpcomingDeliveriesProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (deliveries.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No upcoming deliveries scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Upcoming Deliveries</h3>
      <div className="space-y-4">
        {deliveries.map(delivery => (
          <div key={delivery.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(delivery.date)}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[delivery.status]
                    }`}
                  >
                    {statusLabels[delivery.status]}
                  </span>
                </div>
              </div>
              {delivery.trackingNumber && (
                <a
                  href={`https://tracking.example.com/${delivery.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-coffee-600 hover:text-coffee-500"
                >
                  <Truck className="h-4 w-4" />
                  Track Package
                </a>
              )}
            </div>

            <div className="space-y-2">
              {delivery.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">{item.variant}</p>
                  </div>
                  <p className="text-sm text-gray-600">× {item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
