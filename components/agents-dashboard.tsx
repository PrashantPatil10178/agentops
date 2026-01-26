"use client";
import React from "react";
import { motion } from "framer-motion";
import { AgentCard } from "./agent-card";

const mockAgents = [
  {
    id: 1,
    name: "Data Collector Agent",
    status: "online" as const,
    apiCalls: 1247,
    uptime: "24h",
    lastActive: "2m ago",
  },
  {
    id: 2,
    name: "Analysis Agent",
    status: "online" as const,
    apiCalls: 892,
    uptime: "18h",
    lastActive: "5m ago",
  },
  {
    id: 3,
    name: "Reporting Agent",
    status: "idle" as const,
    apiCalls: 543,
    uptime: "12h",
    lastActive: "1h ago",
  },
  {
    id: 4,
    name: "Monitoring Agent",
    status: "offline" as const,
    apiCalls: 0,
    uptime: "0h",
    lastActive: "Never",
  },
  {
    id: 5,
    name: "Alert Agent",
    status: "online" as const,
    apiCalls: 2134,
    uptime: "48h",
    lastActive: "1m ago",
  },
  {
    id: 6,
    name: "Backup Agent",
    status: "idle" as const,
    apiCalls: 234,
    uptime: "6h",
    lastActive: "30m ago",
  },
];

export function AgentsDashboard() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">AI Agents</h1>
        <p className="text-slate-400">
          Monitor and manage your AI agent operations
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-slate-400 text-sm mb-2">Total Agents</p>
          <p className="text-3xl font-bold text-white">6</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-emerald-400 text-sm mb-2">Online</p>
          <p className="text-3xl font-bold text-emerald-400">3</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-yellow-400 text-sm mb-2">Idle</p>
          <p className="text-3xl font-bold text-yellow-400">2</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-red-400 text-sm mb-2">Offline</p>
          <p className="text-3xl font-bold text-red-400">1</p>
        </div>
      </motion.div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AgentCard {...agent} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
