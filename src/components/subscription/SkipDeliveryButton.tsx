import {useState} from 'react';
import {RefreshCw} from 'lucide-react';

interface SkipDeliveryButtonProps {
  subscriptionId: string;
  nextDeliveryDate: string;
  onSkip: (subscriptionId: string) => Promise<void>;
  isSkipped?: boolean;
}

export function SkipDeliveryButton({
  subscriptionId,
  nextDeliveryDate,
  onSkip,
  isSkipped = false,
}: SkipDeliveryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skipped, setSkipped] = useState(isSkipped);

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onSkip(subscriptionId);
      setSkipped(true);
    } catch (error) {
      console.error('Failed to skip delivery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (skipped) {
    return (
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Next delivery skipped</strong> — Your following delivery will be scheduled as
          normal.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">Next delivery: {formatDate(nextDeliveryDate)}</p>
        <p className="text-sm text-gray-500">Skip this delivery if you still have enough coffee</p>
      </div>
      <button
        type="button"
        onClick={handleSkip}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Skipping...' : 'Skip Delivery'}
      </button>
    </div>
  );
}
