/**
 * AI Detective — oturum içi Player Progress store.
 * Kalıcı değil (AsyncStorage / Supabase yok); uygulama yeniden açılınca sıfırlanır.
 */

import {
  getLevelProgress,
  levelFromTotalXp,
  type LevelProgress,
} from "@/utils/progression";

export type PlayerProgress = {
  totalXp: number;
  level: number;
  solvedCaseIds: string[];
};

export type AddXpResult = {
  previous: PlayerProgress;
  current: PlayerProgress;
  gainedXp: number;
  leveledUp: boolean;
  /** Mevcut level bandı detayı */
  detail: LevelProgress;
};

const INITIAL_PROGRESS: PlayerProgress = {
  totalXp: 0,
  level: 1,
  solvedCaseIds: [],
};

let progress: PlayerProgress = {
  totalXp: INITIAL_PROGRESS.totalXp,
  level: INITIAL_PROGRESS.level,
  solvedCaseIds: [...INITIAL_PROGRESS.solvedCaseIds],
};

function snapshot(): PlayerProgress {
  return {
    totalXp: progress.totalXp,
    level: progress.level,
    solvedCaseIds: [...progress.solvedCaseIds],
  };
}

function syncLevelFromTotalXp(
  totalXp: number,
  solvedCaseIds: readonly string[]
): PlayerProgress {
  const safeTotal = Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  return {
    totalXp: safeTotal,
    level: levelFromTotalXp(safeTotal),
    solvedCaseIds: [...solvedCaseIds],
  };
}

/** Mevcut progress'i oku (kopya). */
export function getPlayerProgress(): PlayerProgress {
  return snapshot();
}

/** Mevcut progress + level bandı detayı. */
export function getPlayerProgressDetail(): LevelProgress {
  return getLevelProgress(progress.totalXp);
}

/** Çözülmüş vaka ID'leri (kopya). */
export function getSolvedCaseIds(): string[] {
  return [...progress.solvedCaseIds];
}

export function isCaseSolved(caseId: string): boolean {
  const id = caseId.trim();
  if (!id) return false;
  return progress.solvedCaseIds.includes(id);
}

/**
 * Vakayı çözülmüş olarak işaretle.
 * Aynı case tekrar eklenmez. Boş ID yok sayılır.
 * @returns true ise yeni eklendi, false ise zaten vardı / geçersiz
 */
export function markCaseSolved(caseId: string): boolean {
  const id = caseId.trim();
  if (!id) return false;
  if (progress.solvedCaseIds.includes(id)) return false;
  progress = {
    ...progress,
    solvedCaseIds: [...progress.solvedCaseIds, id],
  };
  return true;
}

/**
 * XP ekle; level `progression.ts` ile yeniden hesaplanır.
 * Negatif / NaN değerler yok sayılır (0 eklenir).
 * solvedCaseIds korunur.
 */
export function addPlayerXp(amount: number): AddXpResult {
  const previous = snapshot();
  const gainedXp =
    Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;

  progress = syncLevelFromTotalXp(
    previous.totalXp + gainedXp,
    previous.solvedCaseIds
  );

  const current = snapshot();
  return {
    previous,
    current,
    gainedXp,
    leveledUp: current.level > previous.level,
    detail: getLevelProgress(current.totalXp),
  };
}

/** Progress'i başlangıç değerine döndür. */
export function resetPlayerProgress(): PlayerProgress {
  progress = {
    totalXp: INITIAL_PROGRESS.totalXp,
    level: INITIAL_PROGRESS.level,
    solvedCaseIds: [],
  };
  return snapshot();
}
