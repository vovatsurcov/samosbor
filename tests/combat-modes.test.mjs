import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTROL_MODE_COST,
  DEFAULT_DIRECTIVES,
  MAX_DIRECTIVE_RULES,
  autopilotAction,
  autopilotForbids,
  consumableCost,
  decideAction,
  describeRule,
  directiveNeedsThreshold,
  evaluateDirectives,
  wearCost,
} from "../app/game-combat-modes.ts";

const calm = {
  hpShare: 1,
  breathShare: 1,
  resourceShare: 0,
  heatShare: 0,
  hasTarget: true,
  targetHpShare: 1,
  targetStaggered: false,
  targetShaken: false,
  targetMarked: true,
  targetDistance: 2,
  enemiesWithin: 1,
  incomingHeavy: false,
  inPosition: false,
};

test("ручной режим не принимает решений за игрока", () => {
  assert.equal(decideAction("manual", calm), null);
  assert.equal(decideAction("manual", { ...calm, hpShare: 0.05 }), null);
});

test("директива срабатывает сверху вниз: порядок правил и есть приоритет", () => {
  const rules = [
    { id: "a", condition: "hp_below", threshold: 0.3, action: "defensive_skill" },
    { id: "b", condition: "target_staggered", action: "heavy_strike" },
  ];
  const wounded = { ...calm, hpShare: 0.2, targetStaggered: true };
  assert.equal(evaluateDirectives(rules, wounded).id, "a");

  const reordered = [rules[1], rules[0]];
  assert.equal(evaluateDirectives(reordered, wounded).id, "b");
});

test("каждое условие набора проверяется по своему смыслу", () => {
  const cases = [
    [{ condition: "hp_below", threshold: 0.3 }, { hpShare: 0.29 }, { hpShare: 0.31 }],
    [{ condition: "breath_below", threshold: 0.25 }, { breathShare: 0.2 }, { breathShare: 0.4 }],
    [{ condition: "resource_above", threshold: 0.6 }, { resourceShare: 0.7 }, { resourceShare: 0.5 }],
    [{ condition: "target_hp_below", threshold: 0.2 }, { targetHpShare: 0.1 }, { targetHpShare: 0.5 }],
    [{ condition: "enemies_within", threshold: 3 }, { enemiesWithin: 4 }, { enemiesWithin: 2 }],
    [{ condition: "target_staggered" }, { targetStaggered: true }, { targetStaggered: false }],
    [{ condition: "target_shaken" }, { targetShaken: true }, { targetShaken: false }],
    [{ condition: "target_unmarked" }, { targetMarked: false }, { targetMarked: true }],
    [{ condition: "incoming_heavy" }, { incomingHeavy: true }, { incomingHeavy: false }],
    [{ condition: "in_position" }, { inPosition: true }, { inPosition: false }],
  ];
  for (const [rule, matching, missing] of cases) {
    const full = { id: rule.condition, action: "basic_attack", ...rule };
    assert.ok(evaluateDirectives([full], { ...calm, ...matching }), `${rule.condition}: должно сработать`);
    assert.equal(
      evaluateDirectives([full], { ...calm, ...missing }),
      null,
      `${rule.condition}: не должно срабатывать`,
    );
  }
});

test("условия без цели не срабатывают вхолостую", () => {
  const noTarget = { ...calm, hasTarget: false, targetStaggered: true, targetMarked: false };
  for (const condition of ["target_staggered", "target_shaken", "target_unmarked", "target_hp_below"]) {
    const rule = { id: condition, condition, threshold: 0.5, action: "heavy_strike" };
    assert.equal(evaluateDirectives([rule], noTarget), null, condition);
  }
});

test("правила читаются человеком", () => {
  assert.equal(
    describeRule({ id: "x", condition: "hp_below", threshold: 0.3, action: "defensive_skill" }),
    "если ОЗ ниже 30% → защитная способность",
  );
  assert.equal(
    describeRule({ id: "y", condition: "enemies_within", threshold: 3, action: "area_strike" }),
    "если врагов вокруг не меньше 3 → удар по площади",
  );
  assert.equal(
    describeRule({ id: "z", condition: "target_staggered", action: "heavy_strike" }),
    "если цель ошеломлена → тяжёлый удар",
  );
  assert.equal(directiveNeedsThreshold("target_staggered"), false);
  assert.equal(directiveNeedsThreshold("hp_below"), true);
});

