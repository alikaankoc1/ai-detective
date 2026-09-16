import { Platform } from "react-native";

/**
 * Backend API taban adresi.
 * Android emülatörde `localhost` emülatörün kendisidir; host makine için 10.0.2.2 kullanılır.
 * İsteğe bağlı override: EXPO_PUBLIC_API_BASE_URL
 */
const envBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = envBase && envBase.length > 0
  ? envBase.replace(/\/$/, "")
  : `http://${defaultHost}:3000`;
