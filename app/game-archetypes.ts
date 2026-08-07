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
  | "marksman:break_away"
  // bulwark
  | "bulwark:advance"
  | "bulwark:perfect_block"
  | "bulwark:riposte"
  | "bulwark:shield_push"
  | "bulwark:hold_passage"
  // skirmisher
  | "skirmisher:dash"
  | "skirmisher:flurry"
  | "skirmisher:reposition"
  | "skirmisher:backstab"
  | "skirmisher:execute"
  // heavy_gunner
  | "heavy_gunner:set_up"
  | "heavy_gunner:deploy"
  | "heavy_gunner:spin_up"
  | "heavy_gunner:suppress"
  | "heavy_gunner:vent"
  // resonance
  | "resonance:mark"
  | "resonance:distortion"
  | "resonance:chain"
  | "resonance:desync"
  | "resonance:reverse_shadow";

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
    implemented: true,
    abilities: [
      {
        id: "bulwark:advance",
        name: "Защищённое сближение",
        step: 1,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 8000,
        description: "Три секунды движения с поднятым блоком без штрафа скорости; дыхание уходит вдвое медленнее.",
      },
      {
        id: "bulwark:perfect_block",
        name: "Идеальный блок",
        step: 2,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Окно 180 мс: урон погашен, атакующему полторы его стойки, открыта контратака на 900 мс.",
      },
      {
        id: "bulwark:riposte",
        name: "Контратака",
        step: 3,
        breathCost: 0,
        resourceCost: 1,
        cooldownMs: 0,
        description: "Внутри окна следующая атака считается тяжёлой и не стоит дыхания.",
      },
      {
        id: "bulwark:shield_push",
        name: "Толчок щитом",
        step: 4,
        breathCost: 18,
        resourceCost: 1,
        cooldownMs: 5000,
        description: "Отбрасывает на две клетки, прерывает подготовку атаки и добавляет опору.",
      },
      {
        id: "bulwark:hold_passage",
        name: "Удержание прохода",
        step: 5,
        breathCost: 0,
        resourceCost: 2,
        cooldownMs: 12000,
        description: "В узком месте блок держит круговую дугу и не ломается при нулевом дыхании.",
      },
    ],
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
    implemented: true,
    abilities: [
      {
        id: "skirmisher:dash",
        name: "Рывок",
        step: 1,
        breathCost: 22,
        resourceCost: 0,
        cooldownMs: 0,
        description: "2.2 клетки с кадрами неуязвимости; с талантом проходит сквозь противника.",
      },
      {
        id: "skirmisher:flurry",
        name: "Серия",
        step: 2,
        breathCost: 18,
        resourceCost: 1,
        cooldownMs: 3500,
        description: "Три быстрых удара, каждый следующий сильнее на 15%; любой полученный урон обрывает серию.",
      },
      {
        id: "skirmisher:reposition",
        name: "Перепозиционирование",
        step: 3,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Смена стороны цели даёт темп; на трёх ступенях удар считается ударом в спину под любым углом.",
      },
      {
        id: "skirmisher:backstab",
        name: "Заход за спину",
        step: 4,
        breathCost: 22,
        resourceCost: 2,
        cooldownMs: 6000,
        description: "Короткий рывок в тыл цели: удар проходит как по не видящему героя противнику.",
      },
      {
        id: "skirmisher:execute",
        name: "Добивание",
        step: 5,
        breathCost: 10,
        resourceCost: 1,
        cooldownMs: 1500,
        description: "По цели ниже 20% ОЗ — мгновенное и дешёвое, возвращает темп.",
      },
    ],
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
    implemented: true,
    abilities: [
      {
        id: "heavy_gunner:set_up",
        name: "Занять позицию",
        step: 1,
        breathCost: 12,
        resourceCost: 0,
        cooldownMs: 2000,
        description: "Секунда установки: +30% урона, −70% скорости, стойка не ломается обычными атаками.",
      },
      {
        id: "heavy_gunner:deploy",
        name: "Развернуть оружие",
        step: 2,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Вне позиции урон снижен на 40%: тяжёлый ствол требует упора.",
      },
      {
        id: "heavy_gunner:spin_up",
        name: "Раскрутка",
        step: 3,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Четыре секунды непрерывного огня ускоряют темп вдвое и быстрее греют ствол.",
      },
      {
        id: "heavy_gunner:suppress",
        name: "Подавление",
        step: 4,
        breathCost: 20,
        resourceCost: 0,
        cooldownMs: 6000,
        description: "Конус: цели теряют дыхание и точность и прекращают сближение. Урона не наносит.",
      },
      {
        id: "heavy_gunner:vent",
        name: "Сброс температуры",
        step: 6,
        breathCost: 0,
        resourceCost: 60,
        cooldownMs: 3000,
        description: "Снимает 60 температуры ценой полутора секунд уязвимости и сброса раскрутки.",
      },
    ],
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
    implemented: true,
    abilities: [
      {
        id: "resonance:mark",
        name: "Метка резонанса",
        step: 1,
        breathCost: 0,
        resourceCost: 0,
        cooldownMs: 0,
        description: "Резонансные попадания копят стеки на цели и почти игнорируют броню.",
      },
      {
        id: "resonance:distortion",
        name: "Искажение зоны",
        step: 2,
        breathCost: 20,
        resourceCost: 1,
        cooldownMs: 8000,
        description: "Область три клетки: замедление, потеря ориентации, разрыв линии видимости врагов.",
      },
      {
        id: "resonance:chain",
        name: "Цепь",
        step: 3,
        breathCost: 15,
        resourceCost: 2,
        cooldownMs: 6000,
        description: "Эффект переходит между помеченными целями: до четырёх переходов, каждый слабее на 20%.",
      },
      {
        id: "resonance:desync",
        name: "Разрыв синхронизации",
        step: 4,
        breathCost: 25,
        resourceCost: 4,
        cooldownMs: 10000,
        description: "Цель с четырьмя стеками теряет ход: прерывание, −50% стойки, принудительное перемещение.",
      },
      {
        id: "resonance:reverse_shadow",
        name: "Обратная тень",
        step: 5,
        breathCost: 30,
        resourceCost: 2,
        cooldownMs: 14000,
        description: "Две секунды неуязвимости без возможности атаковать ценой +15 заражения.",
      },
    ],
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

