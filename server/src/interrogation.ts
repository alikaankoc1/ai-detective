import type { Case, Suspect } from "../../src/types/case";
import { getSupportedCase } from "./cases/registry";
import { getGeminiClient } from "./gemini";

export { getSupportedCase } from "./cases/registry";

export type InterrogationRequest = {
  caseId: string;
  suspectId: string;
  /** Normal soru. Delille yüzleştirmede opsiyonel olabilir. */
  playerQuestion?: string;
  /** Seçilen delil — oyuncu güvenli bilgiler Gemini'ye eklenir. */
  evidenceId?: string;
};

export type InterrogationResult = {
  reply: string;
  suspectId: string;
  caseId: string;
  evidenceId?: string;
};

/** Oyuncunun görebileceği delil özeti — isRedHerring / canon yok. */
type PlayerSafeEvidence = {
  id: string;
  name: string;
  description: string;
  discoveryLocation: string;
  relatedSuspectIds: readonly string[];
  examinationNotes: readonly string[];
};

function toPlayerSafeEvidence(
  caseData: Case,
  evidenceId: string
): PlayerSafeEvidence {
  const evidence = caseData.evidence.find((item) => item.id === evidenceId);
  if (!evidence) {
    throw new Error("Delil bu vakada bulunamadı.");
  }

  const examinationNotes = caseData.clues
    .filter((clue) => clue.relatedEvidenceIds.includes(evidence.id))
    .map((clue) => clue.text);

  return {
    id: evidence.id,
    name: evidence.name,
    description: evidence.description,
    discoveryLocation: evidence.discoveryLocation,
    relatedSuspectIds: evidence.relatedSuspectIds,
    examinationNotes,
  };
}

function buildInterrogationPrompt(
  caseData: Case,
  suspect: Suspect,
  playerQuestion: string | undefined,
  confrontedEvidence: PlayerSafeEvidence | null
): string {
  const suspectStatements = caseData.statements.filter(
    (s) => s.suspectId === suspect.id
  );

  const statementLines = suspectStatements
    .map((s) => {
      const isTrue = caseData.canon.trueStatementIds.includes(s.id);
      const isFalse = caseData.canon.falseStatementIds.includes(s.id);
      const truth = isTrue
        ? "DOĞRU (şüpheli bunu dürüstçe söylüyor veya söyleyebilir)"
        : isFalse
          ? "YALAN (şüpheli bunu savunuyor / yalanlıyor)"
          : "SINIFLANDIRILMAMIŞ";
      return `- [${s.id}] (${truth}): "${s.text}"`;
    })
    .join("\n");

  const timelineLines = caseData.canon.realTimeline
    .map(
      (e) =>
        `- ${e.timeLabel} | order=${e.order} | involved=[${e.involvedSuspectIds.join(", ")}] | ${e.description}`
    )
    .join("\n");

  const relatedEvidence = caseData.evidence
    .filter((e) => e.relatedSuspectIds.includes(suspect.id))
    .map((e) => `- ${e.name}: ${e.description}`)
    .join("\n");

  const isKiller = caseData.canon.killerSuspectId === suspect.id;

  const confrontationBlock = confrontedEvidence
    ? `
=== DELİLLE YÜZLEŞTİRME (OYUNCUYA AÇIK BİLGİLER) ===
Oyuncu sana şu delili gösteriyor. Yalnızca bu alanları biliyor; başka gizli etiket UYDURMA veya ifşa etme.
- Delil ID: ${confrontedEvidence.id}
- Ad: ${confrontedEvidence.name}
- Açıklama: ${confrontedEvidence.description}
- Bulunduğu yer: ${confrontedEvidence.discoveryLocation}
- Bağlantılı şüpheli ID'leri: ${confrontedEvidence.relatedSuspectIds.join(", ") || "(yok)"}
- İnceleme notları:
${
  confrontedEvidence.examinationNotes.length > 0
    ? confrontedEvidence.examinationNotes.map((n) => `  • ${n}`).join("\n")
    : "  • (ek not yok)"
}

Bu delile tepki ver. Cevabın seçilen delille ilgili olsun.
"Çelişki bulundu" / "yakalandın" gibi sistem ilanı yapma.
isRedHerring, katil kimliği veya motivasyonu açıklama.
`
    : "";

  const questionBlock = playerQuestion?.trim()
    ? `
=== OYUNCU SORUSU ===
${playerQuestion.trim()}
`
    : confrontedEvidence
      ? `
=== OYUNCU AKSİYONU ===
Oyuncu ek soru yazmadı; seni bu delille yüzleştiriyor. Delile göre doğal bir tepki ver.
`
      : "";

  return `Sen bir Türkçe dedektiflik oyununda SORGU ALTINDAKİ ŞÜPHELİSİN.
Kimliğin: ${suspect.name} (${suspect.id})
Rolün: Birinci şahıs olarak bu karaktere özgü, doğal ve gerilimli cevap ver.

=== KİLİTLİ VAKA (DEĞİŞTİRİLEMEZ — OYUNCUYA AÇIKLAMA) ===
Vaka ID: ${caseData.meta.id}
Başlık: ${caseData.meta.title}
Özet: ${caseData.meta.summary}
Mekân: ${caseData.scene.name}
Mekân tarifi: ${caseData.scene.description}
Zaman: ${caseData.time.dateLabel} / ${caseData.time.timeOfCrime}
Atmosfer: ${caseData.time.atmosphere ?? "-"}
Kurban: ${caseData.canon.victimName} — ${caseData.canon.victimDescription}
Katil (GİZLİ — oyuncuya ASLA doğrudan söyleme): ${caseData.canon.killerSuspectId}
Motivasyon (GİZLİ): ${caseData.canon.motive}
Yöntem (GİZLİ): ${caseData.canon.methodOfCrime}

Gerçek zaman çizelgesi (GİZLİ / dahili tutarlılık için):
${timelineLines}

=== BU ŞÜPHELİNİN BİLİNEN PROFİLİ ===
Meslek: ${suspect.occupation}
Yaş: ${suspect.age ?? "bilinmiyor"}
Biyografi: ${suspect.biography}
Kurbanla bağ: ${suspect.relationshipToVictim}
İddia ettiği mazeret: ${suspect.claimedAlibi}
Bu karakter katil mi? (dahili): ${isKiller ? "EVET" : "HAYIR"}

Bu şüphelinin dosyadaki ifadeleri:
${statementLines || "(yok)"}

İlişkili deliller (oyuncunun görebileceği bilgiler):
${relatedEvidence || "(yok)"}
${confrontationBlock}
=== SIKI KURALLAR ===
1) CaseCanon gerçeklerini DEĞİŞTİRME. Yeni olay, yeni delil, yeni saat, yeni kişi UYDURMA.
2) Katilin kimliğini, motivasyonu veya gizli zaman çizelgesini oyuncuya doğrudan AÇIKLAMA.
3) "Kim öldürdü?" benzeri sorularda spekülasyon yapabilirsin ama kesin itiraf / kesin teşhis verme.
4) Yalan olarak işaretli ifadelerinle çelişme; yalan söylüyorsan tutarlı yalan söyle.
5) Doğru ifadelerinle çelişme.
6) Cevap tamamen TÜRKÇE olsun.
7) 2-5 cümle, sorgu atmosferine uygun, karaktere özgü konuş.
8) Anlatıcı gibi davranma; yalnızca şüphelinin sözleri olarak cevap ver. Tırnak, markdown, etiket kullanma.
9) Delille yüzleştirmede cevabın seçilen delile değinsin; otomatik çelişki sistemi yok.
${questionBlock}
Şimdi yalnızca şüphelinin cevabını yaz:`;
}

