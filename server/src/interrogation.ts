import type { Case, Suspect } from "../../../src/types/case";
import { case001 } from "./cases/case001";
import { getGeminiClient } from "./gemini";

export type InterrogationRequest = {
  caseId: string;
  suspectId: string;
  playerQuestion: string;
};

export function getSupportedCase(caseId: string): Case | null {
  if (caseId === "case-001") {
    return case001;
  }
  return null;
}

function buildInterrogationPrompt(
  caseData: Case,
  suspect: Suspect,
  playerQuestion: string
): string {
  const suspectStatements = caseData.statements.filter(
    (s) => s.suspectId === suspect.id
  );

  const statementLines = suspectStatements
    .map((s) => {
      const isTrue = caseData.canon.trueStatementIds.includes(s.id);
      const isFalse = caseData.canon.falseStatementIds.includes(s.id);
      const truth =
        isTrue ? "DOĞRU (şüpheli bunu dürüstçe söylüyor veya söyleyebilir)" : isFalse
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

  return `Sen bir Türkçe dedektiflik oyununda SORGU ALTINDAKİ ŞÜPHELİSİN.
Kimliğin: ${suspect.name} (${suspect.id})
Rolün: Birinci şahıs olarak bu karaktere özgü, doğal ve gerilimli cevap ver.

=== KİLİTLİ VAKA (DEĞİŞTİRİLEMEZ) ===
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

=== SIKI KURALLAR ===
1) CaseCanon gerçeklerini DEĞİŞTİRME. Yeni olay, yeni delil, yeni saat, yeni kişi UYDURMA.
2) Katilin kimliğini, motivasyonu veya gizli zaman çizelgesini oyuncuya doğrudan AÇIKLAMA.
3) "Kim öldürdü?" benzeri sorularda spekülasyon yapabilirsin ama kesin itiraf / kesin teşhis verme.
4) Yalan olarak işaretli ifadelerinle çelişme; yalan söylüyorsan tutarlı yalan söyle.
5) Doğru ifadelerinle çelişme.
6) Cevap tamamen TÜRKÇE olsun.
7) 2-5 cümle, sorgu atmosferine uygun, karaktere özgü konuş.
8) Anlatıcı gibi davranma; yalnızca şüphelinin sözleri olarak cevap ver. Tırnak, markdown, etiket kullanma.

=== OYUNCU SORUSU ===
${playerQuestion}

Şimdi yalnızca şüphelinin cevabını yaz:`;
}

export async function runInterrogation(
  input: InterrogationRequest
): Promise<{ reply: string; suspectId: string; caseId: string }> {
  const caseId = input.caseId?.trim();
  const suspectId = input.suspectId?.trim();
  const playerQuestion = input.playerQuestion?.trim();

  if (!caseId || !suspectId || !playerQuestion) {
    throw new Error(
      "caseId, suspectId ve playerQuestion zorunludur."
    );
  }

  if (playerQuestion.length > 500) {
    throw new Error("Soru çok uzun (en fazla 500 karakter).");
  }

  const caseData = getSupportedCase(caseId);
  if (!caseData) {
    throw new Error("Bu vaka henüz desteklenmiyor. Şimdilik yalnızca case-001.");
  }

  const suspect = caseData.suspects.find((s) => s.id === suspectId);
  if (!suspect) {
    throw new Error("Şüpheli bu vakada bulunamadı.");
  }

  const ai = getGeminiClient();
  const prompt = buildInterrogationPrompt(caseData, suspect, playerQuestion);

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const reply = response.text?.trim();
  if (!reply) {
    throw new Error("Gemini boş ifade döndürdü.");
  }

  return {
    caseId,
    suspectId,
    reply,
  };
}
