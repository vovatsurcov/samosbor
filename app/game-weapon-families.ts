// Семейства оружия: физический язык боя.
//
// Правило Stage 3 (docs/COMBAT_DEPTH_ROADMAP.md, этап 3): оружие **не привязано
// к направлению**. Схема «тяжёлое — Разгону, стрелковое — Прицелу» была бы теми
// же классами, спрятанными в инвентарь.
//
//   ОРУЖИЕ      задаёт, КАК персонаж физически действует
//   НАПРАВЛЕНИЕ задаёт, ЗАЧЕМ он действует именно так
//   БИЛД        возникает на их пересечении
//
// Модуль чистый: он описывает семейства данными и не знает про состояние мира.

import type { HandCapability } from "./game-hands.ts";
import type { WeaponId } from "./game-items.ts";

export type WeaponFamilyId =
  | "heavy_melee"
  | "light_melee"
  | "sidearm"
  | "rifle"
  | "industrial"
  | "shotgun"
  | "automatic"
  | "anomalous";

/**
 * Как семейство обращается со стойкой цели.
 * Это не число урона, а разное поведение: одно ломает стойку, другое её
 * почти не трогает, третье работает только по уже сломанной.
 */
export type StanceBehaviour = "breaker" | "chipper" | "opportunist";

/**
 * Как семейство обращается с дистанцией. Это не «дальность больше или
 * меньше», а разный характер: одно теряет всё за парой клеток, другое
 * работает ровно, третьему дистанция безразлична.
 */
export type FalloffBehaviour = "none" | "steep" | "sustained";

export type WeaponFamily = {
  id: WeaponFamilyId;
  name: string;
  /** Дистанция, на которой семейство хочет находиться. */
  preferredRange: string;
  /**
   * Обязательство: доля времени восстановления, в течение которой отменить
   * действие уже нельзя. Высокое обязательство — цена за силу удара.
   */
  commitment: number;
  /** Множитель времени между действиями. Задаёт ритм, а не только DPS. */
  tempo: number;
  /** Сколько целей задевает штатное действие. */
  sweep: number;
  stance: StanceBehaviour;
  /** Штраф к скорости героя, пока оружие в руках: тяжесть чувствуется ногами. */
  mobilityPenalty: number;
  /** Что семейство хорошо накладывает и что хорошо расходует. */
  applies: string;
  consumes: string;
  weakness: string;
  verb: string;
  falloff: FalloffBehaviour;
  /** Растёт ли разброс при непрерывной стрельбе. */
  sustainPenalty: number;
  /** Наносит ли семейство прямой урон вообще. */
  directDamage: boolean;
  /** Выстрелов до перезарядки. 0 — боезапас не считается. */
  magazine: number;
  /** Сколько занимает перезарядка. */
  reloadMs: number;
};

