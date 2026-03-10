import { ReactNode, useState, useEffect } from 'react';
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
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Users, 
  Database, 
  Activity, 
  AlertTriangle, 
  Network, 
  Server, 
  Clock, 
  FileText, 
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MetricDetail } from './MetricDetail';

// Mock data for charts
const waitStats = [
  { type: 'CXPACKET', waitTime: '12,450', percentage: 45 },
  { type: 'PAGEIOLATCH_SH', waitTime: '8,230', percentage: 30 },
  { type: 'ASYNC_NETWORK_IO', waitTime: '3,100', percentage: 11 },
  { type: 'SOS_SCHEDULER_YIELD', waitTime: '2,400', percentage: 8 },
  { type: 'WRITELOG', waitTime: '1,200', percentage: 6 },
];

type DashboardProps = {
  context: {
    type: string;
    instance: string;
    database: string;
  };
};

type MetricData = {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
};

export function Dashboard({ context }: DashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<{time: string, cpu: number, memory: number}[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!context.type || !context.instance || !context.database) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/metrics?type=${context.type}&instance=${context.instance}&database=${context.database}`);
        const data = await res.json();
        
        if (data._error) {
          setError(`DB Connection Error: ${data._error}. Showing simulated fallback data.`);
        } else {
          setError(null);
        }

        setMetrics(data);
        
        setHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: data.cpu,
            memory: data.memory
          }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });

      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [context]);

  if (selectedMetric) {
    return (
      <MetricDetail 
        metric={selectedMetric} 
        context={context} 
        onBack={() => setSelectedMetric(null)} 
      />
    );
  }

  const handleMetricClick = (title: string, value: string, trend: string, trendUp: boolean) => {
    setSelectedMetric({ title, value, trend, trendUp });
  };

  if (!metrics) {
    return <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-yellow-500/10 p-4 border border-yellow-500/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-400">Connection Warning</h3>
              <div className="mt-2 text-sm text-yellow-500/80">
                <p>{error}</p>
                <p className="mt-1">Ensure your local database is running and credentials are set in .env</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core OS/Hardware Metrics */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">Hardware & OS</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="CPU Usage" value={`${metrics.cpu}%`} icon={<Cpu className="h-5 w-5 text-blue-500" />} trend="+2.5%" trendUp={true} onClick={() => handleMetricClick("CPU Usage", `${metrics.cpu}%`, "+2.5%", true)} />
        <MetricCard title="Memory Usage" value={`${metrics.memory}%`} icon={<MemoryStick className="h-5 w-5 text-purple-500" />} trend="+0.8%" trendUp={true} onClick={() => handleMetricClick("Memory Usage", `${metrics.memory}%`, "+0.8%", true)} />
        <MetricCard title="Disk I/O" value={`${metrics.diskIo} MB/s`} icon={<HardDrive className="h-5 w-5 text-green-500" />} trend="-12%" trendUp={false} onClick={() => handleMetricClick("Disk I/O", `${metrics.diskIo} MB/s`, "-12%", false)} />
        <MetricCard title="Network IO" value="120 Mbps" icon={<Network className="h-5 w-5 text-cyan-500" />} trend="+5%" trendUp={true} onClick={() => handleMetricClick("Network IO", "120 Mbps", "+5%", true)} />
      </div>

      {/* Memory & Cache Metrics */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 mt-8">Memory & Cache</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Buffer Cache Hit Ratio" value="99.8%" icon={<Database className="h-5 w-5 text-emerald-500" />} trend="+0.1%" trendUp={false} onClick={() => handleMetricClick("Buffer Cache Hit Ratio", "99.8%", "+0.1%", false)} />
        <MetricCard title="Memory Retention (PLE)" value="4,200s" icon={<Clock className="h-5 w-5 text-blue-400" />} trend="-100s" trendUp={true} onClick={() => handleMetricClick("Memory Retention (PLE)", "4,200s", "-100s", true)} />
        <MetricCard title="Memory Allocation" value="64 GB" icon={<MemoryStick className="h-5 w-5 text-purple-400" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("Memory Allocation", "64 GB", "Stable", false)} />
        <MetricCard title="Memory Target" value="64 GB" icon={<Server className="h-5 w-5 text-gray-400" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("Memory Target", "64 GB", "Stable", false)} />
      </div>

      {/* Workload & Connections */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 mt-8">Workload & Connections</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Connections" value={`${metrics.activeConnections}`} icon={<Users className="h-5 w-5 text-orange-500" />} trend="+150" trendUp={true} onClick={() => handleMetricClick("Active Connections", `${metrics.activeConnections}`, "+150", true)} />
        <MetricCard title="Total Query Volume" value={`${metrics.readVolume + metrics.writeVolume}/s`} icon={<Activity className="h-5 w-5 text-blue-500" />} trend="+200/s" trendUp={true} onClick={() => handleMetricClick("Total Query Volume", `${metrics.readVolume + metrics.writeVolume}/s`, "+200/s", true)} />
        <MetricCard title="Read Volume" value={`${metrics.readVolume}/s`} icon={<FileText className="h-5 w-5 text-green-400" />} trend="+150/s" trendUp={true} onClick={() => handleMetricClick("Read Volume", `${metrics.readVolume}/s`, "+150/s", true)} />
        <MetricCard title="Write Volume" value={`${metrics.writeVolume}/s`} icon={<FileText className="h-5 w-5 text-red-400" />} trend="+50/s" trendUp={true} onClick={() => handleMetricClick("Write Volume", `${metrics.writeVolume}/s`, "+50/s", true)} />
      </div>

      {/* Query Performance & Compilation */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 mt-8">Query Performance</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Slow Queries" value={`${metrics.slowQueries}/min`} icon={<Clock className="h-5 w-5 text-yellow-500" />} trend="-2/min" trendUp={false} onClick={() => handleMetricClick("Slow Queries", `${metrics.slowQueries}/min`, "-2/min", false)} />
        <MetricCard title="CPU-Intensive Queries" value="5" icon={<Cpu className="h-5 w-5 text-red-500" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("CPU-Intensive Queries", "5", "Stable", false)} />
        <MetricCard title="Compilation Strain" value="45/s" icon={<Activity className="h-5 w-5 text-orange-400" />} trend="+5/s" trendUp={true} onClick={() => handleMetricClick("Compilation Strain", "45/s", "+5/s", true)} />
        <MetricCard title="Recompilations" value="12/s" icon={<Activity className="h-5 w-5 text-red-400" />} trend="-3/s" trendUp={false} onClick={() => handleMetricClick("Recompilations", "12/s", "-3/s", false)} />
      </div>

      {/* Concurrency & Blocking */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 mt-8">Concurrency & Locks</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Lock Waits" value="45/s" icon={<Lock className="h-5 w-5 text-yellow-500" />} trend="+12/s" trendUp={true} onClick={() => handleMetricClick("Lock Waits", "45/s", "+12/s", true)} />
        <MetricCard title="Wait Duration" value="120ms" icon={<Clock className="h-5 w-5 text-orange-500" />} trend="+15ms" trendUp={true} onClick={() => handleMetricClick("Wait Duration", "120ms", "+15ms", true)} />
        <MetricCard title="Active Blocking" value="3" icon={<AlertTriangle className="h-5 w-5 text-red-500" />} trend="+1" trendUp={true} onClick={() => handleMetricClick("Active Blocking", "3", "+1", true)} />
        <MetricCard title="Fatal Conflicts (Deadlocks)" value="0" icon={<AlertTriangle className="h-5 w-5 text-red-600" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("Fatal Conflicts (Deadlocks)", "0", "Stable", false)} />
      </div>

      {/* Storage & High Availability */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 mt-8">Storage & HA</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Database Size" value={`${metrics.dbSize}`} icon={<Database className="h-5 w-5 text-blue-400" />} trend="+12 GB" trendUp={true} onClick={() => handleMetricClick("Database Size", `${metrics.dbSize}`, "+12 GB", true)} />
        <MetricCard title="Log Flush Speed" value="2ms" icon={<HardDrive className="h-5 w-5 text-green-400" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("Log Flush Speed", "2ms", "Stable", false)} />
        <MetricCard title="Temp Storage (TempDB)" value="120 GB" icon={<Database className="h-5 w-5 text-yellow-400" />} trend="+5 GB" trendUp={true} onClick={() => handleMetricClick("Temp Storage (TempDB)", "120 GB", "+5 GB", true)} />
        <MetricCard title="Replication Lag" value="0s" icon={<Server className="h-5 w-5 text-green-500" />} trend="Stable" trendUp={false} onClick={() => handleMetricClick("Replication Lag", "0s", "Stable", false)} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
        <ChartCard title="CPU & Memory History (Live)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wait Statistics (Last Hour)">
          <div className="flex h-full flex-col">
            <div className="grid grid-cols-12 gap-4 border-b border-[var(--color-border)] pb-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              <div className="col-span-6">Wait Type</div>
              <div className="col-span-3 text-right">Wait Time (ms)</div>
              <div className="col-span-3 text-right">%</div>
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
              {waitStats.map((stat) => (
                <div key={stat.type} className="grid grid-cols-12 gap-4 py-3 text-sm border-b border-[var(--color-border)] last:border-0 items-center">
                  <div className="col-span-6 font-mono text-[var(--color-text-primary)]">{stat.type}</div>
                  <div className="col-span-3 text-right font-mono text-[var(--color-text-secondary)]">{stat.waitTime}</div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <span className="font-mono text-[var(--color-text-secondary)]">{stat.percentage}%</span>
                    <div className="h-1.5 w-16 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendUp, onClick }: { title: string, value: string, icon: ReactNode, trend: string, trendUp: boolean, onClick?: () => void }) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-colors",
        onClick && "cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        <div className="rounded-md bg-[var(--color-background)] p-2">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</h3>
        <span className={cn(
          "text-xs font-medium",
          trendUp ? "text-red-400" : "text-green-400"
        )}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="flex h-96 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-[var(--color-text-secondary)]">{title}</h3>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
