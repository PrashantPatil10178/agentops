"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Play,
  Eye,
  ArrowLeft,
  Activity,
  FileText,
  Database,
  BarChart3,
  Settings,
  Layers,
  Zap,
  ChevronRight,
  Maximize2,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { AgentDetail } from "@/types/observability";
import { AgentNode } from "@/components/agent-node";
import { ToolNode } from "@/components/tool-node";
import { MemoryNode } from "@/components/memory-node";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { AgentChatDialog } from "@/components/agent-chat-dialog";
import { TracesView } from "@/components/traces-view";
import { TraceFlowView } from "@/components/trace-flow-view";
import { applyDagreLayout } from "@/lib/graph-layout";
import type { Trace } from "@/types/observability";

interface AgentObservabilityProps {
  agent: AgentDetail;
  onClose?: () => void;
}

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  memory: MemoryNode,
};

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  { id: "logs", label: "Logs", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "evals", label: "Evals", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "memory", label: "Memory", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "usage", label: "Usage", icon: <Settings className="w-3.5 h-3.5" /> },
];

// ─── Inner canvas controls (must live inside ReactFlow provider) ─────────────
function CanvasControls({
  isDark,
  toolCount,
  hasMemory,
}: {
  isDark: boolean;
  toolCount: number;
  hasMemory: boolean;
}) {
  const { fitView } = useReactFlow();

  const surface = isDark
    ? "color-mix(in oklch, var(--surface) 90%, transparent)"
    : "color-mix(in oklch, var(--surface) 94%, transparent)";
  const border = "var(--border-strong)";
  const muted = "var(--muted-foreground)";
  const fg = "var(--foreground)";

  return (
    <>
      {/* ── Top-left: view label ── */}
      <Panel position="top-left" style={{ margin: 12 }}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide backdrop-blur-sm"
          style={{
            background: surface,
            border: `1px solid ${border}`,
            color: muted,
          }}
        >
          <Layers className="w-3 h-3" />
          <span>Structure</span>
        </div>
      </Panel>

      {/* ── Top-right: node stats ── */}
      <Panel position="top-right" style={{ margin: 12 }}>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] backdrop-blur-sm"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          {hasMemory && (
            <span
              className="flex items-center gap-1"
              style={{ color: "#10b981" }}
            >
              <Database className="w-3 h-3" />
              <span className="font-semibold">Memory</span>
            </span>
          )}
          {hasMemory && toolCount > 0 && (
            <div style={{ width: 1, height: 12, background: border }} />
          )}
          {toolCount > 0 && (
            <span
              className="flex items-center gap-1"
              style={{ color: isDark ? "#818cf8" : "#6366f1" }}
            >
              <Wrench className="w-3 h-3" />
              <span className="font-semibold">
                {toolCount} tool{toolCount !== 1 ? "s" : ""}
              </span>
            </span>
          )}
        </div>
      </Panel>

      {/* ── Bottom-center: legend + fit-view ── */}
      <Panel position="bottom-center" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] backdrop-blur-sm"
            style={{ background: surface, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span style={{ color: muted }}>Agent</span>
            </div>
            <div style={{ width: 1, height: 10, background: border }} />
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: isDark ? "#818cf8" : "#6366f1" }}
              />
              <span style={{ color: muted }}>Tool</span>
            </div>
            {hasMemory && (
              <>
                <div style={{ width: 1, height: 10, background: border }} />
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span style={{ color: muted }}>Memory</span>
                </div>
              </>
            )}
          </div>

          {/* Fit-view button */}
          <button
            onClick={() => fitView({ padding: 0.22, duration: 500 })}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: surface,
              border: `1px solid ${border}`,
              color: fg,
              cursor: "pointer",
            }}
          >
            <Maximize2 className="w-3 h-3" />
            Fit
          </button>
        </div>
      </Panel>
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function AgentObservability({
  agent,
  onClose,
}: AgentObservabilityProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeView, setActiveView] = useState<
    "execution" | "structure" | "traces"
  >("structure");
  const [spanCount] = useState(4);
  const [autoZoom, setAutoZoom] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  // ── Build nodes + edges then apply Dagre auto-layout ──────────────────────
  useEffect(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    const toolEdgeColor = isDark ? "#818cf8" : "#6366f1";

    // Agent (central hub)
    rawNodes.push({
      id: agent.id,
      type: "agent",
      position: { x: 0, y: 0 }, // Dagre will override
      data: {
        name: agent.name,
        model: agent.model,
        status: agent.status,
        instructions: agent.instructions,
        isDark,
      },
    });

    // Memory node + edge
    if (agent.memory) {
      rawNodes.push({
        id: `memory_${agent.id}`,
        type: "memory",
        position: { x: 0, y: 0 },
        data: { type: agent.memory.type, status: agent.memory.status, isDark },
      });
      rawEdges.push({
        id: `edge-memory-${agent.id}`,
        source: `memory_${agent.id}`,
        target: agent.id,
        animated: true,
        type: "default", // bezier — looks elegant for a single edge
        style: { stroke: "#10b981", strokeWidth: 2.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
          width: 16,
          height: 16,
        },
      });
    }

    // Tool nodes + edges
    agent.tools.forEach((tool) => {
      const toolId = `tool_${tool.name}_${agent.id}`;
      rawNodes.push({
        id: toolId,
        type: "tool",
        position: { x: 0, y: 0 },
        data: { name: tool.name, description: tool.description, isDark },
      });
      rawEdges.push({
        id: `edge-${agent.id}-${toolId}`,
        source: agent.id,
        target: toolId,
        animated: false,
        type: "smoothstep",
        style: { stroke: toolEdgeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: toolEdgeColor,
          width: 14,
          height: 14,
        },
      });
    });

    const hasManyTools = agent.tools.length > 5;

    // Apply Dagre layout — use horizontal flow when tool count is high.
    const laidOutNodes = applyDagreLayout(rawNodes, rawEdges, {
      direction: hasManyTools ? "LR" : "TB",
      rankSep: hasManyTools ? 190 : 220,
      nodeSep: hasManyTools ? 76 : 110,
      marginX: 84,
      marginY: 84,
    });

    setNodes(laidOutNodes);
    setEdges(rawEdges);
  }, [agent, setNodes, setEdges, isDark]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const flowBg = "var(--background)";
  const dotColor = isDark ? "rgba(100,116,139,0.35)" : "rgba(148,163,184,0.45)";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── ReactFlow theme overrides ── */}
        <style jsx global>{`
          .react-flow__pane {
            cursor: grab;
          }
          .react-flow__pane:active {
            cursor: grabbing;
          }

          /* Controls panel */
          .react-flow__controls {
            border-radius: 12px !important;
            overflow: hidden;
            border: 1px solid var(--border-strong) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12) !important;
            background: transparent !important;
          }
          .react-flow__controls-button {
            background: var(--surface) !important;
            border: none !important;
            border-bottom: 1px solid var(--border) !important;
            color: var(--muted-foreground) !important;
            transition: all 0.15s ease !important;
            width: 28px !important;
            height: 28px !important;
          }
          .react-flow__controls-button:hover {
            background: var(--surface-2) !important;
            color: #10b981 !important;
          }
          .react-flow__controls-button svg {
            fill: currentColor !important;
          }
          .react-flow__controls-button:last-child {
            border-bottom: none !important;
          }

          /* Edges */
          .react-flow__edge-path {
            transition:
              stroke-width 0.2s,
              filter 0.2s;
          }
          .react-flow__edge:hover .react-flow__edge-path {
            filter: drop-shadow(0 0 6px currentColor);
          }
          .react-flow__edge.animated .react-flow__edge-path {
            stroke-dasharray: 6 3;
            animation: flow-dash 0.55s linear infinite;
          }
          @keyframes flow-dash {
            to {
              stroke-dashoffset: -9;
            }
          }

          /* Selected node ring */
          .react-flow__node.selected > div {
            outline: 2px solid rgba(16, 185, 129, 0.6);
            outline-offset: 3px;
            border-radius: 16px;
          }

          /* Handles */
          .react-flow__handle {
            width: 10px !important;
            height: 10px !important;
            border-width: 2px !important;
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }
          .react-flow__handle:hover {
            transform: scale(1.4);
            box-shadow: 0 0 8px currentColor;
          }

          .react-flow__attribution {
            display: none;
          }
        `}</style>

        {/* ── Header ── */}
        <motion.div
          className="shrink-0 border-b border-[var(--border-strong)] bg-[var(--surface)] px-5 py-4"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => (onClose ? onClose() : router.back())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all text-sm cursor-pointer"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="font-medium">Back</span>
              </motion.button>

              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                    delay: 0.1,
                  }}
                  className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/20"
                >
                  <Activity className="text-emerald-600 dark:text-emerald-400 w-[18px] h-[18px]" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] leading-tight tracking-tight">
                    {agent.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-[var(--muted-foreground)] capitalize">
                      {agent.status}
                    </span>
                    <span className="text-[var(--muted-foreground)] opacity-40">
                      ·
                    </span>
                    <span className="text-xs font-mono text-[var(--muted-foreground)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border-strong)]">
                      {agent.model}
                    </span>
                    <span className="text-[var(--muted-foreground)] opacity-40">
                      ·
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {agent.tools.length} tools
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-3.5 h-3.5" />
              Test Agent
            </motion.button>
          </div>

          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>

        {/* ── 3-column body ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left – Traces sidebar */}
          <motion.div
            className="w-[clamp(13rem,18vw,17rem)] border-r border-[var(--border-strong)] bg-[var(--surface)] overflow-hidden flex flex-col"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          >
            <TracesView agentId={agent.id} onTraceSelect={setSelectedTrace} />
          </motion.div>

          {/* Center – Flow canvas */}
          <motion.div
            className="flex-1 relative min-w-0"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {activeView === "traces" ? (
                <motion.div
                  key="traces"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TraceFlowView trace={selectedTrace} />
                </motion.div>
              ) : (
                <motion.div
                  key="structure"
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.26, duration: 500 }}
                    style={{ background: flowBg }}
                    defaultEdgeOptions={{
                      type: "smoothstep",
                      style: { strokeWidth: 2.5 },
                    }}
                    nodesDraggable
                    nodesConnectable={false}
                    proOptions={{ hideAttribution: true }}
                  >
                    {/* Dot grid background (modern workflow-editor style) */}
                    <Background
                      variant={"dots" as any}
                      color={dotColor}
                      gap={22}
                      size={1.5}
                    />
                    <Controls showInteractive={false} />

                    {/* Canvas overlays with fit-view, legend, node stats */}
                    <CanvasControls
                      isDark={isDark}
                      toolCount={agent.tools.length}
                      hasMemory={!!agent.memory}
                    />
                  </ReactFlow>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right – Details panel */}
          <motion.div
            className="w-[clamp(14rem,20vw,18rem)] border-l border-[var(--border-strong)] bg-[var(--surface)] overflow-y-auto flex flex-col"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          >
            {/* Panel header */}
            <div className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border-strong)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Timeline
                </span>
              </div>
              <motion.button
                className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              </motion.button>
            </div>

            <div className="p-4 space-y-3">
              {/* View toggle */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--border-strong)]">
                {(["execution", "structure", "traces"] as const).map((view) => (
                  <motion.button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`py-1.5 text-[11px] rounded-lg font-semibold transition-all capitalize cursor-pointer ${
                      activeView === view
                        ? "bg-[var(--surface)] text-emerald-700 dark:text-emerald-400 shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    {view}
                  </motion.button>
                ))}
              </div>

              {/* Span count */}
              <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    Spans
                  </span>
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    {spanCount}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "30%" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    0
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Max 20
                  </span>
                </div>
              </div>

              {/* Auto-zoom toggle */}
              <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    Auto-zoom
                  </span>
                </div>
                <motion.button
                  onClick={() => setAutoZoom(!autoZoom)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${autoZoom ? "bg-emerald-500" : "bg-[var(--surface-3)]"}`}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle auto-zoom"
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ x: autoZoom ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 600, damping: 40 }}
                  />
                </motion.button>
              </div>

              {/* Tools list */}
              {agent.tools.length > 0 && (
                <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl">
                  <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-2.5">
                    Tools · {agent.tools.length}
                  </span>
                  <div className="space-y-1.5">
                    {agent.tools.map((tool, i) => (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        className="flex items-center gap-2 px-2.5 py-2 bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg group"
                      >
                        <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-[var(--foreground)] truncate flex-1">
                          {tool.name}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {agent.instructions && (
                <div className="p-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl">
                  <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-2">
                    Instructions
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-5">
                    {agent.instructions}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Chat dialog */}
        <AgentChatDialog
          agent={agent}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}
