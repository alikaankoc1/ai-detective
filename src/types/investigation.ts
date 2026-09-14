/**
 * Investigation State — oyuncunun vaka araştırma ilerlemesi.
 * Canon / katil / motivasyon / isRedHerring ASLA burada tutulmaz.
 * İleride Supabase'e taşınabilir (playerId + caseId unique key).
 */

export type InvestigationState = {
  /** Gelecekte auth kullanıcı ID'si; şimdilik tek oturum için sabit anahtar */
  playerId: string;
  caseId: string;
  discoveredEvidenceIds: string[];
  interrogatedSuspectIds: string[];
  discoveredContradictionIds: string[];
  createdAt: string;
  updatedAt: string;
};
