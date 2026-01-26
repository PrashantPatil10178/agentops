"use client";
import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Activity, Eye, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface AgentNodeData {
  name: string;
  status: string;
  instructions: string;
  model: string;
}

interface AgentNodeProps {
  data: AgentNodeData;
}

export const AgentNode = memo(({ data }: AgentNodeProps) => {
  return (
    <div className="relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-emerald-500! border-2 border-slate-900"
      />

      {/* Dot Grid Background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.15,
          }}
        />
      </div>

      <motion.div
        className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl min-w-[320px] group hover:border-emerald-500/70 transition-all backdrop-blur-sm"
        whileHover={{
          scale: 1.02,
          boxShadow: "0 20px 50px rgba(16, 185, 129, 0.3)",
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 rounded-xl flex items-center justify-center ring-2 ring-emerald-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Activity className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">
                {data.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      data.status === "active"
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  <p className="text-xs text-slate-400 capitalize">
                    {data.status}
                  </p>
                </div>
                <span className="text-slate-600">•</span>
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">Live</span>
              </div>
            </div>
          </div>
          <motion.button
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="mb-5 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Instructions
            </p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {data.instructions}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <motion.div
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 rounded-lg border border-emerald-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-medium text-emerald-400">
                {data.status.toUpperCase()}
              </span>
            </motion.div>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
            {data.model}
          </div>
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500! border-2 border-slate-900"
      />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
