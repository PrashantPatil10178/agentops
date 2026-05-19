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
import { useTheme } from "next-themes";
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
  const d = data.isDark;
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="relative rounded-2xl p-6 w-[clamp(15rem,24vw,20rem)] shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: d
            ? "linear-gradient(135deg, #0f172a 0%, rgba(59,130,246,0.08) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, rgba(59,130,246,0.05) 100%)",
          border: `2px solid ${d ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.3)"}`,
          boxShadow: d
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.1)"
            : "0 4px 24px rgba(0,0,0,0.08), 0 0 16px rgba(59,130,246,0.08)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: d
              ? "radial-gradient(ellipse at top left, rgba(59,130,246,0.12) 0%, transparent 60%)"
              : "radial-gradient(ellipse at top left, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: d ? "#f8fafc" : "#0f172a" }}
              >
                User Input
              </h4>
              <p
                className="text-xs mt-0.5"
                style={{ color: d ? "#94a3b8" : "#64748b" }}
              >
                Initial Request
              </p>
            </div>
          </div>

          {/* Content */}
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: d ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.8)",
              border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(203,213,225,0.6)"}`,
            }}
          >
            <p
              className="text-sm leading-relaxed line-clamp-4"
              style={{ color: d ? "#cbd5e1" : "#475569" }}
            >
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
  const d = data.isDark;

  const getStatusIcon = (status: string) => {
    if (status === "success")
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === "error") return <XCircle className="w-5 h-5 text-red-500" />;
    return <Circle className="w-5 h-5 text-slate-400" />;
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div
        className="relative rounded-2xl p-6 w-[clamp(17rem,26vw,22rem)] shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: d
            ? "linear-gradient(135deg, #0f172a 0%, rgba(16,185,129,0.08) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, rgba(16,185,129,0.05) 100%)",
          border: `2px solid ${d ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.35)"}`,
          boxShadow: d
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.12)"
            : "0 4px 24px rgba(0,0,0,0.08), 0 0 16px rgba(16,185,129,0.1)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />

        {/* Subtle glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: d
              ? "radial-gradient(ellipse at top, rgba(16,185,129,0.1) 0%, transparent 60%)"
              : "radial-gradient(ellipse at top, rgba(16,185,129,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4
                  className="text-base font-bold uppercase tracking-wider"
                  style={{ color: d ? "#f8fafc" : "#0f172a" }}
                >
                  {data.name || "Agent"}
                </h4>
                <p
                  className="text-xs mt-0.5 font-medium"
                  style={{ color: "#10b981" }}
                >
                  AI Agent Processor
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              {getStatusIcon(data.status)}
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: d ? "#6ee7b7" : "#059669" }}
              >
                {data.status || "running"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {data.model && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: d
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(241,245,249,0.8)",
                  border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(203,213,225,0.6)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: d ? "#94a3b8" : "#64748b" }}
                  >
                    Model
                  </span>
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: d ? "#f1f5f9" : "#0f172a" }}
                  >
                    {data.model}
                  </span>
                </div>
              </div>
            )}

            {data.instructions && (
              <div
                className="p-3 rounded-xl"
                style={{
                  background: d
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(241,245,249,0.8)",
                  border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(203,213,225,0.6)"}`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wide block mb-2"
                  style={{ color: d ? "#94a3b8" : "#64748b" }}
                >
                  Instructions
                </span>
                <p
                  className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: d ? "#cbd5e1" : "#475569" }}
                >
                  {data.instructions}
                </p>
              </div>
            )}

            {(data.maxSteps || data.temperature !== undefined) && (
              <div className="grid grid-cols-2 gap-3">
                {data.maxSteps && (
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: d
                        ? "rgba(15,23,42,0.6)"
                        : "rgba(241,245,249,0.8)",
                      border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(203,213,225,0.6)"}`,
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide block mb-1"
                      style={{ color: d ? "#94a3b8" : "#64748b" }}
                    >
                      Max Steps
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: d ? "#f1f5f9" : "#0f172a" }}
                    >
                      {data.maxSteps}
                    </span>
                  </div>
                )}
                {data.temperature !== undefined && (
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background: d
                        ? "rgba(15,23,42,0.6)"
                        : "rgba(241,245,249,0.8)",
                      border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(203,213,225,0.6)"}`,
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide block mb-1"
                      style={{ color: d ? "#94a3b8" : "#64748b" }}
                    >
                      Temperature
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: d ? "#f1f5f9" : "#0f172a" }}
                    >
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
  const d = data.isDark;

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
      <div
        className="relative rounded-2xl p-6 w-[clamp(16rem,25vw,21rem)] shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: d
            ? "linear-gradient(135deg, #0f172a 0%, rgba(59,130,246,0.08) 100%)"
            : "linear-gradient(135deg, #f0f4ff 0%, rgba(59,130,246,0.04) 100%)",
          border: `2px solid ${d ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.3)"}`,
          boxShadow: d
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.1)"
            : "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Left accent line */}
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent, #3b82f6, transparent)",
          }}
        />

        {/* Subtle glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: d
              ? "radial-gradient(ellipse at top right, rgba(59,130,246,0.1) 0%, transparent 60%)"
              : "radial-gradient(ellipse at top right, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative pl-2">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: d ? "#f8fafc" : "#0f172a" }}
              >
                {data.name || "Tool"}
              </h4>
              <p className="text-xs mt-0.5" style={{ color: "#3b82f6" }}>
                Tool Execution
              </p>
            </div>
            {data.duration && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.25)",
                }}
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-mono font-semibold text-blue-400">
                  {data.duration}
                </span>
              </div>
            )}
          </div>

          {/* Tool Input */}
          {data.input && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight
                  className="w-4 h-4"
                  style={{ color: d ? "#94a3b8" : "#64748b" }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: d ? "#94a3b8" : "#64748b" }}
                >
                  Input
                </span>
              </div>
              <div
                className="p-3 rounded-xl max-h-32 overflow-y-auto"
                style={{
                  background: d
                    ? "rgba(15,23,42,0.7)"
                    : "rgba(239,246,255,0.8)",
                  border: `1px solid ${d ? "rgba(71,85,105,0.4)" : "rgba(147,197,253,0.4)"}`,
                }}
              >
                <pre
                  className="text-xs font-mono leading-relaxed whitespace-pre-wrap"
                  style={{ color: d ? "#93c5fd" : "#1d4ed8" }}
                >
                  {formatJSON(data.input)}
                </pre>
              </div>
            </div>
          )}

          {/* Tool Output */}
          {data.output && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight
                  className="w-4 h-4 rotate-180"
                  style={{ color: "#10b981" }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: d ? "#94a3b8" : "#64748b" }}
                >
                  Output
                </span>
              </div>
              <div
                className="p-3 rounded-xl max-h-32 overflow-y-auto"
                style={{
                  background: d
                    ? "rgba(15,23,42,0.7)"
                    : "rgba(240,253,244,0.8)",
                  border: `1px solid ${d ? "rgba(16,185,129,0.25)" : "rgba(110,231,183,0.4)"}`,
                }}
              >
                <pre
                  className="text-xs font-mono leading-relaxed whitespace-pre-wrap"
                  style={{ color: d ? "#6ee7b7" : "#065f46" }}
                >
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
  const d = data.isDark;

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span
            className="text-xs font-semibold"
            style={{ color: d ? "#6ee7b7" : "#059669" }}
          >
            Success
          </span>
        </div>
      );
    }
    if (status === "error") {
      return (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <XCircle className="w-4 h-4 text-red-500" />
          <span
            className="text-xs font-semibold"
            style={{ color: d ? "#fca5a5" : "#dc2626" }}
          >
            Error
          </span>
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
      <div
        className="relative rounded-2xl p-6 w-[clamp(15rem,24vw,20rem)] shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: d
            ? "linear-gradient(135deg, #0f172a 0%, rgba(16,185,129,0.08) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, rgba(16,185,129,0.05) 100%)",
          border: `2px solid ${d ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.35)"}`,
          boxShadow: d
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.12)"
            : "0 4px 24px rgba(0,0,0,0.08), 0 0 16px rgba(16,185,129,0.1)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />

        {/* Subtle glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: d
              ? "radial-gradient(ellipse at bottom right, rgba(16,185,129,0.1) 0%, transparent 60%)"
              : "radial-gradient(ellipse at bottom right, rgba(16,185,129,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <Layers className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: d ? "#f8fafc" : "#0f172a" }}
                >
                  Final Output
                </h4>
                <p className="text-xs mt-0.5" style={{ color: "#10b981" }}>
                  Agent Response
                </p>
              </div>
            </div>
            {getStatusBadge(data.status)}
          </div>

          {/* Content */}
          <div
            className="p-4 rounded-xl max-h-48 overflow-y-auto"
            style={{
              background: d ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.8)",
              border: `1px solid ${d ? "rgba(16,185,129,0.2)" : "rgba(110,231,183,0.4)"}`,
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: d ? "#e2e8f0" : "#1e293b" }}
            >
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const flowBg = "var(--background)";
  const gridColor = isDark
    ? "rgba(100,116,139,0.35)"
    : "rgba(148,163,184,0.48)";
  const labelBg = "color-mix(in oklch, var(--surface) 94%, transparent)";
  const labelFill = "var(--muted-foreground)";

  const { nodes, edges } = useMemo(() => {
    if (!trace || !trace.tree || trace.tree.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const mainSpan = trace.tree[0];
    const attrs = mainSpan.attributes;

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

    // ── Vertical-centering calculations ─────────────────────────────────────
    // Estimated rendered heights (px) and fixed column X positions
    const TOOL_H = 250; // ToolNodeFlow estimated height
    const TOOL_GAP = 44; // gap between tool cards
    const AGENT_H = 340; // AgentNodeFlow estimated height
    const INPUT_H = 270; // InputNode estimated height
    const OUTPUT_H = 285; // OutputNode estimated height
    const TOP_PAD = 60; // top/bottom viewport padding
    const INPUT_W = 320;
    const AGENT_W = 360;
    const TOOL_W = 340;
    const H_GAP = 92;

    const toolSpans = mainSpan.children || [];
    const toolSpanH =
      toolSpans.length > 0
        ? toolSpans.length * TOOL_H + (toolSpans.length - 1) * TOOL_GAP
        : 0;
    const maxH = Math.max(AGENT_H, toolSpanH);
    const centerY = TOP_PAD + maxH / 2;

    // Each column x (width estimates + controlled gap)
    const inputX = 0;
    const agentX = inputX + INPUT_W + H_GAP;
    const toolX = agentX + AGENT_W + H_GAP;
    const outputX = toolX + TOOL_W + H_GAP;

    // Y positions — all centered around `centerY`
    const inputY = centerY - INPUT_H / 2;
    const agentY = centerY - AGENT_H / 2;
    const toolsY = centerY - toolSpanH / 2;
    const outputY = centerY - OUTPUT_H / 2;

    // Input Node
    nodes.push({
      id: "input",
      type: "input",
      position: { x: inputX, y: inputY },
      data: { text: inputText, isDark },
    });

    // Agent Node
    nodes.push({
      id: "agent",
      type: "agent",
      position: { x: agentX, y: agentY },
      data: {
        name: attrs["entity.id"] || "Agent",
        status: agentState,
        model: modelName,
        instructions,
        maxSteps,
        temperature,
        isDark,
      },
    });

    // Edge: input → agent
    edges.push({
      id: "edge-input-agent",
      source: "input",
      target: "agent",
      type: "default", // bezier — elegant single edge
      animated: true,
      style: { stroke: "#3b82f6", strokeWidth: 2.5 },
      markerEnd: {
        type: "arrowclosed",
        color: "#3b82f6",
        width: 16,
        height: 16,
      },
      label: "Request",
      labelStyle: { fill: labelFill, fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: labelBg, fillOpacity: 0.95 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 6,
    });

    // Tool Nodes + edges
    toolSpans.forEach((toolSpan: any, index: number) => {
      const toolAttrs = toolSpan.attributes;
      const toolName = toolAttrs["tool.name"] || `Tool ${index + 1}`;
      const toolInput = toolAttrs["input"];
      const toolOutput = toolAttrs["output"];
      const duration =
        toolSpan.endTime && toolSpan.startTime
          ? `${((new Date(toolSpan.endTime).getTime() - new Date(toolSpan.startTime).getTime()) / 1000).toFixed(2)}s`
          : undefined;

      const toolY = toolsY + index * (TOOL_H + TOOL_GAP);
      nodes.push({
        id: `tool-${index}`,
        type: "tool",
        position: { x: toolX, y: toolY },
        data: {
          name: toolName,
          input: toolInput,
          output: toolOutput,
          duration,
          isDark,
        },
      });

      edges.push({
        id: `edge-agent-tool-${index}`,
        source: "agent",
        target: `tool-${index}`,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#6366f1", strokeWidth: 2 },
        markerEnd: {
          type: "arrowclosed",
          color: "#6366f1",
          width: 14,
          height: 14,
        },
        label: `Call ${index + 1}`,
        labelStyle: { fill: labelFill, fontWeight: 600, fontSize: 10 },
        labelBgStyle: { fill: labelBg, fillOpacity: 0.95 },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 6,
      });
    });

    // Output Node
    nodes.push({
      id: "output",
      type: "output",
      position: { x: outputX, y: outputY },
      data: { text: outputText, status: agentState, isDark },
    });

    // Final edge: last-tool → output, or agent → output if no tools
    if (toolSpans.length > 0) {
      edges.push({
        id: "edge-tool-output",
        source: `tool-${toolSpans.length - 1}`,
        target: "output",
        type: "default", // bezier for the final delivery edge
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2.5 },
        markerEnd: {
          type: "arrowclosed",
          color: "#10b981",
          width: 16,
          height: 16,
        },
        label: "Response",
        labelStyle: { fill: labelFill, fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: labelBg, fillOpacity: 0.95 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 6,
      });
    } else {
      edges.push({
        id: "edge-agent-output",
        source: "agent",
        target: "output",
        type: "default",
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 2.5 },
        markerEnd: {
          type: "arrowclosed",
          color: "#10b981",
          width: 16,
          height: 16,
        },
        label: "Response",
        labelStyle: { fill: labelFill, fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: labelBg, fillOpacity: 0.95 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 6,
      });
    }

    return { nodes, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace, isDark]);

  if (!trace) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Layers className="w-16 h-16 text-(--muted-foreground) mx-auto mb-4" />
          <p className="text-(--muted-foreground) text-sm">
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
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid var(--border-strong) !important;
        }

        .react-flow__controls-button {
          background: color-mix(
            in oklch,
            var(--surface) 94%,
            transparent
          ) !important;
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          transition: all 0.2s ease !important;
          color: var(--muted-foreground) !important;
        }

        .react-flow__controls-button:hover {
          background: color-mix(
            in oklch,
            var(--primary) 10%,
            var(--surface)
          ) !important;
          color: var(--primary) !important;
          transform: scale(1.05);
        }

        .react-flow__controls-button svg {
          fill: currentColor !important;
          transition: all 0.2s ease !important;
        }

        .react-flow__minimap {
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid var(--border-strong) !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1) !important;
        }

        .react-flow__edge-path {
          stroke-width: 3 !important;
          filter: drop-shadow(0 0 6px currentColor);
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

        .react-flow__edge:hover .react-flow__edge-path {
          stroke-width: 4 !important;
          filter: drop-shadow(0 0 10px currentColor);
        }

        .react-flow__edge-text {
          fill: var(--muted-foreground);
          font-size: 10px;
          font-weight: 600;
        }

        .react-flow__edge-textbg {
          fill: color-mix(in oklch, var(--surface) 94%, transparent);
          rx: 4;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22, duration: 500 }}
        style={{ background: flowBg }}
        minZoom={0.35}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={gridColor}
          gap={24}
          size={2}
          style={{ opacity: 0.3 }}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "input") return "#3b82f6";
            if (node.type === "agent") return "#10b981";
            if (node.type === "tool") return "#6366f1";
            if (node.type === "output") return "#10b981";
            return "#64748b";
          }}
          maskColor="color-mix(in oklch, var(--background) 86%, transparent)"
          style={{
            background: "color-mix(in oklch, var(--surface) 95%, transparent)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
