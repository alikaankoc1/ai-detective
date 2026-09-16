/**
 * API smoke: health + case list endpoint.
 * Çalıştır: npx tsx scripts/smoke-api.ts
 * Opsiyonel: API_BASE_URL=https://... npx tsx scripts/smoke-api.ts
 */
const base = (
  process.env.API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

async function check(path: string): Promise<void> {
  const url = `${base}${path}`;
  const started = Date.now();
  const res = await fetch(url);
  const ms = Date.now() - started;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`FAIL ${path} → ${res.status} (${ms}ms) ${text.slice(0, 160)}`);
  }
  console.log(`PASS ${path} (${ms}ms)`);
}

async function main() {
  console.log(`API smoke → ${base}`);
  await check("/health");
  await check("/api/cases/case-001");
  console.log("OK — API ayakta. Fiziksel telefonda aynı host'u EXPO_PUBLIC_API_BASE_URL yap.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  console.error(
    "Sunucu çalışıyor mu? (cd server && npm run start) / firewall / doğru IP?"
  );
  process.exit(1);
});
