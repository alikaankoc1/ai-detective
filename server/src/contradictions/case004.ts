import type { ContradictionDefinition } from "./types";

/**
 * Case #004 — tanımlı çelişkiler.
 * Kaynak: Case Engine ifadeleri + deliller (Gemini üretmez).
 * Açıklamalar oyuncuya güvenli; katil/motivasyon ifşa edilmez.
 */
export const case004Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-ayse-cup",
    caseId: "case-004",
    suspectId: "suspect-ayse",
    relatedEvidenceId: "evidence-cup",
    severity: "high",
    relatedStatementIds: ["stmt-ayse-1"],
    contradictionDescription:
      "Ayşe Demir o gece Kerem'in evine hiç gitmediğini söylüyor; ancak kırık fincan ve ikinci dudak izi, dairede başka birinin çay içtiğini gösteriyor.",
    internalNote:
      "Canon: Ayşe 02:40–03:00 yüzleşmesinde çay içti. stmt-ayse-1 yalan.",
  },
  {
    id: "contradiction-ayse-prints",
    caseId: "case-004",
    suspectId: "suspect-ayse",
    relatedEvidenceId: "evidence-wet-prints",
    severity: "high",
    relatedStatementIds: ["stmt-ayse-1"],
    contradictionDescription:
      "Ayşe saat ikiden sonra evinde uyuduğunu iddia ediyor; olay yerindeki ıslak ayakkabı izleri ise yağmurdan gelen birinin daireye girdiğini ve izlerin 38 numara civarı olduğunu gösteriyor.",
    internalNote:
      "Canon: Ayşe 02:35'te ıslak ayakkabıyla girdi. Baran 43 numara — izler Ayşe ile uyumlu.",
  },
  {
    id: "contradiction-ayse-usb",
    caseId: "case-004",
    suspectId: "suspect-ayse",
    relatedEvidenceId: "evidence-usb",
    severity: "critical",
    relatedStatementIds: ["stmt-ayse-2"],
    contradictionDescription:
      "Ayşe sponsorluk hesaplarında usulsüzlük olmadığını söylüyor; kitaplık arkasındaki USB ve 'sponsor_2025_ayse' notu ise tam tersine işaret ediyor.",
    internalNote:
      "Canon: USB usulsüzlük kanıtı; motivasyonun kaynağı. stmt-ayse-2 yalan. Oyuncuya katil denmez.",
  },
];
