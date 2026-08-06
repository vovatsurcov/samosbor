import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIVE_SKILLS,
  activateSkillSlot,
  allocateAttribute,
  awardXp,
  activateEquippedArtifact,
  allocateTalent,
  allocateSkill,
  applyTrainingBuild,
  applyFirstAid,
  BASE_TALENT_COUNT,
  branchTalentPoints,
  canAllocateTalent,
  carryCapacity,
  commandAttack,
  commandMove,
  createInitialState,
  effectiveInjury,
  equipItem,
  equipWeapon,
  FLOOR_555_MAP,
  FLOOR_MAP,
  FLOOR_557_MAP,
  hasLineOfSight,
  heroAttackRange,
  heroDefense,
  heroMoveSpeed,
  interact,
  inventoryWeight,
  MAX_HERO_LEVEL,
  populationPressureForZone,
  populationsForZone,
  tickGame,
  TALENT_NODES,
  VOID_MAP,
  WEAPONS,
  xpRequiredForLevel,
} from "../app/game-engine.ts";

function heroAt(state, point) {
  return {
    ...state,
    hero: {
      ...state.hero,
      positions: {
        ...state.hero.positions,
        [state.zone]: { ...point },
      },
      path: [],
      destination: null,
    },
  };
}

test("карты прямоугольные, а базовое и легендарное оружие задают разные дистанции боя", () => {
  assert.equal(new Set(FLOOR_555_MAP.rows.map((row) => row.length)).size, 1);
  assert.equal(new Set(FLOOR_MAP.rows.map((row) => row.length)).size, 1);
  assert.equal(new Set(FLOOR_557_MAP.rows.map((row) => row.length)).size, 1);
  assert.equal(new Set(VOID_MAP.rows.map((row) => row.length)).size, 1);

  const ranges = Object.values(WEAPONS).map((weapon) => weapon.range);
  assert.ok(new Set(ranges).size >= 4);
  assert.ok(WEAPONS.shockBaton.range < WEAPONS.servicePistol.range);
  assert.ok(WEAPONS.servicePistol.range < WEAPONS.coilRifle.range);
});


test("переходы вверх и вниз связывают этажи и сохраняют позиции", () => {
  let state = heroAt(createInitialState(), { x: 32, y: 2 });
  state = interact(state);
  assert.equal(state.zone, "floor555");
  assert.deepEqual(state.hero.positions.floor555, { x: 32, y: 2 });

  state = interact(state);
  assert.equal(state.zone, "floor556");
  assert.deepEqual(state.hero.positions.floor556, { x: 32, y: 2 });

  state = heroAt(state, { x: 2, y: 2 });
  state = interact(state);
  assert.equal(state.zone, "floor557");
  assert.deepEqual(state.hero.positions.floor557, { x: 32, y: 2 });

  state = interact(state);
  assert.equal(state.zone, "floor556");
  assert.deepEqual(state.hero.positions.floor556, { x: 2, y: 2 });
});



test("переходы и войд-зоны требуют взаимодействия", () => {
  let state = heroAt(createInitialState(), { x: 32, y: 2 });
  state = tickGame(state, 500);
  assert.equal(state.zone, "floor556");
  state = interact(state);
  assert.equal(state.zone, "floor555");

  state = {
    ...state,
    zone: "voidLab",
    hero: {
      ...state.hero,
      positions: { ...state.hero.positions, voidLab: { x: 1, y: 1 } },
    },
  };
  const exited = interact(state);
  assert.notEqual(exited.zone, "voidLab");
  assert.match(exited.log[0], /обратный маршрут исчез/);
});

test("на стартовом этаже есть NPC и четыре учебные группы", () => {
  const state = createInitialState();
  const starters = state.enemies.filter((enemy) => enemy.zone === "floor556" && !enemy.populationId);
  assert.equal(starters.length, 8);
  const withNpc = heroAt(state, { x: 4, y: 18 });
  const spoken = interact(withNpc);
  assert.match(spoken.log[0], /Диспетчер Орлова/);
});
test("стена перекрывает линию видимости, а открывшийся переход её восстанавливает", () => {
  const state = createInitialState();
  const from = { x: 3, y: 3 };
  const to = { x: 5, y: 3 };
  assert.equal(hasLineOfSight(state, from, to), true);
  assert.equal(hasLineOfSight({ ...state, mutated: true }, from, to), false);
});

