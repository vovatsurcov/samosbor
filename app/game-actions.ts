// Слоты действий: базовый боевой язык персонажа и его трансформации.
//
// Ключевой принцип Gate 4.5: талант может не просто добавить бонус или новую
// способность — он **заменяет поведение существующего слота управления**.
// Развивая сборку, игрок чувствует, что персонаж стал управляться иначе.
//
//   ЛКМ     обычная атака
//   ПКМ     сильная атака
//   Shift   действие перемещения
//   1 2 3   активные способности
//   Q / E   быстрые расходники
//
// Слот — это намерение игрока. Что именно произойдёт, выводится из оружия,
// сочетания рук, талантов и предметов. Классов нет: доступ к трансформации даёт
// вложение в направление, а не выбор класса, и гибрид может собрать
// трансформации разных направлений.

import type { SkillBranch } from "./game-skills.ts";

export type ActionSlot = "primary" | "strong" | "movement";

export const SLOT_LABELS: Record<ActionSlot, string> = {
  primary: "ЛКМ · обычная атака",
  strong: "ПКМ · сильная атака",
  movement: "Shift · перемещение",
};

export type ActionDefinition = {
  id: string;
  slot: ActionSlot;
  name: string;
  /** Что действие делает — человеческим языком, без формул. */
  description: string;
  /** Удерживаемое действие (разгон дыханием) или разовое. */
  sustained: boolean;
  /** Расход дыхания в секунду при удержании. */
  breathPerSecond?: number;
  /** Разовый расход дыхания. */
  breathCost?: number;
  cooldownMs?: number;
  /**
   * Условие доступности: сколько очков вложено в направление. Это не класс —
   * до узла можно дотянуться любой сборкой, набрав глубину.
   */
  requires?: { branch: SkillBranch; points: number };
  /** Талант, который включает эту версию слота. */
  talentId?: string;
  /** Какое действие она собой заменяет. */
  replaces?: string;
};

/** Базовые действия. Есть у любого персонажа с самого начала. */
export const BASE_ACTIONS: Record<ActionSlot, ActionDefinition> = {
  primary: {
    id: "base:primary",
    slot: "primary",
    name: "Обычная атака",
    description:
      "Атака текущего снаряжения: что именно произойдёт, решают оружие и руки. Низкая цена, можно удерживать.",
    sustained: false,
  },
  strong: {
    id: "base:strong",
    slot: "strong",
    name: "Сильная атака",
    description:
      "Тяжёлое действие текущего оружия: дороже и медленнее обычной атаки, сильнее работает по стойке и расходует наведённое.",
    sustained: false,
    breathCost: 18,
  },
  movement: {
    id: "base:sprint",
    slot: "movement",
    name: "Ускорение",
    description:
      "Пока клавиша удержана, персонаж двигается быстрее за счёт дыхания. Направление по-прежнему задаётся WASD.",
    sustained: true,
    breathPerSecond: 16,
  },
};

/**
 * Трансформации слотов. Каждая объявляется данными: боевое ядро не содержит
 * условий вида «если направление резонанс и вложено пять очков».
 *
 * Резонанс здесь — опорный образец: он показывает, как выглядит трансформация
 * всех трёх базовых слотов одним направлением. Остальные направления получают
 * свои по тому же контракту.
 */
export const ACTION_TRANSFORMATIONS: ActionDefinition[] = [
  {
    id: "resonance:shift",
    slot: "movement",
    name: "Пространственный перенос",
    description:
      "Вместо ускорения — мгновенный перенос в сторону курсора сквозь пространство. Дыхание на бег больше не тратится: платой становится заражение.",
    sustained: false,
    cooldownMs: 3200,
    requires: { branch: "resonance", points: 5 },
    talentId: "resonance:04",
    replaces: "base:sprint",
  },
  {
    id: "resonance:primary",
    slot: "primary",
    name: "Резонирующий удар",
    description:
      "Обычная атака начинает наводить резонанс сама. Подготовка перестаёт требовать отдельного действия, но прямой урон ниже.",
    sustained: false,
    requires: { branch: "resonance", points: 10 },
    talentId: "resonance:09",
    replaces: "base:primary",
  },
  {
    id: "power:strong",
    slot: "strong",
    name: "Проламывающий удар",
    description:
      "Сильная атака вкладывает накопленный разгон в один удар: больше урона по стойке, но разгон тратится целиком.",
    sustained: false,
    breathCost: 22,
    requires: { branch: "power", points: 10 },
    talentId: "power:09",
    replaces: "base:strong",
  },
  {
    id: "agility:shift",
    slot: "movement",
    name: "Смена стороны",
    description:
      "Ускорение заменяется коротким рывком с кадрами неуязвимости. Дешевле переноса, но и дистанция меньше.",
    sustained: false,
    cooldownMs: 2100,
    breathCost: 12,
    requires: { branch: "agility", points: 5 },
    talentId: "agility:04",
    replaces: "base:sprint",
  },
];

/**
 * Какая версия слота активна при данном наборе талантов.
 *
 * Последняя подходящая трансформация побеждает, поэтому гибрид, взявший
 * несколько замен одного слота, получает предсказуемый результат.
 */
export function resolveSlot(slot: ActionSlot, talents: string[]): ActionDefinition {
  const transformed = ACTION_TRANSFORMATIONS.filter(
    (action) => action.slot === slot && action.talentId && talents.includes(action.talentId),
  );
  return transformed.length ? transformed[transformed.length - 1] : BASE_ACTIONS[slot];
}

/** Заменено ли действие слота относительно базового. */
export function isTransformed(slot: ActionSlot, talents: string[]): boolean {
  return resolveSlot(slot, talents).id !== BASE_ACTIONS[slot].id;
}

/** Все трансформации слота — для подсказки в дереве талантов. */
export function transformationsFor(slot: ActionSlot): ActionDefinition[] {
  return ACTION_TRANSFORMATIONS.filter((action) => action.slot === slot);
}
