import type { AgentsResponse } from "@/types/agent";

const API_BASE_URL = "http://localhost:3141";

export async function fetchAgents(
  page: number = 0,
  pageSize: number = 10
): Promise<AgentsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/agents?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          Accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch agents");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
}

export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents?page=0&pageSize=1`, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
