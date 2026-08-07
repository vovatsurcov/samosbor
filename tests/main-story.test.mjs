import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseMainStoryRecipient,
  completeMainStoryBeat,
  createInitialState,
  MAIN_STORY_CONTENT_VERSION,
  migrateGameState,
  migrateMainStoryContent,
  recordMainStoryEvidence,
  setProvisionalStoryFact,
  tickGame,
  tickMainStory,
} from "../app/game-engine.ts";

const COMPLETE_CAMPAIGN = {
  version: 1,
  currentQuest: "complete",
  completedQuests: ["START-001", "START-002", "START-003", "START-004", "START-005", "START-006", "START-007"],
  rewardedQuests: [],
  dispatcherBriefed: true,
  cityServicesVisited: ["registration", "medical", "archive"],
  approach: "scout",
  completedAtMs: 100,
};

function readyStoryState(zone = "floor545") {
  return migrateGameState({
    zone,
    campaign: COMPLETE_CAMPAIGN,
    settlementStory: {
      version: 1,
      arcs: {
        "545-dry-line": {
          status: "completed",
          stageIndex: 4,
          choice: null,
          startedAtMs: 10,
          completedAtMs: 100,
          outcome: "full",
        },
      },
      facts: ["545-dry-line:full"],
      defense545Priorities: [],
      casualtyPermissions: [],
      namedNpcStates: {},
    },
  });
}

test("основная линия спит до завершения старта и Сухой линии", () => {
  const state = createInitialState();
  assert.equal(state.mainStory.schemaVersion, 1);
  assert.equal(state.mainStory.contentVersion, MAIN_STORY_CONTENT_VERSION);
  assert.equal(state.mainStory.status, "dormant");
  assert.equal(state.mainStory.activeBeat, null);
});

test("после Сухой линии в Городе 545 начинается MAIN-001", () => {
  let state = readyStoryState("floor545");
  state = tickGame(state, 1);
  assert.equal(state.mainStory.status, "active");
  assert.equal(state.mainStory.activeBeat, "MAIN-001");
  assert.ok(state.mainStory.startedAtMs > 0);
});

test("доставка документа в Город 550 открывает Три подтверждения", () => {
  let state = readyStoryState("floor545");
  state = tickGame(state, 1);
  state = {
    ...state,
    zone: "floor554",
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, floor554: { x: 3, y: 32 } },
    },
  };
  state = tickGame(state, 1);
  assert.ok(state.mainStory.completedBeats.includes("MAIN-001"));
  assert.equal(state.mainStory.activeBeat, "MAIN-002");
});

test("MAIN-002 требует три независимых подтверждения", () => {
  let state = readyStoryState("floor545");
  state = tickGame(state, 1);
  state = { ...state, zone: "floor554" };
  state = tickGame(state, 1);
  state = recordMainStoryEvidence(state, "city550_archive");
  state = recordMainStoryEvidence(state, "liquidators");
  assert.equal(state.mainStory.activeBeat, "MAIN-002");
  assert.equal(state.mainStory.evidence.length, 2);
  state = recordMainStoryEvidence(state, "lift_dispatch");
  assert.equal(state.mainStory.activeBeat, "MAIN-003");
  assert.ok(state.mainStory.completedBeats.includes("MAIN-002"));
});

test("выбор получателя сохраняется отдельным фактом выбора", () => {
  let state = readyStoryState("floor545");
  state = tickGame(state, 1);
  state = { ...state, zone: "floor554" };
  state = tickGame(state, 1);
  for (const source of ["city550_archive", "liquidators", "lift_dispatch"]) {
    state = recordMainStoryEvidence(state, source);
  }
  state = completeMainStoryBeat(state, "MAIN-003");
  assert.equal(state.mainStory.activeBeat, "MAIN-004");
  state = chooseMainStoryRecipient(state, "nii_archivists");
  assert.equal(state.mainStory.recipient, "nii_archivists");
  assert.equal(state.mainStory.choices["MAIN-004:recipient"], "nii_archivists");
  assert.equal(state.mainStory.activeBeat, "MAIN-005");
});

test("открытие Города 539 закрывает MAIN-005 без фиксации природы Нулевой линии", () => {
  let state = migrateGameState({
    zone: "floor556",
    campaign: COMPLETE_CAMPAIGN,
    mainStory: {
      schemaVersion: 1,
      contentVersion: "1.0",
      status: "active",
      activeBeat: "MAIN-005",
      completedBeats: ["MAIN-001", "MAIN-002", "MAIN-003", "MAIN-004"],
      startedAtMs: 1,
      completedAtMs: 0,
      evidence: ["city550_archive", "lift_dispatch", "liquidators"],
      recipient: "liquidators",
      choices: { "MAIN-004:recipient": "liquidators" },
      facts: [],
      provisionalFacts: {},
      migrationNotes: [],
    },
  });
  state = {
    ...state,
    zone: "floor539",
    visited: { ...state.visited, floor539: ["3:33"] },
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, floor539: { x: 3, y: 33 } },
    },
  };
  state = tickMainStory(state);
  assert.ok(state.mainStory.completedBeats.includes("MAIN-005"));
  assert.equal(state.mainStory.activeBeat, "MAIN-006");
  assert.deepEqual(state.mainStory.provisionalFacts, {});
});

test("спорные сведения хранятся как provisionalFacts и могут быть пересмотрены", () => {
  let state = readyStoryState();
  state = setProvisionalStoryFact(state, "zero_line_predicts_samosbor", "suggested");
  assert.equal(state.mainStory.provisionalFacts.zero_line_predicts_samosbor, "suggested");
  state = setProvisionalStoryFact(state, "zero_line_predicts_samosbor", "rejected");
  assert.equal(state.mainStory.provisionalFacts.zero_line_predicts_samosbor, "rejected");
});

test("смена редакции сюжета не сбрасывает пройденные beat-ID и выборы", () => {
  let state = migrateGameState({
    campaign: COMPLETE_CAMPAIGN,
    mainStory: {
      schemaVersion: 1,
      contentVersion: "0.9",
      status: "active",
      activeBeat: "MAIN-004",
      completedBeats: ["MAIN-001", "MAIN-002", "MAIN-003"],
      startedAtMs: 10,
      completedAtMs: 0,
      evidence: ["city550_archive", "lift_dispatch", "liquidators"],
      recipient: null,
      choices: { old_choice: "kept" },
      facts: ["document-authentic"],
      provisionalFacts: { inspector_k0_is_role: "suggested" },
      migrationNotes: [],
    },
  });
  state = migrateMainStoryContent(state, "1.1");
  assert.equal(state.mainStory.contentVersion, "1.1");
  assert.deepEqual(state.mainStory.completedBeats, ["MAIN-001", "MAIN-002", "MAIN-003"]);
  assert.equal(state.mainStory.choices.old_choice, "kept");
  assert.equal(state.mainStory.provisionalFacts.inspector_k0_is_role, "suggested");
  assert.ok(state.mainStory.migrationNotes.some((note) => note.includes("0.9->1.1")));
});
