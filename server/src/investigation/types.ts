import type { InvestigationState } from "../../../src/types/investigation";

/** Varsayılan oyuncu anahtarı — Supabase'de auth.uid ile değiştirilir. */
export const DEFAULT_PLAYER_ID = "local-player";

export function createEmptyInvestigationState(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  const now = new Date().toISOString();
  return {
    playerId,
    caseId,
    discoveredEvidenceIds: [],
    interrogatedSuspectIds: [],
    discoveredContradictionIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function investigationStorageKey(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): string {
  return `${playerId}::${caseId}`;
}

/** Tekrar etmeden ekler; eklenirse true döner. */
export function pushUnique(list: string[], id: string): boolean {
  if (list.includes(id)) return false;
  list.push(id);
  return true;
}
