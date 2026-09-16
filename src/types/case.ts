/**
 * AI Detective — Case Engine veri yapıları.
 *
 * Tasarım ilkesi:
 * - `CaseCanon` vakadaki değiştirilemez gerçeklerdir (katil, motivasyon, gerçek zaman çizelgesi,
 *   hangi ifadelerin doğru/yanlış olduğu). Üretildikten sonra Gemini veya başka bir katman
 *   bu gerçekleri yeniden yazamaz; yalnızca `PlayerProgress` değişir.
 * - Oyuncuya gösterilecek tüm metin alanları Türkçe olmalıdır (`locale: "tr"`).
 */

/** Sabit dil: kullanıcıya dönük içerik her zaman Türkçe. */
export type CaseLocale = "tr";

export type CaseId = string;
export type SuspectId = string;
export type EvidenceId = string;
export type ClueId = string;
export type StatementId = string;
export type TimelineEventId = string;
export type EndingId = string;

export type CaseStatus = "in_progress" | "solved" | "failed" | "abandoned";

export type EndingType =
  | "dogru_suclama"
  | "yanlis_suclama"
  | "eksik_kanit"
  | "mukemmel_cozum";

/** Vaka kimliği ve üst bilgi (sunum; gerçekleri değiştirmez). */
export interface CaseMeta {
  id: CaseId;
  /** Türkçe vaka başlığı */
  title: string;
  /** Türkçe kısa özet */
  summary: string;
  locale: CaseLocale;
  schemaVersion: number;
  createdAt: string;
  /**
   * `true` olduktan sonra `CaseCanon` ve ona bağlı kimlik referansları
   * yeniden üretilmemeli / değiştirilmemelidir.
   */
  factsLocked: boolean;
}

/** Olay yeri — Türkçe anlatım. */
export interface CrimeScene {
  /** Mekân adı (ör. "Moda Sahil Kahvehanesi") */
  name: string;
  /** Oyuncuya gösterilen yer tarifi */
  description: string;
  /** Ek mekân detayları */
  details: string;
}

/** Vakadaki zaman çerçevesi — Türkçe etiketler. */
export interface CaseTimeFrame {
  /** Tarih / dönem etiketi */
  dateLabel: string;
  /** Cinayetin gerçekleştiği saat / an */
  timeOfCrime: string;
  /** İsteğe bağlı dönem veya atmosfer (ör. "yağmurlu bir cumartesi gecesi") */
  atmosphere?: string;
}

/** Şüpheli profili — Türkçe biyografi ve iddialar. */
export interface Suspect {
  id: SuspectId;
  name: string;
  age?: number;
  occupation: string;
  biography: string;
  relationshipToVictim: string;
  /** Şüphelinin ileri sürdüğü mazeret (doğruluğu `CaseCanon` içinde belirlenir) */
  claimedAlibi: string;
}

/** Kanıt — Türkçe açıklama; niteliği canon ile tutarlı olmalıdır. */
export interface Evidence {
  id: EvidenceId;
  name: string;
  description: string;
  discoveryLocation: string;
  /**
   * UI “bağlantılı kişiler”.
   * case-001..007 öğretici/orta yoğunluk OK; case-008+ dengeli tut (AGENTS.md).
   */
  relatedSuspectIds: readonly SuspectId[];
  /** Yanıltıcı kanıt mı (gerçek, kilitlenince değişmez) */
  isRedHerring: boolean;
}

/** Oyuncuya sunulan ipucu — Türkçe metin. */
export interface Clue {
  id: ClueId;
  text: string;
  relatedEvidenceIds: readonly EvidenceId[];
  relatedSuspectIds: readonly SuspectId[];
}

/**
 * Şüpheli ifadesi.
 * Metin gösterim içindir; doğru/yanlış ayrımı yalnızca `CaseCanon` içinde tutulur.
 * Böylece Gemini ifadenin "gerçekliğini" sonradan değiştiremez.
 */
export interface SuspectStatement {
  id: StatementId;
  suspectId: SuspectId;
  /** Türkçe ifade metni */
  text: string;
}

