/**
 * Vaka çözüm sonucu — oyuncuya güvenli.
 * Canon motive metni, katil açıklaması veya gizli alanlar ASLA burada olmaz.
 */

export type SolveResultKind = "perfect" | "correct" | "wrong";

export type SolveCaseRequest = {
  suspectId: string;
  motive: string;
  evidenceIds: string[];
};

export type SolveCaseResponse = {
  correct: boolean;
  score: number;
  result: SolveResultKind;
};
