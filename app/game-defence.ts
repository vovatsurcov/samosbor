// Защитная модель v1: защита строится билдом, а не нажатиями.
//
// Правило жанра (docs/COMBAT_DEPTH_ROADMAP.md §3): SAMOSBOR — изометрический
// слэшер, а не souls-like. У игрока нет кнопки блока, нет кнопки парирования и
// нет окна в двести миллисекунд, в которое надо попасть. Блок, парирование и
// уклонение — свойства персонажа, собранные деревом, экипировкой и оружием.
// Руками игрок двигается, выбирает позицию и цель, бьёт и связывает
// способности.
//
// Модуль чистый: числа на входе, числа на выходе, никакого состояния мира.

import type { DamageType } from "./game-combat-model.ts";

/**
 * Категории воздействия. Их ровно четыре: категория существует, только если
 * она требует другого билда и другого поведения, а не ещё одной цифры.
 */
export type ThreatCategory = "kinetic" | "thermal" | "chemical" | "anomalous";

export const THREAT_LABELS: Record<ThreatCategory, string> = {
  kinetic: "Кинетическое",
  thermal: "Термическое и электрическое",
  chemical: "Химическое и заражение",
  anomalous: "Аномальное и резонансное",
};

export const THREAT_SOURCES: Record<ThreatCategory, string> = {
  kinetic: "удары, обломки, баллистика",
  thermal: "пробои, перегрев, аварийные контуры",
  chemical: "реагенты, загрязнение, продукты производства",
  anomalous: "резонанс, пространственное давление, Самосбор",
};

export function threatOf(damageType: DamageType): ThreatCategory {
  if (damageType === "electric" || damageType === "thermal") return "thermal";
  if (damageType === "resonant") return "anomalous";
  return "kinetic";
}

/**
 * Защитный профиль персонажа. Собирается из дерева, экипировки и оружия —
 * ни одно поле не является следствием нажатой кнопки.
 */
export type DefenceProfile = {
  /** Шанс полностью избежать удара. Разброс, а не надёжность. */
  evasion: number;
  /** Шанс погасить крупную долю удара. Надёжнее уклонения, но не отменяет урон. */
  blockChance: number;
  /** Какую долю урона снимает сработавший блок. */
  blockEffectiveness: number;
  /** Шанс парировать: реже блока, но обращает защиту в атаку. */
  parryChance: number;
  /** Броня: гасит стабильно, но крупный удар пробивает её долю хуже. */
  armour: number;
  /** Сопротивления по категориям, доля 0…0.75. */
  resistances: Record<ThreatCategory, number>;
  /** Устойчивость: насколько слабее удар ломает стойку героя. */
  posture: number;
};

export const EMPTY_RESISTANCES: Record<ThreatCategory, number> = {
  kinetic: 0,
  thermal: 0,
  chemical: 0,
  anomalous: 0,
};

/** Потолок сопротивления: полная неуязвимость к категории недопустима. */
export const RESISTANCE_CAP = 0.75;

/**
 * Броня гасит долю урона с насыщением.
 *
 * Формула намеренно даёт броне **обратный уклонению профиль**: против частых
 * мелких ударов броня снимает бóльшую долю, против одного тяжёлого — меньшую.
 * Иначе броня, блок, уклонение и сопротивление превращаются в четыре названия
 * одного «+X% эффективных ОЗ» и не создают разных причин собирать билд.
 */
export function armourMitigation(armour: number, incoming: number): number {
  if (armour <= 0 || incoming <= 0) return 0;
  return armour / (armour + incoming * 2.2);
}

export type DefenceStepId =
  | "evasion"
  | "parry"
  | "block"
  | "armour"
  | "resistance";

export type DefenceStep = {
  id: DefenceStepId;
  /** Сработал ли слой. */
  applied: boolean;
  /** Сколько урона снял слой. */
  reduced: number;
  note: string;
};

