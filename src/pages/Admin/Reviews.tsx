import {ReviewModeration} from '@/components/admin/ReviewModeration';

export function Reviews() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and moderate customer reviews</p>
        </div>
      </div>

      <ReviewModeration />
    </div>
  );
}
