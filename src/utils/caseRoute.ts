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
