import test from "node:test";
import assert from "node:assert/strict";

import {
  COMBAT_STATES,
  OVERLOAD_HEAT_SHARE,
  overloadBreach,
  resonanceImpulse,
} from "../app/game-combat-states.ts";

/** Приказ атаковать только назначает цель — удар происходит на тике. */
function strike(state, targetId, frames = 6) {
  let next = commandAttack(state, targetId);
  for (let frame = 0; frame < frames; frame += 1) next = tickGame(next, 100);
  return next;
}

import {
  HEAT_OVERHEAT,
  applyDevProfile,
  commandAttack,
  commandHeavyAttack,
  createInitialState,
  devProfileById,
  enemyById,
  tickGame,
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

/**
 * Спарринг: цель рядом, ничего не делает и не умирает от одного удара.
 *
 * `withoutKeystone` убирает ключевой узел направления: базовое правило и
 * изменённое правило проверяются отдельно.
 */
function sparring(profileId, extra = {}, withoutKeystone = false) {
  let state = applyDevProfile(createInitialState(), devProfileById(profileId));
  if (withoutKeystone) {
    state = {
      ...state,
      hero: { ...state.hero, talents: state.hero.talents.filter((id) => !/:16$/.test(id)) },
    };
  }
  state = heroAt(state, { x: 10, y: 9 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 11, y: 9 },
    hp: 9000, maxHp: 9000, stance: 900, maxStance: 900,
    attackCooldownMs: 999999, thinkCooldownMs: 999999,
    ...extra,
  });
  return withEnemy(state, "stalker-17", {
    position: { x: 12, y: 9 },
    zone: state.zone,
    hp: 9000, maxHp: 9000,
    attackCooldownMs: 999999, thinkCooldownMs: 999999,
  });
}

test("каждое состояние объявляет, чем накладывается и чем используется", () => {
  for (const info of Object.values(COMBAT_STATES)) {
    assert.ok(info.appliedBy.length > 0, `${info.id}: не сказано, чем накладывается`);
    assert.ok(info.consumedBy.length > 0, `${info.id}: состояние ничего не открывает`);
  }
  assert.ok(COMBAT_STATES.overload, "перегрузка описана для игрока");
});

test("перегрузка расходится по строю, а резонанс копится на одной цели", () => {
  // Два разных профиля выгоды: это и делает Температуру и Резонанс разными
  // направлениями, а не двумя названиями одного эффекта.
  const lowHeat = overloadBreach(100, OVERLOAD_HEAT_SHARE);
  const highHeat = overloadBreach(100, 1);
  assert.ok(highHeat.maxTargets > lowHeat.maxTargets, "чем горячее, тем дальше уходит пробой");

  const oneStack = resonanceImpulse(1, 100);
  const threeStacks = resonanceImpulse(3, 100);
  assert.ok(threeStacks.damage > oneStack.damage * 2, "резонанс вознаграждает накопление");
  assert.equal(overloadBreach(100, 1).damage < threeStacks.damage, true, "перегрузка платит не размером, а охватом");
});

test("Прицел: накопленная неподвижность обменивается на вскрытие цели", () => {
  let state = sparring("pure-aim", {}, true);
  state = { ...state, hero: { ...state.hero, aimMs: 4000 } };
  const before = enemyById(state, "guard-kl4");
  assert.ok((before.exposedUntilMs ?? 0) <= state.worldTimeMs, "цель ещё не вскрыта");

  const after = strike(state, "guard-kl4");
  const foe = enemyById(after, "guard-kl4");
  assert.ok(foe.exposedUntilMs > after.worldTimeMs, "выстрел сам создал окно урона");
  assert.ok(foe.resonanceStacks > 0, "и оставил зацепку для другого направления");
  assert.ok(after.hero.aimMs < 4000, "ресурс потрачен, а не остался бесплатно");
  assert.ok(after.log.some((line) => /Выверенный выстрел/i.test(line)), "результат объяснён в логе");
});

test("Прицел без накопления ничего не открывает: порядок действий важен", () => {
  let state = sparring("pure-aim", {}, true);
  state = { ...state, hero: { ...state.hero, aimMs: 0 } };
  const after = strike(state, "guard-kl4");
  const foe = enemyById(after, "guard-kl4");
  assert.ok((foe.exposedUntilMs ?? 0) <= after.worldTimeMs, "без прицела окна нет");
  assert.ok(!after.log.some((line) => /Выверенный выстрел/i.test(line)));
});

test("Температура: работа у верхней границы наводит перегрузку, попадание её пробивает", () => {
  let state = sparring("pure-heat");
  state = { ...state, hero: { ...state.hero, heat: HEAT_OVERHEAT * 0.9 } };

  const primed = strike(state, "guard-kl4");
  const foe = enemyById(primed, "guard-kl4");
  assert.ok(foe.overloadedUntilMs > primed.worldTimeMs, "горячая стрельба наводит потенциал");
  assert.ok(primed.log.some((line) => /наведена перегрузка/i.test(line)));

  // Пробой — на следующем попадании, уже другим направлением.
  let cold = { ...primed, hero: { ...primed.hero, heat: 0, attackCooldownMs: 0 } };
  const breached = commandHeavyAttack(cold);
  assert.ok(breached.log.some((line) => /Пробой перегрузки/i.test(line)), "потенциал пробит и это видно");
  assert.equal(enemyById(breached, "guard-kl4").overloadedUntilMs, 0, "перегрузка потрачена");
});

