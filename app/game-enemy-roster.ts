// Реестр противников и составы групп. Data-driven.
//
// Правило Gate 4: новый противник должен появляться как описание, а не как
// отдельный класс логики в боевом ядре. Поведение собирается из роли, чисел,
// защитного профиля и отношения к состояниям.
//
// Основная единица боя — не отдельный противник, а **состав группы**. Именно
// состав меняет, кого убивать первым и где стоять.

import type { EnemyKind, EnemyRank } from "./game-engine-base.ts";

/**
 * Роль — это игровая функция, а не название существа. Разные роли требуют
 * разных решений, но ни одна не запрещает никакую сборку: сильные и слабые
 * стороны мягкие, жёстких контров нет.
 */
export type EnemyRole =
  | "swarm"
  | "ranged"
  | "heavy"
  | "controller"
  | "industrial"
  | "anomalous";

export const ROLE_LABELS: Record<EnemyRole, string> = {
  swarm: "Напор",
  ranged: "Дистанция",
  heavy: "Тяжёлый",
  controller: "Помеха",
  industrial: "Автоматика",
  anomalous: "Аномальное",
};

/** Что игрок должен понять о роли ещё до того, как прочитает название. */
export const ROLE_READING: Record<EnemyRole, string> = {
  swarm: "быстрые и слабые, не дают стоять на месте",
  ranged: "держат линию и наказывают открытую позицию",
  heavy: "медленные и бронированные: их разбирают стойкой и пробитием",
  controller: "сами почти не бьют, но делают опасными остальных",
  industrial: "заводская машина: броня, ритм, электрический потенциал",
  anomalous: "работает правилами аномалии, а не силой",
};

export type EnemyDefinition = {
  id: string;
  name: string;
  role: EnemyRole;
  /** Силуэт: чем это было и откуда взялось. */
  kind: EnemyKind;
  /** Чем было, почему здесь и как это объясняет поведение. */
  origin: string;
  hp: number;
  damage: number;
  armor: number;
  stance: number;
  speed: number;
  attackRange: number;
  visionRadius: number;
  aggroRadius: number;
  attackCooldownBaseMs: number;
  xpValue: number;
  /**
   * Каждый третий удар — телеграфированный тяжёлый. У части ролей опасное
   * действие своё, у части его нет вовсе: обычный обмен ударами должен
   * оставаться быстрым.
   */
  dangerousAction: boolean;
  /** Отношение к состояниям: где сборка окупается, а где буксует. */
  stateAffinity: string;
  rank: EnemyRank;
};

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  "shift-runner": {
    id: "shift-runner",
    name: "Отсменившийся",
    role: "swarm",
    kind: "stalker",
    origin:
      "Жилец, у которого смена так и не кончилась. Продолжает бежать по маршруту и сносит всё, что стоит на нём.",
    hp: 34, damage: 8, armor: 1, stance: 18,
    speed: 1.8, attackRange: 1.2, visionRadius: 3.6, aggroRadius: 2.6,
    attackCooldownBaseMs: 820, xpValue: 6,
    dangerousAction: false,
    stateAffinity: "умирает раньше подготовки: состояния на нём не окупаются",
    rank: "common",
  },
  "access-controller": {
    id: "access-controller",
    name: "Контролёр допуска",
    role: "ranged",
    kind: "sentry",
    origin:
      "Пост проверки пропусков, оставшийся без смены. Держит линию и не подпускает к проходу.",
    hp: 52, damage: 12, armor: 5, stance: 26,
    speed: 0.95, attackRange: 4.6, visionRadius: 5.4, aggroRadius: 3.4,
    attackCooldownBaseMs: 1500, xpValue: 14,
    dangerousAction: true,
    stateAffinity: "хорошо принимает метку и вскрытие",
    rank: "common",
  },
  "loading-frame": {
    id: "loading-frame",
    name: "Погрузочная рама ПР-8",
    role: "heavy",
    kind: "collector",
    origin:
      "Грузовая рама, продолжающая разгружать несуществующий состав. Медленная, тяжёлая, не уступает дорогу.",
    hp: 150, damage: 22, armor: 20, stance: 90,
    speed: 0.72, attackRange: 1.7, visionRadius: 4.2, aggroRadius: 2.6,
    attackCooldownBaseMs: 1900, xpValue: 34,
    dangerousAction: true,
    stateAffinity: "живёт долго: на нём окупаются стойка, пробитие и подготовленный всплеск",
    rank: "enhanced",
  },
  "circuit-dispatcher": {
    id: "circuit-dispatcher",
    name: "Диспетчер аварийного контура",
    role: "controller",
    kind: "sentry",
    origin:
      "Аварийная служба, которая всё ещё объявляет тревогу. Сама почти не бьёт, но поднимает по тревоге остальных.",
    hp: 46, damage: 6, armor: 4, stance: 24,
    speed: 1.1, attackRange: 5.2, visionRadius: 6.4, aggroRadius: 4.2,
    attackCooldownBaseMs: 2100, xpValue: 20,
    dangerousAction: true,
    stateAffinity: "убирают первым: пока он жив, остальные опаснее",
    rank: "common",
  },
  "repair-automaton": {
    id: "repair-automaton",
    name: "Ремонтный автомат РМ-9",
    role: "industrial",
    kind: "sentry",
    origin:
      "Ремонтная машина, применяющая штатный инструмент не по назначению. Работает ровно и не отвлекается.",
    hp: 84, damage: 15, armor: 14, stance: 52,
    speed: 0.92, attackRange: 1.5, visionRadius: 4.4, aggroRadius: 2.8,
    attackCooldownBaseMs: 1350, xpValue: 22,
    dangerousAction: false,
    stateAffinity: "держит электрический потенциал: перегрузка на нём расходится дальше",
    rank: "common",
  },
  "resonant-growth": {
    id: "resonant-growth",
    name: "Резонансный нарост",
    role: "anomalous",
    kind: "stalker",
    origin:
      "Участок конструкции, который начал звучать и обрёл собственный порядок. Ведёт себя по правилам аномалии, а не по силе.",
    hp: 62, damage: 11, armor: 2, stance: 30,
    speed: 1.25, attackRange: 3.4, visionRadius: 5, aggroRadius: 3.2,
    attackCooldownBaseMs: 1600, xpValue: 26,
    dangerousAction: true,
    stateAffinity: "сам наводит резонанс и кормит им чужие сборки",
    rank: "common",
  },
  "senior-shift": {
    id: "senior-shift",
    name: "Старший смены",
    role: "heavy",
    kind: "collector",
    origin:
      "Тот, кто отвечал за смену и продолжает отвечать. Собирает вокруг себя остальных и не отступает.",
    hp: 210, damage: 20, armor: 24, stance: 110,
    speed: 0.85, attackRange: 1.9, visionRadius: 5.2, aggroRadius: 3.4,
    attackCooldownBaseMs: 1700, xpValue: 90,
    dangerousAction: true,
    stateAffinity: "элита: полный цикл подготовки и расплаты успевает пройти дважды",
    rank: "enhanced",
  },
  "line-adjuster": {
    id: "line-adjuster",
    name: "Наладчик линии НЛ-1",
    role: "industrial",
    kind: "collector",
    origin:
      "Наладчик, поставленный запустить линию любой ценой. Линии давно нет, распоряжение осталось.",
    // Числа здесь — база до масштабирования по этажу и рангу. Ранг «босс»
    // умножает здоровье в 6.5 раза, поэтому база низкая: минибосс должен дать
    // сборке раскрыться несколько раз, а не превратиться в мешок с ОЗ.
    hp: 210, damage: 17, armor: 26, stance: 74,
    speed: 0.8, attackRange: 2.2, visionRadius: 6, aggroRadius: 4,
    attackCooldownBaseMs: 1600, xpValue: 260,
    dangerousAction: true,
    stateAffinity: "минибосс: держит стойку, состояния и защитные размены целиком",
    rank: "boss",
  },
};

