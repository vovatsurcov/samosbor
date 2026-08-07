import test from "node:test";
import assert from "node:assert/strict";

import {
  ARCHETYPES,
  BOSS,
  HEAT_OVERHEAT,
  RESONANCE_MAX_STACKS,
  archetypeResourceSteps,
  bossPhaseFor,
  breaksBossStance,
  chainDamageAt,
  commandAttack,
  commandBackstab,
  commandBlock,
  commandDesync,
  commandFlurry,
  commandHeavyAttack,
  commandResonanceChain,
  commandReverseShadow,
  commandSetUp,
  commandShieldPush,
  commandSuppress,
  commandVentHeat,
  createInitialState,
  enemyById,
  footingStepsFor,
  heroMoveSpeed,
  investDirection,
  staggerThresholdFor,
  tempoGrantsBackstab,
  tickGame,
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

/** Босс региона стоит на этаже 546; для боя переносим его к герою. */
function bossFight(patch = {}) {
  let state = createInitialState();
  state = { ...state, zone: "floor546", worldTimeMs: 30000 };
  state = heroAt(state, { x: 30, y: 28 });
  state = withEnemy(state, "546-overseer", {
    position: { x: 31, y: 28 },
    attackCooldownMs: 999999,
    thinkCooldownMs: 999999,
    ...patch,
  });
  return commandAttack(state, "546-overseer");
}

test("фаза босса определяется долей оставшихся ОЗ", () => {
  assert.equal(bossPhaseFor(100, 100), 0);
  assert.equal(bossPhaseFor(70, 100), 0);
  assert.equal(bossPhaseFor(66, 100), 1);
  assert.equal(bossPhaseFor(40, 100), 1);
  assert.equal(bossPhaseFor(33, 100), 2);
  assert.equal(bossPhaseFor(1, 100), 2);
  assert.deepEqual(BOSS.phaseThresholds, [0.66, 0.33]);
});

test("фазовая стойка босса не ломается обычными ударами", () => {
  assert.equal(breaksBossStance("light"), false);
  assert.equal(breaksBossStance("skill"), false);
  assert.equal(breaksBossStance("heavy"), true);
  assert.equal(breaksBossStance("charged"), true);
  assert.equal(breaksBossStance("finisher"), true);

  const state = bossFight();
  const before = enemyById(state, "546-overseer");
  let hitting = state;
  for (let frame = 0; frame < 30; frame += 1) hitting = tickGame(hitting, 100);
  const after = enemyById(hitting, "546-overseer");
  assert.ok(after.hp < before.hp, "обычные удары наносят урон");
  assert.equal(after.stance, before.stance, "но стойку босса не трогают");
  assert.equal(after.stunnedUntilMs, 0, "и не ошеломляют");
});

test("тяжёлый удар ломает фазовую стойку, а следующий слом дороже на четверть", () => {
  const state = bossFight({ stance: 5, maxStance: 400 });
  const boss = enemyById(state, "546-overseer");
  assert.equal(staggerThresholdFor(boss), boss.maxStance, "первый слом по номиналу");

  const broken = commandHeavyAttack(state);
  const staggered = enemyById(broken, "546-overseer");
  assert.ok(staggered.staggerCount >= 1, "слом засчитан");
  assert.equal(
    staggered.stance,
    staggerThresholdFor(staggered),
    "стойка босса восстанавливается полностью и с надбавкой",
  );
  assert.ok(
    staggerThresholdFor(staggered) > staggerThresholdFor(boss),
    "следующий слом требует больше",
  );
  assert.match(broken.log.join("\n"), /фазовая стойка/i);
});

test("переход фазы даёт неуязвимость и меняет поведение босса", () => {
  const state = bossFight();
  const boss = enemyById(state, "546-overseer");
  // Подводим к самому порогу 66%.
  const nearThreshold = withEnemy(state, "546-overseer", {
    hp: Math.round(boss.maxHp * 0.67),
  });

  let fighting = nearThreshold;
  for (let frame = 0; frame < 40 && enemyById(fighting, "546-overseer").phase === 0; frame += 1) {
    fighting = tickGame(fighting, 100);
  }
  const shifted = enemyById(fighting, "546-overseer");
  assert.equal(shifted.phase, 1, "порог 66% переводит во вторую фазу");
  assert.ok(shifted.phaseInvulnerableUntilMs > fighting.worldTimeMs, "включена неуязвимость");
  assert.equal(shifted.stance, shifted.maxStance, "стойка восстановлена на переходе");
  assert.match(fighting.log.join("\n"), /переход во вторую половину боя/i);

  // Во время неуязвимости урон не проходит.
  const hpAtShift = shifted.hp;
  const blocked = tickGame(fighting, 100);
  assert.equal(enemyById(blocked, "546-overseer").hp, hpAtShift, "урон в неуязвимости не проходит");
});

test("урон боссу зажат потолком и полом за удар", () => {
  const state = bossFight();
  const boss = enemyById(state, "546-overseer");
  const cap = Math.round(boss.maxHp * BOSS.damageCapShare);

  const huge = commandHeavyAttack({
    ...state,
    hero: { ...state.hero, level: 50, attributes: { ...state.hero.attributes, body: 12 } },
  });
  const afterHuge = enemyById(huge, "546-overseer");
  assert.ok(boss.hp - afterHuge.hp <= cap, "один удар не удаляет фазу");
  assert.ok(boss.hp - afterHuge.hp > 0);
});

test("опора танка копится блоком и усиливает поглощение", () => {
  assert.equal(footingStepsFor(0), 0);
  assert.equal(footingStepsFor(1200), 1);
  assert.equal(footingStepsFor(99999), 3);

  let state = heroAt(investDirection(createInitialState(), "guard"), { x: 9, y: 8 });
  state = { ...state, worldTimeMs: 20000 };
  state = commandBlock(state, true);
  let holding = state;
  for (let frame = 0; frame < 20; frame += 1) holding = tickGame(holding, 100);
  assert.ok(holding.hero.footingMs > 0, "удержание блока копит опору");
  assert.ok(archetypeResourceSteps(holding) >= 1);

  const released = tickGame(commandBlock(holding, false), 100);
  assert.equal(released.hero.footingMs, 0, "опущенный блок рассыпает опору");
});

test("толчок щитом отбрасывает цель и срывает подготовку атаки", () => {
  let state = heroAt(investDirection(createInitialState(), "guard"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 8 },
    castUntilMs: 99999,
    attackCooldownMs: 99999,
  });
  state = commandAttack(state, "guard-kl4");

  const pushed = commandShieldPush(state);
  const guard = enemyById(pushed, "guard-kl4");
  assert.equal(guard.castUntilMs, 0, "подготовка сорвана");
  assert.ok(guard.position.x > 10, "цель отброшена");
  assert.ok(pushed.hero.footingMs > state.hero.footingMs, "толчок добавляет опору");
  assert.ok(pushed.hero.breath < state.hero.breath);
});

