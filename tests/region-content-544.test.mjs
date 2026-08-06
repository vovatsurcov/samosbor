import test from "node:test";
import assert from "node:assert/strict";

import {
  commandInteractAt,
  commandTalkToNpc,
  createInitialState,
  isCitySafeZone,
  mapForZone,
  migrateGameState,
  objectiveFor,
  tickGame,
} from "../app/game-engine.ts";
import {
  DEFAULT_REGIONAL_PROGRESS,
  REGION_PUMP_RELAYS,
  REGION_SETTLEMENT_NPCS,
} from "../app/game-region-content-544.ts";

const RESEARCH_POINTS = [
  { x: 46, y: 31 },
  { x: 16, y: 15 },
  { x: 42, y: 28 },
];

function findTile(map, tile) {
  const points = [];
  map.rows.forEach((row, y) => {
    [...row].forEach((value, x) => {
      if (value === tile) points.push({ x, y });
    });
  });
  return points;
}

function interactAt(state, zone, point) {
  return commandInteractAt({
    ...state,
    zone,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [zone]: { ...point } },
      path: [],
      destination: null,
    },
  }, point);
}

function interactWithNpc(state, npcId) {
  const npc = state.npcs.find((entry) => entry.id === npcId);
  assert.ok(npc, npcId);
  return commandTalkToNpc({
    ...state,
    zone: npc.zone,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [npc.zone]: { ...npc.position } },
      path: [],
      destination: null,
    },
  }, npc.id);
}

test("нижний Сухой док является отдельным безопасным этажом", () => {
  const map = mapForZone("floor544");
  assert.equal(map.id, "floor544");
  assert.equal(map.rows.length, 36);
  assert.ok(map.rows.every((row) => row.length === 56));
  assert.equal(findTile(map, "U").length, 1);
  assert.ok(findTile(map, "g").length >= 40);
  assert.equal(isCitySafeZone("floor544"), true);
});

test("спуск на 544-й закрыт до завершения операции", () => {
  const map = mapForZone("floor545");
  const down = findTile(map, "D")[0];
  assert.ok(down);
  const locked = interactAt(createInitialState(), "floor545", down);
  assert.equal(locked.zone, "floor545");
  assert.match(locked.log[0], /Нижний док закрыт/);

  const unlockedState = {
    ...locked,
    regionProgress: { ...locked.regionProgress, questStage: "complete", lowerDockUnlocked: true },
  };
  const unlocked = interactAt(unlockedState, "floor545", down);
  assert.equal(unlocked.zone, "floor544");
});

test("Сухой док населён жителями, торговцами и ликвидаторами", () => {
  const state = createInitialState();
  const expectedIds = new Set(REGION_SETTLEMENT_NPCS.map((npc) => npc.id));
  const actual = state.npcs.filter((npc) => expectedIds.has(npc.id));
  assert.equal(actual.length, REGION_SETTLEMENT_NPCS.length);
  assert.ok(actual.some((npc) => npc.zone === "floor545" && npc.kind === "merchant"));
  assert.ok(actual.some((npc) => npc.zone === "floor544" && npc.kind === "liquidator"));
  assert.ok(actual.every((npc) => npc.route.length >= 2));
});

test("староста запускает региональную операцию", () => {
  const state = interactWithNpc(createInitialState(), "dock-elder");
  assert.equal(state.regionProgress.questStage, "restore-pumps");
  assert.equal(state.regionProgress.settlementTrust, 1);
  assert.match(objectiveFor(state), /три силовых узла/i);
});

test("три реле восстанавливают насосы и сервисы поселения", () => {
  let state = interactWithNpc(createInitialState(), "dock-elder");
  for (const relay of Object.values(REGION_PUMP_RELAYS)) {
    state = interactAt(state, relay.zone, relay.position);
  }
  assert.equal(state.regionProgress.pumpRelays.length, 3);
  assert.equal(state.regionProgress.pumpsRestored, true);
  assert.equal(state.regionProgress.servicesRestored, true);
  assert.equal(state.regionProgress.questStage, "recover-archives");
  assert.match(objectiveFor(state), /три записи НИИ-547/i);
});

