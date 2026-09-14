import type { SolveCaseResponse, SolveResultKind } from "../../../src/types/solve";

/** Bellekte tutulan çözüm kaydı — ileride Supabase'e taşınabilir. */
export type SolveAttemptRecord = {
  playerId: string;
  caseId: string;
  accusedSuspectId: string;
  submittedEvidenceIds: string[];
  motiveAccepted: boolean;
  correct: boolean;
  score: number;
  result: SolveResultKind;
  createdAt: string;
};

export type SolveEvaluation = SolveCaseResponse & {
  motiveAccepted: boolean;
  killerCorrect: boolean;
  hasCorrectEvidence: boolean;
  hasPerfectEvidence: boolean;
};
