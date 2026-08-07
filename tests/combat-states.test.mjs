import test from "node:test";
import assert from "node:assert/strict";

import {
  COMBAT_STATES,
  EXPOSURE_ARMOR_SHARE,
  RESONANCE_MAX_STACKS,
  armorUnderExposure,
  resonanceImpulse,
} from "../app/game-combat-states.ts";

import {
  commandHeavyAttack,
  createInitialState,
  enemyById,
  investDirection,
} from "../app/game-engine.ts";

function heroAt(state, point) {
  return {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { ...point } }, path: [], destination: null },
  };
}

function withEnemy(state, id, patch) {
  return { ...state, enemies: state.enemies.map((enemy) => (enemy.id === id ? { ...enemy, ...patch } : enemy)) };
}

test("резонанс без детонации ничего не делает, а тяжёлый удар его срывает", () => {
  assert.equal(resonanceImpulse(0, 100), null, "без стеков импульса нет");

  const one = resonanceImpulse(1, 100);
  const three = resonanceImpulse(3, 100);
  assert.ok(one.damage > 0);
  // Копить выгоднее, чем срывать по одному: иначе подготовка не окупается.
  assert.ok(three.damage > one.damage * 2, "три стека сильнее трёх отдельных срывов");
  assert.ok(three.radius > one.radius, "накопленный резонанс задевает шире");
});

test("резонанс не копится выше потолка", () => {
  const over = resonanceImpulse(RESONANCE_MAX_STACKS + 5, 100);
  const capped = resonanceImpulse(RESONANCE_MAX_STACKS, 100);
  assert.deepEqual(over, capped, "стек — не бесконечный счётчик");
});

test("вскрытие открывает окно, но не отключает правила", () => {
  assert.equal(armorUnderExposure(40, false), 40);
  const exposed = armorUnderExposure(40, true);
  assert.ok(exposed < 40, "вскрытая цель защищена хуже");
  assert.ok(exposed > 0, "вскрытие — окно, а не отключение брони");
  assert.equal(exposed, Math.round(40 * EXPOSURE_ARMOR_SHARE));
});

test("каждое состояние объясняет, чем накладывается и чем используется", () => {
  for (const info of Object.values(COMBAT_STATES)) {
    assert.ok(info.appliedBy.length > 0, `${info.id}: не сказано, чем накладывается`);
    assert.ok(info.consumedBy.length > 0, `${info.id}: состояние ничего не открывает`);
    assert.ok(info.description.length > 0, `${info.id}: нет объяснения для игрока`);
  }
});

test("тяжёлый удар по резонирующей цели детонирует стеки и задевает соседей", () => {
  let state = heroAt(investDirection(createInitialState(), "power"), { x: 10, y: 9 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 11, y: 9 },
    hp: 4000,
    maxHp: 4000,
    resonanceStacks: 3,
    attackCooldownMs: 99999,
    thinkCooldownMs: 99999,
  });
  // Сосед рядом с целью: импульс должен его задеть.
  state = withEnemy(state, "stalker-17", {
    position: { x: 12, y: 9 },
    zone: state.zone,
    hp: 4000,
    maxHp: 4000,
    attackCooldownMs: 99999,
    thinkCooldownMs: 99999,
  });

  const neighbourBefore = enemyById(state, "stalker-17").hp;
  const after = commandHeavyAttack(state);

  assert.equal(enemyById(after, "guard-kl4").resonanceStacks, 0, "стеки потрачены");
  assert.ok(
    after.log.some((line) => /Резонанс сорван/i.test(line)),
    "игрок видит, что связка сработала",
  );
  assert.ok(
    enemyById(after, "stalker-17").hp < neighbourBefore,
    "импульс расходится от цели на соседей",
  );
});

test("тяжёлый удар без резонанса не сообщает о детонации", () => {
  let state = heroAt(investDirection(createInitialState(), "power"), { x: 10, y: 9 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 11, y: 9 },
    hp: 4000,
    maxHp: 4000,
    resonanceStacks: 0,
    attackCooldownMs: 99999,
    thinkCooldownMs: 99999,
  });
  const after = commandHeavyAttack(state);
  assert.ok(!after.log.some((line) => /Резонанс сорван/i.test(line)));
});