/** Опора танка: ступень за каждые 1.2 с удержания блока, идеальный блок даёт сразу ступень. */
export const FOOTING_STEP_MS = 1200;
export const FOOTING_PERFECT_BONUS_MS = 1200;
export const FOOTING_BLOCK_ABSORB_BONUS = 0.06;

export function footingStepsFor(blockHeldMs: number): number {
  return Math.min(3, Math.floor(blockHeldMs / FOOTING_STEP_MS));
}

/** Каждая ступень опоры добавляет поглощение блока. */
export function footingAbsorbBonus(steps: number): number {
  return FOOTING_BLOCK_ABSORB_BONUS * Math.min(3, Math.max(0, steps));
}

/** Темп ловкача: ступень за смену стороны цели или уклонение, живёт четыре секунды. */
export const TEMPO_WINDOW_MS = 4000;
export const TEMPO_DAMAGE_BONUS = 0.1;
export const TEMPO_FULL_STEPS = 3;

export function tempoStepsFor(stacks: number, lastGainMs: number, nowMs: number): number {
  if (nowMs - lastGainMs > TEMPO_WINDOW_MS) return 0;
  return Math.min(TEMPO_FULL_STEPS, Math.max(0, stacks));
}

export function tempoDamageBonus(steps: number): number {
  return TEMPO_DAMAGE_BONUS * Math.min(TEMPO_FULL_STEPS, Math.max(0, steps));
}

/** На полном темпе удар считается ударом в спину под любым углом. */
export function tempoGrantsBackstab(steps: number): boolean {
  return steps >= TEMPO_FULL_STEPS;
}

/** Температура тяжёлого стрелка: обратный ресурс, растёт сама и наказывает. */
export const HEAT_PER_SHOT = 9;
export const HEAT_SPIN_UP_MS = 4000;
export const HEAT_OVERHEAT = 100;
export const HEAT_OVERHEAT_LOCK_MS = 3000;
export const HEAT_VENT_AMOUNT = 60;
export const HEAT_VENT_VULNERABLE_MS = 1500;
export const HEAT_COOLING_PER_SECOND = 12;
export const SET_UP_DAMAGE_BONUS = 0.3;
export const SET_UP_SPEED_PENALTY = 0.7;
export const UNDEPLOYED_DAMAGE_PENALTY = 0.4;

/** Раскрутка: темп стрельбы растёт вчетверо медленнее к концу четвёртой секунды. */
export function spinUpFactor(firingMs: number): number {
  const share = Math.min(1, Math.max(0, firingMs) / HEAT_SPIN_UP_MS);
  return 1 - 0.5 * share;
}

export function heatShare(heat: number): number {
  return Math.min(1, Math.max(0, heat) / HEAT_OVERHEAT);
}

/** Резонанс: стеки на цели, четвёртый открывает разрыв синхронизации. */
export const RESONANCE_MAX_STACKS = 4;
export const RESONANCE_CHAIN_JUMPS = 4;
export const RESONANCE_CHAIN_FALLOFF = 0.2;
export const RESONANCE_CONTAMINATION_COST = 4;
export const RESONANCE_STRESS_COST = 6;
export const REVERSE_SHADOW_MS = 2000;
export const REVERSE_SHADOW_CONTAMINATION = 15;

export function chainDamageAt(base: number, jump: number): number {
  if (jump < 0 || jump >= RESONANCE_CHAIN_JUMPS) return 0;
  return Math.max(1, Math.round(base * (1 - RESONANCE_CHAIN_FALLOFF) ** jump));
}

export function desyncReady(stacks: number): boolean {
  return stacks >= RESONANCE_MAX_STACKS;
}
