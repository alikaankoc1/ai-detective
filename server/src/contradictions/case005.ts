import type { ContradictionDefinition } from "./types";

/**
 * Case #005 — tanımlı çelişkiler (kamera / balmumu odaklı).
 * Kaynak: Case Engine ifadeleri + deliller (Gemini üretmez).
 */
export const case005Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-c5-deniz-gap",
    caseId: "case-005",
    suspectId: "suspect-c5-deniz",
    relatedEvidenceId: "evidence-c5-camera-gap",
    severity: "high",
    relatedStatementIds: ["stmt-c5-deniz-1"],
    contradictionDescription:
      "Deniz Uçar 22:50'den sonra çıktığını ve gece dönmediğini söylüyor; 23:40 kamera boşluğuna kendi koduyla düşülen 'bakım' notu bununla çelişiyor.",
    internalNote:
      "Canon: Deniz 23:40'ta geri döndü. stmt-c5-deniz-1 yalan. Zaman/mekân çelişkisi.",
  },
  {
    id: "contradiction-c5-deniz-wax",
    caseId: "case-005",
    suspectId: "suspect-c5-deniz",
    relatedEvidenceId: "evidence-c5-wax-glove",
    severity: "critical",
    relatedStatementIds: ["stmt-c5-deniz-2"],
    contradictionDescription:
      "Deniz Uçar mühre dokunmadığını ve üzerinde balmumu olamayacağını söylüyor; lavabodaki aynı seri balmumulu eldiven aksini gösteriyor.",
    internalNote:
      "Canon: Deniz eldivenle mührü aldı. stmt-c5-deniz-2 yalan.",
  },
  {
    id: "contradiction-c5-deniz-slip",
    caseId: "case-005",
    suspectId: "suspect-c5-deniz",
    relatedEvidenceId: "evidence-c5-packing-slip",
    severity: "high",
    relatedStatementIds: ["stmt-c5-deniz-1", "stmt-c5-deniz-2"],
    contradictionDescription:
      "Deniz gece işlemi olmadığını ima ediyor; çantasındaki gece teslim tarihli sahte paket fişi bununla çelişiyor.",
    internalNote:
      "Canon: Deniz özel sevkiyat için fiş hazırladı. Motivasyon delili.",
  },
];
