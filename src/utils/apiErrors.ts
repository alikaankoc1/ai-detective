/**
 * Ağ / Gemini hatalarını oyuncuya anlaşılır Türkçe mesaja çevirir.
 * Ham stack / JSON / localhost ipuçlarını mümkün olduğunca yumuşatır.
 */

const NETWORK_RE =
  /network request failed|failed to fetch|networkerror|network error|econnrefused|enotfound|etimedout|socket hang up|aborted/i;

const GEMINI_QUOTA_RE =
  /429|resource_exhausted|quota|rate-?limit|kota|ücretsiz kotası/i;

const GEMINI_KEY_RE = /api key|permission|yetkisiz|geçersiz.*anahtar|GEMINI_API_KEY/i;

const GEMINI_BUSY_RE =
  /gemini|yapay zeka|boş ifade|meşgul|overloaded|unavailable|503|502/i;

export function toPlayerApiError(
  error: unknown,
  fallback = "Beklenmeyen bir hata oluştu."
): string {
  if (error instanceof Error && error.message.trim()) {
    return mapApiErrorMessage(error.message) ?? error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return mapApiErrorMessage(error) ?? error;
  }
  return fallback;
}

export function mapHttpError(
  status: number,
  serverMessage?: string
): string {
  if (serverMessage?.trim()) {
    return mapApiErrorMessage(serverMessage) ?? serverMessage.trim();
  }

  if (status === 429) {
    return "Çok fazla istek. Birkaç saniye bekle, sonra tekrar dene.";
  }
  if (status === 404) {
    return "İstenen kayıt bulunamadı. Vaka veya sunucu adresini kontrol et.";
  }
  if (status >= 500) {
    return "Sunucu şu an yanıt veremiyor. Kısa süre sonra tekrar dene.";
  }
  return `İstek başarısız (${status}).`;
}

export function mapApiErrorMessage(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  if (NETWORK_RE.test(text)) {
    return (
      "Sunucuya bağlanılamadı. İnternetini kontrol et. " +
      "Fiziksel telefonda EXPO_PUBLIC_API_BASE_URL olarak bilgisayarının LAN adresini yaz " +
      "(örn. http://192.168.1.10:3000)."
    );
  }

  if (/api adresi tanımlı değil|EXPO_PUBLIC_API_BASE_URL/i.test(text)) {
    return (
      "API adresi eksik. Production için EXPO_PUBLIC_API_BASE_URL zorunlu " +
      "(localhost kullanılmaz)."
    );
  }

  if (GEMINI_QUOTA_RE.test(text)) {
    return (
      "Sorgu servisi kotası doldu. Birkaç dakika sonra tekrar dene."
    );
  }

  if (GEMINI_KEY_RE.test(text)) {
    return (
      "Sorgu servisi yapılandırması hatalı. Geliştirici GEMINI_API_KEY ayarını kontrol etmeli."
    );
  }

  // Sunucudan gelen oyuncu-dostu Gemini metinlerini olduğu gibi bırak
  if (
    text.includes("Gemini") ||
    text.includes("yapay zeka") ||
    text.includes("Şüpheli şu an")
  ) {
    return text;
  }

  if (GEMINI_BUSY_RE.test(text) && (text.includes('"error"') || text.length > 200)) {
    return "Şüpheli şu an cevap veremiyor. Kısa süre sonra tekrar dene.";
  }

  return null;
}
