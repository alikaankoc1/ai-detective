/**
 * Mobil Supabase istemcisi (anon / publishable key).
 * Service role ASLA burada kullanılmaz — yalnızca sunucu (server/src/supabase.ts).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export function isMobileSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

function createMobileClient(): SupabaseClient {
  if (!isMobileSupabaseConfigured()) {
    throw new Error(
      "Supabase mobil yapılandırması eksik. Kök .env içinde EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY tanımlayın."
    );
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/** Session AsyncStorage'da kalıcı; auth ekranları eklenene kadar lazy kullanılabilir. */
export const supabase: SupabaseClient = createMobileClient();
