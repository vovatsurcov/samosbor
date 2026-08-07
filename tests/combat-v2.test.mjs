import test from "node:test";
import assert from "node:assert/strict";

import {
  EMPTY_RESISTANCES,
  describeDefence,
  resolveDefence,
} from "../app/game-defence.ts";

import {
  ARCHETYPES,
  IMPLEMENTED_ARCHETYPES,
  archetypeFor,
  archetypeResourceSteps,
  canSpendBreath,
  commandAttack,
  beginCharge,
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
  heroChargeSteps,
  heroChargeTuning,
  heroStanceState,
  maxHeroBreath,
  maxHeroHp,
  maxHeroStance,
  migrateGameState,
  releaseCharge,
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
  const dodged = commandDodge(state, { x: 9, y: 9 });
  assert.ok(dodged.hero.breath < state.hero.breath, "уклонение стоит дыхания");
  assert.ok(dodged.hero.dodgeInvulnerableUntilMs > dodged.worldTimeMs);
  assert.ok(dodged.hero.dodgeReadyAtMs > dodged.hero.dodgeInvulnerableUntilMs);

  const repeated = commandDodge(dodged, { x: 9, y: 9 });
  assert.equal(repeated.hero.breath, dodged.hero.breath, "повтор до восстановления невозможен");

  const drained = { ...state, hero: { ...state.hero, breath: 0 } };
  assert.equal(canSpendBreath(drained, 22), false);
  assert.match(commandDodge(drained, { x: 9, y: 9 }).log[0], /дыхания/i);
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

test("защита строится билдом: слои гасят удар без единого нажатия", () => {
  // Ручного блока и парирования больше нет. Проверяется, что защита работает
  // сама, из свойств персонажа.
  const bare = {
    evasion: 0, blockChance: 0, blockEffectiveness: 0.5, parryChance: 0,
    armour: 0, resistances: EMPTY_RESISTANCES, posture: 0,
  };
  const miss = { evasion: 0.99, parry: 0.99, block: 0.99 };
  assert.equal(resolveDefence(100, "kinetic", bare, miss).damage, 100, "без защиты удар проходит целиком");

  const armoured = { ...bare, armour: 60 };
  assert.ok(resolveDefence(100, "kinetic", armoured, miss).damage < 100, "броня гасит без нажатия");

  const blocking = { ...bare, blockChance: 1 };
  assert.equal(resolveDefence(100, "kinetic", blocking, { evasion: 0.99, parry: 0.99, block: 0 }).damage, 50);

  const evasive = { ...bare, evasion: 1 };
  const dodged = resolveDefence(100, "kinetic", evasive, { evasion: 0, parry: 0.99, block: 0.99 });
  assert.equal(dodged.damage, 0);
  assert.equal(dodged.avoided, true);
});

test("парирование пассивно и обращает защиту в атаку", () => {
  const parrying = {
    evasion: 0, blockChance: 0, blockEffectiveness: 0.5, parryChance: 1,
    armour: 0, resistances: EMPTY_RESISTANCES, posture: 0,
  };
  const outcome = resolveDefence(100, "kinetic", parrying, { evasion: 0.99, parry: 0, block: 0.99 });
  assert.equal(outcome.damage, 0);
  assert.equal(outcome.parried, true, "парирование — результат сборки, а не нажатия в окно");
});

test("слои защиты имеют разные профили, а не одно «+X% эффективных ОЗ»", () => {
  const base = {
    evasion: 0, blockChance: 0, blockEffectiveness: 0.5, parryChance: 0,
    armour: 80, resistances: EMPTY_RESISTANCES, posture: 0,
  };
  const miss = { evasion: 0.99, parry: 0.99, block: 0.99 };
  // Броня сильнее против частых мелких ударов и слабее против одного тяжёлого.
  const smallShare = resolveDefence(20, "kinetic", base, miss).damage / 20;
  const bigShare = resolveDefence(200, "kinetic", base, miss).damage / 200;
  assert.ok(smallShare < bigShare, "броня выгоднее против мелких ударов");

  // Сопротивление, наоборот, снимает одну и ту же долю независимо от размера.
  const resistant = { ...base, armour: 0, resistances: { ...EMPTY_RESISTANCES, kinetic: 0.5 } };
  const smallRes = resolveDefence(20, "kinetic", resistant, miss).damage / 20;
  const bigRes = resolveDefence(200, "kinetic", resistant, miss).damage / 200;
  assert.ok(Math.abs(smallRes - bigRes) < 0.02, "сопротивление одинаково на любом размере удара");
});

test("сопротивление работает по своей категории угрозы", () => {
  const thermalProof = {
    evasion: 0, blockChance: 0, blockEffectiveness: 0.5, parryChance: 0,
    armour: 0, resistances: { ...EMPTY_RESISTANCES, thermal: 0.6 }, posture: 0,
  };
  const miss = { evasion: 0.99, parry: 0.99, block: 0.99 };
  const shock = resolveDefence(100, "electric", thermalProof, miss);
  const hit = resolveDefence(100, "kinetic", thermalProof, miss);
  assert.equal(shock.category, "thermal");
  assert.ok(shock.damage < hit.damage, "профиль защищает от своей категории, а не от всего");
});

test("разбор удара объясним: каждый слой отчитывается отдельно", () => {
  const mixed = {
    evasion: 0, blockChance: 1, blockEffectiveness: 0.4, parryChance: 0,
    armour: 50, resistances: { ...EMPTY_RESISTANCES, kinetic: 0.25 }, posture: 0,
  };
  const outcome = resolveDefence(120, "kinetic", mixed, { evasion: 0.99, parry: 0.99, block: 0 });
  const ids = outcome.steps.map((step) => step.id);
  assert.deepEqual(ids, ["evasion", "parry", "block", "armour", "resistance"], "порядок слоёв фиксирован");
  assert.ok(describeDefence(outcome).length > 0, "результат объясним словами");
  assert.ok(outcome.steps.filter((step) => step.applied).length >= 3);
});


test("защитный профиль собирается вложениями, а не нажатиями", async () => {
  const { heroDefenceProfile } = await import("../app/game-engine.ts");
  const bare = heroDefenceProfile(createInitialState());
  assert.equal(bare.blockChance, 0, "без вложений блока нет");
  assert.equal(bare.parryChance, 0);
  assert.equal(bare.evasion, 0);

  const guardian = heroDefenceProfile(investDirection(createInitialState(), "guard", 8));
  assert.ok(guardian.blockChance > 0, "Опора даёт блок пассивно");
  assert.ok(guardian.armour >= bare.armour);
  assert.ok(guardian.resistances.kinetic > 0, "Опора даёт сопротивление своей категории");

  const agile = heroDefenceProfile(investDirection(createInitialState(), "agility", 8));
  assert.ok(agile.evasion > 0, "Ловкое направление даёт уклонение");
  assert.ok(agile.evasion > guardian.evasion, "уклонение — не профиль Опоры");
  assert.ok(guardian.blockChance > agile.blockChance, "блок — не профиль ловкой сборки");
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
  let state = heroAt(investDirection(createInitialState(), "power"), { x: 16, y: 9 });
  state = withEnemy(state, "guard-kl4", { position: { x: 2, y: 9 }, attackCooldownMs: 99999 });
  state = commandMove(state, { x: 3, y: 9 });
  // Цель фиксируется на весь путь: иначе разгон честно обнулится, когда герой
  // пройдёт мимо ближайших противников и начнёт от них удаляться.
  state = { ...state, hero: { ...state.hero, attackTargetId: "guard-kl4" } };
  assert.ok(state.hero.path.length > 0, "маршрут к противнику построен");

  // Ступень разгона требует двух секунд непрерывного сближения.
  // Разгон проверяется на всём сближении, а не только на последнем кадре:
  // добежав до цели, герой перестаёт сокращать дистанцию, и разгон честно
  // обнуляется — это и есть правило, а не сбой.
  let moving = state;
  let peakSteps = 0;
  let peakSurge = 0;
  for (let frame = 0; frame < 60 && moving.hero.path.length > 0; frame += 1) {
    moving = tickGame(moving, 100);
    peakSteps = Math.max(peakSteps, archetypeResourceSteps(moving));
    peakSurge = Math.max(peakSurge, moving.hero.surgeMs);
  }
  assert.ok(peakSurge > 0, "движение к цели копит разгон");
  assert.ok(peakSteps >= 1, "набрана хотя бы одна ступень");

  const charging = { ...moving, hero: { ...moving.hero, surgeMs: 2400, path: [] } };
  const stopped = tickGame(charging, 100);
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

test("удержание команды атаки заряжает удар, отпускание его выполняет", () => {
  let state = heroAt(createInitialState(), { x: 9, y: 4 });
  state = { ...state, worldTimeMs: 20000 };
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 4 },
    hp: 900,
    maxHp: 900,
    attackCooldownMs: 99999,
  });
  state = commandAttack(state, "guard-kl4");

  const charging = beginCharge(state);
  assert.ok(charging.hero.chargingSinceMs > 0, "заряд начат");
  assert.equal(heroChargeSteps(charging), 0, "мгновенное нажатие ступеней не даёт");

  // Держим команду: ступени копятся по данным настройки.
  const tuning = heroChargeTuning(charging);
  const held = { ...charging, worldTimeMs: charging.worldTimeMs + tuning.stepMs * 2 + 10 };
  assert.equal(heroChargeSteps(held), 2, "две ступени за два интервала");

  const released = releaseCharge(held);
  const guard = enemyById(released, "guard-kl4");
  assert.ok(guard.hp < 900, "заряженный удар нанесён");
  assert.equal(released.hero.chargingSinceMs, 0, "заряд сброшен после удара");
  assert.ok(released.hero.breath < held.hero.breath, "заряд стоит дыхания");
  assert.match(released.log.join("\n"), /Заряженный удар \(2\)/);

  // Короткое нажатие остаётся обычной атакой, а не заряженным ударом.
  const tapped = releaseCharge(beginCharge(state));
  assert.doesNotMatch(tapped.log.join("\n"), /Заряженный удар/);

  // Заряд без захваченной цели не пропадает: цель берётся на отпускании.
  let loose = heroAt(createInitialState(), { x: 9, y: 4 });
  loose = { ...loose, worldTimeMs: 20000 };
  loose = withEnemy(loose, "guard-kl4", { position: { x: 10, y: 4 }, hp: 900, maxHp: 900, attackCooldownMs: 99999 });
  assert.equal(loose.hero.attackTargetId, null, "цель заранее не захвачена");
  const looseCharge = beginCharge(loose);
  const looseHeld = { ...looseCharge, worldTimeMs: looseCharge.worldTimeMs + heroChargeTuning(looseCharge).stepMs * 2 + 10 };
  const looseHit = releaseCharge(looseHeld);
  assert.doesNotMatch(looseHit.log.join("\n"), /цели нет/, "заряд не потерян");
});

test("пассивы силового направления настраивают заряд без правки боевой системы", () => {
  const base = createInitialState();
  const baseTuning = heroChargeTuning(base);

  const powered = investDirection(base, "power", 7);
  const fastTuning = heroChargeTuning(powered);
  assert.ok(fastTuning.stepMs < baseTuning.stepMs, "пассив ускоряет накопление заряда");

  const deep = investDirection(base, "power", 14);
  const deepTuning = heroChargeTuning(deep);
  assert.ok(deepTuning.maxSteps > baseTuning.maxSteps, "пассив добавляет ступень");
  assert.ok(deepTuning.damagePerStep > baseTuning.damagePerStep, "пассив усиливает ступень");

  // Заряд сильнее ровно настолько, насколько сказали данные.
  const steps = 3;
  const baseDamage = 1 + baseTuning.damagePerStep * steps;
  const deepDamage = 1 + deepTuning.damagePerStep * steps;
  assert.ok(deepDamage > baseDamage);
});
