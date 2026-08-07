// Три режима управления боем: ручной, директива и автоконтур.
//
// Модуль чистый: он не знает про состояние мира, а работает со снимком боя и
// списком правил. Обоснование и цены режимов — в docs/COMBAT_ARCHETYPES_V2.md §4.

export type ControlMode = "manual" | "directive" | "autopilot";

export type AutopilotTemper = "aggressive" | "economical" | "defensive";

export type DirectiveCondition =
  | "hp_below"
  | "breath_below"
  | "resource_above"
  | "target_staggered"
  | "target_shaken"
  | "target_unmarked"
  | "enemies_within"
  | "target_hp_below"
  | "incoming_heavy"
  | "in_position";

export type DirectiveAction =
  | "defensive_skill"
  | "heavy_strike"
  | "area_strike"
  | "mark_target"
  | "close_distance"
  | "break_distance"
  | "vent_heat"
  | "finisher"
  | "retreat"
  | "basic_attack";

export type DirectiveRule = {
  id: string;
  condition: DirectiveCondition;
  /** Порог: доля 0…1 для процентных условий, абсолютное число для счётных. */
  threshold?: number;
  action: DirectiveAction;
};

/** Снимок боя, достаточный для решения. Собирается движком, не модулем. */
export type CombatSnapshot = {
  hpShare: number;
  breathShare: number;
  resourceShare: number;
  heatShare?: number;
  hasTarget: boolean;
  targetHpShare: number;
  targetStaggered: boolean;
  targetShaken: boolean;
  targetMarked: boolean;
  targetDistance: number;
  enemiesWithin: number;
  incomingHeavy: boolean;
  inPosition: boolean;
};

export const CONTROL_MODE_LABELS: Record<ControlMode, string> = {
  manual: "Ручной",
  directive: "Директива",
  autopilot: "Автоконтур",
};

export const CONTROL_MODE_HINTS: Record<ControlMode, string> = {
  manual: "Полный контроль. Верхняя планка эффективности.",
  directive: "Список правил вместо нажатий. Около 85–92% ручного результата.",
  autopilot: "Самостоятельная ротация. 70–80% результата и повышенный расход.",
};

/** Множители цены режима: расходники, износ и доля упущенного урона. */
export const CONTROL_MODE_COST: Record<
  ControlMode,
  { consumableRate: number; wearRate: number; efficiency: number }
> = {
  manual: { consumableRate: 1, wearRate: 1, efficiency: 1 },
  directive: { consumableRate: 1, wearRate: 1, efficiency: 0.89 },
  autopilot: { consumableRate: 1.25, wearRate: 1.2, efficiency: 0.75 },
};

export const AUTOPILOT_TEMPER_LABELS: Record<AutopilotTemper, string> = {
  aggressive: "Агрессивный",
  economical: "Экономный",
  defensive: "Оборонительный",
};

export const DIRECTIVE_CONDITION_LABELS: Record<DirectiveCondition, string> = {
  hp_below: "ОЗ ниже",
  breath_below: "дыхание ниже",
  resource_above: "ресурс выше",
  target_staggered: "цель ошеломлена",
  target_shaken: "стойка цели сломана",
  target_unmarked: "цель без метки",
  enemies_within: "врагов вокруг не меньше",
  target_hp_below: "ОЗ цели ниже",
  incoming_heavy: "противник начал тяжёлую атаку",
  in_position: "герой в устойчивой позиции",
};

export const DIRECTIVE_ACTION_LABELS: Record<DirectiveAction, string> = {
  defensive_skill: "защитная способность",
  heavy_strike: "тяжёлый удар",
  area_strike: "удар по площади",
  mark_target: "метка",
  close_distance: "сблизиться",
  break_distance: "разорвать дистанцию",
  vent_heat: "сброс температуры",
  finisher: "добивание",
  retreat: "отступить",
  basic_attack: "обычная атака",
};

/** Условия, которым порог не нужен. */
const FLAG_CONDITIONS: DirectiveCondition[] = [
  "target_staggered",
  "target_shaken",
  "target_unmarked",
  "incoming_heavy",
  "in_position",
];

export function directiveNeedsThreshold(condition: DirectiveCondition): boolean {
  return !FLAG_CONDITIONS.includes(condition);
}

export function describeRule(rule: DirectiveRule): string {
  const condition = DIRECTIVE_CONDITION_LABELS[rule.condition];
  const action = DIRECTIVE_ACTION_LABELS[rule.action];
  if (!directiveNeedsThreshold(rule.condition)) return `если ${condition} → ${action}`;
  const threshold = rule.threshold ?? 0;
  const value = rule.condition === "enemies_within"
    ? `${Math.round(threshold)}`
    : `${Math.round(threshold * 100)}%`;
  return `если ${condition} ${value} → ${action}`;
}

