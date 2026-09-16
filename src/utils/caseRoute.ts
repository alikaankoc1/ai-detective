/** Expo Router params bazen string[] gelir. */
export function firstRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Varsayılan / öne çıkan vaka (ana ekran). */
export const DEFAULT_CASE_ID = "case-001";

/** Route paramından caseId çöz; yoksa Case 001. */
export function resolveCaseId(
  value: string | string[] | undefined
): string {
  const raw = firstRouteParam(value)?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_CASE_ID;
}

/**
 * Vaka erişim kapısı (UI kilidiyle uyumlu).
 * Case 002 yalnızca Case 001 çözüldükten sonra oynanır.
 */
export function isCasePlayable(
  caseId: string,
  solvedCaseIds: readonly string[]
): boolean {
  if (caseId === DEFAULT_CASE_ID || caseId === "case-001") return true;
  if (caseId === "case-002") {
    return solvedCaseIds.includes("case-001");
  }
  return false;
}
