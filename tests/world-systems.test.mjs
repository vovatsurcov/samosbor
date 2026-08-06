import test from "node:test";
import assert from "node:assert/strict";

import {
  canFastTravel,
  commandDefensePreparation,
  commandFastTravel,
  communicationProgress,
  createInitialState,
  donateLiftResources,
  globalMapSnapshot,
  grantDefenseVictoryRewards,
  localMapSnapshot,
  recordDefenseWaveVictory,
  startDefenseEvent,
} from "../app/game-engine.ts";

function withPosition(state, zone, position) {
  return {
    ...state,
    zone,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [zone]: { ...position } },
      path: [],
      destination: null,
      attackTargetId: null,
      pendingInteraction: null,
    },
  };
}

test("мини-карта показывает разведанную область и героя", () => {
  let state = createInitialState();
  state = {
    ...state,
    visited: {
      ...state.visited,
      floor556: ["3:18", "4:18", "3:17", "3:19"],
    },
  };
  const snapshot = localMapSnapshot(state, 4);
  assert.equal(snapshot.zone, "floor556");
  assert.ok(snapshot.cells.some((cell) => cell.hero));
  assert.ok(snapshot.cells.some((cell) => cell.known));
  assert.ok(snapshot.cells.some((cell) => !cell.known));
});

test("глобальная карта скрывает неразведанные территории", () => {
  const state = createInitialState();
  const map = globalMapSnapshot(state);
  const current = map.nodes.find((node) => node.id === "technical556");
  const city545 = map.nodes.find((node) => node.id === "city545");
  assert.equal(current.discovered, true);
  assert.equal(current.current, true);
  assert.equal(city545.discovered, false);
  assert.ok(map.connections.length >= 8);
});

test("быстрое перемещение требует разведки и исправной связи", () => {
  let state = withPosition(createInitialState(), "floor554", { x: 4, y: 32 });
  let permission = canFastTravel(state, "city545");
  assert.equal(permission.allowed, false);
  assert.match(permission.reason, /не разведан/i);

  state = {
    ...state,
    visited: { ...state.visited, floor545: ["51:31"] },
    worldSystems: {
      ...state.worldSystems,
      communications: {
        ...state.worldSystems.communications,
        city545: {
          ...state.worldSystems.communications.city545,
          status: "online",
        },
      },
    },
  };
  permission = canFastTravel(state, "city545");
  assert.equal(permission.allowed, true);
  const travelled = commandFastTravel(state, "city545");
  assert.equal(travelled.zone, "floor545");
  assert.match(travelled.log[0], /Лифт принял маршрут/);
});

test("УМС принимает материалы и восстанавливает связь", () => {
  let state = withPosition(createInitialState(), "floor545", { x: 51, y: 31 });
  state = {
    ...state,
    hero: {
      ...state.hero,
      inventory: [
        ...state.hero.inventory,
        { instanceId: "test-coil", itemId: "coilPart", quantity: 8, condition: 100 },
        { instanceId: "test-kit", itemId: "repairKit", quantity: 2, condition: 100 },
        { instanceId: "test-battery", itemId: "batteryPack", quantity: 2, condition: 100 },
        { instanceId: "test-filter", itemId: "filterCartridge", quantity: 1, condition: 100 },
      ],
    },
  };
  const before = communicationProgress(state, "city545");
  assert.equal(before.complete, false);
  state = donateLiftResources(state, "city545");
  assert.equal(state.worldSystems.communications.city545.status, "online");
  assert.equal(state.worldSystems.communications.city545.repairedBy, "city");
  assert.equal(communicationProgress(state, "city545").complete, true);
  assert.match(state.log[0], /восстановлена/);
});

test("оборона города накапливает подготовку и создаёт награду Claude", () => {
  let state = startDefenseEvent(createInitialState(), "city545", "DEF-545", 16, 3);
  assert.equal(state.worldSystems.defense.city545.status, "warning");
  state = commandDefensePreparation(state, "city545", "fortify");
  state = commandDefensePreparation(state, "city545", "medical");
  assert.equal(state.worldSystems.defense.city545.preparedness, 5);

  state = recordDefenseWaveVictory(state, "city545", 3);
  state = recordDefenseWaveVictory(state, "city545", 3);
  state = recordDefenseWaveVictory(state, "city545", 3);
  assert.equal(state.worldSystems.defense.city545.status, "victory");

  const experienceBefore = state.hero.totalXp;
  state = grantDefenseVictoryRewards(state, "city545");
  assert.ok(state.hero.totalXp > experienceBefore);
  assert.equal(state.worldSystems.defense.city545.rewardClaimed, true);
  assert.equal(state.worldSystems.excellentRewards.length, 1);
  assert.equal(state.worldSystems.excellentRewards[0].quality, "excellent");
  assert.equal(state.worldSystems.excellentRewards[0].selectionAuthority, "claude");
  assert.equal(state.worldSystems.excellentRewards[0].itemId, null);
});