test("Температура на холодном стволе перегрузку не наводит", () => {
  let state = sparring("pure-heat");
  state = { ...state, hero: { ...state.hero, heat: 0 } };
  const after = strike(state, "guard-kl4");
  const foe = enemyById(after, "guard-kl4");
  assert.ok((foe.overloadedUntilMs ?? 0) <= after.worldTimeMs, "перегрузка — награда за риск, а не бесплатна");
});

test("Темп: подвижность разносит резонанс на соседей, а не копит его", () => {
  let state = sparring("pure-tempo");
  state = withEnemy(state, "guard-kl4", { resonanceStacks: 2 });
  state = {
    ...state,
    hero: { ...state.hero, tempoStacks: 3, tempoGainedAtMs: state.worldTimeMs },
  };
  const before = enemyById(state, "stalker-17").resonanceStacks;

  const after = strike(state, "guard-kl4");
  assert.ok(
    enemyById(after, "stalker-17").resonanceStacks > before,
    "резонанс перенесён на соседнюю цель",
  );
  assert.ok(after.log.some((line) => /Разнос темпом/i.test(line)));
});

test("направления обходятся с одной и той же целью по-разному", () => {
  // Одна и та же атака, одна и та же цель — разный след на ней.
  const aimedBase = sparring("pure-aim");
  const aimed = strike({ ...aimedBase, hero: { ...aimedBase.hero, aimMs: 4000 } }, "guard-kl4");
  const hotBase = sparring("pure-heat");
  const hot = strike({ ...hotBase, hero: { ...hotBase.hero, heat: HEAT_OVERHEAT * 0.9 } }, "guard-kl4");

  const aimedFoe = enemyById(aimed, "guard-kl4");
  const hotFoe = enemyById(hot, "guard-kl4");
  assert.ok(aimedFoe.exposedUntilMs > aimed.worldTimeMs, "Прицел оставляет вскрытие");
  assert.ok((hotFoe.exposedUntilMs ?? 0) <= hot.worldTimeMs, "Температура вскрытия не даёт");
  assert.ok(hotFoe.overloadedUntilMs > hot.worldTimeMs, "Температура оставляет перегрузку");
  assert.ok((aimedFoe.overloadedUntilMs ?? 0) <= aimed.worldTimeMs, "Прицел перегрузки не даёт");
});

test("гибридизация: вскрытие Прицела ускоряет чужой урон по той же цели", () => {
  const state = sparring("pure-aim");
  const exposed = withEnemy(state, "guard-kl4", { exposedUntilMs: state.worldTimeMs + 4000 });
  const plain = strike(state, "guard-kl4", 3);
  const onExposed = strike(exposed, "guard-kl4", 3);

  const plainLost = 9000 - enemyById(plain, "guard-kl4").hp;
  const exposedLost = 9000 - enemyById(onExposed, "guard-kl4").hp;
  assert.ok(exposedLost > plainLost, "по вскрытой цели тот же удар проходит лучше");
});

test("Резонанс: накопленное сворачивается в звучащий участок, а не в один удар", async () => {
  const { DISCORD_PULSE_MS, discordZone } = await import("../app/game-combat-states.ts");
  // Один стек свернуть нельзя: направление платит за накопление, как и Разгон,
  // но получает другое — область вместо всплеска.
  assert.equal(discordZone(1), null);
  const two = discordZone(2);
  const four = discordZone(4);
  assert.ok(four.radius > two.radius && four.durationMs > two.durationMs);
  assert.ok(four.contamination > two.contamination, "чем больше свёрнуто, тем дороже герою");

  let state = sparring("pure-resonance");
  state = withEnemy(state, "guard-kl4", { resonanceStacks: 3 });
  const before = state.hero.contamination;

  const after = strike(state, "guard-kl4");
  assert.ok(after.discordZones.length > 0, "участок создан");
  assert.equal(enemyById(after, "guard-kl4").resonanceStacks, 0, "стеки свёрнуты");
  assert.ok(after.hero.contamination > before, "направление платит собой");
  assert.ok(after.log.some((line) => /Разлад свёрнут/i.test(line)));

  // Участок звучит сам: соседняя цель получает резонанс без действий игрока.
  let pulsing = after;
  const neighbourBefore = enemyById(pulsing, "stalker-17").resonanceStacks;
  for (let frame = 0; frame < 12; frame += 1) pulsing = tickGame(pulsing, DISCORD_PULSE_MS / 2);
  assert.ok(
    enemyById(pulsing, "stalker-17").resonanceStacks > neighbourBefore,
    "звучащий участок наводит резонанс сам",
  );
});

test("Резонанс и Разгон тратят одно накопление по-разному", () => {
  const base = withEnemy(sparring("pure-resonance"), "guard-kl4", { resonanceStacks: 3 });
  const collapsed = strike(base, "guard-kl4");

  const surgeBase = withEnemy(sparring("pure-surge"), "guard-kl4", { resonanceStacks: 3 });
  const detonated = commandHeavyAttack(surgeBase);

  assert.ok(collapsed.discordZones.length > 0, "Резонанс оставляет область");
  assert.equal((detonated.discordZones ?? []).length, 0, "Разгон области не оставляет");
  assert.ok(detonated.log.some((line) => /Резонанс сорван/i.test(line)), "Разгон срывает накопленное сразу");
});
