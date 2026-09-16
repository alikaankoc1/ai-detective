/**
 * Sorgu jetonu bakiyesi — mağaza UI / ileride kota için.
 * Ödeme ve reklam entegrasyonu yok; sadece yerel sayaç.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ai-detective.queryTokens.v1";

/** Demo ücretsiz başlangıç (günlük kota bağlanınca burası değişir). */
export const DEFAULT_QUERY_TOKENS = 5;

export const SHOP_PACKS = {
  adPlus3: { id: "ad_plus_3", tokens: 3, label: "+3 Sorgu" },
  iapPlus10: { id: "iap_plus_10", tokens: 10, label: "+10 Sorgu" },
  adFree: { id: "ad_free", tokens: 0, label: "Reklamsız paket" },
} as const;

let balance = DEFAULT_QUERY_TOKENS;
let hydrated = false;
let hydratePromise: Promise<number> | null = null;

type Listener = (tokens: number) => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener(balance));
}

export function subscribeQueryTokens(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getQueryTokenBalance(): number {
  return balance;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ balance, updatedAt: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export async function hydrateQueryTokens(): Promise<number> {
  if (hydrated) return balance;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { balance?: unknown };
        if (
          typeof data.balance === "number" &&
          Number.isFinite(data.balance) &&
          data.balance >= 0
        ) {
          balance = Math.floor(data.balance);
        }
      }
    } catch {
      balance = DEFAULT_QUERY_TOKENS;
    }
    hydrated = true;
    notify();
    return balance;
  })();

  return hydratePromise;
}

/** Demo: reklam pack — gerçek AdMob sonra. */
export async function grantDemoAdPack(): Promise<number> {
  await hydrateQueryTokens();
  balance += SHOP_PACKS.adPlus3.tokens;
  notify();
  await persist();
  return balance;
}

/** İleride IAP / tüketim için. */
export async function addQueryTokens(amount: number): Promise<number> {
  await hydrateQueryTokens();
  const n = Math.floor(amount);
  if (n > 0) {
    balance += n;
    notify();
    await persist();
  }
  return balance;
}
