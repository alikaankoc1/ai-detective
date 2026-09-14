/**
 * Contradiction Engine — oyuncuya güvenli tipler.
 * Katil, motivasyon, isRedHerring veya gizli timeline ASLA burada taşınmaz.
 */

export type ContradictionSeverity = "low" | "medium" | "high" | "critical";

/**
 * Mobil / API'ye gönderilebilecek çelişki özeti.
 * Yalnızca oyuncunun bilmesi gereken alanlar.
 */
export type PlayerSafeContradiction = {
  id: string;
  suspectId: string;
  relatedEvidenceId: string;
  /** Oyuncuya gösterilen çelişki açıklaması (gizli canon ifşa etmez) */
  contradictionDescription: string;
  severity: ContradictionSeverity;
};

export type ContradictionCheckResult =
  | {
      found: true;
      contradiction: PlayerSafeContradiction;
    }
  | {
      found: false;
      contradiction: null;
    };
