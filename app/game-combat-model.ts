// Числовая боевая модель v2.
//
// Модуль намеренно не знает ничего о картах, ИИ, сохранениях и React: на вход
// подаются профили атакующего, цели и удара, на выход — результат. Формулы и
// обоснования — в docs/COMBAT_NUMERIC_MODEL_V2.md.

export type DamageType = "kinetic" | "electric" | "thermal" | "resonant";
export type AttackKind = "light" | "heavy" | "charged" | "finisher" | "skill";
export type CombatantRank = "common" | "enhanced" | "veteran" | "elite" | "boss";
export type FacingHit = "front" | "flank" | "back" | "unaware";
export type StanceState = "steady" | "shaken" | "staggered";
export type CriticalEffectId = "rupture" | "surge" | "burn" | "defocus";

/** Доля брони, которая вообще работает против данного типа урона. */
export const ARMOR_EFFECTIVENESS: Record<DamageType, number> = {
  kinetic: 1,
  electric: 0.6,
  thermal: 0.75,
  resonant: 0.25,
};

export const ARMOR_SOFTENING_CONSTANT = 90;
export const ARMOR_MITIGATION_CAP = 0.7;

export const POSITION_MULTIPLIER: Record<FacingHit, number> = {
  front: 1,
  flank: 1.1,
  back: 1.25,
  unaware: 1.35,
};

export const STANCE_STATE_MULTIPLIER: Record<StanceState, number> = {
  steady: 1,
  shaken: 1.15,
  staggered: 1.5,
};

export const FINISHER_MULTIPLIER = 2.2;

/** Порог доли стойки, ниже которого цель считается пошатнувшейся. */
export const SHAKEN_STANCE_RATIO = 0.25;

export const ATTACK_KIND_PROFILE: Record<
  AttackKind,
  { damage: number; stance: number; penetration: number; breath: number }
> = {
  light: { damage: 1, stance: 1, penetration: 0, breath: 0 },
  heavy: { damage: 1.6, stance: 3, penetration: 15, breath: 25 },
  charged: { damage: 1.6, stance: 3, penetration: 15, breath: 35 },
  finisher: { damage: FINISHER_MULTIPLIER, stance: 0, penetration: 25, breath: 15 },
  skill: { damage: 1, stance: 1, penetration: 0, breath: 0 },
};

/** Каждая ступень заряда силача. */
export const CHARGE_STEP_DAMAGE = 0.12;
export const CHARGE_STEP_STANCE = 0.15;
export const CHARGE_MAX_STEPS = 3;

export const BREATH_COSTS = {
  dash: 22,
  dodge: 22,
  heavyAttack: 25,
  chargedAttack: 35,
  blockHoldPerSecond: 6,
  blockImpactBase: 8,
  blockImpactShare: 0.25,
  finisher: 15,
} as const;

export const BLOCK = {
  baseAbsorb: 0.55,
  absorbCap: 0.9,
  stanceShare: 0.6,
  arcDegrees: 120,
  perfectWindowMs: 180,
  perfectRiposteMs: 900,
  perfectRiposteRepeatMs: 500,
  perfectBreathRefund: 10,
  perfectAttackerStanceMultiplier: 1.5,
  breakStanceLoss: 0.3,
  breakVulnerableMs: 800,
} as const;

export const DODGE = {
  invulnerableMs: 300,
  distance: 2.2,
  recoveryMs: 420,
  perfectWindowMs: 250,
  perfectDamageBonus: 0.3,
  perfectTempoMs: 2000,
} as const;

export const STAGGER: Record<
  "common" | "elite" | "boss",
  { durationMs: number; damageMultiplier: number; stanceReturn: number; immunityMs: number }
> = {
  common: { durationMs: 2500, damageMultiplier: 1.5, stanceReturn: 0.35, immunityMs: 3000 },
  elite: { durationMs: 1800, damageMultiplier: 1.4, stanceReturn: 0.45, immunityMs: 5000 },
  boss: { durationMs: 1200, damageMultiplier: 1.25, stanceReturn: 1, immunityMs: 0 },
};

export const BOSS = {
  damageCapShare: 0.12,
  damageFloorShare: 0.004,
  heroHitCapShare: 0.35,
  phaseThresholds: [0.66, 0.33],
  phaseInvulnerableMs: 1500,
  staggerThresholdGrowth: 0.25,
} as const;

