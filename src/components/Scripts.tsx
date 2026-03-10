import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { SQL_SCRIPTS } from "../lib/scripts";

export function Scripts() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Setup & Configuration Scripts</h2>
        <p className="text-[var(--color-text-secondary)]">
          Use these scripts to configure your SQL Server for monitoring. These scripts extract data from DMVs, Query Store, and set up Extended Events.
        </p>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 mb-8">
        <h3 className="text-lg font-medium text-blue-400 mb-2">Prometheus & Windows Exporter Integration</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          This dashboard is designed to consume metrics from Prometheus. To enable full monitoring, ensure you have the following exporters running on your SQL Server host:
        </p>
        <ul className="list-disc list-inside text-sm text-[var(--color-text-secondary)] space-y-2">
          <li><strong>windows_exporter:</strong> Collects OS-level metrics (CPU, Memory, Disk I/O). Run with collectors: <code className="text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded">cpu,cs,logical_disk,net,os,system,memory</code></li>
          <li><strong>sql_exporter:</strong> Collects SQL Server specific metrics. Configure it to use the custom queries provided below.</li>
        </ul>
      </div>

      <ScriptBlock 
        title="1. Wait Statistics (DMVs)" 
        description="Extracts the top wait statistics from sys.dm_os_wait_stats, filtering out benign background waits."
        code={SQL_SCRIPTS.dmv_wait_stats}
      />

      <ScriptBlock 
        title="2. Top Queries (Query Store)" 
        description="Retrieves the most resource-intensive queries from the Query Store. Requires Query Store to be enabled on the database."
        code={SQL_SCRIPTS.query_store_top_queries}
      />

      <ScriptBlock 
        title="3. Deadlock Monitoring (Extended Events)" 
        description="Creates and starts an Extended Events session to capture deadlock graphs into a ring buffer."
        code={SQL_SCRIPTS.extended_events_deadlocks}
      />
    </div>
  );
}

function ScriptBlock({ title, description, code }: { title: string, description: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
      <div className="border-b border-[var(--color-border)] p-5 bg-[var(--color-background)]/50">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
      </div>
      <div className="relative">
        <div className="absolute right-4 top-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-md bg-[var(--color-surface-hover)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border)]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="p-5 overflow-x-auto bg-[#0d0f12]">
          <pre className="text-sm font-mono text-blue-300">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
