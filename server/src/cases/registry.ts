import type { Case } from "../../../src/types/case";
import type { ContradictionDefinition } from "../contradictions/types";
import { case001 } from "./case001";
import { case002 } from "./case002";
import { case003 } from "./case003";
import { case004 } from "./case004";
import { case005 } from "./case005";
import { case001Contradictions } from "../contradictions/case001";
import { case002Contradictions } from "../contradictions/case002";
import { case003Contradictions } from "../contradictions/case003";
import { case004Contradictions } from "../contradictions/case004";
import { case005Contradictions } from "../contradictions/case005";

/**
 * Tek vaka kayıt defteri.
 * Yeni vaka (Case 005+): case dosyası + contradictions + motiveKeywords buraya eklenir.
 *
 * Delil `relatedSuspectIds` dengesi:
 * - case-001..007: öğretici/orta — daha net bağ OK.
 * - case-008+: aynı şüpheli, delillerin yarısından fazlasında görünmesin
 *   (örn. 4 delilde en fazla 2). Registry startup'ta kontrol eder.
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
    // Kayıp Anahtar (kolay)
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
  "case-002": {
    caseData: case002,
    contradictions: case002Contradictions,
    // Son Metro (kolay-orta)
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
  "case-003": {
    caseData: case003,
    contradictions: case003Contradictions,
    // Kırık Çini (orta)
    motiveKeywords: [
      "cini",
      "parca",
      "cal",
      "sat",
      "karaborsa",
      "ihrac",
      "belge",
      "sahte",
      "borc",
    ],
  },
  "case-004": {
    caseData: case004,
    contradictions: case004Contradictions,
    // 03:17'deki Telefon (zor)
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
  "case-005": {
    caseData: case005,
    contradictions: case005Contradictions,
    // Karatay Mührü (orta-zor) — Konya / Karatay
    motiveKeywords: [
      "muhur",
      "arsiv",
      "cal",
      "sat",
      "koleksiyon",
      "envanter",
      "belge",
      "sahte",
      "sevkiyat",
    ],
  },
};

function caseNumberFromId(caseId: string): number | null {
  const match = /^case-(\d+)$/i.exec(caseId.trim());
  if (!match) return null;
  return Number.parseInt(match[1] ?? "", 10);
}

/**
 * case-008+: aynı şüpheli, delillerin yarısından fazlasında relatedSuspectIds'te olmasın.
 * Örn. 4 delil → en fazla 2. (001–007 muaf — öğretici eğri.)
 */
function assertEvidenceSuspectBalance(caseId: string, entry: RegisteredCase): void {
  const num = caseNumberFromId(caseId);
  if (num === null || num < 8) return;

  const evidence = entry.caseData.evidence;
  if (evidence.length === 0) return;

  const maxAllowed = Math.floor(evidence.length / 2);
  const counts = new Map<string, number>();

  for (const item of evidence) {
    const unique = [...new Set(item.relatedSuspectIds)];
    for (const suspectId of unique) {
      counts.set(suspectId, (counts.get(suspectId) ?? 0) + 1);
    }
  }

  for (const [suspectId, count] of counts) {
    if (count > maxAllowed) {
      throw new Error(
        `Case ${caseId}: suspect ${suspectId} appears on ${count}/${evidence.length} evidence ` +
          `(max ${maxAllowed} for case-008+). Spread relatedSuspectIds — too obvious.`
      );
    }
  }
}

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

    assertEvidenceSuspectBalance(caseId, entry);

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
