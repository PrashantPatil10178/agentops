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
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-slate-800/30 bg-slate-950/95 backdrop-blur-xl z-40",
        className
      )}
    >
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              item.active
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl backdrop-blur-sm">
        <div className="text-sm text-slate-400 mb-3 font-semibold">
          Quick Stats
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Active Agents</span>
            <span className="text-sm font-semibold text-white">0/6</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">API Calls Today</span>
            <span className="text-sm font-semibold text-white">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Success Rate</span>
            <span className="text-sm font-semibold text-emerald-400">--</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
