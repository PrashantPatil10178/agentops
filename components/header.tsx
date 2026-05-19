"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  isConnected?: boolean;
}

export function Header({ isConnected = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-strong)] backdrop-blur-xl bg-[var(--surface)]/90"
    >
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--foreground)] font-bold text-base leading-tight tracking-tight">
                AgentOPS
              </span>
              <span className="text-[var(--muted-foreground)] text-[10px] leading-none font-medium tracking-widest uppercase">
                Operations Platform
              </span>
            </div>
          </div>

          {/* Right - Status + Theme Toggle */}
          <div className="flex items-center space-x-2">
            {/* API URL pill */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isConnected
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                }`}
              />
              <span className="hidden sm:inline">localhost:3141</span>
            </div>

            {/* Connection status pill */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isConnected
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
