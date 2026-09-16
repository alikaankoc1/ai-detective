import type { Case } from "../../../src/types/case";

/**
 * Case #002 — "Kayıp Anahtar"
 * Kolay giriş vakası: 2 şüpheli, az delil, net çelişki.
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 */
export const case002: Case = {
  meta: {
    id: "case-002",
    title: "Kayıp Anahtar",
    summary:
      "Kadıköy'de yağmurlu bir akşam, apartman yöneticisi Murat Yalçın'ın kasa anahtarı kaybolur. Dairede yalnızca iki kişi vardır — ve küçük bir ıslak iz yalanı ele verir.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-16T00:00:00.000Z",
    factsLocked: true,
  },

  story:
    "Kadıköy'de sıradan bir apartmanın zemin katındaki yönetici dairesi, yağmurlu bir akşam loş ışıklarla aydınlanır. Apartman yöneticisi Murat Yalçın, kiracı aidatlarını sakladığı küçük kasasının anahtarını her zamanki yerinde — giriş holündeki askıda — arar. Askı boştur. Anahtarın kaybolduğu saatte dairede yalnızca iki kişi vardır: temizlik görevlisi Deniz Acar ve üst kat komşusu Emre Yıldız. Hırsızlık basit görünür. Ama askının önündeki ıslak ayak izi, şüphelilerden birinin sözünü bozar.",

  scene: {
    name: "Murat Yalçın'ın yönetici dairesi — Kadıköy",
    description:
      "Küçük, düzenli bir zemin kat dairesi. Salon sade mobilyalı; giriş holünde ahşap bir anahtar askısı asılı. Yağmur camlara vuruyor; holün tahta zemini yer yer nemli.",
    details:
      "Askı boş. Askının hemen önünde kısa bir ıslak ayak izi dizisi var; izler salona uzanmıyor. Salonda iki çay fincanı duruyor. Kasa, çalışma odasındaki dolabın içinde kilitli — anahtar olmadan açılamaz.",
  },

  time: {
    dateLabel: "16 Eylül 2026, Çarşamba akşamı",
    timeOfCrime: "19:20–19:25 civarı",
    atmosphere:
      "Yağmurlu Kadıköy akşamı — ıslak kaldırımlar, loş hol, apartman sessizliği",
  },

  suspects: [
    {
      id: "suspect-deniz",
      name: "Deniz Acar",
      age: 29,
      occupation: "Apartman temizlik görevlisi",
      biography:
        "Binada haftada üç gün çalışan, sessiz ve dikkatli bir temizlik görevlisi. Son haftalarda para konusunda gergin görünüyor; ama kimseyle sorun çıkarmıyor.",
      relationshipToVictim:
        "Murat'ın çalışanı; daireye ve yönetici rutinlerine aşina.",
      claimedAlibi:
        "Sadece salonda oturdum. Anahtar askısına hiç yaklaşmadım, hol'e uğramadım. Yağmurdan ıslanmadım.",
    },
    {
      id: "suspect-emre",
      name: "Emre Yıldız",
      age: 41,
      occupation: "Üst kat komşusu / muhasebeci",
      biography:
        "Üçüncü kattaki dairede yaşayan düzenli bir muhasebeci. Aidat ve tadilat konularında Murat'la sık konuşur. Sakin, net konuşur.",
      relationshipToVictim:
        "Komşu; o akşam aidat ve çatı tamiri için uğramıştı.",
      claimedAlibi:
        "Murat'la salonda oturup aidat konuştuk. Anahtarı görmedim; askıya hiç gitmedim.",
    },
  ],

  evidence: [
    {
      id: "evidence-key-hook",
      name: "Boş anahtar askısı",
      description:
        "Giriş holündeki ahşap askıda kasa anahtarı yok. Askının çengeli boş; anahtar her zaman burada asılı dururmuş.",
      discoveryLocation: "Daire giriş holü",
      relatedSuspectIds: ["suspect-deniz", "suspect-emre"],
      isRedHerring: false,
    },
    {
      id: "evidence-wet-prints",
      name: "Askı önündeki ıslak ayak izleri",
      description:
        "Anahtar askısının hemen önünde, yağmurdan ıslanmış kısa ayak izleri var. İzler askıya kadar geliyor; salona uzanmıyor.",
      discoveryLocation: "Giriş holü, anahtar askısının önü",
      relatedSuspectIds: ["suspect-deniz"],
      isRedHerring: false,
    },
    {
      id: "evidence-debt-sms",
      name: "Vadesi geçmiş borç SMS'i",
      description:
        "Deniz'in telefonunda bankadan gelen kısa mesaj: 'Kart borcunuzun son ödeme tarihi geçti. Acil ödeme bekleniyor.'",
      discoveryLocation: "Deniz Acar'ın çantası (ifade sırasında)",
      relatedSuspectIds: ["suspect-deniz"],
      isRedHerring: false,
    },
    {
      id: "evidence-tea-cups",
      name: "Salondaki iki çay fincanı",
      description:
        "Salondaki sehpada iki fincan çay duruyor. Biri Murat'a, diğeri Emre'ye ait gibi; konuşmanın salonda geçtiğini destekliyor.",
      discoveryLocation: "Salon sehpası",
      relatedSuspectIds: ["suspect-emre"],
      isRedHerring: true,
    },
  ],

  clues: [
    {
      id: "clue-prints-stop",
      text: "Islak izler yalnızca askıya kadar geliyor — salona değil. Anahtarı alan kişi holde kısa durmuş.",
      relatedEvidenceIds: ["evidence-wet-prints", "evidence-key-hook"],
      relatedSuspectIds: ["suspect-deniz"],
    },
    {
      id: "clue-money-pressure",
      text: "Deniz 'paramla ilgili sıkıntım yok' diyor; telefonundaki borç SMS'i aksini söylüyor.",
      relatedEvidenceIds: ["evidence-debt-sms"],
      relatedSuspectIds: ["suspect-deniz"],
    },
  ],

  statements: [
    {
      id: "stmt-deniz-1",
      suspectId: "suspect-deniz",
      text: "Anahtar askısına hiç yaklaşmadım. Sadece salonda oturdum, hol'e uğramadım. Yağmurdan da ıslanmadım.",
    },
    {
      id: "stmt-deniz-2",
      suspectId: "suspect-deniz",
      text: "Paramla ilgili bir sıkıntım yok. Kasadaki parayla veya anahtarla işim olmaz.",
    },
    {
      id: "stmt-emre-1",
      suspectId: "suspect-emre",
      text: "Murat'la salonda aidat konuştuk. Askıya gitmedim; anahtarı görmedim.",
    },
    {
      id: "stmt-emre-2",
      suspectId: "suspect-emre",
      text: "Deniz birkaç kez mutfağa ve hol tarafına gitti. Ben salondan kalkmadım.",
    },
  ],

  canon: {
    victimName: "Murat Yalçın",
    victimDescription:
      "48 yaşında apartman yöneticisi. Aidat nakitlerini çalışma odasındaki küçük kasada saklar; kasa anahtarı giriş holündeki askıda durur.",
    killerSuspectId: "suspect-deniz",
    motive:
      "Deniz Acar, vadesi geçmiş kart borcunu kapatmak için kasadaki aidat nakitine ulaşmak istedi. Anahtarı çalarak kasayı sonra açmayı planladı.",
    methodOfCrime:
      "Yağmurda ıslak ayakkabılarıyla daireye giren Deniz, Murat ve Emre salonda konuşurken holdeki askıdan kasa anahtarını aldı ve izlerini salona uzatmadan geri döndü.",
    realTimeline: [
      {
        id: "tl-c2-1",
        order: 1,
        timeLabel: "19:05",
        description:
          "Deniz Acar yağmurda binaya gelir. Ayakkabıları ıslaktır; yönetici dairesine girer.",
        involvedSuspectIds: ["suspect-deniz"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c2-2",
        order: 2,
        timeLabel: "19:10",
        description:
          "Emre Yıldız aidat konuşmak için uğrar. Murat salonda çay koyar.",
        involvedSuspectIds: ["suspect-emre"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-c2-3",
        order: 3,
        timeLabel: "19:20–19:25",
        description:
          "Murat ve Emre salonda konuşurken Deniz hol'e geçer, askıdan kasa anahtarını alır. Islak izler askıda kalır.",
        involvedSuspectIds: ["suspect-deniz"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-c2-4",
        order: 4,
        timeLabel: "19:45",
        description:
          "Murat anahtarı arar; askı boştur. Polis çağrılır, iki şüpheli ifadeye alınır.",
        involvedSuspectIds: ["suspect-deniz", "suspect-emre"],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: ["stmt-emre-1", "stmt-emre-2"],
    falseStatementIds: ["stmt-deniz-1", "stmt-deniz-2"],
    criticalEvidenceIds: [
      "evidence-key-hook",
      "evidence-wet-prints",
      "evidence-debt-sms",
    ],
  },

  endings: [
    {
      id: "ending-c2-correct",
      type: "dogru_suclama",
      title: "Askıdaki Boşluk",
      description:
        "Deniz Acar suçlanır. Islak ayak izleri ve boş askı, hol'e uğramadığını söyleyen ifadesini çürütür. Anahtar hırsızlığı kapanır.",
      requiredSuspectId: "suspect-deniz",
      requiredEvidenceIds: ["evidence-key-hook", "evidence-wet-prints"],
    },
    {
      id: "ending-c2-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Kapı",
      description:
        "Suç Emre'ye yıkılır. Salondaki çay fincanları yanıltıcı bir gölge olur; gerçek hırsız kayıplara karışır. Dosya erken kapanır.",
      requiredEvidenceIds: ["evidence-tea-cups"],
    },
    {
      id: "ending-c2-perfect",
      type: "mukemmel_cozum",
      title: "Anahtar Yerinde",
      description:
        "Deniz doğru suçlanır; ıslak izler, boş askı ve borç SMS'i birleştirilir. Motivasyon netleşir, Emre aklanır. Vaka temiz bir kapanışla biter.",
      requiredSuspectId: "suspect-deniz",
      requiredEvidenceIds: [
        "evidence-key-hook",
        "evidence-wet-prints",
        "evidence-debt-sms",
      ],
    },
  ],

  progress: {
    caseId: "case-002",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-16T00:00:00.000Z",
    updatedAt: "2026-09-16T00:00:00.000Z",
  },
};