/** Gerçek olay zaman çizelgesindeki tek bir an. */
export interface TimelineEvent {
  id: TimelineEventId;
  /** Kronolojik sıra (1, 2, 3…) */
  order: number;
  timeLabel: string;
  description: string;
  involvedSuspectIds: readonly SuspectId[];
  /**
   * `false` ise bu bilgi başlangıçta gizli gerçeklerdendir;
   * oyuncu ilerlemesiyle açığa çıkabilir, ama olayın kendisi değişmez.
   */
  isPubliclyKnown: boolean;
}

/**
 * Vakadaki kilitli gerçekler.
 * Gemini hikâye/metin üretebilir; bu blok üretildikten ve `factsLocked: true`
 * olduktan sonra kaynak gerçek olarak kabul edilir ve değiştirilmez.
 */
export interface CaseCanon {
  readonly victimName: string;
  readonly victimDescription: string;
  readonly killerSuspectId: SuspectId;
  /** Cinayet motivasyonu — Türkçe */
  readonly motive: string;
  /** İşleniş biçimi — Türkçe */
  readonly methodOfCrime: string;
  /** Olayın gerçek zaman çizelgesi */
  readonly realTimeline: readonly TimelineEvent[];
  /** Doğru (gerçek) ifadelerin kimlikleri */
  readonly trueStatementIds: readonly StatementId[];
  /** Yalan ifadelerin kimlikleri */
  readonly falseStatementIds: readonly StatementId[];
  /** Çözüm için kritik kanıtlar */
  readonly criticalEvidenceIds: readonly EvidenceId[];
}

/** Mümkün final / sonuç — Türkçe anlatım. */
export interface CaseEnding {
  id: EndingId;
  type: EndingType;
  title: string;
  description: string;
  /** Doğru suçlama finalinde beklenen şüpheli */
  requiredSuspectId?: SuspectId;
  /** Bu sonuca ulaşmak için gerekli kanıtlar */
  requiredEvidenceIds?: readonly EvidenceId[];
}

/**
 * Oyuncu ilerlemesi — tek değişken durum katmanı.
 * Canon / şüpheliler / kanıtlar burada değiştirilmez; yalnızca neyin keşfedildiği tutulur.
 */
export interface PlayerProgress {
  caseId: CaseId;
  status: CaseStatus;
  discoveredEvidenceIds: EvidenceId[];
  discoveredClueIds: ClueId[];
  interviewedSuspectIds: SuspectId[];
  revealedStatementIds: StatementId[];
  /** Oyuncunun kendi notları (Türkçe serbest metin) */
  notes: string;
  accusedSuspectId: SuspectId | null;
  unlockedEndingId: EndingId | null;
  startedAt: string;
  updatedAt: string;
}

/**
 * Tam vaka paketi.
 * Sunum verisi (`story`, `suspects`, …) + kilitli gerçekler (`canon`) + ilerleme (`progress`).
 */
export interface Case {
  meta: CaseMeta;
  /** Türkçe vaka hikâyesi (oyuncuya giriş anlatımı) */
  story: string;
  scene: CrimeScene;
  time: CaseTimeFrame;
  suspects: readonly Suspect[];
  evidence: readonly Evidence[];
  clues: readonly Clue[];
  /** Tüm ifadeler; doğruluk sınıflandırması `canon` içindedir */
  statements: readonly SuspectStatement[];
  canon: CaseCanon;
  endings: readonly CaseEnding[];
  progress: PlayerProgress;
}

/**
 * Mobil / public API vaka paketi.
 * Canon, isRedHerring ve ending çözüm gereksinimleri taşınmaz.
 */
export type PlayerSafeEvidence = Omit<Evidence, "isRedHerring">;

export type PlayerSafeEnding = Pick<
  CaseEnding,
  "id" | "type" | "title" | "description"
>;

export type PlayerSafeCase = {
  meta: CaseMeta;
  story: string;
  scene: CrimeScene;
  time: CaseTimeFrame;
  suspects: readonly Suspect[];
  evidence: readonly PlayerSafeEvidence[];
  clues: readonly Clue[];
  statements: readonly SuspectStatement[];
  endings: readonly PlayerSafeEnding[];
};
