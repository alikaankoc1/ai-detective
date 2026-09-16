import type { ContradictionDefinition } from "./types";

/**
 * Case #004 — tanımlı çelişkiler (nöbet / iz odaklı).
 * Kaynak: Case Engine ifadeleri + deliller (Gemini üretmez).
 */
export const case004Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-c4-cem-log",
    caseId: "case-004",
    suspectId: "suspect-c4-cem",
    relatedEvidenceId: "evidence-c4-shift-log",
    severity: "high",
    relatedStatementIds: ["stmt-c4-cem-1"],
    contradictionDescription:
      "Cem Yıldırım 21:30'dan sonra yalnızca dış kapıda kaldığını ve atölyeye girmediğini söylüyor; nöbet defterindeki 22:10 'atölye iç kontrol' satırı bununla çelişiyor.",
    internalNote:
      "Canon: Cem 22:10'da atölyeye girdi. stmt-c4-cem-1 yalan. Zaman/mekân çelişkisi.",
  },
  {
    id: "contradiction-c4-cem-dust",
    caseId: "case-004",
    suspectId: "suspect-c4-cem",
    relatedEvidenceId: "evidence-c4-tile-dust",
    severity: "high",
    relatedStatementIds: ["stmt-c4-cem-1", "stmt-c4-cem-2"],
    contradictionDescription:
      "Cem Yıldırım atölyeye girmediğini ve üzerinde toz olamayacağını söylüyor; bot tabanındaki atölyeye özgü mavi çini tozu aksini gösteriyor.",
    internalNote:
      "Canon: Cem atölye zemininde yürüdü. Çini tozu fiziksel çelişki.",
  },
  {
    id: "contradiction-c4-cem-glove",
    caseId: "case-004",
    suspectId: "suspect-c4-cem",
    relatedEvidenceId: "evidence-c4-pigment-glove",
    severity: "critical",
    relatedStatementIds: ["stmt-c4-cem-2"],
    contradictionDescription:
      "Cem Yıldırım çiniye dokunmadığını söylüyor; lavabodaki pigment lekeli, aynı seri nöbet eldiveni bununla çelişiyor.",
    internalNote:
      "Canon: Cem eldivenle parçayı aldı. stmt-c4-cem-2 yalan.",
  },
];
