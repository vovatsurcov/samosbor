import test from "node:test";
import assert from "node:assert/strict";

import {
  ARMOR_MITIGATION_CAP,
  BLOCK,
  BOSS,
  CRITICAL,
  DODGE,
  RANK_SCALING,
  STAGGER,
  armorMitigation,
  blockAbsorption,
  breathRegenPerSecond,
  capBossHitOnHero,
  chargeMultipliers,
  criticalChance,
  floorTier,
  maxHeroBreath,
  maxHeroHp,
  maxHeroStance,
  migrateHpShare,
  resolveStrike,
  scaleEnemy,
  stanceRegenPerSecond,
  stanceState,
} from "../app/game-combat-model.ts";

const commonTarget = {
  hp: 73,
  maxHp: 73,
  armor: 10,
  stance: 40,
  maxStance: 40,
  rank: "common",
};

const lightStrike = {
  damage: 24,
  stanceDamage: 8,
  damageType: "kinetic",
  kind: "light",
};

test("броня смягчает урон, но никогда не больше семидесяти процентов", () => {
  assert.equal(armorMitigation(0, "kinetic"), 0);
  assert.ok(armorMitigation(25, "kinetic") > armorMitigation(10, "kinetic"));
  for (const armor of [120, 500, 5000, 1e9]) {
    assert.ok(armorMitigation(armor, "kinetic") <= ARMOR_MITIGATION_CAP, `броня ${armor}`);
  }
  assert.equal(armorMitigation(1e9, "kinetic"), ARMOR_MITIGATION_CAP);

  // Резонансный урон почти игнорирует броню, кинетический — нет.
  assert.ok(armorMitigation(80, "resonant") < armorMitigation(80, "kinetic") / 2);
  assert.ok(armorMitigation(80, "electric") < armorMitigation(80, "kinetic"));
  assert.ok(armorMitigation(80, "thermal") < armorMitigation(80, "kinetic"));

  // Пробивание снимает часть брони и не уводит смягчение ниже нуля.
  assert.ok(armorMitigation(45, "kinetic", 15) < armorMitigation(45, "kinetic"));
  assert.equal(armorMitigation(10, "kinetic", 999), 0);
});

test("итоговый урон никогда не опускается ниже единицы", () => {
  const armored = { ...commonTarget, armor: 400, flatAbsorb: 60 };
  const result = resolveStrike({ ...lightStrike, damage: 1 }, armored, { roll: 0 });
  assert.ok(result.damage >= 1);
  assert.ok(Number.isInteger(result.damage));
});

test("позиция и состояние цели меняют урон предсказуемо", () => {
  const front = resolveStrike(lightStrike, commonTarget, { roll: 0.5, facing: "front" });
  const back = resolveStrike(lightStrike, commonTarget, { roll: 0.5, facing: "back" });
  const unaware = resolveStrike(lightStrike, commonTarget, { roll: 0.5, facing: "unaware" });
  assert.ok(back.damage > front.damage);
  assert.ok(unaware.damage > back.damage);

  const shaken = resolveStrike(lightStrike, { ...commonTarget, stance: 5 }, { roll: 0.5 });
  const staggered = resolveStrike(lightStrike, { ...commonTarget, staggered: true }, { roll: 0.5 });
  const finishing = resolveStrike(lightStrike, { ...commonTarget, finishing: true }, { roll: 0.5 });
  assert.ok(shaken.damage > front.damage);
  assert.ok(staggered.damage > shaken.damage);
  assert.ok(finishing.damage > staggered.damage);
});

test("разброс урона детерминирован: один и тот же бросок даёт один и тот же результат", () => {
  const low = resolveStrike(lightStrike, commonTarget, { roll: 0 });
  const high = resolveStrike(lightStrike, commonTarget, { roll: 1 });
  assert.ok(high.damage > low.damage);
  assert.deepEqual(
    resolveStrike(lightStrike, commonTarget, { roll: 0.37 }),
    resolveStrike(lightStrike, commonTarget, { roll: 0.37 }),
  );
  assert.ok(high.damage / low.damage < 1.2, "разброс остаётся узким");
});

test("крит даёт не удвоение, а множитель и эффект по типу урона", () => {
  const plain = resolveStrike(lightStrike, commonTarget, { roll: 0.5, criticalRoll: 0.99 });
  assert.equal(plain.critical, false);
  assert.equal(plain.criticalEffect, null);

  const crit = resolveStrike(lightStrike, commonTarget, { roll: 0.5, criticalRoll: 0 });
  assert.equal(crit.critical, true);
  assert.equal(crit.criticalEffect, "rupture");
  assert.ok(crit.damage < plain.damage * 2, "крит перестал быть удвоением");
  assert.ok(crit.damage > plain.damage);

  for (const [type, effect] of [
    ["electric", "surge"],
    ["thermal", "burn"],
    ["resonant", "defocus"],
  ]) {
    const typed = resolveStrike(
      { ...lightStrike, damageType: type },
      commonTarget,
      { roll: 0.5, criticalRoll: 0 },
    );
    assert.equal(typed.criticalEffect, effect);
  }

  assert.equal(criticalChance(1), CRITICAL.chanceCap);
  assert.equal(blockAbsorption(1), BLOCK.absorbCap);
});

