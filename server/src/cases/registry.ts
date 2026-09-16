import type { Case } from "../../../src/types/case";
import type { ContradictionDefinition } from "../contradictions/types";
import { case001 } from "./case001";
import { case002 } from "./case002";
import { case003 } from "./case003";
import { case001Contradictions } from "../contradictions/case001";
import { case002Contradictions } from "../contradictions/case002";
import { case003Contradictions } from "../contradictions/case003";

/**
 * Tek vaka kayıt defteri.
 * Yeni vaka (Case 004+): case dosyası + contradictions + motiveKeywords buraya eklenir.
 */
export type RegisteredCase = {
  caseData: Case;
  contradictions: readonly ContradictionDefinition[];
  /** Solve motive eşlemesi — normalize edilmiş Türkçe anahtarlar */
  motiveKeywords: readonly string[];
};

const CASE_REGISTRY: Record<string, RegisteredCase> = {
  "case-001": {
    caseData: case001,
    contradictions: case001Contradictions,
    motiveKeywords: [
      "sponsor",
      "usulsuz",
      "usb",
      "yayin",
      "aciga",
      "kanit",
      "hesap",
      "engelle",
    ],
  },
  "case-002": {
    caseData: case002,
    contradictions: case002Contradictions,
    motiveKeywords: [
      "kasa",
      "anahtar",
      "borc",
      "cal",
      "para",
      "aidat",
      "nakit",
      "kart",
    ],
  },
  "case-003": {
    caseData: case003,
    contradictions: case003Contradictions,
    motiveKeywords: [
      "usb",
      "belge",
      "musteri",
      "proje",
      "rakip",
      "cal",
      "dosya",
      "sirket",
      "liste",
    ],
  },
};

function assertRegistryIntegrity(registry: Record<string, RegisteredCase>): void {
  const evidenceIds = new Set<string>();
  const suspectIds = new Set<string>();
  const statementIds = new Set<string>();

  for (const [caseId, entry] of Object.entries(registry)) {
    if (entry.caseData.meta.id !== caseId) {
      throw new Error(
        `Case registry mismatch: key=${caseId} meta.id=${entry.caseData.meta.id}`
      );
    }
    if (entry.motiveKeywords.length === 0) {
      throw new Error(`Case ${caseId} has no motiveKeywords`);
    }

    for (const suspect of entry.caseData.suspects) {
      if (suspectIds.has(suspect.id)) {
        throw new Error(`Duplicate suspect id across cases: ${suspect.id}`);
      }
      suspectIds.add(suspect.id);
    }

    for (const evidence of entry.caseData.evidence) {
      if (evidenceIds.has(evidence.id)) {
        throw new Error(`Duplicate evidence id across cases: ${evidence.id}`);
      }
      evidenceIds.add(evidence.id);
    }

    for (const statement of entry.caseData.statements) {
      if (statementIds.has(statement.id)) {
        throw new Error(`Duplicate statement id across cases: ${statement.id}`);
      }
      statementIds.add(statement.id);
    }

    const caseSuspects = new Set(entry.caseData.suspects.map((s) => s.id));
    const caseEvidence = new Set(entry.caseData.evidence.map((e) => e.id));

    for (const item of entry.contradictions) {
      if (item.caseId !== caseId) {
        throw new Error(
          `Contradiction ${item.id} caseId mismatch (expected ${caseId})`
        );
      }
      if (!caseSuspects.has(item.suspectId)) {
        throw new Error(
          `Contradiction ${item.id} references unknown suspect ${item.suspectId}`
        );
      }
      if (!caseEvidence.has(item.relatedEvidenceId)) {
        throw new Error(
          `Contradiction ${item.id} references unknown evidence ${item.relatedEvidenceId}`
        );
      }
    }
  }
}

assertRegistryIntegrity(CASE_REGISTRY);

export function getRegisteredCase(caseId: string): RegisteredCase | null {
  const id = caseId.trim();
  if (!id) return null;
  return CASE_REGISTRY[id] ?? null;
}

export function getSupportedCase(caseId: string): Case | null {
  return getRegisteredCase(caseId)?.caseData ?? null;
}

export function listSupportedCaseIds(): string[] {
  return Object.keys(CASE_REGISTRY);
}

export function isSupportedCaseId(caseId: string): boolean {
  return getRegisteredCase(caseId) !== null;
}

export function getMotiveKeywords(caseId: string): readonly string[] {
  return getRegisteredCase(caseId)?.motiveKeywords ?? [];
}

export function getRegisteredContradictions(
  caseId: string
): readonly ContradictionDefinition[] {
  return getRegisteredCase(caseId)?.contradictions ?? [];
}
