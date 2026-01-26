"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

export const AnimatedTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex space-x-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            activeTab === tab.id
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-slate-800 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};
