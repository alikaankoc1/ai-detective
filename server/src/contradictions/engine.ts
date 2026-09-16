import { getRegisteredContradictions } from "../cases/registry";
import { toCheckResult } from "./types";
import type { ContradictionCheckResult } from "../../../src/types/contradiction";
import type { ContradictionDefinition } from "./types";

/**
 * Case Engine'den bağımsız, backend'de tanımlı Contradiction Engine.
 * Gemini çıktısına bakmaz; yalnızca kayıtlı (suspectId + evidenceId) eşleşmelerine bakar.
 * Çelişki listeleri `server/src/cases/registry.ts` üzerinden gelir.
 */
export function getContradictionsForCase(
  caseId: string
): readonly ContradictionDefinition[] {
  return getRegisteredContradictions(caseId);
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
