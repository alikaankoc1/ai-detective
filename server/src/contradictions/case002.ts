import type { ContradictionDefinition } from "./types";

/**
 * Case #002 — tanımlı çelişkiler (zaman çizelgesi odaklı).
 * Kaynak: Case Engine ifadeleri + deliller (Gemini üretmez).
 */
export const case002Contradictions: readonly ContradictionDefinition[] = [
  {
    id: "contradiction-c3-mert-ticket",
    caseId: "case-002",
    suspectId: "suspect-c3-mert",
    relatedEvidenceId: "evidence-c3-tram-ticket",
    severity: "high",
    relatedStatementIds: ["stmt-c3-mert-1"],
    contradictionDescription:
      "Mert Kaya 21:40'tan sonra ayrıldığını ve son tramvaya binmediğini söylüyor; Odunpazarı durağındaki 22:05 damgalı EsTram bileti ise geç bir binişe işaret ediyor.",
    internalNote:
      "Canon: Mert 22:05 tramvayına bindi. stmt-c3-mert-1 yalan. Zaman çizelgesi çelişkisi.",
  },
  {
    id: "contradiction-c3-mert-sleeve",
    caseId: "case-002",
    suspectId: "suspect-c3-mert",
    relatedEvidenceId: "evidence-c3-usb-sleeve",
    severity: "critical",
    relatedStatementIds: ["stmt-c3-mert-2"],
    contradictionDescription:
      "Mert Kaya USB'ye ve şirket kılıfına hiç dokunmadığını söylüyor; yağmurluk cebindeki boş, nemli USB kılıfı bununla çelişiyor.",
    internalNote:
      "Canon: Mert USB'yi aldı, boş kılıf cebinde kaldı. stmt-c3-mert-2 yalan.",
  },
];
