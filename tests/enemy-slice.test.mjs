import test from "node:test";
import assert from "node:assert/strict";

import {
  ENCOUNTERS,
  ENEMY_DEFINITIONS,
  ROLE_READING,
  definitionById,
  encounterById,
} from "../app/game-enemy-roster.ts";

import {
  applyDevProfile,
  commandHeavyAttack,
  createInitialState,
  devProfileById,
  enemyFromDefinition,
  spawnEncounter,
  tickGame,
} from "../app/game-engine.ts";

function field(state, encounterId = "pack:pressure-line") {
  const placed = {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { x: 10, y: 9 } }, path: [] },
  };
  return spawnEncounter(placed, encounterId, { x: 14, y: 9 });
}

test("роли покрывают разные игровые функции и читаются словами", () => {
  const roles = new Set(Object.values(ENEMY_DEFINITIONS).map((definition) => definition.role));
  assert.ok(roles.size >= 5, "нужен набор ролей, а не один тип с разными числами");
  for (const role of roles) {
    assert.ok(ROLE_READING[role].length > 0, `${role}: не сказано, как роль читается`);
  }
  for (const definition of Object.values(ENEMY_DEFINITIONS)) {
    assert.ok(definition.origin.length > 20, `${definition.id}: не сказано, чем это было и почему здесь`);
    assert.ok(definition.stateAffinity.length > 0, `${definition.id}: не сказано, как на нём работают состояния`);
  }
});

test("иерархия живучести: слабые умирают быстро, минибосс держит бой", () => {
  const swarm = ENEMY_DEFINITIONS["shift-runner"];
  const heavy = ENEMY_DEFINITIONS["loading-frame"];
  const elite = ENEMY_DEFINITIONS["senior-shift"];
  const miniboss = ENEMY_DEFINITIONS["line-adjuster"];

  assert.ok(swarm.hp < heavy.hp / 3, "напор гибнет быстро");
  assert.ok(heavy.hp < elite.hp, "элита живёт дольше обычного тяжёлого");
  assert.ok(elite.hp < miniboss.hp, "минибосс даёт сборке раскрыться несколько раз");
  // Плотность боя не должна держаться только на здоровье.
  assert.ok(swarm.speed > heavy.speed * 2, "разница между ролями не только в живучести");
  assert.ok(heavy.armor > swarm.armor * 10);
});

test("обычный поток остаётся быстрым: опасное действие есть не у всех", () => {
  const withDanger = Object.values(ENEMY_DEFINITIONS).filter((d) => d.dangerousAction);
  const without = Object.values(ENEMY_DEFINITIONS).filter((d) => !d.dangerousAction);
  assert.ok(without.length > 0, "у части противников телеграфов нет вовсе");
  assert.ok(withDanger.length > 0, "опасные действия существуют");
  assert.equal(ENEMY_DEFINITIONS["shift-runner"].dangerousAction, false, "напор не тормозит бой телеграфами");
  assert.equal(ENEMY_DEFINITIONS["line-adjuster"].dangerousAction, true, "минибосс читается");
});

test("составы групп описаны данными и ставят разные вопросы", () => {
  assert.ok(ENCOUNTERS.length >= 4, "нужно несколько разных составов");
  const questions = new Set(ENCOUNTERS.map((encounter) => encounter.question));
  assert.equal(questions.size, ENCOUNTERS.length, "каждый состав ставит свой вопрос");
  for (const encounter of ENCOUNTERS) {
    assert.ok(encounter.members.length > 0);
    for (const member of encounter.members) {
      assert.ok(definitionById(member.defId), `${encounter.id}: неизвестный противник ${member.defId}`);
    }
  }
  // Есть смешанные составы, а не только «пачка одинаковых».
  const mixed = ENCOUNTERS.filter((encounter) => encounter.members.length > 1);
  assert.ok(mixed.length >= 3, "состав должен менять приоритет цели");
});

