export type NodeType = 
  | 'root'
  | 'mcp-client'
  | 'mcp-server'
  | 'agent'
  | 'model'
  | 'library'
  | 'service'
  | 'resource'
  | 'tool';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  children?: string[];
  metadata?: {
    version?: string;
    status?: 'active' | 'inactive' | 'warning';
    description?: string;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: { from: string; to: string }[];
}

export const graphData: GraphData = {
  nodes: [
    {
      id: 'app-root',
      label: 'Application Root',
      type: 'root',
      metadata: { status: 'active', description: 'Main application entry point' },
    },
    {
      id: 'mcp-client-1',
      label: 'MCPServerSessions',
      type: 'mcp-client',
      metadata: { status: 'active', description: 'MCP Client session manager' },
    },
    {
      id: 'mcp-server-1',
      label: 'localhost:8000/sse',
      type: 'mcp-server',
      metadata: { status: 'active', description: 'Local SSE server' },
    },
    {
      id: 'mcp-server-2',
      label: 'DemoServer',
      type: 'mcp-server',
      metadata: { status: 'active', description: 'Demo MCP server' },
    },
    {
      id: 'agent-1',
      label: 'agents.Agent',
      type: 'agent',
      metadata: { status: 'active', description: 'Primary agent instance' },
    },
    {
      id: 'agent-2',
      label: 'create',
      type: 'agent',
      metadata: { status: 'active', description: 'Agent factory' },
    },
    {
      id: 'model-1',
      label: 'gpt-3.5-turbo',
      type: 'model',
      metadata: { version: '0613', status: 'active', description: 'OpenAI GPT-3.5 Turbo' },
    },
    {
      id: 'model-2',
      label: 'deepseek-reasoner',
      type: 'model',
      metadata: { status: 'active', description: 'DeepSeek reasoning model' },
    },
    {
      id: 'model-3',
      label: 'gpt-4o-mini',
      type: 'model',
      metadata: { status: 'active', description: 'OpenAI GPT-4o Mini' },
    },
    {
      id: 'model-4',
      label: 'bge-vqa-base',
      type: 'model',
      metadata: { status: 'warning', description: 'Salesforce BGE VQA model' },
    },
    {
      id: 'model-5',
      label: 'whisper-medium',
      type: 'model',
      metadata: { status: 'inactive', description: 'OpenAI Whisper medium' },
    },
    {
      id: 'library-1',
      label: 'openai',
      type: 'library',
      metadata: { version: '4.52.0', status: 'active', description: 'OpenAI SDK' },
    },
    {
      id: 'library-2',
      label: 'transformers',
      type: 'library',
      metadata: { version: '4.40.0', status: 'active', description: 'Hugging Face Transformers' },
    },
    {
      id: 'service-1',
      label: 'deepseek',
      type: 'service',
      metadata: { status: 'active', description: 'DeepSeek API service' },
    },
    {
      id: 'resource-1',
      label: 'get_greeting',
      type: 'resource',
      metadata: { status: 'active', description: 'Greeting resource endpoint' },
    },
    {
      id: 'tool-1',
      label: 'add',
      type: 'tool',
      metadata: { status: 'active', description: 'Addition tool' },
    },
  ],
  edges: [
    { from: 'app-root', to: 'mcp-client-1' },
    { from: 'mcp-client-1', to: 'mcp-server-1' },
    { from: 'mcp-server-1', to: 'agent-1' },
    { from: 'mcp-server-1', to: 'agent-2' },
    { from: 'app-root', to: 'mcp-server-2' },
    { from: 'mcp-server-2', to: 'resource-1' },
    { from: 'mcp-server-2', to: 'tool-1' },
    { from: 'app-root', to: 'model-1' },
    { from: 'app-root', to: 'model-2' },
    { from: 'app-root', to: 'model-3' },
    { from: 'app-root', to: 'model-4' },
    { from: 'app-root', to: 'model-5' },
    { from: 'app-root', to: 'library-1' },
    { from: 'app-root', to: 'library-2' },
    { from: 'app-root', to: 'service-1' },
    { from: 'model-1', to: 'library-1' },
    { from: 'model-3', to: 'library-1' },
    { from: 'model-2', to: 'service-1' },
  ],
};

// Snyk Evo brand colors - magenta/purple to orange gradient palette
export const nodeTypeConfig: Record<NodeType, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  'root': { color: '#ffffff', bgColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', icon: '◆' },
  'mcp-client': { color: '#c084fc', bgColor: 'rgba(192,132,252,0.12)', borderColor: 'rgba(192,132,252,0.35)', icon: '⬡' },
  'mcp-server': { color: '#e879f9', bgColor: 'rgba(232,121,249,0.12)', borderColor: 'rgba(232,121,249,0.35)', icon: '⬢' },
  'agent': { color: '#22d3ee', bgColor: 'rgba(34,211,238,0.12)', borderColor: 'rgba(34,211,238,0.35)', icon: '●' },
  'model': { color: '#f472b6', bgColor: 'rgba(244,114,182,0.12)', borderColor: 'rgba(244,114,182,0.35)', icon: '◉' },
  'library': { color: '#a78bfa', bgColor: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.35)', icon: '◈' },
  'service': { color: '#fb923c', bgColor: 'rgba(251,146,60,0.12)', borderColor: 'rgba(251,146,60,0.35)', icon: '◎' },
  'resource': { color: '#facc15', bgColor: 'rgba(250,204,21,0.12)', borderColor: 'rgba(250,204,21,0.35)', icon: '▣' },
  'tool': { color: '#f97316', bgColor: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.35)', icon: '⚙' },
};

// Severity colors matching Snyk Evo
export const severityColors = {
  critical: '#ef4444',
  high: '#f97316', 
  medium: '#eab308',
  low: '#6b7280',
};
