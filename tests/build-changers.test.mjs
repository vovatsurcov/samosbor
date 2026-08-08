import test from "node:test";
import assert from "node:assert/strict";

import { KEYSTONES, RULE_INFO, describeRule } from "../app/game-rules.ts";

import {
  activeRules,
  applyDevProfile,
  commandHeavyAttack,
  createInitialState,
  devProfileById,
  enemyById,
  equipItem,
  hasRule,
  heroDefenceProfile,
  heroHandCombination,
  heroMoveSpeed,
  ruleReadout,
} from "../app/game-engine.ts";

function equip(state, itemId) {
  const instanceId = `bc-${itemId}`;
  const seeded = {
    ...state,
    hero: {
      ...state.hero,
      inventory: [...state.hero.inventory, { instanceId, itemId, quantity: 1, condition: 100 }],
    },
  };
  return equipItem(seeded, instanceId);
}

function arena(state) {
  return {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { x: 10, y: 9 } }, path: [] },
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? { ...enemy, position: { x: 11, y: 9 }, hp: 9000, maxHp: 9000, stance: 4000, maxStance: 4000, attackCooldownMs: 999999, thinkCooldownMs: 999999 }
        : enemy),
  };
}

const withoutKeystones = (state) => ({
  ...state,
  hero: { ...state.hero, talents: state.hero.talents.filter((id) => !/:16$/.test(id)) },
});

test("каждое направление имеет ключевой узел, меняющий правило", () => {
  for (const direction of ["power", "precision", "guard", "agility", "suppression", "resonance"]) {
    const keystone = KEYSTONES.find((node) => node.nearDirection === direction);
    assert.ok(keystone, `${direction}: нет ключевого узла`);
    const info = RULE_INFO[keystone.flag];
    assert.ok(info.changes.length > 0, `${direction}: не сказано, что меняется`);
    assert.ok(info.gains.length > 0, `${direction}: нечего приобретать`);
    assert.ok(info.costs.length > 0, `${direction}: у узла нет цены`);
    assert.ok(info.interacts.length > 0, `${direction}: не сказано, с чем взаимодействует`);
  }
});

test("подсказка объясняет и выигрыш, и цену", () => {
  for (const flag of Object.keys(RULE_INFO)) {
    const line = describeRule(flag);
    assert.match(line, /Даёт:/, `${flag}: не сказано, что даёт`);
    assert.match(line, /Отнимает:/, `${flag}: цена спрятана`);
  }
});

test("узел Резонанса убирает мгновенный всплеск целиком", () => {
  const build = applyDevProfile(createInitialState(), devProfileById("pure-resonance"));
  const primed = (state) => {
    const field = arena(state);
    return {
      ...field,
      enemies: field.enemies.map((enemy) =>
        enemy.id === "guard-kl4" ? { ...enemy, resonanceStacks: 3 } : enemy),
    };
  };

  const before = commandHeavyAttack(primed(withoutKeystones(build)));
  const after = commandHeavyAttack(primed(build));

  assert.ok(before.log.some((line) => /Резонанс сорван/i.test(line)), "без узла резонанс срывается ударом");
  assert.ok(!after.log.some((line) => /Резонанс сорван/i.test(line)), "с узлом мгновенного срыва больше нет");
  assert.equal(enemyById(after, "guard-kl4").resonanceStacks, 3, "накопленное осталось на цели");
});

test("узел Темпа снимает защиту полностью — это настоящий размен", () => {
  const tempo = applyDevProfile(createInitialState(), devProfileById("pure-tempo"));
  const before = heroDefenceProfile(withoutKeystones(tempo));
  const after = heroDefenceProfile(tempo);

  assert.ok(before.parryChance > 0, "до узла парирование было основным слоем");
  assert.equal(after.parryChance, 0, "с узлом парировать нечем");
  assert.equal(after.blockChance, 0, "и блокировать тоже");
});

test("узел Опоры превращает блок из защиты в источник разгона", () => {
  const guard = applyDevProfile(createInitialState(), devProfileById("pure-footing"));
  assert.equal(hasRule(withoutKeystones(guard), "block:converts_to_surge"), false);
  assert.equal(hasRule(guard, "block:converts_to_surge"), true);
  assert.ok(heroDefenceProfile(guard).blockChance > 0, "шанс блока остаётся: меняется результат срабатывания");
});

