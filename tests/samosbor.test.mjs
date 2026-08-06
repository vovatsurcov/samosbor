import test from "node:test";
import assert from "node:assert/strict";

import {
  SAMOSBOR_GRACE_MS,
  SAMOSBOR_PHASE_PROFILES,
  SAMOSBOR_ZONE_PROFILES,
  isSamosborWarningPhase,
  nextSamosborPhase,
  samosborExposureHits,
  samosborPhaseDurationMs,
  samosborProfileFor,
  samosborQuietDurationMs,
} from "../app/game-samosbor.ts";
import {
  commandInteractAt,
  createInitialState,
  isSamosborActiveIn,
  isSamosborProtectedAt,
  mapForZone,
  migrateGameState,
  objectiveFor,
  samosborEventIn,
  samosborHighlightsShelters,
  samosborPhaseIn,
  tickGame,
} from "../app/game-engine.ts";

function findTile(map, tile) {
  const points = [];
  map.rows.forEach((row, y) => {
    [...row].forEach((value, x) => {
      if (value === tile) points.push({ x, y });
    });
  });
  return points;
}

function placeHero(state, zone, point) {
  return {
    ...state,
    zone,
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, [zone]: { ...point } },
      path: [],
      destination: null,
      attackTargetId: null,
      pendingInteraction: null,
    },
  };
}

/** Ставит этаж в заданную фазу, не дожидаясь мирового расписания. */
function forcePhase(state, zone, phase, durationMs = 60000) {
  return {
    ...state,
    samosbor: {
      ...state.samosbor,
      zones: {
        ...state.samosbor.zones,
        [zone]: {
          ...samosborEventIn(state, zone),
          phase,
          phaseEndsAtMs: state.worldTimeMs + durationMs,
        },
      },
    },
  };
}

function tickFor(state, totalMs, stepMs = 100) {
  let next = state;
  for (let elapsed = 0; elapsed < totalMs; elapsed += stepMs) next = tickGame(next, stepMs);
  return next;
}

test("цикл события повторяет утверждённые пять фаз и длительности", () => {
  assert.equal(nextSamosborPhase("calm"), "omen");
  assert.equal(nextSamosborPhase("omen"), "siren");
  assert.equal(nextSamosborPhase("siren"), "active");
  assert.equal(nextSamosborPhase("active"), "fade");
  assert.equal(nextSamosborPhase("fade"), "calm");

  assert.deepEqual(
    [SAMOSBOR_PHASE_PROFILES.omen.minMs, SAMOSBOR_PHASE_PROFILES.omen.maxMs],
    [30000, 90000],
  );
  assert.deepEqual(
    [SAMOSBOR_PHASE_PROFILES.siren.minMs, SAMOSBOR_PHASE_PROFILES.siren.maxMs],
    [20000, 35000],
  );
  assert.deepEqual(
    [SAMOSBOR_PHASE_PROFILES.active.minMs, SAMOSBOR_PHASE_PROFILES.active.maxMs],
    [60000, 300000],
  );
  assert.deepEqual(
    [SAMOSBOR_PHASE_PROFILES.fade.minMs, SAMOSBOR_PHASE_PROFILES.fade.maxMs],
    [20000, 60000],
  );

  const profile = samosborProfileFor("floor549");
  for (const phase of ["omen", "siren", "active", "fade"]) {
    for (const roll of [0, 37, 99]) {
      const duration = samosborPhaseDurationMs(phase, profile, roll);
      assert.ok(duration >= SAMOSBOR_PHASE_PROFILES[phase].minMs, `${phase}: нижняя граница`);
      assert.ok(duration <= SAMOSBOR_PHASE_PROFILES[phase].maxMs, `${phase}: верхняя граница`);
    }
  }
  assert.ok(samosborQuietDurationMs(profile, 0) >= profile.quietMinMs);
  assert.ok(samosborQuietDurationMs(profile, 99) <= profile.quietMaxMs);
});