test("герой движется непрерывно, а не перескакивает на клетку за ход", () => {
  const state = createInitialState();
  const routed = commandMove(state, { x: 5, y: 18 });
  assert.ok(routed.hero.path.length > 0);

  let moving = tickGame(routed, 50);
  assert.ok(moving.hero.positions.floor556.x > 3);
  assert.ok(moving.hero.positions.floor556.x < 4);
  assert.equal(moving.worldTimeMs, 50);

  for (let frame = 0; frame < 20; frame += 1) moving = tickGame(moving, 50);
  assert.deepEqual(moving.hero.positions.floor556, { x: 5, y: 18 });
  assert.equal(moving.hero.path.length, 0);
});

test("выбранная цель получает выстрел по кулдауну без завершения хода", () => {
  const state = heroAt(createInitialState(), { x: 9, y: 4 });
  const targeted = commandAttack(state, "guard-kl4");
  assert.equal(targeted.hero.attackTargetId, "guard-kl4");

  const fighting = tickGame(targeted, 100);
  const guard = fighting.enemies.find((enemy) => enemy.id === "guard-kl4");
  assert.ok(guard.hp < guard.maxHp);
  assert.ok(fighting.hero.attackCooldownMs > 0);
  assert.match(fighting.log[0], /d20 9/);
});

test("противник готовит атаку в реальном времени, после чего наносит травму", () => {
  const state = heroAt(createInitialState(), { x: 9, y: 4 });
  const threatened = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? {
            ...enemy,
            position: { x: 10, y: 4 },
            accuracy: 100,
            damage: 20,
            attackCooldownMs: 0,
            thinkCooldownMs: 0,
          }
        : enemy,
    ),
  };

  let rescued = threatened;
  for (let frame = 0; frame < 8; frame += 1) rescued = tickGame(rescued, 100);
  assert.equal(rescued.rescueCount, 1);
  assert.equal(rescued.injuries.leg, 1);
  assert.deepEqual(rescued.hero.positions.floor556, { x: 3, y: 18 });
  assert.match(rescued.log[0], /травма ноги/);
});

test("смена экипировки немедленно меняет рабочую дальность", () => {
  const state = createInitialState();
  const melee = equipWeapon(state, "shockBaton");
  const withRifle = {
    ...melee,
    hero: {
      ...melee.hero,
      itemCounter: melee.hero.itemCounter + 1,
      inventory: [
        ...melee.hero.inventory,
        { instanceId: "test-rifle", itemId: "coilRifle", quantity: 1, condition: 64 },
      ],
    },
  };
  const rifle = equipWeapon(withRifle, "coilRifle");

  assert.equal(heroAttackRange(melee), WEAPONS.shockBaton.range);
  assert.equal(heroAttackRange(rifle), WEAPONS.coilRifle.range);
  assert.ok(heroAttackRange(rifle) > heroAttackRange(melee));
});

test("инженерная ветвь открывает рембота и активные протоколы по порогам", () => {
  const initial = createInitialState();
  const state = { ...initial, hero: { ...initial.hero, skillPoints: 18 } };
  const firstRank = allocateSkill(state, "engineer");
  const secondRank = allocateSkill(firstRank, "engineer");

  assert.equal(secondRank.hero.skillPoints, 16);
  assert.equal(secondRank.hero.skills.engineer, 2);
  assert.equal(branchTalentPoints(secondRank, "engineer"), 2);
  assert.ok(Object.values(ACTIVE_SKILLS).some((skill) => skill.branch === "engineer" && skill.unlockAt === 1));
});


test("фоновые популяции живут вне текущего этажа и мигрируют по своему ритму", () => {
  let state = createInitialState();
  const initialPressure = populationPressureForZone(state, "floor557");
  const initialPilgrims = state.populations.find((population) => population.id === "elevator-pilgrims");
  assert.equal(initialPilgrims.zone, "floor557");

  for (let frame = 0; frame < 200; frame += 1) state = tickGame(state, 100);

  const pilgrims = state.populations.find((population) => population.id === "elevator-pilgrims");
  assert.equal(state.zone, "floor556");
  assert.equal(pilgrims.zone, "floor556");
  assert.ok(populationPressureForZone(state, "floor557") !== initialPressure);
  assert.ok(populationsForZone(state, "floor556").some((population) => population.id === "elevator-pilgrims"));
  assert.match(state.log[0], /Паломники лифтового ритма/);
});

