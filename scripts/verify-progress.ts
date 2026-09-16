import {
  resetPlayerProgress,
  applyCaseResultProgress,
  claimCaseResultXp,
  buildCaseResultXpAwardKey,
  getPlayerProgress,
  getSolvedCaseIds,
  flushPlayerProgressPersist,
  addPlayerXp,
} from "../src/store/playerProgress";
import { isCasePlayable } from "../src/utils/caseRoute";
import { xpRewardForSolveResult } from "../src/utils/progression";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Node smoke için AsyncStorage'ın beklediği localStorage yüzeyi */
const memoryStore = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (key: string) =>
      memoryStore.has(key) ? memoryStore.get(key)! : null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, String(value));
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => {
      memoryStore.clear();
    },
  },
};

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("PASS:", msg);
}

async function main() {
  await AsyncStorage.clear();
  resetPlayerProgress();
  await flushPlayerProgressPersist();
  await AsyncStorage.clear();
  resetPlayerProgress();

  const h = getPlayerProgress();
  assert(h.totalXp === 0 && h.level === 1, "reset empty start");

  assert(
    buildCaseResultXpAwardKey("case-001", "perfect", 100) === "case-001:perfect",
    "award key without score"
  );
  assert(
    buildCaseResultXpAwardKey("case-001", "perfect", 85) === "case-001:perfect",
    "award key stable across scores"
  );

  assert(isCasePlayable("case-001", []) === true, "case-001 always playable");
  assert(isCasePlayable("case-002", []) === false, "case-002 locked initially");
  assert(
    isCasePlayable("case-002", ["case-001"]) === true,
    "case-002 unlocks after 001"
  );

  const xpPerfect = xpRewardForSolveResult("perfect");
  const first = applyCaseResultProgress({
    caseId: "case-001",
    result: "perfect",
    xpAmount: xpPerfect,
    markSolved: true,
  });
  assert(
    first.claimed === true && first.gainedXp === xpPerfect,
    "first perfect XP claimed"
  );
  assert(getSolvedCaseIds().includes("case-001"), "case-001 marked solved");
  assert(
    isCasePlayable("case-002", getSolvedCaseIds()) === true,
    "unlock after mark solved"
  );

  const second = applyCaseResultProgress({
    caseId: "case-001",
    result: "perfect",
    xpAmount: xpPerfect,
    markSolved: true,
  });
  assert(
    second.claimed === false && second.gainedXp === 0,
    "duplicate perfect XP blocked"
  );

  const third = claimCaseResultXp(
    buildCaseResultXpAwardKey("case-001", "perfect", 50),
    xpPerfect
  );
  assert(
    third.claimed === false && third.gainedXp === 0,
    "legacy score key still blocked"
  );

  const wrong = applyCaseResultProgress({
    caseId: "case-001",
    result: "wrong",
    xpAmount: xpRewardForSolveResult("wrong"),
    markSolved: false,
  });
  assert(wrong.claimed === true, "wrong result can still award once");
  const wrong2 = applyCaseResultProgress({
    caseId: "case-001",
    result: "wrong",
    xpAmount: xpRewardForSolveResult("wrong"),
    markSolved: false,
  });
  assert(wrong2.claimed === false, "duplicate wrong blocked");

  await flushPlayerProgressPersist();
  const raw = await AsyncStorage.getItem("ai-detective.playerProgress.v1");
  assert(!!raw && raw.includes("case-001"), "persisted solved case-001");
  assert(!!raw && raw.includes("case-001:perfect"), "persisted award key");

  const savedXp = getPlayerProgress().totalXp;
  addPlayerXp(10);
  await flushPlayerProgressPersist();
  assert(
    getPlayerProgress().totalXp === savedXp + 10,
    "addPlayerXp updates total"
  );

  const c2 = applyCaseResultProgress({
    caseId: "case-002",
    result: "correct",
    xpAmount: xpRewardForSolveResult("correct"),
    markSolved: true,
  });
  assert(c2.claimed === true, "case-002 correct XP once");
  const c2b = applyCaseResultProgress({
    caseId: "case-002",
    result: "correct",
    xpAmount: xpRewardForSolveResult("correct"),
    markSolved: true,
  });
  assert(c2b.claimed === false, "case-002 duplicate blocked");
  assert(getSolvedCaseIds().includes("case-002"), "case-002 solved");

  assert(
    isCasePlayable("case-003", getSolvedCaseIds()) === true,
    "case-003 unlocks after 002"
  );
  assert(
    isCasePlayable("case-004", getSolvedCaseIds()) === false,
    "case-004 locked until 003"
  );

  const c3 = applyCaseResultProgress({
    caseId: "case-003",
    result: "perfect",
    xpAmount: xpRewardForSolveResult("perfect"),
    markSolved: true,
  });
  assert(c3.claimed === true, "case-003 perfect XP once");
  assert(getSolvedCaseIds().includes("case-003"), "case-003 solved");
  assert(
    isCasePlayable("case-004", getSolvedCaseIds()) === true,
    "case-004 unlocks after 003"
  );

  await flushPlayerProgressPersist();
  console.log("\nALL PROGRESS CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
