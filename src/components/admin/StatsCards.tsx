import {TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Repeat} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalCustomers: number;
    newCustomers: number;
    newCustomersChange: number;
    activeCustomers: number;
    activeCustomersChange: number;
    totalOrders: number;
    ordersChange: number;
    revenue: number;
    revenueChange: number;
    retentionRate: number;
    retentionChange: number;
  };
}

export function StatsCards({stats}: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: stats.newCustomers,
      changeLabel: 'new this month',
      icon: <Users className="h-6 w-6" />,
      trend: stats.newCustomers > 0 ? 'up' : ('neutral' as const),
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      change: stats.activeCustomersChange,
      changeLabel: 'vs last month',
      icon: <ShoppingBag className="h-6 w-6" />,
      trend:
        stats.activeCustomersChange > 0
          ? 'up'
          : stats.activeCustomersChange < 0
            ? 'down'
            : ('neutral' as const),
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.revenue / 100).toFixed(0)}`,
      change: stats.revenueChange,
      changeLabel: 'vs last month',
      icon: <DollarSign className="h-6 w-6" />,
      trend:
        stats.revenueChange > 0 ? 'up' : stats.revenueChange < 0 ? 'down' : ('neutral' as const),
    },
    {
      title: 'Retention Rate',
      value: `${stats.retentionRate}%`,
      change: stats.retentionChange,
      changeLabel: 'vs last month',
      icon: <Repeat className="h-6 w-6" />,
      trend:
        stats.retentionChange > 0
          ? 'up'
          : stats.retentionChange < 0
            ? 'down'
            : ('neutral' as const),
    },
  ];

  const trendColors: Record<string, string> = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
              {card.change !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      trendColors[card.trend]
                    }`}
                  >
                    {card.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {card.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {card.change > 0 ? '+' : ''}
                    {card.change}%
                  </span>
                  <span className="text-xs text-gray-500">{card.changeLabel}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-coffee-50 rounded-lg text-coffee-600">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
