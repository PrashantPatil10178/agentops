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
  Wrench,
  GitBranch,
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
        if (response.data.traces.length > 0) {
          setSelectedTrace(response.data.traces[0]);
          onTraceSelect?.(response.data.traces[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load traces:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpan = (spanId: string) => {
    setExpandedSpans((prev) => {
      const next = new Set(prev);
      next.has(spanId) ? next.delete(spanId) : next.add(spanId);
      return next;
    });
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDuration = (ms: number) =>
    ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;

  const getStatusIcon = (code: number) => {
    if (code === 1)
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (code === 2)
      return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
    return <Circle className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />;
  };

  const getAgentState = (attributes: any) =>
    attributes["agent.state"] || "unknown";

  const renderSpanTree = (span: TreeSpan, depth: number = 0) => {
    const isExpanded = expandedSpans.has(span.spanId);
    const hasChildren = span.children && span.children.length > 0;
    const isToolSpan = span.attributes["span.type"] === "tool";

    return (
      <div key={span.spanId} className="relative">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="mb-1.5"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Connector line */}
          {depth > 0 && (
            <div
              className="absolute left-0 top-4 bottom-0 w-px"
              style={{
                left: -10,
                background:
                  "linear-gradient(180deg, rgba(16,185,129,0.3), transparent)",
              }}
            />
          )}

          <div
            className="relative p-2.5 rounded-xl border cursor-pointer transition-all duration-150 hover:border-emerald-500/40 hover:bg-[var(--surface-2)]"
            style={{
              background: "var(--surface)",
              borderColor: isToolSpan
                ? "rgba(59,130,246,0.25)"
                : span.status.code === 2
                  ? "rgba(239,68,68,0.25)"
                  : "var(--border-strong)",
            }}
            onClick={() => hasChildren && toggleSpan(span.spanId)}
          >
            <div className="flex items-start gap-2">
              {/* Expand toggle */}
              {hasChildren ? (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="shrink-0 mt-0.5"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                </motion.div>
              ) : (
                <div className="w-3 shrink-0" />
              )}

              {getStatusIcon(span.status.code)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                    {isToolSpan ? (
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3 h-3 text-blue-500 inline shrink-0" />
                        {span.attributes["tool.name"]}
                      </span>
                    ) : (
                      span.name
                    )}
                  </span>
                  {isToolSpan && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-md border border-blue-500/20">
                      Tool
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDuration(span.duration)}
                  </span>
                  <span className="opacity-50">·</span>
                  <span>{formatTime(span.startTime)}</span>
                </div>
              </div>

              {/* Token count */}
              {span.attributes["usage.total_tokens"] && (
                <div className="shrink-0 text-[10px] text-[var(--muted-foreground)] font-mono">
                  {span.attributes["usage.total_tokens"]}t
                </div>
              )}
            </div>

            {/* Tool IO preview */}
            {isToolSpan &&
              (span.attributes["input"] || span.attributes["output"]) && (
                <div className="mt-2 space-y-1 pl-5">
                  {span.attributes["input"] && (
                    <div className="text-[10px]">
                      <span className="text-[var(--muted-foreground)]">In: </span>
                      <span className="text-[var(--foreground)] font-mono opacity-80 line-clamp-1">
                        {span.attributes["input"]}
                      </span>
                    </div>
                  )}
                  {span.attributes["output"] && (
                    <div className="text-[10px]">
                      <span className="text-[var(--muted-foreground)]">Out: </span>
                      <span className="text-[var(--foreground)] font-mono opacity-80 line-clamp-1">
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

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {span.children.map((child) => renderSpanTree(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm mb-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
          <span>Loading traces…</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Traces list */}
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border-strong)] bg-[var(--surface)] sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-[var(--foreground)]">
              Traces
              {traces.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                  {traces.length}
                </span>
              )}
            </span>
          </div>
          <motion.button
            onClick={loadTraces}
            className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          </motion.button>
        </div>

        {/* Trace list */}
        <div className="flex-1 overflow-y-auto">
          {traces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                No traces yet.
                <br />
                Run the agent to generate traces.
              </p>
            </div>
          ) : (
            traces.map((trace, idx) => {
              const mainSpan = trace.tree[0];
              const isSelected = selectedTrace?.traceId === trace.traceId;
              const agentState = getAgentState(mainSpan.attributes);

              return (
                <motion.div
                  key={trace.traceId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="relative cursor-pointer"
                  onClick={() => {
                    setSelectedTrace(trace);
                    onTraceSelect?.(trace);
                  }}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedTrace"
                      className="absolute inset-0 bg-emerald-500/5 border-l-2 border-l-emerald-500"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}

                  <div
                    className={`relative px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors ${isSelected ? "" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        {getStatusIcon(mainSpan.status.code)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                            {mainSpan.name}
                          </span>
                          {agentState === "completed" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 shrink-0">
                              Done
                            </span>
                          )}
                          {agentState === "error" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 rounded border border-red-500/20 shrink-0">
                              Error
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <span>{formatTime(mainSpan.startTime)}</span>
                          <span className="opacity-40">·</span>
                          <span>
                            {trace.spanCount} span
                            {trace.spanCount !== 1 ? "s" : ""}
                          </span>
                          <span className="opacity-40">·</span>
                          <span className="font-mono">
                            {formatDuration(mainSpan.duration)}
                          </span>
                        </div>
                        {mainSpan.attributes["usage.total_tokens"] && (
                          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-mono">
                            {mainSpan.attributes["usage.prompt_tokens"]}↑{" "}
                            {mainSpan.attributes["usage.completion_tokens"]}↓{" "}
                            {mainSpan.attributes["usage.total_tokens"]} total
                          </div>
                        )}
                        {selectedTrace?.traceId === trace.traceId &&
                          mainSpan.children?.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2 space-y-1 overflow-hidden"
                            >
                              {mainSpan.children
                                .slice(0, 3)
                                .map((child: any) => (
                                  <div
                                    key={child.spanId}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div className="w-3 h-px bg-[var(--border-strong)]" />
                                    {getStatusIcon(child.status.code)}
                                    <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                                      {child.attributes["tool.name"] ||
                                        child.name}
                                    </span>
                                  </div>
                                ))}
                            </motion.div>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
