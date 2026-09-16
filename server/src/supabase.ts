/**
 * Supabase sunucu istemcisi — yalnızca backend.
 *
 * Service role key ASLA mobil uygulamaya veya public API yanıtına konmaz.
 * Tablo / auth / migration bu modülde yok; yalnızca bağlantı altyapısı.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

/** URL + service role tanımlı mı? (Gemini vb. sistemler bundan bağımsız çalışır.) */
export function isSupabaseConfigured(): boolean {
  return Boolean(readEnv("SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

/**
 * Sunucu tarafı Supabase admin istemcisi (service role).
 * Eksik env → açık hata; mevcut Case Engine / Gemini akışlarını bozmaz
 * (yalnızca bu fonksiyon çağrıldığında fırlatır).
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase yapılandırılmamış. server/.env içinde SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlayın."
    );
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseAdmin;
}

export type SupabaseConnectionStatus = {
  configured: boolean;
  connected: boolean;
  error?: string;
};

/**
 * Tablo/auth/migration olmadan bağlantı doğrulama.
 * Service role ile hafif Auth Admin çağrısı; yanıt/log'a secret koyulmaz.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      error:
        "Supabase yapılandırılmamış. server/.env içinde SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlayın.",
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      return {
        configured: true,
        connected: false,
        error: "Supabase bağlantısı başarısız. URL ve service role key değerlerini kontrol edin.",
      };
    }

    return { configured: true, connected: true };
  } catch {
    return {
      configured: true,
      connected: false,
      error: "Supabase bağlantısı başarısız. URL ve service role key değerlerini kontrol edin.",
    };
  }
}
