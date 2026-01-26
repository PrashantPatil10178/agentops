"use client";
import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  Circle,
} from "lucide-react";
import type { Trace, TreeSpan } from "@/types/observability";

interface TraceFlowViewProps {
  trace: Trace | null;
}

// Custom node component for Input
const InputNode = ({ data }: any) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative bg-linear-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-slate-600/50 rounded-2xl p-6 min-w-[340px] shadow-2xl backdrop-blur-xl">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl animate-pulse" />

        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-linear-to-br from-blue-500/20 to-blue-600/10 rounded-xl ring-2 ring-blue-500/30">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                User Input
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Initial Request</p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
              {data.text || "No input provided"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Custom node component for Agent
const AgentNodeFlow = ({ data }: any) => {
  const getStatusIcon = (status: string) => {
    if (status === "success")
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (status === "error") return <XCircle className="w-5 h-5 text-red-400" />;
    return <Circle className="w-5 h-5 text-slate-400" />;
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative bg-linear-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl p-6 min-w-[380px] shadow-2xl backdrop-blur-xl">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/20 via-emerald-400/20 to-emerald-500/20 rounded-2xl blur-xl animate-pulse" />

        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-linear-to-br from-emerald-500/30 to-emerald-600/20 rounded-xl ring-2 ring-emerald-500/40 shadow-lg">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wider">
                  {data.name || "Agent"}
                </h4>
                <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                  AI Agent Processor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              {getStatusIcon(data.status)}
              <span className="text-xs font-semibold text-emerald-300 capitalize">
                {data.status || "running"}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {data.model && (
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    Model
                  </span>
                  <span className="text-sm text-white font-mono font-medium">
                    {data.model}
                  </span>
                </div>
              </div>
            )}

            {data.instructions && (
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-700/50">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">
                  Instructions
                </span>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {data.instructions}
                </p>
              </div>
            )}

            {(data.maxSteps || data.temperature !== undefined) && (
              <div className="grid grid-cols-2 gap-3">
                {data.maxSteps && (
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                      Max Steps
                    </span>
                    <span className="text-lg text-white font-bold">
                      {data.maxSteps}
                    </span>
                  </div>
                )}
                {data.temperature !== undefined && (
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-700/50">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                      Temperature
                    </span>
                    <span className="text-lg text-white font-bold">
                      {data.temperature}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Custom node component for Tool
const ToolNodeFlow = ({ data }: any) => {
  const formatJSON = (obj: any) => {
    if (!obj) return "N/A";
    try {
      const parsed = typeof obj === "string" ? JSON.parse(obj) : obj;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="relative bg-linear-to-br from-blue-950/90 via-blue-900/80 to-blue-950/90 border-2 border-blue-500/50 rounded-2xl p-6 min-w-[360px] shadow-2xl backdrop-blur-xl">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />

        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-linear-to-br from-blue-500/30 to-blue-600/20 rounded-xl ring-2 ring-blue-500/40">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {data.name || "Tool"}
              </h4>
              <p className="text-xs text-blue-400 mt-0.5">Tool Execution</p>
            </div>
            {data.duration && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs font-mono text-blue-200 font-semibold">
                  {data.duration}
                </span>
              </div>
            )}
          </div>

          {/* Tool Input */}
          {data.input && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Input
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-700/50 max-h-32 overflow-y-auto">
                <pre className="text-xs text-blue-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {formatJSON(data.input)}
                </pre>
              </div>
            </div>
          )}

          {/* Tool Output */}
          {data.output && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-emerald-400 rotate-180" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Output
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-emerald-700/30 max-h-32 overflow-y-auto">
                <pre className="text-xs text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {formatJSON(data.output)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Custom node component for Output
const OutputNode = ({ data }: any) => {
  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300">
            Success
          </span>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-lg">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold text-red-300">Error</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="relative bg-linear-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl p-6 min-w-[340px] shadow-2xl backdrop-blur-xl">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-xl animate-pulse" />

        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-linear-to-br from-emerald-500/30 to-emerald-600/20 rounded-xl ring-2 ring-emerald-500/40">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Final Output
                </h4>
                <p className="text-xs text-emerald-400 mt-0.5">
                  Agent Response
                </p>
              </div>
            </div>
            {getStatusBadge(data.status)}
          </div>

          {/* Content */}
          <div className="p-4 bg-slate-950/50 rounded-xl border border-emerald-700/30 max-h-48 overflow-y-auto">
            <p className="text-sm text-slate-200 leading-relaxed">
              {data.text || "No output"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  input: InputNode,
  agent: AgentNodeFlow,
  tool: ToolNodeFlow,
  output: OutputNode,
};

export function TraceFlowView({ trace }: TraceFlowViewProps) {
  const { nodes, edges } = useMemo(() => {
    if (!trace || !trace.tree || trace.tree.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const mainSpan = trace.tree[0];
    const attrs = mainSpan.attributes;

    // Extract data
    const inputText =
      attrs["input"] &&
      Array.isArray(attrs["input"]) &&
      attrs["input"].length > 0
        ? attrs["input"][0]?.content?.[0]?.text ||
          JSON.stringify(attrs["input"])
        : "No input";

    const outputText = attrs["output"] || "No output";
    const agentState = attrs["agent.state"] || "unknown";
    const modelName = attrs["ai.model.name"] || "Unknown Model";
    const instructions = attrs["ai.prompt.messages"]?.[0]?.content || "";
    const maxSteps = attrs["ai.agent.max_steps"];
    const temperature = attrs["ai.settings.temperature"];

    // Input Node
    nodes.push({
      id: "input",
      type: "input",
      position: { x: 0, y: 150 },
      data: { text: inputText },
    });

    // Agent Node
    nodes.push({
      id: "agent",
      type: "agent",
      position: { x: 500, y: 100 },
      data: {
        name: attrs["entity.id"] || "Agent",
        status: agentState,
        model: modelName,
        instructions,
        maxSteps,
        temperature,
      },
    });

    // Edge from input to agent
    edges.push({
      id: "edge-input-agent",
      source: "input",
      target: "agent",
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "#3b82f6",
        strokeWidth: 3,
      },
      markerEnd: {
        type: "arrowclosed",
        color: "#3b82f6",
        width: 20,
        height: 20,
      },
      label: "Request",
      labelStyle: {
        fill: "#94a3b8",
        fontWeight: 600,
        fontSize: 11,
      },
      labelBgStyle: {
        fill: "rgba(15, 23, 42, 0.95)",
        fillOpacity: 0.9,
      },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
    });

    // Tool Nodes
    const toolSpans = mainSpan.children || [];
    let toolYOffset = 50;
    toolSpans.forEach((toolSpan, index) => {
      const toolAttrs = toolSpan.attributes;
      const toolName = toolAttrs["tool.name"] || `Tool ${index + 1}`;
      const toolInput = toolAttrs["input"];
      const toolOutput = toolAttrs["output"];
      const duration =
        toolSpan.endTime && toolSpan.startTime
          ? `${(
              (new Date(toolSpan.endTime).getTime() -
                new Date(toolSpan.startTime).getTime()) /
              1000
            ).toFixed(2)}s`
          : undefined;

      nodes.push({
        id: `tool-${index}`,
        type: "tool",
        position: { x: 1050, y: toolYOffset },
        data: {
          name: toolName,
          input: toolInput,
          output: toolOutput,
          duration,
        },
      });

      // Edge from agent to tool
      edges.push({
        id: `edge-agent-tool-${index}`,
        source: "agent",
        target: `tool-${index}`,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#6366f1",
          strokeWidth: 3,
        },
        markerEnd: {
          type: "arrowclosed",
          color: "#6366f1",
          width: 20,
          height: 20,
        },
        label: `Call ${index + 1}`,
        labelStyle: {
          fill: "#94a3b8",
          fontWeight: 600,
          fontSize: 11,
        },
        labelBgStyle: {
          fill: "rgba(15, 23, 42, 0.95)",
          fillOpacity: 0.9,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
      });

      toolYOffset += 250;
    });

    // Output Node
    const outputYPosition = toolSpans.length > 0 ? toolYOffset - 100 : 150;
    nodes.push({
      id: "output",
      type: "output",
      position: { x: 1600, y: outputYPosition },
      data: {
        text: outputText,
        status: agentState,
      },
    });

    // Edge from last tool to output, or from agent to output if no tools
    if (toolSpans.length > 0) {
      edges.push({
        id: `edge-tool-output`,
        source: `tool-${toolSpans.length - 1}`,
        target: "output",
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#10b981",
          strokeWidth: 3,
        },
        markerEnd: {
          type: "arrowclosed",
          color: "#10b981",
          width: 20,
          height: 20,
        },
        label: "Response",
        labelStyle: {
          fill: "#94a3b8",
          fontWeight: 600,
          fontSize: 11,
        },
        labelBgStyle: {
          fill: "rgba(15, 23, 42, 0.95)",
          fillOpacity: 0.9,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
      });
    } else {
      edges.push({
        id: "edge-agent-output",
        source: "agent",
        target: "output",
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#10b981",
          strokeWidth: 3,
        },
        markerEnd: {
          type: "arrowclosed",
          color: "#10b981",
          width: 20,
          height: 20,
        },
        label: "Response",
        labelStyle: {
          fill: "#94a3b8",
          fontWeight: 600,
          fontSize: 11,
        },
        labelBgStyle: {
          fill: "rgba(15, 23, 42, 0.95)",
          fillOpacity: 0.9,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
      });
    }

    return { nodes, edges };
  }, [trace]);

  if (!trace) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Select a trace to view execution flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
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

        /* Connection line animation */
        .react-flow__connectionline {
          stroke-width: 3;
          stroke-dasharray: 5;
          animation: dashdraw 0.5s linear infinite;
        }

        /* Edge label styling */
        .react-flow__edge-text {
          fill: rgba(148, 163, 184, 0.9);
          font-size: 10px;
          font-weight: 600;
        }

        .react-flow__edge-textbg {
          fill: rgba(15, 23, 42, 0.95);
          rx: 4;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0a0f1e]"
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1e293b"
          gap={24}
          size={2}
          style={{ opacity: 0.25 }}
        />
        <Controls
          className="bg-linear-to-br! from-slate-900/95 via-slate-800/90 to-slate-900/95 border-2! border-emerald-500/30! rounded-2xl! backdrop-blur-xl shadow-2xl! shadow-emerald-500/10"
          showInteractive={false}
        />
        <MiniMap
          className="bg-linear-to-br! from-slate-900/95 via-slate-800/90 to-slate-900/95 border-2! border-emerald-500/30! rounded-2xl! backdrop-blur-xl shadow-2xl! shadow-emerald-500/10"
          nodeColor={(node) => {
            if (node.type === "input") return "#3b82f6";
            if (node.type === "agent") return "#10b981";
            if (node.type === "tool") return "#3b82f6";
            if (node.type === "output") return "#10b981";
            return "#64748b";
          }}
          maskColor="rgba(10, 15, 30, 0.85)"
        />
      </ReactFlow>
    </div>
  );
}
