import type {
  ContradictionCheckResult,
  ContradictionSeverity,
  PlayerSafeContradiction,
} from "../../../src/types/contradiction";

/**
 * Backend'de tanımlı çelişki kaydı.
 * Case Engine ID'lerine referans verir; Case Engine verisini değiştirmez.
 * `internalNote` ve ifade referansları yalnızca sunucuda kalır.
 */
export type ContradictionDefinition = {
  id: string;
  caseId: string;
  suspectId: string;
  relatedEvidenceId: string;
  contradictionDescription: string;
  severity: ContradictionSeverity;
  /** Dahili: hangi ifadenin delille çeliştiği — mobil'e çıkmaz */
  relatedStatementIds?: readonly string[];
  /** Dahili tasarım notu — mobil'e çıkmaz */
  internalNote?: string;
};

export function toPlayerSafeContradiction(
  definition: ContradictionDefinition
): PlayerSafeContradiction {
  return {
    id: definition.id,
    suspectId: definition.suspectId,
    relatedEvidenceId: definition.relatedEvidenceId,
    contradictionDescription: definition.contradictionDescription,
    severity: definition.severity,
  };
}

export function toCheckResult(
  definition: ContradictionDefinition | null
): ContradictionCheckResult {
  if (!definition) {
    return { found: false, contradiction: null };
  }

  return {
    found: true,
    contradiction: toPlayerSafeContradiction(definition),
  };
}
