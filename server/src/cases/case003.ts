import type { Case } from "../../../src/types/case";

/**
 * Case #003 — "Son Metro"
 * Kolay-orta: 2 şüpheli, zaman çizelgesi karşılaştırması, net çelişkiler.
 * Konum: Eskişehir, Odunpazarı (yağmurlu gece).
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 */
export const case003: Case = {
  meta: {
    id: "case-003",
    title: "Son Metro",
    summary:
      "Eskişehir Odunpazarı'nda yağmurlu bir gece, yazılımcı Ece Karaca şirket USB'sini ve kısa süreliğine telefonunu kaybeder. İki şüpheli, çelişen saatler ve son tramvay bileti.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-16T12:00:00.000Z",
    factsLocked: true,
  },

  story:
    "Eskişehir'in Odunpazarı semtinde yağmur, ahşap evlerin saçaklarından damlar. Yazılım şirketi çalışanı Ece Karaca, akşamki sektör buluşmasından sonra eski bir kafede çantasını kısa bir an yalnız bırakır. Döndüğünde şirket belgelerinin bulunduğu USB bellek yoktur; telefonu da birkaç dakika sonra ıslak bankta bulunur. Bölgede yalnızca iki kişi kalmıştır: iş arkadaşı Mert Kaya ve buluşmada tanıştığı Selin Aras. Son tramvay istasyona yaklaşırken, ifadelerdeki saatler birbirini tutmaz.",

  scene: {
    name: "Odunpazarı — Atlıhan civarı kafe ve EsTram durağı",
    description:
      "Yağmurlu Odunpazarı sokağı. Dar kaldırım, loş kafe ışıkları, biraz ileride EsTram durağı. Tahta bank ıslak; üzerine bırakılmış bir telefon kılıfı izi vardır.",
    details:
      "Kafenin dış masasında Ece'nin çantası 21:52–21:55 arasında yalnız kalmıştır. Durakta 22:05 damgalı bir tramvay bileti bulunur. USB'nin boş kılıfı sonra bir şüphelinin cebinden çıkar.",
  },

  time: {
    dateLabel: "20 Eylül 2026, Cumartesi gecesi",
    timeOfCrime: "21:52–21:55 civarı",
    atmosphere:
      "Yağmurlu Odunpazarı gecesi — ıslak taş sokaklar, tramvay zili, uzak müzik",
  },

  suspects: [
    {
      id: "suspect-c3-mert",
      name: "Mert Kaya",
      age: 32,
      occupation: "Yazılım geliştirici / Ece'nin iş arkadaşı",
      biography:
        "Aynı şirkette backend geliştirici. Son haftalarda performans görüşmelerinden gergin; başka bir firmayla görüştüğü konuşuluyor. Soğukkanlı konuşur.",
      relationshipToVictim:
        "İş arkadaşı; USB'deki müşteri ve proje dosyalarına erişmek istiyordu.",
      claimedAlibi:
        "21:40'tan sonra Odunpazarı'ndan ayrıldım. Son tramvaya binmedim; USB'ye ve çantaya hiç dokunmadım.",
    },
    {
      id: "suspect-c3-selin",
      name: "Selin Aras",
      age: 28,
      occupation: "Etkinlik organizatörü",
      biography:
        "Odunpazarı buluşmasını düzenleyen bağımsız organizatör. Ece ile o gece tanışmıştır. Açık sözlü, saatleri net hatırlar.",
      relationshipToVictim:
        "Etkinlik organizatörü; Ece'ye yol tarifi ve kafe önerisi yapmıştı.",
      claimedAlibi:
        "21:50 civarı Ece'yle kafedeydik. Sipariş için sıraya girdiğimde çanta masada kaldı; Mert masanın yanındaydı.",
    },
  ],

  evidence: [
    {
      id: "evidence-c3-cctv-time",
      name: "Kafe masa kaydı (21:52–21:55)",
      description:
        "Kafenin dış kamera özeti: Ece'nin çantası 21:52'de masada yalnız kalıyor, 21:55'te Ece geri dönüyor. Ara dakikalarda bir silüet masaya yaklaşıyor.",
      discoveryLocation: "Kafe güvenlik notu / kamera özeti",
      relatedSuspectIds: ["suspect-c3-mert", "suspect-c3-selin"],
      isRedHerring: false,
    },
    {
      id: "evidence-c3-tram-ticket",
      name: "22:05 damgalı EsTram bileti",
      description:
        "Odunpazarı durağı civarında bulunan tek binişlik EsTram bileti. Damga: 22:05 — gecenin son seferlerinden biri.",
      discoveryLocation: "EsTram durağı, ıslak bank yanı",
      relatedSuspectIds: ["suspect-c3-mert"],
      isRedHerring: false,
    },
    {
      id: "evidence-c3-usb-sleeve",
      name: "Boş USB kılıfı",
      description:
        "Şirket logolu küçük USB kılıfı. İçinde bellek yok. Mert Kaya'nın yağmurluk cebinden çıkar; kılıfın kenarı hâlâ nemlidir.",
      discoveryLocation: "Mert Kaya'nın yağmurluk cebi (ifade sırasında)",
      relatedSuspectIds: ["suspect-c3-mert"],
      isRedHerring: false,
    },
    {
      id: "evidence-c3-event-badge",
      name: "Selin'in etkinlik yaka kartı",
      description:
        "Islak bankın yanında bulunan organizatör yaka kartı: 'Selin Aras — Odunpazarı Buluşması'. Kart, çantanın kaybolduğu masaya yakın düşmüş.",
      discoveryLocation: "Kafe dışı bank / kaldırım",
      relatedSuspectIds: ["suspect-c3-selin"],
      isRedHerring: true,
    },
  ],

  clues: [
    {
      id: "clue-c3-timeline-window",
      text: "USB kaybı 21:52–21:55 arasında olmalı. İfadelerdeki saatleri bu pencereyle karşılaştır.",
      relatedEvidenceIds: ["evidence-c3-cctv-time"],
      relatedSuspectIds: ["suspect-c3-mert", "suspect-c3-selin"],
    },
    {
      id: "clue-c3-ticket-vs-alibi",
      text: "Mert 21:40'tan sonra ayrıldığını ve son tramvaya binmediğini söylüyor; 22:05 damgalı bilet aksini ima ediyor.",
      relatedEvidenceIds: ["evidence-c3-tram-ticket"],
      relatedSuspectIds: ["suspect-c3-mert"],
    },
  ],

  statements: [
    {
      id: "stmt-c3-mert-1",
      suspectId: "suspect-c3-mert",
      text: "21:40'tan sonra Odunpazarı'ndan ayrıldım. Son tramvaya binmedim; 22:00'den sonra burada değildim.",
    },
    {
      id: "stmt-c3-mert-2",
      suspectId: "suspect-c3-mert",
      text: "Ece'nin çantasına ve USB'sine hiç dokunmadım. Yanımda şirket kılıfı da yoktu.",
    },
    {
      id: "stmt-c3-selin-1",
      suspectId: "suspect-c3-selin",
      text: "21:50 civarı Ece'yle dış masadaydık. Ben sıraya gidince çanta masada kaldı.",
    },
    {
      id: "stmt-c3-selin-2",
      suspectId: "suspect-c3-selin",
      text: "O sırada Mert masanın yanındaydı. Ben döndüğümde Ece panikle USB'sini arıyordu.",
    },
  ],

  canon: {
    victimName: "Ece Karaca",
    victimDescription:
      "29 yaşında yazılım şirketi ürün analisti. Çantasında müşteri listesi ve gizli proje notları olan şirket USB'si taşıyordu.",
    killerSuspectId: "suspect-c3-mert",
    motive:
      "Mert Kaya, rakip firmaya geçiş görüşmesi için USB'deki müşteri listesi ve proje belgelerini çaldı. Dosyalar eline geçmeden teklifi garantiye alamayacaktı.",
    methodOfCrime:
      "21:52–21:55 arasında Ece sıradayken / içerideyken Mert masadaki çantadan USB'yi aldı; telefonu düşürüp banka bıraktı. 22:05 EsTram ile Odunpazarı'ndan ayrılırken boş kılıf cebinde kaldı.",
    realTimeline: [
      {
        id: "tl-c3-1",
        order: 1,
        timeLabel: "21:35",
        description:
          "Etkinlik biter. Ece, Mert ve Selin Odunpazarı'ndaki kafeye yürür.",
        involvedSuspectIds: ["suspect-c3-mert", "suspect-c3-selin"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c3-2",
        order: 2,
        timeLabel: "21:50",
        description:
          "Üçü dış masada oturur. Selin sipariş için sıraya gider; Ece kısa süreliğine içeride / sırada kaybolur.",
        involvedSuspectIds: ["suspect-c3-selin"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c3-3",
        order: 3,
        timeLabel: "21:52–21:55",
        description:
          "Çanta yalnızken Mert USB'yi alır. Telefon kayıp gibi görünür; aslında ıslak banka düşmüştür.",
        involvedSuspectIds: ["suspect-c3-mert"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c3-4",
        order: 4,
        timeLabel: "22:05",
        description:
          "Mert Odunpazarı EsTram durağına biner (son seferlerden). Bilet damgası 22:05.",
        involvedSuspectIds: ["suspect-c3-mert"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c3-5",
        order: 5,
        timeLabel: "22:10",
        description:
          "Ece USB'sinin olmadığını fark eder. Selin yanındadır; Mert çoktan tramvaydadır.",
        involvedSuspectIds: ["suspect-c3-selin"],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: ["stmt-c3-selin-1", "stmt-c3-selin-2"],
    falseStatementIds: ["stmt-c3-mert-1", "stmt-c3-mert-2"],
    criticalEvidenceIds: [
      "evidence-c3-cctv-time",
      "evidence-c3-tram-ticket",
      "evidence-c3-usb-sleeve",
    ],
  },

  endings: [
    {
      id: "ending-c3-correct",
      type: "dogru_suclama",
      title: "Son Sefer",
      description:
        "Mert Kaya suçlanır. Saat penceresi ve 22:05 bileti, erken ayrıldığı yalanını çürütür. USB hırsızlığı kapanır.",
      requiredSuspectId: "suspect-c3-mert",
      requiredEvidenceIds: [
        "evidence-c3-cctv-time",
        "evidence-c3-tram-ticket",
      ],
    },
    {
      id: "ending-c3-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Durak",
      description:
        "Suç Selin'e yıkılır. Yaka kartı yanıltıcı bir gölge olur; gerçek hırsız son tramvayla kaybolur.",
      requiredEvidenceIds: ["evidence-c3-event-badge"],
    },
    {
      id: "ending-c3-perfect",
      type: "mukemmel_cozum",
      title: "Hat Tamam",
      description:
        "Mert doğru suçlanır; kamera saati, tramvay bileti ve boş USB kılıfı birleştirilir. Motivasyon netleşir, Selin aklanır.",
      requiredSuspectId: "suspect-c3-mert",
      requiredEvidenceIds: [
        "evidence-c3-cctv-time",
        "evidence-c3-tram-ticket",
        "evidence-c3-usb-sleeve",
      ],
    },
  ],

  progress: {
    caseId: "case-003",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-16T12:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
  },
};
