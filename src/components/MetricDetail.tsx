import { ArrowLeft } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

type MetricDetailProps = {
  metric: {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
  };
  context: {
    type: string;
    instance: string;
    database: string;
  };
  onBack: () => void;
};

// Generate some mock historical data based on the metric title
function generateMockData(title: string) {
  const baseValue = Math.random() * 100;
  return Array.from({ length: 60 }).map((_, i) => {
    const time = new Date();
    time.setMinutes(time.getMinutes() - (60 - i));
    return {
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, baseValue + (Math.random() * 20 - 10)),
    };
  });
}

export function MetricDetail({ metric, context, onBack }: MetricDetailProps) {
  const data = generateMockData(metric.title);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-md hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{metric.title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {context.type.toUpperCase()} • {context.instance} • {context.database}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Current Value</p>
          <h3 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)]">{metric.value}</h3>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Trend (1h)</p>
          <h3 className={`mt-2 text-4xl font-semibold ${metric.trendUp ? 'text-red-400' : 'text-green-400'}`}>
            {metric.trend}
          </h3>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Status</p>
          <h3 className="mt-2 text-4xl font-semibold text-green-500">Healthy</h3>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm h-[500px] flex flex-col">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-6">Historical Trend (Last 60 Minutes)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="var(--color-text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--color-text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-accent)" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
