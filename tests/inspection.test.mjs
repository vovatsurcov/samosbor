// Осмотр: игра обязана объяснять себя одинаково для всех сущностей.
//
// Проверяется не текст, а контракт: карточка собирается из общих частей, ни
// одна сущность не получает собственной реализации подсказки, и главное —
// замена управления талантом видна в интерфейсе как замена, а не как ещё один
// абзац описания.

import test from "node:test";
import assert from "node:assert/strict";

import {
  bonusLines,
  inspectAbility,
  inspectEnemy,
  inspectInteractive,
  inspectItem,
  inspectNpc,
  inspectTalent,
  ruleLines,
  stateLines,
  talentTransform,
} from "../app/game-inspect.ts";

import { ACTION_TRANSFORMATIONS, BASE_ACTIONS, SLOT_LABELS } from "../app/game-actions.ts";

import {
  applyQuickSlot,
  createInitialState,
  ENEMY_DEFINITIONS,
  handChangeFor,
  inspectEnemyAt,
  inspectHeroSlot,
  inspectInventoryItem,
  inspectTalentNode,
  equipItem,
  unequipItem,
  QUICK_SLOTS,
  quickSlotCharges,
  quickSlotEntry,
  spawnEncounter,
  tickGame,
} from "../app/game-engine.ts";

const give = (state, ids) => ({ ...state, hero: { ...state.hero, talents: [...state.hero.talents, ...ids] } });
/** Вложить в правую руку конкретное оружие, не проходя весь инвентарь. */
const withWeapon = (state, itemId) => {
  const instanceId = `test-${itemId}`;
  return {
    ...state,
    hero: {
      ...state.hero,
      inventory: [...state.hero.inventory, { instanceId, itemId, quantity: 1, condition: 100 }],
      equipment: { ...state.hero.equipment, weapon: instanceId },
    },
  };
};
const text = (card) =>
  [card.title, card.subtitle ?? "", card.blocked ?? "", card.footer ?? ""]
    .concat(card.sections.flatMap((part) => [part.title ?? "", ...part.lines.map((l) => `${l.label ?? ""} ${l.value}`)]))
    .join(" ");

test("карточка одинаково устроена для любой сущности", () => {
  const cards = [
    inspectEnemy({
      name: "Проверочный", rank: "common", role: "swarm",
      hp: 20, maxHp: 30, stance: 5, maxStance: 18,
      armour: 2, damage: 8, attackRange: 1.2, modeLabel: "в бою",
      dangerous: false, states: [],
    }),
    inspectNpc({ name: "Житель", roleLabel: "техник", kindLabel: "маршрут", description: "Ходит.", interaction: "заговорить" }),
    inspectItem({ name: "Предмет", kindLabel: "снаряжение", description: "Вещь.", stats: [], rules: [] }),
    inspectAbility({ name: "Способность", binding: "1", description: "Бьёт.", targeting: "цель" }),
    inspectTalent({ name: "Узел", kindLabel: "minor", branchLabel: "Разгон", description: "Даёт.", bonuses: [], rules: [], cost: 1, taken: false }),
    inspectInteractive({ name: "Шкаф", description: "Стоит." }),
  ];

  // Одна форма на всё: интерфейс рисует карточку, не зная, что внутри.
  for (const card of cards) {
    assert.equal(typeof card.kind, "string", "вид сущности");
    assert.ok(card.title.length > 0, "название");
    assert.ok(Array.isArray(card.bars), "полосы");
    assert.ok(Array.isArray(card.sections), "секции");
    for (const part of card.sections) {
      assert.ok(part.lines.length > 0, "пустых секций не бывает");
    }
  }

  // Виды различаются, значит карточка не свелась к одному шаблону.
  assert.equal(new Set(cards.map((card) => card.kind)).size, cards.length);
});

test("описание состояний берётся из боевой модели, а не переписывается заново", () => {
  const lines = stateLines([
    { id: "resonance", stacks: 3 },
    { id: "exposure", remainingMs: 2400 },
  ]);
  assert.equal(lines.length, 2);
  assert.match(lines[0].label, /Резонанс ×3/);
  assert.match(lines[1].label, /Вскрытие/);
  assert.match(lines[1].label, /2\.4 с/, "остаток времени виден");
  // Чем состояние снимается — обязательная часть: иначе связка не читается.
  assert.match(lines[0].value, /Снимает/);
});