export type DefenceOutcome = {
  damage: number;
  /** Удар не прошёл вовсе. */
  avoided: boolean;
  /** Парирование обращает защиту в атаку. */
  parried: boolean;
  /** Урон по стойке героя после устойчивости. */
  postureDamage: number;
  category: ThreatCategory;
  /** Разбор удара по слоям — для интерфейса, подсказок и отладки. */
  steps: DefenceStep[];
};

export type DefenceRolls = {
  /** 0…1, для уклонения. */
  evasion: number;
  /** 0…1, для парирования. */
  parry: number;
  /** 0…1, для блока. */
  block: number;
};

/**
 * Полный разбор входящего удара.
 *
 * Порядок слоёв важен: сначала то, что отменяет удар целиком (уклонение,
 * парирование), затем то, что гасит его долю (блок, броня, сопротивление).
 * Каждый слой отчитывается отдельно, поэтому интерфейс может объяснить
 * результат, а не показать одно итоговое число.
 */
export function resolveDefence(
  incoming: number,
  damageType: DamageType,
  profile: DefenceProfile,
  rolls: DefenceRolls,
  postureDamage = 0,
): DefenceOutcome {
  const category = threatOf(damageType);
  const steps: DefenceStep[] = [];

  if (rolls.evasion < profile.evasion) {
    steps.push({ id: "evasion", applied: true, reduced: incoming, note: "удар не достиг цели" });
    return { damage: 0, avoided: true, parried: false, postureDamage: 0, category, steps };
  }
  steps.push({ id: "evasion", applied: false, reduced: 0, note: "уклонение не сработало" });

  if (rolls.parry < profile.parryChance) {
    steps.push({ id: "parry", applied: true, reduced: incoming, note: "удар парирован, атакующий открыт" });
    return { damage: 0, avoided: true, parried: true, postureDamage: 0, category, steps };
  }
  steps.push({ id: "parry", applied: false, reduced: 0, note: "парирование не сработало" });

  let damage = incoming;

  if (rolls.block < profile.blockChance) {
    const reduced = damage * profile.blockEffectiveness;
    damage -= reduced;
    steps.push({ id: "block", applied: true, reduced: Math.round(reduced), note: "блок погасил часть удара" });
  } else {
    steps.push({ id: "block", applied: false, reduced: 0, note: "блок не сработал" });
  }

  const mitigation = armourMitigation(profile.armour, damage);
  const armourReduced = damage * mitigation;
  damage -= armourReduced;
  steps.push({
    id: "armour",
    applied: armourReduced > 0,
    reduced: Math.round(armourReduced),
    note: `броня сняла ${Math.round(mitigation * 100)}%`,
  });

  const resistance = Math.min(RESISTANCE_CAP, Math.max(0, profile.resistances[category] ?? 0));
  const resistanceReduced = damage * resistance;
  damage -= resistanceReduced;
  steps.push({
    id: "resistance",
    applied: resistanceReduced > 0,
    reduced: Math.round(resistanceReduced),
    note: `${THREAT_LABELS[category].toLowerCase()}: −${Math.round(resistance * 100)}%`,
  });

  return {
    damage: Math.max(0, Math.round(damage)),
    avoided: false,
    parried: false,
    postureDamage: Math.max(0, Math.round(postureDamage * (1 - Math.min(0.75, profile.posture)))),
    category,
    steps,
  };
}

/** Человекочитаемый разбор удара: как интерфейс объясняет результат. */
export function describeDefence(outcome: DefenceOutcome): string {
  const applied = outcome.steps.filter((step) => step.applied);
  if (outcome.parried) return "парирование: удар обращён против атакующего";
  if (outcome.avoided) return "уклонение: удар прошёл мимо";
  if (!applied.length) return "защита не сработала: удар прошёл полностью";
  return applied.map((step) => `${step.note} (−${step.reduced})`).join("; ");
}