test("серия ловкача бьёт трижды по нарастающей и набирает темп", () => {
  let state = heroAt(investDirection(createInitialState(), "agility"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 8 },
    hp: 900,
    maxHp: 900,
    attackCooldownMs: 99999,
  });
  state = commandAttack(state, "guard-kl4");

  const flurry = commandFlurry(state);
  const guard = enemyById(flurry, "guard-kl4");
  assert.ok(guard.hp < 900 - 40, "три удара наносят заметный урон");
  assert.ok(flurry.hero.tempoStacks >= 1, "серия набирает темп");
  assert.match(flurry.log.join("\n"), /Серия/);
});

test("полный темп ловкача превращает любой угол в удар в спину", () => {
  assert.equal(tempoGrantsBackstab(2), false);
  assert.equal(tempoGrantsBackstab(3), true);

  let state = heroAt(investDirection(createInitialState(), "agility"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 8 }, hp: 900, maxHp: 900, attackCooldownMs: 99999 });
  state = commandAttack(state, "guard-kl4");

  const plain = tickGame({ ...state, hero: { ...state.hero, tempoStacks: 0 } }, 100);
  const full = tickGame(
    { ...state, hero: { ...state.hero, tempoStacks: 3, tempoGainedAtMs: state.worldTimeMs } },
    100,
  );
  const plainDamage = 900 - enemyById(plain, "guard-kl4").hp;
  const fullDamage = 900 - enemyById(full, "guard-kl4").hp;
  assert.ok(fullDamage > plainDamage, "на полном темпе удар сильнее");
});

test("заход за спину переносит героя в тыл и бьёт как по не видящей цели", () => {
  let state = heroAt(investDirection(createInitialState(), "agility"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 8 }, hp: 900, maxHp: 900, attackCooldownMs: 99999 });
  state = commandAttack(state, "guard-kl4");

  const behind = commandBackstab(state);
  assert.ok(behind.hero.positions.floor556.x > 10, "герой оказался за целью");
  assert.ok(enemyById(behind, "guard-kl4").hp < 900);
  assert.ok(behind.hero.tempoStacks >= 1);
  assert.ok(behind.hero.breath < state.hero.breath);
});

test("позиция тяжёлого стрелка меняет размен урона и подвижности", () => {
  let state = heroAt(investDirection(createInitialState(), "suppression"), { x: 9, y: 8 });
  const mobile = heroMoveSpeed(state);

  const deployed = commandSetUp(state);
  assert.ok(deployed.hero.deployedSinceMs > 0, "позиция занята");
  assert.ok(heroMoveSpeed(deployed) < mobile, "подвижность падает");
  assert.match(deployed.log[0], /Позиция занята/i);

  const packed = commandSetUp(deployed);
  assert.equal(packed.hero.deployedSinceMs, 0, "оружие сворачивается обратно");
});

