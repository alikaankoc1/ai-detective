/**
 * Oyuncuya gösterilen delil görünümü.
 * Case Engine gerçeklerini değiştirmez; `isRedHerring` ve canon gizlerini taşımaz.
 * İleride sorgu / çözüm sistemleri bu yapı üzerinden bağlanabilir.
 */
export type EvidenceCategory =
  | "dijital"
  | "fiziksel"
  | "iz"
  | "belge"
  | "diger";

export type EvidenceView = {
  id: string;
  caseId: string;
  catalogNumber: string;
  name: string;
  category: EvidenceCategory;
  categoryLabel: string;
  description: string;
  discoveryLocation: string;
  relatedSuspectIds: readonly string[];
  relatedSuspectNames: readonly string[];
  /** Oyuncunun inceleyebileceği halka açık notlar (gizli canon değil) */
  examinationNotes: readonly string[];
};