export const CRITICAL = {
  baseChance: 0.05,
  chanceCap: 0.5,
  baseMultiplier: 1.5,
  powerStep: 0.5,
} as const;

export const CRITICAL_EFFECT: Record<DamageType, CriticalEffectId> = {
  kinetic: "rupture",
  electric: "surge",
  thermal: "burn",
  resonant: "defocus",
};

export const CRITICAL_EFFECT_PROFILE: Record<
  CriticalEffectId,
  { durationMs: number; label: string; share?: number; perSecond?: number; armorLoss?: number; accuracyLoss?: number; breathLoss?: number }
> = {
  rupture: { durationMs: 4000, label: "Разрыв", share: 0.15 },
  surge: { durationMs: 0, label: "Сбой", breathLoss: 0.2 },
  burn: { durationMs: 5000, label: "Прожиг", perSecond: 8, armorLoss: 10 },
  defocus: { durationMs: 6000, label: "Расфокус", accuracyLoss: 0.25 },
};

export const RANK_SCALING: Record<
  CombatantRank,
  { hp: number; damage: number; stance: number; flatAbsorb: number }
> = {
  common: { hp: 1, damage: 1, stance: 1, flatAbsorb: 0 },
  enhanced: { hp: 1.35, damage: 1.15, stance: 1.25, flatAbsorb: 1 },
  veteran: { hp: 1.8, damage: 1.3, stance: 1.6, flatAbsorb: 2 },
  elite: { hp: 2.6, damage: 1.5, stance: 2.2, flatAbsorb: 4 },
  boss: { hp: 6.5, damage: 1.85, stance: 4, flatAbsorb: 6 },
};

export const TIER_SCALING = { hp: 0.22, damage: 0.16, armor: 6, stance: 0.18 } as const;
/** Тревога популяции не должна превращаться в скрытое масштабирование под игрока. */
export const AGITATION_CAP = 0.1;

export const DAMAGE_SPREAD = { min: 0.92, max: 1.08 } as const;

export type AttackerProfile = {
  damage: number;
  stanceDamage: number;
  damageType: DamageType;
  kind: AttackKind;
  penetration?: number;
  damageBonus?: number;
  criticalChance?: number;
  criticalPower?: number;
  chargeSteps?: number;
  /** Встречный удар: цель уже начала собственный замах. */
  counterTiming?: boolean;
};

export type TargetProfile = {
  hp: number;
  maxHp: number;
  armor: number;
  flatAbsorb?: number;
  stance: number;
  maxStance: number;
  rank: CombatantRank;
  staggered?: boolean;
  finishing?: boolean;
};

export type StrikeContext = {
  facing?: FacingHit;
  /** Значение 0…1 из детерминированного генератора мира. */
  roll?: number;
  criticalRoll?: number;
  blocking?: boolean;
  blockAbsorb?: number;
  perfectBlock?: boolean;
  perfectDodgeTempo?: boolean;
};