export const WEAPON_FAMILIES: Record<WeaponFamilyId, WeaponFamily> = {
  heavy_melee: {
    id: "heavy_melee",
    name: "Тяжёлое ближнее",
    preferredRange: "вплотную",
    commitment: 0.75,
    tempo: 1.45,
    sweep: 2,
    stance: "breaker",
    mobilityPenalty: 0.18,
    applies: "вскрытие через слом стойки",
    consumes: "накопленный резонанс",
    weakness: "промах стоит дорого: отменить замах нельзя",
    verb: "вкладывается в один удар и ломает защиту",
    falloff: "none",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 0,
    reloadMs: 0,
  },
  light_melee: {
    id: "light_melee",
    name: "Лёгкое ближнее",
    preferredRange: "вплотную",
    commitment: 0.2,
    tempo: 0.7,
    sweep: 1,
    stance: "chipper",
    mobilityPenalty: 0,
    applies: "состояния — быстро и часто",
    consumes: "почти ничего: расходовать нечем",
    weakness: "не ломает стойку и вязнет в броне",
    verb: "бьёт часто и уходит с линии",
    falloff: "none",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 0,
    reloadMs: 0,
  },
  sidearm: {
    id: "sidearm",
    name: "Личное оружие",
    preferredRange: "средняя",
    commitment: 0.25,
    tempo: 0.95,
    sweep: 1,
    stance: "chipper",
    mobilityPenalty: 0,
    applies: "ровное давление на дистанции",
    consumes: "вскрытие — стреляет в открытое",
    weakness: "ничего не решает в одиночку",
    verb: "держит дистанцию и работает по одной цели",
    falloff: "sustained",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 8,
    reloadMs: 1100,
  },
  rifle: {
    id: "rifle",
    name: "Винтовка",
    preferredRange: "дальняя",
    commitment: 0.45,
    tempo: 1.2,
    sweep: 1,
    stance: "opportunist",
    mobilityPenalty: 0.08,
    applies: "точные окна по подготовленной цели",
    consumes: "вскрытие и метки",
    weakness: "в упор неудобна, требует места и времени",
    verb: "выцеливает и наказывает подготовленное",
    falloff: "sustained",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 5,
    reloadMs: 1700,
  },
  industrial: {
    id: "industrial",
    name: "Промышленный инструмент",
    preferredRange: "вплотную",
    commitment: 0.6,
    tempo: 1.25,
    sweep: 3,
    stance: "breaker",
    mobilityPenalty: 0.12,
    applies: "перегрузку оборудования и площадь",
    consumes: "перегрузку — пробивает её дальше",
    weakness: "шумный, неточный, не про одиночную цель",
    verb: "работает по площади и по технике",
    falloff: "none",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 0,
    reloadMs: 0,
  },
  shotgun: {
    id: "shotgun",
    name: "Дробовик",
    preferredRange: "в упор",
    commitment: 0.65,
    tempo: 1.5,
    sweep: 3,
    stance: "breaker",
    mobilityPenalty: 0.06,
    applies: "вскрытие и отбрасывание в упор",
    consumes: "ничего: работает по неподготовленным",
    weakness: "за три клетки почти бесполезен",
    verb: "выбивает пространство перед собой и сносит строй с ног",
    falloff: "steep",
    sustainPenalty: 0,
    directDamage: true,
    magazine: 4,
    reloadMs: 1900,
  },
  automatic: {
    id: "automatic",
    name: "Автоматическое",
    preferredRange: "средняя",
    commitment: 0.5,
    tempo: 0.45,
    sweep: 1,
    stance: "chipper",
    mobilityPenalty: 0.14,
    applies: "непрерывное давление на одну точку",
    consumes: "ничего: берёт объёмом, а не подготовкой",
    weakness: "разброс растёт с длиной очереди, и остановиться дорого",
    verb: "льёт очередь, теряя точность тем сильнее, чем дольше держит палец",
    falloff: "sustained",
    sustainPenalty: 0.12,
    directDamage: true,
    magazine: 20,
    reloadMs: 2400,
  },
  anomalous: {
    id: "anomalous",
    name: "Аномальное устройство",
    preferredRange: "любая",
    commitment: 0.3,
    tempo: 1.1,
    sweep: 1,
    stance: "chipper",
    mobilityPenalty: 0.04,
    applies: "состояния без единой царапины",
    consumes: "преобразует уже наведённое",
    weakness: "само по себе не убивает: без второй руки бой не заканчивается",
    verb: "не бьёт, а наводит и перестраивает состояния",
    falloff: "none",
    sustainPenalty: 0,
    directDamage: false,
    magazine: 0,
    reloadMs: 0,
  },
};

/**
 * Какое семейство у конкретного оружия. Привязка живёт здесь, а не в
 * определении предмета: семейство — это про поведение, а предметов в одном
 * семействе может быть много.
 */