test("тяжёлая атака ломает стойку заметно быстрее лёгкой", () => {
  const light = resolveStrike(lightStrike, commonTarget, { roll: 0.5 });
  const heavy = resolveStrike({ ...lightStrike, kind: "heavy" }, commonTarget, { roll: 0.5 });
  assert.ok(heavy.stanceDamage >= light.stanceDamage * 3);
  assert.ok(heavy.damage > light.damage);

  const counter = resolveStrike(
    { ...lightStrike, kind: "heavy", counterTiming: true },
    commonTarget,
    { roll: 0.5 },
  );
  assert.ok(counter.stanceDamage > heavy.stanceDamage, "встречный удар сильнее по стойке");

  const charged = resolveStrike(
    { ...lightStrike, kind: "charged", chargeSteps: 3 },
    commonTarget,
    { roll: 0.5 },
  );
  assert.ok(charged.stanceDamage > heavy.stanceDamage);
  assert.deepEqual(chargeMultipliers(99), chargeMultipliers(3), "заряд ограничен тремя ступенями");
});

test("блок снимает часть урона, идеальный блок отменяет удар и возвращает дыхание", () => {
  const open = resolveStrike(lightStrike, commonTarget, { roll: 0.5 });
  const blocked = resolveStrike(lightStrike, commonTarget, { roll: 0.5, blocking: true });
  assert.ok(blocked.damage < open.damage);
  assert.ok(blocked.stanceDamage < open.stanceDamage);
  assert.ok(blocked.breathCost > 0, "блок стоит дыхания");

  const perfect = resolveStrike(lightStrike, commonTarget, {
    roll: 0.5,
    blocking: true,
    perfectBlock: true,
  });
  assert.equal(perfect.damage, 0);
  assert.equal(perfect.stanceDamage, 0);
  assert.ok(perfect.attackerStanceDamage > 0, "атакующий получает в стойку");
  assert.equal(perfect.breathCost, -BLOCK.perfectBreathRefund);
});

test("идеальное уклонение усиливает следующий удар", () => {
  const plain = resolveStrike(lightStrike, commonTarget, { roll: 0.5 });
  const tempo = resolveStrike(lightStrike, commonTarget, { roll: 0.5, perfectDodgeTempo: true });
  assert.ok(tempo.damage > plain.damage);
  assert.ok(DODGE.invulnerableMs > 0 && DODGE.recoveryMs > DODGE.invulnerableMs);
});

test("обнуление стойки переводит цель в ошеломление с иммунитетом после выхода", () => {
  assert.equal(stanceState(40, 40), "steady");
  assert.equal(stanceState(5, 40), "shaken");
  assert.equal(stanceState(0, 40), "staggered");

  const result = resolveStrike(
    { ...lightStrike, kind: "heavy", stanceDamage: 30 },
    { ...commonTarget, stance: 12 },
    { roll: 0.5 },
  );
  assert.equal(result.staggered, true);
  assert.equal(result.targetStance, 0);
  assert.equal(result.stanceState, "staggered");

  for (const rank of ["common", "elite", "boss"]) {
    assert.ok(STAGGER[rank].durationMs > 0, rank);
    assert.ok(STAGGER[rank].damageMultiplier >= 1.25, rank);
  }
  assert.ok(STAGGER.common.immunityMs > 0, "без иммунитета цель блокируется навсегда");
  assert.ok(STAGGER.common.durationMs > STAGGER.elite.durationMs);
  assert.ok(STAGGER.elite.durationMs > STAGGER.boss.durationMs);

  assert.ok(stanceRegenPerSecond(100) > 0);
});

test("боссовый урон зажат между полом и потолком", () => {
  const boss = { hp: 4000, maxHp: 4000, armor: 120, stance: 400, maxStance: 400, rank: "boss" };
  const cap = Math.round(boss.maxHp * BOSS.damageCapShare);
  const floor = Math.round(boss.maxHp * BOSS.damageFloorShare);

  const huge = resolveStrike(
    { ...lightStrike, damage: 9000, kind: "charged", chargeSteps: 3 },
    boss,
    { roll: 1, criticalRoll: 0 },
  );
  assert.ok(huge.damage <= cap, "один удар не удаляет фазу босса");

  const weak = resolveStrike({ ...lightStrike, damage: 1 }, boss, { roll: 0 });
  assert.ok(weak.damage >= floor, "слабая сборка не упирается в бессмысленность");
});

test("атака босса не убивает героя с полного здоровья одним ударом", () => {
  assert.equal(capBossHitOnHero(10000, 120), Math.round(120 * BOSS.heroHitCapShare));
  assert.ok(capBossHitOnHero(10000, 120) < 120);
  // Два удара подряд убить могут: это разрешено моделью.
  const first = capBossHitOnHero(10000, 120);
  const second = capBossHitOnHero(10000, 120 - first);
  assert.ok(first + second < 120);
  assert.ok(capBossHitOnHero(3, 120) === 3, "слабый удар не усиливается потолком");
});

