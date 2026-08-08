import test from "node:test";
import assert from "node:assert/strict";

import {
  LOWER_REGION_ENEMIES,
  LOWER_REGION_MAPS,
  LOWER_REGION_OBJECTIVES,
  LOWER_REGION_POPULATIONS,
  LOWER_REGION_STARTS,
  LOWER_REGION_TERMINAL_MESSAGES,
  LOWER_REGION_ZONE_IDS,
  canFastTravel,
  commandFastTravel,
  commandInteractAt,
  createInitialState,
  globalMapSnapshot,
  isCitySafeZone,
  localMapSnapshot,
  mapForZone,
  migrateGameState,
  tickMainStory,
} from "../app/game-engine.ts";

const LOWER_ZONES = [
  "floor543", "floor542", "floor541", "floor540", "floor539",
  "floor538", "floor537", "floor536", "floor535", "floor534",
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

function reachable(map, start, target) {
  const queue = [start];
  const seen = new Set([`${start.x}:${start.y}`]);
  while (queue.length) {
    const point = queue.shift();
    if (point.x === target.x && point.y === target.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: point.x + dx, y: point.y + dy };
      const key = `${next.x}:${next.y}`;
      if (seen.has(key) || map.rows[next.y]?.[next.x] === "#" || map.rows[next.y]?.[next.x] == null) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return false;
}

function interactAtTile(state, zone, tile) {
  const map = mapForZone(zone);
  const point = findTile(map, tile)[0];
  assert.ok(point, `${zone}: отсутствует ${tile}`);
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

test("нижний регион содержит ровно десять этажей 543–534", () => {
  assert.deepEqual(LOWER_REGION_ZONE_IDS, LOWER_ZONES);
  assert.deepEqual(Object.keys(LOWER_REGION_MAPS), LOWER_ZONES);
  for (const zone of LOWER_ZONES) {
    const map = LOWER_REGION_MAPS[zone];
    assert.equal(map.rows.length, 36, zone);
    assert.ok(map.rows.every((row) => row.length === 56), zone);
    assert.equal(findTile(map, "U").length, 1, `${zone}: U`);
    assert.equal(findTile(map, "D").length, zone === "floor534" ? 0 : 1, `${zone}: D`);
  }
});

test("опасные нижние этажи имеют доступные гермоблоки", () => {
  for (const zone of LOWER_ZONES.filter((zone) => zone !== "floor539")) {
    const map = LOWER_REGION_MAPS[zone];
    const door = findTile(map, "H")[0];
    assert.ok(door, `${zone}: гермодверь`);
    assert.ok(findTile(map, "g").length >= 20, `${zone}: защищённая площадь`);
    assert.ok(reachable(map, LOWER_REGION_STARTS[zone], door), `${zone}: гермоблок недоступен`);
  }
});

test("Тепловой пост и Моторная артель имеют локальные контакты, а 539-й является городом", () => {
  assert.equal(findTile(LOWER_REGION_MAPS.floor542, "N").length, 1);
  assert.equal(findTile(LOWER_REGION_MAPS.floor536, "N").length, 1);
  assert.equal(findTile(LOWER_REGION_MAPS.floor539, "N").length, 1);
  assert.equal(findTile(LOWER_REGION_MAPS.floor539, "L").length, 1);
  assert.equal(isCitySafeZone("floor539"), true);
});

test("все этажи имеют собственные популяции, терминалы и цели", () => {
  for (const zone of LOWER_ZONES) {
    assert.ok(LOWER_REGION_POPULATIONS.some((population) => population.zone === zone), `${zone}: population`);
    assert.ok(LOWER_REGION_TERMINAL_MESSAGES[zone], `${zone}: terminal text`);
    assert.ok(LOWER_REGION_OBJECTIVES[zone], `${zone}: objective`);
  }
});

test("на опасных этажах существуют физические противники, на 534-м есть босс", () => {
  const state = createInitialState();
  for (const zone of LOWER_ZONES.filter((zone) => zone !== "floor539")) {
    assert.ok(LOWER_REGION_ENEMIES.some((enemy) => enemy.zone === zone), `${zone}: enemy spec`);
    assert.ok(state.enemies.some((enemy) => enemy.zone === zone && enemy.hp > 0), `${zone}: runtime enemy`);
  }
  const boss = state.enemies.find((enemy) => enemy.id === "534-frontier");
  assert.ok(boss);
  assert.equal(boss.rank, "boss");
});

test("нижний выход Города 545 соединён с этажом 543", () => {
  let state = createInitialState();
  const lowerCity = mapForZone("floor544");
  assert.equal(findTile(lowerCity, "D").length, 1);
  state = interactAtTile(state, "floor544", "D");
  assert.equal(state.zone, "floor543");
  state = interactAtTile(state, "floor543", "U");
  assert.equal(state.zone, "floor544");
});

test("маршрут 543→534 проходит через все десять новых этажей", () => {
  let state = createInitialState();
  for (const zone of LOWER_ZONES.slice(0, -1)) {
    state = interactAtTile(state, zone, "D");
  }
  assert.equal(state.zone, "floor534");
});

test("обратный маршрут 534→543 работает без телепортации через город", () => {
  let state = createInitialState();
  for (const zone of [...LOWER_ZONES].reverse().slice(0, -1)) {
    state = interactAtTile(state, zone, "U");
  }
  assert.equal(state.zone, "floor543");
});

test("миграция сохраняет нижний этаж, позицию и разведку", () => {
  const migrated = migrateGameState({
    zone: "floor535",
    hero: { positions: { floor535: { x: 17, y: 18 } } },
    visited: { floor535: ["17:18", "18:18"] },
  });
  assert.equal(migrated.zone, "floor535");
  assert.deepEqual(migrated.hero.positions.floor535, { x: 17, y: 18 });
  assert.deepEqual(migrated.visited.floor535, ["17:18", "18:18"]);
  for (const zone of LOWER_ZONES) {
    assert.ok(migrated.hero.positions[zone], zone);
    assert.ok(Array.isArray(migrated.visited[zone]), zone);
  }
});

test("Город 539 является сюжетным шарниром MAIN-005", () => {
  let state = migrateGameState({
    zone: "floor539",
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
      choices: {},
      facts: [],
      provisionalFacts: {},
      migrationNotes: [],
    },
    hero: { positions: { floor539: { x: 3, y: 33 } } },
    visited: { floor539: ["3:33"] },
  });
  state = tickMainStory(state);
  assert.ok(state.mainStory.completedBeats.includes("MAIN-005"));
  assert.equal(state.mainStory.activeBeat, "MAIN-006");
});

test("глобальная карта показывает нижний регион и четыре осмысленных лифтовых узла", () => {
  const state = migrateGameState({
    zone: "floor539",
    hero: { positions: { floor539: { x: 51, y: 31 } } },
    visited: {
      floor543: ["6:31"], floor542: ["3:33"], floor541: ["3:33"], floor540: ["3:33"],
      floor539: ["51:31"], floor538: ["3:33"], floor537: ["6:31"], floor536: ["3:33"],
      floor535: ["3:33"], floor534: ["6:31"], floor545: ["51:31"],
    },
  });
  const map = globalMapSnapshot(state);
  for (const id of ["transit543", "city539", "grid537", "frontier534"]) {
    const node = map.nodes.find((entry) => entry.id === id);
    assert.ok(node, id);
    assert.equal(node.discovered, true, id);
    assert.ok(node.travelNodeId, id);
  }
  assert.ok(map.connections.some(([a, b]) => a === "city545" && b === "transit543"));
  assert.ok(map.connections.some(([a, b]) => a === "floor535" && b === "frontier534"));
});

test("быстрое перемещение в Город 539 работает только после восстановления связи", () => {
  let state = migrateGameState({
    zone: "floor545",
    hero: { positions: { floor545: { x: 51, y: 31 }, floor539: { x: 51, y: 31 } } },
    visited: { floor545: ["51:31"], floor539: ["51:31"] },
  });
  state = {
    ...state,
    worldSystems: {
      ...state.worldSystems,
      communications: {
        ...state.worldSystems.communications,
        city545: { ...state.worldSystems.communications.city545, status: "online" },
      },
    },
  };
  assert.equal(canFastTravel(state, "city539").allowed, false);
  state = {
    ...state,
    worldSystems: {
      ...state.worldSystems,
      communications: {
        ...state.worldSystems.communications,
        city539: { ...state.worldSystems.communications.city539, status: "online" },
      },
    },
  };
  assert.equal(canFastTravel(state, "city539").allowed, true);
  state = commandFastTravel(state, "city539");
  assert.equal(state.zone, "floor539");
});

test("мини-карта строится и на нижнем фронтире", () => {
  const state = migrateGameState({
    zone: "floor534",
    hero: { positions: { floor534: { x: 6, y: 31 } } },
    visited: { floor534: ["6:31", "7:31", "6:30"] },
  });
  const mini = localMapSnapshot(state, 5);
  assert.equal(mini.zone, "floor534");
  assert.ok(mini.cells.some((cell) => cell.hero));
});