export type StrikeResult = {
  damage: number;
  stanceDamage: number;
  critical: boolean;
  criticalEffect: CriticalEffectId | null;
  mitigation: number;
  blocked: boolean;
  perfectBlock: boolean;
  attackerStanceDamage: number;
  breathCost: number;
  targetHp: number;
  targetStance: number;
  staggered: boolean;
  stanceState: StanceState;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function armorMitigation(
  armor: number,
  damageType: DamageType,
  penetration = 0,
): number {
  const effective = Math.max(0, armor * ARMOR_EFFECTIVENESS[damageType] - penetration);
  return Math.min(ARMOR_MITIGATION_CAP, effective / (effective + ARMOR_SOFTENING_CONSTANT));
}

export function stanceState(stance: number, maxStance: number): StanceState {
  if (stance <= 0) return "staggered";
  if (maxStance > 0 && stance / maxStance < SHAKEN_STANCE_RATIO) return "shaken";
  return "steady";
}

export function stanceRegenPerSecond(maxStance: number): number {
  return maxStance * 0.12;
}

export function maxHeroHp(input: {
  level: number;
  body: number;
  equipment?: number;
  talents?: number;
  torsoInjury?: number;
  contamination?: number;
}): number {
  const value =
    100 +
    10 * input.level +
    6 * input.body +
    (input.equipment ?? 0) +
    (input.talents ?? 0) -
    12 * (input.torsoInjury ?? 0) -
    Math.floor((input.contamination ?? 0) / 10) * 4;
  return Math.max(40, Math.round(value));
}

export function maxHeroStance(input: {
  level: number;
  body: number;
  will: number;
  equipment?: number;
}): number {
  return Math.round(60 + 2 * input.level + 5 * input.body + 3 * input.will + (input.equipment ?? 0));
}

export function maxHeroBreath(input: {
  reaction: number;
  will: number;
  equipment?: number;
}): number {
  return Math.round(100 + 4 * input.reaction + 3 * input.will + (input.equipment ?? 0));
}

export function breathRegenPerSecond(input: {
  overloadShare?: number;
  contamination?: number;
  stress?: number;
  maskFactor?: number;
}): number {
  const regen =
    18 *
    (1 - 0.35 * clamp(input.overloadShare ?? 0, 0, 1)) *
    (1 - 0.3 * clamp((input.contamination ?? 0) / 100, 0, 1)) *
    (1 - 0.25 * clamp((input.stress ?? 0) / 100, 0, 1)) *
    (input.maskFactor ?? 1);
  return Math.max(0, regen);
}

/** Тир этажа: чем глубже, тем сильнее обитатели. Уровень героя не участвует. */
export function floorTier(floor: number): number {
  return Math.max(1, Math.floor((556 - floor) / 5) + 1);
}

export function scaleEnemy(
  base: { hp: number; damage: number; armor: number; stance: number },
  options: { floor: number; rank: CombatantRank; agitation?: number },
): { hp: number; damage: number; armor: number; stance: number; flatAbsorb: number } {
  const tier = floorTier(options.floor);
  const rank = RANK_SCALING[options.rank];
  const agitation = 1 + clamp((options.agitation ?? 0) / 100, 0, 1) * AGITATION_CAP;
  return {
    hp: Math.round(base.hp * (1 + TIER_SCALING.hp * tier) * rank.hp * agitation),
    damage: Math.round(base.damage * (1 + TIER_SCALING.damage * tier) * rank.damage * agitation),
    armor: Math.round(base.armor + TIER_SCALING.armor * tier),
    stance: Math.round(base.stance * (1 + TIER_SCALING.stance * tier) * rank.stance),
    flatAbsorb: rank.flatAbsorb,
  };
}

export function chargeMultipliers(steps: number): { damage: number; stance: number } {
  const capped = clamp(Math.floor(steps), 0, CHARGE_MAX_STEPS);
  return {
    damage: 1 + CHARGE_STEP_DAMAGE * capped,
    stance: 1 + CHARGE_STEP_STANCE * capped,
  };
}

export function blockAbsorption(bonus = 0): number {
  return Math.min(BLOCK.absorbCap, BLOCK.baseAbsorb + bonus);
}

export function criticalChance(bonus = 0): number {
  return Math.min(CRITICAL.chanceCap, CRITICAL.baseChance + bonus);
}

export function criticalMultiplier(power = 0): number {
  return CRITICAL.baseMultiplier + CRITICAL.powerStep * power;
}

function staggerProfileFor(rank: CombatantRank) {
  if (rank === "boss") return STAGGER.boss;
  if (rank === "elite" || rank === "veteran") return STAGGER.elite;
  return STAGGER.common;
}

export function staggerProfile(rank: CombatantRank) {
  return staggerProfileFor(rank);
}

/**
 * Разрешает один удар целиком: урон, стойку, крит, блок и ошеломление.
 * Случайность приходит снаружи детерминированными значениями 0…1.
 */
export function resolveStrike(
  attacker: AttackerProfile,
  target: TargetProfile,
  context: StrikeContext = {},
): StrikeResult {
  const kind = ATTACK_KIND_PROFILE[attacker.kind];
  const charge = attacker.kind === "charged" ? chargeMultipliers(attacker.chargeSteps ?? 0) : { damage: 1, stance: 1 };
  const spreadRoll = clamp(context.roll ?? 0.5, 0, 1);
  const spread = DAMAGE_SPREAD.min + (DAMAGE_SPREAD.max - DAMAGE_SPREAD.min) * spreadRoll;

  const critical =
    context.criticalRoll !== undefined &&
    context.criticalRoll < criticalChance(attacker.criticalChance ?? 0);
  const criticalFactor = critical ? criticalMultiplier(attacker.criticalPower ?? 0) : 1;

  const facing = context.facing ?? "front";
  const currentState = target.staggered ? "staggered" : stanceState(target.stance, target.maxStance);
  const stateMultiplier = target.finishing
    ? FINISHER_MULTIPLIER
    : STANCE_STATE_MULTIPLIER[currentState];

  const penetration = kind.penetration + (attacker.penetration ?? 0);
  const mitigation = armorMitigation(target.armor, attacker.damageType, penetration);

  const raw =
    attacker.damage *
    kind.damage *
    charge.damage *
    (1 + (attacker.damageBonus ?? 0)) *
    (context.perfectDodgeTempo ? 1 + DODGE.perfectDamageBonus : 1) *
    criticalFactor *
    spread *
    POSITION_MULTIPLIER[facing];

  const perfectBlock = Boolean(context.blocking && context.perfectBlock);
  const blocked = Boolean(context.blocking) && !perfectBlock;
  const blockFactor = perfectBlock ? 0 : blocked ? 1 - blockAbsorption(context.blockAbsorb ?? 0) : 1;

  const afterArmor = raw * (1 - mitigation) * blockFactor;
  const flatAbsorb = perfectBlock ? 0 : target.flatAbsorb ?? RANK_SCALING[target.rank].flatAbsorb;
  let damage = perfectBlock ? 0 : Math.max(1, Math.round(afterArmor - flatAbsorb));
  damage = perfectBlock ? 0 : Math.round(damage * stateMultiplier);

  if (target.rank === "boss" && damage > 0) {
    const cap = Math.max(1, Math.round(target.maxHp * BOSS.damageCapShare));
    const floor = Math.max(1, Math.round(target.maxHp * BOSS.damageFloorShare));
    damage = clamp(damage, floor, cap);
  }

  const rawStance =
    attacker.stanceDamage *
    kind.stance *
    charge.stance *
    (attacker.counterTiming ? 1.4 : 1) *
    spread;
  const stanceDamage = perfectBlock
    ? 0
    : Math.max(0, Math.round(blocked ? rawStance * BLOCK.stanceShare : rawStance));

  const attackerStanceDamage = perfectBlock
    ? Math.round(attacker.stanceDamage * BLOCK.perfectAttackerStanceMultiplier)
    : 0;

  const breathCost = perfectBlock
    ? -BLOCK.perfectBreathRefund
    : blocked
      ? Math.round(BREATH_COSTS.blockImpactBase + damage * BREATH_COSTS.blockImpactShare)
      : 0;

  const targetHp = Math.max(0, target.hp - damage);
  const targetStance = Math.max(0, target.stance - stanceDamage);
  const staggered = targetStance <= 0 && target.stance > 0;

  return {
    damage,
    stanceDamage,
    critical,
    criticalEffect: critical ? CRITICAL_EFFECT[attacker.damageType] : null,
    mitigation,
    blocked,
    perfectBlock,
    attackerStanceDamage,
    breathCost,
    targetHp,
    targetStance,
    staggered,
    stanceState: stanceState(targetStance, target.maxStance),
  };
}

/** Ограничение входящего урона по герою: смерть с полного здоровья одним ударом запрещена. */
export function capBossHitOnHero(damage: number, heroHp: number): number {
  return Math.min(damage, Math.max(1, Math.round(heroHp * BOSS.heroHitCapShare)));
}

/** Пересчёт старой полосы здоровья в новую шкалу при миграции сохранения. */
export function migrateHpShare(oldHp: number, oldMax: number, newMax: number): number {
  if (oldMax <= 0) return newMax;
  return clamp(Math.round(newMax * (oldHp / oldMax)), 1, newMax);
}

// --- Настраиваемые пассивами параметры боя -------------------------------
//
// Базовая боевая система читает только эту структуру. Любой новый пассивный
// талант меняет бой, дописывая бонус, а не переписывая механику.

export type DefenceTuning = {
  /** Можно ли удерживать защитную стойку, а не ставить блок на миг. */
  canHold: boolean;
  /** Длительность короткого блока без таланта удержания. */
  briefMs: number;
  absorb: number;
  /** Расход дыхания в секунду при удержании. */
  holdCostPerSecond: number;
  /** Доля входящего урона по стойке, которую блок пропускает. */
  stanceShare: number;
  /** Окно парирования: ноль означает, что парирования нет. */
  parryWindowMs: number;
  /** Доля урона по стойке, возвращаемая атакующему при парировании. */
  parryReflect: number;
  riposteMs: number;
};

export type ChargeTuning = {
  /** Мс на одну ступень заряда. */
  stepMs: number;
  maxSteps: number;
  damagePerStep: number;
  stancePerStep: number;
  breathCost: number;
};

export const BASE_DEFENCE_TUNING: DefenceTuning = {
  canHold: false,
  briefMs: 420,
  absorb: BLOCK.baseAbsorb,
  holdCostPerSecond: BREATH_COSTS.blockHoldPerSecond,
  stanceShare: BLOCK.stanceShare,
  parryWindowMs: 0,
  parryReflect: 0,
  riposteMs: BLOCK.perfectRiposteMs,
};

export const BASE_CHARGE_TUNING: ChargeTuning = {
  stepMs: 220,
  maxSteps: CHARGE_MAX_STEPS,
  damagePerStep: CHARGE_STEP_DAMAGE,
  stancePerStep: CHARGE_STEP_STANCE,
  breathCost: BREATH_COSTS.chargedAttack,
};

export type DefenceBonuses = {
  blockHold?: number;
  block?: number;
  blockCostReduction?: number;
  parryWindow?: number;
  parryReflect?: number;
};

export type ChargeBonuses = {
  chargeRate?: number;
  chargeSteps?: number;
  chargePower?: number;
};

/** Собирает параметры защитного действия из пассивных бонусов. */
export function defenceTuning(bonuses: DefenceBonuses = {}): DefenceTuning {
  return {
    ...BASE_DEFENCE_TUNING,
    canHold: (bonuses.blockHold ?? 0) > 0,
    absorb: Math.min(BLOCK.absorbCap, BASE_DEFENCE_TUNING.absorb + (bonuses.block ?? 0)),
    holdCostPerSecond: Math.max(
      1,
      BASE_DEFENCE_TUNING.holdCostPerSecond * (1 - Math.min(0.75, bonuses.blockCostReduction ?? 0)),
    ),
    parryWindowMs: Math.max(0, Math.round(bonuses.parryWindow ?? 0)),
    parryReflect: Math.max(0, bonuses.parryReflect ?? 0),
  };
}

/** Собирает параметры заряжаемого удара из пассивных бонусов. */
export function chargeTuning(bonuses: ChargeBonuses = {}): ChargeTuning {
  return {
    ...BASE_CHARGE_TUNING,
    stepMs: Math.max(80, Math.round(BASE_CHARGE_TUNING.stepMs / (1 + (bonuses.chargeRate ?? 0)))),
    maxSteps: Math.max(1, BASE_CHARGE_TUNING.maxSteps + Math.floor(bonuses.chargeSteps ?? 0)),
    damagePerStep: BASE_CHARGE_TUNING.damagePerStep + (bonuses.chargePower ?? 0),
  };
}

/** Ступени заряда за время удержания команды атаки. */
export function chargeStepsFor(heldMs: number, tuning: ChargeTuning): number {
  return Math.min(tuning.maxSteps, Math.floor(Math.max(0, heldMs) / tuning.stepMs));
}

/** Множители заряженного удара с учётом настроенных пассивами параметров. */
export function tunedChargeMultipliers(steps: number, tuning: ChargeTuning): { damage: number; stance: number } {
  const capped = Math.min(tuning.maxSteps, Math.max(0, Math.floor(steps)));
  return {
    damage: 1 + tuning.damagePerStep * capped,
    stance: 1 + tuning.stancePerStep * capped,
  };
}

/** Попал ли момент отражения в окно парирования. */
export function isParry(heldMs: number, tuning: DefenceTuning): boolean {
  return tuning.parryWindowMs > 0 && heldMs <= tuning.parryWindowMs;
}
