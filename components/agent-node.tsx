"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Activity, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";

interface AgentNodeData {
  name: string;
  status: string;
  instructions: string;
  model: string;
  isDark?: boolean;
}

export const AgentNode = memo(({ data }: { data: AgentNodeData }) => {
  const isActive = data.status === "active";
  const handleBorder = "var(--background)";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: "#10b981",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />

      <motion.div
        className="relative rounded-2xl overflow-hidden w-[clamp(16rem,22vw,19rem)] cursor-default"
        style={{
          background:
            "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 60%, color-mix(in oklch, var(--primary) 7%, var(--surface)) 100%)",
          border: "1.5px solid var(--border-strong)",
          boxShadow: data.isDark
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.05)"
            : "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(16,185,129,0.05)",
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: data.isDark
            ? "0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.15)"
            : "0 8px 32px rgba(0,0,0,0.12), 0 0 16px rgba(16,185,129,0.12)",
          borderColor:
            "color-mix(in oklch, var(--primary) 45%, var(--border-strong))",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {/* Top accent bar */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
                }}
              >
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3
                  className="font-bold text-base leading-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {data.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                    style={isActive ? { animation: "pulse 2s infinite" } : {}}
                  />
                  <span
                    className="text-xs capitalize"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: isActive
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(100,116,139,0.1)",
                color: isActive ? "#10b981" : "#94a3b8",
                border: `1px solid ${isActive ? "rgba(16,185,129,0.25)" : "rgba(100,116,139,0.2)"}`,
              }}
            >
              {data.status}
            </div>
          </div>

          {/* Instructions */}
          <div
            className="rounded-xl p-3.5 mb-4"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3 text-emerald-500" />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "#10b981" }}
              >
                Instructions
              </span>
            </div>
            <p
              className="text-xs leading-relaxed line-clamp-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              {data.instructions || "No instructions provided"}
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-3"
            style={{
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Brain
                className="w-3.5 h-3.5"
                style={{ color: "var(--muted-foreground)" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                {data.model}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-3 rounded-full"
                  style={{
                    background:
                      i < 2 ? "#10b981" : data.isDark ? "#334155" : "#e2e8f0",
                    opacity: 0.6 + i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: "#10b981",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
