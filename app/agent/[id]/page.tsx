"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAgentDetail } from "@/lib/observability-api";
import type { AgentDetail } from "@/types/observability";
import { AgentObservability } from "@/components/agent-observability";
import { Loader2 } from "lucide-react";

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgent = async () => {
      try {
        setLoading(true);
        const agentId = params.id as string;
        const response = await fetchAgentDetail(agentId);
        if (response.success && response.data) {
          setAgent(response.data);
        } else {
          setError("Failed to load agent details");
        }
      } catch (err) {
        setError("Failed to load agent details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadAgent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-[var(--muted-foreground)]">
            Loading agent details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Agent not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <AgentObservability agent={agent} onClose={() => router.push("/")} />;
}
