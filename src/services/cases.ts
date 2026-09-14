import { API_BASE_URL } from "@/constants/api";
import type { Case } from "@/types/case";

export async function fetchCase001(): Promise<Case> {
  const response = await fetch(`${API_BASE_URL}/api/cases/case-001`);

  if (!response.ok) {
    throw new Error(`Vaka alınamadı (${response.status})`);
  }

  return response.json() as Promise<Case>;
}

export type InterrogationResponse = {
  caseId: string;
  suspectId: string;
  reply: string;
  evidenceId?: string;
};

export async function askSuspect(input: {
  caseId: string;
  suspectId: string;
  playerQuestion?: string;
  evidenceId?: string;
}): Promise<InterrogationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interrogation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as
    | InterrogationResponse
    | { error?: string };

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : `Sorgu başarısız (${response.status})`;
    throw new Error(message);
  }

  return data as InterrogationResponse;
}
