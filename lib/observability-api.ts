import type {
  ObservabilityResponse,
  AgentDetail,
  UpdatesResponse,
  TracesResponse,
} from "@/types/observability";

const API_BASE_URL = "http://localhost:3141";

export async function fetchObservabilityStatus(): Promise<ObservabilityResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/observability/status`, {
      headers: { Accept: "*/*" },
    });
    if (!response.ok) throw new Error("Failed to fetch observability status");
    return await response.json();
  } catch (error) {
    console.error("Error fetching observability status:", error);
    throw error;
  }
}

export async function fetchAgentDetail(
  agentId: string
): Promise<{ success: boolean; data: AgentDetail }> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
      headers: { Accept: "*/*" },
    });
    if (!response.ok) throw new Error("Failed to fetch agent detail");
    return await response.json();
  } catch (error) {
    console.error("Error fetching agent detail:", error);
    throw error;
  }
}

export async function fetchUpdates(): Promise<UpdatesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/updates`, {
      headers: { Accept: "*/*" },
    });
    if (!response.ok) throw new Error("Failed to fetch updates");
    return await response.json();
  } catch (error) {
    console.error("Error fetching updates:", error);
    throw error;
  }
}

export async function fetchTraces(
  entityId: string,
  entityType: string = "agent"
): Promise<TracesResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/observability/traces?entityId=${entityId}&entityType=${entityType}`,
      {
        headers: { Accept: "*/*" },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch traces");
    return await response.json();
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error;
  }
}
