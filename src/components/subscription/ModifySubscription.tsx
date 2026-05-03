import {useState} from 'react';
import {Package, RefreshCw} from 'lucide-react';

interface ModifySubscriptionProps {
  subscriptionId: string;
  currentProduct: {
    id: string;
    name: string;
    image: string;
  };
  currentFrequency: 'weekly' | 'biweekly' | 'monthly';
  currentQuantity: number;
  onModify: (
    subscriptionId: string,
    changes: {
      productId?: string;
      frequency?: 'weekly' | 'biweekly' | 'monthly';
      quantity?: number;
    }
  ) => Promise<void>;
  availableProducts?: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
  }>;
}

const frequencyOptions = [
  {value: 'weekly', label: 'Weekly', discount: '15%'},
  {value: 'biweekly', label: 'Every 2 Weeks', discount: '12%'},
  {value: 'monthly', label: 'Monthly', discount: '10%'},
];

const quantityOptions = [
  {value: 250, label: '250g'},
  {value: 500, label: '500g'},
  {value: 1000, label: '1kg'},
];

export function ModifySubscription({
  subscriptionId,
  currentProduct,
  currentFrequency,
  currentQuantity,
  onModify,
  availableProducts = [],
}: ModifySubscriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [frequency, setFrequency] = useState(currentFrequency);
  const [quantity, setQuantity] = useState(currentQuantity);
  const [selectedProductId, setSelectedProductId] = useState(currentProduct.id);
  const [isLoading, setIsLoading] = useState(false);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 2,
    }).format(price / 100);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const changes: {
        productId?: string;
        frequency?: 'weekly' | 'biweekly' | 'monthly';
        quantity?: number;
      } = {};

      if (selectedProductId !== currentProduct.id) {
        changes.productId = selectedProductId;
      }
      if (frequency !== currentFrequency) {
        changes.frequency = frequency;
      }
      if (quantity !== currentQuantity) {
        changes.quantity = quantity;
      }

      if (Object.keys(changes).length > 0) {
        await onModify(subscriptionId, changes);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to modify subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFrequency(currentFrequency);
    setQuantity(currentQuantity);
    setSelectedProductId(currentProduct.id);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{currentProduct.name}</p>
              <p className="text-sm text-gray-500">
                {quantity}g, {frequency} delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm text-coffee-600 hover:text-coffee-500"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Modify Subscription</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {availableProducts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Change Product</label>
          <div className="grid grid-cols-3 gap-3">
            {availableProducts.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedProductId === product.id
                    ? 'border-coffee-600 bg-coffee-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <RefreshCw className="inline h-4 w-4 mr-1" />
          Delivery Frequency
        </label>
        <div className="grid grid-cols-3 gap-3">
          {frequencyOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrequency(option.value as typeof frequency)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                frequency === option.value
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
              <p className="text-xs text-green-600">{option.discount} off</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="grid grid-cols-3 gap-3">
          {quantityOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setQuantity(option.value)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                quantity === option.value
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium bg-coffee-600 text-white rounded-md hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
