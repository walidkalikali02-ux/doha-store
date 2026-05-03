import {useState} from 'react';
import {ShoppingBag} from 'lucide-react';

interface ReorderButtonProps {
  orderId: string;
  onReorder?: (orderId: string) => Promise<void>;
  variant?: 'primary' | 'secondary';
}

export function ReorderButton({orderId, onReorder, variant = 'primary'}: ReorderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReorder = async () => {
    if (isLoading || success) return;

    setIsLoading(true);
    try {
      await onReorder?.(orderId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Reorder failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'text-white bg-coffee-600 hover:bg-coffee-700 disabled:opacity-50'
      : 'text-coffee-600 bg-white border border-coffee-600 hover:bg-coffee-50 disabled:opacity-50';

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {isLoading ? 'Adding...' : success ? 'Added!' : 'Reorder'}
    </button>
  );
}
