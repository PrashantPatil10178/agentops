export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: any;
  node_id: string;
}

export interface AgentMemory {
  type: string;
  resourceId: string;
  options: Record<string, any>;
  available: boolean;
  status: string;
  node_id: string;
  vectorDB: string | null;
  embeddingModel: string | null;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: "idle" | "online" | "offline";
  model: string;
  tools: AgentTool[];
  subAgents: any[];
  memory: AgentMemory;
  isTelemetryEnabled: boolean;
  lastExecution?: string;
}

export interface AgentsResponse {
  success: boolean;
  data: Agent[];
}