export const WEAPON_FAMILY_OF: Record<WeaponId, WeaponFamilyId> = {
  shockBaton: "light_melee",
  breachAxe: "heavy_melee",
  servicePistol: "sidearm",
  coilRifle: "rifle",
  horizonCarbine: "rifle",
  sectorMaul: "industrial",
  breachGun: "shotgun",
  suppressor: "automatic",
};

/**
 * Способности семейства. Из них выводится поведение сочетания рук
 * (game-hands.ts), поэтому новое оружие достаточно отнести к семейству.
 */
export const FAMILY_CAPABILITIES: Record<WeaponFamilyId, HandCapability[]> = {
  heavy_melee: ["two_handed", "melee", "breach", "heavy", "consumes_state"],
  shotgun: ["two_handed", "ranged", "sweep", "breach"],
  automatic: ["two_handed", "ranged", "heavy"],
  anomalous: ["one_handed", "anomalous", "applies_state", "consumes_state"],
  light_melee: ["one_handed", "melee", "light", "applies_state"],
  sidearm: ["one_handed", "ranged", "precise", "applies_state"],
  rifle: ["two_handed", "ranged", "precise", "consumes_state"],
  industrial: ["two_handed", "melee", "sweep", "breach", "industrial", "consumes_state"],
};

export function familyOf(weaponId: WeaponId): WeaponFamily {
  return WEAPON_FAMILIES[WEAPON_FAMILY_OF[weaponId] ?? "sidearm"];
}

/** Ритм: время между действиями задаётся семейством, а не только предметом. */
export function familyCooldown(baseCooldownMs: number, family: WeaponFamily): number {
  return Math.round(baseCooldownMs * family.tempo);
}

/**
 * Урон по стойке зависит от того, как семейство с ней обращается.
 *
 * Это и есть «разное поведение вместо разных чисел»: ломающее оружие делает
 * слом стойки своей работой, лёгкое почти её не трогает, а выжидающее бьёт по
 * стойке слабо, но добирает на уже вскрытой цели.
 */
export function familyStanceDamage(base: number, family: WeaponFamily): number {
  if (family.stance === "breaker") return Math.round(base * 1.8);
  if (family.stance === "chipper") return Math.round(base * 0.5);
  return Math.round(base * 0.8);
}

/**
 * Спад урона по дистанции. Дробовик теряет почти всё за парой клеток — это и
 * делает его не «короткой винтовкой», а оружием, ради которого лезут вплотную.
 */
export function falloffMultiplier(family: WeaponFamily, distance: number, range: number): number {
  if (family.falloff !== "steep" || range <= 0) return 1;
  const share = Math.min(1, Math.max(0, distance / range));
  return Math.max(0.3, 1 - share * share * 0.85);
}

/**
 * Разброс от длины очереди. Автомат тем хуже попадает, чем дольше не отпускал
 * палец: его слабость встроена в способ стрельбы, а не в цифру точности.
 */
export function sustainedSpread(family: WeaponFamily, consecutiveShots: number): number {
  if (family.sustainPenalty <= 0) return 0;
  return Math.min(0.5, family.sustainPenalty * Math.max(0, consecutiveShots - 1));
}

/**
 * Перезарядка как часть ритма, а не как симулятор.
 *
 * Пара рук меняет её главное свойство — не длительность, а то, остаётся ли
 * персонаж в бою: пока одна рука перезаряжается, вторая может работать.
 */
export function reloadDurationMs(family: WeaponFamily, handsBusy: boolean): number {
  if (family.magazine <= 0) return 0;
  // Занятые обе руки перезаряжаются собраннее, но всё это время герой ничего
  // не делает; свободная вторая рука перезаряжает медленнее, зато не выпадает
  // из боя.
  return Math.round(family.reloadMs * (handsBusy ? 1 : 1.2));
}

/** Насколько семейство доплачивает за удар по уже вскрытой цели. */
export function familyExposureBonus(family: WeaponFamily): number {
  return family.stance === "opportunist" ? 0.45 : family.stance === "chipper" ? 0.1 : 0;
}
