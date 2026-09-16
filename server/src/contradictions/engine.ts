import { case001Contradictions } from "./case001";
import { case002Contradictions } from "./case002";
import {
  toCheckResult,
  type ContradictionDefinition,
} from "./types";
import type { ContradictionCheckResult } from "../../../src/types/contradiction";

const contradictionRegistry: Record<
  string,
  readonly ContradictionDefinition[]
> = {
  "case-001": case001Contradictions,
  "case-002": case002Contradictions,
};

/**
 * Case Engine'den bağımsız, backend'de tanımlı Contradiction Engine.
 * Gemini çıktısına bakmaz; yalnızca kayıtlı (suspectId + evidenceId) eşleşmelerine bakar.
 */
export function getContradictionsForCase(
  caseId: string
): readonly ContradictionDefinition[] {
  return contradictionRegistry[caseId] ?? [];
}

export function findContradiction(
  caseId: string,
  suspectId: string,
  relatedEvidenceId: string
): ContradictionDefinition | null {
  const list = getContradictionsForCase(caseId);
  return (
    list.find(
      (item) =>
        item.suspectId === suspectId &&
        item.relatedEvidenceId === relatedEvidenceId
    ) ?? null
  );
}

/**
 * Oyuncunun seçtiği şüpheli + delil kombinasyonunu kontrol eder.
 * Sonuç oyuncuya güvenli alanlarla döner (internalNote / statement ID'leri yok).
 */
export function checkContradiction(
  caseId: string,
  suspectId: string,
  relatedEvidenceId: string
): ContradictionCheckResult {
  const match = findContradiction(caseId, suspectId, relatedEvidenceId);
  return toCheckResult(match);
}
