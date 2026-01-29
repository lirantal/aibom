import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { type GraphNode, nodeTypeConfig, severityColors } from '../lib/graph-data';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const config = nodeTypeConfig[node.type];
  const statusColors = {
    active: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Active' },
    warning: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Warning' },
    inactive: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', border: 'border-neutral-500/30', label: 'Inactive' },
  };

  const status = node.metadata?.status || 'active';
  const statusStyle = statusColors[status];

  // Mock issues for demo
  const mockIssues = node.type === 'model' ? [
    { severity: 'high', title: 'Potential prompt injection vulnerability' },
    { severity: 'medium', title: 'Model version outdated' },
  ] : node.type === 'library' ? [
    { severity: 'low', title: 'Dependency update available' },
  ] : [];

  return (
    <div className="w-80 bg-card/90 backdrop-blur-md border-l border-border/50 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center text-xl"
            style={{ 
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
              borderWidth: 1,
            }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{node.label}</h3>
            <p className="text-xs text-muted-foreground capitalize">{node.type.replace('-', ' ')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</label>
          <div className="mt-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Description */}
        {node.metadata?.description && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
            <p className="mt-1.5 text-sm text-foreground/80">{node.metadata.description}</p>
          </div>
        )}

        {/* Version */}
        {node.metadata?.version && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Version</label>
            <p className="mt-1.5 text-sm font-mono text-foreground/80">{node.metadata.version}</p>
          </div>
        )}

        {/* Issues - Snyk style */}
        {mockIssues.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Issues</label>
            <div className="mt-1.5 space-y-2">
              {mockIssues.map((issue, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-md bg-secondary/30 border border-border/30"
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-medium shrink-0 mt-0.5"
                    style={{ 
                      backgroundColor: `${severityColors[issue.severity as keyof typeof severityColors]}20`,
                      color: severityColors[issue.severity as keyof typeof severityColors],
                      borderWidth: 1,
                      borderColor: `${severityColors[issue.severity as keyof typeof severityColors]}40`,
                    }}
                  >
                    {issue.severity[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-foreground/70">{issue.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component ID */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Component ID</label>
          <p className="mt-1.5 text-xs font-mono text-foreground/50 bg-secondary/30 border border-border/30 rounded-md px-2 py-1.5">{node.id}</p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border/50 space-y-2">
          <button className="w-full px-3 py-2 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground/80 transition-colors flex items-center justify-center gap-2">
            <ShieldCheck size={14} />
            View Dependencies
          </button>
          <button 
            className="w-full px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
            style={{ 
              background: `linear-gradient(135deg, ${config.color}15, ${config.color}08)`,
              borderWidth: 1,
              borderColor: `${config.color}30`,
              color: config.color,
            }}
          >
            <ExternalLink size={14} />
            Inspect Component
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Last scanned</span>
          <span>16 hours ago</span>
        </div>
      </div>
    </div>
  );
}
