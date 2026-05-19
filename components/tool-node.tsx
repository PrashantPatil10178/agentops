"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Wrench, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ToolNodeData {
  name: string;
  description: string;
  isDark?: boolean;
}

export const ToolNode = memo(({ data }: { data: ToolNodeData }) => {
  const handleBorder = "var(--background)";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 9,
          height: 9,
          background: "var(--muted-foreground)",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />

      <motion.div
        className="relative rounded-xl overflow-hidden w-[clamp(12rem,17vw,14.5rem)] cursor-default"
        style={{
          background:
            "linear-gradient(135deg, var(--surface) 0%, color-mix(in oklch, var(--primary) 6%, var(--surface-2)) 100%)",
          border: "1.5px solid var(--border-strong)",
          boxShadow: data.isDark
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 2px 16px rgba(0,0,0,0.06)",
        }}
        whileHover={{
          scale: 1.03,
          x: -3,
          boxShadow: data.isDark
            ? "0 8px 28px rgba(0,0,0,0.4), 0 0 12px rgba(59,130,246,0.1)"
            : "0 6px 24px rgba(0,0,0,0.1)",
          borderColor:
            "color-mix(in oklch, var(--primary) 38%, var(--border-strong))",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Left accent line */}
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent, #3b82f6, transparent)",
          }}
        />

        <div className="px-4 py-3.5 pl-5">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <Wrench className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className="font-semibold text-sm truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {data.name}
                </h4>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <p
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {data.description || "No description"}
              </p>
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
          background: "var(--muted-foreground)",
          border: `2px solid ${handleBorder}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
});

ToolNode.displayName = "ToolNode";
