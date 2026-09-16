/**
 * Case Engine smoke: registry, contradictions, unlock chain, solve Case 004.
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

  const c4 = getSupportedCase("case-004");
  assert(!!c4, "case-004 loads");
  assert(c4!.meta.factsLocked === true, "factsLocked");
  assert(c4!.meta.title === "Kırık Çini", "title");
  assert(
    /konya/i.test(c4!.story) && /konya/i.test(c4!.scene.name),
    "location Konya"
  );
  assert(c4!.suspects.length === 3, "3 suspects");
  assert(c4!.canon.killerSuspectId === "suspect-c4-cem", "canon killer");
  assert(!("canon" in toPlayerSafeCase(c4!)), "player-safe strips canon");

  const contradictions = getRegisteredContradictions("case-004");
  assert(contradictions.length === 3, "3 contradictions");
  assert(getMotiveKeywords("case-004").length > 0, "motive keywords");

  const hit = checkContradiction(
    "case-004",
    "suspect-c4-cem",
    "evidence-c4-shift-log"
  );
  assert(hit.found === true, "contradiction cem+log found");

  const miss = checkContradiction(
    "case-004",
    "suspect-c4-bahar",
    "evidence-c4-shift-log"
  );
  assert(miss.found === false, "no false contradiction bahar+log");

  assert(isCasePlayable("case-004", []) === false, "004 locked empty");
  assert(
    isCasePlayable("case-004", ["case-003"]) === true,
    "004 unlocks after 003"
  );
  assert(
    isCasePlayable("case-003", ["case-002"]) === true,
    "003 still unlocks after 002"
  );

  resetInvestigationState("case-004");
  for (const id of c4!.canon.criticalEvidenceIds) {
    discoverEvidence("case-004", id);
  }

  const perfect = solveCase("case-004", {
    suspectId: "suspect-c4-cem",
    motive:
      "Karaborsa alıcıya satmak ve sahte ihracat belgesi için çini parçasını çaldı, borç baskısıyla.",
    evidenceIds: [...c4!.canon.criticalEvidenceIds],
  });
  assert(perfect.correct === true, "perfect solve correct");
  assert(perfect.result === "perfect", "perfect result");

  const wrong = solveCase("case-004", {
    suspectId: "suspect-c4-bahar",
    motive: "Kişisel intikam için yaptı belki",
    evidenceIds: ["evidence-c4-visitor-badge"],
  });
  assert(wrong.correct === false, "wrong accuse not correct");
  assert(wrong.result === "wrong", "wrong result");

  // Regression: prior cases still registered
  assert(!!getSupportedCase("case-001"), "001 intact");
  assert(!!getSupportedCase("case-002"), "002 intact");
  assert(!!getSupportedCase("case-003"), "003 intact");

  console.log("\nALL CASE-004 CHECKS PASSED");
}

main();
