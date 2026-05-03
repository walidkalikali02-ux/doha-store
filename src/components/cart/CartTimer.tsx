import {useState, useEffect, useRef} from 'react';
import {Clock, AlertCircle} from 'lucide-react';

interface CartTimerProps {
  expiresAt: Date | null;
  onExpire?: () => void;
  warningThreshold?: number;
}

function calculateRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
  return diff > 0 ? diff : 0;
}

export function CartTimer({expiresAt, onExpire, warningThreshold = 15}: CartTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(() =>
    calculateRemaining(expiresAt)
  );
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const tick = () => {
      const remaining = calculateRemaining(expiresAt);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        onExpireRef.current?.();
        return true;
      }
      return false;
    };

    const expired = tick();
    if (expired) return;

    const interval = setInterval(() => {
      const done = tick();
      if (done) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeRemaining || timeRemaining <= 0) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isWarning = minutes < warningThreshold;

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isWarning
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200'
      }`}
    >
      {isWarning ? (
        <AlertCircle className="w-4 h-4 animate-pulse" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        Cart expires in {formatTime(minutes)}:{formatTime(seconds)}
      </span>
      {isWarning && <span className="text-xs">Complete checkout to reserve items</span>}
    </div>
  );
}
