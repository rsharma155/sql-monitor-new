import { Clock, Cpu, Database, HardDrive } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";

type TopQueriesProps = {
  context: {
    type: string;
    instance: string;
    database: string;
  };
};

export function TopQueries({ context }: TopQueriesProps) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context.type || !context.instance || !context.database) return;

    const fetchQueries = async () => {
      try {
        const res = await fetch(`/api/top-queries?type=${context.type}&instance=${context.instance}&database=${context.database}`);
        const data = await res.json();
        setQueries(data);
      } catch (err) {
        console.error("Failed to fetch queries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
    const interval = setInterval(fetchQueries, 10000);
    return () => clearInterval(interval);
  }, [context]);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">Loading top queries...</div>;
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="border-b border-[var(--color-border)] p-5">
        <h2 className="text-lg font-medium">Top Resource Consuming Queries</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Based on Query Store data for {context.instance} ({context.database})
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[var(--color-surface)] text-xs uppercase text-[var(--color-text-secondary)] shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Query ID</th>
              <th className="px-6 py-4 font-medium">Query Text</th>
              <th className="px-6 py-4 font-medium text-right">Executions</th>
              <th className="px-6 py-4 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  Avg Duration (ms)
                </div>
              </th>
              <th className="px-6 py-4 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  <Cpu className="h-3 w-3" />
                  Avg CPU (ms)
                </div>
              </th>
              <th className="px-6 py-4 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  <HardDrive className="h-3 w-3" />
                  Avg Reads
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {queries.map((query) => (
              <tr key={query.id} className="hover:bg-[var(--color-surface-hover)] transition-colors group">
                <td className="px-6 py-4 font-mono text-blue-400 whitespace-nowrap">Q_{query.id}</td>
                <td className="px-6 py-4">
                  <div className="max-w-md truncate font-mono text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors" title={query.text}>
                    {query.text}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono">{query.execs?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono">
                  <span className={cn(
                    query.avgDuration > 1000 ? "text-red-400" : 
                    query.avgDuration > 100 ? "text-orange-400" : "text-[var(--color-text-primary)]"
                  )}>
                    {query.avgDuration?.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono">{query.cpu?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono">{query.reads?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
