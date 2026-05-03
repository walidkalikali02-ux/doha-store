import {useState} from 'react';
import {Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign} from 'lucide-react';

interface CustomerDetailProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'churned';
    segment: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    firstOrderDate: string;
    lastOrderDate?: string;
    addresses: Array<{
      id: string;
      type: 'shipping' | 'billing';
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>;
    subscriptions: Array<{
      id: string;
      productName: string;
      status: string;
      nextDelivery: string;
    }>;
    notes: string;
  };
  onAddNote: (customerId: string, note: string) => Promise<void>;
  onSendEmail: (customerId: string) => Promise<void>;
}

export function CustomerDetail({customer, onAddNote, onSendEmail}: CustomerDetailProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      await onAddNote(customer.id, newNote.trim());
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-coffee-600">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h2>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSendEmail(customer.id)}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Send Email
          </button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm">Total Orders</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{customer.totalOrders}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Spent</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Avg Order Value</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(customer.averageOrderValue)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Customer Since</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(customer.firstOrderDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No saved addresses</p>
          ) : (
            <div className="space-y-4">
              {customer.addresses.map(address => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs bg-coffee-100 text-coffee-600 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriptions</h3>
          {customer.subscriptions.length === 0 ? (
            <p className="text-sm text-gray-500">No active subscriptions</p>
          ) : (
            <div className="space-y-3">
              {customer.subscriptions.map(sub => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{sub.productName}</p>
                  <p className="text-sm text-gray-500">
                    Next delivery: {formatDate(sub.nextDelivery)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
        {customer.notes && <p className="text-sm text-gray-600 mb-4">{customer.notes}</p>}
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Add a note about this customer..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-coffee-600 rounded-md hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingNote ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
