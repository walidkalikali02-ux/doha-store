import {useEffect, useRef} from 'react';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

interface SimpleChartProps {
  data: ChartData;
  type: 'bar' | 'line';
  height?: number;
}

export function SimpleChart({data, type, height = 300}: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const chartHeight = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;

    ctx.clearRect(0, 0, width, chartHeight);

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const barWidth = chartWidth / data.labels.length;

    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
    const datasetCount = data.datasets.length;

    if (type === 'bar') {
      data.labels.forEach((label, i) => {
        const x = padding + i * barWidth + barWidth / 2;

        data.datasets.forEach((dataset, j) => {
          const value = dataset.data[i] ?? 0;
          const barHeight = (value / maxValue) * (chartHeight - padding * 2);
          const barX = x - (datasetCount > 1 ? barWidth / (datasetCount + 1) : barWidth / 3);
          const barY = chartHeight - padding - barHeight;

          ctx.fillStyle = dataset.backgroundColor ?? colors[j % colors.length]!;
          ctx.fillRect(
            barX - (datasetCount > 1 ? barWidth / (datasetCount * 2) : 0),
            barY,
            datasetCount > 1 ? barWidth / (datasetCount + 1) : barWidth / 2,
            barHeight
          );
        });

        ctx.fillStyle = '#6B7280';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, chartHeight - 10);
      });
    } else {
      data.datasets.forEach((dataset, j) => {
        ctx.strokeStyle = dataset.borderColor ?? colors[j % colors.length]!;
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataset.data.forEach((value, i) => {
          const x = padding + i * (chartWidth / (data.labels.length - 1));
          const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        data.labels.forEach((_, i) => {
          const x = padding + i * (chartWidth / (data.labels.length - 1));
          const y =
            chartHeight -
            padding -
            ((dataset.data[i] ?? 0) / maxValue) * (chartHeight - padding * 2);

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = dataset.borderColor ?? colors[j % colors.length]!;
          ctx.stroke();
        });
      });

      data.labels.forEach((label, i) => {
        const x = padding + i * (chartWidth / (data.labels.length - 1));
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, chartHeight - 10);
      });
    }

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((chartHeight - padding * 2) / 5) * i;
      const value = Math.round(maxValue - (maxValue / 5) * i);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding - 8, y + 4);

      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
  }, [data, type, height]);

  return (
    <div style={{height}}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
