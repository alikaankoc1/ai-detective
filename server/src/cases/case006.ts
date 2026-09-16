import type { Case } from "../../../src/types/case";

/**
 * Case #006 — "Alsancak Saati"
 * Orta-zor: 3 şüpheli, butik otel kasası, cep saati hırsızlığı.
 * Konum: İzmir, Alsancak (Kordon civarı butik otel).
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 *
 * Kapak görseli: oyuncu sağlayacak → case-006-cover-alsancak-saati.png
 */
export const case006: Case = {
  meta: {
    id: "case-006",
    title: "Alsancak Saati",
    summary:
      "İzmir Alsancak'ta yağmurlu bir gece, butik otelin kasasından antika cep saati kaybolur. Üç kişi, kamera kör noktası ve ıslak ayak izi.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-16T18:00:00.000Z",
    factsLocked: true,
  },

  story:
    "Alsancak'ta Kordon'a inen dar bir sokağın köşesinde, Göztepe Otel'in lobisi loş yanar. Vitrine konmuş 1920'lerden kalma antika cep saati — altın kaplama, mine kadran — sabaha karşı yok olur. Otel sahibi Handan Efe, kasayı zorlanmış bulur; kadife yastık boştur. O gece sahada üç isim dolaşır: gece resepsiyonu Rüzgar Demir, misafir piyanist Selin Arı ve güvenlik Mert Yalın. Lobideki ıslak ayak izi ile resepsiyon bilgisayarındaki 'kasa kontrol' kaydı, ifadeleri kırar.",

  scene: {
    name: "Göztepe Otel lobisi — Alsancak, İzmir",
    description:
      "Dar lobi, ahşap banko, cam vitrin. Vitrinin arkası kasa nişi; kilit çizilmiş. Yerlerde yağmur izi. Bankoda rezervasyon defteri ve anahtar kutusu.",
    details:
      "Kasa 23:00'te mühürlenmiş. 01:20'de resepsiyon terminalinde 'kasa kontrol' oturumu. Lobiden koridora uzanan ıslak ayak izi. Selin'in eldiveni koltuk altında.",
  },

  time: {
    dateLabel: "11 Ekim 2026, Cumartesi gecesi",
    timeOfCrime: "01:15–01:30 civarı",
    atmosphere:
      "Yağmurlu Alsancak gecesi — ıslak kaldırım, uzak vapur düdüğü, lobi ahşap ve metal kokusu",
  },

  suspects: [
    {
      id: "suspect-c6-ruzgar",
      name: "Rüzgar Demir",
      age: 29,
      occupation: "Gece resepsiyon görevlisi",
      biography:
        "Otelde sekiz aydır gece vardiyası. Kibarca konuşur, saatleri ezbere bilir. Son haftalarda kumar borcu kulaktan kulağa yayılmış.",
      relationshipToVictim:
        "Handan Efe'nin gece personeli; kasa şifresine ve anahtar kutusuna erişimi var.",
      claimedAlibi:
        "01:00'den sonra yalnızca bankodaydım. Kasaya girmedim; saate dokunmadım.",
    },
    {
      id: "suspect-c6-selin",
      name: "Selin Arı",
      age: 34,
      occupation: "Misafir piyanist",
      biography:
        "İstanbul'dan kısa konser için gelmiş. Lobide prova yapmış, dikkatli ve sakin. Eldivenlerini sık sık unutur.",
      relationshipToVictim:
        "Handan'ın davetlisi; gece lobide kısa bir prova hakkı vardı.",
      claimedAlibi:
        "00:40'ta prova bitince odama çıktım. Gece lobiyi görmedim.",
    },
    {
      id: "suspect-c6-mert",
      name: "Mert Yalın",
      age: 42,
      occupation: "Gece güvenlik",
      biography:
        "Otel çevresi ve otopark turu yapıyor. Az konuşur, tur cihazına bağlı. İç lobiyi nadiren geçer.",
      relationshipToVictim:
        "Handan'ın sözleşmeli güvenliği; dış kapı ve otopark anahtarı onda.",
      claimedAlibi:
        "01:10'da otoparktaydım. Lobinin içine girmedim; vitrine yaklaşmadım.",
    },
  ],

  evidence: [
    {
      id: "evidence-c6-desk-log",
      name: "Resepsiyon kaydı — 01:20",
      description:
        "Terminalde Rüzgar Demir kullanıcısıyla 01:20 'kasa kontrol' oturumu. Aynı dakikada kasa nişi hareket sensörü tetiklenmiş.",
      discoveryLocation: "Resepsiyon bankosu / sistem logu",
      relatedSuspectIds: ["suspect-c6-ruzgar"],
      isRedHerring: false,
    },
    {
      id: "evidence-c6-wet-prints",
      name: "Lobideki ıslak ayak izi",
      description:
        "Girişten kasa nişine uzanan yağmur ıslaklığı. İz tabanı Rüzgar'ın nöbet ayakkabısıyla uyumlu; otopark zemininde aynı patern yok.",
      discoveryLocation: "Lobi halısı / kasa önü",
      relatedSuspectIds: ["suspect-c6-ruzgar"],
      isRedHerring: false,
    },
    {
      id: "evidence-c6-buyer-sms",
      name: "Yırtık alıcı notu",
      description:
        "Rüzgar'ın ceket cebinde yarım not: 'Saat elinde olsun — Alsancak teslim, nakit hazır.' Tarih o geceye işaret ediyor.",
      discoveryLocation: "Personel dolabı / Rüzgar'ın ceketi",
      relatedSuspectIds: ["suspect-c6-ruzgar"],
      isRedHerring: false,
    },
    {
      id: "evidence-c6-parking-tour",
      name: "Otopark tur kaydı",
      description:
        "Mert'in tur cihazı 01:08 ve 01:22'de otopark noktalarını onaylıyor. Lobi iç turu o gece işaretlenmemiş.",
      discoveryLocation: "Güvenlik tur cihazı",
      relatedSuspectIds: ["suspect-c6-mert"],
      isRedHerring: false,
    },
    {
      id: "evidence-c6-selin-glove",
      name: "Selin'in eldiveni",
      description:
        "Koltuk altında tek deri eldiven: 'S.A.' nakışlı. Üzerinde kasa tozu yok; prova sırasında düşmüş gibi.",
      discoveryLocation: "Lobi koltuğu",
      relatedSuspectIds: ["suspect-c6-selin"],
      isRedHerring: true,
    },
  ],

  clues: [
    {
      id: "clue-c6-window",
      text: "Hırsızlık 23:00 mühür ile sabah arasında; 01:20 resepsiyon kaydı kritik pencereyi işaret ediyor.",
      relatedEvidenceIds: ["evidence-c6-desk-log"],
      relatedSuspectIds: ["suspect-c6-ruzgar", "suspect-c6-mert"],
    },
    {
      id: "clue-c6-prints",
      text: "Rüzgar yalnızca bankoda kaldığını söylüyor; kasa önündeki ayakkabı izi bunu zora sokuyor.",
      relatedEvidenceIds: ["evidence-c6-wet-prints"],
      relatedSuspectIds: ["suspect-c6-ruzgar"],
    },
    {
      id: "clue-c6-glove",
      text: "Eldiven Selin'i gölgede bırakır; düşmüş olması gece dönüşü kanıtlamaz.",
      relatedEvidenceIds: ["evidence-c6-selin-glove"],
      relatedSuspectIds: ["suspect-c6-selin"],
    },
  ],

  statements: [
    {
      id: "stmt-c6-ruzgar-1",
      suspectId: "suspect-c6-ruzgar",
      text: "01:00'den sonra yalnızca bankodaydım. Kasaya hiç girmedim; 01:20'de içeride değildim.",
    },
    {
      id: "stmt-c6-ruzgar-2",
      suspectId: "suspect-c6-ruzgar",
      text: "Saate ve kasaya dokunmadım. Üzerimde kasa tozu veya ıslak iz olamaz.",
    },
    {
      id: "stmt-c6-selin-1",
      suspectId: "suspect-c6-selin",
      text: "00:40'ta prova bitince odama çıktım. Gece lobiyi görmedim.",
    },
    {
      id: "stmt-c6-selin-2",
      suspectId: "suspect-c6-selin",
      text: "Eldivenimi koltukta unutmuş olabilirim; sabah duyunca şok oldum.",
    },
    {
      id: "stmt-c6-mert-1",
      suspectId: "suspect-c6-mert",
      text: "01:10 civarı otoparktaydım. Lobinin içine girmedim.",
    },
    {
      id: "stmt-c6-mert-2",
      suspectId: "suspect-c6-mert",
      text: "Kasa şifresi bende yok; o resepsiyonda. Ben dış halkadayım.",
    },
  ],

  canon: {
    victimName: "Handan Efe",
    victimDescription:
      "51 yaşında butik otel sahibi. Gece kaybolan parça, lobide sergilenen antika cep saatiydi — aile yadigârı ve sigortalı vitrin parçası.",
    killerSuspectId: "suspect-c6-ruzgar",
    motive:
      "Rüzgar Demir, kumar borcunu kapatmak için antika cep saatini gece alıcıya satmak üzere çaldı. Alsancak'ta nakit teslim sözü vermişti.",
    methodOfCrime:
      "23:00 mühüründen sonra Rüzgar 01:20'de kasa nişine girdi (terminale yazdı), saati aldı. Lobide ıslak ayak izi bıraktı; alıcı notunu cebinde unuttu. Mert otopark turundaydı; Selin'in eldiveni yanıltıcı kaldı.",
    realTimeline: [
      {
        id: "tl-c6-1",
        order: 1,
        timeLabel: "22:30",
        description:
          "Selin lobide kısa prova yapar; Rüzgar kasa mühür hazırlığını tamamlar.",
        involvedSuspectIds: ["suspect-c6-selin", "suspect-c6-ruzgar"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c6-2",
        order: 2,
        timeLabel: "23:00",
        description: "Kasa mühürlenir. Selin odasına çıkar; eldiven koltukta kalır.",
        involvedSuspectIds: ["suspect-c6-selin", "suspect-c6-ruzgar"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c6-3",
        order: 3,
        timeLabel: "00:40",
        description: "Selin odasında. Rüzgar bankoda yalnız.",
        involvedSuspectIds: ["suspect-c6-selin", "suspect-c6-ruzgar"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c6-4",
        order: 4,
        timeLabel: "01:08–01:22",
        description: "Mert otopark tur noktalarını onaylar; lobiye girmez.",
        involvedSuspectIds: ["suspect-c6-mert"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c6-5",
        order: 5,
        timeLabel: "01:20",
        description:
          "Rüzgar kasa nişine girer, saati alır, terminale kasa kontrol yazar.",
        involvedSuspectIds: ["suspect-c6-ruzgar"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c6-6",
        order: 6,
        timeLabel: "01:28",
        description:
          "Rüzgar bankoya döner. Saat üzerinde gizlidir; alıcı notu cebindedir.",
        involvedSuspectIds: ["suspect-c6-ruzgar"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c6-7",
        order: 7,
        timeLabel: "07:50 (ertesi sabah)",
        description:
          "Handan Efe açılışta zorlanmış kilit ve boş yastığı görür; polisi arar.",
        involvedSuspectIds: [],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: [
      "stmt-c6-selin-1",
      "stmt-c6-selin-2",
      "stmt-c6-mert-1",
      "stmt-c6-mert-2",
    ],
    falseStatementIds: ["stmt-c6-ruzgar-1", "stmt-c6-ruzgar-2"],
    criticalEvidenceIds: [
      "evidence-c6-desk-log",
      "evidence-c6-wet-prints",
      "evidence-c6-buyer-sms",
      "evidence-c6-parking-tour",
    ],
  },

  endings: [
    {
      id: "ending-c6-correct",
      type: "dogru_suclama",
      title: "Banko Kaydı",
      description:
        "Rüzgar Demir suçlanır. 01:20 kasa kontrol kaydı ve ıslak iz, bankoda kaldığı yalanını çürütür.",
      requiredSuspectId: "suspect-c6-ruzgar",
      requiredEvidenceIds: [
        "evidence-c6-desk-log",
        "evidence-c6-wet-prints",
      ],
    },
    {
      id: "ending-c6-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Eldiven",
      description:
        "Suç Selin Arı'ya yıkılır. Düşmüş eldiven gölge olur; gerçek hırsız bankoda kalır.",
      requiredEvidenceIds: ["evidence-c6-selin-glove"],
    },
    {
      id: "ending-c6-perfect",
      type: "mukemmel_cozum",
      title: "Mine Kadran",
      description:
        "Rüzgar doğru suçlanır; log, ıslak iz, alıcı notu ve Mert'in otopark turu birleşir. Selin ile Mert aklanır.",
      requiredSuspectId: "suspect-c6-ruzgar",
      requiredEvidenceIds: [
        "evidence-c6-desk-log",
        "evidence-c6-wet-prints",
        "evidence-c6-buyer-sms",
        "evidence-c6-parking-tour",
      ],
    },
  ],

  progress: {
    caseId: "case-006",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-16T18:00:00.000Z",
    updatedAt: "2026-09-16T18:00:00.000Z",
  },
};
