import type { ContradictionDefinition } from "./types";

/**
 * Case #006 — Alsancak Saati çelişkileri.
 */
export const case006Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-c6-ruzgar-log",
    caseId: "case-006",
    suspectId: "suspect-c6-ruzgar",
    relatedEvidenceId: "evidence-c6-desk-log",
    severity: "high",
    relatedStatementIds: ["stmt-c6-ruzgar-1"],
    contradictionDescription:
      "Rüzgar Demir 01:00'den sonra yalnızca bankoda kaldığını ve kasaya girmediğini söylüyor; 01:20 'kasa kontrol' oturumu bununla çelişiyor.",
    internalNote:
      "Canon: Rüzgar 01:20'de kasa nişine girdi. stmt-c6-ruzgar-1 yalan.",
  },
  {
    id: "contradiction-c6-ruzgar-prints",
    caseId: "case-006",
    suspectId: "suspect-c6-ruzgar",
    relatedEvidenceId: "evidence-c6-wet-prints",
    severity: "high",
    relatedStatementIds: ["stmt-c6-ruzgar-1", "stmt-c6-ruzgar-2"],
    contradictionDescription:
      "Rüzgar Demir kasaya yaklaşmadığını ve ıslak iz bırakamayacağını söylüyor; kasa önündeki ayakkabı izi aksini gösteriyor.",
    internalNote: "Canon: Rüzgar yağmur ıslaklığıyla kasa nişine yürüdü.",
  },
  {
    id: "contradiction-c6-ruzgar-note",
    caseId: "case-006",
    suspectId: "suspect-c6-ruzgar",
    relatedEvidenceId: "evidence-c6-buyer-sms",
    severity: "critical",
    relatedStatementIds: ["stmt-c6-ruzgar-2"],
    contradictionDescription:
      "Rüzgar saate dokunmadığını ima ediyor; cebindeki gece teslim tarihli alıcı notu bununla çelişiyor.",
    internalNote: "Canon: Rüzgar alıcıya satmak için saati çaldı.",
  },
];
