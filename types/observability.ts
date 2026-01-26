export interface ObservabilityStatus {
  enabled: boolean;
  storage: string;
  websocket: boolean;
  traceCount: number;
  spanCount: number;
  logCount: number;
  message: string;
}

export interface ObservabilityResponse {
  success: boolean;
  data: ObservabilityStatus;
}

export interface AgentDetail {
  id: string;
  name: string;
  instructions: string;
  status: "idle" | "online" | "offline";
  model: string;
  node_id: string;
  tools: ToolDetail[];
  subAgents: any[];
  memory: {
    type: string;
    resourceId: string;
    options: Record<string, any>;
    available: boolean;
    status: string;
    node_id: string;
    vectorDB: any;
    embeddingModel: any;
  };
  retriever: any;
  isTelemetryEnabled: boolean;
}

export interface ToolDetail {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface PackageUpdate {
  name: string;
  installed: string;
  latest: string;
  type: "major" | "minor" | "patch";
  packageJson: string;
}

export interface UpdatesResponse {
  success: boolean;
  data: {
    hasUpdates: boolean;
    updates: PackageUpdate[];
    count: number;
    message: string;
  };
}

export interface SpanAttributes {
  "entity.id"?: string;
  "entity.type"?: string;
  "entity.name"?: string;
  "conversation.id"?: string;
  "operation.id"?: string;
  "agent.state"?: string;
  input?: string;
  output?: string;
  "tool.name"?: string;
  "tool.call.id"?: string;
  "span.type"?: string;
  "span.label"?: string;
  "usage.prompt_tokens"?: number;
  "usage.completion_tokens"?: number;
  "usage.total_tokens"?: number;
  "ai.model.name"?: string;
  [key: string]: any;
}

export interface SpanStatus {
  code: number;
  message?: string;
}

export interface SpanEvent {
  name: string;
  timestamp: string;
  attributes: Record<string, any>;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: number;
  startTime: string;
  endTime: string;
  duration: number;
  attributes: SpanAttributes;
  status: SpanStatus;
  events: SpanEvent[];
  resource: {
    "service.name": string;
    "service.version": string;
    "telemetry.sdk.language": string;
    "telemetry.sdk.name": string;
    "telemetry.sdk.version": string;
  };
  children?: TreeSpan[];
  depth?: number;
}

export interface TreeSpan extends Span {
  children: TreeSpan[];
  depth: number;
}

export interface Trace {
  traceId: string;
  spans: Span[];
  tree: TreeSpan[];
  spanCount: number;
}

export interface TracesResponse {
  success: boolean;
  data: {
    traces: Trace[];
    count: number;
  };
}
