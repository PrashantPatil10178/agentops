"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  Brain,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bot,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Agent } from "@/types/agent";

interface AvailableAgentsProps {
  agents: Agent[];
}

export function AvailableAgents({ agents }: AvailableAgentsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAgents.length / rowsPerPage),
  );
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
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
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all text-sm font-medium cursor-pointer">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-[var(--border-strong)] bg-[var(--surface-2)]">
          {[
            { label: "Agent Name", span: "col-span-2" },
            { label: "Instructions", span: "col-span-4" },
            { label: "Model", span: "col-span-2" },
            { label: "Last Execution", span: "col-span-2" },
            { label: "Tools", span: "col-span-2" },
          ].map((col) => (
            <div
              key={col.label}
              className={`${col.span} flex items-center gap-1.5 text-[var(--muted-foreground)] text-xs font-semibold uppercase tracking-wider`}
            >
              {col.label}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[var(--border)]">
          <AnimatePresence mode="wait">
            {paginatedAgents.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                  <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] font-medium">
                  No agents match your search
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            ) : (
              paginatedAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleAgentClick(agent.id)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[var(--surface-2)] transition-all cursor-pointer group"
                >
                  {/* Agent Name */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[var(--foreground)] font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {agent.name}
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="col-span-4 flex items-center">
                    <span className="text-[var(--muted-foreground)] text-sm line-clamp-1">
                      {agent.description}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg">
                      <Brain className="w-3 h-3 text-[var(--muted-foreground)]" />
                      <span className="text-[var(--foreground)] text-xs font-medium truncate max-w-[80px]">
                        {agent.model}
                      </span>
                    </div>
                  </div>

                  {/* Last Execution */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-[var(--muted-foreground)] text-sm font-mono">
                      {formatDate(agent.lastExecution)}
                    </span>
                  </div>

                  {/* Tools */}
                  <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                    {agent.tools.slice(0, 2).map((tool) => (
                      <span
                        key={tool.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        {tool.name}
                      </span>
                    ))}
                    {agent.tools.length > 2 && (
                      <span className="px-2 py-0.5 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-md text-[var(--muted-foreground)] text-xs font-medium">
                        +{agent.tools.length - 2}
                      </span>
                    )}
                    {agent.tools.length === 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        —
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--border-strong)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <span>
              {filteredAgents.length === 0
                ? "No results"
                : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filteredAgents.length)} of ${filteredAgents.length}`}
            </span>
            <span className="text-[var(--border-strong)]">·</span>
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--muted-foreground)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
