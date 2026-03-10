import { useState, useEffect, ReactNode, ChangeEvent } from "react";
import { parse } from "yaml";
import { 
  Activity, 
  AlertCircle, 
  Database, 
  FileCode2, 
  LayoutDashboard, 
  Settings, 
  Server,
  Terminal
} from "lucide-react";
import { cn } from "./lib/utils";
import { Dashboard } from "./components/Dashboard";
import { Scripts } from "./components/Scripts";
import { TopQueries } from "./components/TopQueries";

type Tab = "overview" | "queries" | "alerts" | "scripts";

type ServerConfig = {
  type: string;
  label: string;
  instances: {
    name: string;
  }[];
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [config, setConfig] = useState<ServerConfig[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    fetch('/config.yaml')
      .then(res => res.text())
      .then(text => {
        try {
          const parsed = parse(text);
          if (parsed && parsed.servers) {
            setConfig(parsed.servers);
            if (parsed.servers.length > 0) {
              const firstType = parsed.servers[0];
              setSelectedType(firstType.type);
              if (firstType.instances.length > 0) {
                const firstInst = firstType.instances[0];
                setSelectedInstance(firstInst.name);
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse config.yaml", e);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedType && selectedInstance) {
      fetch(`/api/databases?type=${selectedType}&instance=${selectedInstance}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDatabases(data);
            if (data.length > 0 && !data.includes(selectedDatabase)) {
              setSelectedDatabase(data[0]);
            } else if (data.length === 0) {
              setSelectedDatabase("");
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch databases", err);
          setDatabases([]);
          setSelectedDatabase("");
        });
    } else {
      setDatabases([]);
      setSelectedDatabase("");
    }
  }, [selectedType, selectedInstance]);

  const currentTypeObj = config.find(c => c.type === selectedType);

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const t = e.target.value;
    setSelectedType(t);
    const typeObj = config.find(c => c.type === t);
    if (typeObj && typeObj.instances.length > 0) {
      const inst = typeObj.instances[0];
      setSelectedInstance(inst.name);
    } else {
      setSelectedInstance("");
    }
  };

  const handleInstanceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedInstance(e.target.value);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Database className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold tracking-tight">SQL Monitor</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          <NavItem 
            icon={<LayoutDashboard className="h-4 w-4" />} 
            label="Overview" 
            isActive={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<Activity className="h-4 w-4" />} 
            label="Top Queries" 
            isActive={activeTab === "queries"} 
            onClick={() => setActiveTab("queries")} 
          />
          <NavItem 
            icon={<AlertCircle className="h-4 w-4" />} 
            label="Alerts" 
            isActive={activeTab === "alerts"} 
            onClick={() => setActiveTab("alerts")} 
          />
          <NavItem 
            icon={<FileCode2 className="h-4 w-4" />} 
            label="Setup Scripts" 
            isActive={activeTab === "scripts"} 
            onClick={() => setActiveTab("scripts")} 
          />
        </nav>

        <div className="border-t border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            <Server className="h-4 w-4" />
            <span className="truncate">{selectedInstance || "No Instance"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium capitalize mr-4">{activeTab.replace('-', ' ')}</h1>
            
            {/* Context Selectors */}
            <div className="flex items-center gap-2">
              <select 
                value={selectedType} 
                onChange={handleTypeChange}
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-accent)]"
              >
                {config.map(c => (
                  <option key={c.type} value={c.type}>{c.label}</option>
                ))}
              </select>
              
              <select 
                value={selectedInstance} 
                onChange={handleInstanceChange}
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-accent)]"
              >
                {currentTypeObj?.instances.map(i => (
                  <option key={i.name} value={i.name}>{i.name}</option>
                ))}
              </select>

              <select 
                value={selectedDatabase} 
                onChange={(e) => setSelectedDatabase(e.target.value)}
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                disabled={databases.length === 0}
              >
                {databases.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Connected to Prometheus
            </div>
            <button className="rounded-md p-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <Dashboard 
              context={{
                type: selectedType,
                instance: selectedInstance,
                database: selectedDatabase
              }} 
            />
          )}
          {activeTab === "queries" && (
            <TopQueries 
              context={{
                type: selectedType,
                instance: selectedInstance,
                database: selectedDatabase
              }} 
            />
          )}
          {activeTab === "scripts" && <Scripts />}
          {activeTab === "alerts" && (
            <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>No active alerts</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-blue-600/10 text-blue-500" 
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
