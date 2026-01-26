"use client";
import React from "react";
import { motion } from "framer-motion";
import { CardSpotlight } from "./ui/card-spotlight";
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  status: "online" | "offline" | "idle";
  apiCalls: number;
  uptime: string;
  lastActive: string;
}

export function AgentCard({
  name,
  status,
  apiCalls,
  uptime,
  lastActive,
}: AgentCardProps) {
  const statusConfig = {
    online: {
      color: "emerald",
      label: "Online",
      icon: CheckCircle2,
    },
    offline: {
      color: "red",
      label: "Offline",
      icon: Activity,
    },
    idle: {
      color: "yellow",
      label: "Idle",
      icon: Clock,
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <CardSpotlight className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
              <div
                className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium w-fit",
                  `bg-${config.color}-500/10 border border-${config.color}-500/20 text-${config.color}-400`
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    status === "online" && "bg-emerald-400 animate-pulse",
                    status === "offline" && "bg-red-400",
                    status === "idle" && "bg-yellow-400"
                  )}
                ></div>
                <span>{config.label}</span>
              </div>
            </div>
            <config.icon
              className={cn(
                "w-6 h-6",
                status === "online" && "text-emerald-400",
                status === "offline" && "text-red-400",
                status === "idle" && "text-yellow-400"
              )}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-500 mb-1">API Calls</p>
              <p className="text-lg font-semibold text-white">{apiCalls}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Uptime</p>
              <p className="text-lg font-semibold text-white">{uptime}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Active</p>
              <p className="text-sm font-medium text-slate-300">{lastActive}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <button className="flex-1 py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium transition-all duration-200">
              View Logs
            </button>
            <button className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all duration-200">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}
