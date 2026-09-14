/**
 * AI Detective — oyuncu progression (XP / Level).
 * Şimdilik saf client-side yardımcı; backend / auth ile bağlanabilir.
 */

export type ProgressionResultKind = "perfect" | "correct" | "wrong";

/** Case Result ekranı ile uyumlu etiketler. */
export type CaseOutcomeLabel = "PERFECT" | "SOLVED" | "FAILED";

export type XpRewardTable = Readonly<Record<CaseOutcomeLabel, number>>;

/** Varsayılan ödül tablosu — ileride balancing için tek kaynak. */
export const CASE_XP_REWARDS: XpRewardTable = {
  PERFECT: 120,
  SOLVED: 80,
  FAILED: 20,
} as const;

/**
 * Level eğrisi: level N'ye çıkmak için gereken *ek* XP.
 * L1→L2: 100, her level +%18 (yumuşak yükseliş).
 * İleride formül veya tablo ile değiştirilebilir.
 */
export const PROGRESSION_CONFIG = {
  baseXpPerLevel: 100,
  growthRate: 1.18,
  minLevel: 1,
} as const;

export type LevelProgress = {
  level: number;
  /** Kariyer boyunca biriken toplam XP */
  totalXp: number;
  /** Mevcut level içinde biriken XP */
  xpIntoLevel: number;
  /** Bu level'den bir sonrakine geçmek için gereken XP */
  xpForNextLevel: number;
  /** Bir sonraki level için kalan XP */
  xpToNextLevel: number;
  /** 0–1 arası doluluk */
  progressRatio: number;
};

function assertNonNegativeXp(totalXp: number): number {
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    return 0;
  }
  return Math.floor(totalXp);
}

/**
 * Level `level` → `level + 1` için gereken XP miktarı.
 * `level` mevcut level (min 1).
 */
export function xpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(PROGRESSION_CONFIG.minLevel, Math.floor(level));
  const { baseXpPerLevel, growthRate } = PROGRESSION_CONFIG;
  const stepsAboveMin = safeLevel - PROGRESSION_CONFIG.minLevel;
  return Math.round(baseXpPerLevel * Math.pow(growthRate, stepsAboveMin));
}

/**
 * Belirli bir level'e *ulaşmış* olmak için gereken toplam XP.
 * Level 1 → 0 XP. Level 3 → L1→L2 + L2→L3 toplamı.
 */
export function totalXpForLevel(level: number): number {
  const target = Math.max(PROGRESSION_CONFIG.minLevel, Math.floor(level));
  let total = 0;
  for (let current = PROGRESSION_CONFIG.minLevel; current < target; current += 1) {
    total += xpRequiredForLevel(current);
  }
  return total;
}

/**
 * Toplam XP → level.
 */
export function levelFromTotalXp(totalXp: number): number {
  const xp = assertNonNegativeXp(totalXp);
  let level = PROGRESSION_CONFIG.minLevel;
  let remaining = xp;

  // Güvenli üst sınır; pratikte XP ile sınırlı kalır
  while (remaining >= xpRequiredForLevel(level) && level < 9999) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  return level;
}

/**
 * Mevcut level içinde biriken XP (0 … xpForNextLevel-1).
 */
export function xpIntoCurrentLevel(totalXp: number): number {
  const xp = assertNonNegativeXp(totalXp);
  const level = levelFromTotalXp(xp);
  return xp - totalXpForLevel(level);
}

/**
 * Bir sonraki level için gereken XP (mevcut level bandının genişliği).
 */
export function xpNeededForNextLevel(totalXp: number): number {
  const level = levelFromTotalXp(totalXp);
  return xpRequiredForLevel(level);
}

/**
 * Bir sonraki level'e kalan XP.
 */
export function xpRemainingToNextLevel(totalXp: number): number {
  const into = xpIntoCurrentLevel(totalXp);
  const needed = xpNeededForNextLevel(totalXp);
  return Math.max(0, needed - into);
}

/**
 * Solve API `result` → Case Result etiketi.
 */
export function outcomeFromSolveResult(
  result: ProgressionResultKind
): CaseOutcomeLabel {
  switch (result) {
    case "perfect":
      return "PERFECT";
    case "correct":
      return "SOLVED";
    case "wrong":
      return "FAILED";
  }
}

/**
 * Case sonucuna göre XP ödülü.
 */
export function xpRewardForOutcome(outcome: CaseOutcomeLabel): number {
  return CASE_XP_REWARDS[outcome];
}

/**
 * Solve `result` alanından doğrudan XP ödülü.
 */
export function xpRewardForSolveResult(result: ProgressionResultKind): number {
  return xpRewardForOutcome(outcomeFromSolveResult(result));
}

/**
 * Toplam XP için tam progression özeti.
 */
export function getLevelProgress(totalXp: number): LevelProgress {
  const safeTotal = assertNonNegativeXp(totalXp);
  const level = levelFromTotalXp(safeTotal);
  const xpIntoLevel = xpIntoCurrentLevel(safeTotal);
  const xpForNextLevel = xpNeededForNextLevel(safeTotal);
  const xpToNextLevel = Math.max(0, xpForNextLevel - xpIntoLevel);
  const progressRatio =
    xpForNextLevel > 0
      ? Math.min(1, Math.max(0, xpIntoLevel / xpForNextLevel))
      : 1;

  return {
    level,
    totalXp: safeTotal,
    xpIntoLevel,
    xpForNextLevel,
    xpToNextLevel,
    progressRatio,
  };
}