export function definitionById(id: string): EnemyDefinition | null {
  return ENEMY_DEFINITIONS[id] ?? null;
}

// --- Составы групп ----------------------------------------------------------

export type EncounterMember = {
  defId: string;
  count: number;
  /** Смещение от точки высадки группы. */
  offset: { x: number; y: number };
};

export type EncounterDefinition = {
  id: string;
  name: string;
  /** Что именно проверяет состав: какое решение он ставит перед игроком. */
  question: string;
  members: EncounterMember[];
};

export const ENCOUNTERS: EncounterDefinition[] = [
  {
    id: "pack:pressure-line",
    name: "Напор и линия",
    question: "Разобраться с напором или сначала снять того, кто держит линию?",
    members: [
      { defId: "shift-runner", count: 4, offset: { x: 0, y: 0 } },
      { defId: "access-controller", count: 1, offset: { x: 4, y: -1 } },
    ],
  },
  {
    id: "pack:anvil",
    name: "Наковальня",
    question: "Тяжёлого не обойти, а быстрые не дают спокойно его разбирать.",
    members: [
      { defId: "loading-frame", count: 1, offset: { x: 0, y: 0 } },
      { defId: "shift-runner", count: 3, offset: { x: -2, y: 1 } },
    ],
  },
  {
    id: "pack:alarm",
    name: "Тревога контура",
    question: "Пока диспетчер жив, автоматика работает злее.",
    members: [
      { defId: "circuit-dispatcher", count: 1, offset: { x: 3, y: -2 } },
      { defId: "repair-automaton", count: 2, offset: { x: 0, y: 0 } },
    ],
  },
  {
    id: "pack:standing-wave",
    name: "Стоячая волна",
    question: "Аномалия кормит резонансом и вас, и себя.",
    members: [
      { defId: "resonant-growth", count: 2, offset: { x: 0, y: 0 } },
      { defId: "repair-automaton", count: 1, offset: { x: -3, y: 1 } },
    ],
  },
  {
    id: "pack:senior",
    name: "Старший на смене",
    question: "Элита посреди обычной группы: кого убирать первым.",
    members: [
      { defId: "senior-shift", count: 1, offset: { x: 0, y: 0 } },
      { defId: "shift-runner", count: 3, offset: { x: -2, y: -1 } },
      { defId: "access-controller", count: 1, offset: { x: 4, y: 1 } },
    ],
  },
  {
    id: "pack:mixed-shift",
    name: "Сводная смена",
    // Состав для человеческой проверки приоритета цели. Подсказки игроку здесь
    // намеренно нет: он должен прочитать приоритет из поведения группы, а не
    // из текста.
    question: "Тяжёлый держит проход, напор не даёт стоять, и кто-то заставляет их всех работать быстрее.",
    members: [
      { defId: "circuit-dispatcher", count: 1, offset: { x: 5, y: -3 } },
      { defId: "loading-frame", count: 1, offset: { x: 1, y: 0 } },
      { defId: "shift-runner", count: 3, offset: { x: -1, y: 2 } },
    ],
  },
  {
    id: "pack:adjuster",
    name: "Наладчик линии",
    question: "Минибосс: сборке хватает времени раскрыться несколько раз.",
    members: [{ defId: "line-adjuster", count: 1, offset: { x: 0, y: 0 } }],
  },
];

export function encounterById(id: string): EncounterDefinition | null {
  return ENCOUNTERS.find((encounter) => encounter.id === id) ?? null;
}
