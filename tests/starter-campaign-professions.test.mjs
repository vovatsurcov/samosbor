import test from "node:test";
import assert from "node:assert/strict";

import {
  commandChoosePrimaryProfession,
  commandChooseStarterApproach,
  commandGrantTrialProfession,
  commandInteractAt,
  commandUnlockProfessionSpecialization,
  createInitialState,
  mapForZone,
  migrateGameState,
  recordCityServiceVisit,
  tickGame,
} from "../app/game-engine.ts";

function findTile(map, tile) {
  const points = [];
  map.rows.forEach((row, y) => {
    [...row].forEach((value, x) => {
      if (value === tile) points.push({ x, y });
    });
  });
  return points;
}

function interactAtTile(state, zone, tile) {
  const map = mapForZone(zone);
  const point = findTile(map, tile)[0];
  assert.ok(point, `${zone}: отсутствует ${tile}`);
  const positioned = {
    ...state,
    zone,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [zone]: { ...point } },
      path: [],
      destination: null,
    },
  };
  return commandInteractAt(positioned, point);
}

function advanceToCity550() {
  let state = createInitialState();
  state = interactAtTile(state, "floor556", "N");
  state = interactAtTile(state, "floor556", "S");
  state = interactAtTile(state, "floor556", "H");
  assert.equal(state.campaign.currentQuest, "START-004");
  state = interactAtTile(state, "floor556", "D");
  assert.equal(state.zone, "floor555");
  state = interactAtTile(state, "floor555", "D");
  assert.equal(state.zone, "floor554");
  assert.equal(state.campaign.currentQuest, "START-005");
  return state;
}

test("новая игра начинает версионируемую стартовую цепочку", () => {
  const state = createInitialState();
  assert.equal(state.campaign.version, 1);
  assert.equal(state.campaign.currentQuest, "START-001");
  assert.deepEqual(state.campaign.completedQuests, []);
  assert.equal(state.professions.version, 1);
  assert.equal(state.professions.primaryDirection, null);
});

test("Орлова, датчик и гермоблок последовательно закрывают первые три задания", () => {
  let state = createInitialState();
  const xpBefore = state.hero.totalXp;
  state = interactAtTile(state, "floor556", "N");
  assert.equal(state.campaign.currentQuest, "START-002");
  assert.ok(state.campaign.completedQuests.includes("START-001"));
  assert.ok(state.hero.totalXp > xpBefore);

  state = interactAtTile(state, "floor556", "S");
  assert.equal(state.sensorFixed, true);
  assert.equal(state.campaign.currentQuest, "START-003");

  state = interactAtTile(state, "floor556", "H");
  assert.equal(state.missionComplete, true);
  assert.equal(state.campaign.currentQuest, "START-004");
});

test("первый маршрут приводит к городскому знакомству и требует пробный допуск", () => {
  let state = advanceToCity550();
  state = recordCityServiceVisit(state, "registration");
  state = recordCityServiceVisit(state, "medical");
  state = recordCityServiceVisit(state, "archive");
  assert.equal(state.campaign.cityServicesVisited.length, 3);
  assert.equal(state.campaign.currentQuest, "START-005");

  state = commandGrantTrialProfession(state, "electromechanic");
  assert.equal(state.professions.trialPermit, "electromechanic");
  assert.equal(state.campaign.currentQuest, "START-006");
});

test("восстановленная внешняя связь открывает Нижнюю смену", () => {
  let state = advanceToCity550();
  state = recordCityServiceVisit(state, "registration");
  state = recordCityServiceVisit(state, "medical");
  state = recordCityServiceVisit(state, "archive");
  state = commandGrantTrialProfession(state, "comms_specialist");
  assert.equal(state.campaign.currentQuest, "START-006");

  state = {
    ...state,
    worldSystems: {
      ...state.worldSystems,
      communications: {
        ...state.worldSystems.communications,
        technical556: {
          ...state.worldSystems.communications.technical556,
          status: "online",
          repairedBy: "hero",
        },
      },
    },
  };
  state = tickGame(state, 1);
  assert.equal(state.campaign.currentQuest, "START-007");
});

test("выбор разведки и прибытие в Город 545 завершают стартовую кампанию", () => {
  let state = migrateGameState({
    campaign: {
      version: 1,
      currentQuest: "START-007",
      completedQuests: ["START-001", "START-002", "START-003", "START-004", "START-005", "START-006"],
      rewardedQuests: ["START-001", "START-004", "START-005", "START-006"],
      dispatcherBriefed: true,
      cityServicesVisited: ["registration", "medical", "archive"],
      approach: null,
      completedAtMs: 0,
    },
  });
  state = commandChooseStarterApproach(state, "scout");
  assert.equal(state.campaign.approach, "scout");
  state = {
    ...state,
    zone: "floor545",
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, floor545: { x: 3, y: 33 } },
    },
  };
  state = tickGame(state, 1);
  assert.equal(state.campaign.currentQuest, "complete");
  assert.ok(state.campaign.completedQuests.includes("START-007"));
  assert.ok(state.campaign.completedAtMs > 0);
});

test("после START-007 выбирается отдельная мировая профессия", () => {
  let state = migrateGameState({
    campaign: {
      version: 1,
      currentQuest: "complete",
      completedQuests: ["START-001", "START-002", "START-003", "START-004", "START-005", "START-006", "START-007"],
      rewardedQuests: [],
      dispatcherBriefed: true,
      cityServicesVisited: ["registration", "medical", "archive"],
      approach: "caravan",
      completedAtMs: 100,
    },
  });
  state = commandChoosePrimaryProfession(state, "infrastructure");
  assert.equal(state.professions.primaryDirection, "infrastructure");
  assert.equal(state.professions.pointsAvailable, 1);

  state = commandUnlockProfessionSpecialization(state, "electromechanic");
  assert.ok(state.professions.specializations.includes("electromechanic"));
  assert.equal(state.professions.pointsAvailable, 0);
  assert.equal(state.professions.pointsSpent, 1);

  const unchanged = commandChoosePrimaryProfession(state, "support");
  assert.equal(unchanged.professions.primaryDirection, "infrastructure");
});

test("профессиональные и боевые бюджеты не смешиваются", () => {
  const state = createInitialState();
  assert.ok(Number.isFinite(state.hero.skillPoints));
  assert.ok(Number.isFinite(state.hero.generalPoints));
  assert.equal(state.professions.pointsAvailable, 0);
  assert.equal("professionPoints" in state.hero, false);
});
