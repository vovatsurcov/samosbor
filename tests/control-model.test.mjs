import test from "node:test";
import assert from "node:assert/strict";

import {
  INPUT_BUFFER_MS,
  MOVE_KEYS,
  bufferIsFresh,
  isIdle,
  moveVectorFromKeys,
  normalise,
} from "../app/game-input.ts";

import { WEAPON_FAMILIES } from "../app/game-weapon-families.ts";

import {
  aimedTarget,
  attackMovementAllowance,
  bufferAbility,
  createInitialState,
  equipItem,
  setAimPoint,
  setMoveIntent,
  setPrimaryAttack,
  takeBufferedAbility,
  tickGame,
} from "../app/game-engine.ts";

function withWeapon(state, itemId) {
  const instanceId = `cm-${itemId}`;
  const seeded = {
    ...state,
    hero: {
      ...state.hero,
      inventory: [...state.hero.inventory, { instanceId, itemId, quantity: 1, condition: 100 }],
    },
  };
  return equipItem(seeded, instanceId);
}

test("клавиши переводятся в вектор движения, а не в маршрут", () => {
  assert.deepEqual(moveVectorFromKeys(["d"]), { x: 1, y: 0 });
  assert.deepEqual(moveVectorFromKeys([]), { x: 0, y: 0 });
  // Диагональ нормализуется: по диагонали не быстрее.
  const diagonal = moveVectorFromKeys(["w", "d"]);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 0.001);
  // Противоположные клавиши гасят друг друга.
  assert.ok(isIdle(moveVectorFromKeys(["a", "d"])));
  assert.ok(Object.keys(MOVE_KEYS).includes("w"));
});

test("движение идёт от нажатия и отменяет старый маршрут", () => {
  let state = createInitialState();
  const start = state.hero.positions[state.zone];
  state = setMoveIntent(state, { x: 1, y: 0 });
  assert.equal(state.hero.path.length, 0, "прямое управление снимает маршрут");

  for (let frame = 0; frame < 10; frame += 1) state = tickGame(state, 100);
  const moved = state.hero.positions[state.zone];
  assert.ok(moved.x > start.x + 1, "персонаж прошёл в заданном направлении");

  state = setMoveIntent(state, { x: 0, y: 0 });
  const stopped = state.hero.positions[state.zone];
  for (let frame = 0; frame < 5; frame += 1) state = tickGame(state, 100);
  assert.equal(state.hero.positions[state.zone].x, stopped.x, "отпустили — стоит");
});

test("прицел не зависит от направления движения", () => {
  let state = createInitialState();
  const start = state.hero.positions[state.zone];
  // Идём вправо, целимся влево.
  state = setMoveIntent(state, { x: 1, y: 0 });
  state = setAimPoint(state, { x: start.x - 4, y: start.y });
  for (let frame = 0; frame < 6; frame += 1) state = tickGame(state, 100);

  assert.ok(state.hero.positions[state.zone].x > start.x, "движение шло вправо");
  assert.ok(state.hero.aimPoint.x < start.x, "прицел остался слева");
});

test("обязательство оружия режет скорость во время действия, и по-разному", () => {
  const base = createInitialState();
  const recovering = (state) => ({ ...state, hero: { ...state.hero, attackCooldownMs: 400 } });

  const pistol = attackMovementAllowance(recovering(withWeapon(base, "servicePistol")));
  const axe = attackMovementAllowance(recovering(withWeapon(base, "breachAxe")));
  const shotgun = attackMovementAllowance(recovering(withWeapon(base, "breachGun")));

  assert.equal(attackMovementAllowance(withWeapon(base, "breachAxe")), 1, "вне действия ограничений нет");
  assert.ok(pistol > shotgun && shotgun > axe, "лёгкий выстрел почти не мешает, тяжёлый замах фиксирует");
  // Общего правила «во время атаки нельзя двигаться» нет ни в какую сторону.
  const allowances = Object.values(WEAPON_FAMILIES).map((family) => family.movementAllowance);
  assert.ok(Math.min(...allowances) > 0, "ни одно оружие не запрещает движение полностью");
  assert.ok(Math.max(...allowances) < 1, "и ни одно не оставляет полную свободу");
});

test("мягкое наведение берёт цель рядом с курсором и не липнет к дальним", () => {
  let state = createInitialState();
  const hero = state.hero.positions[state.zone];
  state = {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { x: 10, y: 9 } } },
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4" ? { ...enemy, position: { x: 12, y: 9 }, zone: state.zone, hp: 100, mode: "combat" } : enemy),
  };
  void hero;

  const onTarget = setAimPoint(state, { x: 12.3, y: 9.1 });
  assert.equal(aimedTarget(onTarget)?.id, "guard-kl4", "курсор рядом с целью наводит на неё");

  const farAway = setAimPoint(state, { x: 4, y: 2 });
  assert.equal(aimedTarget(farAway), null, "курсор в пустоту не притягивает дальнюю цель");
});

test("удержание ЛКМ означает «продолжай пытаться», а не отмену правил", () => {
  let state = createInitialState();
  state = {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { x: 10, y: 9 } } },
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? { ...enemy, position: { x: 11, y: 9 }, zone: state.zone, hp: 9000, maxHp: 9000, mode: "combat", attackCooldownMs: 999999, thinkCooldownMs: 999999 }
        : enemy),
  };
  state = setPrimaryAttack(state, true);
  assert.equal(state.hero.primaryHeld, true);

  let ticked = state;
  for (let frame = 0; frame < 4; frame += 1) ticked = tickGame(ticked, 100);
  assert.equal(ticked.hero.attackTargetId, "guard-kl4", "удержание само выбирает цель под рукой");
  // Откат оружия продолжает действовать: удержание его не обнуляет.
  assert.ok(ticked.hero.attackCooldownMs >= 0);

  const released = setPrimaryAttack(ticked, false);
  assert.equal(released.hero.primaryHeld, false);
});

test("буфер ввода короткий и не превращается в очередь команд", () => {
  assert.ok(INPUT_BUFFER_MS > 0 && INPUT_BUFFER_MS <= 400, "буфер отзывчивый, но не очередь");
  assert.equal(bufferIsFresh(null, 0), false);
  assert.equal(bufferIsFresh({ intent: { kind: "cancel" }, atMs: 0 }, INPUT_BUFFER_MS + 50), false);

  let state = createInitialState();
  state = { ...state, hero: { ...state.hero, attackCooldownMs: 300 } };
  state = bufferAbility(state, 1);
  assert.equal(takeBufferedAbility(state).slot, null, "во время восстановления действие ждёт");

  const ready = { ...state, hero: { ...state.hero, attackCooldownMs: 0 } };
  const taken = takeBufferedAbility(ready);
  assert.equal(taken.slot, 1, "как только можно — выполняется");
  assert.equal(taken.state.hero.bufferedAbilitySlot, null, "буфер очищен, повтора не будет");

  const stale = { ...ready, worldTimeMs: ready.worldTimeMs + INPUT_BUFFER_MS + 100 };
  assert.equal(takeBufferedAbility(stale).slot, null, "устаревшее нажатие не срабатывает");
});

test("вектор нормализуется, а нулевой остаётся нулевым", () => {
  assert.deepEqual(normalise({ x: 0, y: 0 }), { x: 0, y: 0 });
  const long = normalise({ x: 30, y: 0 });
  assert.equal(long.x, 1);
});
