import {useState} from 'react';
import {X, AlertTriangle} from 'lucide-react';

interface CancelSubscriptionProps {
  subscriptionId: string;
  onCancel: (subscriptionId: string, reason: string) => Promise<void>;
  onClose?: () => void;
}

const cancelReasons = [
  {value: 'too_much', label: 'Too much coffee'},
  {value: 'too_expensive', label: 'Too expensive'},
  {value: 'not_enjoying', label: 'Not enjoying the coffee'},
  {value: 'moving', label: 'Moving / Address change'},
  {value: 'other', label: 'Other'},
];

export function CancelSubscription({subscriptionId, onCancel, onClose}: CancelSubscriptionProps) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel(subscriptionId, selectedReason === 'other' ? otherReason : selectedReason);
      setCancelled(true);
      setStep(3);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (cancelled) {
    return (
      <div className="text-center p-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Subscription Cancelled</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your subscription has been cancelled. You'll receive one final delivery before it ends.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium bg-coffee-600 text-white rounded-md hover:bg-coffee-700"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 1 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Cancel Subscription</h3>
            {onClose && (
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Consider pausing instead?</p>
                <p className="text-sm text-amber-700">
                  You can pause your subscription and resume later. This keeps your discounts and
                  preferences.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you cancelling?
            </label>
            <div className="space-y-2">
              {cancelReasons.map(reason => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelectedReason(reason.value)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    selectedReason === reason.value
                      ? 'border-coffee-600 bg-coffee-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {selectedReason === 'other' && (
            <div>
              <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700 mb-2">
                Please tell us more
              </label>
              <textarea
                id="otherReason"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="We'd love to hear your feedback..."
              />
            </div>
          )}

          <div className="flex gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Keep Subscription
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedReason || (selectedReason === 'other' && !otherReason.trim())}
              className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Cancel
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Confirm Cancellation</h3>
            {onClose && (
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Are you sure?</strong> Your subscription will end after the current billing
              period. You'll lose your subscriber discount and any accumulated benefits.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
