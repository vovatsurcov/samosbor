import test from "node:test";
import assert from "node:assert/strict";

import {
  WEAPON_FAMILIES,
  WEAPON_FAMILY_OF,
  familyCooldown,
  familyExposureBonus,
  familyOf,
  familyStanceDamage,
} from "../app/game-weapon-families.ts";

import {
  applyDevProfile,
  createInitialState,
  devProfileById,
  equipItem,
  heroAttackCooldown,
  heroMoveSpeed,
} from "../app/game-engine.ts";

/** Экипирует оружие, добавив его в инвентарь. */
function withWeapon(state, itemId) {
  const entry = state.hero.inventory.find((item) => item.itemId === itemId);
  if (entry) return equipItem(state, entry.instanceId);
  const instanceId = `test-${itemId}`;
  const seeded = {
    ...state,
    hero: {
      ...state.hero,
      inventory: [...state.hero.inventory, { instanceId, itemId, quantity: 1, condition: 100 }],
    },
  };
  return equipItem(seeded, instanceId);
}

test("семейства отвечают на вопросы по-разному, а не одинаково", () => {
  const families = Object.values(WEAPON_FAMILIES);
  assert.ok(families.length >= 5, "срез должен покрывать несколько разных семейств");

  for (const family of families) {
    assert.ok(family.verb.length > 0, `${family.id}: не сказано, что игрок делает руками`);
    assert.ok(family.weakness.length > 0, `${family.id}: у семейства нет слабости`);
    assert.ok(family.applies.length > 0 && family.consumes.length > 0);
  }

  // Если у двух семейств совпадают ритм, площадь, работа со стойкой и
  // подвижность — они отличаются только числами и это дефект.
  const shapes = families.map((f) => `${f.tempo}|${f.sweep}|${f.stance}|${f.mobilityPenalty}|${f.commitment}`);
  assert.equal(new Set(shapes).size, families.length, "семейства обязаны отличаться поведением");
});

test("работа со стойкой различается по семействам, а не по урону", () => {
  const heavy = WEAPON_FAMILIES.heavy_melee;
  const light = WEAPON_FAMILIES.light_melee;
  const rifle = WEAPON_FAMILIES.rifle;

  assert.ok(familyStanceDamage(10, heavy) > familyStanceDamage(10, light) * 3, "ломающее оружие ломает стойку");
  assert.ok(familyStanceDamage(10, light) < 10, "лёгкое почти не трогает стойку");

  // Выжидающее берёт не сломом стойки, а работой по уже вскрытой цели.
  assert.ok(familyExposureBonus(rifle) > familyExposureBonus(heavy));
  assert.equal(familyExposureBonus(heavy), 0, "ломающее само создаёт окно и доплаты не получает");
});

test("ритм и подвижность зависят от того, что в руках", () => {
  const base = createInitialState();
  const axe = withWeapon(base, "breachAxe");
  const baton = withWeapon(base, "shockBaton");

  assert.ok(heroAttackCooldown(axe) > heroAttackCooldown(baton), "тяжёлое бьёт реже лёгкого");
  assert.ok(heroMoveSpeed(axe) < heroMoveSpeed(baton), "тяжесть видно по походке");
  assert.ok(
    familyCooldown(1000, WEAPON_FAMILIES.heavy_melee) > familyCooldown(1000, WEAPON_FAMILIES.light_melee),
  );
});

test("одно оружие играется по-разному в разных направлениях", () => {
  // Ключевая проверка Stage 3: винтовка не принадлежит Прицелу.
  const rifleAim = withWeapon(applyDevProfile(createInitialState(), devProfileById("pure-aim")), "coilRifle");
  const rifleTempo = withWeapon(applyDevProfile(createInitialState(), devProfileById("pure-tempo")), "coilRifle");
  const rifleHeat = withWeapon(applyDevProfile(createInitialState(), devProfileById("pure-heat")), "coilRifle");

  // Оружие то же — физический язык общий.
  assert.equal(familyOf("coilRifle").id, "rifle");
  // Направление меняет, как этим языком пользуются.
  const speeds = [heroMoveSpeed(rifleAim), heroMoveSpeed(rifleTempo), heroMoveSpeed(rifleHeat)];
  assert.ok(speeds[1] > speeds[0], "Темп с той же винтовкой заметно подвижнее Прицела");
  assert.ok(new Set(speeds.map((value) => value.toFixed(2))).size > 1, "сборка меняет обращение с оружием");
});

test("ни одно семейство не закреплено за направлением", () => {
  // Привязка есть только оружие→семейство. Направления в таблице нет вовсе,
  // и это защищает от возвращения скрытых классов.
  const mapped = Object.values(WEAPON_FAMILY_OF);
  assert.ok(mapped.length >= 6, "все определения оружия отнесены к семействам");
  for (const family of Object.values(WEAPON_FAMILIES)) {
    assert.equal("direction" in family, false, `${family.id}: у семейства не должно быть направления`);
    assert.equal("requiredDirection" in family, false, `${family.id}: требований по направлению быть не может`);
  }
});

