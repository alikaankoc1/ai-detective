import type { Case, Evidence } from "@/types/case";
import type { EvidenceCategory, EvidenceView } from "@/types/evidence-view";

const CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  dijital: "Dijital Kayıt",
  fiziksel: "Fiziksel Nesne",
  iz: "Olay Yeri İzi",
  belge: "Belge / Fiş",
  diger: "Diğer",
};

/** Case Engine'e dokunmadan sunum kategorisi — yalnızca UI/oyun katmanı. */
function resolveCategory(evidenceId: string): EvidenceCategory {
  switch (evidenceId) {
    case "evidence-phone":
    case "evidence-usb":
    case "evidence-debt-sms":
      return "dijital";
    case "evidence-cup":
    case "evidence-key-hook":
    case "evidence-tea-cups":
      return "fiziksel";
    case "evidence-wet-prints":
    case "evidence-c2-hall-prints":
      return "iz";
    case "evidence-bar-receipt":
      return "belge";
    default:
      return "diger";
  }
}

function catalogNumber(order: number): string {
  return `D${order.toString().padStart(2, "0")}`;
}

/**
 * Case Engine Evidence → oyuncu güvenli EvidenceView.
 * `isRedHerring`, katil, motivasyon ve gizli timeline ASLA dahil edilmez.
 */
export function toEvidenceView(
  caseData: Case,
  evidence: Evidence,
  order: number
): EvidenceView {
  const category = resolveCategory(evidence.id);
  const relatedSuspectNames = caseData.suspects
    .filter((s) => evidence.relatedSuspectIds.includes(s.id))
    .map((s) => s.name);

  const examinationNotes = caseData.clues
    .filter((clue) => clue.relatedEvidenceIds.includes(evidence.id))
    .map((clue) => clue.text);

  return {
    id: evidence.id,
    caseId: caseData.meta.id,
    catalogNumber: catalogNumber(order),
    name: evidence.name,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    description: evidence.description,
    discoveryLocation: evidence.discoveryLocation,
    relatedSuspectIds: evidence.relatedSuspectIds,
    relatedSuspectNames,
    examinationNotes,
  };
}

export function buildEvidenceViews(caseData: Case): EvidenceView[] {
  return caseData.evidence.map((item, index) =>
    toEvidenceView(caseData, item, index + 1)
  );
}

export function findEvidenceView(
  caseData: Case,
  evidenceId: string
): EvidenceView | null {
  const index = caseData.evidence.findIndex((item) => item.id === evidenceId);
  if (index < 0) return null;
  return toEvidenceView(caseData, caseData.evidence[index]!, index + 1);
}