test("записи НИИ открывают этап охоты на Смотрителя", () => {
  let state = {
    ...createInitialState(),
    regionProgress: {
      ...DEFAULT_REGIONAL_PROGRESS,
      questStage: "recover-archives",
      pumpsRestored: true,
      servicesRestored: true,
      pumpRelays: Object.values(REGION_PUMP_RELAYS).map((relay) => relay.id),
    },
  };
  for (const point of RESEARCH_POINTS) {
    state = interactAt(state, "floor547", point);
  }
  assert.equal(state.regionProgress.researchRecords.length, 3);
  assert.equal(state.regionProgress.archiveComplete, true);
  assert.equal(state.regionProgress.questStage, "disable-overseer");
  assert.match(objectiveFor(state), /Смотрителя ГУ-46/i);
});

test("Смотритель последовательно включает вторую и третью фазы", () => {
  let state = {
    ...createInitialState(),
    zone: "floor546",
    regionProgress: { ...DEFAULT_REGIONAL_PROGRESS, questStage: "disable-overseer" },
  };
  const boss = state.enemies.find((enemy) => enemy.id === "546-overseer");
  assert.ok(boss);
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === boss.id ? { ...enemy, hp: Math.floor(enemy.maxHp * 0.6) } : enemy,
    ),
  };
  state = tickGame(state, 16);
  assert.equal(state.regionProgress.bossPhase, 2);
  const phaseTwo = state.enemies.find((enemy) => enemy.id === boss.id);
  assert.ok(phaseTwo.damage > boss.damage);

  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === boss.id ? { ...enemy, hp: Math.floor(enemy.maxHp * 0.25) } : enemy,
    ),
  };
  state = tickGame(state, 16);
  assert.equal(state.regionProgress.bossPhase, 3);
  const phaseThree = state.enemies.find((enemy) => enemy.id === boss.id);
  assert.ok(phaseThree.armor > phaseTwo.armor);
  assert.ok(phaseThree.attackCooldownBaseMs < phaseTwo.attackCooldownBaseMs);
});

test("цель живого Смотрителя меняется и давит на оборону поселения", () => {
  const state = {
    ...createInitialState(),
    worldTimeMs: 12050,
    regionProgress: { ...DEFAULT_REGIONAL_PROGRESS, bossGoalChangedAtMs: 0, settlementDefense: 8 },
  };
  const next = tickGame(state, 16);
  assert.equal(next.regionProgress.bossGoalIndex, 1);
  assert.equal(next.regionProgress.settlementDefense, 7);
  assert.match(next.log[0], /Смотритель ГУ-46 меняет задачу/);
});

test("отключение босса требует доклада старосте и открывает нижний док", () => {
  const initial = createInitialState();
  let state = {
    ...initial,
    regionProgress: { ...DEFAULT_REGIONAL_PROGRESS, questStage: "disable-overseer", bossPhase: 3 },
    enemies: initial.enemies.map((enemy) =>
      enemy.id === "546-overseer" ? { ...enemy, hp: 0, mode: "disabled" } : enemy,
    ),
  };
  state = tickGame(state, 16);
  assert.equal(state.regionProgress.bossDefeated, true);
  assert.equal(state.regionProgress.questStage, "report-to-dock");
  state = interactWithNpc(state, "dock-elder");
  assert.equal(state.regionProgress.questStage, "complete");
  assert.equal(state.regionProgress.lowerDockUnlocked, true);
});

test("миграция добавляет региональный прогресс и новых NPC без потери старых данных", () => {
  const fresh = createInitialState();
  const migrated = migrateGameState({
    regionProgress: { questStage: "recover-archives", pumpRelays: ["pump-west"] },
    npcs: [{ ...fresh.npcs[0], position: { x: 11, y: 11 } }],
  });
  assert.equal(migrated.regionProgress.questStage, "recover-archives");
  assert.deepEqual(migrated.regionProgress.pumpRelays, ["pump-west"]);
  assert.ok(migrated.npcs.some((npc) => npc.id === "dock-elder"));
  assert.ok(migrated.hero.positions.floor544);
  assert.ok(Array.isArray(migrated.visited.floor544));
});