test("правило показывает цену рядом с выигрышем", () => {
  const lines = ruleLines(["block:converts_to_surge"]);
  const labels = lines.map((line) => line.label);
  assert.deepEqual(labels, ["Меняет", "Даёт", "Отнимает", "Задевает"]);
  assert.equal(lines[1].tone, "gain");
  assert.equal(lines[2].tone, "cost");
});

test("прибавки переводятся в человеческий язык, а не в имена полей", () => {
  const lines = bonusLines({ armor: 4, evasion: 0.08, moveSpeed: -0.05, stealth: 0 });
  const rendered = lines.map((line) => `${line.label}: ${line.value}`);
  assert.deepEqual(rendered, ["Броня: +4", "Уклонение: +8%", "Скорость: −5%"]);
  assert.equal(lines.find((line) => line.label === "Скорость").tone, "cost");
});

test("талант, меняющий управление, объявляет это заменой", () => {
  // Каждая объявленная трансформация обязана читаться как замена, иначе
  // игрок не поймёт, что клавиша под рукой теперь делает другое.
  for (const action of ACTION_TRANSFORMATIONS) {
    const transform = talentTransform(action.talentId);
    assert.ok(transform, `${action.talentId} не описан как замена`);
    assert.equal(transform.binding, SLOT_LABELS[action.slot]);
    assert.equal(transform.from, BASE_ACTIONS[action.slot].name);
    assert.equal(transform.to, action.name);
    assert.notEqual(transform.from, transform.to, "замена на саму себя — не замена");
  }
  assert.equal(talentTransform("power:01"), undefined, "обычный узел ничего не заменяет");
});

test("карточка узла ставит замену управления выше описания", () => {
  const state = createInitialState();
  const card = inspectTalentNode(state, "resonance:04");
  assert.ok(card, "узел найден");
  assert.ok(card.transform, "замена объявлена");
  assert.equal(card.sections[0].title, "Меняет управление");
  assert.match(card.sections[0].lines[0].value, /Пространственный перенос/);
  assert.match(card.sections[0].lines[0].value, /→/);

  const plain = inspectTalentNode(state, "power:01");
  assert.equal(plain.transform, undefined);
  assert.notEqual(plain.sections[0].title, "Меняет управление", "лишнего заголовка нет");
});

test("ключевой узел показывает изменённое правило", () => {
  const card = inspectTalentNode(createInitialState(), "guard:16");
  assert.match(card.subtitle, /меняет правило/);
  const rule = card.sections.find((part) => part.title === "Меняет правила");
  assert.ok(rule, "секция правила есть");
  assert.ok(rule.lines.some((line) => line.label === "Отнимает"), "цена не спрятана");
});

test("слот управления знает, заменён он или базовый", () => {
  const base = createInitialState();
  const baseCard = inspectHeroSlot(base, "movement");
  assert.equal(baseCard.transform, undefined);
  assert.equal(baseCard.title, BASE_ACTIONS.movement.name);

  const shifted = give(base, ["resonance:04"]);
  const shiftedCard = inspectHeroSlot(shifted, "movement");
  assert.ok(shiftedCard.transform, "замена видна");
  assert.equal(shiftedCard.transform.from, "Ускорение");
  assert.equal(shiftedCard.transform.to, "Пространственный перенос");
  assert.equal(shiftedCard.subtitle, "изменена сборкой");
});

test("предмет объясняет, во что превратится связка рук", () => {
  const state = createInitialState();
  const shield = handChangeFor(state, "riotShield");
  assert.ok(shield, "щит меняет связку");
  assert.equal(shield.from, "Свободная рука");
  assert.ok(shield.note.length > 20, "объяснение, а не название");

  const card = inspectInventoryItem(state, "riotShield");
  assert.ok(card.transform, "изменение связки показано как замена");
  assert.equal(card.transform.binding, "Сочетание рук");

  // Главное свойство пары: один и тот же щит даёт разную связку в зависимости
  // от того, что в другой руке. Предмет описывается парой, а не сам по себе.
  const melee = withWeapon(state, "shockBaton");
  const ranged = withWeapon(state, "servicePistol");
  assert.equal(handChangeFor(melee, "riotShield").to, "Щитовая связка");
  assert.equal(handChangeFor(ranged, "riotShield").to, "Стрельба с прикрытием");

  // Расходник рук не касается и лишнего блока не получает.
  assert.equal(handChangeFor(state, "bandage"), null);
  assert.equal(inspectInventoryItem(state, "bandage").transform, undefined);
});

