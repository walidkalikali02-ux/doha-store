interface ReportMetrics {
  totalEvents: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topEvents: Array<{
    eventName: string;
    count: number;
    trend: number;
  }>;
  funnelMetrics?: Array<{
    funnelName: string;
    startCount: number;
    completionCount: number;
    completionRate: number;
    averageDuration: number;
    dropOffSteps: Array<{
      stepName: string;
      dropOffRate: number;
    }>;
  }>;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ReportConfig {
  name: string;
  description: string;
  metrics: string[];
  dimensions: string[];
  dateRange: DateRange;
}

class AnalyticsReporter {
  private reportConfigs: Map<string, ReportConfig> = new Map();
  private cachedReports: Map<string, {data: unknown; timestamp: number}> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  generateReport(reportId: string): unknown {
    const config = this.reportConfigs.get(reportId);
    if (!config) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const cached = this.cachedReports.get(reportId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const reportData = this.fetchReportData(config);
    this.cachedReports.set(reportId, {
      data: reportData,
      timestamp: Date.now(),
    });

    return reportData;
  }

  private fetchReportData(config: ReportConfig): unknown {
    console.log(`Generating report: ${config.name}`, {
      metrics: config.metrics,
      dimensions: config.dimensions,
      dateRange: `${config.dateRange.startDate.toISOString()} - ${config.dateRange.endDate.toISOString()}`,
    });

    return {
      reportName: config.name,
      description: config.description,
      generatedAt: new Date().toISOString(),
      dateRange: config.dateRange,
      metrics: config.metrics.reduce(
        (acc, metric) => ({
          ...acc,
          [metric]: this.generateMockMetricValue(metric),
        }),
        {}
      ),
    };
  }

  private generateMockMetricValue(metricName: string): number | string {
    const mockValues: Record<string, () => number> = {
      totalUsers: () => Math.floor(Math.random() * 10000) + 1000,
      newUsers: () => Math.floor(Math.random() * 5000) + 500,
      sessions: () => Math.floor(Math.random() * 50000) + 5000,
      pageViews: () => Math.floor(Math.random() * 100000) + 10000,
      avgSessionDuration: () => Math.floor(Math.random() * 300) + 60,
      bounceRate: () => Math.floor(Math.random() * 40) + 20,
      conversionRate: () => Math.random() * 5 + 1,
      addToCartRate: () => Math.random() * 10 + 5,
      checkoutRate: () => Math.random() * 8 + 2,
      purchaseRate: () => Math.random() * 4 + 1,
      revenue: () => Math.floor(Math.random() * 50000) + 10000,
      averageOrderValue: () => Math.floor(Math.random() * 100) + 30,
    };

    const generator = mockValues[metricName];
    if (generator) {
      return generator();
    }

    return Math.floor(Math.random() * 100);
  }

  registerReport(config: ReportConfig): void {
    this.reportConfigs.set(config.name, config);
  }

  getAvailableReports(): string[] {
    return Array.from(this.reportConfigs.keys());
  }

  clearCache(reportId?: string): void {
    if (reportId) {
      this.cachedReports.delete(reportId);
    } else {
      this.cachedReports.clear();
    }
  }

  getRealtimeMetrics(): ReportMetrics {
    return {
      totalEvents: Math.floor(Math.random() * 1000) + 100,
      uniqueUsers: Math.floor(Math.random() * 200) + 50,
      averageSessionDuration: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.random() * 30 + 20,
      conversionRate: Math.random() * 5 + 1,
      topEvents: [
        {
          eventName: 'page_view',
          count: Math.floor(Math.random() * 500) + 100,
          trend: Math.random() * 20 - 10,
        },
        {
          eventName: 'add_to_cart',
          count: Math.floor(Math.random() * 100) + 20,
          trend: Math.random() * 15 - 5,
        },
        {
          eventName: 'begin_checkout',
          count: Math.floor(Math.random() * 50) + 10,
          trend: Math.random() * 10 - 3,
        },
        {
          eventName: 'purchase',
          count: Math.floor(Math.random() * 30) + 5,
          trend: Math.random() * 8 - 2,
        },
      ],
    };
  }
}

export const analyticsReporter = new AnalyticsReporter();

analyticsReporter.registerReport({
  name: 'ecommerce_overview',
  description: 'E-commerce performance overview',
  metrics: ['revenue', 'totalUsers', 'sessions', 'conversionRate', 'averageOrderValue'],
  dimensions: ['date', 'device', 'source'],
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
});

analyticsReporter.registerReport({
  name: 'checkout_funnel',
  description: 'Checkout funnel analysis',
  metrics: ['cartViews', 'checkoutStarts', 'shippingCompletes', 'paymentCompletes', 'purchases'],
  dimensions: ['date', 'device', 'userType'],
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
});

analyticsReporter.registerReport({
  name: 'product_performance',
  description: 'Product performance metrics',
  metrics: ['productViews', 'addToCart', 'purchases', 'revenue', 'conversionRate'],
  dimensions: ['productId', 'category', 'date'],
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
});

analyticsReporter.registerReport({
  name: 'user_behavior',
  description: 'User behavior analysis',
  metrics: ['sessions', 'pageViews', 'avgSessionDuration', 'bounceRate', 'pagesPerSession'],
  dimensions: ['userType', 'device', 'source', 'date'],
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
});

analyticsReporter.registerReport({
  name: 'marketing_attribution',
  description: 'Marketing channel attribution',
  metrics: ['sessions', 'newUsers', 'conversionRate', 'revenue', 'costPerAcquisition'],
  dimensions: ['source', 'medium', 'campaign'],
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
});

interface DashboardMetric {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: Array<{date: string; value: number}>;
}

export function getDashboardMetrics(): DashboardMetric[] {
  const metrics: DashboardMetric[] = [
    {
      name: 'Revenue',
      value: Math.floor(Math.random() * 50000) + 10000,
      change: Math.random() * 20 - 5,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      trend: generateTrendData(7),
    },
    {
      name: 'Orders',
      value: Math.floor(Math.random() * 500) + 100,
      change: Math.random() * 15 - 3,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      trend: generateTrendData(7),
    },
    {
      name: 'Conversion Rate',
      value: Math.random() * 5 + 1,
      change: Math.random() * 10 - 2,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      trend: generateTrendData(7),
    },
    {
      name: 'Average Order Value',
      value: Math.floor(Math.random() * 50) + 25,
      change: Math.random() * 8 - 2,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      trend: generateTrendData(7),
    },
    {
      name: 'Cart Abandonment',
      value: Math.random() * 30 + 60,
      change: Math.random() * 10 - 5,
      changeType: Math.random() > 0.5 ? 'decrease' : 'increase',
      trend: generateTrendData(7),
    },
    {
      name: 'Active Users',
      value: Math.floor(Math.random() * 1000) + 100,
      change: Math.random() * 25 - 10,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      trend: generateTrendData(7),
    },
  ];

  return metrics;
}

function generateTrendData(days: number): Array<{date: string; value: number}> {
  const data: Array<{date: string; value: number}> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0] ?? '',
      value: Math.floor(Math.random() * 100) + 20,
    });
  }

  return data;
}

export type {ReportMetrics, DateRange, ReportConfig, DashboardMetric};