test("предметы меняют правила и проходят поперёк направлений", () => {
  const base = createInitialState();
  for (const [itemId, flag] of [
    ["platelessArmour", "defence:armour_only"],
    ["ballastBl9", "twohanded:anchored"],
    ["reflectorOt1", "parry:yields_resonance"],
    ["dischargerRz5", "overload:any_hit_applies"],
    ["gripMg4", "melee:exposes_resonating"],
    ["heatShroud", "heat:overheat_discharges"],
  ]) {
    assert.ok(hasRule(equip(base, itemId), flag), `${itemId}: правило не применилось`);
    const onAnyBuild = equip(applyDevProfile(base, devProfileById("pure-surge")), itemId);
    assert.ok(hasRule(onAnyBuild, flag), `${itemId}: предмет привязан к направлению`);
  }
});

test("предмет меняет защитную стратегию, а не только цифры", () => {
  const build = applyDevProfile(createInitialState(), devProfileById("evasion-parry"));
  const before = heroDefenceProfile(build);
  const after = heroDefenceProfile(equip(build, "platelessArmour"));

  assert.ok(before.evasion > 0, "сборка строилась на уклонении");
  assert.equal(after.evasion, 0, "предмет обнуляет уклонение целиком");
  assert.ok(after.armour > before.armour, "взамен броня работает в полную силу");
});

test("предмет меняет смысл двуручного оружия", () => {
  const base = createInitialState();
  const twoHanded = equipItem(
    { ...base, hero: { ...base.hero, inventory: [...base.hero.inventory, { instanceId: "th", itemId: "breachAxe", quantity: 1, condition: 100 }] } },
    "th",
  );
  const anchored = equip(twoHanded, "ballastBl9");

  assert.equal(heroHandCombination(twoHanded).id, "two_handed");
  assert.ok(heroMoveSpeed(anchored) < heroMoveSpeed(twoHanded) * 0.75, "предмет резко меняет подвижность");
  assert.equal(hasRule(anchored, "twohanded:anchored"), true);
});

test("лист персонажа показывает изменённые правила", () => {
  const plain = createInitialState();
  assert.equal(ruleReadout(plain).length, 0, "без предметов и узлов правил не изменено");

  const changed = equip(applyDevProfile(plain, devProfileById("pure-resonance")), "platelessArmour");
  const readout = ruleReadout(changed);
  assert.ok(readout.length >= 2, "показаны и узел, и предмет");
  for (const line of readout) {
    assert.ok(line.name.length > 0 && /Даёт:/.test(line.line) && /Отнимает:/.test(line.line));
  }
});

test("три гибрида работают за счёт взаимодействия механик", () => {
  const guardSurge = applyDevProfile(createInitialState(), devProfileById("pure-footing"));
  assert.equal(hasRule(guardSurge, "block:converts_to_surge"), true);

  const tempoResonance = equip(
    withoutKeystones(applyDevProfile(createInitialState(), devProfileById("pure-tempo"))),
    "reflectorOt1",
  );
  assert.ok(heroDefenceProfile(tempoResonance).parryChance > 0, "парирование доступно");
  assert.equal(hasRule(tempoResonance, "parry:yields_resonance"), true);

  const anyOverload = equip(applyDevProfile(createInitialState(), devProfileById("pure-surge")), "dischargerRz5");
  assert.equal(hasRule(anyOverload, "overload:any_hit_applies"), true);
  assert.notEqual(heroHandCombination(anyOverload).id, "free_hand", "устройство занимает вторую руку");
});

test("правила переживают сохранение и загрузку", async () => {
  const { migrateGameState } = await import("../app/game-engine.ts");
  const built = equip(applyDevProfile(createInitialState(), devProfileById("pure-resonance")), "platelessArmour");
  const restored = migrateGameState(JSON.parse(JSON.stringify(built)));
  assert.deepEqual(activeRules(restored).sort(), activeRules(built).sort());
});

test("одно правило не делает сборку лучше во всём", () => {
  for (const info of Object.values(RULE_INFO)) {
    assert.ok(info.costs.length > 12, `${info.flag}: цена выглядит формальной`);
  }
  const base = createInitialState();
  assert.equal(heroDefenceProfile(equip(base, "platelessArmour")).evasion, 0);
  assert.equal(heroDefenceProfile(applyDevProfile(base, devProfileById("pure-tempo"))).blockChance, 0);
});
