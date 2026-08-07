import test from "node:test";
import assert from "node:assert/strict";

import {
  advanceSettlementArc,
  applyNamedNpcCondition,
  authorizeNamedNpcCasualty,
  chooseCity545DefensePriorities,
  chooseSettlementArcOption,
  claimCity545DefenseReward,
  completeSettlementArc,
  createInitialState,
  migrateGameState,
  prepareCity545Defense,
  recordCity545DefenseWave,
  startCity545DefenseMission,
  startSettlementArc,
  tickGame,
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

function postStarterState(extra = {}) {
  return migrateGameState({ campaign: COMPLETE_CAMPAIGN, ...extra });
}

test("городские арки закрыты до стартовой аттестации", () => {
  const state = createInitialState();
  assert.equal(state.settlementStory.version, 1);
  assert.equal(state.settlementStory.arcs["550-city-memory"].status, "locked");
  assert.equal(state.settlementStory.arcs["545-lower-workshop"].status, "locked");
});

test("после START-007 открываются четыре арки Города 550", () => {
  let state = postStarterState();
  state = tickGame(state, 1);
  for (const id of ["550-city-memory", "550-liquidator-shifts", "550-price-of-silence", "550-district-load"]) {
    assert.equal(state.settlementStory.arcs[id].status, "available", id);
  }
  assert.equal(state.settlementStory.arcs["545-lower-workshop"].status, "locked");
});

test("разведанный Город 545 открывает локальные побочные арки", () => {
  let state = postStarterState({
    visited: { floor545: ["3:33"] },
  });
  state = tickGame(state, 1);
  for (const id of ["545-dry-line", "545-lower-workshop", "545-caravan-debt", "545-hermetic-awake"]) {
    assert.equal(state.settlementStory.arcs[id].status, "available", id);
  }
});

test("обычная городская арка проходит стадии, сохраняет решение и мировой факт", () => {
  let state = postStarterState();
  state = startSettlementArc(state, "550-city-memory");
  assert.equal(state.settlementStory.arcs["550-city-memory"].status, "active");
  state = chooseSettlementArcOption(state, "550-city-memory", "restore");
  for (let index = 0; index < 4; index += 1) state = advanceSettlementArc(state, "550-city-memory");
  assert.equal(state.settlementStory.arcs["550-city-memory"].status, "completed");
  assert.equal(state.settlementStory.arcs["550-city-memory"].choice, "restore");
  assert.ok(state.settlementStory.facts.includes("550-city-memory:restore"));
});

test("Сухая линия синхронизируется с уже существующим региональным прогрессом", () => {
  let state = postStarterState({
    regionProgress: { questStage: "complete", bossDefeated: true, servicesRestored: true },
    visited: { floor545: ["3:33"] },
  });
  state = tickGame(state, 1);
  assert.equal(state.settlementStory.arcs["545-dry-line"].status, "completed");
  assert.equal(state.settlementStory.arcs["545-dry-line"].outcome, "full");
});

test("DEF-545 требует два приоритета, учитывает подготовку и завершает три волны", () => {
  let state = postStarterState({ visited: { floor545: ["3:33"] } });
  state = startCity545DefenseMission(state);
  assert.equal(state.settlementStory.arcs["545-city-holds-pressure"].status, "active");
  assert.equal(state.worldSystems.defense.city545.status, "warning");

  state = chooseCity545DefensePriorities(state, ["upper_gate"]);
  assert.equal(state.settlementStory.defense545Priorities.length, 0);
  state = chooseCity545DefensePriorities(state, ["upper_gate", "communications"]);
  assert.deepEqual(state.settlementStory.defense545Priorities, ["upper_gate", "communications"]);

  for (const action of ["fortify", "power", "medical", "recon"]) {
    state = prepareCity545Defense(state, action);
  }
  assert.ok(state.worldSystems.defense.city545.preparedness >= 8);

  state = recordCity545DefenseWave(state, 2);
  state = recordCity545DefenseWave(state, 2);
  state = recordCity545DefenseWave(state, 2);
  assert.equal(state.worldSystems.defense.city545.status, "victory");
  assert.equal(state.settlementStory.arcs["545-city-holds-pressure"].status, "completed");
  assert.equal(state.settlementStory.arcs["545-city-holds-pressure"].outcome, "full");
});

test("награда DEF-545 выдаёт много опыта и сохраняет excellent-контракт Claude", () => {
  let state = postStarterState({ visited: { floor545: ["3:33"] } });
  state = startCity545DefenseMission(state);
  state = chooseCity545DefensePriorities(state, ["production", "hermetic"]);
  for (const action of ["fortify", "power", "medical", "recon"]) state = prepareCity545Defense(state, action);
  for (let wave = 0; wave < 3; wave += 1) state = recordCity545DefenseWave(state, 3);
  const beforeXp = state.hero.totalXp;
  state = claimCity545DefenseReward(state);
  assert.ok(state.hero.totalXp > beforeXp);
  assert.equal(state.worldSystems.defense.city545.rewardClaimed, true);
  const contract = state.worldSystems.excellentRewards.at(-1);
  assert.equal(contract.quality, "excellent");
  assert.equal(contract.selectionAuthority, "claude");
  assert.equal(contract.itemId, null);
});

test("именованный NPC не меняет состояние без разрешения критической миссии", () => {
  let state = postStarterState();
  state = applyNamedNpcCondition(state, "550-city-memory", "city-registrar", "dead");
  assert.equal(state.settlementStory.namedNpcStates["city-registrar"], undefined);
  assert.match(state.log[0], /нет явного разрешения/i);
});

test("DEF-545 может явно разрешить сюжетную потерю именованного NPC", () => {
  let state = postStarterState({ visited: { floor545: ["3:33"] } });
  state = startCity545DefenseMission(state);
  state = authorizeNamedNpcCasualty(state, "DEF-545", "dock-mechanic");
  state = applyNamedNpcCondition(state, "DEF-545", "dock-mechanic", "injured");
  assert.deepEqual(state.settlementStory.namedNpcStates["dock-mechanic"], {
    condition: "injured",
    causeMissionId: "DEF-545",
  });
});

test("необъявленная миссия не получает право убивать именованных NPC", () => {
  let state = postStarterState();
  state = authorizeNamedNpcCasualty(state, "RANDOM-EVENT", "dock-mechanic");
  state = applyNamedNpcCondition(state, "RANDOM-EVENT", "dock-mechanic", "dead");
  assert.equal(state.settlementStory.namedNpcStates["dock-mechanic"], undefined);
});