// --- Две руки -------------------------------------------------------------

import { combineHands, describeCombination } from "../app/game-hands.ts";
import { heroDefenceProfile, heroHandCombination } from "../app/game-engine.ts";

function withOffhand(state, itemId) {
  const instanceId = `off-${itemId}`;
  const seeded = {
    ...state,
    hero: {
      ...state.hero,
      inventory: [...state.hero.inventory, { instanceId, itemId, quantity: 1, condition: 100 }],
    },
  };
  return equipItem(seeded, instanceId);
}

test("сочетание рук выводится из способностей, а не прописано парой", () => {
  const pistol = { id: "p", name: "пистолет", capabilities: ["one_handed", "ranged", "applies_state"] };
  const shield = { id: "s", name: "щит", capabilities: ["one_handed", "defensive"] };
  const bar = { id: "b", name: "монтировка", capabilities: ["one_handed", "melee", "consumes_state"] };

  assert.equal(combineHands(pistol, null).id, "free_hand");
  assert.equal(combineHands(pistol, shield).id, "covered_fire");
  assert.equal(combineHands(pistol, { ...pistol, id: "p2" }).id, "dual_ranged");
  assert.equal(combineHands(bar, shield).id, "shielded_melee");
  assert.equal(combineHands(bar, { ...bar, id: "b2" }).id, "dual_melee");
  assert.equal(combineHands(pistol, bar).id, "mixed_grip");

  // Новое оружие получает поведение само, стоит ему объявить теги.
  const unknown = { id: "x", name: "неизвестное", capabilities: ["one_handed", "melee"] };
  assert.equal(combineHands(unknown, shield).id, "shielded_melee");
});

test("две руки — не сумма характеристик: каждая пара играется иначе", () => {
  const base = createInitialState();
  const dual = withOffhand(base, "reserveSidearm");
  const shielded = withOffhand(base, "riotShield");
  const mixed = withOffhand(base, "pryBar");

  const cadence = {
    dual: heroAttackCooldown(dual),
    shielded: heroAttackCooldown(shielded),
    mixed: heroAttackCooldown(mixed),
  };
  // Пистолет со щитом — не «пистолет с запасом ОЗ»: он медленнее и тяжелее.
  assert.ok(cadence.shielded > cadence.dual, "щит замедляет, парная стрельба ускоряет");
  assert.ok(heroMoveSpeed(shielded) < heroMoveSpeed(dual), "щит стоит подвижности");
  assert.ok(
    heroDefenceProfile(shielded).blockChance > heroDefenceProfile(dual).blockChance + 0.15,
    "защитная рука меняет защиту на порядок, а не на проценты",
  );
  // Парная стрельба отказывается от защиты ради темпа — это её размен.
  assert.equal(heroDefenceProfile(dual).blockChance, 0, "обе руки заняты стрельбой");

  // Смешанный хват — отдельный стиль, а не «стрелок с другим вторым предметом».
  assert.equal(heroHandCombination(mixed).reach, "hybrid");
  assert.equal(heroHandCombination(dual).reach, "ranged");
  assert.ok(heroHandCombination(mixed).stateLoop, "одна рука наводит состояние, другая расходует");
  assert.equal(heroHandCombination(dual).stateLoop, false);
});

test("пары различаются руками, а не только числами", () => {
  const base = createInitialState();
  const pairs = ["reserveSidearm", "riotShield", "pryBar"].map((id) => heroHandCombination(withOffhand(base, id)));
  const shapes = pairs.map((c) => `${c.id}|${c.reach}|${c.sweep}|${c.stateLoop}|${c.blockChance}`);
  assert.equal(new Set(shapes).size, pairs.length, "каждая пара — свой стиль");
  for (const combination of pairs) {
    assert.ok(combination.verb.length > 0, `${combination.id}: не сказано, что делают руки`);
    assert.ok(describeCombination(combination).length > 0, "интерфейс может объяснить пару");
  }
});

test("совместимость определяется предметом, а не направлением", () => {
  // Один и тот же щит работает у любой сборки: класса нет.
  const aim = withOffhand(applyDevProfile(createInitialState(), devProfileById("pure-aim")), "riotShield");
  const surge = withOffhand(applyDevProfile(createInitialState(), devProfileById("pure-surge")), "riotShield");
  assert.equal(heroHandCombination(aim).id, heroHandCombination(surge).id);
  assert.ok(heroDefenceProfile(aim).blockChance > 0.15 && heroDefenceProfile(surge).blockChance > 0.15);
});

test("двуручное оружие занимает обе руки", () => {
  const rifle = withWeapon(createInitialState(), "coilRifle");
  assert.equal(heroHandCombination(rifle).id, "two_handed");
  assert.match(heroHandCombination(rifle).weakness, /свободной руки нет/i);
});
