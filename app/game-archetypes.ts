// Боевые архетипы v2. Серый прототип: реализованы power и marksman.
//
// Модуль описывает архетипы данными и чистыми функциями ресурса. Цепочки и
// фантазии ролей — в docs/COMBAT_ARCHETYPES_V2.md.

export type ArchetypeId =
  | "power"
  | "bulwark"
  | "skirmisher"
  | "marksman"
  | "heavy_gunner"
  | "resonance";

export type ArchetypeRange = "melee" | "ranged";

export type ArchetypeAbilityId =
  // power
  | "power:surge"
  | "power:ram"
  | "power:stance_break"
  | "power:heavy_blow"
  | "power:execute"
  // marksman
  | "marksman:scout"
  | "marksman:mark"
  | "marksman:aimed_shot"
  | "marksman:first_shot"
  | "marksman:break_away";

export type ArchetypeAbility = {
  id: ArchetypeAbilityId;
  name: string;
  /** Место в боевой цепочке архетипа: 1 — вход, дальше по порядку. */
  step: number;
  breathCost: number;
  resourceCost: number;
  cooldownMs: number;
  description: string;
};

export type ArchetypeDefinition = {
  id: ArchetypeId;
  name: string;
  range: ArchetypeRange;
  resourceId: string;
  resourceName: string;
  /** Ресурс копится действием, а не временем. */
  resourceGain: string;
  maxResource: number;
  chain: string[];
  abilities: ArchetypeAbility[];
  implemented: boolean;
};

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  power: {
    id: "power",
    name: "Силач",
    range: "melee",
    resourceId: "surge",
    resourceName: "Разгон",
    resourceGain: "движение к цели и попадания тяжёлыми ударами",
    maxResource: 3,
    chain: ["разгон", "таран", "слом стойки", "тяжёлый удар", "добивание"],
    implemented: true,
    abilities: [
      {
        id: "power:surge",
        name: "Разгон",
        step: 1,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Две секунды непрерывного движения к цели дают ступень разгона: +12% урона по стойке и +0.15 к скорости за ступень.",
      },
      {
        id: "power:ram",
        name: "Таран",
        step: 2,
        breathCost: 22,
        resourceCost: 1,
        cooldownMs: 6000,
        description: "Рывок сквозь строй: каждому задетому — тяжёлый урон по стойке, при полном разгоне цель сбивается с ног.",
      },
      {
        id: "power:stance_break",
        name: "Слом стойки",
        step: 3,
        breathCost: 35,
        resourceCost: 1,
        cooldownMs: 4500,
        description: "Заряжаемый удар: по пошатнувшейся цели гарантированно вызывает ошеломление.",
      },
      {
        id: "power:heavy_blow",
        name: "Тяжёлый удар",
        step: 4,
        breathCost: 25,
        resourceCost: 0,
        cooldownMs: 0,
        description: "По ошеломлённой цели задевает конус за её спиной: враг используется как таран.",
      },
      {
        id: "power:execute",
        name: "Добивание",
        step: 5,
        breathCost: 15,
        resourceCost: 0,
        cooldownMs: 1200,
        description: "Возвращает четверть стойки героя и половину разгона.",
      },
    ],
  },
  marksman: {
    id: "marksman",
    name: "Стрелок",
    range: "ranged",
    resourceId: "aim",
    resourceName: "Прицел",
    resourceGain: "неподвижность и попадания в одну цель",
    maxResource: 4,
    chain: ["разведка", "метка", "выбор цели", "точный выстрел", "разрыв дистанции"],
    implemented: true,
    abilities: [
      {
        id: "marksman:scout",
        name: "Разведка",
        step: 1,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 9000,
        description: "+2.5 к радиусу обзора и подсветка целей за укрытием на шесть секунд.",
      },
      {
        id: "marksman:mark",
        name: "Метка",
        step: 2,
        breathCost: 0,
        resourceCost: 1,
        cooldownMs: 3000,
        description: "Цель получает +20% входящего урона от всех источников и видна сквозь стены.",
      },
      {
        id: "marksman:aimed_shot",
        name: "Точный выстрел",
        step: 4,
        breathCost: 20,
        resourceCost: 3,
        cooldownMs: 5000,
        description: "Игнорирует укрытие и половину брони. Требует неподвижности.",
      },
      {
        id: "marksman:first_shot",
        name: "Первый выстрел",
        step: 3,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Выстрел по цели, не знающей о герое, всегда критический.",
      },
      {
        id: "marksman:break_away",
        name: "Разрыв дистанции",
        step: 5,
        breathCost: 22,
        resourceCost: 1,
        cooldownMs: 7000,
        description: "Прыжок назад с выстрелом; ближайший преследователь замедляется.",
      },
    ],
  },
  bulwark: {
    id: "bulwark",
    name: "Танк",
    range: "melee",
    resourceId: "footing",
    resourceName: "Опора",
    resourceGain: "удержание блока и идеальные блоки",
    maxResource: 3,
    chain: ["защищённое сближение", "блок", "идеальный блок", "контратака", "удержание прохода"],
    implemented: false,
    abilities: [],
  },
  skirmisher: {
    id: "skirmisher",
    name: "Ловкач",
    range: "melee",
    resourceId: "tempo",
    resourceName: "Темп",
    resourceGain: "смена позиции, уклонения и удары в спину",
    maxResource: 3,
    chain: ["рывок", "контакт", "серия", "перепозиционирование", "заход за спину", "добивание"],
    implemented: false,
    abilities: [],
  },
  heavy_gunner: {
    id: "heavy_gunner",
    name: "Тяжёлый стрелок",
    range: "ranged",
    resourceId: "heat",
    resourceName: "Температура",
    resourceGain: "накапливается сама во время стрельбы",
    maxResource: 100,
    chain: ["занять позицию", "развернуть оружие", "раскрутка", "подавление", "перегрев", "сброс температуры"],
    implemented: false,
    abilities: [],
  },
  resonance: {
    id: "resonance",
    name: "Резонанс",
    range: "ranged",
    resourceId: "resonance",
    resourceName: "Резонанс",
    resourceGain: "попадания резонансным уроном и аномалии",
    maxResource: 4,
    chain: ["метка резонанса", "искажение зоны", "цепь", "разрыв синхронизации", "цена"],
    implemented: false,
    abilities: [],
  },
};

