/**
 * Tek ekranlık onboarding — cihazda bir kez gösterilir.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ai-detective.onboarding.v1";

let cachedSeen: boolean | null = null;

type Listener = (seen: boolean) => void;
const listeners = new Set<Listener>();

function notify(seen: boolean) {
  cachedSeen = seen;
  listeners.forEach((listener) => listener(seen));
}

export function subscribeOnboarding(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function hasSeenOnboarding(): Promise<boolean> {
  if (cachedSeen !== null) return cachedSeen;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cachedSeen = raw === "1";
    return cachedSeen;
  } catch {
    cachedSeen = false;
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  notify(true);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // bellek bayrağı yine de set
  }
}

/** Test / debug */
export async function resetOnboardingSeen(): Promise<void> {
  notify(false);
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
