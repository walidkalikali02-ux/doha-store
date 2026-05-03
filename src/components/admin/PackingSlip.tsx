import {Package} from 'lucide-react';

interface PackingSlipProps {
  order: {
    id: string;
    orderNumber: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    items: Array<{
      id: string;
      productName: string;
      variant: string;
      quantity: number;
      notes?: string;
    }>;
    notes?: string;
  };
  onClose?: () => void;
}

export function PackingSlip({order, onClose}: PackingSlipProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto print:shadow-none print:border-none">
      <div className="print:hidden flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Packing Slip</h2>
        <div className="flex gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-coffee-600 rounded-md hover:bg-coffee-700"
          >
            Print
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-coffee-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">The Roastery</h1>
              <p className="text-sm text-gray-500">Premium Specialty Coffee</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Ship To:</h3>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 && (
              <>
                <br />
                {order.shippingAddress.address2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Customer:</h3>
          <p className="text-sm text-gray-600">
            {order.customer.firstName} {order.customer.lastName}
            <br />
            {order.customer.email}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Items</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm font-medium text-gray-900 pb-2">Product</th>
              <th className="text-left text-sm font-medium text-gray-900 pb-2">Variant</th>
              <th className="text-right text-sm font-medium text-gray-900 pb-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">{item.productName}</td>
                <td className="py-3 text-sm text-gray-600">{item.variant}</td>
                <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Order Notes</h4>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
        Thank you for your order!
      </div>
    </div>
  );
}
