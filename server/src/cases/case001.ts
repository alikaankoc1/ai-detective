import type { Case } from "../../../src/types/case";

/**
 * Örnek vaka: "03:17'deki Telefon"
 * Gerçekler `canon` içinde kilitlidir (`factsLocked: true`).
 */
export const case001: Case = {
  meta: {
    id: "case-001",
    title: "03:17'deki Telefon",
    summary:
      "Kadıköy'de bir gece, kurbanın telefonu 03:17'de çalar. Sabah ise cesedi bulunur. Üç şüpheli, bir sessiz arama ve karanlık bir sır.",
    locale: "tr",
    schemaVersion: 1,
    createdAt: "2026-09-14T00:00:00.000Z",
    factsLocked: true,
  },

  story:
    "İstanbul'un Kadıköy yakasında, Moda'ya inen dar bir sokağın üst katında yaşayan bağımsız belgeselci Kerem Aslan, son günlerde kimsenin bilmesini istemediği bir kayıt üzerinde çalışıyordu. Komşular gece yarısından sonra yüksek ses duymadıklarını söylüyor; ama telefon kayıtları başka bir şey fısıldıyor: 03:17'de gelen, yanıtlanmayan bir arama. Sabah kapısı aralık bulunan dairede Kerem yerde yatıyor, yanında kırık bir fincan ve hâlâ titreşen ekran. Yağmur camlara vuruyor. Şehir uyanmadan önce, bu vakanın karanlığı çoktan yerleşmiş durumda.",

  scene: {
    name: "Kerem Aslan'ın dairesi — Kadıköy, Moda",
    description:
      "Eski bir apartmanın üçüncü katında, tek odalı bir stüdyo daire. Perdeler yarı kapalı, masa üstü kayıt cihazları ve notlarla dolu. Işık loş; yalnızca mutfak tezgâhındaki lambadan sarı bir huzme sızıyor.",
    details:
      "Giriş holünde ıslak ayakkabı izleri var. Salonun ortasında ters dönmüş bir sandalye. Balkon kapısı kilitli. Cadde tarafındaki pencere aralık; uzaktan vapur düdüğü duyuluyor.",
  },

  time: {
    dateLabel: "14 Mart 2026, Cumartesi'yi Pazar'a bağlayan gece",
    timeOfCrime: "03:10 civarı",
    atmosphere:
      "Karanlık, gizemli, sinematik — yağmurlu Kadıköy gecesi, ıslak sokaklar, uzak sirenler",
  },

  suspects: [
    {
      id: "suspect-ayse",
      name: "Ayşe Demir",
      age: 31,
      occupation: "Yapımcı / eski iş ortağı",
      biography:
        "Kerem'le iki yıldır aynı yapım şirketinde çalışmış, üç ay önce yollarını ayırmış sert mizaçlı bir yapımcı. Sponsorluk sözleşmelerini o yönetirdi. Geceye damgasını vuran soğukkanlılığıyla tanınır.",
      relationshipToVictim: "Eski iş ortağı; aralarında bitmemiş bir hesap ve gizli bir dosya vardı.",
      claimedAlibi:
        "O gece evde yalnızdım. Saat ikiden sonra uyudum, sabaha kadar kimseyle konuşmadım.",
    },
    {
      id: "suspect-baran",
      name: "Baran Kılıç",
      age: 36,
      occupation: "Komşu / müzisyen",
      biography:
        "Alt kattaki dairede yaşayan bar müzisyeni. Kerem'le sık sık geç saatlere kadar tartışırlardı; ses yalıtımı zayıf binada herkes bunu duyardı. Borç meseleleri ve gürültü şikayetleriyle bilinen gergin bir komşuluk.",
      relationshipToVictim: "Alt komşu; gürültü ve borç yüzünden sürekli tartışıyorlardı.",
      claimedAlibi:
        "Caferağa'daki barda çalıyordum. Setim gece yarısından sonra bitti, sonra arkadaşlarla kaldım.",
    },
    {
      id: "suspect-selim",
      name: "Selim Arslan",
      age: 34,
      occupation: "Kuzen / yatırımcı",
      biography:
        "Kerem'in kuzeni. Belgesel projesine para yatırmış, son haftalarda geri ödeme konusunda baskı yapmaya başlamıştı. Düzenli, kontrollü konuşur; duygularını belli etmez.",
      relationshipToVictim: "Kuzen ve proje yatırımcısı; alacak-verecek gerginliği vardı.",
      claimedAlibi:
        "Ankara'daydım. Gece uçuşum vardı, sabah erken toplantım için otelde kaldım.",
    },
  ],

  evidence: [
    {
      id: "evidence-phone",
      name: "Kilit ekranındaki 03:17 araması",
      description:
        "Kerem'in telefonunda 03:17'de Selim Arslan'dan gelen yanıtsız bir arama kaydı var. Arama 18 saniye çalmış, açılmamış.",
      discoveryLocation: "Kurbanın sağ elinin yanında, halının üzerinde",
      relatedSuspectIds: ["suspect-selim"],
      isRedHerring: false,
    },
    {
      id: "evidence-cup",
      name: "Kırık fincan ve soğuk çay",
      description:
        "Salon zemininde kırık bir porselen fincan. İçinde yarım kalmış adaçayı. Kenarında ikinci bir dudak izine benzer leke var.",
      discoveryLocation: "Salon ortası, ters dönmüş sandalyenin yanında",
      relatedSuspectIds: ["suspect-ayse"],
      isRedHerring: false,
    },
    {
      id: "evidence-wet-prints",
      name: "Islak ayakkabı izleri",
      description:
        "Giriş holünden salona doğru uzanan, yağmurdan ıslanmış ayakkabı tabanı izleri. İzler bir noktada duruyor; balkona gitmiyor.",
      discoveryLocation: "Daire girişi ve salon halısı",
      relatedSuspectIds: ["suspect-ayse", "suspect-baran"],
      isRedHerring: false,
    },
    {
      id: "evidence-usb",
      name: "Gizli USB bellek",
      description:
        "Kitaplığın arkasında bantlanmış küçük bir USB. Üzerinde 'SON KESİT — YEDEK' yazıyor. İçerik henüz açılmamış gibi görünüyor.",
      discoveryLocation: "Kitaplık arkası",
      relatedSuspectIds: ["suspect-ayse"],
      isRedHerring: false,
    },
    {
      id: "evidence-bar-receipt",
      name: "Bar fişi",
      description:
        "Baran'ın ceket cebinden çıkan Caferağa bar fişi. Saat 01:40. Tek başına kanıtlamaz; ama geceyi orada geçirdiğini iddia ediyor.",
      discoveryLocation: "Baran Kılıç'ın ceket cebi (ifade sırasında)",
      relatedSuspectIds: ["suspect-baran"],
      isRedHerring: true,
    },
  ],

  clues: [
    {
      id: "clue-second-cup",
      text: "Mutfak lavabosunda ikinci bir fincanın ıslak tabanı var — evde yalnız değildi.",
      relatedEvidenceIds: ["evidence-cup"],
      relatedSuspectIds: ["suspect-ayse"],
    },
    {
      id: "clue-usb-password",
      text: "USB'nin yanında yırtık bir kâğıt parçası: 'sponsor_2025_ayse'. Dosya birini hedef alıyor olabilir.",
      relatedEvidenceIds: ["evidence-usb"],
      relatedSuspectIds: ["suspect-ayse"],
    },
    {
      id: "clue-call-not-killer",
      text: "03:17 araması cinayet anından sonra geliyor. Arayan, öldüren olmak zorunda değil — belki yanlış zamanda doğru numarayı çevirdi.",
      relatedEvidenceIds: ["evidence-phone"],
      relatedSuspectIds: ["suspect-selim"],
    },
    {
      id: "clue-shoe-size",
      text: "Islak izler 38 numara civarı bir tabana uyuyor. Baran 43 numara giyiyor.",
      relatedEvidenceIds: ["evidence-wet-prints"],
      relatedSuspectIds: ["suspect-ayse", "suspect-baran"],
    },
  ],

  statements: [
    {
      id: "stmt-ayse-1",
      suspectId: "suspect-ayse",
      text: "O gece Kerem'i aramadım ve evine hiç gitmedim. Saat ikiden sonra uyudum.",
    },
    {
      id: "stmt-ayse-2",
      suspectId: "suspect-ayse",
      text: "Sponsorluk hesaplarında bir usulsüzlük yoktu. Kerem abartıyordu.",
    },
    {
      id: "stmt-baran-1",
      suspectId: "suspect-baran",
      text: "Gece bar daydım. Kerem'in kapısına uğramadım; tartışmalarımız ses üzerinden olurdu.",
    },
    {
      id: "stmt-baran-2",
      suspectId: "suspect-baran",
      text: "Ondan 8000 lira alacağım vardı ama öldürecek kadar değil. Sabah kapısını aralık görünce polis çağırdım.",
    },
    {
      id: "stmt-selim-1",
      suspectId: "suspect-selim",
      text: "Ankara'daydım. Kerem'i 03:17'de aradım çünkü paramı ne zaman ödeyeceğini soracaktım; açmadı.",
    },
    {
      id: "stmt-selim-2",
      suspectId: "suspect-selim",
      text: "Projenin batacağını biliyordum ama ona zarar vermek istemezdim. O benim kuzenimdi.",
    },
  ],

  canon: {
    victimName: "Kerem Aslan",
    victimDescription:
      "34 yaşında, Kadıköy'de yaşayan bağımsız belgeselci. Son projesi, eski iş ortağının sponsorluk usulsüzlüklerini ortaya çıkaracaktı.",
    killerSuspectId: "suspect-ayse",
    motive:
      "Ayşe Demir, Kerem'in USB'de sakladığı sponsorluk usulsüzlüğü kanıtlarını yayınlamasını engellemek için onu öldürdü. Açığa çıkması kariyerini ve özgürlüğünü bitirecekti.",
    methodOfCrime:
      "Ayşe daireye yağmurda girdi, çay eşliğinde kısa bir yüzleşme yaşandı; ardından Kerem'i boğarak öldürdü. Ayrılırken telefon 03:17'de Selim'den çaldı — Ayşe yanıtlamadı ve kaçtı.",
    realTimeline: [
      {
        id: "tl-1",
        order: 1,
        timeLabel: "02:35",
        description:
          "Ayşe Demir yağmurda binaya girer. Ayakkabıları ıslaktır.",
        involvedSuspectIds: ["suspect-ayse"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-2",
        order: 2,
        timeLabel: "02:40–03:00",
        description:
          "Kerem ve Ayşe salonda yüzleşir. İkinci fincan çay konur; tartışma büyür. Kerem USB'deki dosyayı yayınlamakla tehdit eder.",
        involvedSuspectIds: ["suspect-ayse"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-3",
        order: 3,
        timeLabel: "03:10",
        description:
          "Ayşe Kerem'i boğarak öldürür. Sandalye devrilir, fincan kırılır.",
        involvedSuspectIds: ["suspect-ayse"],
        isPubliclyKnown: false,
      },
      {
        id: "tl-4",
        order: 4,
        timeLabel: "03:17",
        description:
          "Selim Arslan Ankara'dan Kerem'i arar. Telefon çalar, kimse açmaz. Ayşe panikle daireden ayrılır.",
        involvedSuspectIds: ["suspect-selim", "suspect-ayse"],
        isPubliclyKnown: true,
      },
      {
        id: "tl-5",
        order: 5,
        timeLabel: "08:20",
        description:
          "Baran Kılıç üst katın kapısını aralık görünce polis çağırır. Ceset resmi olarak bulunur.",
        involvedSuspectIds: ["suspect-baran"],
        isPubliclyKnown: true,
      },
    ],
    trueStatementIds: [
      "stmt-baran-1",
      "stmt-baran-2",
      "stmt-selim-1",
      "stmt-selim-2",
    ],
    falseStatementIds: ["stmt-ayse-1", "stmt-ayse-2"],
    criticalEvidenceIds: [
      "evidence-cup",
      "evidence-wet-prints",
      "evidence-usb",
      "evidence-phone",
    ],
  },

  endings: [
    {
      id: "ending-correct",
      type: "dogru_suclama",
      title: "03:17'nin Gölgesi",
      description:
        "Ayşe Demir suçlanır. USB'deki kayıtlar ve olay yerindeki izler, 03:17 aramasının katilden değil kuzeninden geldiğini ortaya koyar. Gerçek, yağmurlu Kadıköy gecesinde kilitlenir.",
      requiredSuspectId: "suspect-ayse",
      requiredEvidenceIds: [
        "evidence-usb",
        "evidence-cup",
        "evidence-wet-prints",
      ],
    },
    {
      id: "ending-wrong",
      type: "yanlis_suclama",
      title: "Yanlış Numara",
      description:
        "Suç Selim'e veya Baran'a yıkılır. 03:17 araması yanıltıcı bir gölge olur; gerçek katil kayıplara karışır. Dosya kapanır — ama hikâye bitmez.",
      requiredEvidenceIds: ["evidence-phone"],
    },
    {
      id: "ending-perfect",
      type: "mukemmel_cozum",
      title: "Kesim Tamam",
      description:
        "Ayşe doğru suçlanır; tüm kritik kanıtlar ve gizli ipuçları birleştirilir. USB açılır, zaman çizelgesi netleşir, 03:17'nin masum bir arama olduğu kanıtlanır. Vaka sinematik bir kapanışla sona erer.",
      requiredSuspectId: "suspect-ayse",
      requiredEvidenceIds: [
        "evidence-phone",
        "evidence-cup",
        "evidence-wet-prints",
        "evidence-usb",
      ],
    },
  ],

  progress: {
    caseId: "case-001",
    status: "in_progress",
    discoveredEvidenceIds: [],
    discoveredClueIds: [],
    interviewedSuspectIds: [],
    revealedStatementIds: [],
    notes: "",
    accusedSuspectId: null,
    unlockedEndingId: null,
    startedAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
  },
};
