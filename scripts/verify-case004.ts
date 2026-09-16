/**
 * Case Engine smoke: kolay→zor sıralama + registry/solve.
 * Çalıştır: npx tsx scripts/verify-case004.ts
 */
import {
  getSupportedCase,
  listSupportedCaseIds,
  getRegisteredContradictions,
  getMotiveKeywords,
} from "../server/src/cases/registry";
import { checkContradiction } from "../server/src/contradictions";
import { solveCase } from "../server/src/solve";
import {
  discoverEvidence,
  resetInvestigationState,
} from "../server/src/investigation";
import { isCasePlayable } from "../src/utils/caseRoute";
import { toPlayerSafeCase } from "../server/src/cases/toPlayerSafeCase";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("PASS:", msg);
}

function main() {
  const ids = listSupportedCaseIds();
  assert(ids.includes("case-001"), "registry has case-001");
  assert(ids.includes("case-002"), "registry has case-002");
  assert(ids.includes("case-003"), "registry has case-003");
  assert(ids.includes("case-004"), "registry has case-004");
  assert(ids.includes("case-005"), "registry has case-005");

  const c1 = getSupportedCase("case-001");
  const c2 = getSupportedCase("case-002");
  const c3 = getSupportedCase("case-003");
  const c4 = getSupportedCase("case-004");
  const c5 = getSupportedCase("case-005");

  assert(c1?.meta.title === "Kayıp Anahtar", "001 = Kayıp Anahtar (kolay)");
  assert(c2?.meta.title === "Son Metro", "002 = Son Metro (kolay-orta)");
  assert(c3?.meta.title === "Kırık Çini", "003 = Kırık Çini (orta)");
  assert(c4?.meta.title === "03:17'deki Telefon", "004 = 03:17 (zor)");
  assert(c5?.meta.title === "Karatay Mührü", "005 = Karatay Mührü (orta-zor)");

  assert(!!c3 && /kütahya|kutahya/i.test(c3.story), "003 location Kütahya");
  assert(!!c5 && /konya/i.test(c5.story) && /karatay/i.test(c5.story), "005 location Konya Karatay");
  assert(c3!.suspects.length === 3, "003 has 3 suspects");
  assert(c3!.canon.killerSuspectId === "suspect-c4-cem", "003 canon killer");
  assert(c5!.canon.killerSuspectId === "suspect-c5-deniz", "005 canon killer");
  assert(c1!.suspects.length === 2, "001 has 2 suspects");
  assert(c4!.suspects.length === 3, "004 has 3 suspects");

  assert(c1!.meta.factsLocked && c4!.meta.factsLocked, "factsLocked");
  assert(!("canon" in toPlayerSafeCase(c3!)), "player-safe strips canon");

  assert(getRegisteredContradictions("case-003").length === 3, "003 contradictions");
  assert(getRegisteredContradictions("case-005").length === 3, "005 contradictions");
  assert(getMotiveKeywords("case-001").includes("anahtar"), "001 motive keys");
  assert(getMotiveKeywords("case-004").includes("sponsor"), "004 motive keys");
  assert(getMotiveKeywords("case-005").includes("muhur"), "005 motive keys");

  const hit = checkContradiction(
    "case-003",
    "suspect-c4-cem",
    "evidence-c4-shift-log"
  );
  assert(hit.found === true, "contradiction cem+log on 003");

  assert(isCasePlayable("case-001", []) === true, "001 always open");
  assert(isCasePlayable("case-002", []) === false, "002 locked");
  assert(
    isCasePlayable("case-004", ["case-001", "case-002", "case-003"]) === true,
    "004 unlocks after 003"
  );
  assert(
    isCasePlayable("case-005", ["case-001", "case-002", "case-003", "case-004"]) === true,
    "005 unlocks after 004"
  );

  resetInvestigationState("case-003");
  for (const id of c3!.canon.criticalEvidenceIds) {
    discoverEvidence("case-003", id);
  }

  const perfect = solveCase("case-003", {
    suspectId: "suspect-c4-cem",
    motive:
      "Karaborsa alıcıya satmak ve sahte ihracat belgesi için çini parçasını çaldı, borç baskısıyla.",
    evidenceIds: [...c3!.canon.criticalEvidenceIds],
  });
  assert(perfect.correct === true && perfect.result === "perfect", "003 perfect");

  const wrong = solveCase("case-003", {
    suspectId: "suspect-c4-bahar",
    motive: "Kişisel intikam için yaptı belki",
    evidenceIds: ["evidence-c4-visitor-badge"],
  });
  assert(wrong.correct === false && wrong.result === "wrong", "003 wrong");

  console.log("\nALL DIFFICULTY-ORDER CHECKS PASSED");
}

main();
