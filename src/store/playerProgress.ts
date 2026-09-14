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
};

let progress: PlayerProgress = { ...INITIAL_PROGRESS };

function snapshot(): PlayerProgress {
  return { totalXp: progress.totalXp, level: progress.level };
}

function syncLevelFromTotalXp(totalXp: number): PlayerProgress {
  const safeTotal = Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  return {
    totalXp: safeTotal,
    level: levelFromTotalXp(safeTotal),
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

/**
 * XP ekle; level `progression.ts` ile yeniden hesaplanır.
 * Negatif / NaN değerler yok sayılır (0 eklenir).
 */
export function addPlayerXp(amount: number): AddXpResult {
  const previous = snapshot();
  const gainedXp =
    Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;

  progress = syncLevelFromTotalXp(previous.totalXp + gainedXp);

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
  progress = { ...INITIAL_PROGRESS };
  return snapshot();
}
