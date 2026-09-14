import type { InvestigationState } from "../../../src/types/investigation";
import {
  createEmptyInvestigationState,
  investigationStorageKey,
  DEFAULT_PLAYER_ID,
} from "./types";

/**
 * Bellek içi store.
 * İleride Supabase repository ile değiştirilebilir (aynı InvestigationStore arayüzü).
 */
export interface InvestigationStore {
  get(caseId: string, playerId?: string): InvestigationState | null;
  set(state: InvestigationState): void;
  reset(caseId: string, playerId?: string): void;
}

class MemoryInvestigationStore implements InvestigationStore {
  private readonly states = new Map<string, InvestigationState>();

  get(
    caseId: string,
    playerId: string = DEFAULT_PLAYER_ID
  ): InvestigationState | null {
    const key = investigationStorageKey(caseId, playerId);
    const existing = this.states.get(key);
    if (!existing) return null;
    // Kopya döndür — dışarıdan mutate edilmesin
    return {
      ...existing,
      discoveredEvidenceIds: [...existing.discoveredEvidenceIds],
      interrogatedSuspectIds: [...existing.interrogatedSuspectIds],
      discoveredContradictionIds: [...existing.discoveredContradictionIds],
    };
  }

  set(state: InvestigationState): void {
    const key = investigationStorageKey(state.caseId, state.playerId);
    this.states.set(key, {
      ...state,
      discoveredEvidenceIds: [...state.discoveredEvidenceIds],
      interrogatedSuspectIds: [...state.interrogatedSuspectIds],
      discoveredContradictionIds: [...state.discoveredContradictionIds],
    });
  }

  reset(caseId: string, playerId: string = DEFAULT_PLAYER_ID): void {
    this.states.delete(investigationStorageKey(caseId, playerId));
  }
}

export const investigationStore: InvestigationStore =
  new MemoryInvestigationStore();

export function getOrCreateInvestigationState(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  const existing = investigationStore.get(caseId, playerId);
  if (existing) return existing;

  const created = createEmptyInvestigationState(caseId, playerId);
  investigationStore.set(created);
  return investigationStore.get(caseId, playerId)!;
}
