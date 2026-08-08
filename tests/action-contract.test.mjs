import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_ACTIONS,
  SLOT_LABELS,
  isTransformed,
  resolveSlot,
  transformationsFor,
} from "../app/game-actions.ts";

import {
  createInitialState,
  heroAction,
  heroActionTransformed,
  heroMoveSpeed,
  isWalkable,
  migrateGameState,
  setAimPoint,
  setMoveIntent,
  setMovementAction,
  sprintMultiplier,
  tickGame,
} from "../app/game-engine.ts";

const at = (state, point) => ({
  ...state,
  hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { ...point } }, path: [], destination: null },
});
const give = (state, ids) => ({ ...state, hero: { ...state.hero, talents: [...state.hero.talents, ...ids] } });

test("у каждого базового слота есть действие и человеческое описание", () => {
  for (const slot of ["primary", "strong", "movement"]) {
    const action = BASE_ACTIONS[slot];
    assert.equal(action.slot, slot);
    assert.ok(action.name.length > 0 && action.description.length > 20, `${slot}: нечего показать игроку`);
    assert.ok(SLOT_LABELS[slot].length > 0);
  }
  assert.equal(BASE_ACTIONS.movement.sustained, true, "базовый Shift — удерживаемое ускорение, а не рывок");
});

test("базовый Shift ускоряет, а не переносит", () => {
  let state = at(createInitialState(), { x: 10, y: 9 });
  const before = state.hero.positions[state.zone];
  const walking = heroMoveSpeed(setMoveIntent(state, { x: 1, y: 0 }));

  state = setMovementAction(setMoveIntent(state, { x: 1, y: 0 }), true);
  const after = state.hero.positions[state.zone];
  assert.deepEqual(after, before, "нажатие Shift само по себе никуда не переносит");
  assert.ok(heroMoveSpeed(state) > walking, "но движение становится быстрее");
  assert.ok(sprintMultiplier(state) > 1);
});

test("ускорение тратит дыхание и выдыхается на исходе", () => {
  let state = setMovementAction(setMoveIntent(at(createInitialState(), { x: 10, y: 9 }), { x: 1, y: 0 }), true);
  const breathBefore = state.hero.breath;
  for (let frame = 0; frame < 20; frame += 1) state = tickGame(state, 100);
  assert.ok(state.hero.breath < breathBefore, "удержание стоит дыхания");

  const spent = { ...state, hero: { ...state.hero, breath: 2 } };
  assert.equal(sprintMultiplier(spent), 1, "без дыхания ускорения нет");

  const released = setMovementAction(state, false);
  assert.equal(sprintMultiplier(released), 1, "отпустил — обычный шаг");
});

test("талант заменяет слот целиком, и это видно", () => {
  const base = createInitialState();
  assert.equal(heroAction(base, "movement").id, "base:sprint");
  assert.equal(heroActionTransformed(base, "movement"), false);

  const resonance = give(base, ["resonance:04"]);
  assert.equal(heroAction(resonance, "movement").id, "resonance:shift");
  assert.equal(heroActionTransformed(resonance, "movement"), true);
  assert.equal(heroAction(resonance, "movement").sustained, false, "перенос — разовое действие");

  // Замены есть и у других слотов, и у других направлений: это не класс.
  assert.equal(heroAction(give(base, ["power:09"]), "strong").id, "power:strong");
  assert.equal(heroAction(give(base, ["resonance:09"]), "primary").id, "resonance:primary");
  assert.equal(heroAction(give(base, ["agility:04"]), "movement").id, "agility:shift");

  // Гибрид собирает замены разных направлений одновременно.
  const hybrid = give(base, ["resonance:04", "power:09"]);
  assert.equal(heroAction(hybrid, "movement").id, "resonance:shift");
  assert.equal(heroAction(hybrid, "strong").id, "power:strong");
});

test("замена не переносит героя вслепую и не втыкает его в стену", () => {
  const hero = { x: 10, y: 9 };
  const resonance = give(at(createInitialState(), hero), ["resonance:04"]);

  // Без направления действие не срабатывает, а не уходит в случайную сторону.
  const blind = setMovementAction(resonance, true);
  assert.deepEqual(blind.hero.positions[blind.zone], hero, "без направления переноса нет");
  assert.match(blind.log[0], /направление не задано/i);

  // По курсору — переносит.
  const aimed = setMovementAction(setAimPoint(resonance, { x: hero.x + 6, y: hero.y }), true);
  assert.ok(aimed.hero.positions[aimed.zone].x > hero.x + 3, "перенос идёт к курсору");

  // В стену — останавливается на проходимой клетке, а не проваливается.
  const intoWall = setMovementAction(setAimPoint(resonance, { x: hero.x, y: hero.y - 9 }), true);
  const landing = intoWall.hero.positions[intoWall.zone];
  assert.ok(isWalkable(intoWall, { x: Math.round(landing.x), y: Math.round(landing.y) }), "приземление проходимо");
});

test("замена переживает сохранение и снимается при сбросе талантов", async () => {
  const base = createInitialState();
  const transformed = give(base, ["resonance:04"]);
  const restored = migrateGameState(JSON.parse(JSON.stringify(transformed)));
  assert.equal(heroAction(restored, "movement").id, "resonance:shift", "замена переживает загрузку");

  // Сброс талантов возвращает базовое действие: призрачных режимов не остаётся.
  const respecced = { ...restored, hero: { ...restored.hero, talents: [] } };
  assert.equal(heroAction(respecced, "movement").id, "base:sprint");
  assert.equal(heroActionTransformed(respecced, "movement"), false);
  assert.equal(sprintMultiplier(setMovementAction(respecced, true)), 1.42, "базовое ускорение снова работает");
});

test("замены объявлены данными и требуют глубины, а не класса", () => {
  for (const slot of ["primary", "strong", "movement"]) {
    for (const action of transformationsFor(slot)) {
      assert.equal(action.slot, slot);
      assert.ok(action.replaces, `${action.id}: не сказано, что заменяется`);
      assert.ok(action.talentId, `${action.id}: нет узла, который его включает`);
      assert.ok(action.requires?.points > 0, `${action.id}: доступ должен зависеть от вложений`);
      assert.ok(action.description.length > 20, `${action.id}: игроку не объяснили`);
    }
  }
  // Нет ни одного условия вида «только для направления X».
  assert.equal(resolveSlot("movement", []).id, BASE_ACTIONS.movement.id);
  assert.equal(isTransformed("movement", ["resonance:04"]), true);
});
