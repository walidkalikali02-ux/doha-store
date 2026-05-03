import {useState} from 'react';
import {Gift, ChevronDown} from 'lucide-react';

interface PointsRedemptionProps {
  availablePoints: number;
  maxRedeemablePoints: number;
  pointsToDollarRatio?: number;
  onRedeem: (points: number) => Promise<void>;
  isApplying?: boolean;
}

export function PointsRedemption({
  availablePoints,
  maxRedeemablePoints,
  pointsToDollarRatio = 100,
  onRedeem,
  isApplying = false,
}: PointsRedemptionProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const dollarValue = (pointsToRedeem / pointsToDollarRatio).toFixed(2);
  const maxDollarValue = (maxRedeemablePoints / pointsToDollarRatio).toFixed(2);
  const canRedeem =
    pointsToRedeem > 0 &&
    pointsToRedeem <= availablePoints &&
    pointsToRedeem <= maxRedeemablePoints;

  const quickAmounts = [
    {points: 100, label: '$1'},
    {points: 500, label: '$5'},
    {points: 1000, label: '$10'},
    {
      points: Math.min(maxRedeemablePoints, 2500),
      label: `$${Math.floor(Math.min(maxRedeemablePoints, 2500) / 100)}`,
    },
  ].filter(a => a.points <= maxRedeemablePoints);

  const handleRedeem = async () => {
    if (!canRedeem) return;
    await onRedeem(pointsToRedeem);
    setPointsToRedeem(0);
    setShowPicker(false);
  };

  if (availablePoints < 100) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Use Points</p>
            <p className="text-xs text-gray-500 mt-1">
              You need at least 100 points to redeem. You have {availablePoints} points.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Gift className="h-5 w-5 text-coffee-600" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Use Points</p>
            <p className="text-xs text-gray-500">
              {availablePoints.toLocaleString()} points available ($
              {(availablePoints / 100).toFixed(2)} value)
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${showPicker ? 'rotate-180' : ''}`}
        />
      </button>

      {showPicker && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Points to Redeem</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={pointsToRedeem || ''}
                onChange={e => setPointsToRedeem(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                max={maxRedeemablePoints}
                step={100}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Max
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Max redeemable: {maxRedeemablePoints.toLocaleString()} points (${maxDollarValue})
            </p>
          </div>

          {quickAmounts.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amount => (
                  <button
                    key={amount.points}
                    type="button"
                    onClick={() => setPointsToRedeem(amount.points)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      pointsToRedeem === amount.points
                        ? 'bg-coffee-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pointsToRedeem > 0 && (
            <div className="bg-coffee-50 rounded-lg p-3 mb-4">
              <p className="text-sm">
                <span className="text-gray-600">You'll save: </span>
                <span className="font-semibold text-coffee-700">${dollarValue}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleRedeem}
            disabled={!canRedeem || isApplying}
            className="w-full py-2 px-4 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isApplying ? 'Applying...' : `Apply ${pointsToRedeem} Points`}
          </button>
        </div>
      )}
    </div>
  );
}
