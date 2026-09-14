import { API_BASE_URL } from "@/constants/api";
import type { Case } from "@/types/case";

export async function fetchCase001(): Promise<Case> {
  const response = await fetch(`${API_BASE_URL}/api/cases/case-001`);

  if (!response.ok) {
    throw new Error(`Vaka alınamadı (${response.status})`);
  }

  return response.json() as Promise<Case>;
}