test("набор по умолчанию покрывает защиту, наказание, толпу, метку и дыхание", () => {
  assert.ok(DEFAULT_DIRECTIVES.length <= MAX_DIRECTIVE_RULES);
  const actions = DEFAULT_DIRECTIVES.map((rule) => rule.action);
  for (const action of ["defensive_skill", "heavy_strike", "area_strike", "mark_target", "retreat"]) {
    assert.ok(actions.includes(action), action);
  }
  assert.equal(
    decideAction("directive", { ...calm, hpShare: 0.1 }),
    "defensive_skill",
    "раненый герой защищается прежде всего",
  );
  assert.equal(decideAction("directive", { ...calm, targetStaggered: true }), "heavy_strike");
  assert.equal(decideAction("directive", { ...calm, enemiesWithin: 5 }), "area_strike");
  assert.equal(decideAction("directive", { ...calm, targetMarked: false }), "mark_target");
});

test("автоконтур ведёт бой сам и бережёт героя раньше директивы", () => {
  assert.equal(autopilotAction({ ...calm, hpShare: 0.15 }), "retreat");
  assert.equal(autopilotAction({ ...calm, hpShare: 0.4, incomingHeavy: true }, "defensive"), "defensive_skill");
  assert.equal(autopilotAction({ ...calm, heatShare: 0.9 }), "vent_heat");
  assert.equal(autopilotAction({ ...calm, enemiesWithin: 4 }), "area_strike");
  assert.equal(autopilotAction({ ...calm, targetMarked: false }), "mark_target");
  assert.equal(autopilotAction({ ...calm, targetDistance: 6 }), "close_distance");
  assert.equal(autopilotAction(calm), "basic_attack");

  // Оборонительный характер отступает раньше агрессивного.
  assert.equal(autopilotAction({ ...calm, hpShare: 0.4 }, "defensive"), "retreat");
  assert.equal(autopilotAction({ ...calm, hpShare: 0.4 }, "aggressive"), "basic_attack");
});

test("автоконтур добивает только в полной безопасности и потому теряет урон", () => {
  assert.equal(autopilotAction({ ...calm, targetStaggered: true, enemiesWithin: 1 }), "finisher");
  assert.equal(
    autopilotAction({ ...calm, targetStaggered: true, enemiesWithin: 4 }),
    "heavy_strike",
    "в толпе автоконтур не рискует добиванием",
  );
});

test("режимы имеют разную цену и разный потолок эффективности", () => {
  assert.equal(CONTROL_MODE_COST.manual.efficiency, 1);
  assert.ok(CONTROL_MODE_COST.directive.efficiency < CONTROL_MODE_COST.manual.efficiency);
  assert.ok(CONTROL_MODE_COST.autopilot.efficiency < CONTROL_MODE_COST.directive.efficiency);
  assert.ok(CONTROL_MODE_COST.directive.efficiency >= 0.85);
  assert.ok(CONTROL_MODE_COST.autopilot.efficiency >= 0.7);

  assert.equal(consumableCost("manual", 1), 1);
  assert.equal(consumableCost("directive", 1), 1);
  assert.equal(consumableCost("autopilot", 4), 5);
  assert.equal(wearCost("manual", 10), 10);
  assert.equal(wearCost("autopilot", 10), 12);
});

test("автоконтур не принимает решений, требующих осознанного риска", () => {
  assert.equal(autopilotForbids("enter_void"), true);
  assert.equal(autopilotForbids("start_boss"), true);
  assert.equal(autopilotForbids("leave_shelter"), true);
});

test("режим встроен в игру: ручной отключает автокаст, автоконтур дороже по износу", async () => {
  const {
    combatSnapshot,
    controlModeFor,
    createInitialState,
    currentModeAction,
    modeWearCost,
    setControlMode,
    setDirectives,
  } = await import("../app/game-engine.ts");

  const state = createInitialState();
  assert.equal(controlModeFor(state), "directive", "по умолчанию игра ведётся директивой");

  const snapshot = combatSnapshot(state);
  assert.ok(snapshot.hpShare > 0 && snapshot.hpShare <= 1);
  assert.equal(typeof snapshot.enemiesWithin, "number");
  assert.equal(snapshot.hasTarget, false, "в начале боя цели нет");

  // Ручной режим не решает за игрока.
  const manual = setControlMode(state, "manual");
  assert.equal(controlModeFor(manual), "manual");
  assert.equal(currentModeAction(manual), null);
  assert.ok(manual.log.some((line) => /Режим управления: ручной/i.test(line)));

  // Директива со сработавшим правилом выдаёт действие.
  const wounded = { ...state, hero: { ...state.hero, hp: 1 } };
  assert.equal(currentModeAction(wounded), "defensive_skill");

  // Пустой список правил не ломает режим.
  assert.equal(currentModeAction(setDirectives(wounded, [])), null);

  // Автоконтур платит износом.
  const autopilot = setControlMode(state, "autopilot");
  assert.ok(modeWearCost(autopilot, 10) > modeWearCost(manual, 10));
});
