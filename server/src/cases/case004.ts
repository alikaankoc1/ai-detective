import type { Case } from "../../../src/types/case";

/**
 * Case #004 — "Kırık Çini"
 * Orta: 3 şüpheli, nöbet defteri + iz delilleri, net çelişkiler.
 * Konum: Konya, Karatay (restorasyon atölyesi — Alaaddin civarı).
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 */
export const case004: Case = {
  meta: {
    id: "case-004",
    title: "Kırık Çini",
    summary:
      "Konya Karatay'da soğuk bir gece, Selçuklu çini restorasyon atölyesinden nadir bir parça kaybolur. Üç şüpheli, nöbet defteri ve ayakkabıdaki mavi toz.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-16T14:00:00.000Z",
    factsLocked: true,
  },

  story:
    "Konya'nın Karatay semtinde hava keskindir; Alaaddin Tepesi'nin silüeti uzakta, sokak lambaları mavi-beyaz yanar. Küçük bir restorasyon atölyesinde, 13. yüzyıldan kalma nadir bir Selçuklu çini paneli parçası gece boyunca kaybolur. Atölye sorumlusu Leyla Demir sabah dolabı zorlanmış bulur; vitrindeki parça yerinde yoktur. O gece sahada üç kişi anılır: gece bekçisi Cem Yıldırım, Ankara'dan gelen araştırmacı Bahar Elçi ve genç restoratör Aylin Koç. Nöbet defterindeki tek satır ile ayakkabı tabanındaki çini tozu, ifadeleri birbirine düşürür.",

  scene: {
    name: "Karatay restorasyon atölyesi — Konya",
    description:
      "Taş avluya bakan dar atölye. İş tezgâhlarında pigment kavanozları, eldivenler, büyütücü lamba. Arka duvarda kilitli cam dolap; dolabın kilidi zorlanmış, iç rafta boş bir kadife yastık.",
    details:
      "Dolap 21:15'te kilitlenmiş kaydedilmiş. Nöbet defterinde 22:10 giriş notu var. Tezgâh önünde ince mavi çini tozu; lavaboda pigment lekeli bir eldiven. Ziyaretçi kartı eşikte düşmüş.",
  },

  time: {
    dateLabel: "24 Eylül 2026, Perşembe gecesi",
    timeOfCrime: "22:05–22:20 civarı",
    atmosphere:
      "Soğuk Konya gecesi — kuru rüzgâr, uzak ezan sonrası sessizlik, atölyede tutkal ve kil kokusu",
  },

  suspects: [
    {
      id: "suspect-c4-cem",
      name: "Cem Yıldırım",
      age: 38,
      occupation: "Gece bekçisi",
      biography:
        "Atölye kompleksinde iki yıldır gece nöbeti tutuyor. Sessiz, kısa cevaplı. Son aylarda kumar borcu konuşuluyor; kimseyle fazla muhatap olmuyor.",
      relationshipToVictim:
        "Leyla Demir'in gece güvenliği; yedek anahtar dolabına erişimi var.",
      claimedAlibi:
        "21:30'dan sonra yalnızca dış kapı nöbetindeydim. Atölyeye girmedim; çiniye dokunmadım.",
    },
    {
      id: "suspect-c4-bahar",
      name: "Bahar Elçi",
      age: 34,
      occupation: "Sanat tarihçisi / misafir araştırmacı",
      biography:
        "Ankara'dan Selçuklu çini motifleri için kısa süreli araştırma izniyle gelmiş. Not defteri dolu, dikkatli konuşur; saatleri net hatırlar.",
      relationshipToVictim:
        "Leyla'nın davetlisi; envanter ve fotoğraf çekimi için gündüz atölyedeydi.",
      claimedAlibi:
        "21:00'de envanteri bitirip ayrıldım. Gece geri dönmedim; kartımı eşikte düşürmüş olabilirim.",
    },
    {
      id: "suspect-c4-aylin",
      name: "Aylin Koç",
      age: 26,
      occupation: "Junior restoratör",
      biography:
        "Karatay ekibinde ikinci yılı. Titiz, endişeli; dolap prosedürüne bağlı. Sabah ilk o fark etmiş.",
      relationshipToVictim:
        "Leyla'nın asistanı; parçanın kadife yastığını her akşam yerleştirir.",
      claimedAlibi:
        "21:15'te dolabı kilitledim ve çıktım. Gece atölyede değildim; sabah kilidin zorlandığını gördüm.",
    },
  ],

  evidence: [
    {
      id: "evidence-c4-shift-log",
      name: "Nöbet defteri — 22:10 girişi",
      description:
        "Gece defterinde Cem Yıldırım imzasıyla '22:10 — atölye iç kontrol' satırı var. Dış kapı kamerası özeti de aynı dakikada içeride hareket gösteriyor.",
      discoveryLocation: "Bekçi kulübesi / nöbet defteri",
      relatedSuspectIds: ["suspect-c4-cem"],
      isRedHerring: false,
    },
    {
      id: "evidence-c4-tile-dust",
      name: "Bot tabanındaki mavi çini tozu",
      description:
        "Cem'in iş botlarının tabanında atölye zeminindekiyle aynı pigmentli mavi toz. Dış nöbet alanının zemini bu tozu taşımaz.",
      discoveryLocation: "Bekçi dolabı / bot incelemesi",
      relatedSuspectIds: ["suspect-c4-cem"],
      isRedHerring: false,
    },
    {
      id: "evidence-c4-pigment-glove",
      name: "Pigment lekeli eldiven",
      description:
        "Atölye lavabosunda tek sol eldiven; parmak uçlarında çini panelinin karakteristik kobalt pigmenti. Eldiven bedeni Cem'in nöbet eldivenleriyle aynı seri.",
      discoveryLocation: "Atölye lavabosu",
      relatedSuspectIds: ["suspect-c4-cem"],
      isRedHerring: false,
    },
    {
      id: "evidence-c4-visitor-badge",
      name: "Bahar'ın ziyaretçi kartı",
      description:
        "Eşikte bulunan plastik ziyaretçi kartı: 'Bahar Elçi — Misafir Araştırmacı'. Kart, zorlanmış dolaba yakın düşmüş.",
      discoveryLocation: "Atölye eşiği",
      relatedSuspectIds: ["suspect-c4-bahar"],
      isRedHerring: true,
    },
    {
      id: "evidence-c4-buyer-note",
      name: "Yırtık alıcı notu",
      description:
        "Cem'in dolabında yarım yırtık not: 'Parça elinde olsun — sahte ihracat belgesi hazır, gece teslim.' Tarih o geceye işaret ediyor.",
      discoveryLocation: "Bekçi dolabı (iç cep)",
      relatedSuspectIds: ["suspect-c4-cem"],
      isRedHerring: false,
    },
  ],

  clues: [
    {
      id: "clue-c4-night-window",
      text: "Hırsızlık 21:15 kilit ile sabah keşfi arasında; nöbet defterindeki 22:10 satırı kritik pencereyi işaret ediyor.",
      relatedEvidenceIds: ["evidence-c4-shift-log"],
      relatedSuspectIds: ["suspect-c4-cem", "suspect-c4-aylin"],
    },
    {
      id: "clue-c4-dust-vs-gate",
      text: "Cem yalnızca dış kapıda kaldığını söylüyor; botundaki atölye çini tozu bunu zora sokuyor.",
      relatedEvidenceIds: ["evidence-c4-tile-dust"],
      relatedSuspectIds: ["suspect-c4-cem"],
    },
    {
      id: "clue-c4-badge-shadow",
      text: "Ziyaretçi kartı Bahar'ı gölgede bırakır; kartın düşmüş olması gece dönüşü kanıtlamaz.",
      relatedEvidenceIds: ["evidence-c4-visitor-badge"],
      relatedSuspectIds: ["suspect-c4-bahar"],
    },
  ],

  statements: [
    {
      id: "stmt-c4-cem-1",
      suspectId: "suspect-c4-cem",
      text: "21:30'dan sonra yalnızca dış kapı nöbetindeydim. Atölyeye hiç girmedim; 22:00'den sonra içeride değildim.",
    },
    {
      id: "stmt-c4-cem-2",
      suspectId: "suspect-c4-cem",
      text: "Çini paneline ve dolaba dokunmadım. Üzerimde pigment veya atölye tozu olamaz.",
    },
    {
      id: "stmt-c4-bahar-1",
      suspectId: "suspect-c4-bahar",
      text: "21:00'de fotoğrafları bitirip ayrıldım. Gece atölyeye geri dönmedim.",
    },
    {
      id: "stmt-c4-bahar-2",
      suspectId: "suspect-c4-bahar",
      text: "Kartımı çıkarken düşürmüş olabilirim; sabah duyunca şok oldum.",
    },
    {
      id: "stmt-c4-aylin-1",
      suspectId: "suspect-c4-aylin",
      text: "21:15'te dolabı kilitledim, kadife yastığı yerinde bıraktım ve çıktım.",
    },
    {
      id: "stmt-c4-aylin-2",
      suspectId: "suspect-c4-aylin",
      text: "Sabah kilidin zorlandığını gördüm. Gece anahtar bende değildi; yedek anahtar bekçi kulübesinde durur.",
    },
  ],

  canon: {
    victimName: "Leyla Demir",
    victimDescription:
      "42 yaşında restorasyon atölyesi sorumlusu. Gece kaybolan parça, sergilenecek nadir Selçuklu çini panelinin kritik bir bölümüydü.",
    killerSuspectId: "suspect-c4-cem",
    motive:
      "Cem Yıldırım, karaborsa alıcıya satmak ve sahte ihracat belgesi düzenletebilmek için Selçuklu çini parçasını çaldı. Borç baskısı altında parçayı gece teslim etmesi gerekiyordu.",
    methodOfCrime:
      "21:15 kilidinden sonra Cem 22:10'da atölyeye girdi (nöbet defterine yazdı), yedek anahtarla dolabı zorladı/açtı, çini parçasını aldı. Eldiveni lavaboya bıraktı; botunda çini tozu kaldı. Bahar'ın gündüz düşen kartı yanıltıcı kaldı.",
    realTimeline: [
      {
        id: "tl-c4-1",
        order: 1,
        timeLabel: "20:40",
        description:
          "Bahar Elçi envanter fotoğraflarını tamamlar; Aylin dolap hazırlığına yardım eder.",
        involvedSuspectIds: ["suspect-c4-bahar", "suspect-c4-aylin"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c4-2",
        order: 2,
        timeLabel: "21:00",
        description:
          "Bahar atölyeden ayrılır. Ziyaretçi kartı eşikte düşer (fark edilmez).",
        involvedSuspectIds: ["suspect-c4-bahar"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c4-3",
        order: 3,
        timeLabel: "21:15",
        description:
          "Aylin dolabı kilitler, parçayı kadife yastığa yerleştirir ve evine gider.",
        involvedSuspectIds: ["suspect-c4-aylin"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c4-4",
        order: 4,
        timeLabel: "22:10",
        description:
          "Cem atölyeye girer, dolabı açar, çini parçasını alır. Nöbet defterine iç kontrol yazar.",
        involvedSuspectIds: ["suspect-c4-cem"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c4-5",
        order: 5,
        timeLabel: "22:20",
        description:
          "Cem lavaboya pigmentli eldiveni bırakır, dış nöbete döner. Parça üzerinde gizlidir.",
        involvedSuspectIds: ["suspect-c4-cem"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c4-6",
        order: 6,
        timeLabel: "08:05 (ertesi sabah)",
        description:
          "Aylin açılışta zorlanmış kilit ve boş yastığı görür; Leyla Demir polisi arar.",
        involvedSuspectIds: ["suspect-c4-aylin"],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: [
      "stmt-c4-bahar-1",
      "stmt-c4-bahar-2",
      "stmt-c4-aylin-1",
      "stmt-c4-aylin-2",
    ],
    falseStatementIds: ["stmt-c4-cem-1", "stmt-c4-cem-2"],
    criticalEvidenceIds: [
      "evidence-c4-shift-log",
      "evidence-c4-tile-dust",
      "evidence-c4-pigment-glove",
      "evidence-c4-buyer-note",
    ],
  },

  endings: [
    {
      id: "ending-c4-correct",
      type: "dogru_suclama",
      title: "Nöbet Satırı",
      description:
        "Cem Yıldırım suçlanır. 22:10 defter kaydı ve çini tozu, dış kapıda kaldığı yalanını çürütür. Parça hırsızlığı kapanır.",
      requiredSuspectId: "suspect-c4-cem",
      requiredEvidenceIds: [
        "evidence-c4-shift-log",
        "evidence-c4-tile-dust",
      ],
    },
    {
      id: "ending-c4-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Kart",
      description:
        "Suç Bahar Elçi'ye yıkılır. Düşmüş ziyaretçi kartı gölge olur; gerçek hırsız nöbet kulübesinde kalır.",
      requiredEvidenceIds: ["evidence-c4-visitor-badge"],
    },
    {
      id: "ending-c4-perfect",
      type: "mukemmel_cozum",
      title: "Kobalt İzi",
      description:
        "Cem doğru suçlanır; nöbet kaydı, çini tozu, pigmentli eldiven ve alıcı notu birleşir. Motivasyon netleşir, Bahar ile Aylin aklanır.",
      requiredSuspectId: "suspect-c4-cem",
      requiredEvidenceIds: [
        "evidence-c4-shift-log",
        "evidence-c4-tile-dust",
        "evidence-c4-pigment-glove",
        "evidence-c4-buyer-note",
      ],
    },
  ],

  progress: {
    caseId: "case-004",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-16T14:00:00.000Z",
    updatedAt: "2026-09-16T14:00:00.000Z",
  },
};
