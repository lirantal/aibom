import { useState } from 'react';
import { Filter, Code2, Maximize2, Search, ChevronDown } from 'lucide-react';
import { ConstellationGraph } from './components/constellation-graph';
import { NodeDetailPanel } from './components/node-detail-panel';
import { type GraphNode } from './lib/graph-data';

// Snyk Evo Logo Component
function EvoLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M16 4L8 8.5V15.5L16 20L24 15.5V8.5L16 4Z"
        stroke="url(#evo-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8 15.5L16 20V27L8 22.5V15.5Z"
        stroke="url(#evo-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M24 15.5L16 20V27L24 22.5V15.5Z"
        stroke="url(#evo-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      <defs>
        <linearGradient id="evo-gradient" x1="8" y1="4" x2="24" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="0.5" stopColor="#ec4899" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showJSON, setShowJSON] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filters = [
    { id: 'all', label: 'All Components' },
    { id: 'models', label: 'Models' },
    { id: 'agents', label: 'Agents' },
    { id: 'servers', label: 'MCP Servers' },
    { id: 'tools', label: 'Tools & Resources' },
  ];

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Evo Logo */}
          <div className="flex items-center gap-2.5">
            <EvoLogo className="w-7 h-7" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-tight">evo</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide">by snyk</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-border/50" />
          
          <span className="text-sm font-medium text-foreground/80">AI-BOM</span>
          
          <div className="h-6 w-px bg-border/50" />
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-8 pl-9 pr-4 bg-secondary/40 border border-border/50 rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="h-8 px-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground flex items-center gap-2 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="text-foreground/80">{filters.find(f => f.id === filter)?.label}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border/50 rounded-md shadow-xl py-1 z-50">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFilter(f.id); setShowFilterMenu(false); }}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-secondary/50 transition-colors ${
                      filter === f.id ? 'text-accent' : 'text-foreground/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom to fit */}
          <button className="h-8 px-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground flex items-center gap-2 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-foreground/80">Zoom to Fit</span>
          </button>

          {/* JSON toggle */}
          <button
            onClick={() => setShowJSON(!showJSON)}
            className={`h-8 px-3 border rounded-md text-sm flex items-center gap-2 transition-all ${
              showJSON 
                ? 'bg-gradient-to-r from-purple-500/20 to-orange-500/20 border-accent/50 text-foreground' 
                : 'bg-secondary/40 hover:bg-secondary/60 border-border/50 text-foreground/80'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Show JSON</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph area */}
        <main className="flex-1 relative">
          <ConstellationGraph 
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id || null}
            filter={filter}
          />

          {/* Stats overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-foreground">16</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Components</div>
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-cyan-400">14</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</div>
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-amber-400">1</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Warnings</div>
            </div>
          </div>

          {/* Issues summary - Snyk style */}
          <div className="absolute top-4 right-80 flex items-center gap-1.5 bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">Issues</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">C 1</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">H 6</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">M 6</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">L 3</span>
          </div>

          {/* JSON panel */}
          {showJSON && (
            <div className="absolute bottom-4 left-4 right-4 max-h-64 bg-card/90 backdrop-blur-md border border-border/50 rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-secondary/20">
                <span className="text-xs font-medium text-foreground">Component Tree (JSON)</span>
                <button 
                  onClick={() => setShowJSON(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-muted-foreground overflow-auto max-h-48">
{`{
  "application": "AI BOM Scanner",
  "version": "1.0.0",
  "scanned": "2024-01-15T10:30:00Z",
  "components": {
    "models": ["gpt-3.5-turbo", "deepseek-reasoner", "gpt-4o-mini", "bge-vqa-base", "whisper-medium"],
    "agents": ["agents.Agent", "create"],
    "mcp_servers": ["localhost:8000/sse", "DemoServer"],
    "libraries": ["openai@4.52.0", "transformers@4.40.0"],
    "services": ["deepseek"]
  },
  "issues": {
    "critical": 1,
    "high": 6,
    "medium": 6,
    "low": 3
  }
}`}
              </pre>
            </div>
          )}
        </main>

        {/* Detail panel */}
        <NodeDetailPanel 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      </div>
    </div>
  );
}
