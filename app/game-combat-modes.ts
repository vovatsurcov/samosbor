// Два режима управления боем: ручной и автоконтур.
//
// Модуль чистый: он не знает про состояние мира, а работает со снимком боя.
// Обоснование и цены режимов — в docs/COMBAT_ARCHETYPES_V2.md §4.

export type ControlMode = "manual" | "autopilot";

export type AutopilotTemper = "aggressive" | "economical" | "defensive";

export type CombatAction =
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
  autopilot: "Автоконтур",
};

export const CONTROL_MODE_HINTS: Record<ControlMode, string> = {
  manual: "Полный контроль. Верхняя планка эффективности.",
  autopilot: "Самостоятельная ротация. 70–80% результата и повышенный расход.",
};

/** Множители цены режима: расходники, износ и доля упущенного урона. */
export const CONTROL_MODE_COST: Record<
  ControlMode,
  { consumableRate: number; wearRate: number; efficiency: number }
> = {
  manual: { consumableRate: 1, wearRate: 1, efficiency: 1 },
  autopilot: { consumableRate: 1.25, wearRate: 1.2, efficiency: 0.75 },
};

export const AUTOPILOT_TEMPER_LABELS: Record<AutopilotTemper, string> = {
  aggressive: "Агрессивный",
  economical: "Экономный",
  defensive: "Оборонительный",
};

export const COMBAT_ACTION_LABELS: Record<CombatAction, string> = {
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

export function autopilotAction(
  snapshot: CombatSnapshot,
  temper: AutopilotTemper = "aggressive",
): CombatAction {
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
  options: { temper?: AutopilotTemper } = {},
): CombatAction | null {
  if (mode === "manual") return null;
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
