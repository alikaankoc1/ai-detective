import { API_BASE_URL } from "@/constants/api";
import type { PlayerSafeCase } from "@/types/case";
import type { ContradictionCheckResult } from "@/types/contradiction";
import type { InvestigationState } from "@/types/investigation";
import type { SolveCaseRequest, SolveCaseResponse } from "@/types/solve";
import { DEFAULT_CASE_ID } from "@/utils/caseRoute";

export async function fetchCase(
  caseId: string = DEFAULT_CASE_ID
): Promise<PlayerSafeCase> {
  const response = await fetch(
    `${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}`
  );

  if (!response.ok) {
    throw new Error(`Vaka alınamadı (${response.status})`);
  }

  return response.json() as Promise<PlayerSafeCase>;
}

/** @deprecated Prefer fetchCase(caseId) */
export async function fetchCase001(): Promise<PlayerSafeCase> {
  return fetchCase(DEFAULT_CASE_ID);
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

export async function checkContradiction(input: {
  caseId: string;
  suspectId: string;
  evidenceId: string;
}): Promise<ContradictionCheckResult> {
  const response = await fetch(`${API_BASE_URL}/api/contradiction/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as
    | ContradictionCheckResult
    | { error?: string };

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : `Çelişki kontrolü başarısız (${response.status})`;
    throw new Error(message);
  }

  return data as ContradictionCheckResult;
}

export async function fetchInvestigationState(
  caseId: string
): Promise<InvestigationState> {
  const response = await fetch(
    `${API_BASE_URL}/api/investigation/${encodeURIComponent(caseId)}`
  );

  const data = (await response.json()) as
    | InvestigationState
    | { error?: string };

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : `Soruşturma durumu alınamadı (${response.status})`;
    throw new Error(message);
  }

  return data as InvestigationState;
}

/** Delil incelemesi — Investigation State'e keşif kaydı. */
export async function discoverCaseEvidence(
  caseId: string,
  evidenceId: string
): Promise<InvestigationState> {
  const response = await fetch(
    `${API_BASE_URL}/api/investigation/${encodeURIComponent(caseId)}/evidence`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ evidenceId }),
    }
  );

  const data = (await response.json()) as
    | InvestigationState
    | { error?: string };

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : `Delil kaydı başarısız (${response.status})`;
    throw new Error(message);
  }

  return data as InvestigationState;
}

export async function submitCaseSolve(
  caseId: string,
  input: SolveCaseRequest
): Promise<SolveCaseResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/solve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = (await response.json()) as
    | SolveCaseResponse
    | { error?: string };

  if (!response.ok) {
    const message =
      "error" in data && data.error
        ? data.error
        : `Vaka çözümü başarısız (${response.status})`;
    throw new Error(message);
  }

  return data as SolveCaseResponse;
}
