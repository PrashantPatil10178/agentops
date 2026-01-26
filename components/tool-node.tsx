"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Wrench, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ToolNodeData {
  name: string;
  description: string;
}

interface ToolNodeProps {
  data: ToolNodeData;
}

export const ToolNode = memo(({ data }: ToolNodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-slate-500! border-2 border-slate-900"
      />

      {/* Dot Grid Background */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #64748b 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.1,
          }}
        />
      </div>

      <motion.div
        className="relative bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-800/50 border border-slate-700/70 rounded-xl p-4 shadow-xl min-w-[240px] hover:border-emerald-500/40 transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.03, x: -5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-slate-700"
            whileHover={{ rotate: 15 }}
          >
            <Wrench className="w-5 h-5 text-slate-300" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-semibold text-sm">{data.name}</h4>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {data.description}
            </p>
          </div>
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-slate-500! border-2 border-slate-900"
      />
    </div>
  );
});

ToolNode.displayName = "ToolNode";
