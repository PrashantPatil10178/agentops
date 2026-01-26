"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { Trace, TreeSpan } from "@/types/observability";
import { fetchTraces } from "@/lib/observability-api";

interface TracesViewProps {
  agentId: string;
  onTraceSelect?: (trace: Trace | null) => void;
}

export function TracesView({ agentId, onTraceSelect }: TracesViewProps) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTraces();
  }, [agentId]);

  const loadTraces = async () => {
    try {
      setLoading(true);
      const response = await fetchTraces(agentId);
      if (response.success && response.data.traces) {
        setTraces(response.data.traces);
        // Auto-select first trace
        if (response.data.traces.length > 0) {
          setSelectedTrace(response.data.traces[0]);
          onTraceSelect?.(response.data.traces[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load traces:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpan = (spanId: string) => {
    setExpandedSpans((prev) => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (code: number) => {
    if (code === 1)
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (code === 2) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Circle className="w-4 h-4 text-slate-500" />;
  };

  const getAgentState = (attributes: any) => {
    return attributes["agent.state"] || "unknown";
  };

  const renderSpanTree = (span: TreeSpan, depth: number = 0) => {
    const isExpanded = expandedSpans.has(span.spanId);
    const hasChildren = span.children && span.children.length > 0;
    const isToolSpan = span.attributes["span.type"] === "tool";

    return (
      <div key={span.spanId} className="relative">
        {/* Connection line from parent */}
        {depth > 0 && (
          <svg
            className="absolute left-0 top-0 pointer-events-none"
            style={{
              width: `${depth * 60}px`,
              height: "100%",
            }}
          >
            {/* Curved connection */}
            <path
              d={`M ${depth * 60 - 30} 24 Q ${depth * 60 - 15} 24, ${
                depth * 60
              } 24`}
              fill="none"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth="2"
            />
            {/* Vertical line */}
            <line
              x1={depth * 60 - 30}
              y1="0"
              x2={depth * 60 - 30}
              y2="24"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth="2"
            />
          </svg>
        )}

        {/* Span card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="relative mb-2"
          style={{ marginLeft: `${depth * 60}px` }}
        >
          <div
            className={`relative bg-slate-900/50 border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer hover:border-emerald-500/50 ${
              isToolSpan
                ? "border-blue-500/30"
                : span.status.code === 2
                ? "border-red-500/30"
                : "border-slate-700/50"
            }`}
            onClick={() => hasChildren && toggleSpan(span.spanId)}
          >
            {/* Dot grid background */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none rounded-lg"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #10b981 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Expand/Collapse */}
                {hasChildren && (
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}

                {/* Status icon */}
                <div className="shrink-0">
                  {getStatusIcon(span.status.code)}
                </div>

                {/* Span info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {isToolSpan ? (
                        <span className="flex items-center gap-2">
                          <span className="text-blue-400">🔧</span>
                          {span.attributes["tool.name"]}
                        </span>
                      ) : (
                        span.name
                      )}
                    </span>
                    {isToolSpan && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                        Tool
                      </span>
                    )}
                  </div>

                  {/* Span details */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(span.duration)}
                    </span>
                    <span className="opacity-60">•</span>
                    <span className="truncate">
                      {formatTime(span.startTime)}
                    </span>
                  </div>
                </div>

                {/* Token count for agent spans */}
                {span.attributes["usage.total_tokens"] && (
                  <div className="shrink-0 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      In: {span.attributes["usage.prompt_tokens"]} | Out:{" "}
                      {span.attributes["usage.completion_tokens"]} | Total:{" "}
                      {span.attributes["usage.total_tokens"]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tool input/output preview */}
            {isToolSpan && (
              <div className="mt-2 space-y-1">
                {span.attributes["input"] && (
                  <div className="text-xs">
                    <span className="text-slate-500">Input: </span>
                    <span className="text-slate-300 font-mono">
                      {span.attributes["input"]}
                    </span>
                  </div>
                )}
                {span.attributes["output"] && (
                  <div className="text-xs">
                    <span className="text-slate-500">Output: </span>
                    <span className="text-slate-300 font-mono line-clamp-2">
                      {typeof span.attributes["output"] === "string"
                        ? span.attributes["output"]
                        : JSON.stringify(span.attributes["output"])}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {span.children.map((child) => renderSpanTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading traces...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-950">
      {/* Left sidebar - Traces list */}
      <div className="w-80 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-200">
              Local ({traces.length})
            </h3>
            <button
              onClick={loadTraces}
              className="p-1.5 hover:bg-slate-800 rounded-md transition-colors"
              title="Refresh traces"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Traces list */}
        <div className="flex-1 overflow-y-auto">
          {traces.map((trace) => {
            const mainSpan = trace.tree[0];
            const isSelected = selectedTrace?.traceId === trace.traceId;
            const agentState = getAgentState(mainSpan.attributes);

            return (
              <motion.div
                key={trace.traceId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border-b border-slate-800 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                    : "hover:bg-slate-900/50"
                }`}
                onClick={() => {
                  setSelectedTrace(trace);
                  onTraceSelect?.(trace);
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">
                    {getStatusIcon(mainSpan.status.code)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {mainSpan.name}
                      </span>
                      {agentState === "completed" && (
                        <span className="px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                          Completed
                        </span>
                      )}
                      {agentState === "error" && (
                        <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded border border-red-500/30">
                          Error
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatTime(mainSpan.startTime)} • {trace.spanCount} span
                      {trace.spanCount !== 1 ? "s" : ""} •{" "}
                      {formatDuration(mainSpan.duration)}
                    </div>
                    {mainSpan.attributes["output"] && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {mainSpan.attributes["output"]}
                      </div>
                    )}
                    {mainSpan.attributes["usage.total_tokens"] && (
                      <div className="text-xs text-slate-500 mt-1">
                        In: {mainSpan.attributes["usage.prompt_tokens"]} | Out:{" "}
                        {mainSpan.attributes["usage.completion_tokens"]} |
                        Total: {mainSpan.attributes["usage.total_tokens"]}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right side - Trace visualization */}
    </div>
  );
}