export const IMPLEMENTED_ARCHETYPES: ArchetypeId[] = (
  Object.keys(ARCHETYPES) as ArchetypeId[]
).filter((id) => ARCHETYPES[id].implemented);

export function archetypeAbility(id: ArchetypeAbilityId): ArchetypeAbility | null {
  for (const archetype of Object.values(ARCHETYPES)) {
    const ability = archetype.abilities.find((entry) => entry.id === id);
    if (ability) return ability;
  }
  return null;
}

/** Разгон силача: ступень за каждые две секунды движения к цели, потолок — три. */
export const SURGE_STEP_MS = 2000;
export const SURGE_STANCE_BONUS = 0.12;
export const SURGE_SPEED_BONUS = 0.15;

export function surgeStepsFor(movingTowardMs: number): number {
  return Math.min(3, Math.floor(movingTowardMs / SURGE_STEP_MS));
}

export function surgeStanceMultiplier(steps: number): number {
  return 1 + SURGE_STANCE_BONUS * Math.min(3, Math.max(0, steps));
}

export function surgeSpeedBonus(steps: number): number {
  return SURGE_SPEED_BONUS * Math.min(3, Math.max(0, steps));
}

/** Прицел стрелка: ступень за каждые 0.8 с неподвижности, потолок — четыре. */
export const AIM_STEP_MS = 800;
export const AIM_DAMAGE_BONUS = 0.09;

export function aimStepsFor(stillMs: number): number {
  return Math.min(4, Math.floor(stillMs / AIM_STEP_MS));
}

export function aimDamageBonus(steps: number): number {
  return AIM_DAMAGE_BONUS * Math.min(4, Math.max(0, steps));
}

/** Метка: +20% входящего урона из любого источника. */
export const MARK_DAMAGE_BONUS = 0.2;
export const MARK_DURATION_MS = 8000;
export const SCOUT_VISION_BONUS = 2.5;
export const SCOUT_DURATION_MS = 6000;
export const AIMED_SHOT_ARMOR_SHARE = 0.5;
