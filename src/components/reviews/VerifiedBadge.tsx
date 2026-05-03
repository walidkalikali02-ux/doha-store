import {CheckCircle} from 'lucide-react';

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3" />
      Verified Purchase
    </span>
  );
}
