import test from "node:test";
import assert from "node:assert/strict";

import {
  SKILL_NAMES,
  TALENT_NODES,
  archetypeFor,
  branchPointsByDirection,
  canAllocateTalent,
  createInitialState,
  directionCommitment,
  investDirection,
  migrateGameState,
  talentBonus,
} from "../app/game-engine.ts";

const DIRECTIONS = ["power", "guard", "agility", "precision", "suppression", "resonance"];

test("классовых веток скрытности и инженерной службы в дереве больше нет", () => {
  assert.deepEqual(Object.keys(SKILL_NAMES).sort(), [...DIRECTIONS].sort());
  for (const dead of ["stealth", "engineer", "force", "fire", "bulwark"]) {
    assert.equal(SKILL_NAMES[dead], undefined, `ветка ${dead} удалена`);
    assert.equal(
      TALENT_NODES.some((node) => node.scope === dead),
      false,
      `узлы ветки ${dead} удалены`,
    );
  }
});

test("дерево общее: шесть направлений по шестнадцать узлов плюс ядро и гибриды", () => {
  for (const direction of DIRECTIONS) {
    assert.equal(
      TALENT_NODES.filter((node) => node.scope === direction).length,
      16,
      direction,
    );
  }
  assert.equal(TALENT_NODES.filter((node) => node.scope === "core").length, 10);
  assert.equal(TALENT_NODES.filter((node) => node.scope === "hybrid").length, 15);
  assert.equal(TALENT_NODES.filter((node) => node.scope === "legendary").length, 4);
});

test("направление не выбирается, а проявляется из вложенных очков", () => {
  const state = createInitialState();
  assert.equal(archetypeFor(state), "power", "пустое дерево — базовое направление");
  assert.equal(directionCommitment(state), 0);

  const guarded = investDirection(state, "guard");
  assert.equal(archetypeFor(guarded), "bulwark");
  assert.ok(directionCommitment(guarded) > 0.9, "все очки в одном направлении");

  // Смешанный билд: ведущим остаётся то направление, куда вложено больше.
  const mixed = investDirection(investDirection(state, "guard", 5), "agility", 2);
  assert.equal(archetypeFor(mixed), "bulwark");
  assert.ok(directionCommitment(mixed) < 1, "смешение снижает заявленность направления");

  const points = branchPointsByDirection(mixed);
  assert.equal(points.guard, 5);
  assert.equal(points.agility, 2);
  assert.equal(points.resonance, 0);
});

test("свободный билд разрешает любое сочетание направлений", () => {
  let state = createInitialState();
  for (const direction of DIRECTIONS) state = investDirection(state, direction, 2);
  const points = branchPointsByDirection(state);
  for (const direction of DIRECTIONS) {
    assert.equal(points[direction], 2, `${direction}: очки вложены`);
  }
  // Ни одно направление не заявлено достаточно — билд остаётся базовым.
  assert.equal(archetypeFor(state), "power");
});

test("гибридные допуски связывают новые направления", () => {
  const state = investDirection(investDirection(createInitialState(), "precision", 8), "suppression", 8);
  assert.equal(canAllocateTalent(state, "hybrid:precision-suppression"), true);
  assert.equal(canAllocateTalent(createInitialState(), "hybrid:precision-suppression"), false);
});

test("устройства открываются талантом, а не классовой веткой", () => {
  const state = createInitialState();
  assert.equal(talentBonus(state, "droneDamage"), 0, "без талантов устройств нет");
  const engineered = investDirection(state, "suppression", 11);
  assert.ok(talentBonus(engineered, "droneDamage") > 0, "узел устройства даёт рембота");
});

test("старое сохранение переносит таланты на новые направления", () => {
  const migrated = migrateGameState({
    hero: {
      hp: 6,
      talents: ["core:01", "force:01", "force:02", "fire:03", "stealth:05", "engineer:11", "hybrid:fire-engineer"],
      discoveredTalents: ["legendary:kinetic-gyro"],
    },
  });
  const ids = migrated.hero.talents;
  assert.ok(ids.includes("core:01"), "узлы ядра сохраняются");
  assert.ok(ids.includes("power:01"), "force переехал в power");
  assert.ok(ids.includes("precision:03"), "fire переехал в precision");
  assert.ok(ids.includes("agility:05"), "stealth переехал в agility");
  assert.ok(ids.includes("suppression:11"), "engineer переехал в suppression");
  assert.ok(ids.includes("hybrid:precision-suppression"), "гибрид переименован");
  assert.equal(ids.some((id) => id.startsWith("force:") || id.startsWith("engineer:")), false);
  assert.ok(migrated.hero.discoveredTalents.includes("legendary:kinetic-gyro"));

  // Несуществующие узлы отбрасываются, а не ломают сохранение.
  const broken = migrateGameState({ hero: { talents: ["ghost:99", "core:02"] } });
  assert.deepEqual(broken.hero.talents, ["core:02"]);
});
