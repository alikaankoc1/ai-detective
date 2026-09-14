/**
 * AI Detective — Player Progress store (cihazda AsyncStorage ile kalıcı).
 * Bellek senkron API; uygulama açılışında hydratePlayerProgress() ile yüklenir.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
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

const STORAGE_KEY = "ai-detective.playerProgress.v1";

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

let hydrated = false;
let hydratePromise: Promise<PlayerProgress> | null = null;

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

function normalizeStored(raw: unknown): PlayerProgress {
  if (!raw || typeof raw !== "object") {
    return {
      totalXp: INITIAL_PROGRESS.totalXp,
      level: INITIAL_PROGRESS.level,
      solvedCaseIds: [],
    };
  }

  const data = raw as Partial<PlayerProgress>;
  const totalXp =
    typeof data.totalXp === "number" && Number.isFinite(data.totalXp) && data.totalXp > 0
      ? Math.floor(data.totalXp)
      : 0;

  const solvedCaseIds = Array.isArray(data.solvedCaseIds)
    ? [
        ...new Set(
          data.solvedCaseIds.filter(
            (id): id is string => typeof id === "string" && id.trim().length > 0
          )
        ),
      ]
    : [];

  return syncLevelFromTotalXp(totalXp, solvedCaseIds);
}

async function persistProgress(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
  } catch {
    // Kalıcılık başarısız olsa da bellek state çalışmaya devam eder
  }
}

/**
 * Kayıtlı progress'i AsyncStorage'dan yükler.
 * Tekrar çağrılsa aynı Promise / sonucu kullanır.
 */
export function hydratePlayerProgress(): Promise<PlayerProgress> {
  if (hydrated) {
    return Promise.resolve(snapshot());
  }
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        progress = normalizeStored(JSON.parse(raw) as unknown);
      } else {
        progress = {
          totalXp: INITIAL_PROGRESS.totalXp,
          level: INITIAL_PROGRESS.level,
          solvedCaseIds: [],
        };
      }
    } catch {
      progress = {
        totalXp: INITIAL_PROGRESS.totalXp,
        level: INITIAL_PROGRESS.level,
        solvedCaseIds: [],
      };
    } finally {
      hydrated = true;
    }
    return snapshot();
  })();

  return hydratePromise;
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
  void persistProgress();
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
  void persistProgress();

  return {
    previous,
    current,
    gainedXp,
    leveledUp: current.level > previous.level,
    detail: getLevelProgress(current.totalXp),
  };
}

/** Progress'i başlangıç değerine döndür ve storage'ı temizle. */
export function resetPlayerProgress(): PlayerProgress {
  progress = {
    totalXp: INITIAL_PROGRESS.totalXp,
    level: INITIAL_PROGRESS.level,
    solvedCaseIds: [],
  };
  void (async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  })();
  return snapshot();
}
