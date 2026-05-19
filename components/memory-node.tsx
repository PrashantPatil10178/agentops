"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Database, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

interface MemoryNodeData {
  type: string;
  status: string;
  isDark?: boolean;
}

export const MemoryNode = memo(({ data }: { data: MemoryNodeData }) => {
  const isActive = data.status === "active";
  const handleBorder = "var(--background)";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 9,
          height: 9,
          background: "#10b981",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />

      <motion.div
        className="relative rounded-xl overflow-hidden w-[clamp(11rem,15vw,13.25rem)] cursor-default"
        style={{
          background:
            "linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, var(--primary) 8%, var(--surface)) 100%)",
          border: "1.5px solid var(--border-strong)",
          boxShadow: data.isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 2px 16px rgba(0,0,0,0.06)",
        }}
        whileHover={{
          scale: 1.04,
          x: 3,
          boxShadow: data.isDark
            ? "0 8px 28px rgba(0,0,0,0.4), 0 0 12px rgba(16,185,129,0.12)"
            : "0 6px 24px rgba(0,0,0,0.1)",
          borderColor:
            "color-mix(in oklch, var(--primary) 40%, var(--border-strong))",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Right accent line */}
        <div
          className="absolute right-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(16,185,129,0.7), transparent)",
          }}
        />

        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center ring-1"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <Database className="text-emerald-500 w-[18px] h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4
                  className="font-semibold text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {data.type || "Memory"}
                </h4>
                <HardDrive className="w-3 h-3 text-emerald-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5">
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
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 9,
          height: 9,
          background: "#10b981",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
});

MemoryNode.displayName = "MemoryNode";