export async function runInterrogation(
  input: InterrogationRequest
): Promise<InterrogationResult> {
  const caseId = input.caseId?.trim();
  const suspectId = input.suspectId?.trim();
  const playerQuestion = input.playerQuestion?.trim() || undefined;
  const evidenceId = input.evidenceId?.trim() || undefined;

  if (!caseId || !suspectId) {
    throw new Error("caseId ve suspectId zorunludur.");
  }

  if (!playerQuestion && !evidenceId) {
    throw new Error("playerQuestion veya evidenceId zorunludur.");
  }

  if (playerQuestion && playerQuestion.length > 500) {
    throw new Error("Soru çok uzun (en fazla 500 karakter).");
  }

  const caseData = getSupportedCase(caseId);
  if (!caseData) {
    throw new Error("Bu vaka henüz desteklenmiyor.");
  }

  const suspect = caseData.suspects.find((s) => s.id === suspectId);
  if (!suspect) {
    throw new Error("Şüpheli bu vakada bulunamadı.");
  }

  const confrontedEvidence = evidenceId
    ? toPlayerSafeEvidence(caseData, evidenceId)
    : null;

  const ai = getGeminiClient();
  const prompt = buildInterrogationPrompt(
    caseData,
    suspect,
    playerQuestion,
    confrontedEvidence
  );

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }

  const reply = response.text?.trim();
  if (!reply) {
    throw new Error("Gemini boş ifade döndürdü.");
  }

  return {
    caseId,
    suspectId,
    reply,
    ...(evidenceId ? { evidenceId } : {}),
  };
}

function formatGeminiError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const lower = raw.toLowerCase();
  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("rate-limit") ||
    lower.includes("rate limit")
  ) {
    return "Sorgu servisi kotası doldu. Birkaç dakika sonra tekrar dene.";
  }

  if (lower.includes("api key") || lower.includes("permission")) {
    return "Sorgu servisi şu an kullanılamıyor. Kısa süre sonra tekrar dene.";
  }

  // Ham JSON'u oyuncuya gösterme
  if (raw.includes('"error"') || raw.length > 280) {
    return "Şüpheli şu an cevap veremiyor (yapay zeka servisi meşgul). Kısa süre sonra tekrar dene.";
  }

  return raw;
}
