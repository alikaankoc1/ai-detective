import type { ContradictionDefinition } from "./types";

/**
 * Case #001 — tanımlı çelişkiler (kolay vaka: 2 net çelişki).
 * Kaynak: Case Engine ifadeleri + deliller (Gemini üretmez).
 * Açıklamalar oyuncuya güvenli; suçlu/motivasyon ifşa edilmez.
 */
export const case001Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-deniz-prints",
    caseId: "case-001",
    suspectId: "suspect-deniz",
    relatedEvidenceId: "evidence-c2-hall-prints",
    severity: "high",
    relatedStatementIds: ["stmt-deniz-1"],
    contradictionDescription:
      "Deniz Acar anahtar askısına hiç yaklaşmadığını ve yağmurdan ıslanmadığını söylüyor; ancak askının önündeki ıslak ayak izleri holde birinin durduğunu gösteriyor.",
    internalNote:
      "Canon: Deniz 19:20–19:25 askıdan anahtarı aldı; ayakkabıları ıslaktı. stmt-deniz-1 yalan.",
  },
  {
    id: "contradiction-deniz-debt",
    caseId: "case-001",
    suspectId: "suspect-deniz",
    relatedEvidenceId: "evidence-debt-sms",
    severity: "medium",
    relatedStatementIds: ["stmt-deniz-2"],
    contradictionDescription:
      "Deniz Acar parayla ilgili sıkıntısı olmadığını söylüyor; telefonundaki vadesi geçmiş borç SMS'i ise tam tersini gösteriyor.",
    internalNote:
      "Canon: Motivasyon borç baskısı. stmt-deniz-2 yalan. Oyuncuya suçlu denmez.",
  },
];
