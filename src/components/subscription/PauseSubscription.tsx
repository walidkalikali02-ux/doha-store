import {useState} from 'react';
import {Pause, Play} from 'lucide-react';

interface PauseSubscriptionProps {
  subscriptionId: string;
  status: 'active' | 'paused' | 'cancelled';
  onPause: (subscriptionId: string) => Promise<void>;
  onResume: (subscriptionId: string) => Promise<void>;
  nextDeliveryDate?: string;
}

export function PauseSubscription({
  subscriptionId,
  status: initialStatus,
  onPause,
  onResume,
  nextDeliveryDate,
}: PauseSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'active' | 'paused'>(
    initialStatus === 'cancelled' ? 'paused' : initialStatus
  );

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await onPause(subscriptionId);
      setCurrentStatus('paused');
    } catch (error) {
      console.error('Failed to pause subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await onResume(subscriptionId);
      setCurrentStatus('active');
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {currentStatus === 'paused' ? (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-amber-800">Subscription Paused</p>
              <p className="text-sm text-amber-700">
                Your subscription is paused. Resume when you're ready to start receiving coffee
                again.
              </p>
              {nextDeliveryDate && (
                <p className="text-sm text-amber-700 mt-1">
                  Next scheduled delivery: {formatDate(nextDeliveryDate)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleResume}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {isLoading ? 'Resuming...' : 'Resume'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Need a break?</p>
            <p className="text-sm text-gray-500">
              Pause your subscription anytime. You can resume whenever you're ready.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePause}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pause className="h-4 w-4" />
            {isLoading ? 'Pausing...' : 'Pause'}
          </button>
        </div>
      )}
    </div>
  );
}
