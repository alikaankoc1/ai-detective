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
  /** caseId:result — XP ödülü bir kez verilir (kalıcı) */
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
/** Persist işlemlerini sıraya alır; her yazım anındaki güncel snapshot kullanılır. */
let persistChain: Promise<void> = Promise.resolve();

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
  const safeTotal =
    Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  return {
    totalXp: safeTotal,
    level: levelFromTotalXp(safeTotal),
    solvedCaseIds: [...solvedCaseIds],
    awardedXpKeys: [...awardedXpKeys],
  };
}

/**
 * Legacy: `caseId:result:score` → `caseId:result`
 * Böylece aynı sonuç farklı skorla tekrar XP vermez.
 */
function migrateAwardKey(key: string): string {
  const parts = key.split(":");
  if (parts.length >= 3) {
    const scorePart = parts[parts.length - 1] ?? "";
    if (/^\d+$/.test(scorePart)) {
      return parts.slice(0, -1).join(":");
    }
  }
  return key;
}

function normalizeAwardedKeys(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .filter(
          (key): key is string => typeof key === "string" && key.trim().length > 0
        )
        .map((key) => migrateAwardKey(key.trim()))
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
    typeof data.totalXp === "number" &&
    Number.isFinite(data.totalXp) &&
    data.totalXp > 0
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

/**
 * En son bellek state'ini sırayla yazar.
 * claim + markCaseSolved peş peşe çağrılınca eski snapshot'ın yeniyi ezmesini önler.
 */
function persistProgress(): void {
  persistChain = persistChain
    .catch(() => {
      // Önceki yazım hatası zinciri kırmaz
    })
    .then(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
      } catch {
        // Kalıcılık başarısız olsa da bellek state çalışmaya devam eder
      }
    });
}

/** Test / kapanış öncesi: bekleyen yazımların bitmesini bekle. */
export function flushPlayerProgressPersist(): Promise<void> {
  return persistChain.catch(() => {
    // ignore
  });
}

export function isPlayerProgressHydrated(): boolean {
  return hydrated;
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
      if (writeGeneration !== startedAtGeneration) {
        return snapshot();
      }

      if (!raw) {
        progress = {
          totalXp: INITIAL_PROGRESS.totalXp,
          level: INITIAL_PROGRESS.level,
          solvedCaseIds: [],
          awardedXpKeys: [],
        };
        return snapshot();
      }

      try {
        progress = normalizeStored(JSON.parse(raw) as unknown);
      } catch {
        // Bozuk JSON: bellekte sıfırla ama storage'a boş yazma (üzerine yazma riski yok)
        if (writeGeneration === startedAtGeneration) {
          progress = {
            totalXp: INITIAL_PROGRESS.totalXp,
            level: INITIAL_PROGRESS.level,
            solvedCaseIds: [],
            awardedXpKeys: [],
          };
        }
      }
    } catch {
      // AsyncStorage okuma hatası — çökme yok, varsayılan bellek state
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

/**
 * XP ödül anahtarı: `caseId:result`
 * Skor dahil edilmez — aynı sonuç farklı skorla tekrar XP vermez.
 * `_score` geriye dönük imza uyumu için opsiyonel; yok sayılır.
 */
export function buildCaseResultXpAwardKey(
  caseId: string,
  result: string,
  _score?: number
): string {
  return `${caseId.trim()}:${result.trim()}`;
}

export function hasAwardedCaseResultXp(awardKey: string): boolean {
  const key = migrateAwardKey(awardKey.trim());
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
  persistProgress();
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
  persistProgress();

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
 * Aynı awardKey (caseId:result) için ikinci çağrıda XP eklenmez.
 */
export function claimCaseResultXp(
  awardKey: string,
  amount: number
): ClaimCaseResultXpResult {
  const key = migrateAwardKey(awardKey.trim());
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
  persistProgress();

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

/**
 * Case result sonrası XP + (gerekirse) solved işaretini tek bellek güncellemesinde uygular.
 * Çift persist yarışını azaltır.
 */
export function applyCaseResultProgress(input: {
  caseId: string;
  result: string;
  xpAmount: number;
  markSolved: boolean;
}): ClaimCaseResultXpResult & { markedSolved: boolean } {
  const caseId = input.caseId.trim();
  const awardKey = buildCaseResultXpAwardKey(caseId, input.result);
  const previous = snapshot();
  const alreadyAwarded =
    !awardKey || previous.awardedXpKeys.includes(awardKey);
  const gainedXp =
    alreadyAwarded ||
    !(Number.isFinite(input.xpAmount) && input.xpAmount > 0)
      ? 0
      : Math.floor(input.xpAmount);

  const nextKeys = alreadyAwarded
    ? previous.awardedXpKeys
    : [...previous.awardedXpKeys, awardKey];

  let markedSolved = false;
  let nextSolved = previous.solvedCaseIds;
  if (input.markSolved && caseId && !previous.solvedCaseIds.includes(caseId)) {
    nextSolved = [...previous.solvedCaseIds, caseId];
    markedSolved = true;
  }

  if (gainedXp === 0 && !markedSolved && alreadyAwarded) {
    return {
      previous,
      current: previous,
      gainedXp: 0,
      leveledUp: false,
      detail: getLevelProgress(previous.totalXp),
      claimed: false,
      awardKey,
      markedSolved: false,
    };
  }

  writeGeneration += 1;
  progress = syncLevelFromTotalXp(
    previous.totalXp + gainedXp,
    nextSolved,
    nextKeys
  );
  const current = snapshot();
  persistProgress();

  return {
    previous,
    current,
    gainedXp,
    leveledUp: current.level > previous.level,
    detail: getLevelProgress(current.totalXp),
    claimed: !alreadyAwarded,
    awardKey,
    markedSolved,
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
  persistChain = persistChain
    .catch(() => {})
    .then(async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    });
  return snapshot();
}
