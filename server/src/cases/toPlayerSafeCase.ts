import type { Case, PlayerSafeCase } from "../../../src/types/case";

/**
 * Oyuncuya / mobil API'ye gidebilecek vaka paketi.
 * Canon, isRedHerring ve ending çözüm gereksinimleri ASLA dahil edilmez.
 */
export function toPlayerSafeCase(caseData: Case): PlayerSafeCase {
  return {
    meta: caseData.meta,
    story: caseData.story,
    scene: caseData.scene,
    time: caseData.time,
    suspects: caseData.suspects,
    evidence: caseData.evidence.map(({ isRedHerring: _hidden, ...safe }) => safe),
    clues: caseData.clues,
    statements: caseData.statements,
    endings: caseData.endings.map((ending) => ({
      id: ending.id,
      type: ending.type,
      title: ending.title,
      description: ending.description,
    })),
  };
}