test("популяции проявляются физическими противниками и теряют численность от убийств", () => {
  let state = createInitialState();
  const representative = state.enemies.find(
    (enemy) => enemy.zone === state.zone && enemy.populationId && enemy.hp > 0,
  );
  assert.ok(representative);
  const populationBefore = state.populations.find((population) => population.id === representative.populationId);
  assert.ok(populationBefore);

  state = heroAt(state, { x: Math.max(1, representative.position.x - 1), y: representative.position.y });
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === representative.id
        ? { ...enemy, hp: 1, armor: -10, attackCooldownMs: 99999 }
        : enemy,
    ),
  };
  state = tickGame(commandAttack(state, representative.id), 100);

  const populationAfter = state.populations.find((population) => population.id === representative.populationId);
  assert.equal(populationAfter.count, populationBefore.count - 1);
  assert.ok(populationAfter.agitation > populationBefore.agitation);
  assert.match(state.log.join("\n"), /численность снижена/);
});

test("перестройка этажа происходит по таймеру мира", () => {
  const state = { ...createInitialState(), worldTimeMs: 14950 };
  const mutated = tickGame(state, 100);

  assert.equal(mutated.mutated, true);
  assert.match(mutated.log[0], /Топология этажа изменилась/);
});

test("экипировка, вес и состояние предметов участвуют в характеристиках", () => {
  const state = createInitialState();
  assert.ok(inventoryWeight(state) < carryCapacity(state));
  const withVest = {
    ...state,
    hero: {
      ...state.hero,
      itemCounter: state.hero.itemCounter + 1,
      inventory: [
        ...state.hero.inventory,
        { instanceId: "test-vest", itemId: "platedVestBn3", quantity: 1, condition: 72 },
      ],
    },
  };
  const armored = equipItem(withVest, "test-vest");

  assert.equal(armored.hero.equipment.body, "test-vest");
  assert.ok(heroDefense(armored) > heroDefense(state));
  assert.ok(heroMoveSpeed(armored) < heroMoveSpeed(state));
});

test("аварийный шкаф выдаёт добычу и запоминает открытие", () => {
  const state = heroAt(createInitialState(), { x: 17, y: 8 });
  const looted = interact(state);

  assert.ok(looted.openedContainers.includes("floor556:17:8"));
  assert.ok(looted.hero.inventory.some((entry) => entry.itemId === "keyWithoutDoor"));
  assert.ok(looted.hero.inventory.some((entry) => entry.itemId === "repairKit"));
  assert.equal(looted.hero.inventory.find((entry) => entry.itemId === "bandage")?.quantity, 3);

  const repeated = interact(looted);
  assert.match(repeated.log[0], /уже пуст/);
});

test("перевязка временно ослабляет травму и расходует пакет", () => {
  const state = {
    ...createInitialState(),
    injuries: { ...createInitialState().injuries, leg: 1 },
    hero: { ...createInitialState().hero, hp: 5 },
  };
  const before = state.hero.inventory.find((entry) => entry.itemId === "bandage")?.quantity;
  const treated = applyFirstAid(state);

  assert.equal(effectiveInjury(treated, "leg"), 0);
  assert.equal(treated.hero.relievedInjury, "leg");
  assert.equal(treated.hero.inventory.find((entry) => entry.itemId === "bandage")?.quantity, before - 1);
  assert.ok(treated.hero.hp > state.hero.hp);
});

test("Ключ без двери открывает проход ценой заражения", () => {
  const state = heroAt(createInitialState(), { x: 17, y: 8 });
  const looted = interact(state);
  const key = looted.hero.inventory.find((entry) => entry.itemId === "keyWithoutDoor");
  const equipped = equipItem(looted, key.instanceId);
  const activated = activateEquippedArtifact(equipped);

  assert.equal(activated.mutated, true);
  assert.equal(activated.hero.contamination, 8);
  assert.ok(activated.hero.artifactCooldownMs > 0);
  assert.match(activated.log[0], /запечатал соседний коридор/);
});

