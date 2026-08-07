import test from "node:test";
import assert from "node:assert/strict";

import {
  ARCHETYPES,
  IMPLEMENTED_ARCHETYPES,
  archetypeFor,
  archetypeResourceSteps,
  canSpendBreath,
  commandAttack,
  commandBlock,
  commandDodge,
  commandFinisher,
  commandHeavyAttack,
  commandMarkTarget,
  commandMove,
  commandScout,
  createInitialState,
  enemyById,
  floorTier,
  heroBreathRegen,
  heroStanceState,
  maxHeroBreath,
  maxHeroHp,
  maxHeroStance,
  migrateGameState,
  investDirection,
  tickGame,
  zoneFloorNumber,
} from "../app/game-engine.ts";

function heroAt(state, point) {
  return {
    ...state,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [state.zone]: { ...point } },
      path: [],
      destination: null,
    },
  };
}

function withEnemy(state, id, patch) {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => (enemy.id === id ? { ...enemy, ...patch } : enemy)),
  };
}

test("герой и противники живут в шкале модели v2", () => {
  const state = createInitialState();
  assert.ok(maxHeroHp(state) >= 110 && maxHeroHp(state) <= 145, `ОЗ: ${maxHeroHp(state)}`);
  assert.ok(maxHeroStance(state) >= 70 && maxHeroStance(state) <= 90);
  assert.ok(maxHeroBreath(state) >= 105 && maxHeroBreath(state) <= 125);
  assert.equal(state.hero.hp, 120);

  const guard = state.enemies.find((enemy) => enemy.id === "guard-kl4");
  assert.ok(guard.hp >= 65 && guard.hp <= 85, `ОЗ постового: ${guard.hp}`);
  assert.ok(guard.maxStance > 0, "у противника есть стойка");
  assert.ok(guard.damage >= 10 && guard.damage <= 15, `урон постового: ${guard.damage}`);
});

test("глубина этажа усиливает противников без оглядки на уровень героя", () => {
  const state = createInitialState();
  assert.equal(zoneFloorNumber("floor556"), 556);
  assert.equal(zoneFloorNumber("floor546"), 546);
  assert.ok(floorTier(546) > floorTier(556));

  const shallow = state.enemies.find((enemy) => enemy.zone === "floor556" && enemy.kind === "sentry");
  const deep = state.enemies.find((enemy) => enemy.zone === "floor546" && enemy.kind === "sentry");
  if (deep) assert.ok(deep.hp > shallow.hp, "ниже по стволу противники крепче");
});

test("бой идёт без броска на попадание: удар в дистанции всегда разрешается уроном", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = commandAttack(state, "guard-kl4");
  const before = enemyById(state, "guard-kl4").hp;
  const after = tickGame(state, 100);
  const guard = enemyById(after, "guard-kl4");
  assert.ok(guard.hp < before, "урон нанесён без проверки попадания");
  assert.ok(guard.stance < guard.maxStance, "удар расходует стойку цели");
  assert.doesNotMatch(after.log.join("\n"), /d20/, "бросок d20 из боя убран");
});

test("тяжёлый удар ломает стойку и открывает ошеломление и добивание", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 4 }, stance: 8, attackCooldownMs: 99999 });
  state = commandAttack(state, "guard-kl4");

  const heavy = commandHeavyAttack(state);
  const guard = enemyById(heavy, "guard-kl4");
  assert.ok(guard.stunnedUntilMs > heavy.worldTimeMs, "стойка сломана — цель ошеломлена");
  assert.ok(heavy.hero.breath < state.hero.breath, "тяжёлый удар стоит дыхания");
  assert.match(heavy.log.join("\n"), /ошеломлена|Тяжёлый удар/);

  const finished = commandFinisher(heavy);
  const afterFinisher = enemyById(finished, "guard-kl4");
  assert.ok(
    !afterFinisher || afterFinisher.hp < guard.hp,
    "добивание по ошеломлённой цели наносит повышенный урон",
  );
  assert.match(finished.log.join("\n"), /Добивание|выведен из строя/);
});

test("добивание недоступно по цели, которая держит стойку", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 4 }, stunnedUntilMs: 0 });
  state = commandAttack(state, "guard-kl4");
  const attempt = commandFinisher(state);
  assert.match(attempt.log[0], /только по ошеломлённой/i);
});

