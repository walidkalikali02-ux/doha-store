interface RatingDistributionProps {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageRating: number;
  totalReviews: number;
}

export function RatingDistribution({
  distribution,
  averageRating,
  totalReviews,
}: RatingDistributionProps) {
  const maxCount = Math.max(...Object.values(distribution));

  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map(star => {
            const filled = star <= Math.round(averageRating);
            return (
              <svg
                key={star}
                className={`h-5 w-5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
      </div>

      <div className="space-y-3">
        {stars.map(star => {
          const count = distribution[star];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-12">{star} star</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{width: `${barWidth}%`}}
                />
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
