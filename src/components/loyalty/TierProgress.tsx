interface TierProgressProps {
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsToNextTier: number;
  currentPoints: number;
  currentTierMin: number;
  nextTierMin: number;
}

const tierColors = {
  bronze: {bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-100'},
  silver: {bg: 'bg-gray-400', text: 'text-gray-600', light: 'bg-gray-100'},
  gold: {bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100'},
  platinum: {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-700',
    text: 'text-gray-700',
    light: 'bg-gray-100',
  },
};

const tierNames = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

const nextTiers: Record<string, string | null> = {
  bronze: 'Silver',
  silver: 'Gold',
  gold: 'Platinum',
  platinum: null,
};

export function TierProgress({
  currentTier,
  pointsToNextTier,
  currentPoints,
  currentTierMin,
  nextTierMin,
}: TierProgressProps) {
  const colors = tierColors[currentTier];
  const nextTier = nextTiers[currentTier];
  const progress =
    currentTier === 'platinum'
      ? 100
      : ((currentPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Tier Progress</h2>

      <div className="relative mb-4">
        <div className="flex justify-between mb-2">
          <span className={`text-sm font-medium ${colors.text}`}>{tierNames[currentTier]}</span>
          {nextTier && (
            <span className="text-sm text-gray-500">
              {nextTier} ({nextTierMin.toLocaleString()} pts)
            </span>
          )}
        </div>

        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-500`}
            style={{width: `${Math.min(progress, 100)}%`}}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{currentTierMin.toLocaleString()} pts</span>
          {nextTier && (
            <span className="text-xs text-gray-500">{nextTierMin.toLocaleString()} pts</span>
          )}
        </div>
      </div>

      {currentTier !== 'platinum' && (
        <div className={`p-4 ${colors.light} rounded-lg`}>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{pointsToNextTier.toLocaleString()} points</span> until{' '}
            {nextTier}
          </p>
          <p className="text-xs text-gray-500 mt-1">Get more benefits at the next tier!</p>
        </div>
      )}

      {currentTier === 'platinum' && (
        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            Congratulations! You've reached the highest tier!
          </p>
          <p className="text-xs text-gray-600 mt-1">Enjoy all exclusive Platinum benefits.</p>
        </div>
      )}
    </div>
  );
}