test("уклонение тратит дыхание, даёт кадры неуязвимости и не повторяется мгновенно", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  const dodged = commandDodge(state, { x: 9, y: 8 });
  assert.ok(dodged.hero.breath < state.hero.breath, "уклонение стоит дыхания");
  assert.ok(dodged.hero.dodgeInvulnerableUntilMs > dodged.worldTimeMs);
  assert.ok(dodged.hero.dodgeReadyAtMs > dodged.hero.dodgeInvulnerableUntilMs);

  const repeated = commandDodge(dodged, { x: 9, y: 8 });
  assert.equal(repeated.hero.breath, dodged.hero.breath, "повтор до восстановления невозможен");

  const drained = { ...state, hero: { ...state.hero, breath: 0 } };
  assert.equal(canSpendBreath(drained, 22), false);
  assert.match(commandDodge(drained, { x: 9, y: 8 }).log[0], /дыхания/i);
});

test("неуязвимость уклонения отменяет удар противника целиком", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 4 },
    damage: 240,
    attackCooldownMs: 0,
    castUntilMs: 1,
    thinkCooldownMs: 0,
  });
  const dodging = {
    ...state,
    hero: { ...state.hero, dodgeInvulnerableUntilMs: state.worldTimeMs + 5000 },
  };
  const after = tickGame(dodging, 100);
  assert.equal(after.hero.hp, dodging.hero.hp, "в кадрах неуязвимости урон не проходит");
});

test("блок гасит урон, а идеальный блок отменяет его и возвращает стойку атакующему", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = { ...state, worldTimeMs: 20000 };
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 4 },
    damage: 40,
    attackCooldownMs: 0,
    castUntilMs: 1,
    thinkCooldownMs: 0,
  });

  const open = tickGame(state, 100);
  const openLoss = state.hero.hp - open.hero.hp;
  assert.ok(openLoss > 0, "без блока урон проходит");

  // Блок, поднятый заранее: идеальное окно уже истекло.
  const raised = commandBlock(state, true);
  const holding = {
    ...raised,
    hero: { ...raised.hero, blockingSinceMs: state.worldTimeMs - 5000 },
  };
  const blocked = tickGame(holding, 100);
  assert.ok(state.hero.hp - blocked.hero.hp < openLoss, "блок снижает урон");

  // Блок, поднятый только что: идеальное окно.
  const perfect = tickGame(commandBlock(state, true), 100);
  assert.equal(perfect.hero.hp, state.hero.hp, "идеальный блок отменяет урон");
  assert.match(perfect.log.join("\n"), /идеальный блок/i);
  assert.ok(perfect.hero.riposteUntilMs > perfect.worldTimeMs, "открыто окно контратаки");
});

test("дыхание тратится, восстанавливается и падает от заражения и стресса", () => {
  const state = createInitialState();
  const clean = heroBreathRegen(state);
  assert.ok(clean > 0);
  assert.ok(heroBreathRegen({ ...state, hero: { ...state.hero, contamination: 100 } }) < clean);
  assert.ok(heroBreathRegen({ ...state, hero: { ...state.hero, stress: 100 } }) < clean);

  const spent = { ...state, hero: { ...state.hero, breath: 10, breathIdleMs: 5000 } };
  let restored = spent;
  for (let frame = 0; frame < 20; frame += 1) restored = tickGame(restored, 100);
  assert.ok(restored.hero.breath > spent.hero.breath, "дыхание восстанавливается само");
});

test("стойка героя восстанавливается после паузы", () => {
  const state = createInitialState();
  const shaken = { ...state, hero: { ...state.hero, stance: 5, stanceIdleMs: 5000 } };
  assert.equal(heroStanceState(shaken), "shaken");
  let restored = shaken;
  for (let frame = 0; frame < 30; frame += 1) restored = tickGame(restored, 100);
  assert.ok(restored.hero.stance > shaken.hero.stance);
});

