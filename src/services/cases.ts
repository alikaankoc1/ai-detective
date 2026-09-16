import { API_BASE_URL } from "@/constants/api";
import { mapHttpError, toPlayerApiError } from "@/utils/apiErrors";
import type { PlayerSafeCase } from "@/types/case";
import type { ContradictionCheckResult } from "@/types/contradiction";
import type { InvestigationState } from "@/types/investigation";
import type { SolveCaseRequest, SolveCaseResponse } from "@/types/solve";
import { DEFAULT_CASE_ID } from "@/utils/caseRoute";

function requireApiBase(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "API adresi tanımlı değil. EXPO_PUBLIC_API_BASE_URL ayarla."
    );
  }
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = requireApiBase();
  try {
    return await fetch(`${base}${path}`, init);
  } catch (error) {
    throw new Error(toPlayerApiError(error, "Sunucuya bağlanılamadı."));
  }
}

async function readJsonBody<T>(response: Response): Promise<T | { error?: string }> {
  try {
    return (await response.json()) as T | { error?: string };
  } catch {
    throw new Error(
      mapHttpError(response.status, "Sunucu beklenmeyen bir yanıt döndürdü.")
    );
  }
}

function throwIfNotOk(
  response: Response,
  data: unknown,
  fallback: string
): void {
  if (response.ok) return;
  const errorMessage =
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : fallback;
  throw new Error(mapHttpError(response.status, errorMessage));
}

export async function fetchCase(
  caseId: string = DEFAULT_CASE_ID
): Promise<PlayerSafeCase> {
  const response = await apiFetch(
    `/api/cases/${encodeURIComponent(caseId)}`
  );
  const data = await readJsonBody<PlayerSafeCase>(response);
  throwIfNotOk(response, data, `Vaka alınamadı (${response.status})`);
  return data as PlayerSafeCase;
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
  const response = await apiFetch(`/api/interrogation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await readJsonBody<InterrogationResponse>(response);
  throwIfNotOk(
    response,
    data,
    `Sorgu başarısız (${response.status})`
  );
  return data as InterrogationResponse;
}

export async function checkContradiction(input: {
  caseId: string;
  suspectId: string;
  evidenceId: string;
}): Promise<ContradictionCheckResult> {
  const response = await apiFetch(`/api/contradiction/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await readJsonBody<ContradictionCheckResult>(response);
  throwIfNotOk(
    response,
    data,
    `Çelişki kontrolü başarısız (${response.status})`
  );
  return data as ContradictionCheckResult;
}

export async function fetchInvestigationState(
  caseId: string
): Promise<InvestigationState> {
  const response = await apiFetch(
    `/api/investigation/${encodeURIComponent(caseId)}`
  );

  const data = await readJsonBody<InvestigationState>(response);
  throwIfNotOk(
    response,
    data,
    `Soruşturma durumu alınamadı (${response.status})`
  );
  return data as InvestigationState;
}

/** Delil incelemesi — Investigation State'e keşif kaydı. */
export async function discoverCaseEvidence(
  caseId: string,
  evidenceId: string
): Promise<InvestigationState> {
  const response = await apiFetch(
    `/api/investigation/${encodeURIComponent(caseId)}/evidence`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ evidenceId }),
    }
  );

  const data = await readJsonBody<InvestigationState>(response);
  throwIfNotOk(
    response,
    data,
    `Delil kaydı başarısız (${response.status})`
  );
  return data as InvestigationState;
}

export async function submitCaseSolve(
  caseId: string,
  input: SolveCaseRequest
): Promise<SolveCaseResponse> {
  const response = await apiFetch(
    `/api/cases/${encodeURIComponent(caseId)}/solve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data = await readJsonBody<SolveCaseResponse>(response);
  throwIfNotOk(
    response,
    data,
    `Vaka çözümü başarısız (${response.status})`
  );
  return data as SolveCaseResponse;
}

/** Smoke / bağlantı kontrolü — GET /health */
export async function pingApiHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await apiFetch(`/health`);
    if (!response.ok) {
      return {
        ok: false,
        message: mapHttpError(response.status),
      };
    }
    return { ok: true, message: "API hazır" };
  } catch (error) {
    return {
      ok: false,
      message: toPlayerApiError(error, "Sunucuya bağlanılamadı."),
    };
  }
}
