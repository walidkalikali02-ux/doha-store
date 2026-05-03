interface PointsBalanceProps {
  points: number;
  tierName: string;
  totalEarned: number;
}

export function PointsBalance({points, tierName, totalEarned}: PointsBalanceProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Your Balance</h2>
        <span className="px-3 py-1 bg-coffee-100 text-coffee-700 rounded-full text-sm font-medium">
          {tierName}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-coffee-600 to-coffee-800 rounded-lg p-6 text-white">
          <p className="text-sm text-coffee-100 mb-1">Available Points</p>
          <p className="text-4xl font-bold">{points.toLocaleString()}</p>
          <p className="text-sm text-coffee-200 mt-2">≈ ${(points / 100).toFixed(2)} value</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-1">Lifetime Points</p>
          <p className="text-3xl font-bold text-gray-900">{totalEarned.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Total earned since joining</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">Redeeming:</span> Use 100 points = $1 off at
          checkout
        </p>
      </div>
    </div>
  );
}
