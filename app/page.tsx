"use client";
import { useState, useEffect } from "react";
import { GridBackground } from "@/components/ui/grid-background";
import { AgentStatusCard } from "@/components/agent-status-card";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { AvailableAgents } from "@/components/available-agents";
import { checkBackendStatus, fetchAgents } from "@/lib/api";
import type { Agent } from "@/types/agent";

export default function Home() {
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add mock dates for last execution
  const addMockExecutionDates = (agents: Agent[]): Agent[] => {
    const dates = [
      "Oct 24, 07:07 AM",
      "Oct 19, 03:39 PM",
      "Oct 19, 03:27 PM",
      "Oct 21, 06:42 PM",
      "Oct 20, 10:46 AM",
      "Oct 24, 01:01 AM",
      "Oct 24, 10:46 AM",
    ];

    return agents.map((agent, index) => ({
      ...agent,
      lastExecution: dates[index] || "Oct 24, 10:46 AM",
    }));
  };

  const checkConnection = async () => {
    setIsLoading(true);
    const isOnline = await checkBackendStatus();
    setIsAgentOnline(isOnline);

    if (isOnline) {
      try {
        const response = await fetchAgents(0, 50);
        if (response.success) {
          setAgents(addMockExecutionDates(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRestart = async () => {
    console.log("Attempting to restart agent...");
    await checkConnection();
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header isConnected={isAgentOnline} />
      {isAgentOnline && <Sidebar />}
      <div className={isAgentOnline ? "ml-64 pt-16" : "pt-16"}>
        {isAgentOnline ? (
          <AvailableAgents agents={agents} />
        ) : (
          <GridBackground>
            <div className="relative z-10 flex items-center justify-center px-4">
              <AgentStatusCard
                isOnline={isAgentOnline}
                onRestart={handleRestart}
              />
            </div>
          </GridBackground>
        )}
      </div>
    </div>
  );
}
