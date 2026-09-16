/** Expo Router params bazen string[] gelir. */
export function firstRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Varsayılan / öne çıkan vaka (ana ekran). */
export const DEFAULT_CASE_ID = "case-001";

/**
 * Vaka kilit önkoşulları.
 * Case 004+: buraya yeni satır ekle.
 */
export const CASE_UNLOCK_REQUIRES: Record<string, readonly string[]> = {
  "case-001": [],
  "case-002": ["case-001"],
  "case-003": ["case-002"],
  "case-004": ["case-003"],
  "case-005": ["case-004"],
};

/** Route paramından caseId çöz; yoksa Case 001. */
export function resolveCaseId(
  value: string | string[] | undefined
): string {
  const raw = firstRouteParam(value)?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_CASE_ID;
}

/**
 * Vaka erişim kapısı (UI kilidiyle uyumlu).
 * Bilinmeyen / katalogda olmayan vakalar oynanamaz.
 */
export function isCasePlayable(
  caseId: string,
  solvedCaseIds: readonly string[]
): boolean {
  const required = CASE_UNLOCK_REQUIRES[caseId];
  if (!required) return false;
  return required.every((id) => solvedCaseIds.includes(id));
}

/** Katalogda bilinen (henüz kilitli olsa da) vaka mı? */
export function isKnownCaseId(caseId: string): boolean {
  return Object.prototype.hasOwnProperty.call(CASE_UNLOCK_REQUIRES, caseId);
}

/** Oynanış sırası (kolay → zor). */
export const CASE_PLAY_ORDER: readonly string[] = Object.keys(
  CASE_UNLOCK_REQUIRES
);

/**
 * Anasayfa odak vakası: ilk çözülmemiş + oynanabilir dosya.
 * Hepsi çözüldüyse son vakayı döner.
 */
export function getHomeFocusCaseId(
  solvedCaseIds: readonly string[]
): string {
  for (const id of CASE_PLAY_ORDER) {
    if (isCasePlayable(id, solvedCaseIds) && !solvedCaseIds.includes(id)) {
      return id;
    }
  }
  return CASE_PLAY_ORDER[CASE_PLAY_ORDER.length - 1] ?? DEFAULT_CASE_ID;
}

/** UI kilit mesajı — önkoşul vakasını doğru gösterir. */
export function caseUnlockMessage(caseId: string): string {
  const required = CASE_UNLOCK_REQUIRES[caseId];
  if (!required || required.length === 0) {
    return "Bu vaka şu an inceleme için açık.";
  }
  const labels = required
    .map((id) => id.replace(/^case-/i, "CASE-").toUpperCase())
    .join(", ");
  return `Bu vakayı açmak için önce ${labels} dosyasını çözmen gerekiyor.`;
}