test("противники масштабируются от этажа и ранга, а не от уровня героя", () => {
  assert.equal(floorTier(556), 1);
  assert.equal(floorTier(546), 3);
  assert.ok(floorTier(507) > floorTier(546));

  const base = { hp: 60, damage: 10, armor: 4, stance: 30 };
  const shallow = scaleEnemy(base, { floor: 556, rank: "common" });
  const deep = scaleEnemy(base, { floor: 546, rank: "common" });
  assert.ok(deep.hp > shallow.hp);
  assert.ok(deep.damage > shallow.damage);
  assert.ok(deep.armor > shallow.armor);

  const boss = scaleEnemy(base, { floor: 546, rank: "boss" });
  assert.ok(boss.hp > deep.hp * 5);
  assert.equal(boss.flatAbsorb, RANK_SCALING.boss.flatAbsorb);

  // Тревога популяции добавляет не больше десяти процентов.
  const calm = scaleEnemy(base, { floor: 549, rank: "common", agitation: 0 });
  const furious = scaleEnemy(base, { floor: 549, rank: "common", agitation: 100 });
  assert.ok(furious.hp <= Math.round(calm.hp * 1.1) + 1);
  assert.ok(furious.damage <= Math.round(calm.damage * 1.1) + 1);
});

test("шкалы героя дают проектные ориентиры первого уровня", () => {
  const hp = maxHeroHp({ level: 1, body: 2 });
  const stance = maxHeroStance({ level: 1, body: 2, will: 2 });
  const breath = maxHeroBreath({ reaction: 3, will: 2 });
  assert.ok(hp >= 110 && hp <= 130, `ОЗ первого уровня: ${hp}`);
  assert.ok(stance >= 70 && stance <= 85, `стойка первого уровня: ${stance}`);
  assert.ok(breath >= 105 && breath <= 120, `дыхание первого уровня: ${breath}`);

  // Полностью заражённый и переломанный герой не превращается в бумагу.
  assert.ok(maxHeroHp({ level: 1, body: 1, torsoInjury: 2, contamination: 100 }) >= 40);

  const late = maxHeroHp({ level: 50, body: 12, equipment: 350, talents: 180 });
  assert.ok(late > 1150 && late < 1300, `ОЗ пятидесятого уровня: ${late}`);
  // Ни уровни, ни экипировка не должны в одиночку решать выживаемость.
  const levelsOnly = maxHeroHp({ level: 50, body: 12 });
  const gearOnly = maxHeroHp({ level: 1, body: 2, equipment: 350, talents: 180 });
  assert.ok(levelsOnly < late * 0.7 && gearOnly < late * 0.7);
});

test("дыхание падает от перегруза, заражения, стресса и негодной маски", () => {
  const clean = breathRegenPerSecond({});
  assert.equal(Math.round(clean), 18);
  assert.ok(breathRegenPerSecond({ overloadShare: 1 }) < clean);
  assert.ok(breathRegenPerSecond({ contamination: 100 }) < clean);
  assert.ok(breathRegenPerSecond({ stress: 100 }) < clean);
  assert.ok(breathRegenPerSecond({ maskFactor: 0.65 }) < clean);
  assert.ok(
    breathRegenPerSecond({ overloadShare: 1, contamination: 100, stress: 100, maskFactor: 0.65 }) >= 0,
  );
});

test("миграция сохранения переносит долю здоровья, а не абсолютное число", () => {
  assert.equal(migrateHpShare(4, 8, 120), 60);
  assert.equal(migrateHpShare(8, 8, 120), 120);
  assert.equal(migrateHpShare(0, 8, 120), 1, "живой герой не превращается в труп при миграции");
  assert.equal(migrateHpShare(5, 0, 120), 120);
});

test("три ориентировочных боя укладываются в проектный темп", () => {
  const hero = { damage: 24, stanceDamage: 8, damageType: "kinetic", kind: "light" };
  let target = { ...commonTarget };
  let hits = 0;
  while (target.hp > 0 && hits < 20) {
    const result = resolveStrike(hero, target, { roll: 0.5 });
    target = { ...target, hp: result.targetHp, stance: result.targetStance };
    hits += 1;
  }
  assert.ok(hits >= 3 && hits <= 4, `герой убивает обычного противника за ${hits} попадания`);

  const enemy = { damage: 12, stanceDamage: 5, damageType: "kinetic", kind: "light" };
  let heroState = { hp: 120, maxHp: 120, armor: 10, stance: 76, maxStance: 76, rank: "common" };
  let incoming = 0;
  while (heroState.hp > 0 && incoming < 40) {
    const result = resolveStrike(enemy, heroState, { roll: 0.5 });
    heroState = { ...heroState, hp: result.targetHp, stance: result.targetStance };
    incoming += 1;
  }
  assert.ok(incoming >= 9 && incoming <= 13, `противник убивает героя за ${incoming} попаданий`);
});