test("стрельба греет ствол, перегрев блокирует оружие, сброс стоит уязвимости", () => {
  let state = heroAt(investDirection(createInitialState(), "suppression"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 8 }, hp: 9000, maxHp: 9000, attackCooldownMs: 99999 });
  state = commandAttack(state, "guard-kl4");

  let firing = state;
  for (let frame = 0; frame < 40; frame += 1) firing = tickGame(firing, 100);
  assert.ok(firing.hero.heat > 0, "стрельба греет ствол");

  const hot = { ...firing, hero: { ...firing.hero, heat: HEAT_OVERHEAT } };
  const overheated = tickGame(hot, 100);
  assert.ok(overheated.hero.overheatedUntilMs > overheated.worldTimeMs, "наступил перегрев");
  assert.ok(overheated.hero.hp < hot.hero.hp, "перегрев обжигает героя");
  assert.match(overheated.log.join("\n"), /перегрет/i);

  const vented = commandVentHeat(overheated);
  assert.ok(vented.hero.heat < overheated.hero.heat, "сброс снимает температуру");
  assert.ok(vented.hero.ventVulnerableUntilMs > vented.worldTimeMs, "и открывает героя");
});

test("подавление прижимает группу без урона", () => {
  let state = heroAt(investDirection(createInitialState(), "suppression"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 11, y: 8 }, mode: "combat", attackCooldownMs: 0 });
  const before = enemyById(state, "guard-kl4").hp;

  const suppressed = commandSuppress(state);
  const guard = enemyById(suppressed, "guard-kl4");
  assert.equal(guard.hp, before, "подавление не наносит урона");
  assert.equal(guard.mode, "retreat", "цель прекращает сближение");
  assert.ok(suppressed.hero.heat > state.hero.heat, "подавление греет ствол");
});

test("резонанс копит стеки, цепь бьёт по группе, разрыв обрушивает стойку", () => {
  assert.ok(chainDamageAt(100, 0) > chainDamageAt(100, 1));
  assert.ok(chainDamageAt(100, 3) > 0);
  assert.equal(chainDamageAt(100, 4), 0, "цепь ограничена четырьмя переходами");

  let state = heroAt(investDirection(createInitialState(), "resonance"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", { position: { x: 10, y: 8 }, hp: 900, maxHp: 900, attackCooldownMs: 99999 });
  state = commandAttack(state, "guard-kl4");

  let firing = state;
  for (let frame = 0; frame < 30; frame += 1) firing = tickGame(firing, 100);
  assert.ok(enemyById(firing, "guard-kl4").resonanceStacks > 0, "попадания копят резонанс");

  const chained = commandResonanceChain(firing);
  assert.ok(chained.hero.contamination > firing.hero.contamination, "цепь стоит заражения");
  assert.match(chained.log.join("\n"), /Цепь резонанса/i);

  const charged = withEnemy(chained, "guard-kl4", { resonanceStacks: RESONANCE_MAX_STACKS });
  const desynced = commandDesync(charged);
  const guard = enemyById(desynced, "guard-kl4");
  assert.equal(guard.resonanceStacks, 0, "разрыв тратит весь резонанс");
  assert.ok(guard.stunnedUntilMs > desynced.worldTimeMs, "цель теряет ход");
  assert.match(desynced.log.join("\n"), /синхронизация разорвана/i);

  const notReady = commandDesync(withEnemy(chained, "guard-kl4", { resonanceStacks: 1 }));
  assert.match(notReady.log[0], /ещё не набран/i);
});

test("обратная тень даёт неуязвимость ценой заражения и запрета атаковать", () => {
  let state = heroAt(investDirection(createInitialState(), "resonance"), { x: 9, y: 8 });
  state = withEnemy(state, "guard-kl4", {
    position: { x: 10, y: 8 },
    damage: 240,
    attackCooldownMs: 0,
    castUntilMs: 1,
    thinkCooldownMs: 0,
  });

  const shadow = commandReverseShadow(state);
  assert.ok(shadow.hero.reverseShadowUntilMs > shadow.worldTimeMs);
  assert.ok(shadow.hero.contamination > state.hero.contamination, "тень стоит заражения");
  assert.equal(shadow.hero.attackTargetId, null, "атаковать нельзя");

  const survived = tickGame(shadow, 100);
  assert.equal(survived.hero.hp, shadow.hero.hp, "в тени урон не проходит");
});

test("каждый архетип отвечает на три обязательных вопроса своей цепочкой", () => {
  for (const archetype of Object.values(ARCHETYPES)) {
    const steps = archetype.abilities.map((ability) => ability.step);
    assert.ok(Math.min(...steps) === 1, `${archetype.id}: есть вход в цепочку`);
    assert.ok(new Set(archetype.abilities.map((a) => a.id)).size === archetype.abilities.length);
    assert.ok(
      archetype.abilities.some((ability) => ability.breathCost > 0 || ability.resourceCost > 0),
      `${archetype.id}: у сильных механик есть цена`,
    );
  }
});
