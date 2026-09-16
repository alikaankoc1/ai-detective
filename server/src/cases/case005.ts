import type { Case } from "../../../src/types/case";

/**
 * Case #005 — "Karatay Mührü"
 * Orta-zor: 3 şüpheli, medrese müzesi gece hırsızlığı, mühür/balmumu izleri.
 * Konum: Konya, Karatay (Karatay Medresesi müze eki).
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 *
 * Kapak görseli: assets/images/game/case-005-cover-karatay-muhru.png (oyuncu sağlayacak).
 */
export const case005: Case = {
  meta: {
    id: "case-005",
    title: "Karatay Mührü",
    summary:
      "Konya Karatay'da gece, medrese müzesinden Selçuklu arşiv mührü kaybolur. Üç kişi, kamera boşluğu ve balmumu lekesi.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-16T15:00:00.000Z",
    factsLocked: true,
  },

  story:
    "Konya'nın Karatay semtinde, medrese avlusuna bakan müze ekinde lamba loş yanar. Vitrindeki 13. yüzyıl Selçuklu arşiv mührü — bronz, ağır, envanter numarası kazınmış — sabaha karşı yok olur. Müze sorumlusu Emre Tan sabah camın kesildiğini ve kadife yastığın boş olduğunu görür. O gece sahada üç isim dolaşır: envanter memuru Deniz Uçar, gece güvenliği Hakan Soylu ve Ankara'dan gelen hattat araştırmacı Miray Şen. Kamera kaydındaki 23:40 boşluğu ile eldivendeki balmumu lekesi, ifadeleri kırar.",

  scene: {
    name: "Karatay Medresesi müze eki — Konya",
    description:
      "Taş revaklı dar sergi salonu. Vitrinler loş LED ile aydınlatılmış; orta vitrinde mühür için kadife yastık. Yan odada envanter masası, mühür mumu ve kayıt defteri.",
    details:
      "Vitrin camında ince kesik. 22:50'de kapanış kaydı var. 23:40–23:52 kamera kör noktası. Masada soğumuş mühür mumu; lavaboda balmumulu eldiven. Miray'ın kalemi eşikte.",
  },

  time: {
    dateLabel: "3 Ekim 2026, Cumartesi gecesi",
    timeOfCrime: "23:40–23:55 civarı",
    atmosphere:
      "Serin Karatay gecesi — taş soğuğu, uzak ezan sonrası sessizlik, mum ve toz kokusu",
  },

  suspects: [
    {
      id: "suspect-c5-deniz",
      name: "Deniz Uçar",
      age: 33,
      occupation: "Envanter memuru",
      biography:
        "Müze envanterini iki yıldır tutuyor. Düzenli, kısa cümleli. Son aylarda özel koleksiyonculardan 'katalog yardımı' teklifleri aldığı konuşuluyor.",
      relationshipToVictim:
        "Emre Tan'ın envanter sorumlusu; vitrin anahtar setine ve kapanış prosedürüne erişimi var.",
      claimedAlibi:
        "22:50 kapanıştan sonra çıktım. Gece müzeye dönmedim; mühre dokunmadım.",
    },
    {
      id: "suspect-c5-hakan",
      name: "Hakan Soylu",
      age: 41,
      occupation: "Gece güvenlik görevlisi",
      biography:
        "Medrese kompleksinde gece turu yapıyor. Anahtarlık belinde; kazan dairesi ve yan kapıları kontrol eder. Sessiz, savunmacı konuşur.",
      relationshipToVictim:
        "Emre'nin gece güvenliği; ana salon kamera izni ve yan kapı anahtarı onda.",
      claimedAlibi:
        "23:30'da yalnızca kazan dairesindeydim. Sergi salonuna girmedim; vitrine yaklaşmadım.",
    },
    {
      id: "suspect-c5-miray",
      name: "Miray Şen",
      age: 29,
      occupation: "Hattat / misafir araştırmacı",
      biography:
        "Ankara'dan Selçuklu mühür motifleri için kısa süreli araştırma izniyle gelmiş. Kalemi ve defteri hep yanında; dakikalarına bağlı.",
      relationshipToVictim:
        "Emre'nin davetlisi; gündüz vitrin fotoğrafı ve motif çizimi yaptı.",
      claimedAlibi:
        "21:30'da salondan ayrıldım. Gece geri dönmedim; kalemimi eşikte düşürmüş olabilirim.",
    },
  ],

  evidence: [
    {
      id: "evidence-c5-camera-gap",
      name: "Kamera boşluğu — 23:40",
      description:
        "Sergi salonu kamerasında 23:40–23:52 arası kayıt yok. Aynı dakikalarda envanter odası hareket sensörü tetiklenmiş; sisteme Deniz'in kullanıcı koduyla 'bakım' notu düşülmüş.",
      discoveryLocation: "Güvenlik odası / DVR özeti",
      relatedSuspectIds: ["suspect-c5-deniz"],
      isRedHerring: false,
    },
    {
      id: "evidence-c5-wax-glove",
      name: "Balmumulu eldiven",
      description:
        "Lavaboda tek eldiven; parmak uçlarında mührün envanter mumundan aynı balmumu ve bronz tozu. Eldiven bedeni Deniz'in envanter eldivenleriyle aynı seri.",
      discoveryLocation: "Müze eki lavabosu",
      relatedSuspectIds: ["suspect-c5-deniz"],
      isRedHerring: false,
    },
    {
      id: "evidence-c5-packing-slip",
      name: "Sahte paket fişi",
      description:
        "Deniz'in çantasında yarım doldurulmuş özel sevkiyat fişi: 'Arşiv mührü — özel inceleme, gece teslim.' Alıcı satırı karalanmış; tarih o geceye ait.",
      discoveryLocation: "Personel dolabı / Deniz'in çantası",
      relatedSuspectIds: ["suspect-c5-deniz"],
      isRedHerring: false,
    },
    {
      id: "evidence-c5-boiler-log",
      name: "Kazan dairesi tur kaydı",
      description:
        "Hakan'ın anahtarlığındaki elektronik tur noktası 23:32'de kazan dairesini onaylıyor. Sergi salonu tur noktası o gece işaretlenmemiş.",
      discoveryLocation: "Güvenlik tur cihazı",
      relatedSuspectIds: ["suspect-c5-hakan"],
      isRedHerring: false,
    },
    {
      id: "evidence-c5-miray-pen",
      name: "Miray'ın hattat kalemi",
      description:
        "Eşikte bulunan lake kalem: 'M. Şen'. Vitrine yakın düşmüş; üzerinde mühür mumu yok.",
      discoveryLocation: "Sergi salonu eşiği",
      relatedSuspectIds: ["suspect-c5-miray"],
      isRedHerring: true,
    },
  ],

  clues: [
    {
      id: "clue-c5-gap-window",
      text: "Hırsızlık kapanış ile sabah arasında; 23:40 kamera boşluğu kritik pencereyi işaret ediyor.",
      relatedEvidenceIds: ["evidence-c5-camera-gap"],
      relatedSuspectIds: ["suspect-c5-deniz", "suspect-c5-hakan"],
    },
    {
      id: "clue-c5-wax-vs-touch",
      text: "Deniz mühre dokunmadığını söylüyor; balmumulu eldiven bunu zora sokuyor.",
      relatedEvidenceIds: ["evidence-c5-wax-glove"],
      relatedSuspectIds: ["suspect-c5-deniz"],
    },
    {
      id: "clue-c5-pen-shadow",
      text: "Hattat kalemi Miray'ı gölgede bırakır; kalemin düşmüş olması gece dönüşü kanıtlamaz.",
      relatedEvidenceIds: ["evidence-c5-miray-pen"],
      relatedSuspectIds: ["suspect-c5-miray"],
    },
  ],

  statements: [
    {
      id: "stmt-c5-deniz-1",
      suspectId: "suspect-c5-deniz",
      text: "22:50 kapanıştan sonra çıktım. Gece müzeye hiç dönmedim; 23:00'ten sonra içeride değildim.",
    },
    {
      id: "stmt-c5-deniz-2",
      suspectId: "suspect-c5-deniz",
      text: "Mühre ve vitrine dokunmadım. Üzerimde balmumu veya bronz tozu olamaz.",
    },
    {
      id: "stmt-c5-hakan-1",
      suspectId: "suspect-c5-hakan",
      text: "23:30 civarı yalnızca kazan dairesindeydim. Sergi salonuna girmedim.",
    },
    {
      id: "stmt-c5-hakan-2",
      suspectId: "suspect-c5-hakan",
      text: "Vitrin anahtarı bende değildi; envanter seti Deniz'de kalır. Ben yan kapı ve kazan turundayım.",
    },
    {
      id: "stmt-c5-miray-1",
      suspectId: "suspect-c5-miray",
      text: "21:30'da çizimleri bitirip ayrıldım. Gece müzeye geri dönmedim.",
    },
    {
      id: "stmt-c5-miray-2",
      suspectId: "suspect-c5-miray",
      text: "Kalemimi çıkarken düşürmüş olabilirim; sabah duyunca şok oldum.",
    },
  ],

  canon: {
    victimName: "Emre Tan",
    victimDescription:
      "47 yaşında müze sorumlusu. Gece kaybolan parça, sergilenen Selçuklu arşiv mührüydü — envanter ve belge doğrulama için kritik.",
    killerSuspectId: "suspect-c5-deniz",
    motive:
      "Deniz Uçar, özel koleksiyoncuya satmak ve sahte envanter/sevkiyat belgesi düzenleyebilmek için Selçuklu arşiv mührünü çaldı. Gece teslim sözü vermişti.",
    methodOfCrime:
      "22:50 kapanıştan sonra Deniz 23:40'ta geri döndü, kamerayı 'bakım' notuyla kör etti, vitrini açtı, mührü aldı. Eldiveni lavaboya bıraktı; çantasına sahte paket fişi koydu. Hakan kazan turundaydı; Miray'ın gündüz düşen kalemi yanıltıcı kaldı.",
    realTimeline: [
      {
        id: "tl-c5-1",
        order: 1,
        timeLabel: "20:50",
        description:
          "Miray Şen motif çizimlerini tamamlar; Deniz kapanış envanterini hazırlar.",
        involvedSuspectIds: ["suspect-c5-miray", "suspect-c5-deniz"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c5-2",
        order: 2,
        timeLabel: "21:30",
        description:
          "Miray salondan ayrılır. Hattat kalemi eşikte düşer (fark edilmez).",
        involvedSuspectIds: ["suspect-c5-miray"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c5-3",
        order: 3,
        timeLabel: "22:50",
        description:
          "Deniz kapanış kaydını imzalar ve çıktığını bildirir. Hakan gece turuna başlar.",
        involvedSuspectIds: ["suspect-c5-deniz", "suspect-c5-hakan"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c5-4",
        order: 4,
        timeLabel: "23:32",
        description:
          "Hakan kazan dairesi tur noktasını onaylar; sergi salonuna girmez.",
        involvedSuspectIds: ["suspect-c5-hakan"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c5-5",
        order: 5,
        timeLabel: "23:40",
        description:
          "Deniz geri döner, kamerayı kör eder, vitrini açar, mührü alır.",
        involvedSuspectIds: ["suspect-c5-deniz"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c5-6",
        order: 6,
        timeLabel: "23:52",
        description:
          "Deniz lavaboya balmumulu eldiveni bırakır, yan kapıdan çıkar. Mühür çantadadır.",
        involvedSuspectIds: ["suspect-c5-deniz"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c5-7",
        order: 7,
        timeLabel: "08:10 (ertesi sabah)",
        description:
          "Emre Tan açılışta kesik cam ve boş yastığı görür; polisi arar.",
        involvedSuspectIds: [],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: [
      "stmt-c5-hakan-1",
      "stmt-c5-hakan-2",
      "stmt-c5-miray-1",
      "stmt-c5-miray-2",
    ],
    falseStatementIds: ["stmt-c5-deniz-1", "stmt-c5-deniz-2"],
    criticalEvidenceIds: [
      "evidence-c5-camera-gap",
      "evidence-c5-wax-glove",
      "evidence-c5-packing-slip",
      "evidence-c5-boiler-log",
    ],
  },

  endings: [
    {
      id: "ending-c5-correct",
      type: "dogru_suclama",
      title: "Kör Nokta",
      description:
        "Deniz Uçar suçlanır. 23:40 kamera boşluğu ve balmumu lekesi, erken çıktığı yalanını çürütür. Mühür hırsızlığı kapanır.",
      requiredSuspectId: "suspect-c5-deniz",
      requiredEvidenceIds: [
        "evidence-c5-camera-gap",
        "evidence-c5-wax-glove",
      ],
    },
    {
      id: "ending-c5-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Kalem",
      description:
        "Suç Miray Şen'e yıkılır. Düşmüş hattat kalemi gölge olur; gerçek hırsız envanter dolabında kalır.",
      requiredEvidenceIds: ["evidence-c5-miray-pen"],
    },
    {
      id: "ending-c5-perfect",
      type: "mukemmel_cozum",
      title: "Balmumu İzi",
      description:
        "Deniz doğru suçlanır; kamera boşluğu, balmumulu eldiven, sahte paket fişi ve Hakan'ın kazan turu birleşir. Motivasyon netleşir, Hakan ile Miray aklanır.",
      requiredSuspectId: "suspect-c5-deniz",
      requiredEvidenceIds: [
        "evidence-c5-camera-gap",
        "evidence-c5-wax-glove",
        "evidence-c5-packing-slip",
        "evidence-c5-boiler-log",
      ],
    },
  ],

  progress: {
    caseId: "case-005",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-16T15:00:00.000Z",
    updatedAt: "2026-09-16T15:00:00.000Z",
  },
};
