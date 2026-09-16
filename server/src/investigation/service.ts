import { getSupportedCase } from "../cases/registry";
import {
  getOrCreateInvestigationState,
  investigationStore,
} from "./store";
import { pushUnique, DEFAULT_PLAYER_ID } from "./types";
import type { InvestigationState } from "../../../src/types/investigation";

function touch(state: InvestigationState): InvestigationState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  };
}

function assertCaseSupported(caseId: string) {
  const caseData = getSupportedCase(caseId);
  if (!caseData) {
    throw new Error("Bu vaka henüz desteklenmiyor.");
  }
  return caseData;
}

export function getInvestigationState(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  assertCaseSupported(caseId);
  return getOrCreateInvestigationState(caseId, playerId);
}

export function discoverEvidence(
  caseId: string,
  evidenceId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  const caseData = assertCaseSupported(caseId);
  const exists = caseData.evidence.some((item) => item.id === evidenceId);
  if (!exists) {
    throw new Error("Delil bu vakada bulunamadı.");
  }

  const state = getOrCreateInvestigationState(caseId, playerId);
  pushUnique(state.discoveredEvidenceIds, evidenceId);
  const next = touch(state);
  investigationStore.set(next);
  return investigationStore.get(caseId, playerId)!;
}

export function markSuspectInterrogated(
  caseId: string,
  suspectId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  const caseData = assertCaseSupported(caseId);
  const exists = caseData.suspects.some((item) => item.id === suspectId);
  if (!exists) {
    throw new Error("Şüpheli bu vakada bulunamadı.");
  }

  const state = getOrCreateInvestigationState(caseId, playerId);
  pushUnique(state.interrogatedSuspectIds, suspectId);
  const next = touch(state);
  investigationStore.set(next);
  return investigationStore.get(caseId, playerId)!;
}

export function discoverContradiction(
  caseId: string,
  contradictionId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  assertCaseSupported(caseId);

  const state = getOrCreateInvestigationState(caseId, playerId);
  pushUnique(state.discoveredContradictionIds, contradictionId);
  const next = touch(state);
  investigationStore.set(next);
  return investigationStore.get(caseId, playerId)!;
}

export function resetInvestigationState(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): InvestigationState {
  assertCaseSupported(caseId);
  investigationStore.reset(caseId, playerId);
  return getOrCreateInvestigationState(caseId, playerId);
}
