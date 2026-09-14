import type { Case, CaseEnding } from "../../../src/types/case";
import type { SolveCaseRequest, SolveCaseResponse } from "../../../src/types/solve";
import { getSupportedCase } from "../interrogation";
import {
  getInvestigationState,
  markSuspectInterrogated,
  discoverEvidence,
} from "../investigation";
import { DEFAULT_PLAYER_ID } from "../investigation/types";
import { solveStore } from "./store";
import type { SolveAttemptRecord, SolveEvaluation } from "./types";

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ğüşıöç\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Motive eşlemesi: oyuncu metni canon motive ile anlamlı anahtar kelimeleri paylaşmalı.
 * Tam metin sızdırılmaz; yalnızca boolean sonuç kullanılır.
 */
function isMotiveAccepted(playerMotive: string, canonMotive: string): boolean {
  const player = normalizeText(playerMotive);
  if (player.length < 8) return false;

  const canon = normalizeText(canonMotive);
  const keywords = [
    "sponsor",
    "usulsuz",
    "usb",
    "yayin",
    "aciga",
    "kanit",
    "hesap",
    "engelle",
  ];

  const presentInCanon = keywords.filter((k) => canon.includes(k));
  const hits = presentInCanon.filter((k) => player.includes(k));
  // Canon'daki anahtarların en az yarısı (min 2) oyuncu metninde olmalı
  const needed = Math.max(2, Math.ceil(presentInCanon.length / 2));
  return hits.length >= needed;
}

function hasAllEvidence(
  submitted: readonly string[],
  required: readonly string[] | undefined
): boolean {
  if (!required || required.length === 0) return false;
  return required.every((id) => submitted.includes(id));
}

function findEnding(
  caseData: Case,
  type: CaseEnding["type"]
): CaseEnding | undefined {
  return caseData.endings.find((ending) => ending.type === type);
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

function evaluateSolve(
  caseData: Case,
  input: SolveCaseRequest,
  discoveredEvidenceIds: readonly string[]
): SolveEvaluation {
  const submittedEvidenceIds = uniqueIds(input.evidenceIds);

  // Sunduğu deliller keşfedilmiş olmalı (Investigation State uyumu)
  const evidenceAllowed = submittedEvidenceIds.every((id) =>
    discoveredEvidenceIds.includes(id)
  );
  const effectiveEvidence = evidenceAllowed
    ? submittedEvidenceIds
    : submittedEvidenceIds.filter((id) => discoveredEvidenceIds.includes(id));

  const killerCorrect = input.suspectId === caseData.canon.killerSuspectId;
  const motiveAccepted = isMotiveAccepted(input.motive, caseData.canon.motive);

  const perfectEnding = findEnding(caseData, "mukemmel_cozum");
  const correctEnding = findEnding(caseData, "dogru_suclama");

  const hasPerfectEvidence = hasAllEvidence(
    effectiveEvidence,
    perfectEnding?.requiredEvidenceIds ?? caseData.canon.criticalEvidenceIds
  );
  const hasCorrectEvidence = hasAllEvidence(
    effectiveEvidence,
    correctEnding?.requiredEvidenceIds
  );

  const perfectSuspect =
    !perfectEnding?.requiredSuspectId ||
    perfectEnding.requiredSuspectId === input.suspectId;
  const correctSuspect =
    !correctEnding?.requiredSuspectId ||
    correctEnding.requiredSuspectId === input.suspectId;

  let result: SolveEvaluation["result"] = "wrong";
  let score = 0;

  if (
    killerCorrect &&
    perfectSuspect &&
    motiveAccepted &&
    hasPerfectEvidence &&
    evidenceAllowed
  ) {
    result = "perfect";
    score = 100;
  } else if (
    killerCorrect &&
    correctSuspect &&
    motiveAccepted &&
    (hasCorrectEvidence || hasPerfectEvidence)
  ) {
    result = "correct";
    // Kritik delil kapsamına göre skor
    const required =
      correctEnding?.requiredEvidenceIds ?? caseData.canon.criticalEvidenceIds;
    const matched = required.filter((id) => effectiveEvidence.includes(id)).length;
    const ratio = required.length > 0 ? matched / required.length : 0;
    score = Math.round(60 + ratio * 25);
  } else if (killerCorrect && motiveAccepted) {
    // Doğru katil + motive ama yetersiz delil
    result = "wrong";
    score = 35;
  } else if (killerCorrect) {
    result = "wrong";
    score = 20;
  } else {
    result = "wrong";
    score = 0;
  }

  return {
    correct: result === "perfect" || result === "correct",
    score,
    result,
    motiveAccepted,
    killerCorrect,
    hasCorrectEvidence,
    hasPerfectEvidence,
  };
}

export function solveCase(
  caseId: string,
  input: SolveCaseRequest,
  playerId: string = DEFAULT_PLAYER_ID
): SolveCaseResponse {
  const caseData = getSupportedCase(caseId);
  if (!caseData) {
    throw new Error("Bu vaka henüz desteklenmiyor. Şimdilik yalnızca case-001.");
  }

  const suspectId = input.suspectId?.trim() ?? "";
  const motive = input.motive?.trim() ?? "";
  const evidenceIds = Array.isArray(input.evidenceIds) ? input.evidenceIds : [];

  if (!suspectId) {
    throw new Error("suspectId zorunludur.");
  }
  if (!motive) {
    throw new Error("motive zorunludur.");
  }
  if (evidenceIds.length === 0) {
    throw new Error("evidenceIds zorunludur.");
  }

  const suspectExists = caseData.suspects.some((s) => s.id === suspectId);
  if (!suspectExists) {
    throw new Error("Şüpheli bu vakada bulunamadı.");
  }

  for (const evidenceId of evidenceIds) {
    if (!caseData.evidence.some((e) => e.id === evidenceId)) {
      throw new Error("Delil bu vakada bulunamadı.");
    }
  }

  const investigation = getInvestigationState(caseId, playerId);
  const evaluation = evaluateSolve(
    caseData,
    { suspectId, motive, evidenceIds },
    investigation.discoveredEvidenceIds
  );

  // Investigation State ile uyum: suçlanan şüpheli + kullanılan deliller kayda geçer
  markSuspectInterrogated(caseId, suspectId, playerId);
  for (const evidenceId of uniqueIds(evidenceIds)) {
    if (investigation.discoveredEvidenceIds.includes(evidenceId)) {
      discoverEvidence(caseId, evidenceId, playerId);
    }
  }

  const record: SolveAttemptRecord = {
    playerId,
    caseId,
    accusedSuspectId: suspectId,
    submittedEvidenceIds: uniqueIds(evidenceIds),
    motiveAccepted: evaluation.motiveAccepted,
    correct: evaluation.correct,
    score: evaluation.score,
    result: evaluation.result,
    createdAt: new Date().toISOString(),
  };
  solveStore.save(record);

  // Yalnızca güvenli alanlar
  return {
    correct: evaluation.correct,
    score: evaluation.score,
    result: evaluation.result,
  };
}

export function getLatestSolve(
  caseId: string,
  playerId: string = DEFAULT_PLAYER_ID
): SolveCaseResponse | null {
  const latest = solveStore.getLatest(caseId, playerId);
  if (!latest) return null;
  return {
    correct: latest.correct,
    score: latest.score,
    result: latest.result,
  };
}
