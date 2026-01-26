"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronDown, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Agent } from "@/types/agent";

interface AvailableAgentsProps {
  agents: Agent[];
}

export function AvailableAgents({ agents }: AvailableAgentsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "lastExecution">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Available Agents
          </h1>
          <p className="text-slate-400 text-base">
            Manage and monitor your AI agents
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/50 border border-slate-800/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-800/50 bg-slate-900/50">
            <div className="col-span-2 flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Agent Name</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="col-span-4 flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Instructions</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="col-span-2 flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Model</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="col-span-2 flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Last Execution</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <div className="col-span-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Tools</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-800/50">
            {filteredAgents
              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
              .map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAgentClick(agent.id)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                  {/* Agent Name */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      {agent.name}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="col-span-4 flex items-center">
                    <span className="text-slate-400 text-sm line-clamp-1">
                      {agent.description}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                      <Brain className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-300 text-xs font-medium">
                        {agent.model}
                      </span>
                    </div>
                  </div>

                  {/* Last Execution */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-slate-400 text-sm">
                      {formatDate(agent.lastExecution)}
                    </span>
                  </div>

                  {/* Tools */}
                  <div className="col-span-2 flex items-center gap-2 flex-wrap">
                    {agent.tools.slice(0, 3).map((tool) => (
                      <span
                        key={tool.id}
                        className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 text-xs font-medium"
                      >
                        {tool.name}
                      </span>
                    ))}
                    {agent.tools.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-400 text-xs font-medium">
                        +{agent.tools.length - 3}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/30">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>Page {currentPage} of 1</span>
              <span>|</span>
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                disabled
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