test("все шесть архетипов реализованы, у каждого свой ресурс и цепочка", () => {
  assert.equal(Object.keys(ARCHETYPES).length, 6);
  assert.equal(IMPLEMENTED_ARCHETYPES.length, 6);

  const resources = new Set();
  for (const id of ["power", "bulwark", "skirmisher", "marksman", "heavy_gunner", "resonance"]) {
    const archetype = ARCHETYPES[id];
    assert.ok(archetype, id);
    assert.ok(archetype.chain.length >= 5, `${id}: цепочка описана`);
    assert.ok(archetype.abilities.length >= 5, `${id}: пять способностей`);
    assert.ok(archetype.abilities.every((ability) => ability.description.length > 20), `${id}: описания`);
    resources.add(archetype.resourceId);
  }
  assert.equal(resources.size, 6, "ресурс каждого архетипа уникален");

  // Направление выводится из вложенных очков, а не выбирается кнопкой.
  const state = createInitialState();
  assert.equal(archetypeFor(state), "power", "без очков — базовое направление");
  const derived = [
    ["guard", "bulwark"],
    ["agility", "skirmisher"],
    ["precision", "marksman"],
    ["suppression", "heavy_gunner"],
    ["resonance", "resonance"],
  ];
  for (const [branch, expected] of derived) {
    assert.equal(archetypeFor(investDirection(state, branch)), expected, branch);
  }
});

test("разгон силача копится движением к цели и обнуляется остановкой", () => {
  // Открытый коридор восьмой строки: герой справа, противник слева в поле зрения.
  let state = heroAt(investDirection(createInitialState(), "power"), { x: 16, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 2, y: 8 }, attackCooldownMs: 99999 });
  state = commandMove(state, { x: 3, y: 8 });
  // Цель фиксируется на весь путь: иначе разгон честно обнулится, когда герой
  // пройдёт мимо ближайших противников и начнёт от них удаляться.
  state = { ...state, hero: { ...state.hero, attackTargetId: "guard-kl4" } };
  assert.ok(state.hero.path.length > 0, "маршрут к противнику построен");

  // Ступень разгона требует двух секунд непрерывного сближения.
  let moving = state;
  for (let frame = 0; frame < 60 && moving.hero.path.length > 0; frame += 1) {
    moving = tickGame(moving, 100);
  }
  assert.ok(moving.hero.surgeMs > 0, "движение к цели копит разгон");
  assert.ok(archetypeResourceSteps(moving) >= 1, "набрана хотя бы одна ступень");

  const stopped = tickGame({ ...moving, hero: { ...moving.hero, path: [] } }, 100);
  assert.equal(stopped.hero.surgeMs, 0, "остановка обнуляет разгон");
});

test("прицел стрелка копится неподвижностью и обнуляется движением", () => {
  let state = heroAt(investDirection(createInitialState(), "precision"), { x: 9, y: 4 });
  assert.equal(archetypeFor(state), "marksman");

  let still = state;
  for (let frame = 0; frame < 30; frame += 1) still = tickGame(still, 100);
  assert.ok(still.hero.aimMs > 0, "неподвижность копит прицел");
  assert.ok(archetypeResourceSteps(still) >= 1);

  const walking = commandMove(still, { x: 12, y: 5 });
  assert.ok(walking.hero.path.length > 0, "маршрут построен");
  const moved = tickGame(walking, 100);
  assert.equal(moved.hero.aimMs, 0, "движение обнуляет прицел");
});

test("метка и разведка стрелка меняют бой, а не только цифру", () => {
  let state = heroAt(investDirection(createInitialState(), "precision"), { x: 9, y: 4 });
  state = commandAttack(state, "guard-kl4");

  const marked = commandMarkTarget(state);
  assert.ok(enemyById(marked, "guard-kl4").markedUntilMs > marked.worldTimeMs);
  assert.match(marked.log[0], /метка/i);

  const scouted = commandScout(state);
  assert.ok(scouted.hero.scoutUntilMs > scouted.worldTimeMs);
  assert.match(scouted.log[0], /Разведка/i);

  // Силачу разведка не принадлежит.
  const power = investDirection(createInitialState(), "power");
  assert.match(commandScout(power).log[0], /стрелку/i);
});

test("старое сохранение переносится на новую шкалу, а не оставляет героя при смерти", () => {
  const legacy = migrateGameState({
    hero: { hp: 4, level: 1 },
    enemies: [{ id: "old", hp: 3, maxHp: 8 }],
  });
  assert.ok(legacy.hero.hp > 40, `перенесённые ОЗ: ${legacy.hero.hp}`);
  assert.ok(legacy.hero.hp <= maxHeroHp(legacy));
  assert.equal(legacy.hero.stance, maxHeroStance(legacy));
  assert.equal(legacy.hero.breath, maxHeroBreath(legacy));
  assert.ok(legacy.enemies.every((enemy) => enemy.maxStance > 0), "противники пересозданы со стойкой");

  const fresh = migrateGameState({});
  assert.equal(fresh.hero.hp, 120);
});
