import { Platform } from "react-native";

/**
 * Backend API taban adresi.
 *
 * - Development: EXPO_PUBLIC_API_BASE_URL yoksa Android emülatör → 10.0.2.2,
 *   iOS simülatör / web → localhost.
 * - Production / release (__DEV__ false): EXPO_PUBLIC_API_BASE_URL zorunlu;
 *   localhost sessizce kullanılmaz.
 * - Fiziksel telefon (dev): PC’nin LAN IP’si, örn. http://192.168.1.10:3000
 */
const envBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function resolveApiBaseUrl(): string {
  if (envBase && envBase.length > 0) {
    return envBase.replace(/\/$/, "");
  }

  const isDev = typeof __DEV__ === "undefined" ? true : __DEV__;
  if (!isDev) {
    console.error(
      "[AI Detective] EXPO_PUBLIC_API_BASE_URL production'da zorunlu. localhost kullanılmıyor."
    );
    return "";
  }

  const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${defaultHost}:3000`;
}

export const API_BASE_URL = resolveApiBaseUrl();