test("Катушка обратного шага возвращает ко входу и не является бесплатным спасением", () => {
  const state = heroAt(createInitialState(), { x: 9, y: 4 });
  const withArtifact = {
    ...state,
    hero: {
      ...state.hero,
      itemCounter: state.hero.itemCounter + 1,
      inventory: [
        ...state.hero.inventory,
        { instanceId: "test-coil", itemId: "reverseCoil", quantity: 1, condition: 100 },
      ],
    },
  };
  const equipped = equipItem(withArtifact, "test-coil");
  const activated = activateEquippedArtifact(equipped);

  assert.deepEqual(activated.hero.positions.floor556, { x: 3, y: 18 });
  assert.equal(activated.hero.contamination, 12);
  assert.ok(activated.hero.artifactCooldownMs > 0);
  assert.equal(activated.noise?.label, "свёрнутый путь");
});

test("побеждённый противник оставляет физический трофей", () => {
  const state = heroAt(createInitialState(), { x: 9, y: 4 });
  const weakened = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4" ? { ...enemy, hp: 1, attackCooldownMs: 9999 } : enemy,
    ),
  };
  const defeated = tickGame(commandAttack(weakened, "guard-kl4"), 100);

  assert.equal(defeated.enemies.find((enemy) => enemy.id === "guard-kl4")?.hp, 0);
  assert.ok(defeated.groundLoot.some((loot) => loot.itemId === "coilPart"));
});

test("уровни 1-50 используют новую кривую опыта и раздельные очки развития", () => {
  let state = createInitialState();
  assert.equal(xpRequiredForLevel(1), 200);
  assert.ok(xpRequiredForLevel(20) > xpRequiredForLevel(10));

  state = awardXp(state, xpRequiredForLevel(1));
  assert.equal(state.hero.level, 2);
  assert.equal(state.hero.generalPoints, 2);
  assert.equal(state.hero.skillPoints, 1);

  state = awardXp(state, xpRequiredForLevel(2));
  assert.equal(state.hero.level, 3);
  assert.equal(state.hero.skillPoints, 2);

  let capped = createInitialState();
  for (let level = 1; level < MAX_HERO_LEVEL; level += 1) {
    capped = awardXp(capped, xpRequiredForLevel(capped.hero.level));
  }
  assert.equal(capped.hero.level, MAX_HERO_LEVEL);
  assert.equal(capped.hero.xp, 0);
});

test("очко базового атрибута распределяется из интерфейсного бюджета", () => {
  const initial = createInitialState();
  const state = { ...initial, hero: { ...initial.hero, attributePoints: 1 } };
  const upgraded = allocateAttribute(state, "technique");

  assert.equal(upgraded.hero.attributes.technique, state.hero.attributes.technique + 1);
  assert.equal(upgraded.hero.attributePoints, 0);
  assert.match(upgraded.log[0], /Техника/);
});

test("полевая задача и завершение операции выдают опыт только один раз", () => {
  let state = heroAt(createInitialState(), { x: 29, y: 3 });
  const before = state.hero.totalXp;
  state = interact(state);
  assert.equal(state.sensorFixed, true);
  assert.ok(state.hero.totalXp > before);
  const afterSensor = state.hero.totalXp;
  state = interact(state);
  assert.equal(state.hero.totalXp, afterSensor);

  state = heroAt(state, { x: 31, y: 18 });
  state = interact(state);
  assert.equal(state.missionComplete, true);
  assert.ok(state.hero.totalXp > afterSensor);
});

test("дерево содержит 121 базовый узел и четыре внешних легендарных", () => {
  assert.equal(BASE_TALENT_COUNT, 121);
  assert.equal(TALENT_NODES.length, 125);
  assert.equal(TALENT_NODES.filter((node) => node.scope === "legendary").length, 4);
  assert.equal(TALENT_NODES.filter((node) => node.scope === "hybrid").length, 15);
  for (const branch of ["force", "fire", "stealth", "bulwark", "engineer", "resonance"]) {
    assert.equal(TALENT_NODES.filter((node) => node.scope === branch).length, 16);
  }
});

test("совмещённый допуск требует 8+8, но не привязывается к конкретным навыкам", () => {
  const initial = createInitialState();
  let state = { ...initial, hero: { ...initial.hero, skillPoints: 20 } };
  for (let index = 0; index < 8; index += 1) state = allocateSkill(state, "fire");
  for (let index = 0; index < 8; index += 1) state = allocateSkill(state, "engineer");
  assert.equal(branchTalentPoints(state, "fire"), 8);
  assert.equal(branchTalentPoints(state, "engineer"), 8);
  assert.equal(canAllocateTalent(state, "hybrid:fire-engineer"), true);
  const hybrid = allocateTalent(state, "hybrid:fire-engineer");
  assert.ok(hybrid.hero.talents.includes("hybrid:fire-engineer"));
});

