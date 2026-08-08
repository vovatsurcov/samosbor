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
  | "industrial";

/**
 * Как семейство обращается со стойкой цели.
 * Это не число урона, а разное поведение: одно ломает стойку, другое её
 * почти не трогает, третье работает только по уже сломанной.
 */
export type StanceBehaviour = "breaker" | "chipper" | "opportunist";

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
};

/**
 * Способности семейства. Из них выводится поведение сочетания рук
 * (game-hands.ts), поэтому новое оружие достаточно отнести к семейству.
 */
export const FAMILY_CAPABILITIES: Record<WeaponFamilyId, HandCapability[]> = {
  heavy_melee: ["two_handed", "melee", "breach", "heavy", "consumes_state"],
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

/** Насколько семейство доплачивает за удар по уже вскрытой цели. */
export function familyExposureBonus(family: WeaponFamily): number {
  return family.stance === "opportunist" ? 0.45 : family.stance === "chipper" ? 0.1 : 0;
}
