import {useState} from 'react';
import {Plus, MapPin, Edit2, Trash2, Check, Home, Briefcase, Star} from 'lucide-react';

interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  label?: 'home' | 'work' | 'other';
}

export function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefaultShipping: true,
      isDefaultBilling: true,
      label: 'home',
    },
    {
      id: '2',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      address1: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10002',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefaultShipping: false,
      isDefaultBilling: false,
      label: 'work',
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSetDefault = (id: string, type: 'shipping' | 'billing') => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefaultShipping: type === 'shipping' ? addr.id === id : addr.isDefaultShipping,
        isDefaultBilling: type === 'billing' ? addr.id === id : addr.isDefaultBilling,
      }))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const getLabelIcon = (label?: string) => {
    switch (label) {
      case 'home':
        return Home;
      case 'work':
        return Briefcase;
      default:
        return MapPin;
    }
  };

  const defaultShipping = addresses.find(a => a.isDefaultShipping);
  const defaultBilling = addresses.find(a => a.isDefaultBilling);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-500">Manage your shipping and billing addresses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {/* Default Addresses Summary */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Default Shipping</p>
                <p className="font-medium text-gray-900">
                  {defaultShipping
                    ? `${defaultShipping.city}, ${defaultShipping.state}`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Default Billing</p>
                <p className="font-medium text-gray-900">
                  {defaultBilling ? `${defaultBilling.city}, ${defaultBilling.state}` : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-coffee-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add an address to make checkout faster and easier. You can save multiple addresses and
            set defaults.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(address => {
            const LabelIcon = getLabelIcon(address.label);
            return (
              <div
                key={address.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <LabelIcon className="h-6 w-6 text-gray-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {address.firstName} {address.lastName}
                            </h3>
                            {address.label && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase">
                                {address.label}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-600">{address.address1}</p>
                            {address.address2 && (
                              <p className="text-gray-600">{address.address2}</p>
                            )}
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                          {address.phone && (
                            <p className="text-sm text-gray-500 mt-2">{address.phone}</p>
                          )}
                        </div>

                        {/* Default Badges */}
                        <div className="flex flex-wrap gap-2">
                          {address.isDefaultShipping && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <Check className="h-3 w-3" />
                              Shipping
                            </span>
                          )}
                          {address.isDefaultBilling && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <Check className="h-3 w-3" />
                              Billing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Default Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                    {!address.isDefaultShipping ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id, 'shipping')}
                        className="text-sm font-medium text-coffee-600 hover:text-coffee-700 flex items-center gap-1"
                      >
                        <Star className="h-4 w-4" />
                        Set as default shipping
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Default shipping address
                      </span>
                    )}

                    {!address.isDefaultBilling ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id, 'billing')}
                        className="text-sm font-medium text-coffee-600 hover:text-coffee-700 flex items-center gap-1"
                      >
                        <Star className="h-4 w-4" />
                        Set as default billing
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Default billing address
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Address</h2>
            <p className="text-gray-500 mb-6">Address form would go here...</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-br from-coffee-50 to-amber-50 rounded-xl p-6 border border-coffee-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-coffee-600" />
          Address Tips
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Set Default Addresses</p>
              <p className="text-gray-600">Save time at checkout with pre-filled addresses</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Home className="h-4 w-4 text-coffee-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Label Your Addresses</p>
              <p className="text-gray-600">Use Home, Work, or Other to organize</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin className="h-4 w-4 text-coffee-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Accurate Details</p>
              <p className="text-gray-600">Include apartment numbers and correct ZIP codes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Briefcase className="h-4 w-4 text-coffee-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Multiple Locations</p>
              <p className="text-gray-600">Save addresses for home, office, and gifts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
