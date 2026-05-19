"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Bot,
  Activity,
  BarChart3,
  FileText,
  Users,
  Workflow,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: Rocket, label: "Home", active: false },
  { icon: Bot, label: "Agents", active: true },
  { icon: Activity, label: "Sessions", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: FileText, label: "Logs", active: false },
  { icon: Users, label: "Team", active: false },
  { icon: Workflow, label: "Workflows", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-[var(--border-strong)] bg-[var(--surface)]/95 backdrop-blur-xl z-40",
        className,
      )}
    >
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left w-full cursor-pointer",
              item.active
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-transparent",
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="absolute bottom-4 left-3 right-3">
        <div className="p-4 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-xl">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wider">
            Quick Stats
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--muted-foreground)]">Active Agents</span>
              <span className="text-xs font-semibold text-[var(--foreground)]">
                0/6
              </span>
            </div>
            <div className="w-full h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
              <div className="h-full w-0 bg-emerald-500 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--muted-foreground)]">
                API Calls Today
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)]">
                0
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--muted-foreground)]">Success Rate</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                --
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