export function matchesCondition(rule: DirectiveRule, snapshot: CombatSnapshot): boolean {
  const threshold = rule.threshold ?? 0;
  switch (rule.condition) {
    case "hp_below":
      return snapshot.hpShare < threshold;
    case "breath_below":
      return snapshot.breathShare < threshold;
    case "resource_above":
      return snapshot.resourceShare > threshold;
    case "target_hp_below":
      return snapshot.hasTarget && snapshot.targetHpShare < threshold;
    case "enemies_within":
      return snapshot.enemiesWithin >= threshold;
    case "target_staggered":
      return snapshot.hasTarget && snapshot.targetStaggered;
    case "target_shaken":
      return snapshot.hasTarget && snapshot.targetShaken;
    case "target_unmarked":
      return snapshot.hasTarget && !snapshot.targetMarked;
    case "incoming_heavy":
      return snapshot.incomingHeavy;
    case "in_position":
      return snapshot.inPosition;
    default:
      return false;
  }
}

/**
 * Список проверяется сверху вниз, срабатывает первое подходящее правило.
 * Порядок правил — единственный приоритет: игрок управляет им сам.
 */
export function evaluateDirectives(
  rules: DirectiveRule[],
  snapshot: CombatSnapshot,
): DirectiveRule | null {
  for (const rule of rules) {
    if (matchesCondition(rule, snapshot)) return rule;
  }
  return null;
}

/** Набор правил по умолчанию: рабочий, но не оптимальный. */
export const DEFAULT_DIRECTIVES: DirectiveRule[] = [
  { id: "guard", condition: "hp_below", threshold: 0.3, action: "defensive_skill" },
  { id: "punish", condition: "target_staggered", action: "heavy_strike" },
  { id: "crowd", condition: "enemies_within", threshold: 3, action: "area_strike" },
  { id: "mark", condition: "target_unmarked", action: "mark_target" },
  { id: "breathe", condition: "breath_below", threshold: 0.25, action: "retreat" },
];

export const MAX_DIRECTIVE_RULES = 8;

/**
 * Автоконтур: полностью самостоятельное решение без участия игрока.
 * Характер меняет пороги, но не отменяет осторожность.
 */
export function autopilotAction(
  snapshot: CombatSnapshot,
  temper: AutopilotTemper = "aggressive",
): DirectiveAction {
  const retreatAt = temper === "defensive" ? 0.45 : temper === "economical" ? 0.3 : 0.2;
  const breathFloor = temper === "economical" ? 0.35 : 0.2;

  // Начавшуюся тяжёлую атаку нельзя обогнать: сначала пережить, потом отступать.
  if (snapshot.incomingHeavy && temper !== "aggressive") return "defensive_skill";
  if (snapshot.hpShare < retreatAt) return "retreat";
  if ((snapshot.heatShare ?? 0) > 0.8) return "vent_heat";
  if (!snapshot.hasTarget) return "basic_attack";
  // Добивание только при полной безопасности — отсюда потери урона автоконтура.
  if (snapshot.targetStaggered && snapshot.enemiesWithin <= 1) return "finisher";
  if (snapshot.targetStaggered || snapshot.targetShaken) return "heavy_strike";
  if (snapshot.enemiesWithin >= 3) return "area_strike";
  if (snapshot.breathShare < breathFloor) return "basic_attack";
  if (!snapshot.targetMarked) return "mark_target";
  if (snapshot.targetDistance > 3.5) return "close_distance";
  return "basic_attack";
}

/** Решение режима: что герой делает сам в этот момент. */
export function decideAction(
  mode: ControlMode,
  snapshot: CombatSnapshot,
  options: { rules?: DirectiveRule[]; temper?: AutopilotTemper } = {},
): DirectiveAction | null {
  if (mode === "manual") return null;
  if (mode === "directive") {
    return evaluateDirectives(options.rules ?? DEFAULT_DIRECTIVES, snapshot)?.action ?? null;
  }
  return autopilotAction(snapshot, options.temper);
}

/** Расход расходника с учётом цены режима. */
export function consumableCost(mode: ControlMode, base = 1): number {
  return Math.max(base, Math.round(base * CONTROL_MODE_COST[mode].consumableRate));
}

/** Износ экипировки с учётом цены режима. */
export function wearCost(mode: ControlMode, base: number): number {
  return Math.round(base * CONTROL_MODE_COST[mode].wearRate);
}

/** Автоконтур не принимает решений, которые требуют осознанного риска. */
export function autopilotForbids(action: "enter_void" | "start_boss" | "leave_shelter"): boolean {
  return action === "enter_void" || action === "start_boss" || action === "leave_shelter";
}
