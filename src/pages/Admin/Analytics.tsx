import {useState} from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {motion} from 'motion/react';

// Simple Bar Chart Component
function BarChart({
  data,
  maxValue,
  color = '#c6a355',
}: {
  data: number[];
  maxValue: number;
  color?: string;
}) {
  return (
    <div className="flex items-end gap-1 h-full">
      {data.map((value, i) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all duration-500 hover:opacity-80"
            style={{
              height: `${height}%`,
              backgroundColor: color,
              minHeight: height > 0 ? '4px' : '0',
            }}
            title={`${value}`}
          />
        );
      })}
    </div>
  );
}

// Simple Line Chart Component
function LineChart({data, color = '#c6a355'}: {data: number[]; color?: string}) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((value, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((value - minValue) / range) * 100;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.5"
            fill="white"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
  loading?: boolean;
  chart?: number[];
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  chart,
}: MetricCardProps) {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut'}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5 hover:shadow-lg hover:border-[#c6a355]/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f9f9f9] border border-[#e5e5e5] flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#3d2b1f]" />
          </div>
          <span className="text-sm font-medium text-[#737373]">{title}</span>
        </div>
        {chart && (
          <div className="w-20 h-10">
            <BarChart
              data={chart}
              maxValue={Math.max(...chart)}
              color={isPositive ? '#22c55e' : '#ef4444'}
            />
          </div>
        )}
      </div>

      <div>
        <span className="text-2xl font-bold text-[#000000]">{value}</span>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              isPositive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-[#737373]">{changeLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Sales Chart Section
function SalesChartSection() {
  const [timeRange, setTimeRange] = useState('7d');

  const salesData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [4200, 3800, 5400, 4600, 6200, 7800, 6500],
      orders: [12, 11, 18, 14, 22, 28, 23],
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [28400, 32100, 29800, 35600],
      orders: [89, 102, 95, 118],
    },
    '90d': {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [125900, 118400, 142600],
      orders: [404, 389, 456],
    },
  };

  const currentData = salesData[timeRange as keyof typeof salesData];
  const maxValue = Math.max(...currentData.values);
  const totalSales = currentData.values.reduce((a, b) => a + b, 0);
  const totalOrders = currentData.orders.reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.1}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Sales Overview</h2>
          <p className="text-sm text-[#737373]">Track your sales performance over time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#f9f9f9] rounded-lg p-0.5">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-[#000000] text-white'
                    : 'text-[#737373] hover:text-[#000000]'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button className="p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] border border-[#e3e3e3] rounded-lg transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[#f9f9f9] rounded-lg">
          <p className="text-xs text-[#737373] mb-1">Total Sales</p>
          <p className="text-lg font-bold text-[#000000]">${(totalSales / 100).toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
        </div>
        <div className="p-4 bg-[#f9f9f9] rounded-lg">
          <p className="text-xs text-[#737373] mb-1">Total Orders</p>
          <p className="text-lg font-bold text-[#000000]">{totalOrders}</p>
          <p className="text-xs text-green-600 mt-1">+8.2% vs last period</p>
        </div>
        <div className="p-4 bg-[#f9f9f9] rounded-lg">
          <p className="text-xs text-[#737373] mb-1">Avg. Order Value</p>
          <p className="text-lg font-bold text-[#000000]">
            ${(totalSales / totalOrders / 100).toFixed(2)}
          </p>
          <p className="text-xs text-green-600 mt-1">+3.1% vs last period</p>
        </div>
      </div>

      <div className="h-[250px]">
        <div className="flex items-end justify-between h-[200px] gap-2">
          {currentData.values.map((value, i) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[60px] bg-gradient-to-t from-[#c6a355] to-[#d4b97a] rounded-t transition-all group-hover:from-[#b8944a] cursor-pointer relative"
                    style={{height: `${height}%`}}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#3d2b1f] text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      ${(value / 100).toFixed(0)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#737373] font-medium">{currentData.labels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Top Products Section
function TopProductsSection() {
  const products = [
    {name: 'Ethiopian Yirgacheffe', sales: 156, revenue: 3898.44, growth: 23},
    {name: 'Colombian Supremo', sales: 142, revenue: 4258.58, growth: 18},
    {name: 'Breakfast Blend', sales: 128, revenue: 2554.72, growth: 15},
    {name: 'Espresso Roast', sales: 98, revenue: 2742.02, growth: -5},
    {name: 'Sumatra Mandheling', sales: 87, revenue: 3041.13, growth: 12},
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.2}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Top Products</h2>
          <p className="text-sm text-[#737373]">Best performing products by sales</p>
        </div>
        <button className="text-sm font-medium text-[#c6a355] hover:text-[#3d2b1f]">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 hover:bg-[#f9f9f9] rounded-lg transition-colors"
          >
            <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#737373] bg-[#f2f2f2] rounded">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#000000]">{product.name}</p>
              <p className="text-xs text-[#737373]">{product.sales} sold</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#000000]">${product.revenue.toFixed(2)}</p>
              <p className={`text-xs ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.growth >= 0 ? '+' : ''}
                {product.growth}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Traffic Sources Section
function TrafficSourcesSection() {
  const sources = [
    {name: 'Direct', value: 42, color: '#c6a355'},
    {name: 'Social Media', value: 28, color: '#3d2b1f'},
    {name: 'Organic Search', value: 18, color: '#d4b97a'},
    {name: 'Referral', value: 8, color: '#e5e5e5'},
    {name: 'Email', value: 4, color: '#f2f2f2'},
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.25}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Traffic Sources</h2>
          <p className="text-sm text-[#737373]">Where your visitors come from</p>
        </div>
        <PieChart className="h-5 w-5 text-[#737373]" />
      </div>

      <div className="space-y-3">
        {sources.map((source, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#000000] font-medium">{source.name}</span>
              <span className="text-[#737373]">{source.value}%</span>
            </div>
            <div className="h-2 bg-[#f2f2f2] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{width: `${source.value}%`, backgroundColor: source.color}}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Recent Activity Section
function RecentActivitySection() {
  const activities = [
    {
      type: 'order',
      message: 'New order #DOH-1234 for $54.00',
      time: '2 min ago',
      icon: ShoppingBag,
      color: 'bg-green-50 text-green-600',
    },
    {
      type: 'customer',
      message: 'New customer: Ahmed Al-Rashid',
      time: '5 min ago',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      type: 'pageview',
      message: 'Product page: Ethiopian Yirgacheffe',
      time: '8 min ago',
      icon: Eye,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      type: 'conversion',
      message: 'Cart abandoned: $127.00',
      time: '12 min ago',
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      type: 'review',
      message: '5-star review on Colombian Supremo',
      time: '15 min ago',
      icon: Activity,
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.3}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Recent Activity</h2>
          <p className="text-sm text-[#737373]">Real-time store activity</p>
        </div>
        <Activity className="h-5 w-5 text-[#737373]" />
      </div>

      <div className="space-y-3">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 hover:bg-[#f9f9f9] rounded-lg transition-colors"
            >
              <div
                className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#000000]">{activity.message}</p>
                <p className="text-xs text-[#737373] mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Hourly Sales Chart
function HourlySalesChart() {
  const hourlyData = [
    12, 18, 25, 32, 28, 35, 42, 38, 45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 78, 85, 92, 88, 65,
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.35}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Hourly Activity</h2>
          <p className="text-sm text-[#737373]">Orders throughout the day</p>
        </div>
        <Clock className="h-5 w-5 text-[#737373]" />
      </div>

      <div className="h-[120px]">
        <LineChart data={hourlyData} />
      </div>

      <div className="flex justify-between mt-2 text-xs text-[#737373]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </motion.div>
  );
}

// Geographic Distribution
function GeographicSection() {
  const locations = [
    {name: 'Doha', orders: 456, percentage: 52},
    {name: 'Al Wakrah', orders: 128, percentage: 15},
    {name: 'Al Khor', orders: 89, percentage: 10},
    {name: 'Al Rayyan', orders: 76, percentage: 9},
    {name: 'Others', orders: 123, percentage: 14},
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, ease: 'easeOut', delay: 0.4}}
      className="bg-white rounded-xl border border-[#e3e3e3] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#000000]">Sales by Location</h2>
          <p className="text-sm text-[#737373]">Orders by geographic region</p>
        </div>
        <MapPin className="h-5 w-5 text-[#737373]" />
      </div>

      <div className="space-y-3">
        {locations.map((location, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#737373] bg-[#f2f2f2] rounded">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-[#000000]">{location.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#737373]">{location.orders} orders</span>
              <span className="text-sm font-bold text-[#000000] w-10 text-right">
                {location.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Main Analytics Dashboard
export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('7d');

  const metrics = [
    {
      title: 'Total Sales',
      value: '$24,580',
      change: 12.5,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: DollarSign,
      chart: [3800, 4200, 3900, 5400, 4600, 6200, 7800],
    },
    {
      title: 'Orders',
      value: '156',
      change: 8.2,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: ShoppingBag,
      chart: [12, 15, 11, 18, 14, 22, 28],
    },
    {
      title: 'Page Views',
      value: '12.4K',
      change: 15.3,
      changeLabel: 'vs last week',
      trend: 'up' as const,
      icon: Eye,
      chart: [1200, 1350, 1180, 1620, 1480, 1850, 2120],
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: -0.8,
      changeLabel: 'vs last week',
      trend: 'down' as const,
      icon: MousePointer,
      chart: [3.5, 3.4, 3.3, 3.2, 3.25, 3.1, 3.24],
    },
  ];

  const dateRanges = [
    {value: 'today', label: 'Today'},
    {value: '7d', label: '7 days'},
    {value: '30d', label: '30 days'},
    {value: '90d', label: '90 days'},
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Analytics</h1>
          <p className="text-sm text-[#737373] mt-0.5">Track your store performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-[#e3e3e3] p-0.5">
            {dateRanges.map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dateRange === range.value
                    ? 'bg-[#000000] text-white'
                    : 'text-[#737373] hover:text-[#000000]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-white">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Charts */}
        <div className="xl:col-span-2 space-y-6">
          <SalesChartSection />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopProductsSection />
            <GeographicSection />
          </div>
        </div>

        {/* Right Column - Side Widgets */}
        <div className="space-y-6">
          <TrafficSourcesSection />
          <RecentActivitySection />
          <HourlySalesChart />
        </div>
      </div>
    </div>
  );
}