test("встреча высаживается из описания без правок движка", () => {
  const state = field(createInitialState(), "pack:senior");
  const spawned = state.enemies.filter((enemy) => enemy.id.startsWith("enc-"));
  const encounter = encounterById("pack:senior");
  const expected = encounter.members.reduce((sum, member) => sum + member.count, 0);

  assert.equal(spawned.length, expected, "высажен весь состав");
  assert.ok(spawned.some((enemy) => enemy.role === "heavy"), "элита на месте");
  assert.ok(spawned.some((enemy) => enemy.role === "swarm"), "и обычная группа вокруг");
  assert.ok(state.log.some((line) => /Встреча:/.test(line)), "состав объявлен игроку");
  // Роли доехали до боевого состояния: силуэт и поведение их знают.
  for (const enemy of spawned) assert.ok(enemy.role, "у противника есть роль");
});

test("новый противник добавляется описанием, а не правкой ядра", () => {
  const invented = {
    id: "test-thing",
    name: "Испытательный образец",
    role: "anomalous",
    kind: "stalker",
    origin: "Собран для проверки: движок не должен знать про конкретных существ.",
    hp: 70, damage: 10, armor: 3, stance: 30,
    speed: 1.1, attackRange: 2, visionRadius: 4, aggroRadius: 3,
    attackCooldownBaseMs: 1200, xpValue: 10,
    dangerousAction: true,
    stateAffinity: "проверочный",
    rank: "common",
  };
  const enemy = enemyFromDefinition(invented, "test-1", "floor556", { x: 12, y: 9 });
  assert.equal(enemy.role, "anomalous");
  assert.equal(enemy.dangerous, true);
  assert.ok(enemy.hp > 0 && enemy.maxHp === enemy.hp);
});

test("помеха делает остальных опаснее, пока жива", () => {
  let state = field(createInitialState(), "pack:alarm");
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id.startsWith("enc-")
        ? { ...enemy, mode: "combat", attackCooldownMs: 1500, thinkCooldownMs: 999999 }
        : enemy),
  };
  const before = state.enemies.filter((e) => e.id.startsWith("enc-") && e.role !== "controller");
  const ticked = tickGame(state, 100);
  const after = ticked.enemies.filter((e) => e.id.startsWith("enc-") && e.role !== "controller");

  const sped = after.some((enemy, index) => enemy.attackCooldownMs < before[index].attackCooldownMs - 100);
  assert.ok(sped, "рядом с диспетчером остальные бьют чаще — его убирают первым");
});

test("все шесть направлений способны воевать против составов", () => {
  for (const profile of ["pure-surge", "pure-aim", "pure-footing", "pure-tempo", "pure-heat", "pure-resonance"]) {
    let state = field(applyDevProfile(createInitialState(), devProfileById(profile)), "pack:anvil");
    const heavy = state.enemies.find((enemy) => enemy.role === "heavy");
    assert.ok(heavy, `${profile}: тяжёлый на месте`);

    // Цель выбирается явно: иначе удар уходит в ближайшего из напора.
    state = {
      ...state,
      hero: {
        ...state.hero,
        positions: { ...state.hero.positions, [state.zone]: { x: heavy.position.x - 1, y: heavy.position.y } },
        attackTargetId: heavy.id,
      },
      enemies: state.enemies.map((enemy) =>
        enemy.id === heavy.id ? { ...enemy, attackCooldownMs: 999999, thinkCooldownMs: 999999 } : enemy),
    };
    const after = commandHeavyAttack(state);
    const damaged = after.enemies.find((enemy) => enemy.id === heavy.id);
    assert.ok(damaged.hp < heavy.hp, `${profile}: не может повредить тяжёлого — это был бы build lock`);
  }
});

test("состояния и стойка продолжают работать на минибоссе", () => {
  const state = field(createInitialState(), "pack:adjuster");
  const boss = state.enemies.find((enemy) => enemy.id.startsWith("enc-"));
  assert.equal(boss.rank, "boss");
  assert.ok(boss.maxStance > 100, "стойка минибосса работает, а не отключена");

  const primed = {
    ...state,
    hero: { ...state.hero, positions: { ...state.hero.positions, [state.zone]: { x: boss.position.x - 1, y: boss.position.y } } },
    enemies: state.enemies.map((enemy) =>
      enemy.id === boss.id
        ? { ...enemy, resonanceStacks: 3, attackCooldownMs: 999999, thinkCooldownMs: 999999 }
        : enemy),
  };
  const after = commandHeavyAttack(primed);
  assert.ok(after.log.some((line) => /Резонанс сорван/i.test(line)), "состояния на боссе не выключены");
});
