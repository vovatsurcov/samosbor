import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTROL_MODE_COST,
  autopilotAction,
  autopilotForbids,
  consumableCost,
  decideAction,
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

test("автоконтур ведёт бой сам и бережёт героя раньше ручного боя", () => {
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
  assert.ok(CONTROL_MODE_COST.autopilot.efficiency < CONTROL_MODE_COST.manual.efficiency);
  assert.ok(CONTROL_MODE_COST.autopilot.efficiency >= 0.7);

  assert.equal(consumableCost("manual", 1), 1);
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
  } = await import("../app/game-engine.ts");

  const state = createInitialState();
  assert.equal(controlModeFor(state), "manual", "по умолчанию игрок ведёт бой сам");

  const snapshot = combatSnapshot(state);
  assert.ok(snapshot.hpShare > 0 && snapshot.hpShare <= 1);
  assert.equal(typeof snapshot.enemiesWithin, "number");
  assert.equal(snapshot.hasTarget, false, "в начале боя цели нет");

  // Ручной режим не решает за игрока.
  const manual = setControlMode(setControlMode(state, "autopilot"), "manual");
  assert.equal(controlModeFor(manual), "manual");
  assert.equal(currentModeAction(manual), null);
  assert.ok(manual.log.some((line) => /Режим управления: ручной/i.test(line)));

  // Автоконтур сам выбирает защиту на низком здоровье.
  const wounded = setControlMode({ ...state, hero: { ...state.hero, hp: 1 } }, "autopilot");
  assert.equal(currentModeAction(wounded), "retreat");

  // Автоконтур платит износом.
  const autopilot = setControlMode(state, "autopilot");
  assert.ok(modeWearCost(autopilot, 10) > modeWearCost(manual, 10));
});
