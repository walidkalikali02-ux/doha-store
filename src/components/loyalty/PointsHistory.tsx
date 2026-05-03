import {TrendingUp, TrendingDown, Gift, Users, Sparkles} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'referral';
  description: string;
  points: number;
  balance: number;
  createdAt: string;
}

interface PointsHistoryProps {
  transactions: Transaction[];
}

const typeConfig = {
  earned: {icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', label: 'Earned'},
  redeemed: {icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', label: 'Redeemed'},
  bonus: {icon: Gift, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Bonus'},
  referral: {icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Referral'},
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PointsHistory({transactions}: PointsHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Points History</h2>
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No points activity yet</p>
          <p className="text-sm text-gray-400">Make a purchase to start earning!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Points History</h2>
        <button className="text-sm text-coffee-600 hover:text-coffee-700">View All</button>
      </div>

      <div className="space-y-3">
        {transactions.map(transaction => {
          const config = typeConfig[transaction.type];
          const Icon = config.icon;

          return (
            <div key={transaction.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className={`flex-shrink-0 w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}
              >
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {transaction.points > 0 ? '+' : ''}
                  {transaction.points}
                </p>
                <p className="text-xs text-gray-500">Balance: {transaction.balance}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
