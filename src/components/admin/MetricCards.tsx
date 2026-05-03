import {TrendingUp, TrendingDown} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({title, value, change, changeLabel, icon, trend}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
    neutral: null,
  };

  const calculatedTrend =
    trend ??
    (change !== undefined && change > 0
      ? 'up'
      : change !== undefined && change < 0
        ? 'down'
        : 'neutral');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  trendColors[calculatedTrend]
                }`}
              >
                {trendIcons[calculatedTrend]}
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && <div className="p-3 bg-coffee-50 rounded-lg text-coffee-600">{icon}</div>}
      </div>
    </div>
  );
}

interface MetricCardsProps {
  metrics: Array<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export function MetricCards({metrics}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