test("города, поселение и войд-зона не запускают событие, а опасные этажи запланированы", () => {
  const state = createInitialState();
  for (const zone of ["floor554", "floor545", "voidLab"]) {
    assert.equal(SAMOSBOR_ZONE_PROFILES[zone].sheltered, true, zone);
    assert.equal(samosborEventIn(state, zone).phaseEndsAtMs, 0, zone);
    assert.equal(samosborPhaseIn(state, zone), "calm", zone);
  }
  for (const zone of ["floor550", "floor549", "floor548", "floor547", "floor546", "floor555", "floor557"]) {
    assert.equal(samosborProfileFor(zone).sheltered, false, zone);
    assert.ok(samosborEventIn(state, zone).phaseEndsAtMs > 0, `${zone}: событие не запланировано`);
  }
  // Тяжесть растёт с глубиной промышленного пояса.
  assert.ok(samosborProfileFor("floor547").severity > samosborProfileFor("floor556").severity);
});

test("первый Самосбор этажа 556 запускается датчиком СБ-04, а не таймером", () => {
  const initial = createInitialState();
  assert.equal(samosborEventIn(initial, "floor556").scripted, true);
  assert.equal(samosborEventIn(initial, "floor556").phaseEndsAtMs, 0);

  const sensor = findTile(mapForZone("floor556"), "S")[0];
  const repaired = commandInteractAt(placeHero(initial, "floor556", sensor), sensor);
  assert.equal(repaired.sensorFixed, true);
  assert.ok(samosborEventIn(repaired, "floor556").phaseEndsAtMs > repaired.worldTimeMs);

  const warned = tickFor(repaired, 6000);
  assert.equal(samosborPhaseIn(warned, "floor556"), "omen");
  assert.ok(warned.log.some((line) => /предвестники Самосбора/i.test(line)));
  assert.ok(isSamosborWarningPhase(samosborPhaseIn(warned, "floor556")));
  assert.match(objectiveFor(warned), /гермодвери/i);
});

test("сирена подсвечивает укрытия, активная фаза меняет директиву", () => {
  const state = createInitialState();
  assert.equal(samosborHighlightsShelters(state, "floor556"), false);
  assert.equal(samosborHighlightsShelters(forcePhase(state, "floor556", "siren"), "floor556"), true);

  const active = forcePhase(state, "floor556", "active");
  assert.equal(samosborHighlightsShelters(active, "floor556"), true);
  assert.equal(isSamosborActiveIn(active, "floor556"), true);
  assert.match(objectiveFor(active), /Немедленно уйти за гермодверь/i);

  const map = mapForZone("floor556");
  const shelter = findTile(map, "g")[0];
  const sheltered = placeHero(active, "floor556", shelter);
  assert.match(objectiveFor(sheltered), /Переждать активную фазу/i);
});

test("гермокомната полностью защищает от активной фазы и рассасывает экспозицию", () => {
  const map = mapForZone("floor556");
  const shelter = findTile(map, "g")[0];
  const state = placeHero(forcePhase(createInitialState(), "floor556", "active", 120000), "floor556", shelter);
  const hp = state.hero.hp;
  const contamination = state.hero.contamination;

  const survived = tickFor(state, 30000);
  assert.ok(survived.hero.hp >= hp, "здоровье внутри контура не падает, а восстанавливается");
  assert.ok(survived.hero.contamination <= contamination, "заражение внутри контура не растёт");
  assert.equal(survived.samosbor.exposureMs, 0);
  assert.equal(survived.samosbor.caughtCount, 0);
  assert.equal(samosborPhaseIn(survived, "floor556"), "active");
});

test("открытое пространство даёт короткое окно, а затем разбирает героя", () => {
  assert.equal(samosborExposureHits(SAMOSBOR_GRACE_MS, 1), 0);
  assert.ok(samosborExposureHits(SAMOSBOR_GRACE_MS + 4000, 1) > 0);
  assert.ok(
    samosborExposureHits(SAMOSBOR_GRACE_MS + 10000, 1.2) >
      samosborExposureHits(SAMOSBOR_GRACE_MS + 10000, 0.7),
    "тяжёлый этаж снимает здоровье быстрее",
  );

  const state = forcePhase(createInitialState(), "floor556", "active", 300000);
  const grace = tickFor(state, SAMOSBOR_GRACE_MS - 1000);
  assert.equal(grace.hero.hp, state.hero.hp, "льготное окно позволяет добежать до двери");

  const exposed = tickFor(grace, 6000);
  assert.ok(exposed.hero.hp < state.hero.hp, "вне контура здоровье падает");
  assert.ok(exposed.hero.contamination > state.hero.contamination, "заражение растёт");
  assert.ok(exposed.hero.stress > state.hero.stress, "стресс растёт");
});

