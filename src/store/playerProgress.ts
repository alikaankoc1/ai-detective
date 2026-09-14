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
  /** caseId:result:score — XP ödülü bir kez verilir (kalıcı) */
  awardedXpKeys: string[];
};

export type AddXpResult = {
  previous: PlayerProgress;
  current: PlayerProgress;
  gainedXp: number;
  leveledUp: boolean;
  /** Mevcut level bandı detayı */
  detail: LevelProgress;
};

export type ClaimCaseResultXpResult = AddXpResult & {
  /** false ise bu ödül daha önce verilmişti */
  claimed: boolean;
  awardKey: string;
};

const STORAGE_KEY = "ai-detective.playerProgress.v1";

const INITIAL_PROGRESS: PlayerProgress = {
  totalXp: 0,
  level: 1,
  solvedCaseIds: [],
  awardedXpKeys: [],
};

let progress: PlayerProgress = {
  totalXp: INITIAL_PROGRESS.totalXp,
  level: INITIAL_PROGRESS.level,
  solvedCaseIds: [...INITIAL_PROGRESS.solvedCaseIds],
  awardedXpKeys: [...INITIAL_PROGRESS.awardedXpKeys],
};

let hydrated = false;
let hydratePromise: Promise<PlayerProgress> | null = null;
/** Hydrate sırasında yapılan yazmaların ezilmesini engeller. */
let writeGeneration = 0;

function snapshot(): PlayerProgress {
  return {
    totalXp: progress.totalXp,
    level: progress.level,
    solvedCaseIds: [...progress.solvedCaseIds],
    awardedXpKeys: [...progress.awardedXpKeys],
  };
}

function syncLevelFromTotalXp(
  totalXp: number,
  solvedCaseIds: readonly string[],
  awardedXpKeys: readonly string[]
): PlayerProgress {
  const safeTotal = Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  return {
    totalXp: safeTotal,
    level: levelFromTotalXp(safeTotal),
    solvedCaseIds: [...solvedCaseIds],
    awardedXpKeys: [...awardedXpKeys],
  };
}

function normalizeAwardedKeys(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw.filter(
        (key): key is string => typeof key === "string" && key.trim().length > 0
      )
    ),
  ];
}

function normalizeStored(raw: unknown): PlayerProgress {
  if (!raw || typeof raw !== "object") {
    return {
      totalXp: INITIAL_PROGRESS.totalXp,
      level: INITIAL_PROGRESS.level,
      solvedCaseIds: [],
      awardedXpKeys: [],
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

  const awardedXpKeys = normalizeAwardedKeys(data.awardedXpKeys);

  return syncLevelFromTotalXp(totalXp, solvedCaseIds, awardedXpKeys);
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

  const startedAtGeneration = writeGeneration;

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      // Hydrate bitmeden yazıldıysa storage okumasını uygulama
      if (writeGeneration === startedAtGeneration) {
        if (raw) {
          progress = normalizeStored(JSON.parse(raw) as unknown);
        } else {
          progress = {
            totalXp: INITIAL_PROGRESS.totalXp,
            level: INITIAL_PROGRESS.level,
            solvedCaseIds: [],
            awardedXpKeys: [],
          };
        }
      }
    } catch {
      if (writeGeneration === startedAtGeneration) {
        progress = {
          totalXp: INITIAL_PROGRESS.totalXp,
          level: INITIAL_PROGRESS.level,
          solvedCaseIds: [],
          awardedXpKeys: [],
        };
      }
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

export function buildCaseResultXpAwardKey(
  caseId: string,
  result: string,
  score: number
): string {
  return `${caseId.trim()}:${result.trim()}:${score}`;
}

export function hasAwardedCaseResultXp(awardKey: string): boolean {
  const key = awardKey.trim();
  if (!key) return false;
  return progress.awardedXpKeys.includes(key);
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
  writeGeneration += 1;
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
 * solvedCaseIds / awardedXpKeys korunur.
 */
export function addPlayerXp(amount: number): AddXpResult {
  const previous = snapshot();
  const gainedXp =
    Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;

  writeGeneration += 1;
  progress = syncLevelFromTotalXp(
    previous.totalXp + gainedXp,
    previous.solvedCaseIds,
    previous.awardedXpKeys
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

/**
 * Case Result XP ödülünü kalıcı dedupe ile uygular.
 * Aynı awardKey için ikinci (ve sonraki) çağrılarda XP eklenmez.
 */
export function claimCaseResultXp(
  awardKey: string,
  amount: number
): ClaimCaseResultXpResult {
  const key = awardKey.trim();
  const previous = snapshot();

  if (!key || previous.awardedXpKeys.includes(key)) {
    return {
      previous,
      current: previous,
      gainedXp: 0,
      leveledUp: false,
      detail: getLevelProgress(previous.totalXp),
      claimed: false,
      awardKey: key,
    };
  }

  const gainedXp =
    Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;

  writeGeneration += 1;
  progress = syncLevelFromTotalXp(
    previous.totalXp + gainedXp,
    previous.solvedCaseIds,
    [...previous.awardedXpKeys, key]
  );

  const current = snapshot();
  void persistProgress();

  return {
    previous,
    current,
    gainedXp,
    leveledUp: current.level > previous.level,
    detail: getLevelProgress(current.totalXp),
    claimed: true,
    awardKey: key,
  };
}

/** Progress'i başlangıç değerine döndür ve storage'ı temizle. */
export function resetPlayerProgress(): PlayerProgress {
  writeGeneration += 1;
  progress = {
    totalXp: INITIAL_PROGRESS.totalXp,
    level: INITIAL_PROGRESS.level,
    solvedCaseIds: [],
    awardedXpKeys: [],
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
