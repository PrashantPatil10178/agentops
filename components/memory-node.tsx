"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Database, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

interface MemoryNodeData {
  type: string;
  status: string;
}

interface MemoryNodeProps {
  data: MemoryNodeData;
}

export const MemoryNode = memo(({ data }: MemoryNodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-emerald-500! border-2 border-slate-900"
      />

      {/* Dot Grid Background */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.12,
          }}
        />
      </div>

      <motion.div
        className="relative bg-gradient-to-br from-slate-900/90 via-slate-900 to-emerald-950/30 border border-slate-700/70 rounded-xl p-4 shadow-xl min-w-[200px] hover:border-emerald-500/50 transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.03, x: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 rounded-lg flex items-center justify-center ring-1 ring-emerald-500/30"
            whileHover={{ scale: 1.1 }}
          >
            <Database className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-semibold text-sm">{data.type}</h4>
              <HardDrive className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  data.status === "active"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              <p className="text-xs text-slate-400 capitalize">{data.status}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-emerald-500! border-2 border-slate-900"
      />
    </div>
  );
});

MemoryNode.displayName = "MemoryNode";
