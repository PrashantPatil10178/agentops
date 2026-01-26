"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
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
  X,
  Maximize2,
  Activity,
  FileText,
  Database,
  BarChart3,
  Settings,
  Layers,
  GitBranch,
} from "lucide-react";
import type { AgentDetail } from "@/types/observability";
// Node components
import { AgentNode } from "@/components/agent-node";
import { ToolNode } from "@/components/tool-node";
import { MemoryNode } from "@/components/memory-node";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AgentChatDialog } from "@/components/agent-chat-dialog";
import { TracesView } from "@/components/traces-view";
import { TraceFlowView } from "@/components/trace-flow-view";
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
  { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
  { id: "logs", label: "Logs", icon: <FileText className="w-4 h-4" /> },
  {
    id: "evals",
    label: "Evals/Scorers",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { id: "memory", label: "Memory", icon: <Database className="w-4 h-4" /> },
  { id: "usage", label: "Usage", icon: <Settings className="w-4 h-4" /> },
];

export function AgentObservability({
  agent,
  onClose,
}: AgentObservabilityProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeView, setActiveView] = useState<
    "execution" | "structure" | "traces"
  >("structure");
  const [spanCount, setSpanCount] = useState(4);
  const [autoZoom, setAutoZoom] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  useEffect(() => {
    // Build node graph from agent data
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Agent node (center)
    initialNodes.push({
      id: agent.id,
      type: "agent",
      position: { x: 400, y: 200 },
      data: {
        name: agent.name,
        model: agent.model,
        status: agent.status,
        instructions: agent.instructions,
      },
    });

    // Memory node (left)
    if (agent.memory) {
      initialNodes.push({
        id: `memory_${agent.id}`,
        type: "memory",
        position: { x: 100, y: 200 },
        data: {
          type: agent.memory.type,
          status: agent.memory.status,
        },
      });

      initialEdges.push({
        id: `edge-memory-${agent.id}`,
        source: `memory_${agent.id}`,
        target: agent.id,
        animated: true,
        style: { stroke: "#10b981" },
      });
    }

    // Tool nodes (right)
    agent.tools.forEach((tool, index) => {
      const yOffset = index * 120;
      initialNodes.push({
        id: `tool_${tool.name}_${agent.id}`,
        type: "tool",
        position: { x: 700, y: yOffset + 50 },
        data: {
          name: tool.name,
          description: tool.description,
        },
      });

      initialEdges.push({
        id: `edge-${agent.id}-tool-${tool.name}`,
        source: agent.id,
        target: `tool_${tool.name}_${agent.id}`,
        animated: false,
        style: { stroke: "#64748b" },
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [agent, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-[#0a0f1e] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background Effects */}
        <BackgroundBeams className="opacity-20" />

        {/* Header */}
        <div className="relative bg-linear-to-r from-slate-900/80 via-slate-900/70 to-slate-900/80 border-b border-slate-700/50 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500/30 to-emerald-600/20 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/30">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {agent.name}
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-400 capitalize">
                      {agent.status}
                    </span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {agent.model}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setIsChatOpen(true)}
                className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Test Agent
                </div>
              </motion.button>
              <motion.button
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Maximize2 className="w-4 h-4 text-slate-400" />
              </motion.button>
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Traces */}
          <motion.div
            className="w-72 bg-linear-to-b from-slate-900/40 to-slate-900/20 border-r border-slate-700/50 overflow-hidden backdrop-blur-sm"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TracesView agentId={agent.id} onTraceSelect={setSelectedTrace} />
          </motion.div>

          {/* Center - Flow Diagram */}
          <motion.div
            className="flex-1 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <style jsx global>{`
              .react-flow__controls {
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
              }

              .react-flow__controls-button {
                background: linear-gradient(
                  135deg,
                  rgba(15, 23, 42, 0.95) 0%,
                  rgba(30, 41, 59, 0.9) 100%
                ) !important;
                border: none !important;
                border-bottom: 1px solid rgba(71, 85, 105, 0.3) !important;
                transition: all 0.2s ease !important;
                color: rgba(148, 163, 184, 0.9) !important;
              }

              .react-flow__controls-button:hover {
                background: linear-gradient(
                  135deg,
                  rgba(16, 185, 129, 0.15) 0%,
                  rgba(5, 150, 105, 0.1) 100%
                ) !important;
                color: rgba(16, 185, 129, 1) !important;
                transform: scale(1.05);
              }

              .react-flow__controls-button:hover svg {
                color: rgba(16, 185, 129, 1) !important;
              }

              .react-flow__controls-button svg {
                fill: currentColor !important;
                transition: all 0.2s ease !important;
              }

              .react-flow__minimap {
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
              }

              /* Enhanced Edge Styling */
              .react-flow__edge-path {
                stroke-width: 3 !important;
                filter: drop-shadow(0 0 8px currentColor);
              }

              .react-flow__edge.animated path {
                stroke-dasharray: 5;
                animation: dashdraw 0.5s linear infinite;
              }

              @keyframes dashdraw {
                from {
                  stroke-dashoffset: 10;
                }
              }

              .react-flow__edge .react-flow__edge-path {
                transition: stroke 0.3s ease, stroke-width 0.3s ease;
              }

              .react-flow__edge:hover .react-flow__edge-path {
                stroke-width: 4 !important;
                filter: drop-shadow(0 0 12px currentColor);
              }
            `}</style>
            {activeView === "traces" ? (
              <TraceFlowView trace={selectedTrace} />
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0a0f1e]"
                defaultEdgeOptions={{
                  type: "smoothstep",
                  animated: true,
                  style: { stroke: "#10b981", strokeWidth: 3 },
                }}
              >
                <Background
                  color="#1e293b"
                  gap={20}
                  size={1.5}
                  style={{ opacity: 0.3 }}
                />
                <Controls
                  className="bg-linear-to-br! from-slate-900/95 via-slate-800/90 to-slate-900/95 border-2! border-emerald-500/30! backdrop-blur-xl shadow-2xl! shadow-emerald-500/10 "
                  showInteractive={false}
                />
              </ReactFlow>
            )}
          </motion.div>

          {/* Right Sidebar - Timeline */}
          <motion.div
            className="w-80 bg-linear-to-b from-slate-900/40 to-slate-900/20 border-l border-slate-700/50 p-5 overflow-y-auto backdrop-blur-sm"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Timeline
                </h3>
              </div>
              <motion.button
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </motion.button>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-2 mb-6">
              <motion.button
                onClick={() => setActiveView("execution")}
                className={`flex-1 px-4 py-2.5 text-xs rounded-lg font-medium transition-all ${
                  activeView === "execution"
                    ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 border border-transparent"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                Execution
              </motion.button>
              <motion.button
                onClick={() => setActiveView("structure")}
                className={`flex-1 px-4 py-2.5 text-xs rounded-lg font-medium transition-all ${
                  activeView === "structure"
                    ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 border border-transparent"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                Structure
              </motion.button>
              <motion.button
                onClick={() => setActiveView("traces")}
                className={`flex-1 px-4 py-2.5 text-xs rounded-lg font-medium transition-all ${
                  activeView === "traces"
                    ? "bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 border border-transparent"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                Traces
              </motion.button>
            </div>

            {/* Span Count */}
            <motion.div
              className="mb-6 p-4 bg-linear-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Span count
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  {spanCount}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                </motion.button>
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-emerald-500 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: "25%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Auto Zoom */}
            <motion.div
              className="flex items-center justify-between p-4 bg-linear-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold">
                  Auto-zoom to node
                </span>
              </div>
              <motion.button
                onClick={() => setAutoZoom(!autoZoom)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoZoom ? "bg-emerald-500" : "bg-slate-700"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: autoZoom ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Chat Dialog */}
        <AgentChatDialog
          agent={agent}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}
