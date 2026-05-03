interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  reportEndpoint?: string;
}

const defaultConfig: PerformanceConfig = {
  enabled: typeof window !== 'undefined' && 'PerformanceObserver' in window,
  sampleRate: 1.0,
};

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {...defaultConfig, ...config};
    if (this.config.enabled) {
      this.init();
    }
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    try {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.processEntry(entry);
        }
      });

      this.observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'],
      });
    } catch (e) {
      console.warn('Performance observer not supported:', e);
    }

    this.measureWebVitals();
  }

  private processEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      name: entry.entryType,
      value: entry.startTime + (entry.duration || 0),
      timestamp: Date.now(),
    };

    if (entry.entryType === 'largest-contentful-paint') {
      metric.name = 'LCP';
      metric.value = entry.startTime;
    }

    if (entry.entryType === 'first-input') {
      metric.name = 'FID';
      metric.value = (entry as PerformanceEventTiming).processingStart - entry.startTime;
    }

    this.recordMetric(metric);
  }

  private measureWebVitals(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.recordMetric({
            name: 'FCP',
            value: fcpEntry.startTime,
            timestamp: Date.now(),
          });
        }

        const navigationEntries = performance.getEntriesByType('navigation');
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.recordMetric({
            name: 'TTI',
            value: navEntry.domInteractive,
            timestamp: Date.now(),
          });

          this.recordMetric({
            name: 'TBT',
            value: navEntry.domComplete - navEntry.domInteractive,
            timestamp: Date.now(),
          });
        }
      }, 0);
    });
  }

  public recordMetric(metric: PerformanceMetric): void {
    if (Math.random() > this.config.sampleRate) return;

    this.metrics.push(metric);

    if (this.config.reportEndpoint) {
      this.reportMetric(metric);
    }
  }

  private reportMetric(metric: PerformanceMetric): void {
    if (!this.config.reportEndpoint) return;

    const data = {
      ...metric,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.reportEndpoint, JSON.stringify(data));
    } else {
      fetch(this.config.reportEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
        keepalive: true,
      }).catch(() => {});
    }
  }

  public mark(name: string, metadata?: Record<string, unknown>): void {
    performance.mark(name);
    const metric: PerformanceMetric = {
      name,
      value: performance.now(),
      timestamp: Date.now(),
    };
    if (metadata) {
      metric.metadata = metadata;
    }
    this.recordMetric(metric);
  }

  public measure(name: string, startMark: string, endMark?: string): void {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      entries.forEach((entry: PerformanceEntry) => {
        this.recordMetric({
          name,
          value: entry.duration,
          timestamp: Date.now(),
        });
      });
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public getAverageMetric(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  }

  public destroy(): void {
    this.observer?.disconnect();
    this.metrics = [];
  }
}

let monitor: PerformanceMonitor | null = null;

export function initPerformanceMonitoring(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  if (!monitor) {
    monitor = new PerformanceMonitor(config);
  }
  return monitor;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return monitor;
}

export function markPerformance(name: string, metadata?: Record<string, unknown>): void {
  monitor?.mark(name, metadata);
}

export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  monitor?.measure(name, startMark, endMark);
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return monitor?.getMetrics() ?? [];
}

export function getAveragePerformanceMetric(name: string): number {
  return monitor?.getAverageMetric(name) ?? 0;
}

export interface ComponentPerformanceOptions {
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
}

export function trackComponentPerformance(
  componentName: string,
  options: ComponentPerformanceOptions = {}
) {
  return function <T extends {new (...args: unknown[]): object}>(constructor: T) {
    const {trackRenders = true} = options;

    const originalRender = constructor.prototype.render;
    if (trackRenders && originalRender) {
      constructor.prototype.render = function (...args: unknown[]) {
        const start = performance.now();
        const result = originalRender.apply(this, args);
        const duration = performance.now() - start;
        monitor?.recordMetric({
          name: `${componentName}.render`,
          value: duration,
          timestamp: Date.now(),
        });
        return result;
      };
    }

    return constructor;
  };
}

export function logPerformanceSummary(): void {
  if (!monitor) return;

  const metrics = monitor.getMetrics();
  const summary: Record<string, {count: number; avg: number; min: number; max: number}> = {};

  metrics.forEach(metric => {
    if (!summary[metric.name]) {
      summary[metric.name] = {count: 0, avg: 0, min: Infinity, max: -Infinity};
    }
    const stats = summary[metric.name]!;
    stats.avg = (stats.avg * stats.count + metric.value) / (stats.count + 1);
    stats.count++;
    stats.min = Math.min(stats.min, metric.value);
    stats.max = Math.max(stats.max, metric.value);
  });

  console.table(
    Object.entries(summary).map(([name, stats]) => ({
      Metric: name,
      Count: stats.count,
      Average: `${stats.avg.toFixed(2)}ms`,
      Min: `${stats.min.toFixed(2)}ms`,
      Max: `${stats.max.toFixed(2)}ms`,
    }))
  );
}