test("осмотр противника читает роль, ранг и наведённые состояния", () => {
  let state = createInitialState();
  const hero = state.hero.positions[state.zone];
  state = spawnEncounter(state, "pack:adjuster", { x: hero.x + 3, y: hero.y });
  const boss = state.enemies.find((enemy) => enemy.name === ENEMY_DEFINITIONS["line-adjuster"].name);
  assert.ok(boss, "минибосс появился");

  const card = inspectEnemyAt(state, boss);
  assert.match(card.subtitle, /минибосс/, "ранг виден без чтения чисел");
  assert.equal(card.bars.length, 2, "здоровье и стойка");
  assert.equal(card.bars[0].max, boss.maxHp);
  assert.match(text(card), /Автоматика/, "роль названа");

  const resonating = { ...boss, resonanceStacks: 3 };
  assert.match(text(inspectEnemyAt(state, resonating)), /Резонанс ×3/);

  // Опасное действие читается из определения, а не приписывается всем подряд.
  const runner = { ...boss, name: ENEMY_DEFINITIONS["shift-runner"].name, dangerous: false };
  assert.doesNotMatch(text(inspectEnemyAt(state, runner)), /телеграфированный тяжёлый: замах видно/);
});

test("быстрая ячейка различает пустоту и откат", () => {
  const state = createInitialState();
  assert.ok(quickSlotCharges(state, "q") > 0, "медицина в сумке есть");
  assert.equal(quickSlotEntry(state, "q").itemId, "bandage");

  const hurt = { ...state, hero: { ...state.hero, hp: 40 } };
  const used = applyQuickSlot(hurt, "q");
  assert.ok(used.hero.hp > hurt.hero.hp, "перевязка сработала");
  assert.ok(used.hero.quickSlotCooldownMs > 0, "откат запущен");

  const spammed = applyQuickSlot(used, "q");
  assert.match(spammed.log[0], /ещё не готово/, "повтор на откате объяснён");
  assert.equal(spammed.hero.hp, used.hero.hp, "второй раз ничего не потрачено");

  const empty = { ...state, hero: { ...state.hero, inventory: [] } };
  assert.match(applyQuickSlot(empty, "e").log[0], /пуста/, "пустая ячейка объяснена");
  assert.equal(quickSlotCharges(empty, "e"), 0);
});

test("откат ячейки истекает сам", () => {
  let state = { ...createInitialState(), hero: { ...createInitialState().hero, hp: 40 } };
  state = applyQuickSlot(state, "q");
  const cooldown = state.hero.quickSlotCooldownMs;
  assert.ok(cooldown > 0);
  // tickGame ограничивает шаг сотней миллисекунд: копим реальное время.
  for (let step = 0; step < 20; step += 1) state = tickGame(state, 100);
  assert.equal(state.hero.quickSlotCooldownMs, 0, "откат не залипает");
});

test("ячейки Q и E не претендуют на одни и те же расходники", () => {
  const q = new Set(QUICK_SLOTS.q.categories);
  const overlap = QUICK_SLOTS.e.categories.filter((category) => q.has(category));
  assert.deepEqual(overlap, [], "категории не пересекаются");
});

test("надеть и снять — обратимые действия", () => {
  // Обратной операции к equipItem не существовало: слот можно было занять, но
  // не освободить, и снятие в интерфейсе было нечем выполнить.
  const state = createInitialState();
  const head = state.hero.equipment.head;
  assert.ok(head, "шлем надет с начала");

  const bare = unequipItem(state, head);
  assert.equal(bare.hero.equipment.head, null, "слот освободился");
  assert.match(bare.log[0], /Снято/, "действие объяснено");

  const again = equipItem(bare, head);
  assert.equal(again.hero.equipment.head, head, "надевается обратно");

  // Оружие — исключение: без него у героя не остаётся основной атаки.
  const weapon = state.hero.equipment.weapon;
  const kept = unequipItem(state, weapon);
  assert.equal(kept.hero.equipment.weapon, weapon, "оружие остаётся в руке");
  assert.match(kept.log[0], /нельзя снять/, "отказ объяснён");

  // Предмет не из экипировки снятие не трогает.
  const bandage = state.hero.inventory.find((entry) => entry.itemId === "bandage");
  assert.equal(unequipItem(state, bandage.instanceId), state, "в сумке снимать нечего");
});
