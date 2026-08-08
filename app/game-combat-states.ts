// Наведённые состояния: слой, из-за которого порядок действий в бою имеет
// значение.
//
// До этого модуля способности были шагами 1‑2‑3‑4‑5: метка существовала, но
// ничто её не использовало, и нажать их можно было в любом порядке с почти
// одинаковым результатом. Здесь описано, что одна способность **готовит**
// цель, а другая **использует** подготовку.
//
// Модуль чистый: он не знает про состояние мира и работает с числами. Правила
// и порядок работ — docs/COMBAT_DEPTH_ROADMAP.md §2, этап 1.

export type CombatStateId = "resonance" | "exposure" | "overload";

export type CombatStateInfo = {
  id: CombatStateId;
  name: string;
  /** Чем накладывается — текстом для интерфейса, а не списком ID. */
  appliedBy: string;
  /** Чем используется. Если пусто — состояние ничего не открывает. */
  consumedBy: string;
  description: string;
};

export const COMBAT_STATES: Record<CombatStateId, CombatStateInfo> = {
  resonance: {
    id: "resonance",
    name: "Резонанс",
    appliedBy: "метки, точные выстрелы и резонансные воздействия",
    consumedBy: "тяжёлый удар",
    description:
      "Металл цели начинает звучать. Тяжёлый удар по резонирующей цели срывает накопленное пространственным импульсом по площади.",
  },
  exposure: {
    id: "exposure",
    name: "Вскрытие",
    appliedBy: "слом стойки",
    consumedBy: "любой урон в упор",
    description:
      "Защита цели разошлась по швам. Пока вскрытие держится, броня почти не работает.",
  },
  overload: {
    id: "overload",
    name: "Перегрузка",
    appliedBy: "стрельба на высокой температуре",
    consumedBy: "любое попадание",
    description:
      "В цели накоплен электрический потенциал. Следующее попадание пробивает его на соседние цели — чем плотнее строй, тем дальше уходит пробой.",
  },
};

/** Потолок резонанса: выше — не копится, чтобы стек не превращался в счётчик. */
export const RESONANCE_MAX_STACKS = 4;

/** Сколько держится вскрытие после слома стойки. */
export const EXPOSURE_MS = 4200;

/**
 * Броня во время вскрытия. Не ноль: вскрытие — окно, а не отключение правил.
 */
export const EXPOSURE_ARMOR_SHARE = 0.25;

export function armorUnderExposure(armor: number, exposed: boolean): number {
  return exposed ? Math.round(armor * EXPOSURE_ARMOR_SHARE) : armor;
}

export type ResonanceImpulse = {
  /** Урон в точке детонации. */
  damage: number;
  /** Радиус импульса в клетках. */
  radius: number;
  /** Урон по стойке соседних целей. */
  stanceDamage: number;
  stacksSpent: number;
};

/**
 * Детонация резонанса тяжёлым ударом.
 *
 * Растёт быстрее линейного: копить стеки должно быть выгоднее, чем срывать
 * каждый по отдельности, иначе подготовка не окупается и связка не нужна.
 */
export function resonanceImpulse(stacks: number, baseDamage: number): ResonanceImpulse | null {
  const spent = Math.min(RESONANCE_MAX_STACKS, Math.max(0, Math.floor(stacks)));
  if (spent <= 0) return null;
  // Квадратичная составляющая и делает подготовку осмысленной: три стека,
  // сорванные разом, бьют заметно сильнее трёх отдельных срывов по одному,
  // хотя каждый срыв стоит одного и того же тяжёлого удара.
  return {
    damage: Math.round(baseDamage * (0.25 * spent + 0.12 * spent * spent)),
    radius: 1.6 + 0.4 * spent,
    stanceDamage: 6 + 5 * spent,
    stacksSpent: spent,
  };
}

/** Сколько держится перегрузка, если её не пробили. */
export const OVERLOAD_MS = 5200;

/**
 * Температура, с которой выстрелы начинают наводить перегрузку.
 *
 * Порог намеренно высокий: перегрузка — награда за работу у самого перегрева,
 * а не бесплатный побочный эффект стрельбы. Направление Температуры про то,
 * чтобы держаться у верхней границы и вовремя сбрасывать.
 */
export const OVERLOAD_HEAT_SHARE = 0.6;

export type OverloadBreach = {
  /** Урон в цели, на которой пробили потенциал. */
  damage: number;
  /** На сколько клеток уходит пробой. */
  radius: number;
  /** Сколько целей он способен задеть, включая исходную. */
  maxTargets: number;
};

/**
 * Пробой перегрузки. В отличие от резонансного импульса, он не растёт от
 * накопления, а расходится по числу целей: перегрузка вознаграждает не
 * подготовку одной цели, а работу по плотной группе.
 */
export function overloadBreach(baseDamage: number, heatShare: number): OverloadBreach {
  const intensity = Math.min(1, Math.max(0, heatShare));
  return {
    damage: Math.round(baseDamage * (0.3 + 0.25 * intensity)),
    radius: 2.2,
    maxTargets: 2 + Math.round(intensity * 2),
  };
}

/** Причина, по которой связка не сработала. Интерфейс обязан её показать. */
export type BlockedReason =
  | "no_target"
  | "no_resonance"
  | "not_heavy_weapon"
  | "out_of_range";

export const BLOCKED_REASON_LABELS: Record<BlockedReason, string> = {
  no_target: "нет цели",
  no_resonance: "на цели нет резонанса",
  not_heavy_weapon: "нужен тяжёлый удар",
  out_of_range: "цель слишком далеко",
};
