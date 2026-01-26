"use client";
import React from "react";
import { CardSpotlight } from "./ui/card-spotlight";
import { Button } from "./ui/button";
import { ServerOff, RefreshCw, Terminal } from "lucide-react";
import { motion } from "framer-motion";

interface AgentStatusCardProps {
  isOnline: boolean;
  onRestart?: () => void;
}

export function AgentStatusCard({ isOnline, onRestart }: AgentStatusCardProps) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl relative"
    >
      {/* Failed to fetch message - top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute -top-12 right-0 text-right text-sm text-slate-500 z-50"
      >
        <p className="font-medium">Failed to fetch</p>
        <p className="text-xs">
          Cannot connect to{" "}
          <span className="text-emerald-400">http://localhost:3141</span>
        </p>
      </motion.div>

      <CardSpotlight className="p-16">
        <div className="flex flex-col items-center justify-center space-y-6 relative">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-2"
          >
            <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full scale-150"></div>
            <div className="relative bg-linear-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
              <ServerOff
                className="w-16 h-16 text-emerald-400"
                strokeWidth={1.5}
              />
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm font-medium">
              Local API Disconnected
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold text-white text-center tracking-tight"
          >
            Is your server running?
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 text-center text-base -mt-2"
          >
            Check if you've started:
          </motion.p>

          {/* Command */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-950/80 border border-slate-700/50 rounded-xl px-8 py-4 flex items-center space-x-3 backdrop-blur-sm shadow-lg"
          >
            <Terminal className="w-5 h-5 text-emerald-400" />
            <code className="text-emerald-400 font-mono text-base font-medium">
              pnpm run dev
            </code>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center space-x-4 pt-6"
          >
            <Button
              variant="default"
              size="lg"
              onClick={onRestart}
              className="group px-12"
            >
              Yes
            </Button>
            <Button variant="outline" size="lg" className="px-12">
              No
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center space-x-2 text-slate-500 text-sm pt-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Need help? Join Discord</span>
          </motion.div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}
