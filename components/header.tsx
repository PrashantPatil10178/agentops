"use client";
import React from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  isConnected?: boolean;
}

export function Header({ isConnected = false }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/30 backdrop-blur-xl bg-slate-950/95"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-white font-semibold text-base">
                AgentOPS
              </span>
            </div>
          </div>

          {/* Center - Project Name */}

          {/* Right - Status */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                isConnected
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                }`}
              ></div>
              <span
                className={`text-xs font-medium ${
                  isConnected ? "text-emerald-400" : "text-red-400"
                }`}
              >
                http://localhost:3141
              </span>
            </div>
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                isConnected
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-xs font-medium ${
                  isConnected ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
