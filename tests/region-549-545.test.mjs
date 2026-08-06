import test from "node:test";
import assert from "node:assert/strict";

import {
  REGION_MAPS,
  REGION_STARTS,
  REGION_TRANSITIONS,
  REGION_POPULATIONS,
  REGION_SAFE_ZONES,
} from "../app/game-region-549-545.ts";
import {
  commandInteractAt,
  createInitialState,
  isCitySafeZone,
  mapForZone,
  migrateGameState,
  objectiveFor,
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

test("регион 549–545 содержит пять карт единого производственного масштаба", () => {
  assert.deepEqual(Object.keys(REGION_MAPS).sort(), ["floor545", "floor546", "floor547", "floor548", "floor549"]);
  for (const [zone, map] of Object.entries(REGION_MAPS)) {
    assert.equal(map.rows.length, 36, zone);
    assert.ok(map.rows.every((row) => row.length === 56), zone);
    assert.equal(findTile(map, "U").length, 1, `${zone}: U`);
    if (zone !== "floor545") assert.equal(findTile(map, "D").length, 1, `${zone}: D`);
  }
});

test("опасные этажи имеют доступные гермокомнаты", () => {
  for (const zone of ["floor549", "floor548", "floor547", "floor546"]) {
    const map = REGION_MAPS[zone];
    const door = findTile(map, "H")[0];
    assert.ok(door, `${zone}: гермодверь`);
    assert.ok(findTile(map, "g").length >= 20, `${zone}: защищённая площадь`);
    assert.ok(reachable(map, REGION_STARTS[zone], door), `${zone}: гермодверь недоступна`);
  }
});

test("все переходы и специальные точки достижимы", () => {
  for (const [zone, map] of Object.entries(REGION_MAPS)) {
    const start = REGION_STARTS[zone];
    for (const tile of ["U", ...(zone === "floor545" ? [] : ["D"])]) {
      assert.ok(reachable(map, start, findTile(map, tile)[0]), `${zone}: ${tile}`);
    }
  }
  const voidGate = findTile(REGION_MAPS.floor547, "P")[0];
  assert.ok(voidGate);
  assert.ok(reachable(REGION_MAPS.floor547, REGION_STARTS.floor547, voidGate));
  assert.equal(Object.keys(REGION_TRANSITIONS).length, 10);
});

test("переход с этажа 550 ведёт через всю цепочку до поселения 545", () => {
  let state = createInitialState();
  state = interactAtTile(state, "floor550", "D");
  assert.equal(state.zone, "floor549");
  state = interactAtTile(state, "floor549", "D");
  assert.equal(state.zone, "floor548");
  state = interactAtTile(state, "floor548", "D");
  assert.equal(state.zone, "floor547");
  state = interactAtTile(state, "floor547", "D");
  assert.equal(state.zone, "floor546");
  state = interactAtTile(state, "floor546", "D");
  assert.equal(state.zone, "floor545");
});

test("обратный маршрут возвращает героя с 545-го на 550-й", () => {
  let state = createInitialState();
  for (const zone of ["floor545", "floor546", "floor547", "floor548", "floor549"]) {
    state = interactAtTile(state, zone, "U");
  }
  assert.equal(state.zone, "floor550");
});

test("Сухой док является защищённым поселением без вражеских проявлений", () => {
  const state = createInitialState();
  assert.equal(isCitySafeZone("floor545"), true);
  assert.equal(REGION_SAFE_ZONES.has("floor545"), true);
  assert.equal(state.enemies.filter((enemy) => enemy.zone === "floor545" && enemy.hp > 0).length, 0);
  assert.match(objectiveFor({ ...state, zone: "floor545" }), /Сухого дока|поселение/i);
});

test("на четырёх опасных этажах существуют физические популяции", () => {
  const state = createInitialState();
  assert.equal(REGION_POPULATIONS.length, 5);
  for (const zone of ["floor549", "floor548", "floor547", "floor546"]) {
    assert.ok(state.populations.some((population) => population.zone === zone));
    assert.ok(state.enemies.some((enemy) => enemy.zone === zone && enemy.hp > 0));
  }
});

test("Смотритель ГУ-46 проявляется как региональный босс", () => {
  const state = createInitialState();
  const boss = state.enemies.find((enemy) => enemy.id === "546-overseer");
  assert.ok(boss);
  assert.equal(boss.rank, "boss");
  assert.ok(boss.hp >= 45);
  assert.ok(boss.damage >= 6);
});

test("разрыв НИИ-547 ведёт в существующую войд-зону", () => {
  const state = interactAtTile(createInitialState(), "floor547", "P");
  assert.equal(state.zone, "voidLab");
});

test("миграция старого сохранения добавляет позиции и разведку новых этажей", () => {
  const migrated = migrateGameState({});
  for (const zone of Object.keys(REGION_MAPS)) {
    assert.deepEqual(migrated.hero.positions[zone], REGION_STARTS[zone]);
    assert.ok(Array.isArray(migrated.visited[zone]));
  }
});
