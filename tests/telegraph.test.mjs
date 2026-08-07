import test from "node:test";
import assert from "node:assert/strict";

import {
  TELEGRAPHS,
  TELEGRAPH_RESPONSES,
  isReadable,
  telegraphDamage,
  windUpProgress,
  withinParryWindow,
} from "../app/game-telegraph.ts";

import {
  commandHeavyAttack,
  createInitialState,
  enemyById,
  investDirection,
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

test("замах успевает прочитаться, а тяжёлый заметно опаснее быстрого", () => {
  assert.ok(isReadable("quick"), "даже быстрый удар должен быть читаем");
  assert.ok(isReadable("heavy"));
  assert.ok(
    TELEGRAPHS.heavy.windUpMs > TELEGRAPHS.quick.windUpMs * 2,
    "тяжёлый замах даёт настоящее время на выбор ответа",
  );
  assert.ok(telegraphDamage(100, "heavy") > telegraphDamage(100, "quick") * 2, "цена ошибки настоящая");
  assert.ok(TELEGRAPHS.heavy.areaRadius > 0, "у тяжёлого удара есть зона, из которой можно выйти");
  assert.equal(TELEGRAPHS.quick.areaRadius, 0);
});

test("шкала замаха заполняется от начала к удару", () => {
  assert.equal(windUpProgress(1000, 1000, "heavy"), 0);
  assert.equal(windUpProgress(1000, 1000 + TELEGRAPHS.heavy.windUpMs, "heavy"), 1);
  assert.ok(windUpProgress(1000, 1000 + TELEGRAPHS.heavy.windUpMs / 2, "heavy") > 0.4);
  assert.equal(windUpProgress(1000, 99999, "heavy"), 1, "шкала не переполняется");
});

test("парирование награждает чтение намерения, а не позднее нажатие", () => {
  assert.equal(withinParryWindow(0.05, 0.25), true, "ответ в начале замаха проходит");
  assert.equal(withinParryWindow(0.8, 0.25), false, "поздний ответ парированием не проходит");
});

test("на один замах есть несколько разных ответов, и часть из них даёт билд", () => {
  const responses = Object.values(TELEGRAPH_RESPONSES);
  assert.ok(responses.length >= 5, "ответ не должен быть один");
  const sources = new Set(responses.map((response) => response.source));
  assert.ok(sources.has("билд"), "часть ответов обеспечивается сборкой, а не нажатием");
  assert.ok(sources.has("движение"), "уйти ногами — тоже полноценный ответ");
  assert.ok(sources.has("действие"));
  for (const response of responses) {
    assert.ok(response.description.length > 0, `${response.id}: игроку не объяснили ответ`);
  }
});

test("противник заводит замах, и это видно в состоянии мира", () => {
  let state = heroAt(createInitialState(), { x: 10, y: 9 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 11, y: 9 },
    mode: "combat",
    attackCooldownMs: 0,
    thinkCooldownMs: 99999,
    castUntilMs: 0,
  });
  const ticked = tickGame(state, 100);
  const foe = enemyById(ticked, "guard-kl4");
  assert.ok(foe.castUntilMs > ticked.worldTimeMs, "замах начат и ещё не разрешился");
  assert.ok(foe.castStartedMs >= 0);
  assert.ok(["quick", "heavy"].includes(foe.castTier));
});

test("слом стойки во время замаха отменяет удар, и игрок об этом узнаёт", () => {
  let state = heroAt(investDirection(createInitialState(), "power"), { x: 10, y: 9 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 11, y: 9 },
    hp: 500,
    maxHp: 500,
    stance: 1,
    maxStance: 60,
    castTier: "heavy",
    castStartedMs: state.worldTimeMs,
    castUntilMs: state.worldTimeMs + TELEGRAPHS.heavy.windUpMs,
    staggerImmuneUntilMs: 0,
    attackCooldownMs: 99999,
    thinkCooldownMs: 99999,
  });

  const after = commandHeavyAttack(state);
  const foe = enemyById(after, "guard-kl4");
  assert.equal(foe.castUntilMs, 0, "замах снят");
  assert.ok(
    after.log.some((line) => /замах прерван/i.test(line)),
    "прерывание — отдельное сообщение, а не молчаливый побочный эффект",
  );
});

test("один и тот же тяжёлый замах воспринимается разными сборками по-разному", async () => {
  const { EMPTY_RESISTANCES, resolveDefence } = await import("../app/game-defence.ts");
  const base = {
    evasion: 0, blockChance: 0, blockEffectiveness: 0.55, parryChance: 0,
    armour: 0, resistances: EMPTY_RESISTANCES, posture: 0,
  };
  // Одинаковый удар и одинаковые броски: разница целиком из сборки.
  const incoming = telegraphDamage(60, "heavy");
  const rolls = { evasion: 0.5, parry: 0.5, block: 0.5 };

  const profiles = {
    glass: base,
    armour: { ...base, armour: 90 },
    block: { ...base, blockChance: 0.9 },
    parry: { ...base, parryChance: 0.9 },
    evasion: { ...base, evasion: 0.9 },
    resistant: { ...base, resistances: { ...EMPTY_RESISTANCES, kinetic: 0.5 } },
  };
  const taken = Object.fromEntries(
    Object.entries(profiles).map(([name, profile]) => [
      name,
      resolveDefence(incoming, "kinetic", profile, rolls),
    ]),
  );

  assert.equal(taken.glass.damage, incoming, "без вложений удар проходит целиком");
  for (const name of ["armour", "block", "resistant"]) {
    assert.ok(taken[name].damage < taken.glass.damage, `${name}: сборка обязана менять исход`);
    assert.ok(taken[name].damage > 0, `${name}: гашение — не неуязвимость`);
  }
  assert.equal(taken.evasion.damage, 0, "уклонение отменяет удар целиком");
  assert.equal(taken.parry.parried, true, "парирование обращает удар против атакующего");

  // Слои не взаимозаменяемы: они дают разный исход на одном и том же ударе.
  const distinct = new Set([taken.armour.damage, taken.block.damage, taken.resistant.damage]);
  assert.equal(distinct.size, 3, "броня, блок и сопротивление — не три названия одного эффекта");
});