test("прямой контакт с Самосбором прерывает смену и стоит дороже обычной эвакуации", () => {
  const state = forcePhase(createInitialState(), "floor556", "active", 300000);
  const caught = tickFor(state, 60000);

  assert.equal(caught.samosbor.caughtCount, 1);
  assert.ok(caught.log.some((line) => /Прямой контакт с Самосбором/i.test(line)));
  assert.equal(caught.injuries.head, 1, "тяжёлая травма головы");
  assert.ok(caught.hero.contamination >= 30, "заражение после контакта");
  assert.ok(caught.hero.hp > 0, "аварийная группа вытащила героя");
  assert.equal(caught.samosbor.exposureMs, 0);
  assert.equal(
    isSamosborProtectedAt(caught, caught.zone, caught.hero.positions[caught.zone]),
    true,
    "эвакуация выводит в защищённый контур, а не обратно под активную фазу",
  );
});

test("в активной фазе существа прячутся, а популяции не проявляются", () => {
  const state = forcePhase(createInitialState(), "floor556", "active", 300000);
  const hidden = tickFor(state, 6000);

  assert.equal(
    hidden.enemies.filter((enemy) => enemy.zone === "floor556" && enemy.hp > 0 && enemy.mode === "combat").length,
    0,
    "во время события бой не ведётся",
  );
  assert.equal(
    hidden.enemies.filter((enemy) => enemy.zone === "floor556" && enemy.hp > 0 && enemy.populationId).length,
    0,
    "физические проявления популяций уходят с этажа",
  );
  assert.equal(hidden.hero.attackTargetId, null);
});

test("затухание закрывает событие, повышает тревогу популяций и планирует следующее", () => {
  const state = forcePhase(createInitialState(), "floor557", "fade", 1000);
  const before = state.populations.filter((population) => population.zone === "floor557");
  assert.ok(before.length > 0);

  const finished = tickFor(state, 2000);
  assert.equal(samosborPhaseIn(finished, "floor557"), "calm");
  assert.equal(samosborEventIn(finished, "floor557").completed, 1);
  assert.equal(finished.samosbor.lastCompletedZone, "floor557");
  assert.ok(
    samosborEventIn(finished, "floor557").phaseEndsAtMs >= finished.worldTimeMs + samosborProfileFor("floor557").quietMinMs,
    "следующее событие запланировано с длинной паузой",
  );
  for (const population of before) {
    const after = finished.populations.find((entry) => entry.id === population.id);
    assert.ok(after.agitation >= population.agitation, `${population.id}: тревога после события`);
  }
});

test("миграция сохранения восстанавливает расписание и не переносит событие в защищённый контур", () => {
  const migrated = migrateGameState({});
  assert.ok(migrated.samosbor);
  assert.equal(migrated.samosbor.exposureMs, 0);
  assert.ok(samosborEventIn(migrated, "floor549").phaseEndsAtMs > 0);
  assert.equal(samosborEventIn(migrated, "floor554").phaseEndsAtMs, 0);

  const restored = migrateGameState({
    samosbor: {
      zones: {
        floor549: { phase: "siren", phaseEndsAtMs: 12000, severity: 9, scripted: false, completed: 2 },
        floor554: { phase: "active", phaseEndsAtMs: 99000, severity: 9, scripted: false, completed: 5 },
      },
      exposureMs: 4000,
      exposureHits: 1,
      caughtCount: 2,
      lastCompletedZone: "floor549",
      lastCompletedAtMs: 8000,
    },
  });
  assert.equal(samosborPhaseIn(restored, "floor549"), "siren");
  assert.equal(samosborEventIn(restored, "floor549").completed, 2);
  assert.equal(
    samosborEventIn(restored, "floor549").severity,
    samosborProfileFor("floor549").severity,
    "тяжесть берётся из каталога, а не из сохранения",
  );
  assert.equal(restored.samosbor.caughtCount, 2);
  assert.equal(samosborPhaseIn(restored, "floor554"), "calm", "город не наследует событие");
});