test("легендарный предмет добавляет внешний талант, но обычное дерево его не выдаёт", () => {
  const initial = createInitialState();
  assert.equal(canAllocateTalent(initial, "legendary:kinetic-gyro"), false);
  const trained = applyTrainingBuild(initial, "mobileFire");
  assert.ok(trained.hero.discoveredTalents.includes("legendary:kinetic-gyro"));
  assert.ok(trained.hero.talents.includes("legendary:kinetic-gyro"));
  assert.ok(trained.hero.inventory.some((entry) => entry.itemId === "horizonCarbine"));
  assert.equal(trained.hero.combatDirective, "mobileFire");
});

test("мобильный стрелок продолжает маршрут, накапливает головокружение и срывает каст", () => {
  let state = heroAt(applyTrainingBuild(createInitialState(), "mobileFire"), { x: 10, y: 5 });
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? { ...enemy, position: { x: 11, y: 5 }, hp: 100, maxHp: 100, armor: -10, attackCooldownMs: 99999 }
        : enemy,
    ),
  };
  state = commandMove(state, { x: 12, y: 5 });
  state = commandAttack(state, "guard-kl4");
  assert.ok(state.hero.path.length > 0);
  for (let frame = 0; frame < 32; frame += 1) state = tickGame(state, 100);
  assert.notDeepEqual(state.hero.positions.floor556, { x: 10, y: 5 });
  assert.match(state.log.join("\n"), /микрооглушение/);
});

test("силовой сплэшер поражает соседнюю цель и собирает пачку", () => {
  let state = heroAt(applyTrainingBuild(createInitialState(), "splashGuard"), { x: 9, y: 4 });
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? { ...enemy, position: { x: 10, y: 4 }, hp: 100, maxHp: 100, armor: -10, attackCooldownMs: 99999 }
        : enemy.id === "stalker-17"
          ? { ...enemy, position: { x: 10, y: 5 }, hp: 100, maxHp: 100, zone: "floor556", attackCooldownMs: 99999 }
          : enemy,
    ),
  };
  state = tickGame(commandAttack(state, "guard-kl4"), 100);
  const secondary = state.enemies.find((enemy) => enemy.id === "stalker-17");
  assert.ok(secondary.hp < 100);
  assert.ok(["hunting", "combat"].includes(secondary.mode));
});

test("все открытые навыки участвуют в автокасте без назначения на панель", () => {
  let state = heroAt(applyTrainingBuild(createInitialState(), "mobileFire"), { x: 9, y: 4 });
  state = {
    ...state,
    hero: {
      ...state.hero,
      activeSkillSlots: [null, null, null, null],
      attackTargetId: "guard-kl4",
      attackCooldownMs: 99999,
      autocastDecisionCooldownMs: 0,
    },
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4"
        ? {
            ...enemy,
            position: { x: 10, y: 4 },
            hp: 40,
            maxHp: 40,
            armor: -10,
            mode: "combat",
            markedUntilMs: 0,
            attackCooldownMs: 99999,
          }
        : enemy,
    ),
  };

  state = tickGame(state, 100);

  assert.ok(state.enemies.find((enemy) => enemy.id === "guard-kl4").markedUntilMs > 0);
  assert.deepEqual(state.hero.activeSkillSlots, [null, null, null, null]);
  assert.match(state.log.join("\n"), /Применено: Огневая метка/);
});

test("огневая ротация связывает метку и точную серию через общие состояния", () => {
  let state = heroAt(applyTrainingBuild(createInitialState(), "mobileFire"), { x: 9, y: 4 });
  state = {
    ...state,
    enemies: state.enemies.map((enemy) =>
      enemy.id === "guard-kl4" ? { ...enemy, position: { x: 10, y: 4 }, hp: 40, maxHp: 40, armor: -10 } : enemy,
    ),
  };
  const marked = activateSkillSlot(state, 0);
  assert.ok(marked.enemies.find((enemy) => enemy.id === "guard-kl4").markedUntilMs > 0);
  const burst = activateSkillSlot(marked, 1);
  assert.ok(burst.enemies.find((enemy) => enemy.id === "guard-kl4").hp < 40);
});
