import {
  type AttributeId,
  type GearSlot,
  type ItemDefinition,
  type ItemId,
  ITEMS,
  type WeaponDefinition,
  type WeaponId,
  WEAPONS,
} from "./game-items.ts";
import { type DevProfile } from "./game-dev-profiles.ts";
export { DEV_PROFILES, devProfileById } from "./game-dev-profiles.ts";
export type { DevProfile } from "./game-dev-profiles.ts";
import {
  type DefenceProfile,
  describeDefence,
  resolveDefence,
} from "./game-defence.ts";
export {
  RESISTANCE_CAP,
  THREAT_LABELS,
  THREAT_SOURCES,
  armourMitigation,
  describeDefence,
  resolveDefence,
  threatOf,
} from "./game-defence.ts";
export type { DefenceOutcome, DefenceProfile, DefenceStep, ThreatCategory } from "./game-defence.ts";
import {
  TELEGRAPHS,
  type TelegraphTier,
  telegraphDamage,
} from "./game-telegraph.ts";
export {
  TELEGRAPHS,
  TELEGRAPH_RESPONSES,
  isReadable,
  telegraphDamage,
  windUpProgress,
  withinParryWindow,
} from "./game-telegraph.ts";
export type { TelegraphResponse, TelegraphTier } from "./game-telegraph.ts";
import {
  DISCORD_PULSE_MS,
  discordZone,
  OVERLOAD_HEAT_SHARE,
  OVERLOAD_MS,
  overloadBreach,
  EXPOSURE_MS,
  armorUnderExposure,
  resonanceImpulse,
} from "./game-combat-states.ts";
export {
  DISCORD_PULSE_MS,
  discordZone,
  OVERLOAD_HEAT_SHARE,
  OVERLOAD_MS,
  overloadBreach,
  BLOCKED_REASON_LABELS,
  COMBAT_STATES,
  EXPOSURE_ARMOR_SHARE,
  EXPOSURE_MS,
  armorUnderExposure,
  resonanceImpulse,
} from "./game-combat-states.ts";
export type { BlockedReason, CombatStateId, CombatStateInfo } from "./game-combat-states.ts";
import {
  ACTIVE_SKILLS,
  type ActiveSkillId,
  branchForTalent,
  type SkillBranch,
  TALENT_BY_ID,
  TALENT_NODES,
  type TalentBonusKey,
  DIRECTION_THRESHOLD,
  dominantBranches,
} from "./game-skills.ts";
import {
  REGION_CONTAINER_CONTENTS,
  REGION_ENEMIES,
  REGION_MAPS,
  REGION_NPC_MESSAGES,
  REGION_OBJECTIVES,
  REGION_POPULATIONS,
  REGION_SAFE_ZONES,
  REGION_STARTS,
  REGION_TERMINAL_MESSAGES,
  REGION_TRANSITIONS,
  type RegionZoneId,
} from "./game-region-549-545.ts";
import {
  isSamosborLethalPhase,
  isSamosborWarningPhase,
  nextSamosborPhase,
  SAMOSBOR_AGITATION_GAIN,
  SAMOSBOR_CATCH_MESSAGE,
  SAMOSBOR_CONTAMINATION_PER_MS,
  SAMOSBOR_EXPOSURE_MESSAGE,
  SAMOSBOR_SCRIPTED_PHASE_MS,
  SAMOSBOR_SHELTER_MESSAGE,
  SAMOSBOR_STRESS_PER_MS,
  type SamosborPhase,
  samosborExposureHits,
  samosborPhaseDurationMs,
  samosborPhaseMessage,
  samosborProfileFor,
  samosborQuietDurationMs,
} from "./game-samosbor.ts";

import {
  AIM_DAMAGE_BONUS,
  ARCHETYPES,
  HEAT_COOLING_PER_SECOND,
  HEAT_OVERHEAT,
  HEAT_OVERHEAT_LOCK_MS,
  HEAT_PER_SHOT,
  HEAT_VENT_AMOUNT,
  HEAT_VENT_VULNERABLE_MS,
  RESONANCE_CONTAMINATION_COST,
  RESONANCE_MAX_STACKS,
  RESONANCE_STRESS_COST,
  REVERSE_SHADOW_CONTAMINATION,
  REVERSE_SHADOW_MS,
  SET_UP_DAMAGE_BONUS,
  SET_UP_SPEED_PENALTY,
  UNDEPLOYED_DAMAGE_PENALTY,
  chainDamageAt,
  desyncReady,
  footingStepsFor,
  spinUpFactor,
  tempoDamageBonus,
  tempoGrantsBackstab,
  tempoStepsFor,
  type ArchetypeId,
  MARK_DAMAGE_BONUS,
  MARK_DURATION_MS,
  SCOUT_DURATION_MS,
  SCOUT_VISION_BONUS,
  aimStepsFor,
  surgeSpeedBonus,
  surgeStanceMultiplier,
  surgeStepsFor,
} from "./game-archetypes.ts";
import {
  type AttackKind,
  BOSS,
  type CombatantRank,
  type StanceState,
  breathRegenPerSecond,
  capBossHitOnHero,
  maxHeroBreath as modelMaxHeroBreath,
  maxHeroHp as modelMaxHeroHp,
  maxHeroStance as modelMaxHeroStance,
  migrateHpShare,
  resolveStrike,
  scaleEnemy,
  staggerProfile,
  stanceState,
  chargeStepsFor,
  chargeTuning,
  tunedChargeMultipliers,
  BLOCK,
  BREATH_COSTS,
  CRITICAL_EFFECT_PROFILE,
  DODGE,
} from "./game-combat-model.ts";
import {
  type AutopilotTemper,
  CONTROL_MODE_COST,
  CONTROL_MODE_LABELS,
  type CombatSnapshot,
  type ControlMode,
  type CombatAction,
  decideAction,
} from "./game-combat-modes.ts";

export { ITEMS, SLOT_NAMES, WEAPONS } from "./game-items.ts";
export {
  ARCHETYPES,
  HEAT_OVERHEAT,
  IMPLEMENTED_ARCHETYPES,
  RESONANCE_MAX_STACKS,
  chainDamageAt,
  desyncReady,
  footingStepsFor,
  spinUpFactor,
  tempoDamageBonus,
  tempoGrantsBackstab,
  tempoStepsFor,
  aimDamageBonus,
  aimStepsFor,
  archetypeAbility,
  surgeSpeedBonus,
  surgeStanceMultiplier,
  surgeStepsFor,
} from "./game-archetypes.ts";
export type { ArchetypeAbility, ArchetypeAbilityId, ArchetypeId } from "./game-archetypes.ts";
export {
  BLOCK,
  BOSS,
  DODGE,
  BREATH_COSTS,
  armorMitigation,
  floorTier,
  resolveStrike,
  scaleEnemy,
  staggerProfile,
  stanceState,
} from "./game-combat-model.ts";
export type { DamageType, StanceState } from "./game-combat-model.ts";
export {
  AUTOPILOT_TEMPER_LABELS,
  CONTROL_MODE_COST,
  CONTROL_MODE_HINTS,
  CONTROL_MODE_LABELS,
  COMBAT_ACTION_LABELS,
  autopilotAction,
} from "./game-combat-modes.ts";
export type {
  AutopilotTemper,
  CombatSnapshot,
  ControlMode,
  CombatAction,
} from "./game-combat-modes.ts";
export {
  SAMOSBOR_GRACE_MS,
  SAMOSBOR_PHASE_PROFILES,
  SAMOSBOR_ZONE_PROFILES,
  isSamosborLethalPhase,
  isSamosborWarningPhase,
  samosborPhaseHint,
  samosborPhaseLabel,
  samosborProfileFor,
} from "./game-samosbor.ts";
export type { SamosborPhase, SamosborZoneProfile } from "./game-samosbor.ts";
export {
  ACTIVE_SKILLS,
  BASE_TALENT_COUNT,
  LEGENDARY_TALENTS,
  SKILL_DESCRIPTIONS,
  SKILL_NAMES,
  TALENT_BY_ID,
  TALENT_NODES,
} from "./game-skills.ts";
export type {
  AttributeId,
  GearSlot,
  ItemDefinition,
  ItemId,
  WeaponDefinition,
  WeaponId,
} from "./game-items.ts";
export type { ActiveSkillId, SkillBranch, TalentNode } from "./game-skills.ts";
export {
  FLOOR_545_MAP,
  FLOOR_546_MAP,
  FLOOR_547_MAP,
  FLOOR_548_MAP,
  FLOOR_549_MAP,
  REGION_MAPS,
  REGION_STARTS,
} from "./game-region-549-545.ts";

export type ZoneId = RegionZoneId | "floor550" | "floor554" | "floor555" | "floor556" | "floor557" | "voidLab";

export type Point = {
  x: number;
  y: number;
};

export type Injuries = {
  leg: number;
  arm: number;
  head: number;
  torso: number;
  eye: number;
};

export type EnemyMode =
  | "patrol"
  | "suspicious"
  | "hunting"
  | "combat"
  | "retreat"
  | "disabled";

export type EnemyKind = "sentry" | "stalker" | "collector";
export type EnemyRank = "common" | "enhanced" | "veteran" | "elite" | "boss";

export type PopulationGenome =
  | "maintenance"
  | "bureaucratic"
  | "feral"
  | "pilgrim"
  | "anomalous";

export type WorldPopulation = {
  id: string;
  name: string;
  genome: PopulationGenome;
  zone: ZoneId;
  count: number;
  agitation: number;
  goal: string;
};

export type Attributes = {
  body: number;
  reaction: number;
  attention: number;
  technique: number;
  will: number;
};

export type Skills = Record<SkillBranch, number>;
export type CombatDirective = "adaptive" | "mobileFire" | "splashGuard";
export type TrainingBuild = "mobileFire" | "splashGuard";

export type InventoryEntry = {
  instanceId: string;
  itemId: ItemId;
  quantity: number;
  condition: number;
};

export type GroundLoot = {
  id: string;
  zone: ZoneId;
  position: Point;
  itemId: ItemId;
  quantity: number;
  condition: number;
};

export type NpcKind = "resident" | "merchant" | "liquidator";
export type NpcRole =
  | "registrar"
  | "grocer"
  | "medic"
  | "weaponsmith"
  | "armorer"
  | "technician"
  | "courier"
  | "porter"
  | "cook"
  | "archivist"
  | "electrician"
  | "watermaster"
  | "tailor"
  | "teacher"
  | "watchman"
  | "resident"
  | "liquidator-leader"
  | "liquidator-chemist"
  | "liquidator-rifleman";

export type Npc = {
  id: string;
  name: string;
  kind: NpcKind;
  role: NpcRole;
  zone: ZoneId;
  position: Point;
  home: Point;
  route: Point[];
  routeIndex: number;
  path: Point[];
  speed: number;
  thinkCooldownMs: number;
  speech: string | null;
  speechUntilMs: number;
  vendorStock?: ItemId[];
};

export type PendingInteraction =
  | { kind: "loot"; id: string }
  | { kind: "tile"; zone: ZoneId; point: Point }
  | { kind: "npc"; id: string };

export type Hero = {
  positions: Record<ZoneId, Point>;
  path: Point[];
  destination: Point | null;
  attackTargetId: string | null;
  pendingInteraction: PendingInteraction | null;
  evadeMode: boolean;
  attackCooldownMs: number;
  repathCooldownMs: number;
  stepNoiseCooldownMs: number;
  droneCooldownMs: number;
  hp: number;
  /** Полоса стойки: ломается, а не отнимается. */
  stance: number;
  stanceIdleMs: number;
  staggeredUntilMs: number;
  staggerImmuneUntilMs: number;
  /** Полоса дыхания: тратится на рывки, блок, уклонение и тяжёлые атаки. */
  breath: number;
  breathIdleMs: number;
  blockingSinceMs: number;
  blockBrokenUntilMs: number;
  dodgeInvulnerableUntilMs: number;
  dodgeReadyAtMs: number;
  perfectDodgeUntilMs: number;
  riposteUntilMs: number;
  /** Момент начала заряда: удержание команды атаки копит усиленный удар. */
  chargingSinceMs: number;
  /** Разгон силача: время непрерывного движения к цели. */
  surgeMs: number;
  /** Прицел стрелка: время неподвижности. */
  aimMs: number;
  scoutUntilMs: number;
  /** Опора танка: время удержания блока. */
  footingMs: number;
  /** Темп ловкача: стеки и момент последнего набора. */
  tempoStacks: number;
  tempoGainedAtMs: number;
  /** Температура тяжёлого стрелка: обратный ресурс. */
  heat: number;
  firingMs: number;
  deployedSinceMs: number;
  overheatedUntilMs: number;
  ventVulnerableUntilMs: number;
  /** Обратная тень резонанса. */
  reverseShadowUntilMs: number;
  level: number;
  xp: number;
  totalXp: number;
  skillPoints: number;
  generalPoints: number;
  attributePoints: number;
  attributes: Attributes;
  skills: Skills;
  talents: string[];
  discoveredTalents: string[];
  activeSkillSlots: (ActiveSkillId | null)[];
  activeSkillCooldowns: Partial<Record<ActiveSkillId, number>>;
  autocastDecisionCooldownMs: number;
  combatDirective: CombatDirective;
  controlMode: ControlMode;
  autopilotTemper: AutopilotTemper;
  braceUntilMs: number;
  silentUntilMs: number;
  overclockUntilMs: number;
  isolatedTargetId: string | null;
  isolatedUntilMs: number;
  secondBeatReady: boolean;
  inventory: InventoryEntry[];
  equipment: Record<GearSlot, string | null>;
  itemCounter: number;
  contamination: number;
  stress: number;
  artifactCooldownMs: number;
  relievedInjury: keyof Injuries | null;
  injuryReliefUntilMs: number;
};

export type Enemy = {
  id: string;
  name: string;
  kind: EnemyKind;
  zone: ZoneId;
  position: Point;
  home: Point;
  hp: number;
  maxHp: number;
  armor: number;
  stance: number;
  maxStance: number;
  stanceIdleMs: number;
  staggerImmuneUntilMs: number;
  /** Сколько раз цель уже ломали: каждый следующий слом стойки дороже. */
  staggerCount: number;
  /** Фаза босса: 0 — первая, растёт на порогах 66% и 33% ОЗ. */
  phase: number;
  phaseInvulnerableUntilMs: number;
  flatAbsorb: number;
  visionRadius: number;
  hearingRadius: number;
  aggroRadius: number;
  attackRange: number;
  speed: number;
  accuracy: number;
  damage: number;
  attackCooldownBaseMs: number;
  attackCooldownMs: number;
  thinkCooldownMs: number;
  xpValue: number;
  rank?: EnemyRank;
  populationId?: string;
  mode: EnemyMode;
  path: Point[];
  patrol: Point[];
  patrolIndex: number;
  lastKnownHero: Point | null;
  memoryMs: number;
  markedUntilMs: number;
  resonanceStacks: number;
  /** Вскрытие: слом стойки временно отключает броню (game-combat-states.ts). */
  exposedUntilMs: number;
  /** Перегрузка: накопленный потенциал, который пробивает следующее попадание. */
  overloadedUntilMs: number;
  dizzyStacks: number;
  dizzyUntilMs: number;
  stunnedUntilMs: number;
  castUntilMs: number;
  /** Какой удар готовится: обычный или телеграфированный тяжёлый. */
  castTier: TelegraphTier;
  /** Сколько ударов противник уже провёл: задаёт ритм тяжёлых замахов. */
  attackCount: number;
  /** Когда начался замах — нужно интерфейсу для заполнения шкалы. */
  castStartedMs: number;
};

export type NoiseEvent = {
  zone: ZoneId;
  position: Point;
  radius: number;
  label: string;
  ttlMs: number;
};

export type CombatEffect = {
  id: number;
  from: Point;
  to: Point;
  kind: "hero-hit" | "enemy-hit" | "miss" | "drone" | "splash" | "control" | "skill";
  value: number;
  ttlMs: number;
};

export type SamosborZoneEvent = {
  phase: SamosborPhase;
  /** Момент мира, когда текущая фаза сменится. Ноль в фазе `calm` означает «событие не запланировано». */
  phaseEndsAtMs: number;
  severity: number;
  scripted: boolean;
  completed: number;
};

export type SamosborState = {
  zones: Record<ZoneId, SamosborZoneEvent>;
  /** Время, проведённое героем в активной фазе вне защищённого контура. */
  exposureMs: number;
  exposureHits: number;
  caughtCount: number;
  lastCompletedZone: ZoneId | null;
  lastCompletedAtMs: number;
};

export type GameState = {
  zone: ZoneId;
  hero: Hero;
  worldTimeMs: number;
  /** Звучащие участки: собственная расплата Резонанса (game-combat-states.ts). */
  discordZones: DiscordZoneState[];
  mutated: boolean;
  sensorFixed: boolean;
  artifactRecovered: boolean;
  missionComplete: boolean;
  voidStabilityMs: number;
  injuries: Injuries;
  rescueCount: number;
  enemies: Enemy[];
  npcs: Npc[];
  npcConversationCooldownMs: number;
  noise: NoiseEvent | null;
  effects: CombatEffect[];
  effectCounter: number;
  rngSeed: number;
  visited: Record<ZoneId, string[]>;
  openedContainers: string[];
  milestoneLootDrops: string[];
  groundLoot: GroundLoot[];
  lootCounter: number;
  populations: WorldPopulation[];
  populationCycle: number;
  samosbor: SamosborState;
  log: string[];
};

export type DiscordZoneState = {
  id: string;
  zone: ZoneId;
  position: Point;
  radius: number;
  untilMs: number;
  nextPulseMs: number;
};

export type MapDefinition = {
  id: ZoneId;
  name: string;
  subtitle: string;
  rows: string[];
};

export const FLOOR_550_MAP: MapDefinition = {
  id: "floor550",
  name: "Этаж 550 · нижний выход Города 550",
  subtitle: "Внешний контур за городскими воротами · первая опасная зона дальней цепочки",
  rows: [
    "########################################################",
    "#......................................................#",
    "#.........................................##########T..#",
    "#.........................................#gggggggg#...#",
    "#.....................##########..........#gggggggg#...#",
    "#.....###########.....##########....#######gggggggg#...#",
    "#.....###########.....##########....#######gggggggg#...#",
    "#.....###########.....##########....#######gggggggg#...#",
    "#.....###########.....##########....#######gggggggg#...#",
    "#.....###########.....##########....###########H####...#",
    "#.....###########.....#####.####....#############......#",
    "#.....###########...................#############......#",
    "#.....#####.#####...................#############......#",
    "#...................................######.######......#",
    "#..........................c...........................#",
    "#..................................c...................#",
    "#......................................................#",
    "#........................####.#####....................#",
    "#.......######.#####.....##########....................#",
    "#.......############.....##########.....#####.######...#",
    "#.......############.....##########.....############...#",
    "#.......############.....##########.....############...#",
    "#.......############.....##########.....############...#",
    "#.......###########......#########......############...#",
    "#.......############.....##########.....############...#",
    "#.......############.....##########.....############...#",
    "#.......############.....##########.....############...#",
    "#.......############.....##########.....############...#",
    "#........................##########.....############...#",
    "#.......................................############...#",
    "#......................................................#",
    "#...B...............c................B...........c.....#",
    "#......................................................#",
    "#.U.................................................D..#",
    "#......................................................#",
    "########################################################",
  ],
};

export const FLOOR_554_MAP: MapDefinition = {
  id: "floor554",
  name: "Город 550 · Большой разлом",
  subtitle: "Единый защищённый хаб, объединяющий городские уровни 554–551",
  rows: [
    "########################################################",
    "#......................................................#",
    "#......................................................#",
    "#......................####..####......................#",
    "#....############......####..####......############....#",
    "#....#gggggggggg#......####..####......############....#",
    "#....#gggggggggg#......####..####......############....#",
    "#....#gggggggggg#......####..####......############....#",
    "#....#gggggggggg#......####..####......############....#",
    "#....#gggggggggg#......................############....#",
    "#....#####H######........c....c........######.#####....#",
    "#......................................................#",
    "#.................c..................c.................#",
    "#...................#..#..#..#..#..#...................#",
    "#...................#..#..#..#..#..#...................#",
    "#...###########.....#..#..#..#..#..#.....###########...#",
    "#...###########..........................###########...#",
    "#...###########.....#..#..#..#..#..#.....###########...#",
    "#...###########.....#..#..#..#..#..#.....###########...#",
    "#...###########..........................###########...#",
    "#...###########.....#..#..#..#..#..#.....###########...#",
    "#...###########.....#..#..#..#..#..#.....###########...#",
    "#...#####.#####..........................#####.#####...#",
    "#......................................................#",
    "#.................c......c....c......c.................#",
    "#......................................................#",
    "#......######.######................######.######......#",
    "#......#############................#############......#",
    "#......#############................#############......#",
    "#......#############................#############......#",
    "#......#############................#############......#",
    "#......#############................#############......#",
    "#..U...................................................#",
    "#..............T......B........................D....B..#",
    "#......................................................#",
    "########################################################",
  ],
};

export const FLOOR_555_MAP: MapDefinition = {
  id: "floor555",
  name: "Этаж 555 · ремонтный пояс",
  subtitle: "Просторные затопленные мастерские и резервные линии П-46",
  rows: [
    "####################################",
    "#..................................#",
    "#...####.....B......####........U..#",
    "#...####............####....########",
    "#...####....####....####....#ggggg##",
    "#...##.#....####....#.##....#ggggg##",
    "#...####....####....####....#ggggg##",
    "#...####....#.##....####....#ggggg##",
    "#...........####..c.........###H####",
    "#........c..####..........c........#",
    "#...........####...................#",
    "#.......................####.......#",
    "#.....#####.............####.......#",
    "#.....#####.....####....#.##..####.#",
    "#.....#####.....####....####..####.#",
    "#.....##.##.....####....####..#.##.#",
    "#.....#####.....#.##....####..####.#",
    "#.....#####..c..####....####..####.#",
    "#.....#####.....####..........####.#",
    "#.L.T...........####....B...c......#",
    "#................................D.#",
    "####################################",
  ],
};

export const FLOOR_MAP: MapDefinition = {
  id: "floor556",
  name: "Этаж 556 · учебный технический пояс",
  subtitle: "Стартовый район: диспетчерская, служебные коридоры и гермоблок",
  // Собран по грамматике пространства (art/_docs/ENVIRONMENT_GRAMMAR.md):
  // сквозная магистраль в две клетки посередине, технический ряд одинаковых
  // помещений вдоль севера, южный блок с гермоконтуром и служебное ядро у
  // точки входа. Раньше этаж был россыпью блоков стен в открытом поле — он
  // читался как заготовка уровня, а не как этаж, на который выходят в смену.
  rows: [
    "####################################",
    "#..................................#",
    "#.U.............................D..#",
    "#.##..#####..#####..#####..####..#.#",
    "#.......#......#......#......#.....#",
    "#...T...#......#......#..S...#.....#",
    "#.......#......#......#......#.....#",
    "#.......#......#......#......#.....#",
    "#.################################.#",
    "#......c...............c...........#",
    "#.............c...........c........#",
    "#.###..######..######..######H####.#",
    "#........#.......#.......#gggggggg.#",
    "#........#.B.....#.......#gggggggg.#",
    "#........#.......#.......#gggggggg.#",
    "#........#.......#.......#gggggggg.#",
    "#........#.......#.......#gggggggg.#",
    "#.################################.#",
    "#.L.N..............................#",
    "#...................B..............#",
    "#..................................#",
    "####################################",
  ],
};

export const FLOOR_557_MAP: MapDefinition = {
  id: "floor557",
  name: "Этаж 557 · жилой контур",
  subtitle: "Полузакрытый квартал над техническим поясом",
  rows: [
    "####################################",
    "#..................................#",
    "#.........B..####............###D..#",
    "#....####....####............####..#",
    "#....####....#.##.....####...#.##..#",
    "#....#.##....####.....####...####..#",
    "#....####....####.....####...####..#",
    "#....####....####.....#.##.........#",
    "#....####..........c..####.........#",
    "#..........c..........####.........#",
    "#.....................####.........#",
    "#..........................c.......#",
    "#.............#####................#",
    "#...######....#####................#",
    "#...#gggg#....##.##.....####.......#",
    "#...#gggg#....#####.....####.......#",
    "#...#gggg#....#####.....#.##.......#",
    "#...#gggg#c...#####.....####.......#",
    "#...##H###..........B...####..T....#",
    "#.L.....................####.......#",
    "#..................................#",
    "####################################",
  ],
};

export const VOID_MAP: MapDefinition = {
  id: "voidLab",
  name: "Войд-зона ВЖ-7",
  subtitle: "Редкий односторонний аномальный маршрут · обратного пути нет",
  rows: [
    "#####################",
    "#P....#......#.....A#",
    "#.##..#.####.#.###..#",
    "#....c#....#.#...#..#",
    "####.####..#...#.#..#",
    "#....#..B..#####.#..#",
    "#.##.#.###.......#..#",
    "#....#.....c..##....#",
    "#.######.#####.###..#",
    "#........#..........#",
    "#####################",
  ],
};

export const FLOOR_550_START: Point = { x: 3, y: 33 };
export const FLOOR_554_START: Point = { x: 3, y: 32 };
export const FLOOR_555_START: Point = { x: 2, y: 19 };
export const FLOOR_START: Point = { x: 3, y: 18 };
export const FLOOR_557_START: Point = { x: 2, y: 19 };
export const VOID_START: Point = { x: 1, y: 1 };

const ZONE_STARTS: Record<ZoneId, Point> = {
  floor545: { ...REGION_STARTS.floor545 },
  floor546: { ...REGION_STARTS.floor546 },
  floor547: { ...REGION_STARTS.floor547 },
  floor548: { ...REGION_STARTS.floor548 },
  floor549: { ...REGION_STARTS.floor549 },
  floor550: FLOOR_550_START,
  floor554: FLOOR_554_START,
  floor555: FLOOR_555_START,
  floor556: FLOOR_START,
  floor557: FLOOR_557_START,
  voidLab: VOID_START,
};

const FLOOR_550_UP: Point = { x: 2, y: 33 };
const FLOOR_554_DOWN: Point = { x: 47, y: 33 };
const FLOOR_554_UP: Point = { x: 3, y: 32 };
const FLOOR_555_DOWN: Point = { x: 33, y: 20 };
const FLOOR_555_UP: Point = { x: 32, y: 2 };
const FLOOR_556_UP: Point = { x: 2, y: 2 };
const FLOOR_556_DOWN: Point = { x: 32, y: 2 };
const FLOOR_557_DOWN: Point = { x: 32, y: 2 };

const GROUP_ALERT_RADIUS = 6;
const MUTATION_AT_MS = 15000;
const VOID_STABILITY_MS = 42000;
const POPULATION_STEP_MS = 5000;

const EMPTY_INJURIES: Injuries = {
  leg: 0,
  arm: 0,
  head: 0,
  torso: 0,
  eye: 0,
};

const DIRECTIONS: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];

function copyPoint(point: Point): Point {
  return { x: point.x, y: point.y };
}

function pointKey(point: Point): string {
  return `${point.x}:${point.y}`;
}

function sameGridPoint(a: Point, b: Point): boolean {
  return Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function gridPoint(point: Point): Point {
  return { x: Math.round(point.x), y: Math.round(point.y) };
}

function createPopulations(): WorldPopulation[] {
  return [
    ...REGION_POPULATIONS.map((population) => ({ ...population, zone: population.zone as ZoneId })),
    {
      id: "lower-gate-scavengers",
      name: "Сборщики нижнего выхода",
      genome: "feral",
      zone: "floor550",
      count: 11,
      agitation: 48,
      goal: "перехватывать грузы у нижних ворот",
    },
    {
      id: "repair-collective",
      name: "Ремонтный коллектив 55-Б",
      genome: "maintenance",
      zone: "floor555",
      count: 12,
      agitation: 28,
      goal: "восстановить затопленный цех",
    },
    {
      id: "departmental-automata",
      name: "Ведомственные автоматы КЛ",
      genome: "bureaucratic",
      zone: "floor556",
      count: 7,
      agitation: 42,
      goal: "удерживать технический коридор",
    },
    {
      id: "tenant-pack",
      name: "Стая контурных жильцов",
      genome: "feral",
      zone: "floor557",
      count: 10,
      agitation: 56,
      goal: "занять тёплые жилые секции",
    },
    {
      id: "elevator-pilgrims",
      name: "Паломники лифтового ритма",
      genome: "pilgrim",
      zone: "floor557",
      count: 4,
      agitation: 34,
      goal: "найти кабину с живым сердцебиением",
    },
    {
      id: "void-bloom",
      name: "Цветение лабораторного слоя",
      genome: "anomalous",
      zone: "voidLab",
      count: 16,
      agitation: 67,
      goal: "расширить устойчивую геометрию",
    },
  ];
}

function clampPopulation(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function evolvePopulations(state: GameState, cycle: number): GameState {
  let migrationMessage: string | null = null;
  const populations = state.populations.map((population, index) => {
    const rhythm = (cycle + index * 3) % 6;
    const countDelta = rhythm === 0 ? 1 : rhythm === 3 && population.count > 2 ? -1 : 0;
    const agitationDelta = ((cycle + index) % 5) - 2;
    let zone = population.zone;
    if (population.id === "elevator-pilgrims" && cycle % 4 === 0) {
      zone = population.zone === "floor557" ? "floor556" : "floor557";
      migrationMessage = zone === "floor556"
        ? "Паломники лифтового ритма спустились на этаж 556."
        : "Паломники лифтового ритма поднялись в жилой контур 557.";
    }
    return {
      ...population,
      zone,
      count: clampPopulation(population.count + countDelta, 1, 30),
      agitation: clampPopulation(population.agitation + agitationDelta, 0, 100),
    };
  });
  let next = reconcilePopulationEnemies({ ...state, populations, populationCycle: cycle }, cycle);
  if (migrationMessage) next = appendLog(next, migrationMessage);
  return next;
}

export function populationsForZone(state: GameState, zone: ZoneId = state.zone): WorldPopulation[] {
  return state.populations
    .filter((population) => population.zone === zone && population.count > 0)
    .sort((left, right) => right.agitation - left.agitation || right.count - left.count);
}

export function populationPressureForZone(state: GameState, zone: ZoneId = state.zone): number {
  return Math.round(
    populationsForZone(state, zone).reduce(
      (total, population) => total + population.count * (1 + population.agitation / 100),
      0,
    ),
  );
}

function manifestedPopulationTarget(population: WorldPopulation): number {
  if (population.count <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil(population.count / 5)));
}

function populationEnemyKind(genome: PopulationGenome): EnemyKind {
  if (genome === "feral" || genome === "pilgrim") return "stalker";
  if (genome === "anomalous") return "collector";
  return "sentry";
}

function populationEnemyRank(population: WorldPopulation): EnemyRank {
  if (population.agitation >= 82 || population.count >= 24) return "veteran";
  if (population.agitation >= 55 || population.count >= 14) return "enhanced";
  return "common";
}

function populationEnemyName(population: WorldPopulation, index: number): string {
  const suffix = String(index + 1).padStart(2, "0");
  if (population.genome === "maintenance") return `Ремонтный исполнитель ${suffix}`;
  if (population.genome === "bureaucratic") return `Контролёр допуска ${suffix}`;
  if (population.genome === "feral") return `Контурный жилец ${suffix}`;
  if (population.genome === "pilgrim") return `Паломник кабины ${suffix}`;
  return `Резонансный отросток ${suffix}`;
}

function populationSpawnCandidates(state: GameState, zone: ZoneId): Point[] {
  const map = mapForZone(zone);
  const reserved = new Set(
    state.enemies
      .filter((enemy) => enemy.zone === zone && enemy.hp > 0 && !enemy.populationId)
      .map((enemy) => pointKey(gridPoint(enemy.position))),
  );
  const hero = state.hero.positions[zone];
  const candidates: Point[] = [];
  for (let y = 1; y < map.rows.length - 1; y += 1) {
    for (let x = 1; x < map.rows[0].length - 1; x += 1) {
      const point = { x, y };
      const tile = tileAtZone(state, zone, point);
      if (isSamosborProtectedAt(state, zone, point)) continue;
      if (![".", "c"].includes(tile)) continue;
      if (reserved.has(pointKey(point))) continue;
      if (distance(point, hero) < 3.2) continue;
      // Служебное ядро этажа — лифт, диспетчер, терминал — не место для
      // проявления популяций: иначе героя встречает бой в двух шагах от точки
      // входа, ещё до того, как он получит задание.
      if (distance(point, ZONE_STARTS[zone]) < 6) continue;
      candidates.push(point);
    }
  }
  return candidates;
}

function createPopulationEnemy(
  state: GameState,
  population: WorldPopulation,
  index: number,
  cycle: number,
  occupied: Set<string>,
): Enemy | null {
  const candidates = populationSpawnCandidates(state, population.zone).filter(
    (point) => !occupied.has(`${population.zone}:${pointKey(point)}`),
  );
  if (!candidates.length) return null;
  const salt = [...population.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const point = candidates[(salt + cycle * 7 + index * 11) % candidates.length];
  occupied.add(`${population.zone}:${pointKey(point)}`);
  const kind = populationEnemyKind(population.genome);
  const rank = populationEnemyRank(population);
  // Проявление популяции масштабируется тем же правилом, что и статические
  // противники: глубина этажа, ранг и тревога — модель v2 §8.
  const scaled = scaleEnemy(
    kind === "collector"
      ? { hp: 72, damage: 13, armor: 12, stance: 44 }
      : kind === "sentry"
        ? { hp: 58, damage: 10, armor: 6, stance: 33 }
        : { hp: 52, damage: 9, armor: 2, stance: 27 },
    { floor: zoneFloorNumber(population.zone), rank, agitation: population.agitation },
  );
  const id = `population:${population.id}:${cycle}:${index}`;
  return {
    id,
    name: populationEnemyName(population, index),
    kind,
    zone: population.zone,
    position: copyPoint(point),
    home: copyPoint(point),
    hp: scaled.hp,
    maxHp: scaled.hp,
    armor: scaled.armor,
    stance: scaled.stance,
    maxStance: scaled.stance,
    stanceIdleMs: 0,
    staggerImmuneUntilMs: 0,
    staggerCount: 0,
    phase: 0,
    phaseInvulnerableUntilMs: 0,
    flatAbsorb: scaled.flatAbsorb,
    visionRadius: kind === "stalker" ? 5.5 : 4.5,
    hearingRadius: kind === "stalker" ? 7 : 5,
    aggroRadius: 3 + population.agitation / 50,
    attackRange: kind === "sentry" ? 3.5 : kind === "collector" ? 1.8 : 1.35,
    speed: kind === "stalker" ? 1.55 : kind === "collector" ? 0.9 : 1.1,
    accuracy: rank === "veteran" ? 5 : rank === "enhanced" ? 4 : 3,
    damage: scaled.damage,
    attackCooldownBaseMs: kind === "stalker" ? 1050 : kind === "collector" ? 1700 : 1400,
    attackCooldownMs: 500 + index * 130,
    thinkCooldownMs: index * 80,
    xpValue: rank === "veteran" ? 30 : rank === "enhanced" ? 18 : 8,
    rank,
    populationId: population.id,
    mode: "patrol",
    path: [],
    patrol: [copyPoint(point)],
    patrolIndex: 0,
    lastKnownHero: null,
    memoryMs: 0,
    markedUntilMs: 0,
    resonanceStacks: 0,
    exposedUntilMs: 0,
    overloadedUntilMs: 0,
    dizzyStacks: 0,
    dizzyUntilMs: 0,
    stunnedUntilMs: 0,
    castUntilMs: 0,
    castTier: "quick" as TelegraphTier,
    attackCount: 0,
    castStartedMs: 0,
  };
}

function reconcilePopulationEnemies(state: GameState, cycle = state.populationCycle): GameState {
  const staticEnemies = state.enemies.filter((enemy) => !enemy.populationId);
  const livingPopulationEnemies = state.enemies.filter((enemy) => enemy.populationId && enemy.hp > 0);
  const occupied = new Set(
    [...staticEnemies, ...livingPopulationEnemies].map(
      (enemy) => `${enemy.zone}:${pointKey(gridPoint(enemy.position))}`,
    ),
  );
  const retained: Enemy[] = [];
  const spawned: Enemy[] = [];

  for (const population of state.populations) {
    // В активной фазе Самосбора физические проявления уходят с этажа: событие переживают только укрытия.
    const target = isSamosborLethalPhase(samosborPhaseIn(state, population.zone))
      ? 0
      : manifestedPopulationTarget(population);
    const existing = livingPopulationEnemies
      .filter((enemy) => enemy.populationId === population.id)
      .slice(0, target)
      .map((enemy, index) => {
        if (enemy.zone === population.zone) return enemy;
        const replacement = createPopulationEnemy(state, population, index, cycle, occupied);
        return replacement ?? { ...enemy, zone: population.zone };
      });
    retained.push(...existing);
    for (let index = existing.length; index < target; index += 1) {
      const enemy = createPopulationEnemy(state, population, index, cycle, occupied);
      if (enemy) spawned.push(enemy);
    }
  }

  const next = { ...state, enemies: [...staticEnemies, ...retained, ...spawned] };
  return spawned.length
    ? appendLog(next, `Физический мир проявил ${spawned.length} новых представителей популяций.`)
    : next;
}

function registerPopulationCasualty(state: GameState, enemy: Enemy): GameState {
  if (!enemy.populationId) return state;
  const population = state.populations.find((entry) => entry.id === enemy.populationId);
  if (!population) return state;
  const nextCount = Math.max(0, population.count - 1);
  const next = {
    ...state,
    populations: state.populations.map((entry) =>
      entry.id === enemy.populationId
        ? {
            ...entry,
            count: nextCount,
            agitation: clampPopulation(entry.agitation + 5, 0, 100),
          }
        : entry,
    ),
  };
  return appendLog(next, `${population.name}: численность снижена до ${nextCount}, тревога растёт.`);
}

function createStaticEnemy(
  id: string,
  name: string,
  kind: EnemyKind,
  zone: ZoneId,
  position: Point,
  patrol: Point[],
  rank: EnemyRank = "common",
): Enemy {
  const sentry = kind === "sentry";
  const collector = kind === "collector";
  // Базовые профили вида в шкале модели v2; глубина и ранг добавляются масштабированием.
  const base = collector
    ? { hp: 78, damage: 13, armor: 12, stance: 46 }
    : sentry
      ? { hp: 60, damage: 10, armor: 6, stance: 34 }
      : { hp: 55, damage: 9, armor: 2, stance: 28 };
  const scaled = scaleEnemy(base, { floor: zoneFloorNumber(zone), rank });
  return {
    id, name, kind, zone, position: copyPoint(position), home: copyPoint(position),
    hp: scaled.hp, maxHp: scaled.hp, armor: scaled.armor,
    stance: scaled.stance, maxStance: scaled.stance, stanceIdleMs: 0, staggerImmuneUntilMs: 0,
    staggerCount: 0, phase: 0, phaseInvulnerableUntilMs: 0,
    flatAbsorb: scaled.flatAbsorb,
    visionRadius: collector ? 4.5 : sentry ? 4.2 : 3.4,
    hearingRadius: sentry ? 5 : 6, aggroRadius: sentry ? 2.8 : 2.3,
    attackRange: collector ? 2.2 : sentry ? 3.2 : 1.2,
    speed: collector ? 0.9 : sentry ? 1.05 : 1.55, accuracy: sentry ? 3 : 4,
    damage: scaled.damage,
    attackCooldownBaseMs: collector ? 1650 : sentry ? 1450 : 980,
    attackCooldownMs: 700, thinkCooldownMs: 0, xpValue: collector ? 24 : sentry ? 12 : 9, rank,
    mode: "patrol", path: [], patrol, patrolIndex: patrol.length > 1 ? 1 : 0,
    lastKnownHero: null, memoryMs: 0, markedUntilMs: 0, resonanceStacks: 0, exposedUntilMs: 0, overloadedUntilMs: 0, dizzyStacks: 0,
    dizzyUntilMs: 0, stunnedUntilMs: 0, castUntilMs: 0, castTier: "quick", castStartedMs: 0, attackCount: 0,
  };
}

/** Номер этажа для масштабирования: войд считается по глубине лабораторного слоя. */
export function zoneFloorNumber(zone: ZoneId): number {
  if (zone === "voidLab") return 547;
  const parsed = Number.parseInt(zone.replace("floor", ""), 10);
  return Number.isFinite(parsed) ? parsed : 556;
}

function createEnemies(): Enemy[] {
  const regionalEnemies = REGION_ENEMIES.map((spec) => {
    const enemy = createStaticEnemy(
      spec.id,
      spec.name,
      spec.kind,
      spec.zone as ZoneId,
      spec.position,
      spec.patrol,
      spec.rank ?? "common",
    );
    // Ранг и глубина уже учтены в createStaticEnemy через модель; spec.scale
    // остаётся ручной поправкой для отдельных именных противников региона.
    const tuning = spec.scale ?? 1;
    return {
      ...enemy,
      hp: Math.round(enemy.hp * tuning),
      maxHp: Math.round(enemy.maxHp * tuning),
      stance: Math.round(enemy.stance * tuning),
      maxStance: Math.round(enemy.maxStance * tuning),
      xpValue: Math.round(enemy.xpValue * tuning),
    };
  });
  return [
    ...regionalEnemies,
    // Этаж 550: нижний выход из города, первые группы дальней цепочки.
    createStaticEnemy("550-a1", "Сборщик нижних ворот 550-А", "stalker", "floor550", { x: 12, y: 14 }, [{ x: 12, y: 14 }, { x: 18, y: 16 }]),
    createStaticEnemy("550-a2", "Постовой автомат НВ-2", "sentry", "floor550", { x: 18, y: 16 }, [{ x: 18, y: 16 }, { x: 24, y: 14 }]),
    createStaticEnemy("550-b1", "Одичавший грузчик 550-Б", "stalker", "floor550", { x: 31, y: 14 }, [{ x: 31, y: 14 }, { x: 38, y: 16 }]),
    createStaticEnemy("550-b2", "Контролёр нижней линии", "sentry", "floor550", { x: 38, y: 16 }, [{ x: 38, y: 16 }, { x: 45, y: 14 }]),
    createStaticEnemy("550-c1", "Тяжёлый сборщик шлюза", "collector", "floor550", { x: 30, y: 31 }, [{ x: 30, y: 31 }, { x: 42, y: 31 }], "enhanced"),
    // Этаж 556: четыре учебные группы по два противника.
    createStaticEnemy("guard-kl4", "Постовой автомат КЛ-4/1", "sentry", "floor556", { x: 10, y: 4 }, [{ x: 10, y: 4 }, { x: 12, y: 4 }, { x: 12, y: 7 }]),
    createStaticEnemy("stalker-17", "Заблудший обходчик 556-А", "stalker", "floor556", { x: 12, y: 6 }, [{ x: 12, y: 6 }, { x: 10, y: 6 }]),
    createStaticEnemy("556-b1", "Постовой автомат КЛ-4/2", "sentry", "floor556", { x: 19, y: 4 }, [{ x: 19, y: 4 }, { x: 20, y: 6 }]),
    createStaticEnemy("556-b2", "Заблудший обходчик 556-Б", "stalker", "floor556", { x: 20, y: 6 }, [{ x: 20, y: 6 }, { x: 18, y: 6 }]),
    // Пара у датчика СБ-04: объектив смены охраняется, но не стоит вплотную к
    // лестнице вниз, иначе переход между этажами превращается в засаду.
    createStaticEnemy("556-c1", "Служебный автомат СА-6", "sentry", "floor556", { x: 26, y: 6 }, [{ x: 26, y: 6 }, { x: 27, y: 7 }]),
    createStaticEnemy("556-c2", "Одичавший жилец 556-31", "stalker", "floor556", { x: 27, y: 7 }, [{ x: 27, y: 7 }, { x: 24, y: 6 }]),
    createStaticEnemy("556-d1", "Ремонтный автомат РМ-6", "sentry", "floor556", { x: 13, y: 14 }, [{ x: 13, y: 14 }, { x: 15, y: 14 }]),
    createStaticEnemy("556-d2", "Заблудший обходчик 556-Г", "stalker", "floor556", { x: 20, y: 14 }, [{ x: 20, y: 14 }, { x: 22, y: 14 }]),
    // Этаж 555: три более плотные группы.
    createStaticEnemy("555-a1", "Ремонтный автомат РМ-55/1", "sentry", "floor555", { x: 9, y: 4 }, [{ x: 9, y: 4 }, { x: 10, y: 9 }]),
    createStaticEnemy("555-a2", "Сборщик кабеля 55-А", "stalker", "floor555", { x: 10, y: 8 }, [{ x: 10, y: 8 }, { x: 8, y: 10 }]),
    createStaticEnemy("555-b1", "Ремонтный автомат РМ-55/2", "sentry", "floor555", { x: 19, y: 9 }, [{ x: 19, y: 9 }, { x: 22, y: 10 }]),
    createStaticEnemy("555-b2", "Сборщик кабеля 55-Б", "stalker", "floor555", { x: 23, y: 9 }, [{ x: 23, y: 9 }, { x: 24, y: 12 }]),
    createStaticEnemy("555-c1", "Складской автомат СК-55", "sentry", "floor555", { x: 31, y: 11 }, [{ x: 31, y: 11 }, { x: 29, y: 19 }]),
    createStaticEnemy("555-c2", "Одичавший наладчик", "stalker", "floor555", { x: 27, y: 19 }, [{ x: 27, y: 19 }, { x: 24, y: 18 }]),
    createStaticEnemy("555-c3", "Тяжёлый сборщик деталей", "collector", "floor555", { x: 31, y: 19 }, [{ x: 31, y: 19 }, { x: 33, y: 10 }], "enhanced"),
    createStaticEnemy("557-a1", "Контурный жилец 557-8", "stalker", "floor557", { x: 10, y: 9 }, [{ x: 10, y: 9 }, { x: 12, y: 11 }]),
    createStaticEnemy("557-a2", "Домовой автомат ДА-7", "sentry", "floor557", { x: 20, y: 8 }, [{ x: 20, y: 8 }, { x: 22, y: 11 }]),
    createStaticEnemy("557-b1", "Контурный жилец 557-14", "stalker", "floor557", { x: 29, y: 13 }, [{ x: 29, y: 13 }, { x: 31, y: 18 }]),
    createStaticEnemy("557-b2", "Постовой автомат Ж-557", "sentry", "floor557", { x: 20, y: 19 }, [{ x: 20, y: 19 }, { x: 23, y: 19 }]),
    createStaticEnemy("void-collector", "Лабораторный сборщик ЛС-2", "collector", "voidLab", { x: 17, y: 9 }, [{ x: 17, y: 9 }, { x: 13, y: 7 }], "elite"),
    createStaticEnemy("void-stalker", "Слепок сотрудника ВЖ-7", "stalker", "voidLab", { x: 8, y: 7 }, [{ x: 8, y: 7 }, { x: 11, y: 9 }], "enhanced"),
  ];
}


const CITY_ROUTE_NETWORK: Point[][] = [
  [{ x: 4, y: 33 }, { x: 18, y: 33 }, { x: 28, y: 24 }, { x: 44, y: 24 }, { x: 51, y: 33 }],
  [{ x: 8, y: 11 }, { x: 18, y: 12 }, { x: 28, y: 11 }, { x: 45, y: 11 }, { x: 50, y: 24 }, { x: 28, y: 24 }],
  [{ x: 3, y: 23 }, { x: 16, y: 23 }, { x: 28, y: 24 }, { x: 39, y: 24 }, { x: 52, y: 23 }],
  [{ x: 8, y: 33 }, { x: 8, y: 24 }, { x: 18, y: 12 }, { x: 30, y: 11 }, { x: 45, y: 12 }, { x: 48, y: 24 }, { x: 47, y: 33 }],
];

function createNpc(
  id: string,
  name: string,
  kind: NpcKind,
  role: NpcRole,
  routeIndex: number,
  routeOffset = 0,
  vendorStock?: ItemId[],
): Npc {
  const route = CITY_ROUTE_NETWORK[routeIndex % CITY_ROUTE_NETWORK.length].map(copyPoint);
  const index = routeOffset % route.length;
  const position = copyPoint(route[index]);
  return {
    id,
    name,
    kind,
    role,
    zone: "floor554",
    position,
    home: copyPoint(position),
    route,
    routeIndex: (index + 1) % route.length,
    path: [],
    speed: kind === "liquidator" ? 1.35 : kind === "merchant" ? 0.85 : 1.05,
    thinkCooldownMs: 180 + routeOffset * 75,
    speech: null,
    speechUntilMs: 0,
    vendorStock,
  };
}

function createCityNpcs(): Npc[] {
  const residents: Npc[] = [
    createNpc("city-registrar", "Алла Климова", "resident", "registrar", 0, 0),
    createNpc("city-grocer", "Яков Бородин", "merchant", "grocer", 0, 1, ["fieldRation", "bandage", "painkillers"]),
    createNpc("city-medic", "Роза Миронова", "merchant", "medic", 0, 2, ["bandage", "traumaInjector", "painkillers"]),
    createNpc("city-weapons", "Тимур Панкратов", "merchant", "weaponsmith", 1, 0, ["shockBaton", "servicePistol", "breachAxe"]),
    createNpc("city-armorer", "Нина Корнеева", "merchant", "armorer", 1, 1, ["hermeticJacketGk3", "platedVestBn3", "respiratorIp7"]),
    createNpc("city-technician", "Аркадий Власов", "merchant", "technician", 1, 2, ["repairKit", "batteryPack", "filterCartridge"]),
    createNpc("city-courier-1", "Лев Гущин", "resident", "courier", 2, 0),
    createNpc("city-courier-2", "Майя Черкасова", "resident", "courier", 2, 1),
    createNpc("city-porter-1", "Григорий Савельев", "resident", "porter", 2, 2),
    createNpc("city-porter-2", "Вера Лукина", "resident", "porter", 2, 3),
    createNpc("city-cook", "Марина Шестакова", "resident", "cook", 3, 0),
    createNpc("city-archivist", "Павел Ершов", "resident", "archivist", 3, 1),
    createNpc("city-electrician", "Олег Крюков", "resident", "electrician", 3, 2),
    createNpc("city-watermaster", "Софья Ракитина", "resident", "watermaster", 3, 3),
    createNpc("city-tailor", "Ирина Малова", "resident", "tailor", 0, 3),
    createNpc("city-teacher", "Вадим Снегирёв", "resident", "teacher", 1, 3),
    createNpc("city-watchman", "Степан Горин", "resident", "watchman", 2, 4),
    createNpc("city-resident-1", "Алексей Рощин", "resident", "resident", 0, 4),
    createNpc("city-resident-2", "Лидия Фомина", "resident", "resident", 1, 4),
    createNpc("city-resident-3", "Михаил Зотов", "resident", "resident", 2, 0),
    createNpc("city-resident-4", "Елена Брагина", "resident", "resident", 3, 4),
    createNpc("city-resident-5", "Антон Мельников", "resident", "resident", 0, 0),
    createNpc("city-resident-6", "Дарья Кулагина", "resident", "resident", 1, 5),
    createNpc("city-resident-7", "Борис Колесников", "resident", "resident", 2, 1),
    createNpc("city-resident-8", "Тамара Белова", "resident", "resident", 3, 5),
  ];

  const liquidators: Npc[] = [
    createNpc("liq-a-leader", "Старший Лаврентьев", "liquidator", "liquidator-leader", 3, 0),
    createNpc("liq-a-chemist", "Химик Дёмин", "liquidator", "liquidator-chemist", 3, 0),
    createNpc("liq-a-rifle", "Стрелок Юдина", "liquidator", "liquidator-rifleman", 3, 0),
    createNpc("liq-b-leader", "Старшая Сомова", "liquidator", "liquidator-leader", 1, 2),
    createNpc("liq-b-chemist", "Химик Руднев", "liquidator", "liquidator-chemist", 1, 2),
    createNpc("liq-b-rifle", "Стрелок Островский", "liquidator", "liquidator-rifleman", 1, 2),
    createNpc("liq-c-leader", "Старший Жаров", "liquidator", "liquidator-leader", 2, 4),
    createNpc("liq-c-chemist", "Химик Громова", "liquidator", "liquidator-chemist", 2, 4),
    createNpc("liq-c-rifle", "Стрелок Минаев", "liquidator", "liquidator-rifleman", 2, 4),
  ];

  return [...residents, ...liquidators];
}

export function cityPopulationCounts(state: GameState): { residents: number; liquidators: number } {
  return state.npcs.reduce(
    (counts, npc) => {
      if (npc.zone !== "floor554") return counts;
      if (npc.kind === "liquidator") counts.liquidators += 1;
      else counts.residents += 1;
      return counts;
    },
    { residents: 0, liquidators: 0 },
  );
}

export function npcById(state: GameState, npcId: string | null): Npc | null {
  if (!npcId) return null;
  return state.npcs.find((npc) => npc.id === npcId) ?? null;
}

export function npcRoleLabel(role: NpcRole): string {
  return {
    registrar: "регистратор",
    grocer: "торговец провизией",
    medic: "фельдшер",
    weaponsmith: "оружейник",
    armorer: "бронник",
    technician: "техник",
    courier: "курьер",
    porter: "грузчик",
    cook: "повар",
    archivist: "архивист",
    electrician: "электрик",
    watermaster: "смотритель воды",
    tailor: "портной",
    teacher: "наставник",
    watchman: "дозорный",
    resident: "житель",
    "liquidator-leader": "старший ликвидатор",
    "liquidator-chemist": "ликвидатор-химик",
    "liquidator-rifleman": "ликвидатор-стрелок",
  }[role];
}

export function mapForZone(zone: ZoneId): MapDefinition {
  if (zone in REGION_MAPS) return REGION_MAPS[zone as RegionZoneId] as MapDefinition;
  if (zone === "floor550") return FLOOR_550_MAP;
  if (zone === "floor554") return FLOOR_554_MAP;
  if (zone === "floor555") return FLOOR_555_MAP;
  if (zone === "floor556") return FLOOR_MAP;
  if (zone === "floor557") return FLOOR_557_MAP;
  return VOID_MAP;
}

function tileAtZone(
  state: Pick<GameState, "mutated">,
  zone: ZoneId,
  point: Point,
): string {
  const map = mapForZone(zone);
  const x = Math.round(point.x);
  const y = Math.round(point.y);
  if (y < 0 || y >= map.rows.length || x < 0 || x >= map.rows[0].length) {
    return "#";
  }
  if (zone === "floor556" && state.mutated) {
    // Отклонение от типового проекта: перегородка между техническими
    // помещениями вскрыта, появился короткий путь в обход коридора.
    if (x === 8 && y === 5) return ".";
  }
  return map.rows[y][x];
}

export function tileAt(state: GameState, point: Point): string {
  return tileAtZone(state, state.zone, point);
}

function isWalkableIn(state: GameState, zone: ZoneId, point: Point): boolean {
  return tileAtZone(state, zone, point) !== "#";
}

export function isHermeticRoomTile(tile: string): boolean {
  return tile === "g";
}

export function isCitySafeZone(zone: ZoneId): boolean {
  return zone === "floor554" || REGION_SAFE_ZONES.has(zone as RegionZoneId);
}

export function isSamosborProtectedAt(
  state: Pick<GameState, "mutated">,
  zone: ZoneId,
  point: Point,
): boolean {
  return isCitySafeZone(zone) || isHermeticRoomTile(tileAtZone(state, zone, point));
}

export function isHeroInHermeticRoom(state: GameState): boolean {
  return isHermeticRoomTile(tileAt(state, state.hero.positions[state.zone]));
}

function isEnemyWalkableIn(state: GameState, zone: ZoneId, point: Point): boolean {
  const tile = tileAtZone(state, zone, point);
  return !isCitySafeZone(zone) && tile !== "#" && tile !== "H" && tile !== "g";
}

function isNpcWalkableIn(state: GameState, zone: ZoneId, point: Point): boolean {
  const tile = tileAtZone(state, zone, point);
  return tile !== "#" && tile !== "H" && tile !== "g";
}

export function isWalkable(state: GameState, point: Point): boolean {
  return isWalkableIn(state, state.zone, point);
}

export function coverBonus(state: GameState, point: Point): number {
  return tileAt(state, point) === "c" ? 2 : 0;
}

export function hasLineOfSight(state: GameState, from: Point, to: Point): boolean {
  const start = gridPoint(from);
  const end = gridPoint(to);
  let x = start.x;
  let y = start.y;
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let error = dx - dy;

  while (x !== end.x || y !== end.y) {
    const doubled = error * 2;
    if (doubled > -dy) {
      error -= dy;
      x += sx;
    }
    if (doubled < dx) {
      error += dx;
      y += sy;
    }
    if (x !== end.x || y !== end.y) {
      const tile = tileAt(state, { x, y });
      if (tile === "#" || tile === "H") return false;
    }
  }
  return true;
}

function appendLog(state: GameState, message: string): GameState {
  return { ...state, log: [message, ...state.log].slice(0, 14) };
}

function addEffect(
  state: GameState,
  from: Point,
  to: Point,
  kind: CombatEffect["kind"],
  value: number,
): GameState {
  const id = state.effectCounter + 1;
  return {
    ...state,
    effectCounter: id,
    effects: [
      ...state.effects,
      { id, from: copyPoint(from), to: copyPoint(to), kind, value, ttlMs: 360 },
    ].slice(-8),
  };
}

function emitNoise(
  state: GameState,
  position: Point,
  radius: number,
  label: string,
): GameState {
  return {
    ...state,
    noise: {
      zone: state.zone,
      position: copyPoint(position),
      radius,
      label,
      ttlMs: 1100,
    },
  };
}

function rollPercent(state: GameState): { state: GameState; roll: number } {
  const seed = (Math.imul(state.rngSeed, 1664525) + 1013904223) >>> 0;
  return { state: { ...state, rngSeed: seed }, roll: seed % 100 };
}

export function branchTalentPoints(state: GameState, branch: SkillBranch): number {
  return state.hero.talents.reduce((total, talentId) => {
    const node = TALENT_BY_ID[talentId];
    return total + (node?.scope === branch ? node.cost : 0);
  }, 0);
}

export function hasTalent(state: GameState, talentId: string): boolean {
  return state.hero.talents.includes(talentId);
}

export function talentBonus(state: GameState, key: TalentBonusKey): number {
  return state.hero.talents.reduce((total, talentId) => {
    return total + (TALENT_BY_ID[talentId]?.bonuses[key] ?? 0);
  }, 0);
}

export function canAllocateTalent(state: GameState, talentId: string): boolean {
  const node = TALENT_BY_ID[talentId];
  if (!node || hasTalent(state, talentId)) return false;
  const availablePoints = node.scope === "core" ? state.hero.generalPoints : state.hero.skillPoints;
  if (availablePoints < node.cost) return false;
  if (node.scope === "legendary") {
    return state.hero.discoveredTalents.includes(talentId);
  }
  if (node.scope === "hybrid") {
    if (!node.pair) return false;
    return node.pair.every((branch) => branchTalentPoints(state, branch) >= 8);
  }
  const branch = branchForTalent(node);
  if (!branch) return true;
  return branchTalentPoints(state, branch) >= (node.requiredBranchPoints ?? 0);
}

export function allocateTalent(state: GameState, talentId: string): GameState {
  if (!canAllocateTalent(state, talentId)) return state;
  const node = TALENT_BY_ID[talentId];
  const branch = branchForTalent(node);
  const talents = [...state.hero.talents, talentId];
  const skills = branch
    ? { ...state.hero.skills, [branch]: state.hero.skills[branch] + node.cost }
    : state.hero.skills;
  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      talents,
      skills,
      skillPoints: node.scope === "core" ? state.hero.skillPoints : state.hero.skillPoints - node.cost,
      generalPoints: node.scope === "core" ? state.hero.generalPoints - node.cost : state.hero.generalPoints,
    },
  };
  next = { ...next, hero: { ...next.hero, hp: Math.min(maxHeroHp(next), next.hero.hp) } };
  return appendLog(next, `Освоен талант «${node.name}».`);
}

export function unlockedActiveSkills(state: GameState): ActiveSkillId[] {
  return (Object.keys(ACTIVE_SKILLS) as ActiveSkillId[]).filter((skillId) => {
    const skill = ACTIVE_SKILLS[skillId];
    return branchTalentPoints(state, skill.branch) >= skill.unlockAt;
  });
}

export function assignActiveSkill(
  state: GameState,
  slot: number,
  skillId: ActiveSkillId | null,
): GameState {
  if (slot < 0 || slot > 3) return state;
  if (skillId && !unlockedActiveSkills(state).includes(skillId)) return state;
  const slots = [...state.hero.activeSkillSlots];
  if (skillId) {
    const occupied = slots.indexOf(skillId);
    if (occupied >= 0) slots[occupied] = null;
  }
  slots[slot] = skillId;
  return {
    ...state,
    hero: { ...state.hero, activeSkillSlots: slots },
  };
}

export function combatDirectiveFor(state: GameState): CombatDirective {
  if (talentBonus(state, "movingFire") >= 1 && talentBonus(state, "autoTarget") >= 1) {
    return "mobileFire";
  }
  if (talentBonus(state, "splash") >= 0.2 || talentBonus(state, "tauntRadius") >= 3) {
    return "splashGuard";
  }
  return "adaptive";
}

export function setCombatDirective(
  state: GameState,
  _combatDirective: CombatDirective,
): GameState {
  const combatDirective = combatDirectiveFor(state);
  return appendLog(
    { ...state, hero: { ...state.hero, combatDirective } },
    combatDirective === "mobileFire"
      ? "Архетип определён талантами: мобильный огонь."
      : combatDirective === "splashGuard"
        ? "Архетип определён талантами: силовой сбор пачки."
        : "Архетип определён талантами: адаптивный автоконтур.",
  );
}

/** Снимок боя для системы режимов: всё, что нужно для решения, и ничего лишнего. */
export function combatSnapshot(state: GameState): CombatSnapshot {
  const hero = state.hero.positions[state.zone];
  const target = enemyById(state, state.hero.attackTargetId);
  const enemiesWithin = state.enemies.filter(
    (enemy) => enemy.zone === state.zone && enemy.hp > 0 && distance(enemy.position, hero) <= 4,
  ).length;
  const incomingHeavy = state.enemies.some(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      enemy.castUntilMs > state.worldTimeMs &&
      distance(enemy.position, hero) <= enemy.attackRange + 0.5,
  );
  return {
    hpShare: state.hero.hp / Math.max(1, maxHeroHp(state)),
    // Дыхание появится вместе с переводом боя на модель v2; до этого его долю
    // заменяет запас стресса: пока это единственный ресурс давления в игре.
    breathShare: 1 - Math.min(1, state.hero.stress / 100),
    resourceShare: target ? Math.min(1, target.resonanceStacks / 4) : 0,
    hasTarget: Boolean(target),
    targetHpShare: target ? target.hp / Math.max(1, target.maxHp) : 1,
    targetStaggered: Boolean(target && target.stunnedUntilMs > state.worldTimeMs),
    targetShaken: Boolean(target && target.hp <= Math.ceil(target.maxHp * 0.3)),
    targetMarked: Boolean(target && target.markedUntilMs > state.worldTimeMs),
    targetDistance: target ? distance(hero, target.position) : Number.POSITIVE_INFINITY,
    enemiesWithin,
    incomingHeavy,
    inPosition: state.hero.path.length === 0 && !state.hero.evadeMode,
  };
}

export function controlModeFor(state: GameState): ControlMode {
  return state.hero.controlMode ?? "manual";
}

export function setControlMode(state: GameState, mode: ControlMode): GameState {
  if (controlModeFor(state) === mode) return state;
  return appendLog(
    { ...state, hero: { ...state.hero, controlMode: mode } },
    `Режим управления: ${CONTROL_MODE_LABELS[mode].toLowerCase()}.`,
  );
}

export function setAutopilotTemper(state: GameState, temper: AutopilotTemper): GameState {
  return { ...state, hero: { ...state.hero, autopilotTemper: temper } };
}

/** Что режим предлагает делать прямо сейчас. Ручной режим не предлагает ничего. */
export function currentModeAction(state: GameState): CombatAction | null {
  return decideAction(controlModeFor(state), combatSnapshot(state), {
    temper: state.hero.autopilotTemper ?? "aggressive",
  });
}

/** Автоконтур тратит расходники и ресурс экипировки быстрее ручного боя. */
export function modeWearCost(state: GameState, base: number): number {
  return Math.round(base * CONTROL_MODE_COST[controlModeFor(state)].wearRate);
}

export function inventoryEntryById(
  state: GameState,
  instanceId: string | null,
): InventoryEntry | null {
  if (!instanceId) return null;
  return state.hero.inventory.find((entry) => entry.instanceId === instanceId) ?? null;
}

export function equippedEntry(state: GameState, slot: GearSlot): InventoryEntry | null {
  return inventoryEntryById(state, state.hero.equipment[slot]);
}

export function itemDefinition(entry: InventoryEntry): ItemDefinition {
  return ITEMS[entry.itemId];
}

function conditionEffectiveness(entry: InventoryEntry): number {
  if (entry.condition >= 50) return 1;
  if (entry.condition >= 20) return 0.5;
  return 0.25;
}

function equipmentScalar(
  state: GameState,
  key: "armor" | "maxHp" | "moveSpeed" | "carry" | "stealth",
): number {
  return (Object.keys(state.hero.equipment) as GearSlot[]).reduce((total, slot) => {
    const entry = equippedEntry(state, slot);
    if (!entry) return total;
    const value = ITEMS[entry.itemId].stats?.[key] ?? 0;
    return total + value * conditionEffectiveness(entry);
  }, 0);
}

export function effectiveAttribute(state: GameState, attribute: AttributeId): number {
  const gearBonus = (Object.keys(state.hero.equipment) as GearSlot[]).reduce((total, slot) => {
    const entry = equippedEntry(state, slot);
    if (!entry) return total;
    const value = ITEMS[entry.itemId].stats?.attributes?.[attribute] ?? 0;
    return total + value * conditionEffectiveness(entry);
  }, 0);
  return state.hero.attributes[attribute] + gearBonus;
}

export function allocateAttribute(state: GameState, attribute: AttributeId): GameState {
  if (state.hero.attributePoints <= 0) return state;
  const next = {
    ...state,
    hero: {
      ...state.hero,
      attributePoints: state.hero.attributePoints - 1,
      attributes: {
        ...state.hero.attributes,
        [attribute]: state.hero.attributes[attribute] + 1,
      },
    },
  };
  const labels: Record<AttributeId, string> = {
    body: "Тело",
    reaction: "Реакция",
    attention: "Внимание",
    technique: "Техника",
    will: "Воля",
  };
  return appendLog(next, `Базовый атрибут «${labels[attribute]}» повышен до ${next.hero.attributes[attribute]}.`);
}

export function effectiveInjury(state: GameState, injury: keyof Injuries): number {
  const relief =
    state.hero.relievedInjury === injury && state.hero.injuryReliefUntilMs > state.worldTimeMs
      ? 1
      : 0;
  return Math.max(0, state.injuries[injury] - relief);
}

export function inventoryWeight(state: GameState): number {
  return state.hero.inventory.reduce(
    (total, entry) => total + ITEMS[entry.itemId].weight * entry.quantity,
    0,
  );
}

export function carryCapacity(state: GameState): number {
  return 12 + effectiveAttribute(state, "body") * 2 + equipmentScalar(state, "carry") + talentBonus(state, "carry");
}

export function weaponEntry(state: GameState): InventoryEntry | null {
  const entry = equippedEntry(state, "weapon");
  return entry && entry.itemId in WEAPONS ? entry : null;
}

export function weaponFor(state: GameState): WeaponDefinition {
  const entry = weaponEntry(state);
  return entry ? WEAPONS[entry.itemId as WeaponId] : WEAPONS.servicePistol;
}

export function equippedArtifact(state: GameState): InventoryEntry | null {
  const entry = equippedEntry(state, "artifact");
  return entry && ITEMS[entry.itemId].kind === "artifact" ? entry : null;
}

export function maxHeroHp(state: GameState): number {
  return modelMaxHeroHp({
    level: state.hero.level,
    body: effectiveAttribute(state, "body"),
    equipment: Math.round(equipmentScalar(state, "maxHp")),
    talents: Math.round(talentBonus(state, "maxHp") * 12),
    torsoInjury: Math.min(2, effectiveInjury(state, "torso")),
    contamination: state.hero.contamination,
  });
}

export function maxHeroStance(state: GameState): number {
  return modelMaxHeroStance({
    level: state.hero.level,
    body: effectiveAttribute(state, "body"),
    will: effectiveAttribute(state, "will"),
    equipment: Math.round(equipmentScalar(state, "armor") * 0.5),
  });
}

export function maxHeroBreath(state: GameState): number {
  return modelMaxHeroBreath({
    reaction: effectiveAttribute(state, "reaction"),
    will: effectiveAttribute(state, "will"),
  });
}

/** Множитель регенерации дыхания от состояния лицевого снаряжения. */
function maskFactor(state: GameState): number {
  const mask = equippedEntry(state, "head");
  if (!mask) return isCitySafeZone(state.zone) ? 1 : 0.65;
  return mask.condition < 40 ? 0.8 : 1;
}

export function heroBreathRegen(state: GameState): number {
  const overload = Math.max(0, inventoryWeight(state) - carryCapacity(state));
  return breathRegenPerSecond({
    overloadShare: overload / Math.max(1, carryCapacity(state)),
    contamination: state.hero.contamination,
    stress: state.hero.stress,
    maskFactor: maskFactor(state),
  });
}

export function heroStanceState(state: GameState): StanceState {
  if (state.hero.staggeredUntilMs > state.worldTimeMs) return "staggered";
  return stanceState(state.hero.stance, maxHeroStance(state));
}

export function heroMoveSpeed(state: GameState): number {
  const injuryFactor = 1 - Math.min(2, effectiveInjury(state, "leg")) * 0.16;
  const overload = Math.max(0, inventoryWeight(state) - carryCapacity(state));
  const overloadFactor = Math.max(0.55, 1 - overload * 0.08);
  const surge =
    archetypeFor(state) === "power" ? surgeSpeedBonus(surgeStepsFor(state.hero.surgeMs)) : 0;
  const deployed =
    archetypeFor(state) === "heavy_gunner" && state.hero.deployedSinceMs > 0
      ? 1 - SET_UP_SPEED_PENALTY
      : 1;
  return Math.max(
    0.65,
    (2.35 +
      effectiveAttribute(state, "reaction") * 0.08 +
      equipmentScalar(state, "moveSpeed") +
      talentBonus(state, "moveSpeed") +
      surge) *
      injuryFactor *
      overloadFactor *
      deployed,
  );
}

export function heroDefense(state: GameState): number {
  const stressPenalty = state.hero.stress >= 75 ? 1 : 0;
  const braced = state.hero.braceUntilMs > state.worldTimeMs ? 3 : 0;
  return Math.max(
    8,
    9 +
      Math.floor(effectiveAttribute(state, "reaction") / 2) +
      talentBonus(state, "armor") +
      braced +
      Math.floor(equipmentScalar(state, "armor")) -
      effectiveInjury(state, "head") -
      stressPenalty +
      coverBonus(state, state.hero.positions[state.zone]),
  );
}

export function heroAttackRange(state: GameState): number {
  return weaponFor(state).range;
}

export function heroAttackCooldown(state: GameState): number {
  const technique = effectiveAttribute(state, "technique") * 0.018;
  const talentSpeed = talentBonus(state, "attackSpeed");
  const overclock = state.hero.overclockUntilMs > state.worldTimeMs ? 0.18 : 0;
  const damagedWeapon = weaponEntry(state)?.condition ?? 100;
  const conditionPenalty = damagedWeapon < 40 ? 0.22 : damagedWeapon < 70 ? 0.08 : 0;
  return Math.max(
    360,
    weaponFor(state).cooldownMs * (1 - technique - talentSpeed - overclock + conditionPenalty),
  );
}

export function heroAttackDamage(state: GameState): number {
  const weapon = weaponFor(state);
  const branchBonus = weapon.category === "melee"
    ? talentBonus(state, "meleeDamage")
    : talentBonus(state, "rangedDamage");
  const conditionPenalty = (weaponEntry(state)?.condition ?? 100) < 35 ? 1 : 0;
  return Math.max(1, weapon.damage + branchBonus - effectiveInjury(state, "arm") - conditionPenalty);
}

export const MAX_HERO_LEVEL = 50;

export function xpRequiredForLevel(level: number): number {
  if (level >= MAX_HERO_LEVEL) return 0;
  return Math.round(120 * level ** 1.42 + 80 * level);
}

export function xpToNextLevel(state: GameState): number {
  return xpRequiredForLevel(state.hero.level);
}

function levelRewardType(level: number): "general" | "professional" {
  return level <= 40 && level % 2 === 0 ? "general" : "professional";
}

function enemyRankForXp(enemy: Enemy): EnemyRank {
  if (enemy.rank) return enemy.rank;
  if (enemy.xpValue >= 24) return "elite";
  if (enemy.xpValue >= 12) return "enhanced";
  return "common";
}

export function enemyXpReward(state: GameState, enemy: Enemy): number {
  const ratios: Record<EnemyRank, number> = {
    common: 0.008,
    enhanced: 0.018,
    veteran: 0.03,
    elite: 0.055,
    boss: 0.18,
  };
  return Math.max(1, Math.round(xpRequiredForLevel(state.hero.level) * ratios[enemyRankForXp(enemy)]));
}

function questXpReward(state: GameState, share: number): number {
  return Math.max(1, Math.round(xpRequiredForLevel(state.hero.level) * share));
}

function visibleRadius(state: GameState): number {
  const scouting = state.hero.scoutUntilMs > state.worldTimeMs ? SCOUT_VISION_BONUS : 0;
  return Math.max(
    2,
    5 + Math.floor(effectiveAttribute(state, "attention") / 2) - effectiveInjury(state, "eye") + scouting,
  );
}

function reveal(state: GameState): GameState {
  const hero = state.hero.positions[state.zone];
  const map = mapForZone(state.zone);
  const known = new Set(state.visited[state.zone]);
  const radius = visibleRadius(state);
  for (let y = 0; y < map.rows.length; y += 1) {
    for (let x = 0; x < map.rows[0].length; x += 1) {
      const point = { x, y };
      if (distance(hero, point) <= radius && hasLineOfSight(state, hero, point)) {
        known.add(pointKey(point));
      }
    }
  }
  return {
    ...state,
    visited: { ...state.visited, [state.zone]: [...known] },
  };
}

export function isKnown(state: GameState, point: Point): boolean {
  return state.visited[state.zone].includes(pointKey(gridPoint(point)));
}

export function isVisible(state: GameState, point: Point): boolean {
  const hero = state.hero.positions[state.zone];
  return distance(hero, point) <= visibleRadius(state) && hasLineOfSight(state, hero, point);
}

export function enemyVisibleToHero(state: GameState, enemy: Enemy): boolean {
  return enemy.zone === state.zone && enemy.hp > 0 && isVisible(state, enemy.position);
}

export function enemyById(state: GameState, enemyId: string | null): Enemy | null {
  if (!enemyId) return null;
  return state.enemies.find((enemy) => enemy.id === enemyId && enemy.hp > 0) ?? null;
}

function livingEnemyKeys(state: GameState, zone: ZoneId, exceptId?: string): Set<string> {
  return new Set(
    state.enemies
      .filter((enemy) => enemy.zone === zone && enemy.hp > 0 && enemy.id !== exceptId)
      .map((enemy) => pointKey(gridPoint(enemy.position))),
  );
}

type PathActor = "hero" | "enemy" | "npc";

function canUseDiagonal(
  state: GameState,
  zone: ZoneId,
  from: Point,
  to: Point,
  actor: PathActor,
): boolean {
  if (from.x === to.x || from.y === to.y) return true;
  const walkable = actor === "enemy" ? isEnemyWalkableIn : actor === "npc" ? isNpcWalkableIn : isWalkableIn;
  return (
    walkable(state, zone, { x: to.x, y: from.y }) &&
    walkable(state, zone, { x: from.x, y: to.y })
  );
}

function findPath(
  state: GameState,
  zone: ZoneId,
  from: Point,
  target: Point,
  blocked: Set<string>,
  actor: PathActor = "hero",
): Point[] | null {
  const start = gridPoint(from);
  const goal = gridPoint(target);
  const walkable = actor === "enemy" ? isEnemyWalkableIn : actor === "npc" ? isNpcWalkableIn : isWalkableIn;
  if (!walkable(state, zone, goal) || blocked.has(pointKey(goal))) return null;
  const open: Point[] = [start];
  const cameFrom = new Map<string, Point | null>([[pointKey(start), null]]);
  const cost = new Map<string, number>([[pointKey(start), 0]]);

  while (open.length > 0) {
    open.sort((a, b) => {
      const costA = (cost.get(pointKey(a)) ?? Infinity) + distance(a, goal);
      const costB = (cost.get(pointKey(b)) ?? Infinity) + distance(b, goal);
      return costA - costB;
    });
    const current = open.shift() as Point;
    if (sameGridPoint(current, goal)) break;

    for (const direction of DIRECTIONS) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = pointKey(next);
      if (
        !walkable(state, zone, next) ||
        blocked.has(key) ||
        !canUseDiagonal(state, zone, current, next, actor)
      ) {
        continue;
      }
      const nextCost =
        (cost.get(pointKey(current)) ?? 0) +
        (direction.x !== 0 && direction.y !== 0 ? Math.SQRT2 : 1);
      if (nextCost < (cost.get(key) ?? Infinity)) {
        cost.set(key, nextCost);
        cameFrom.set(key, current);
        if (!open.some((point) => sameGridPoint(point, next))) open.push(next);
      }
    }
  }

  if (!cameFrom.has(pointKey(goal))) return null;
  const path: Point[] = [];
  let cursor: Point | null = goal;
  while (cursor) {
    path.unshift(copyPoint(cursor));
    cursor = cameFrom.get(pointKey(cursor)) ?? null;
  }
  return path;
}

function advanceAlongPath(
  position: Point,
  path: Point[],
  travelDistance: number,
): { position: Point; path: Point[] } {
  let current = copyPoint(position);
  const route = path.map(copyPoint);
  let remaining = travelDistance;
  while (route.length > 0 && remaining > 0) {
    const target = route[0];
    const segment = distance(current, target);
    if (segment <= 0.001) {
      current = copyPoint(target);
      route.shift();
      continue;
    }
    if (segment <= remaining) {
      current = copyPoint(target);
      remaining -= segment;
      route.shift();
    } else {
      const ratio = remaining / segment;
      current = {
        x: current.x + (target.x - current.x) * ratio,
        y: current.y + (target.y - current.y) * ratio,
      };
      remaining = 0;
    }
  }
  return { position: current, path: route };
}

function hasActiveThreats(state: GameState): boolean {
  return state.enemies.some(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      ["suspicious", "hunting", "combat"].includes(enemy.mode),
  );
}

const CITY_CONVERSATIONS: [string, string][] = [
  ["На нижней линии снова скачет напряжение.", "Крюков обещал проверить щиты после смены."],
  ["Ликвидаторы вернулись без третьего контейнера.", "Главное, что все трое вернулись своими ногами."],
  ["У Бородина сегодня настоящий чай.", "Тогда очередь будет до самого регистратора."],
  ["Слышал гул со стороны пятисот пятидесятого?", "Слышал. Гермодвери проверил дважды."],
  ["Караван с 545-го задерживается.", "Значит, пайки снова будут по спискам."],
  ["В архиве нашли схему старой ветки метро.", "Не говори об этом рядом с обходчиками."],
  ["После Самосбора запах держался три дня.", "Зато химики выжгли весь западный коридор."],
  ["Сегодня город необычно тихий.", "Не произноси это вслух. Стены слушают."],
];

function npcRouteTarget(npc: Npc): Point {
  return npc.route[npc.routeIndex % npc.route.length] ?? npc.home;
}

function closestNpcPair(npcs: Npc[]): [Npc, Npc] | null {
  let pair: [Npc, Npc] | null = null;
  let best = Infinity;
  for (let left = 0; left < npcs.length; left += 1) {
    for (let right = left + 1; right < npcs.length; right += 1) {
      const current = distance(npcs[left].position, npcs[right].position);
      if (current < best && current <= 4.5) {
        best = current;
        pair = [npcs[left], npcs[right]];
      }
    }
  }
  return pair;
}

function tickCityNpcs(state: GameState, deltaMs: number): GameState {
  const cityActive = state.zone === "floor554";
  const npcs = state.npcs.map((npc, index) => {
    let current: Npc = {
      ...npc,
      speech: npc.speechUntilMs > state.worldTimeMs ? npc.speech : null,
      thinkCooldownMs: Math.max(0, npc.thinkCooldownMs - deltaMs),
    };
    if (!cityActive || current.zone !== "floor554") return current;

    let target = npcRouteTarget(current);
    if (distance(current.position, target) < 0.35) {
      current = { ...current, routeIndex: (current.routeIndex + 1) % current.route.length, path: [] };
      target = npcRouteTarget(current);
    }
    if (!current.path.length && current.thinkCooldownMs <= 0) {
      const path = findPath(state, current.zone, current.position, target, new Set(), "npc");
      current = {
        ...current,
        path: path?.slice(1) ?? [],
        thinkCooldownMs: 650 + ((index * 97) % 500),
      };
    }
    if (current.path.length) {
      const motion = advanceAlongPath(current.position, current.path, current.speed * (deltaMs / 1000));
      current = { ...current, position: motion.position, path: motion.path };
    }
    return current;
  });

  let next: GameState = {
    ...state,
    npcs,
    npcConversationCooldownMs: Math.max(0, state.npcConversationCooldownMs - deltaMs),
  };
  if (!cityActive || next.npcConversationCooldownMs > 0) return next;

  const pair = closestNpcPair(npcs.filter((npc) => npc.zone === "floor554"));
  if (!pair) return { ...next, npcConversationCooldownMs: 3000 };
  const cycle = Math.floor(next.worldTimeMs / 9000);
  const lines = CITY_CONVERSATIONS[cycle % CITY_CONVERSATIONS.length];
  next = {
    ...next,
    npcConversationCooldownMs: 7000 + (cycle % 4) * 900,
    npcs: next.npcs.map((npc) =>
      npc.id === pair[0].id
        ? { ...npc, speech: lines[0], speechUntilMs: next.worldTimeMs + 4200 }
        : npc.id === pair[1].id
          ? { ...npc, speech: lines[1], speechUntilMs: next.worldTimeMs + 4600 }
          : npc,
    ),
  };
  return appendLog(next, `${pair[0].name}: «${lines[0]}» ${pair[1].name}: «${lines[1]}»`);
}

export function commandMove(state: GameState, target: Point): GameState {
  if (!isWalkable(state, target)) return state;
  const blocked = livingEnemyKeys(state, state.zone);
  const path = findPath(
    state,
    state.zone,
    state.hero.positions[state.zone],
    gridPoint(target),
    blocked,
  );
  if (!path) return appendLog(state, "Маршрут перекрыт.");
  const enteringEvade = state.hero.evadeMode || Boolean(state.hero.attackTargetId) || hasActiveThreats(state);
  return {
    ...state,
    hero: {
      ...state.hero,
      path: path.slice(1),
      destination: gridPoint(target),
      attackTargetId: null,
      pendingInteraction: null,
      evadeMode: enteringEvade,
    },
  };
}

function approachPath(state: GameState, enemy: Enemy, range: number): Point[] | null {
  const map = mapForZone(state.zone);
  const hero = state.hero.positions[state.zone];
  const blocked = livingEnemyKeys(state, state.zone, enemy.id);
  blocked.add(pointKey(gridPoint(enemy.position)));
  const candidates: { path: Point[]; score: number }[] = [];
  for (let y = 0; y < map.rows.length; y += 1) {
    for (let x = 0; x < map.rows[0].length; x += 1) {
      const point = { x, y };
      if (
        distance(point, enemy.position) > Math.max(0.9, range * 0.92) ||
        !isWalkableIn(state, state.zone, point) ||
        !hasLineOfSight(state, point, enemy.position)
      ) {
        continue;
      }
      const path = findPath(state, state.zone, hero, point, blocked);
      if (path) candidates.push({ path, score: path.length + distance(point, enemy.position) * 0.1 });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates[0]?.path ?? null;
}

export function commandAttack(state: GameState, enemyId: string): GameState {
  const enemy = enemyById(state, enemyId);
  if (!enemy || enemy.zone !== state.zone || !enemyVisibleToHero(state, enemy)) return state;
  const inRange =
    distance(state.hero.positions[state.zone], enemy.position) <= heroAttackRange(state) &&
    hasLineOfSight(state, state.hero.positions[state.zone], enemy.position);
  const route = inRange ? [] : approachPath(state, enemy, heroAttackRange(state));
  const keepKitingRoute =
    inRange &&
    state.hero.combatDirective === "mobileFire" &&
    weaponFor(state).category === "ranged" &&
    talentBonus(state, "movingFire") >= 1;
  return {
    ...state,
    hero: {
      ...state.hero,
      attackTargetId: enemyId,
      pendingInteraction: null,
      evadeMode: false,
      path: keepKitingRoute ? state.hero.path : route ? route.slice(1) : [],
      destination: keepKitingRoute ? state.hero.destination : route?.at(-1) ?? null,
      repathCooldownMs: 0,
    },
  };
}

export function commandAttackNearest(state: GameState): GameState {
  const hero = state.hero.positions[state.zone];
  const nearest = state.enemies
    .filter((enemy) => enemyVisibleToHero(state, enemy))
    .sort((a, b) => distance(hero, a.position) - distance(hero, b.position))[0];
  return nearest ? commandAttack(state, nearest.id) : appendLog(state, "Видимых целей нет.");
}

export function cancelHeroAction(state: GameState): GameState {
  return appendLog(
    {
      ...state,
      hero: {
        ...state.hero,
        path: [],
        destination: null,
        attackTargetId: null,
        pendingInteraction: null,
        evadeMode: true,
      },
    },
    "Режим отступления включён: автоматические атаки отключены до новой команды на бой.",
  );
}

export function canCarryItem(state: GameState, itemId: ItemId, quantity = 1): boolean {
  return inventoryWeight(state) + ITEMS[itemId].weight * quantity <= carryCapacity(state) + 0.001;
}

function discoverTalentsFromItem(state: GameState, itemId: ItemId): GameState {
  const discoveries = ITEMS[itemId].grantedTalents ?? [];
  const newDiscoveries = discoveries.filter(
    (talentId) => TALENT_BY_ID[talentId] && !state.hero.discoveredTalents.includes(talentId),
  );
  if (!newDiscoveries.length) return state;
  return appendLog(
    {
      ...state,
      hero: {
        ...state.hero,
        discoveredTalents: [...state.hero.discoveredTalents, ...newDiscoveries],
      },
    },
    `Легендарный протокол добавлен во внешнее кольцо дерева: ${newDiscoveries.map((id) => TALENT_BY_ID[id].name).join(", ")}.`,
  );
}

function addInventoryItem(
  state: GameState,
  itemId: ItemId,
  quantity = 1,
  condition = 100,
): { state: GameState; added: boolean } {
  if (quantity <= 0 || !canCarryItem(state, itemId, quantity)) {
    return { state, added: false };
  }
  const definition = ITEMS[itemId];
  if (definition.stackable) {
    const existing = state.hero.inventory.find((entry) => entry.itemId === itemId);
    if (existing) {
      const stacked: GameState = {
        ...state,
        hero: {
          ...state.hero,
          inventory: state.hero.inventory.map((entry) =>
            entry.instanceId === existing.instanceId
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          ),
        },
      };
      return {
        added: true,
        state: discoverTalentsFromItem(stacked, itemId),
      };
    }
  }

  let itemCounter = state.hero.itemCounter;
  const additions: InventoryEntry[] = [];
  const entryCount = definition.stackable ? 1 : quantity;
  for (let index = 0; index < entryCount; index += 1) {
    itemCounter += 1;
    additions.push({
      instanceId: `itm-${itemCounter}`,
      itemId,
      quantity: definition.stackable ? quantity : 1,
      condition: Math.max(0, Math.min(100, condition)),
    });
  }
  const addedState: GameState = {
    ...state,
    hero: {
      ...state.hero,
      itemCounter,
      inventory: [...state.hero.inventory, ...additions],
    },
  };
  return {
    added: true,
    state: discoverTalentsFromItem(addedState, itemId),
  };
}

function consumeEntry(state: GameState, instanceId: string, quantity = 1): GameState {
  return {
    ...state,
    hero: {
      ...state.hero,
      inventory: state.hero.inventory.flatMap((entry) => {
        if (entry.instanceId !== instanceId) return [entry];
        const remaining = entry.quantity - quantity;
        return remaining > 0 ? [{ ...entry, quantity: remaining }] : [];
      }),
    },
  };
}

export function dropInventoryItem(state: GameState, instanceId: string): GameState {
  const entry = inventoryEntryById(state, instanceId);
  if (!entry) return state;
  if (Object.values(state.hero.equipment).includes(instanceId)) {
    return appendLog(state, "Сначала замените экипированный предмет.");
  }
  let next = spawnGroundLoot(
    state,
    state.zone,
    state.hero.positions[state.zone],
    entry.itemId,
    entry.quantity,
    entry.condition,
  );
  next = {
    ...next,
    hero: {
      ...next.hero,
      inventory: next.hero.inventory.filter((item) => item.instanceId !== instanceId),
    },
  };
  return appendLog(next, `Выложено: ${ITEMS[entry.itemId].name}.`);
}

export function equipItem(state: GameState, instanceId: string): GameState {
  const entry = inventoryEntryById(state, instanceId);
  if (!entry || entry.condition <= 0) return state;
  const definition = ITEMS[entry.itemId];
  if (!definition.slot) return state;
  if (state.hero.equipment[definition.slot] === instanceId) return state;
  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      equipment: { ...state.hero.equipment, [definition.slot]: instanceId },
      attackTargetId: null,
      path: [],
      destination: null,
    },
  };
  next = { ...next, hero: { ...next.hero, hp: Math.min(next.hero.hp, maxHeroHp(next)) } };
  return appendLog(next, `Экипировано: ${definition.name}.`);
}

export function equipWeapon(state: GameState, weapon: WeaponId): GameState {
  const entry = state.hero.inventory.find((item) => item.itemId === weapon);
  return entry ? equipItem(state, entry.instanceId) : state;
}

export function consumeInventoryItem(state: GameState, instanceId: string): GameState {
  const entry = inventoryEntryById(state, instanceId);
  if (!entry || ITEMS[entry.itemId].kind !== "consumable") return state;

  if (entry.itemId === "bandage") {
    const injuries = (Object.keys(state.injuries) as (keyof Injuries)[])
      .filter((injury) => state.injuries[injury] > 0)
      .sort((a, b) => state.injuries[b] - state.injuries[a]);
    if (!injuries.length && state.hero.hp >= maxHeroHp(state)) {
      return appendLog(state, "Перевязка сейчас не требуется.");
    }
    const relievedInjury = injuries[0] ?? state.hero.relievedInjury;
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        relievedInjury,
        injuryReliefUntilMs: relievedInjury ? state.worldTimeMs + 30000 : state.hero.injuryReliefUntilMs,
      },
    };
    next = {
      ...next,
      hero: { ...next.hero, hp: Math.min(maxHeroHp(next), next.hero.hp + Math.round(maxHeroHp(next) * 0.18)) },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(
      next,
      relievedInjury
        ? `Перевязка выполнена. ${injuryLabel(relievedInjury)} ослаблена на 30 секунд.`
        : "Перевязка восстановила 2 ОЗ.",
    );
  }

  if (entry.itemId === "fieldRation") {
    if (state.hero.hp >= maxHeroHp(state) && state.hero.stress <= 0) {
      return appendLog(state, "Паёк пока не требуется.");
    }
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        hp: Math.min(maxHeroHp(state), state.hero.hp + Math.round(maxHeroHp(state) * 0.08)),
        stress: Math.max(0, state.hero.stress - 8),
      },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(next, "Паёк восстановил 1 ОЗ и снизил стресс на 8.");
  }

  if (entry.itemId === "painkillers") {
    const injuries = (Object.keys(state.injuries) as (keyof Injuries)[])
      .filter((injury) => state.injuries[injury] > 0)
      .sort((a, b) => state.injuries[b] - state.injuries[a]);
    if (!injuries.length && state.hero.stress <= 0) {
      return appendLog(state, "Таблетки сейчас не требуются.");
    }
    const relievedInjury = injuries[0] ?? state.hero.relievedInjury;
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        stress: Math.max(0, state.hero.stress - 5),
        relievedInjury,
        injuryReliefUntilMs: relievedInjury ? state.worldTimeMs + 45000 : state.hero.injuryReliefUntilMs,
      },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(
      next,
      relievedInjury
        ? `Приняты таблетки ПТ-3. ${injuryLabel(relievedInjury)} ослаблена на 45 секунд.`
        : "Таблетки снизили стресс на 5.",
    );
  }

  if (entry.itemId === "traumaInjector") {
    if (state.hero.hp >= maxHeroHp(state)) return appendLog(state, "Инъектор не требуется.");
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        hp: Math.min(maxHeroHp(state), state.hero.hp + Math.round(maxHeroHp(state) * 0.35)),
        stress: Math.min(100, state.hero.stress + 14),
      },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(next, "Травмоинъектор восстановил 4 ОЗ. Стресс повышен.");
  }

  if (entry.itemId === "filterCartridge") {
    if (state.hero.contamination <= 0) return appendLog(state, "Фильтр ещё не загрязнён.");
    let next: GameState = {
      ...state,
      hero: { ...state.hero, contamination: Math.max(0, state.hero.contamination - 15) },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(next, "Фильтр заменён. Заражение снижено на 15.");
  }

  if (entry.itemId === "batteryPack") {
    if (talentBonus(state, "droneDamage") <= 0) {
      return appendLog(state, "Некуда подключить аккумулятор: рембот не допущен к смене.");
    }
    let next: GameState = {
      ...state,
      hero: { ...state.hero, droneCooldownMs: 0 },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(next, "Атакующий контур рембота перезапущен.");
  }

  if (entry.itemId === "repairKit") {
    const equippedIds = new Set(Object.values(state.hero.equipment).filter(Boolean));
    const damaged = state.hero.inventory
      .filter((item) => equippedIds.has(item.instanceId) && item.condition < 100)
      .sort((a, b) => a.condition - b.condition)[0];
    if (!damaged) return appendLog(state, "Экипировка не требует ремонта.");
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        inventory: state.hero.inventory.map((item) =>
          item.instanceId === damaged.instanceId
            ? { ...item, condition: Math.min(100, item.condition + 25) }
            : item,
        ),
      },
    };
    next = consumeEntry(next, instanceId);
    return appendLog(next, `${ITEMS[damaged.itemId].name}: состояние восстановлено на 25%.`);
  }

  return state;
}

export function applyFirstAid(state: GameState): GameState {
  const bandage = state.hero.inventory.find((entry) => entry.itemId === "bandage");
  return bandage
    ? consumeInventoryItem(state, bandage.instanceId)
    : appendLog(state, "Перевязочный пакет отсутствует.");
}

export function activateEquippedArtifact(state: GameState): GameState {
  const artifact = equippedArtifact(state);
  if (!artifact) return appendLog(state, "Артефакт не экипирован.");
  if (state.hero.artifactCooldownMs > 0) {
    return appendLog(state, "Артефакт ещё не восстановил устойчивую форму.");
  }

  if (artifact.itemId === "reverseCoil") {
    const destination = ZONE_STARTS[state.zone];
    let next: GameState = {
      ...state,
      voidStabilityMs:
        state.zone === "voidLab" ? Math.max(1000, state.voidStabilityMs - 6000) : state.voidStabilityMs,
      hero: {
        ...state.hero,
        positions: { ...state.hero.positions, [state.zone]: copyPoint(destination) },
        path: [],
        destination: null,
        attackTargetId: null,
        contamination: Math.min(100, state.hero.contamination + 12),
        stress: Math.min(100, state.hero.stress + 6),
        artifactCooldownMs: 30000,
      },
    };
    next = emitNoise(next, destination, 8, "свёрнутый путь");
    return reveal(appendLog(next, "Катушка свернула пройденный путь. Цена: +12 заражения."));
  }

  if (artifact.itemId === "keyWithoutDoor") {
    if (state.zone !== "floor556") {
      return appendLog(state, "Ключ не находит подходящей дверной ошибки в этой области.");
    }
    if (state.mutated) return appendLog(state, "Топология уже удерживает чужой проход.");
    let next: GameState = {
      ...state,
      mutated: true,
      hero: {
        ...state.hero,
        contamination: Math.min(100, state.hero.contamination + 8),
        stress: Math.min(100, state.hero.stress + 8),
        artifactCooldownMs: 25000,
      },
    };
    next = emitNoise(next, state.hero.positions[state.zone], 9, "перестройка");
    return reveal(
      appendLog(next, "Ключ открыл межэтажный проход и запечатал соседний коридор. Цена: +8 заражения."),
    );
  }

  if (artifact.itemId === "elevatorHeartbeat") {
    const heroPosition = state.hero.positions[state.zone];
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        hp: Math.min(maxHeroHp(state), state.hero.hp + Math.round(maxHeroHp(state) * 0.25)),
        stress: Math.max(0, state.hero.stress - 18),
        artifactCooldownMs: 28000,
      },
      enemies: state.enemies.map((enemy) =>
        enemy.zone === state.zone && enemy.hp > 0 && distance(enemy.position, heroPosition) <= 2.6
          ? { ...enemy, stunnedUntilMs: state.worldTimeMs + 650, castUntilMs: 0, attackCooldownMs: Math.max(enemy.attackCooldownMs, 700) }
          : enemy,
      ),
    };
    next = addEffect(next, heroPosition, heroPosition, "control", 0);
    next = emitNoise(next, heroPosition, 8, "второй удар лифта");
    return appendLog(next, "Сердцебиение лифта стабилизировало героя и сорвало атаки вокруг.");
  }

  return state;
}

function skillTarget(state: GameState): Enemy | null {
  const selected = enemyById(state, state.hero.attackTargetId);
  if (selected && enemyVisibleToHero(state, selected)) return selected;
  const hero = state.hero.positions[state.zone];
  return state.enemies
    .filter((enemy) => enemyVisibleToHero(state, enemy))
    .sort((a, b) => distance(hero, a.position) - distance(hero, b.position))[0] ?? null;
}

function skillDamage(
  state: GameState,
  enemyId: string,
  damage: number,
  kind: CombatEffect["kind"] = "skill",
): GameState {
  const enemy = enemyById(state, enemyId);
  if (!enemy) return state;
  // Навыки подчиняются тем же боссовым правилам, что и обычные удары.
  if (enemy.rank === "boss" && enemy.phaseInvulnerableUntilMs > state.worldTimeMs) return state;
  const raw = Math.max(1, Math.round(damage));
  const bounded =
    enemy.rank === "boss"
      ? Math.min(
          Math.max(raw, Math.round(enemy.maxHp * BOSS.damageFloorShare)),
          Math.round(enemy.maxHp * BOSS.damageCapShare),
        )
      : raw;
  const hp = Math.max(0, enemy.hp - bounded);
  let next = updateEnemy(state, enemyId, (current) => ({
    ...current,
    hp,
    phase: current.rank === "boss" ? bossPhaseFor(hp, current.maxHp) : current.phase,
    mode: hp <= 0 ? "disabled" : "combat",
    lastKnownHero: copyPoint(state.hero.positions[state.zone]),
    memoryMs: 5200,
  }));
  next = addEffect(next, state.hero.positions[state.zone], enemy.position, kind, damage);
  if (hp <= 0) {
    next = dropEnemyLoot(next, enemy);
    next = registerPopulationCasualty(next, enemy);
    next = awardXp(next, enemyXpReward(next, enemy));
  }
  return next;
}

function setSkillCooldown(state: GameState, skillId: ActiveSkillId): GameState {
  return {
    ...state,
    hero: {
      ...state.hero,
      activeSkillCooldowns: {
        ...state.hero.activeSkillCooldowns,
        [skillId]: ACTIVE_SKILLS[skillId].cooldownMs,
      },
    },
  };
}

const AUTOCAST_PRIORITY: ActiveSkillId[] = [
  "resonance-stabilize",
  "bulwark-brace",
  "stealth-muffle",
  "force-execute",
  "resonance-collapse",
  "fire-burst",
  "bulwark-counter",
  "force-arc",
  "fire-mark",
  "engineer-designate",
  "resonance-distort",
  "force-charge",
  "engineer-overclock",
  "stealth-isolate",
  "fire-relocate",
  "bulwark-challenge",
  "stealth-decoy",
  "engineer-deploy",
];

const EVADE_AUTOCAST_PRIORITY: ActiveSkillId[] = [
  "resonance-stabilize",
  "stealth-muffle",
  "fire-relocate",
  "bulwark-brace",
  "stealth-decoy",
];

export function autocastConditionLabel(skillId: ActiveSkillId): string {
  return {
    "force-charge": "видимая цель вне ближней дистанции",
    "force-arc": "рядом не меньше двух противников",
    "force-execute": "цель ниже 35% здоровья",
    "fire-mark": "видимая цель ещё не отмечена",
    "fire-burst": "отмеченная цель в дальности оружия",
    "fire-relocate": "дальнобойному герою угрожают вблизи",
    "stealth-muffle": "противники начали преследование",
    "stealth-decoy": "героя ищут несколько противников",
    "stealth-isolate": "есть активная приоритетная цель",
    "bulwark-brace": "противник вошёл в ближний сектор",
    "bulwark-challenge": "видны несколько угроз",
    "bulwark-counter": "герой удерживает упор рядом с целью",
    "engineer-deploy": "есть доступная цель для рембота",
    "engineer-designate": "цель не имеет общей метки",
    "engineer-overclock": "идёт бой, форсаж не активен",
    "resonance-distort": "цель может принять резонанс",
    "resonance-collapse": "на цели накоплено два резонанса",
    "resonance-stabilize": "растёт заражение или рушится войд-зона",
  }[skillId];
}

function canAutocastSkill(state: GameState, skillId: ActiveSkillId): boolean {
  if ((state.hero.activeSkillCooldowns[skillId] ?? 0) > 0) return false;
  const target = skillTarget(state);
  const hero = state.hero.positions[state.zone];
  const visible = state.enemies.filter((enemy) => enemyVisibleToHero(state, enemy));
  const nearby = visible.filter((enemy) => distance(hero, enemy.position) <= 2.2);
  const hunters = visible.filter((enemy) => ["hunting", "combat"].includes(enemy.mode));

  if (skillId === "force-charge") return Boolean(target && weaponFor(state).category === "melee" && distance(hero, target.position) > 1.7 && distance(hero, target.position) <= 5.5);
  if (skillId === "force-arc") return nearby.length >= 2;
  if (skillId === "force-execute") return Boolean(target && distance(hero, target.position) <= 1.6 && target.hp <= target.maxHp * 0.35);
  if (skillId === "fire-mark" || skillId === "engineer-designate") return Boolean(target && target.markedUntilMs <= state.worldTimeMs);
  if (skillId === "fire-burst") return Boolean(target && target.markedUntilMs > state.worldTimeMs && distance(hero, target.position) <= heroAttackRange(state));
  if (skillId === "fire-relocate") return Boolean(target && weaponFor(state).category === "ranged" && distance(hero, target.position) < 2.2);
  if (skillId === "stealth-muffle") return hunters.length > 0 && state.hero.silentUntilMs <= state.worldTimeMs;
  if (skillId === "stealth-decoy") return hunters.length >= 2;
  if (skillId === "stealth-isolate") return Boolean(target && state.hero.isolatedUntilMs <= state.worldTimeMs);
  if (skillId === "bulwark-brace") return nearby.length > 0 && state.hero.braceUntilMs <= state.worldTimeMs;
  if (skillId === "bulwark-challenge") return visible.length >= 2 && hunters.length < visible.length;
  if (skillId === "bulwark-counter") return nearby.length > 0 && state.hero.braceUntilMs > state.worldTimeMs;
  if (skillId === "engineer-deploy") return Boolean(target && state.hero.droneCooldownMs > 350);
  if (skillId === "engineer-overclock") return Boolean(target && state.hero.overclockUntilMs <= state.worldTimeMs);
  if (skillId === "resonance-distort") return Boolean(target && target.resonanceStacks < 2 && state.hero.contamination < 80);
  if (skillId === "resonance-collapse") return Boolean(target && target.resonanceStacks >= 2);
  if (skillId === "resonance-stabilize") return state.hero.contamination >= 20 || (state.zone === "voidLab" && state.voidStabilityMs < VOID_STABILITY_MS * 0.6);
  return false;
}

function tickAutocast(state: GameState): GameState {
  if (state.hero.autocastDecisionCooldownMs > 0) return state;
  // Ручной режим не разыгрывает способности за игрока: это его верхняя планка.
  if (controlModeFor(state) === "manual") {
    return { ...state, hero: { ...state.hero, autocastDecisionCooldownMs: 180 } };
  }
  const unlocked = new Set(unlockedActiveSkills(state));
  const priority = state.hero.evadeMode ? EVADE_AUTOCAST_PRIORITY : AUTOCAST_PRIORITY;
  const skillId = priority.find((candidate) => unlocked.has(candidate) && canAutocastSkill(state, candidate));
  if (!skillId) {
    return { ...state, hero: { ...state.hero, autocastDecisionCooldownMs: 180 } };
  }
  const originalSlots = state.hero.activeSkillSlots;
  const staged: GameState = {
    ...state,
    hero: {
      ...state.hero,
      activeSkillSlots: [skillId, originalSlots[1] ?? null, originalSlots[2] ?? null, originalSlots[3] ?? null],
    },
  };
  const activated = activateSkillSlot(staged, 0);
  return {
    ...activated,
    hero: {
      ...activated.hero,
      activeSkillSlots: originalSlots,
      autocastDecisionCooldownMs: 260,
      combatDirective: combatDirectiveFor(activated),
      evadeMode: state.hero.evadeMode,
    },
  };
}

export function activateSkillSlot(state: GameState, slot: number): GameState {
  const skillId = state.hero.activeSkillSlots[slot];
  if (!skillId) return appendLog(state, `Ячейка ${slot + 1} не назначена.`);
  const skill = ACTIVE_SKILLS[skillId];
  if (!unlockedActiveSkills(state).includes(skillId)) {
    return appendLog(state, `${skill.name}: недостаточный допуск ветви.`);
  }
  if ((state.hero.activeSkillCooldowns[skillId] ?? 0) > 0) {
    return appendLog(state, `${skill.shortName}: контур ещё восстанавливается.`);
  }
  const hero = state.hero.positions[state.zone];
  const target = skillTarget(state);
  let next = setSkillCooldown(state, skillId);

  if (skillId === "force-charge") {
    if (!target) return appendLog(state, "Для силового захода нет видимой цели.");
    const route = approachPath(next, target, 1.35);
    const landing = route?.at(-1);
    if (landing) {
      next = {
        ...next,
        hero: {
          ...next.hero,
          positions: { ...next.hero.positions, [next.zone]: copyPoint(landing) },
          path: [],
          destination: null,
          attackTargetId: target.id,
        },
      };
    }
    next = skillDamage(next, target.id, 3 + talentBonus(next, "meleeDamage"));
    next = updateEnemy(next, target.id, (enemy) => ({ ...enemy, stunnedUntilMs: next.worldTimeMs + 300, castUntilMs: 0 }));
  } else if (skillId === "force-arc") {
    const victims = next.enemies.filter(
      (enemy) => enemy.zone === next.zone && enemy.hp > 0 && distance(enemy.position, hero) <= 1.9,
    );
    if (!victims.length) return appendLog(state, "Размашистый удар не нашёл целей.");
    for (const victim of victims) next = skillDamage(next, victim.id, 3 + talentBonus(next, "meleeDamage"), "splash");
  } else if (skillId === "force-execute") {
    if (!target || distance(hero, target.position) > 1.6) return appendLog(state, "Цель добивания вне ближней дистанции.");
    const multiplier = target.hp <= target.maxHp * 0.35 ? 2 : 1;
    next = skillDamage(next, target.id, (5 + talentBonus(next, "meleeDamage")) * multiplier);
  } else if (skillId === "fire-mark" || skillId === "engineer-designate") {
    if (!target) return appendLog(state, "Нет видимой цели для назначения.");
    next = updateEnemy(next, target.id, (enemy) => ({ ...enemy, markedUntilMs: next.worldTimeMs + 8000 }));
    next = { ...next, hero: { ...next.hero, attackTargetId: target.id } };
  } else if (skillId === "fire-burst") {
    if (!target || distance(hero, target.position) > heroAttackRange(next)) return appendLog(state, "Цель точной серии вне дальности.");
    const marked = target.markedUntilMs > next.worldTimeMs;
    next = skillDamage(next, target.id, (marked ? 8 : 5) + talentBonus(next, "rangedDamage"));
    next = emitNoise(next, hero, weaponFor(next).noiseRadius + 1, "точная серия");
  } else if (skillId === "fire-relocate") {
    if (!target) return appendLog(state, "Для смены позиции нет боевой цели.");
    const dx = Math.sign(hero.x - target.position.x);
    const dy = Math.sign(hero.y - target.position.y);
    const destination = gridPoint({ x: hero.x + (dx || 1) * 2, y: hero.y + dy * 2 });
    next = commandMove(next, isWalkable(next, destination) ? destination : gridPoint({ x: hero.x + (dx || 1), y: hero.y + dy }));
    next = {
      ...next,
      hero: {
        ...next.hero,
        attackTargetId: state.hero.evadeMode ? null : target.id,
        evadeMode: state.hero.evadeMode,
      },
    };
  } else if (skillId === "stealth-muffle") {
    next = { ...next, hero: { ...next.hero, silentUntilMs: next.worldTimeMs + 6500, attackTargetId: null } };
  } else if (skillId === "stealth-decoy") {
    const point = gridPoint({ x: hero.x + 3, y: hero.y - 2 });
    next = emitNoise(next, isWalkable(next, point) ? point : hero, 9, "ложный источник");
  } else if (skillId === "stealth-isolate") {
    if (!target) return appendLog(state, "Нет цели для изоляции.");
    next = updateEnemy(next, target.id, (enemy) => ({ ...enemy, memoryMs: 1200 }));
    next = { ...next, hero: { ...next.hero, isolatedTargetId: target.id, isolatedUntilMs: next.worldTimeMs + 7000 } };
  } else if (skillId === "bulwark-brace") {
    next = { ...next, hero: { ...next.hero, braceUntilMs: next.worldTimeMs + 6500, path: [], destination: null } };
  } else if (skillId === "bulwark-challenge") {
    next = {
      ...next,
      enemies: next.enemies.map((enemy) =>
        enemy.zone === next.zone && enemy.hp > 0 && distance(enemy.position, hero) <= 5
          ? { ...enemy, mode: "hunting", lastKnownHero: copyPoint(hero), memoryMs: 7000, thinkCooldownMs: 0 }
          : enemy,
      ),
    };
    next = emitNoise(next, hero, 8, "вызов гермозащиты");
  } else if (skillId === "bulwark-counter") {
    const victims = next.enemies.filter(
      (enemy) => enemy.zone === next.zone && enemy.hp > 0 && distance(enemy.position, hero) <= 2.2,
    );
    if (!victims.length) return appendLog(state, "Для ответного импульса нет целей.");
    for (const victim of victims) next = skillDamage(next, victim.id, 3 + talentBonus(next, "armor"), "splash");
  } else if (skillId === "engineer-deploy") {
    next = { ...next, hero: { ...next.hero, droneCooldownMs: 0 } };
  } else if (skillId === "engineer-overclock") {
    next = {
      ...next,
      hero: {
        ...next.hero,
        overclockUntilMs: next.worldTimeMs + 7000,
        droneCooldownMs: 0,
        stress: Math.min(100, next.hero.stress + 10),
      },
    };
  } else if (skillId === "resonance-distort") {
    if (!target) return appendLog(state, "Нет цели для искажения.");
    next = updateEnemy(next, target.id, (enemy) => ({ ...enemy, resonanceStacks: Math.min(3, enemy.resonanceStacks + 1), markedUntilMs: next.worldTimeMs + 7000 }));
    next = { ...next, hero: { ...next.hero, contamination: Math.min(100, next.hero.contamination + 4) } };
  } else if (skillId === "resonance-collapse") {
    if (!target || target.resonanceStacks <= 0) return appendLog(state, "На цели нет резонанса для схлопывания.");
    const victims = next.enemies.filter(
      (enemy) => enemy.zone === next.zone && enemy.hp > 0 && distance(enemy.position, target.position) <= 2.4,
    );
    for (const victim of victims) next = skillDamage(next, victim.id, 2 + target.resonanceStacks * 2, "splash");
    next = updateEnemy(next, target.id, (enemy) => ({ ...enemy, resonanceStacks: 0 }));
    next = { ...next, hero: { ...next.hero, contamination: Math.min(100, next.hero.contamination + 6) } };
  } else if (skillId === "resonance-stabilize") {
    next = {
      ...next,
      voidStabilityMs: Math.min(VOID_STABILITY_MS, next.voidStabilityMs + 9000),
      hero: {
        ...next.hero,
        contamination: Math.max(0, next.hero.contamination - 10),
        stress: Math.max(0, next.hero.stress - 8),
      },
    };
  }

  return appendLog(next, `Применено: ${skill.name}.`);
}

function skillsFromTalents(talents: string[]): Skills {
  const skills: Skills = { power: 0, guard: 0, agility: 0, precision: 0, suppression: 0, resonance: 0 };
  for (const talentId of talents) {
    const branch = TALENT_BY_ID[talentId] ? branchForTalent(TALENT_BY_ID[talentId]) : null;
    if (branch) skills[branch] += TALENT_BY_ID[talentId].cost;
  }
  return skills;
}

export function applyTrainingBuild(state: GameState, build: TrainingBuild): GameState {
  const branchIds = build === "mobileFire"
    ? ["core:01", "core:02", "core:04", ...Array.from({ length: 9 }, (_, index) => `precision:${String(index + 1).padStart(2, "0")}`), "legendary:kinetic-gyro"]
    : ["core:01", "core:02", "core:08", ...Array.from({ length: 9 }, (_, index) => `power:${String(index + 1).padStart(2, "0")}`), ...Array.from({ length: 4 }, (_, index) => `guard:${String(index + 1).padStart(2, "0")}`), "legendary:section-collapse"];
  const legendaryTalent = build === "mobileFire" ? "legendary:kinetic-gyro" : "legendary:section-collapse";
  const weaponId: WeaponId = build === "mobileFire" ? "horizonCarbine" : "sectorMaul";
  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      talents: branchIds,
      discoveredTalents: [...new Set([...state.hero.discoveredTalents, legendaryTalent])],
      skills: skillsFromTalents(branchIds),
      skillPoints: 4,
      generalPoints: 2,
      combatDirective: build,
      activeSkillSlots: build === "mobileFire"
        ? ["fire-mark", "fire-burst", "fire-relocate", null]
        : ["force-charge", "force-arc", "force-execute", "bulwark-challenge"],
    },
  };
  if (!next.hero.inventory.some((entry) => entry.itemId === weaponId)) {
    next = addInventoryItem(next, weaponId, 1, 100).state;
  }
  const weapon = next.hero.inventory.find((entry) => entry.itemId === weaponId);
  if (weapon) next = equipItem(next, weapon.instanceId);
  return appendLog(
    next,
    build === "mobileFire"
      ? "Испытательный билд загружен: мобильный стрелок, головокружение и срыв подготовленных атак."
      : "Испытательный билд загружен: силовой сплэшер, провокация и поражение пачки.",
  );
}

export function allocateSkill(state: GameState, branch: SkillBranch): GameState {
  const nextNode = TALENT_NODES.find(
    (node) => node.scope === branch && !state.hero.talents.includes(node.id) && canAllocateTalent(state, node.id),
  );
  return nextNode ? allocateTalent(state, nextNode.id) : state;
}

function injuryLabel(key: keyof Injuries): string {
  return {
    leg: "травма ноги",
    arm: "травма руки",
    head: "травма головы",
    torso: "травма корпуса",
    eye: "травма глаза",
  }[key];
}

type RescueOptions = {
  /** Куда выводит аварийная группа. По умолчанию — учебный этаж 556. */
  zone?: ZoneId;
  equipmentDamage?: number;
  stressGain?: number;
  contaminationGain?: number;
};

function applyRescue(
  state: GameState,
  reason: string,
  forcedInjury?: keyof Injuries,
  options: RescueOptions = {},
): GameState {
  const {
    zone = "floor556",
    equipmentDamage = 12,
    stressGain = 18,
    contaminationGain = 0,
  } = options;
  const cycle: (keyof Injuries)[] = ["leg", "arm", "torso", "head", "eye"];
  const injury = forcedInjury ?? cycle[state.rescueCount % cycle.length];
  const injuries = {
    ...state.injuries,
    [injury]: Math.min(2, state.injuries[injury] + 1),
  };
  const equippedIds = new Set(Object.values(state.hero.equipment).filter(Boolean));
  let rescued: GameState = {
    ...state,
    zone,
    injuries,
    rescueCount: state.rescueCount + 1,
    artifactRecovered: state.artifactRecovered,
    voidStabilityMs: VOID_STABILITY_MS,
    noise: null,
    effects: [],
    hero: {
      ...state.hero,
      positions: {
        floor545: { ...REGION_STARTS.floor545 },
        floor546: { ...REGION_STARTS.floor546 },
        floor547: { ...REGION_STARTS.floor547 },
        floor548: { ...REGION_STARTS.floor548 },
        floor549: { ...REGION_STARTS.floor549 },
        floor550: { ...FLOOR_550_START },
        floor554: { ...FLOOR_554_START },
        floor555: { ...FLOOR_555_START },
        floor556: { ...FLOOR_START },
        floor557: { ...FLOOR_557_START },
        voidLab: { ...VOID_START },
      },
      path: [],
      destination: null,
      attackTargetId: null,
      pendingInteraction: null,
      evadeMode: false,
      attackCooldownMs: 600,
      hp: 1,
      stress: Math.min(100, state.hero.stress + stressGain),
      contamination: Math.min(100, state.hero.contamination + contaminationGain),
      braceUntilMs: 0,
      silentUntilMs: 0,
      overclockUntilMs: 0,
      secondBeatReady: true,
      inventory: state.hero.inventory.map((entry) =>
        equippedIds.has(entry.instanceId)
          ? { ...entry, condition: Math.max(0, entry.condition - modeWearCost(state, equipmentDamage)) }
          : entry,
      ),
    },
    enemies: state.enemies.map((enemy) => ({
      ...enemy,
      mode: enemy.hp > 0 ? "patrol" : "disabled",
      path: [],
      lastKnownHero: null,
      memoryMs: 0,
      castUntilMs: 0,
      stunnedUntilMs: 0,
    })),
  };
  rescued = { ...rescued, hero: { ...rescued.hero, hp: maxHeroHp(rescued) } };
  return reveal(
    appendLog(
      rescued,
      `${reason} Аварийная группа провела эвакуацию. Последствие: ${injuryLabel(injury)}; экипировка повреждена.`,
    ),
  );
}

export function awardXp(state: GameState, amount: number): GameState {
  if (amount <= 0) return state;
  let xp = state.hero.xp;
  let level = state.hero.level;
  let skillPoints = state.hero.skillPoints;
  let generalPoints = state.hero.generalPoints;
  let attributePoints = state.hero.attributePoints;
  const totalXp = state.hero.totalXp + amount;
  let remaining = amount;
  const rewards: string[] = [];

  while (remaining > 0 && level < MAX_HERO_LEVEL) {
    const required = xpRequiredForLevel(level);
    const accepted = Math.min(remaining, required - xp);
    xp += accepted;
    remaining -= accepted;
    if (xp < required) break;
    xp = 0;
    level += 1;
    const rewardType = levelRewardType(level);
    if (rewardType === "general") generalPoints += 1;
    else skillPoints += 1;
    rewards.push(rewardType === "general" ? "очко общего контура" : "очко профессионального контура");
    if (level % 5 === 0) {
      attributePoints += 1;
      rewards.push("очко базового атрибута");
    }
  }

  if (level >= MAX_HERO_LEVEL) xp = 0;
  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      xp,
      totalXp,
      level,
      skillPoints,
      generalPoints,
      attributePoints,
    },
  };
  if (rewards.length) {
    next = appendLog(next, `Квалификация повышена до уровня ${level}: ${rewards.join(", ")}.`);
  }
  return next;
}

function updateEnemy(
  state: GameState,
  enemyId: string,
  update: (enemy: Enemy) => Enemy,
): GameState {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => (enemy.id === enemyId ? update(enemy) : enemy)),
  };
}

function spawnGroundLoot(
  state: GameState,
  zone: ZoneId,
  position: Point,
  itemId: ItemId,
  quantity = 1,
  condition = 100,
): GameState {
  const lootCounter = state.lootCounter + 1;
  return {
    ...state,
    lootCounter,
    groundLoot: [
      ...state.groundLoot,
      {
        id: `loot-${lootCounter}`,
        zone,
        position: copyPoint(position),
        itemId,
        quantity,
        condition,
      },
    ],
  };
}

function markMilestoneLootDrop(state: GameState, milestone: string): GameState {
  const milestones = state.milestoneLootDrops ?? [];
  return milestones.includes(milestone)
    ? state
    : { ...state, milestoneLootDrops: [...milestones, milestone] };
}

export function dropEnemyLoot(state: GameState, enemy: Enemy): GameState {
  const milestones = state.milestoneLootDrops ?? [];

  if (enemy.zone === "floor556" && !milestones.includes("floor556-starter-armor")) {
    const dropped = spawnGroundLoot(state, enemy.zone, enemy.position, "hermeticJacketGk3", 1, 100);
    return markMilestoneLootDrop(dropped, "floor556-starter-armor");
  }

  if (enemy.zone === "floor555" && !milestones.includes("floor555-quality-weapon")) {
    const weaponRoll = rollPercent(state);
    const conditionRoll = rollPercent(weaponRoll.state);
    const weaponId: ItemId = weaponRoll.roll < 50 ? "breachAxe" : "coilRifle";
    const dropped = spawnGroundLoot(
      conditionRoll.state,
      enemy.zone,
      enemy.position,
      weaponId,
      1,
      92 + (conditionRoll.roll % 9),
    );
    return markMilestoneLootDrop(dropped, "floor555-quality-weapon");
  }

  const chanceRoll = rollPercent(state);
  const noDropThreshold: Record<EnemyRank, number> = {
    common: 55,
    enhanced: 45,
    veteran: 35,
    elite: 15,
    boss: 0,
  };
  const rank = enemyRankForXp(enemy);
  if (chanceRoll.roll < noDropThreshold[rank]) return chanceRoll.state;

  const categoryRoll = rollPercent(chanceRoll.state);
  let next = categoryRoll.state;
  let itemId: ItemId;
  let condition = 100;

  if (categoryRoll.roll < 32) itemId = "bandage";
  else if (categoryRoll.roll < 54) itemId = "fieldRation";
  else if (categoryRoll.roll < 72) itemId = "painkillers";
  else if (categoryRoll.roll < 82) itemId = "traumaInjector";
  else if (categoryRoll.roll < 88) itemId = "filterCartridge";
  else if (categoryRoll.roll < 93) itemId = enemy.kind === "sentry" ? "coilPart" : "repairKit";
  else if (categoryRoll.roll < 98) {
    const clothingRoll = rollPercent(next);
    next = clothingRoll.state;
    const clothing: ItemId[] = [
      "respiratorIp7",
      "repairCoatRs12",
      "installerGloves",
      "dielectricBoots",
      "backpackRd54",
      "quietHoodTo2",
    ];
    itemId = clothing[clothingRoll.roll % clothing.length];
    condition = 55 + (clothingRoll.roll % 36);
  } else {
    const weaponRoll = rollPercent(next);
    next = weaponRoll.state;
    itemId = weaponRoll.roll < 50 ? "shockBaton" : "servicePistol";
    condition = 55 + (weaponRoll.roll % 36);
  }

  return spawnGroundLoot(next, enemy.zone, enemy.position, itemId, 1, condition);
}

/** Ранг для профиля ошеломления: элита и ветеран держат удар лучше обычных. */
function staggerClassOf(rank: EnemyRank | undefined): "common" | "elite" | "boss" {
  if (rank === "boss") return "boss";
  return rank === "elite" || rank === "veteran" ? "elite" : "common";
}

function enemyCombatProfile(state: GameState, enemy: Enemy) {
  return {
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    // Вскрытие — окно, созданное сломом стойки: пока оно держится, броня
    // почти не работает, и удар в упор наконец окупается.
    armor: armorUnderExposure(
      enemy.armor + (tileAtZone(state, enemy.zone, enemy.position) === "c" ? 6 : 0),
      (enemy.exposedUntilMs ?? 0) > state.worldTimeMs,
    ),
    flatAbsorb: enemy.flatAbsorb ?? 0,
    stance: enemy.stance ?? enemy.maxStance ?? 0,
    maxStance: enemy.maxStance ?? 1,
    rank: (enemy.rank ?? "common") as CombatantRank,
    staggered: enemy.stunnedUntilMs > state.worldTimeMs,
  };
}

/** Куда пришёлся удар: цель, не видящая героя, получает больше всех. */
function strikeFacing(state: GameState, enemy: Enemy): "front" | "flank" | "back" | "unaware" {
  if (!["hunting", "combat"].includes(enemy.mode)) return "unaware";
  if (!enemy.lastKnownHero) return "back";
  const hero = state.hero.positions[state.zone];
  const facingAway =
    distance(enemy.lastKnownHero, hero) > 2.5 && enemy.stunnedUntilMs <= state.worldTimeMs;
  return facingAway ? "flank" : "front";
}

/** Записывает результат удара в противника: ОЗ, стойку, ошеломление и иммунитет. */
/** Босс держит стойку против обычных ударов: её ломают только тяжёлые решения. */
export function breaksBossStance(kind: AttackKind): boolean {
  return kind === "heavy" || kind === "charged" || kind === "finisher";
}

/** Порог слома стойки растёт с каждым ошеломлением: второй раз дороже на четверть. */
export function staggerThresholdFor(enemy: Enemy): number {
  return Math.round((enemy.maxStance ?? 0) * (1 + BOSS.staggerThresholdGrowth * (enemy.staggerCount ?? 0)));
}

/** Фаза по доле оставшихся ОЗ: пороги 66% и 33%. */
export function bossPhaseFor(hp: number, maxHp: number): number {
  if (maxHp <= 0) return 0;
  const share = hp / maxHp;
  return BOSS.phaseThresholds.filter((threshold) => share <= threshold).length;
}

function applyStrikeToEnemy(
  state: GameState,
  enemyId: string,
  strike: ReturnType<typeof resolveStrike>,
  heroPosition: Point,
  kind: AttackKind = "light",
): GameState {
  const enemy = enemyById(state, enemyId);
  if (!enemy) return state;
  const boss = enemy.rank === "boss";
  // Неуязвимость на переходе фазы: удар не проходит вовсе.
  if (boss && enemy.phaseInvulnerableUntilMs > state.worldTimeMs) {
    return updateEnemy(state, enemyId, (current) => ({
      ...current,
      lastKnownHero: copyPoint(heroPosition),
      memoryMs: 5000,
    }));
  }
  const profile = staggerProfile(staggerClassOf(enemy.rank));
  const immune = enemy.staggerImmuneUntilMs > state.worldTimeMs;
  // Фазовая стойка: у босса обычные удары стойку не расходуют.
  const stanceDamage = boss && !breaksBossStance(kind) ? 0 : enemy.stance - strike.targetStance;
  const stanceAfter = Math.max(0, enemy.stance - stanceDamage);
  const brokeStance = stanceDamage > 0 && stanceAfter <= 0;
  const stagger = brokeStance && !immune;

  const phaseBefore = enemy.phase ?? 0;
  const phaseAfter = boss ? bossPhaseFor(strike.targetHp, enemy.maxHp) : phaseBefore;
  const phaseChanged = phaseAfter > phaseBefore;

  let next = updateEnemy(state, enemyId, (current) => ({
    ...current,
    hp: strike.targetHp,
    stance: stagger
      ? boss
        ? staggerThresholdFor({ ...current, staggerCount: (current.staggerCount ?? 0) + 1 })
        : Math.round((current.maxStance ?? 0) * profile.stanceReturn)
      : stanceAfter,
    stanceIdleMs: 0,
    staggerCount: stagger ? (current.staggerCount ?? 0) + 1 : current.staggerCount ?? 0,
    phase: phaseAfter,
    phaseInvulnerableUntilMs: phaseChanged
      ? state.worldTimeMs + BOSS.phaseInvulnerableMs
      : current.phaseInvulnerableUntilMs,
    stunnedUntilMs: stagger
      ? state.worldTimeMs + profile.durationMs
      : current.stunnedUntilMs,
    staggerImmuneUntilMs: stagger
      ? state.worldTimeMs + profile.durationMs + profile.immunityMs
      : current.staggerImmuneUntilMs,
    // Слом стойки вскрывает защиту: окно для урона создаётся действием игрока,
    // а не выпадает случайно.
    exposedUntilMs: stagger
      ? state.worldTimeMs + EXPOSURE_MS
      : current.exposedUntilMs ?? 0,
    // Слом стойки во время замаха — полноценный ответ на телеграф: удар не
    // состоится вовсе. Игрок должен видеть, что прервал именно замах.
    castUntilMs: stagger || phaseChanged ? 0 : current.castUntilMs,
    castStartedMs: stagger || phaseChanged ? 0 : current.castStartedMs ?? 0,
    mode:
      strike.targetHp <= 0
        ? "disabled"
        : strike.targetHp <= Math.ceil(current.maxHp * 0.3)
          ? "retreat"
          : "combat",
    lastKnownHero: copyPoint(heroPosition),
    memoryMs: 5000,
  }));

  if (phaseChanged) {
    // Смена фазы: босс сбрасывает агрессию, становится неуязвим и меняет набор атак.
    next = updateEnemy(next, enemyId, (current) => ({
      ...current,
      mode: "hunting",
      path: [],
      attackCooldownMs: Math.max(current.attackCooldownMs, BOSS.phaseInvulnerableMs),
      stance: current.maxStance ?? 0,
      staggerImmuneUntilMs: state.worldTimeMs + BOSS.phaseInvulnerableMs,
    }));
    next = addEffect(next, heroPosition, enemy.position, "control", 0);
    next = appendLog(
      next,
      `${enemy.name}: переход во вторую половину боя — фаза ${phaseAfter + 1}. Контур перестраивается, урон не проходит.`,
    );
  } else if (stagger && boss) {
    next = appendLog(
      next,
      `${enemy.name}: фазовая стойка сломана. Следующий слом потребует на четверть больше.`,
    );
  }
  // Прерывание замаха — полноценный ответ на телеграф, и игрок должен видеть,
  // что сработал именно он, а не просто «цель ошеломлена».
  if (stagger && enemy.castUntilMs > state.worldTimeMs) {
    next = appendLog(next, `${enemy.name}: замах прерван сломом стойки — удар не состоится.`);
  }
  return next;
}

/** Стойка противников восстанавливается после паузы без тяжёлых воздействий. */
function tickEnemyStance(state: GameState, deltaMs: number): GameState {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => {
      if (enemy.hp <= 0 || !enemy.maxStance) return enemy;
      if (enemy.stunnedUntilMs > state.worldTimeMs) return enemy;
      const idle = enemy.stanceIdleMs + deltaMs;
      if (idle < 1600) return { ...enemy, stanceIdleMs: idle };
      const restored = Math.min(
        enemy.maxStance,
        enemy.stance + (enemy.maxStance * 0.12 * deltaMs) / 1000,
      );
      return { ...enemy, stanceIdleMs: idle, stance: restored };
    }),
  };
}

/** Дыхание и стойка героя: восстановление, задержка и выход из ошеломления. */
function tickHeroBars(state: GameState, deltaMs: number): GameState {
  const maxStance = maxHeroStance(state);
  const maxBreath = maxHeroBreath(state);
  const blocking = isDefending(state);
  const staggered = state.hero.staggeredUntilMs > state.worldTimeMs;

  const breathIdle = state.hero.breathIdleMs + deltaMs;
  const breathRegen =
    !blocking && breathIdle >= 700 ? (heroBreathRegen(state) * deltaMs) / 1000 : 0;
  const blockDrain = blocking ? (heroDefenceTuning(state).holdCostPerSecond * deltaMs) / 1000 : 0;
  const breath = Math.max(0, Math.min(maxBreath, state.hero.breath + breathRegen - blockDrain));

  const stanceIdle = state.hero.stanceIdleMs + deltaMs;
  const stanceRegen =
    !staggered && stanceIdle >= 1600 ? (maxStance * 0.12 * deltaMs) / 1000 : 0;
  const stance = Math.min(maxStance, state.hero.stance + stanceRegen);

  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      breath,
      breathIdleMs: blocking ? 0 : breathIdle,
      stance,
      stanceIdleMs: stanceIdle,
    },
  };

  // Срыв защиты: блок при нулевом дыхании ломается вместе со стойкой.
  if (blocking && breath <= 0) {
    next = appendLog(
      {
        ...next,
        hero: {
          ...next.hero,
          blockingSinceMs: 0,
          stance: Math.max(0, next.hero.stance - maxStance * BLOCK.breakStanceLoss),
          blockBrokenUntilMs: next.worldTimeMs + BLOCK.breakVulnerableMs,
        },
      },
      "Дыхание кончилось: защита сорвана.",
    );
  }
  return next;
}

/** Направление дерева → боевое направление механик. Классов в игре нет. */
const BRANCH_ARCHETYPE: Record<SkillBranch, ArchetypeId> = {
  power: "power",
  guard: "bulwark",
  agility: "skirmisher",
  precision: "marksman",
  suppression: "heavy_gunner",
  resonance: "resonance",
};

export function branchPointsByDirection(state: GameState): Record<SkillBranch, number> {
  return Object.fromEntries(
    (Object.keys(BRANCH_ARCHETYPE) as SkillBranch[]).map((branch) => [
      branch,
      branchTalentPoints(state, branch),
    ]),
  ) as Record<SkillBranch, number>;
}

/**
 * Ведущее направление боя выводится из набранных талантов. Игрок не выбирает
 * класс: «танк» и «ловкач» — это следствие вложенных очков, а не кнопка.
 */
export function archetypeFor(state: GameState): ArchetypeId {
  const points = branchPointsByDirection(state);
  const leading = dominantBranches(points)[0];
  return leading && points[leading] >= DIRECTION_THRESHOLD ? BRANCH_ARCHETYPE[leading] : "power";
}

/**
 * Быстро вкладывает очки в направление. Это не выбор класса, а сокращение для
 * обучающих сборок и тестов: тот же результат даёт ручная раскладка талантов.
 */
export function investDirection(
  state: GameState,
  branch: SkillBranch,
  points: number = DIRECTION_THRESHOLD,
): GameState {
  let next: GameState = {
    ...state,
    hero: { ...state.hero, skillPoints: state.hero.skillPoints + points },
  };
  for (let index = 0; index < points; index += 1) next = allocateSkill(next, branch);
  return next;
}

/**
 * Применяет тестовую сборку целиком. Только для разработки: вызывается из
 * dev-панели, в production-сборке её нет (app/game-dev-profiles.ts).
 */
export function applyDevProfile(state: GameState, profile: DevProfile): GameState {
  let next: GameState = {
    ...state,
    hero: { ...state.hero, talents: [], skillPoints: 0 },
  };
  for (const [branch, points] of Object.entries(profile.invest)) {
    next = investDirection(next, branch as SkillBranch, points as number);
  }
  return appendLog(next, `Тестовая сборка: ${profile.name}.`);
}

/** Насколько заявлено ведущее направление: доля очков в нём от всех вложенных. */
export function directionCommitment(state: GameState): number {
  const points = branchPointsByDirection(state);
  const total = Object.values(points).reduce((sum, value) => sum + value, 0);
  const leading = dominantBranches(points)[0];
  return total > 0 && leading ? points[leading] / total : 0;
}

/** Ступени ресурса специализации: разгон силача либо прицел стрелка. */
export function archetypeResourceSteps(state: GameState): number {
  const archetype = archetypeFor(state);
  if (archetype === "power") return surgeStepsFor(state.hero.surgeMs);
  if (archetype === "marksman") return aimStepsFor(state.hero.aimMs);
  if (archetype === "bulwark") return footingStepsFor(state.hero.footingMs);
  if (archetype === "skirmisher") {
    return tempoStepsFor(state.hero.tempoStacks, state.hero.tempoGainedAtMs, state.worldTimeMs);
  }
  if (archetype === "heavy_gunner") return Math.round(state.hero.heat);
  if (archetype === "resonance") {
    const target = enemyById(state, state.hero.attackTargetId);
    return target ? Math.min(RESONANCE_MAX_STACKS, target.resonanceStacks) : 0;
  }
  return 0;
}

export function archetypeResourceShare(state: GameState): number {
  const definition = ARCHETYPES[archetypeFor(state)];
  return Math.min(1, archetypeResourceSteps(state) / Math.max(1, definition.maxResource));
}

/**
 * Ресурс копится действием: силач — движением к цели, стрелок — неподвижностью.
 * Обе шкалы обнуляются от того, что противоречит характеру архетипа.
 */
function tickArchetypeResource(state: GameState, deltaMs: number, movedTowardTarget: boolean): GameState {
  const archetype = archetypeFor(state);
  if (archetype === "power") {
    const surgeMs = movedTowardTarget ? state.hero.surgeMs + deltaMs : 0;
    return surgeMs === state.hero.surgeMs ? state : { ...state, hero: { ...state.hero, surgeMs } };
  }
  if (archetype === "marksman") {
    const still = state.hero.path.length === 0;
    const aimMs = still ? state.hero.aimMs + deltaMs : 0;
    return aimMs === state.hero.aimMs ? state : { ...state, hero: { ...state.hero, aimMs } };
  }
  if (archetype === "bulwark") {
    // Опора копится удержанием блока и рассыпается, как только блок опущен.
    const footingMs = state.hero.blockingSinceMs > 0 ? state.hero.footingMs + deltaMs : 0;
    return footingMs === state.hero.footingMs ? state : { ...state, hero: { ...state.hero, footingMs } };
  }
  if (archetype === "skirmisher") {
    // Темп живёт четыре секунды с последнего набора и гаснет сам.
    const steps = tempoStepsFor(state.hero.tempoStacks, state.hero.tempoGainedAtMs, state.worldTimeMs);
    return steps === state.hero.tempoStacks
      ? state
      : { ...state, hero: { ...state.hero, tempoStacks: steps } };
  }
  if (archetype === "heavy_gunner") {
    // Температура падает сама, пока герой не стреляет; перегрев блокирует оружие.
    const cooling = state.hero.firingMs > 0 ? 0 : (HEAT_COOLING_PER_SECOND * deltaMs) / 1000;
    const heat = Math.max(0, Math.min(HEAT_OVERHEAT, state.hero.heat - cooling));
    const firingMs = Math.max(0, state.hero.firingMs - deltaMs);
    const overheated =
      heat >= HEAT_OVERHEAT && state.hero.overheatedUntilMs <= state.worldTimeMs;
    let next: GameState = {
      ...state,
      hero: {
        ...state.hero,
        heat,
        firingMs,
        overheatedUntilMs: overheated
          ? state.worldTimeMs + HEAT_OVERHEAT_LOCK_MS
          : state.hero.overheatedUntilMs,
      },
    };
    if (overheated) {
      next = appendLog(
        {
          ...next,
          hero: {
            ...next.hero,
            hp: Math.max(1, next.hero.hp - Math.round(maxHeroHp(next) * 0.05)),
          },
        },
        "Ствол перегрет: оружие заблокировано, руки обожжены.",
      );
    }
    return next;
  }
  return state;
}

/** Разведка стрелка: расширенный обзор на несколько секунд. */
export function commandScout(state: GameState): GameState {
  if (archetypeFor(state) !== "marksman") {
    return appendLog(state, "Разведка доступна стрелку.");
  }
  if (state.hero.scoutUntilMs > state.worldTimeMs) return state;
  return reveal(
    appendLog(
      { ...state, hero: { ...state.hero, scoutUntilMs: state.worldTimeMs + SCOUT_DURATION_MS } },
      "Разведка: обзор расширен, цели за укрытием подсвечены.",
    ),
  );
}

/** Метка: цель получает больше урона из любого источника и видна сквозь стены. */
export function commandMarkTarget(state: GameState): GameState {
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для метки нет видимой цели.");
  return appendLog(
    updateEnemy(state, target.id, (enemy) => ({
      ...enemy,
      markedUntilMs: state.worldTimeMs + MARK_DURATION_MS,
    })),
    `${target.name}: метка установлена, входящий урон повышен на ${Math.round(MARK_DAMAGE_BONUS * 100)}%.`,
  );
}

/** Толчок щитом: отбрасывает цель, срывает подготовку и добавляет опору. */
export function commandShieldPush(state: GameState): GameState {
  if (archetypeFor(state) !== "bulwark") return appendLog(state, "Толчок щитом доступен танку.");
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для толчка нет цели.");
  const hero = state.hero.positions[state.zone];
  if (distance(hero, target.position) > 1.8) return appendLog(state, "Цель слишком далеко для толчка.");
  if (!canSpendBreath(state, 18)) return appendLog(state, "Не хватает дыхания на толчок щитом.");

  const away = {
    x: target.position.x - hero.x,
    y: target.position.y - hero.y,
  };
  const length = Math.max(0.001, Math.hypot(away.x, away.y));
  let landing = { ...target.position };
  for (let travelled = 0.5; travelled <= 2; travelled += 0.5) {
    const candidate = {
      x: target.position.x + (away.x / length) * travelled,
      y: target.position.y + (away.y / length) * travelled,
    };
    if (!isEnemyWalkableIn(state, target.zone, gridPoint(candidate))) break;
    landing = candidate;
  }
  let next = spendBreath(state, 18);
  next = updateEnemy(next, target.id, (enemy) => ({
    ...enemy,
    position: landing,
    path: [],
    castUntilMs: 0,
    stance: Math.max(0, enemy.stance - Math.round(enemy.maxStance * 0.15)),
    stanceIdleMs: 0,
  }));
  next = { ...next, hero: { ...next.hero, footingMs: next.hero.footingMs + 1200 } };
  return appendLog(next, `${target.name} отброшен щитом, подготовка атаки сорвана.`);
}

/** Серия ловкача: три ускоряющихся удара, любая полученная рана её обрывает. */
export function commandFlurry(state: GameState): GameState {
  if (archetypeFor(state) !== "skirmisher") return appendLog(state, "Серия доступна ловкачу.");
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для серии нет цели.");
  if (!canSpendBreath(state, 18)) return appendLog(state, "Не хватает дыхания на серию.");
  const hero = state.hero.positions[state.zone];
  if (distance(hero, target.position) > heroAttackRange(state)) {
    return appendLog(state, "Цель слишком далеко для серии.");
  }
  const weapon = weaponFor(state);
  let next = spendBreath(state, 18);
  let total = 0;
  for (let hit = 0; hit < 3; hit += 1) {
    const current = enemyById(next, target.id);
    if (!current || current.hp <= 0) break;
    const spread = rollPercent(next);
    next = spread.state;
    const strike = resolveStrike(
      {
        damage: heroAttackDamage(next),
        stanceDamage: weapon.stanceDamage,
        damageType: weapon.damageType,
        kind: "light",
        penetration: weapon.penetration,
        damageBonus: 0.15 * hit,
      },
      enemyCombatProfile(next, current),
      { roll: spread.roll / 99, facing: strikeFacing(next, current) },
    );
    next = applyStrikeToEnemy(next, target.id, strike, hero, "light");
    total += strike.damage;
  }
  next = addEffect(next, hero, target.position, "hero-hit", total);
  next = {
    ...next,
    hero: {
      ...next.hero,
      tempoStacks: Math.min(3, next.hero.tempoStacks + 1),
      tempoGainedAtMs: next.worldTimeMs,
      attackCooldownMs: heroAttackCooldown(next),
    },
  };
  next = appendLog(next, `Серия: ${total} урона за три удара.`);
  const survivor = enemyById(next, target.id);
  return survivor && survivor.hp <= 0 ? finishEnemy(next, target.id) : next;
}

/** Заход за спину: рывок в тыл цели, удар проходит как по не видящему герою. */
export function commandBackstab(state: GameState): GameState {
  if (archetypeFor(state) !== "skirmisher") return appendLog(state, "Заход за спину доступен ловкачу.");
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для захода нет цели.");
  if (!canSpendBreath(state, BREATH_COSTS.dash)) {
    return appendLog(state, "Не хватает дыхания на заход за спину.");
  }
  const hero = state.hero.positions[state.zone];
  const behind = {
    x: target.position.x + (target.position.x - hero.x) * 0.6,
    y: target.position.y + (target.position.y - hero.y) * 0.6,
  };
  const landing = isWalkable(state, gridPoint(behind)) ? behind : target.position;
  let next = spendBreath(state, BREATH_COSTS.dash);
  next = {
    ...next,
    hero: {
      ...next.hero,
      positions: { ...next.hero.positions, [next.zone]: landing },
      path: [],
      destination: null,
      tempoStacks: Math.min(3, next.hero.tempoStacks + 1),
      tempoGainedAtMs: next.worldTimeMs,
    },
  };
  const weapon = weaponFor(next);
  const spread = rollPercent(next);
  next = spread.state;
  const strike = resolveStrike(
    {
      damage: heroAttackDamage(next),
      stanceDamage: weapon.stanceDamage,
      damageType: weapon.damageType,
      kind: "light",
      penetration: weapon.penetration,
      damageBonus: tempoDamageBonus(next.hero.tempoStacks),
    },
    enemyCombatProfile(next, target),
    { roll: spread.roll / 99, facing: "unaware" },
  );
  next = applyStrikeToEnemy(next, target.id, strike, landing, "light");
  next = addEffect(next, landing, target.position, "hero-hit", strike.damage);
  next = appendLog(next, `Заход за спину: ${strike.damage} урона.`);
  return strike.targetHp <= 0 ? finishEnemy(next, target.id) : next;
}

/** Занять позицию: урон вверх, подвижность вниз, стойка держится. */
export function commandSetUp(state: GameState): GameState {
  if (archetypeFor(state) !== "heavy_gunner") {
    return appendLog(state, "Позиция доступна тяжёлому стрелку.");
  }
  if (state.hero.deployedSinceMs > 0) {
    return appendLog(
      { ...state, hero: { ...state.hero, deployedSinceMs: 0 } },
      "Оружие свёрнуто в походное положение.",
    );
  }
  if (!canSpendBreath(state, 12)) return appendLog(state, "Не хватает дыхания на установку.");
  const next = spendBreath(state, 12);
  return appendLog(
    {
      ...next,
      // Единица, а не ноль: на нулевом мировом времени ноль читался бы как «не развёрнуто».
      hero: {
        ...next.hero,
        deployedSinceMs: Math.max(1, next.worldTimeMs),
        path: [],
        destination: null,
      },
    },
    "Позиция занята: урон выше, подвижность ниже, стойка держит удар.",
  );
}

/** Подавление: конус без урона, отнимающий у врагов дыхание и волю сближаться. */
export function commandSuppress(state: GameState): GameState {
  if (archetypeFor(state) !== "heavy_gunner") {
    return appendLog(state, "Подавление доступно тяжёлому стрелку.");
  }
  if (!canSpendBreath(state, 20)) return appendLog(state, "Не хватает дыхания на подавление.");
  const hero = state.hero.positions[state.zone];
  const victims = state.enemies.filter(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      distance(enemy.position, hero) <= heroAttackRange(state) &&
      hasLineOfSight(state, hero, enemy.position),
  );
  if (!victims.length) return appendLog(state, "Подавлять некого.");
  let next = spendBreath(state, 20);
  for (const victim of victims) {
    next = updateEnemy(next, victim.id, (enemy) => ({
      ...enemy,
      mode: "retreat",
      path: [],
      castUntilMs: 0,
      accuracy: Math.max(1, enemy.accuracy - 2),
      attackCooldownMs: Math.max(enemy.attackCooldownMs, 1200),
    }));
    next = addEffect(next, hero, victim.position, "control", 0);
  }
  next = {
    ...next,
    hero: { ...next.hero, heat: Math.min(HEAT_OVERHEAT, next.hero.heat + HEAT_PER_SHOT * 2) },
  };
  return appendLog(next, `Подавление: ${victims.length} целей прижаты к укрытиям.`);
}

/** Сброс температуры: дешёвый ресурс ценой уязвимости. */
export function commandVentHeat(state: GameState): GameState {
  if (archetypeFor(state) !== "heavy_gunner") {
    return appendLog(state, "Сброс температуры доступен тяжёлому стрелку.");
  }
  if (state.hero.heat <= 0) return state;
  return appendLog(
    {
      ...state,
      hero: {
        ...state.hero,
        heat: Math.max(0, state.hero.heat - HEAT_VENT_AMOUNT),
        firingMs: 0,
        ventVulnerableUntilMs: state.worldTimeMs + HEAT_VENT_VULNERABLE_MS,
      },
    },
    "Сброс температуры: полторы секунды без защиты.",
  );
}

/** Разрыв синхронизации: цель с полным резонансом теряет ход. */
export function commandDesync(state: GameState): GameState {
  if (archetypeFor(state) !== "resonance") return appendLog(state, "Разрыв доступен резонансу.");
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для разрыва нет цели.");
  if (!desyncReady(target.resonanceStacks)) {
    return appendLog(state, `${target.name}: резонанс ещё не набран до разрыва.`);
  }
  if (!canSpendBreath(state, 25)) return appendLog(state, "Не хватает дыхания на разрыв.");
  let next = spendBreath(state, 25);
  next = updateEnemy(next, target.id, (enemy) => ({
    ...enemy,
    resonanceStacks: 0,
    stance: Math.max(0, enemy.stance - Math.round(enemy.maxStance * 0.5)),
    stanceIdleMs: 0,
    castUntilMs: 0,
    path: [],
    stunnedUntilMs: next.worldTimeMs + 900,
  }));
  next = {
    ...next,
    hero: {
      ...next.hero,
      contamination: Math.min(100, next.hero.contamination + RESONANCE_CONTAMINATION_COST),
      stress: Math.min(100, next.hero.stress + RESONANCE_STRESS_COST),
    },
  };
  next = addEffect(next, next.hero.positions[next.zone], target.position, "control", 0);
  return appendLog(next, `${target.name}: синхронизация разорвана, стойка обрушена вдвое.`);
}

/** Цепь: эффект переходит между помеченными целями, слабея на каждом переходе. */
export function commandResonanceChain(state: GameState): GameState {
  if (archetypeFor(state) !== "resonance") return appendLog(state, "Цепь доступна резонансу.");
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для цепи нет цели.");
  if (!canSpendBreath(state, 15)) return appendLog(state, "Не хватает дыхания на цепь.");
  const hero = state.hero.positions[state.zone];
  let next = spendBreath(state, 15);
  const base = Math.round(heroAttackDamage(next) * 0.8);
  let previous = target;
  const touched = new Set<string>();
  for (let jump = 0; jump < 4; jump += 1) {
    const damage = chainDamageAt(base, jump);
    if (damage <= 0) break;
    next = skillDamage(next, previous.id, damage, "control");
    next = updateEnemy(next, previous.id, (enemy) => ({
      ...enemy,
      resonanceStacks: Math.min(RESONANCE_MAX_STACKS, enemy.resonanceStacks + 1),
    }));
    touched.add(previous.id);
    const nextLink = next.enemies
      .filter(
        (enemy) =>
          enemy.zone === next.zone &&
          enemy.hp > 0 &&
          !touched.has(enemy.id) &&
          distance(enemy.position, previous.position) <= 3.5,
      )
      .sort((left, right) => distance(left.position, previous.position) - distance(right.position, previous.position))[0];
    if (!nextLink) break;
    previous = nextLink;
  }
  next = {
    ...next,
    hero: {
      ...next.hero,
      contamination: Math.min(100, next.hero.contamination + RESONANCE_CONTAMINATION_COST),
      stress: Math.min(100, next.hero.stress + RESONANCE_STRESS_COST),
    },
  };
  next = addEffect(next, hero, target.position, "control", base);
  return appendLog(next, `Цепь резонанса прошла по ${touched.size} целям. Заражение выросло.`);
}

/** Обратная тень: неуязвимость без возможности атаковать, ценой заражения. */
export function commandReverseShadow(state: GameState): GameState {
  if (archetypeFor(state) !== "resonance") {
    return appendLog(state, "Обратная тень доступна резонансу.");
  }
  if (state.hero.reverseShadowUntilMs > state.worldTimeMs) return state;
  if (!canSpendBreath(state, 30)) return appendLog(state, "Не хватает дыхания на обратную тень.");
  const next = spendBreath(state, 30);
  return appendLog(
    {
      ...next,
      hero: {
        ...next.hero,
        reverseShadowUntilMs: next.worldTimeMs + REVERSE_SHADOW_MS,
        dodgeInvulnerableUntilMs: next.worldTimeMs + REVERSE_SHADOW_MS,
        attackTargetId: null,
        contamination: Math.min(100, next.hero.contamination + REVERSE_SHADOW_CONTAMINATION),
      },
    },
    "Обратная тень: герой существует не полностью. Две секунды неуязвимости и рост заражения.",
  );
}

/**
 * Защитный профиль персонажа: собирается из дерева, экипировки и укрытия.
 *
 * Ни одно слагаемое не зависит от того, что игрок сейчас нажал: блок,
 * парирование и уклонение — свойства сборки. Руками игрок двигается, выбирает
 * позицию и бьёт.
 */
export function heroDefenceProfile(state: GameState): DefenceProfile {
  const heroPosition = state.hero.positions[state.zone];
  const inCover = coverBonus(state, heroPosition) > 0;
  return {
    // Уклонение — разброс: чаще спасает от череды мелких ударов, но на один
    // тяжёлый на него полагаться нельзя.
    evasion: Math.min(0.6, talentBonus(state, "evasion") + (inCover ? 0.05 : 0)),
    blockChance: Math.min(0.75, talentBonus(state, "block")),
    blockEffectiveness: Math.min(0.8, 0.35 + talentBonus(state, "blockPower")),
    // Парирование реже блока: оно не просто гасит удар, а обращает его.
    parryChance: Math.min(0.4, talentBonus(state, "parry")),
    // Броня складывается из снаряжения, дерева и укрытия: узлы «+N брони»
    // обязаны доходить до профиля, иначе защитная ветка ничего не даёт.
    armour: Math.round(equipmentScalar(state, "armor") + talentBonus(state, "armor")) + (inCover ? 6 : 0),
    resistances: {
      kinetic: talentBonus(state, "resistKinetic"),
      thermal: talentBonus(state, "resistThermal"),
      chemical: talentBonus(state, "resistChemical"),
      anomalous: talentBonus(state, "resistAnomalous"),
    },
    posture: Math.min(0.75, talentBonus(state, "staggerResist")),
  };
}

/** Параметры заряжаемого удара текущего билда. */
export function heroChargeTuning(state: GameState) {
  return chargeTuning({
    chargeRate: talentBonus(state, "chargeRate"),
    chargeSteps: talentBonus(state, "chargeSteps"),
    chargePower: talentBonus(state, "chargePower"),
  });
}

/** Сколько ступеней заряда набрано удержанием команды атаки. */
export function heroChargeSteps(state: GameState): number {
  if (state.hero.chargingSinceMs <= 0) return 0;
  return chargeStepsFor(state.worldTimeMs - state.hero.chargingSinceMs, heroChargeTuning(state));
}

/** Начать заряд: удержание команды атаки копит усиленный удар. */
export function beginCharge(state: GameState): GameState {
  if (state.hero.chargingSinceMs > 0) return state;
  if (state.hero.staggeredUntilMs > state.worldTimeMs) return state;
  return {
    ...state,
    hero: { ...state.hero, chargingSinceMs: Math.max(1, state.worldTimeMs) },
  };
}

/**
 * Отпустить заряд. Без набранных ступеней это обычная команда атаки, с
 * набранными — заряженный удар по правилам, собранным из пассивов.
 */
export function releaseCharge(state: GameState): GameState {
  const steps = heroChargeSteps(state);
  const cleared: GameState = { ...state, hero: { ...state.hero, chargingSinceMs: 0 } };
  if (steps <= 0) return commandAttackNearest(cleared);

  // Если цель не захвачена, заряд не пропадает: берём ближайшую видимую, как
  // это делает обычная команда атаки.
  const acquired = enemyById(cleared, cleared.hero.attackTargetId) ?? skillTarget(cleared);
  const withTarget = acquired ? cleared : commandAttackNearest(cleared);
  const target = acquired ?? enemyById(withTarget, withTarget.hero.attackTargetId);
  if (!target) return appendLog(withTarget, "Заряд сброшен: видимых целей нет.");
  const tuning = heroChargeTuning(withTarget);
  if (!canSpendBreath(withTarget, tuning.breathCost)) {
    return appendLog(withTarget, "Не хватает дыхания на заряженный удар.");
  }
  const hero = withTarget.hero.positions[withTarget.zone];
  if (distance(hero, target.position) > heroAttackRange(withTarget)) {
    return appendLog(withTarget, "Цель слишком далеко для заряженного удара.");
  }

  const weapon = weaponFor(withTarget);
  let next = spendBreath(withTarget, tuning.breathCost);
  const spread = rollPercent(next);
  next = spread.state;
  const criticalRoll = rollPercent(next);
  next = criticalRoll.state;
  const multipliers = tunedChargeMultipliers(steps, tuning);
  const strike = resolveStrike(
    {
      damage: Math.round(heroAttackDamage(next) * multipliers.damage),
      stanceDamage: Math.round(weapon.stanceDamage * multipliers.stance),
      damageType: weapon.damageType,
      kind: "charged",
      chargeSteps: 0,
      penetration: weapon.penetration,
      criticalChance: talentBonus(next, "critical"),
      counterTiming: target.castUntilMs > next.worldTimeMs,
    },
    enemyCombatProfile(next, target),
    {
      roll: spread.roll / 99,
      criticalRoll: criticalRoll.roll / 100,
      facing: strikeFacing(next, target),
    },
  );
  next = applyStrikeToEnemy(next, target.id, strike, hero, "charged");
  next = addEffect(next, hero, target.position, "hero-hit", strike.damage);
  next = {
    ...next,
    hero: { ...next.hero, attackCooldownMs: heroAttackCooldown(next) * 1.5 },
  };
  next = appendLog(
    next,
    `Заряженный удар (${steps}): ${strike.damage} урона, стойка −${strike.stanceDamage}${strike.staggered ? "; цель ошеломлена" : ""}.`,
  );
  return strike.targetHp <= 0 ? finishEnemy(next, target.id) : next;
}

/** Хватает ли дыхания на действие. */
export function canSpendBreath(state: GameState, cost: number): boolean {
  return state.hero.breath >= cost && state.hero.staggeredUntilMs <= state.worldTimeMs;
}

function spendBreath(state: GameState, cost: number): GameState {
  return {
    ...state,
    hero: {
      ...state.hero,
      breath: Math.max(0, state.hero.breath - cost),
      breathIdleMs: 0,
    },
  };
}

/** Поднять или опустить блок. Идеальное окно считается от момента подъёма. */
export function commandBlock(state: GameState, holding: boolean): GameState {
  if (!holding) {
    return state.hero.blockingSinceMs === 0
      ? state
      : { ...state, hero: { ...state.hero, blockingSinceMs: 0 } };
  }
  if (state.hero.blockingSinceMs > 0) return state;
  if (state.hero.blockBrokenUntilMs > state.worldTimeMs) {
    return appendLog(state, "Защита ещё не восстановлена после срыва.");
  }
  if (state.hero.staggeredUntilMs > state.worldTimeMs) return state;
  return {
    ...state,
    hero: { ...state.hero, blockingSinceMs: Math.max(1, state.worldTimeMs), path: [], destination: null },
  };
}

/**
 * Держится ли защита прямо сейчас. Без пассива удержания короткий блок сам
 * опадает через `briefMs`: базовое действие остаётся мгновенным.
 */
export function isDefending(state: GameState): boolean {
  if (state.hero.blockingSinceMs <= 0) return false;
  const tuning = heroDefenceTuning(state);
  if (tuning.canHold) return true;
  return state.worldTimeMs - state.hero.blockingSinceMs <= tuning.briefMs;
}

/** Уклонение: кадры неуязвимости, смещение и запрет повтора на время восстановления. */
export function commandDodge(state: GameState, direction?: Point): GameState {
  if (state.hero.dodgeReadyAtMs > state.worldTimeMs) return state;
  if (!canSpendBreath(state, BREATH_COSTS.dodge)) {
    return appendLog(state, "Не хватает дыхания на уклонение.");
  }
  const from = state.hero.positions[state.zone];
  const target = direction ?? { x: from.x, y: from.y + 1 };
  const length = Math.max(0.001, distance(from, target));
  const step = {
    x: (target.x - from.x) / length,
    y: (target.y - from.y) / length,
  };
  let landing = { ...from };
  for (let travelled = 0.5; travelled <= DODGE.distance; travelled += 0.5) {
    const candidate = { x: from.x + step.x * travelled, y: from.y + step.y * travelled };
    if (!isWalkable(state, gridPoint(candidate))) break;
    landing = candidate;
  }
  const next = spendBreath(state, BREATH_COSTS.dodge);
  return {
    ...next,
    hero: {
      ...next.hero,
      positions: { ...next.hero.positions, [next.zone]: landing },
      path: [],
      destination: null,
      blockingSinceMs: 0,
      dodgeInvulnerableUntilMs: next.worldTimeMs + DODGE.invulnerableMs,
      dodgeReadyAtMs: next.worldTimeMs + DODGE.recoveryMs,
    },
  };
}

/** Тяжёлая атака: дороже, медленнее, но ломает стойку втрое быстрее. */
export function commandHeavyAttack(state: GameState): GameState {
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для тяжёлого удара нет цели.");
  const riposte = state.hero.riposteUntilMs > state.worldTimeMs;
  if (!riposte && !canSpendBreath(state, BREATH_COSTS.heavyAttack)) {
    return appendLog(state, "Не хватает дыхания на тяжёлый удар.");
  }
  const hero = state.hero.positions[state.zone];
  if (distance(hero, target.position) > heroAttackRange(state)) {
    return appendLog(state, "Цель слишком далеко для тяжёлого удара.");
  }
  const weapon = weaponFor(state);
  let next = riposte ? state : spendBreath(state, BREATH_COSTS.heavyAttack);
  const spread = rollPercent(next);
  next = spread.state;
  const criticalRoll = rollPercent(next);
  next = criticalRoll.state;
  const strike = resolveStrike(
    {
      damage: heroAttackDamage(next),
      stanceDamage: weapon.stanceDamage,
      damageType: weapon.damageType,
      kind: "heavy",
      penetration: weapon.penetration,
      criticalChance: talentBonus(next, "critical"),
      // Встречный удар: цель уже начала собственный замах.
      counterTiming: target.castUntilMs > next.worldTimeMs,
    },
    enemyCombatProfile(next, target),
    {
      roll: spread.roll / 99,
      criticalRoll: criticalRoll.roll / 100,
      facing: strikeFacing(next, target),
    },
  );
  next = applyStrikeToEnemy(next, target.id, strike, hero, "heavy");
  next = addEffect(next, hero, target.position, "hero-hit", strike.damage);
  next = {
    ...next,
    hero: {
      ...next.hero,
      attackCooldownMs: heroAttackCooldown(next) * 1.4,
      riposteUntilMs: 0,
    },
  };
  next = appendLog(
    next,
    `Тяжёлый удар: ${strike.damage} урона, стойка −${strike.stanceDamage}${strike.staggered ? "; цель ошеломлена" : ""}.`,
  );
  next = breachOverload(next, target.id, hero);
  next = detonateResonance(next, target.id, hero);
  return strike.targetHp <= 0 ? finishEnemy(next, target.id) : next;
}

/**
 * Связка «подготовил → сорвал»: тяжёлый удар по резонирующей цели срывает
 * накопленные стеки пространственным импульсом. Ради этого метку и ставят —
 * без детонации она была просто подсветкой цели.
 */
function detonateResonance(state: GameState, targetId: string, origin: Point): GameState {
  const target = enemyById(state, targetId);
  if (!target) return state;
  const impulse = resonanceImpulse(target.resonanceStacks, heroAttackDamage(state));
  if (!impulse) return state;

  let next = updateEnemy(state, targetId, (enemy) => ({ ...enemy, resonanceStacks: 0 }));
  const centre = target.position;
  const caught = next.enemies.filter(
    (enemy) =>
      enemy.hp > 0 &&
      enemy.zone === next.zone &&
      distance(enemy.position, centre) <= impulse.radius,
  );

  for (const enemy of caught) {
    // Цель детонации получает полный импульс, соседи — половину: импульс
    // расходится от неё, а не возникает у каждого одинаково.
    const share = enemy.id === targetId ? 1 : 0.5;
    next = updateEnemy(next, enemy.id, (current) => ({
      ...current,
      hp: current.hp - Math.round(impulse.damage * share),
      stance: Math.max(0, current.stance - Math.round(impulse.stanceDamage * share)),
    }));
  }
  next = addEffect(next, origin, centre, "hero-hit", impulse.damage);
  next = appendLog(
    next,
    `Резонанс сорван: пространственный импульс ${impulse.damage} урона, стеков ${impulse.stacksSpent}` +
      `${caught.length > 1 ? `, задето целей ${caught.length}` : ""}.`,
  );
  for (const enemy of caught) {
    const after = enemyById(next, enemy.id);
    if (after && after.hp <= 0) next = finishEnemy(next, enemy.id);
  }
  return next;
}


/**
 * Цикл направления на попадании: чем ведущее направление занимается между
 * подготовкой и расплатой.
 *
 * У каждого направления он свой, поэтому одна и та же атака в разных сборках
 * оставляет на цели разное, и порядок действий имеет разное значение.
 */
function applyDirectionLoop(
  state: GameState,
  targetId: string,
  origin: Point,
  weapon: ReturnType<typeof weaponFor>,
): GameState {
  const direction = archetypeFor(state);
  const target = enemyById(state, targetId);
  if (!target) return state;

  // Свёртывание Резонанса переживает смерть цели: резонанс был в металле, и
  // добивание его не отменяет. Без этого направление почти не срабатывало —
  // обычный противник как раз и набирает второй стек с последнего удара.
  if (direction === "resonance" && target.resonanceStacks >= 2) {
    const zone = discordZone(target.resonanceStacks);
    if (zone) {
      let next = updateEnemy(state, targetId, (enemy) => ({ ...enemy, resonanceStacks: 0 }));
      next = {
        ...next,
        discordZones: [
          ...next.discordZones,
          {
            id: `discord-${next.worldTimeMs}-${targetId}`,
            zone: next.zone,
            position: { ...target.position },
            radius: zone.radius,
            untilMs: next.worldTimeMs + zone.durationMs,
            nextPulseMs: next.worldTimeMs + DISCORD_PULSE_MS,
          },
        ],
        hero: {
          ...next.hero,
          contamination: Math.min(100, next.hero.contamination + zone.contamination),
        },
      };
      return appendLog(
        next,
        `Разлад свёрнут: участок звучит ${(zone.durationMs / 1000).toFixed(1)} с. Цена: +${zone.contamination} заражения.`,
      );
    }
  }

  if (target.hp <= 0) return state;

  // Перегрузку пробивает любое попадание, а не только выстрел того, кто её
  // навёл: это и делает её точкой стыковки между направлениями. Пробой идёт
  // первым, иначе тот же удар успел бы навести её заново.
  const breached = breachOverload(state, targetId, origin);
  if (breached !== state) return breached;

  // Прицел: накопленная неподвижность обменивается на вскрытие. Стрелок сам
  // создаёт окно, которое ближнему бою даёт слом стойки, — и платит за это
  // тем, что любое движение сбрасывает прицел.
  if (direction === "marksman" && weapon.category === "ranged") {
    const steps = aimStepsFor(state.hero.aimMs);
    if (steps >= 2 && (target.exposedUntilMs ?? 0) <= state.worldTimeMs) {
      let next = updateEnemy(state, targetId, (enemy) => ({
        ...enemy,
        exposedUntilMs: state.worldTimeMs + EXPOSURE_MS,
        resonanceStacks: Math.min(RESONANCE_MAX_STACKS, enemy.resonanceStacks + 1),
      }));
      next = { ...next, hero: { ...next.hero, aimMs: 0 } };
      return appendLog(
        next,
        `Выверенный выстрел (прицел ${steps}): ${target.name} вскрыт, наведён резонанс. Прицел сброшен.`,
      );
    }
    return state;
  }

  // Темп: подвижность разносит уже наведённое. Направление не копит состояние
  // на одной цели, а переносит его на соседей — тем и отличается от Разгона,
  // который то же состояние срывает в одну точку.
  if (direction === "skirmisher") {
    const steps = tempoStepsFor(state.hero.tempoStacks, state.hero.tempoGainedAtMs, state.worldTimeMs);
    if (steps >= 2 && target.resonanceStacks > 0) {
      const neighbours = state.enemies.filter(
        (enemy) =>
          enemy.hp > 0 &&
          enemy.zone === state.zone &&
          enemy.id !== targetId &&
          distance(enemy.position, target.position) <= 2.4,
      );
      if (!neighbours.length) return state;
      let next = state;
      for (const enemy of neighbours) {
        next = updateEnemy(next, enemy.id, (current) => ({
          ...current,
          resonanceStacks: Math.min(RESONANCE_MAX_STACKS, current.resonanceStacks + 1),
        }));
      }
      return appendLog(
        next,
        `Разнос темпом (${steps}): резонанс перенесён на ${neighbours.length} соседних целей.`,
      );
    }
    return state;
  }

  // Температура: работа у верхней границы наводит электрический потенциал.
  // Награда за риск перегрева, а не побочный эффект стрельбы.
  if (direction === "heavy_gunner" && weapon.category === "ranged") {
    const heatShare = state.hero.heat / HEAT_OVERHEAT;
    if (heatShare >= OVERLOAD_HEAT_SHARE && (target.overloadedUntilMs ?? 0) <= state.worldTimeMs) {
      const next = updateEnemy(state, targetId, (enemy) => ({
        ...enemy,
        overloadedUntilMs: state.worldTimeMs + OVERLOAD_MS,
      }));
      return appendLog(next, `${target.name}: наведена перегрузка — следующее попадание пробьёт её дальше.`);
    }
    return state;
  }

  return state;
}

/**
 * Звучащие участки наводят резонанс сами, пока держатся. Это и делает
 * Резонанс направлением контроля пространства, а не ещё одним источником
 * бурста по одной цели.
 */
function tickDiscordZones(state: GameState): GameState {
  if (!state.discordZones?.length) return state;
  const alive = state.discordZones.filter((zone) => zone.untilMs > state.worldTimeMs);
  if (!alive.length) return { ...state, discordZones: [] };

  let next: GameState = { ...state, discordZones: alive };
  const pulsed: DiscordZoneState[] = [];
  for (const zone of alive) {
    if (zone.nextPulseMs > next.worldTimeMs || zone.zone !== next.zone) {
      pulsed.push(zone);
      continue;
    }
    for (const enemy of next.enemies) {
      if (enemy.hp <= 0 || enemy.zone !== zone.zone) continue;
      if (distance(enemy.position, zone.position) > zone.radius) continue;
      next = updateEnemy(next, enemy.id, (current) => ({
        ...current,
        resonanceStacks: Math.min(RESONANCE_MAX_STACKS, current.resonanceStacks + 1),
      }));
    }
    pulsed.push({ ...zone, nextPulseMs: next.worldTimeMs + DISCORD_PULSE_MS });
  }
  return { ...next, discordZones: pulsed };
}

/**
 * Пробой перегрузки: расходится по плотности строя, а не по накоплению на
 * одной цели. Поэтому Температура выгодна против групп там, где Резонанс
 * выгоден против подготовленной одиночной цели.
 */
function breachOverload(state: GameState, targetId: string, origin: Point): GameState {
  const target = enemyById(state, targetId);
  if (!target || (target.overloadedUntilMs ?? 0) <= state.worldTimeMs) return state;

  const breach = overloadBreach(heroAttackDamage(state), state.hero.heat / HEAT_OVERHEAT);
  const caught = state.enemies
    .filter(
      (enemy) =>
        enemy.hp > 0 &&
        enemy.zone === state.zone &&
        distance(enemy.position, target.position) <= breach.radius,
    )
    .slice(0, breach.maxTargets);

  let next = updateEnemy(state, targetId, (enemy) => ({ ...enemy, overloadedUntilMs: 0 }));
  for (const enemy of caught) {
    next = updateEnemy(next, enemy.id, (current) => ({
      ...current,
      hp: current.hp - breach.damage,
    }));
  }
  next = addEffect(next, origin, target.position, "control", breach.damage);
  next = appendLog(
    next,
    `Пробой перегрузки: ${breach.damage} урона по ${caught.length} целям.`,
  );
  for (const enemy of caught) {
    const after = enemyById(next, enemy.id);
    if (after && after.hp <= 0) next = finishEnemy(next, enemy.id);
  }
  return next;
}

/** Добивание ошеломлённой цели: дорого, долго, но решает бой. */
export function commandFinisher(state: GameState): GameState {
  const target = enemyById(state, state.hero.attackTargetId) ?? skillTarget(state);
  if (!target) return appendLog(state, "Для добивания нет цели.");
  if (target.stunnedUntilMs <= state.worldTimeMs) {
    return appendLog(state, "Добивание доступно только по ошеломлённой цели.");
  }
  if (!canSpendBreath(state, BREATH_COSTS.finisher)) {
    return appendLog(state, "Не хватает дыхания на добивание.");
  }
  const hero = state.hero.positions[state.zone];
  if (distance(hero, target.position) > Math.max(1.6, heroAttackRange(state))) {
    return appendLog(state, "Цель слишком далеко для добивания.");
  }
  const weapon = weaponFor(state);
  let next = spendBreath(state, BREATH_COSTS.finisher);
  const spread = rollPercent(next);
  next = spread.state;
  const strike = resolveStrike(
    {
      damage: heroAttackDamage(next),
      stanceDamage: weapon.stanceDamage,
      damageType: weapon.damageType,
      kind: "finisher",
      penetration: weapon.penetration,
    },
    { ...enemyCombatProfile(next, target), finishing: true },
    { roll: spread.roll / 99, facing: "unaware" },
  );
  next = applyStrikeToEnemy(next, target.id, strike, hero, "finisher");
  next = addEffect(next, hero, target.position, "control", strike.damage);
  next = {
    ...next,
    hero: {
      ...next.hero,
      attackCooldownMs: heroAttackCooldown(next) * 1.6,
      stance: Math.min(maxHeroStance(next), next.hero.stance + maxHeroStance(next) * 0.25),
    },
  };
  next = appendLog(next, `Добивание: ${strike.damage} урона.`);
  return strike.targetHp <= 0 ? finishEnemy(next, target.id) : next;
}

/** Общая обработка гибели противника: опыт, добыча и учёт потерь популяции. */
function finishEnemy(state: GameState, enemyId: string): GameState {
  const enemy = state.enemies.find((entry) => entry.id === enemyId);
  if (!enemy) return state;
  const reward = enemyXpReward(state, enemy);
  let next = awardXp(state, reward);
  next = dropEnemyLoot(next, enemy);
  next = registerPopulationCasualty(next, enemy);
  next = { ...next, hero: { ...next.hero, attackTargetId: null } };
  return appendLog(next, `${enemy.name} выведен из строя. Получено ${reward} опыта.`);
}

function heroAttackTick(state: GameState): GameState {
  if (state.hero.evadeMode || !state.hero.attackTargetId) return state;
  const target = enemyById(state, state.hero.attackTargetId);
  if (!target || target.zone !== state.zone) {
    return {
      ...state,
      hero: { ...state.hero, attackTargetId: null, path: [], destination: null },
    };
  }
  const heroPosition = state.hero.positions[state.zone];
  const inRange =
    distance(heroPosition, target.position) <= heroAttackRange(state) &&
    hasLineOfSight(state, heroPosition, target.position);
  if (!inRange || state.hero.attackCooldownMs > 0) return state;
  // Перегретый ствол и обратная тень не позволяют атаковать.
  if (state.hero.overheatedUntilMs > state.worldTimeMs) return state;
  if (state.hero.reverseShadowUntilMs > state.worldTimeMs) return state;

  const weapon = weaponFor(state);
  // Броска на попадание больше нет: урон разрешается напрямую, а избежать его
  // можно блоком, уклонением и позицией — COMBAT_NUMERIC_MODEL_V2.md §2.1.
  const marked = target.markedUntilMs > state.worldTimeMs;
  const movingFire = weapon.category === "ranged" && talentBonus(state, "movingFire") >= 1;
  let next: GameState = {
    ...state,
    hero: {
      ...state.hero,
      // Раскрутка ускоряет темп тяжёлого ствола, стрельба его греет.
      attackCooldownMs:
        heroAttackCooldown(state) *
        (archetypeFor(state) === "heavy_gunner" ? spinUpFactor(state.hero.firingMs) : 1),
      heat:
        archetypeFor(state) === "heavy_gunner"
          ? Math.min(HEAT_OVERHEAT, state.hero.heat + HEAT_PER_SHOT)
          : state.hero.heat,
      firingMs:
        archetypeFor(state) === "heavy_gunner"
          ? Math.min(4000, state.hero.firingMs + 900)
          : state.hero.firingMs,
      path: movingFire ? state.hero.path : [],
      destination: movingFire ? state.hero.destination : null,
    },
  };
  next = emitNoise(
    next,
    heroPosition,
    Math.max(
      0.5,
      weapon.noiseRadius -
        talentBonus(next, "noiseReduction") -
        equipmentScalar(next, "stealth") * 0.4 -
        (next.hero.silentUntilMs > next.worldTimeMs ? 3 : 0),
    ),
    weapon.category === "melee" ? "удар" : "выстрел",
  );

  const isolated = next.hero.isolatedTargetId === target.id && next.hero.isolatedUntilMs > next.worldTimeMs;
  const spread = rollPercent(next);
  next = spread.state;
  const criticalRoll = rollPercent(next);
  next = criticalRoll.state;
  const strike = resolveStrike(
    {
      damage: heroAttackDamage(next),
      stanceDamage: Math.round(
        weapon.stanceDamage *
          (archetypeFor(next) === "power" ? surgeStanceMultiplier(surgeStepsFor(next.hero.surgeMs)) : 1),
      ),
      damageType: weapon.damageType,
      kind: "light",
      penetration: weapon.penetration,
      damageBonus:
        (marked ? MARK_DAMAGE_BONUS + talentBonus(next, "markPower") * 0.05 : 0) +
        (archetypeFor(next) === "marksman" ? AIM_DAMAGE_BONUS * aimStepsFor(next.hero.aimMs) : 0) +
        (archetypeFor(next) === "skirmisher"
          ? tempoDamageBonus(tempoStepsFor(next.hero.tempoStacks, next.hero.tempoGainedAtMs, next.worldTimeMs))
          : 0) +
        (archetypeFor(next) === "heavy_gunner"
          ? next.hero.deployedSinceMs > 0
            ? SET_UP_DAMAGE_BONUS
            : -UNDEPLOYED_DAMAGE_PENALTY
          : 0) +
        (isolated ? 0.15 : 0) +
        talentBonus(next, "accuracy") * 0.04 +
        (next.hero.riposteUntilMs > next.worldTimeMs ? 0.25 : 0),
      criticalChance: talentBonus(next, "critical"),
      criticalPower: talentBonus(next, "markPower") * 0.2,
    },
    enemyCombatProfile(next, target),
    {
      roll: spread.roll / 99,
      criticalRoll: criticalRoll.roll / 100,
      facing:
        archetypeFor(next) === "skirmisher" &&
        tempoGrantsBackstab(tempoStepsFor(next.hero.tempoStacks, next.hero.tempoGainedAtMs, next.worldTimeMs))
          ? "back"
          : strikeFacing(next, target),
      perfectDodgeTempo: next.hero.perfectDodgeUntilMs > next.worldTimeMs,
    },
  );
  if (target.rank === "boss" && target.phaseInvulnerableUntilMs > next.worldTimeMs) {
    next = addEffect(next, heroPosition, target.position, "miss", 0);
    return appendLog(next, `${target.name}: контур перестраивается, урон не проходит.`);
  }
  const damage = strike.damage;
  const critical = strike.critical;
  const hp = strike.targetHp;
  next = applyStrikeToEnemy(next, target.id, strike, heroPosition, "light");
  if (weapon.damageType === "resonant" || archetypeFor(next) === "resonance") {
    next = updateEnemy(next, target.id, (enemy) => ({
      ...enemy,
      resonanceStacks: Math.min(RESONANCE_MAX_STACKS, enemy.resonanceStacks + 1),
    }));
  }
  next = applyDirectionLoop(next, target.id, heroPosition, weapon);
  next = addEffect(next, heroPosition, target.position, critical ? "control" : "hero-hit", damage);
  if (critical && strike.criticalEffect) {
    next = appendLog(
      next,
      `${weapon.shortName}: критическое попадание, ${CRITICAL_EFFECT_PROFILE[strike.criticalEffect].label.toLowerCase()}.`,
    );
  }
  if (strike.staggered) {
    next = appendLog(next, `${target.name}: стойка сломана — цель ошеломлена и вскрыта.`);
  }

  if (weapon.category === "ranged" && talentBonus(next, "dizzy") > 0 && hp > 0) {
    const current = enemyById(next, target.id);
    if (current) {
      const stacks = current.dizzyUntilMs > next.worldTimeMs ? current.dizzyStacks + 1 : 1;
      const interrupt = stacks >= 3 && talentBonus(next, "microStun") > 0;
      next = updateEnemy(next, target.id, (enemy) => ({
        ...enemy,
        dizzyStacks: interrupt ? 0 : stacks,
        dizzyUntilMs: next.worldTimeMs + 4500,
        stunnedUntilMs: interrupt ? next.worldTimeMs + 420 : enemy.stunnedUntilMs,
        castUntilMs: interrupt ? 0 : enemy.castUntilMs,
        attackCooldownMs: interrupt ? Math.max(enemy.attackCooldownMs, 650) : enemy.attackCooldownMs,
      }));
      if (interrupt) {
        next = addEffect(next, target.position, target.position, "control", 0);
        next = appendLog(next, `${target.name}: головокружение перешло в микрооглушение, подготовка атаки сорвана.`);
      }
    }
  }

  const splashRatio = weapon.category === "melee" ? talentBonus(next, "splash") : 0;
  if (splashRatio > 0) {
    const secondary = next.enemies.filter(
      (enemy) =>
        enemy.id !== target.id &&
        enemy.zone === next.zone &&
        enemy.hp > 0 &&
        distance(enemy.position, target.position) <= 1.9,
    );
    for (const enemy of secondary) {
      next = skillDamage(next, enemy.id, Math.max(1, Math.round(damage * Math.min(0.75, splashRatio))), "splash");
    }
  }

  const tauntRadius = talentBonus(next, "tauntRadius");
  if (weapon.category === "melee" && tauntRadius > 0) {
    next = {
      ...next,
      enemies: next.enemies.map((enemy) =>
        enemy.zone === next.zone && enemy.hp > 0 && distance(enemy.position, target.position) <= tauntRadius
          ? { ...enemy, mode: "hunting", lastKnownHero: copyPoint(heroPosition), memoryMs: 6500, thinkCooldownMs: 0 }
          : enemy,
      ),
    };
  }
  if (hp <= 0) {
    next = {
      ...next,
      hero: { ...next.hero, attackTargetId: null, path: [], destination: null },
    };
    next = dropEnemyLoot(next, target);
    next = registerPopulationCasualty(next, target);
    next = awardXp(next, enemyXpReward(next, target));
    const reward = enemyXpReward(state, target);
    return appendLog(next, `${target.name} выведен из строя. Получено ${reward} опыта.`);
  }
  return appendLog(
    next,
    `${weapon.shortName}: ${damage} урона${critical ? " (крит.)" : ""}${strike.stanceDamage ? `, стойка −${strike.stanceDamage}` : ""}.`,
  );
}

function canEnemySeeHero(state: GameState, enemy: Enemy): boolean {
  if (enemy.zone !== state.zone || enemy.hp <= 0) return false;
  if (isSamosborActiveIn(state, enemy.zone)) return false;
  const hero = state.hero.positions[state.zone];
  if (isSamosborProtectedAt(state, state.zone, hero)) return false;
  const stealthPenalty =
    talentBonus(state, "stealth") +
    equipmentScalar(state, "stealth") +
    (state.hero.silentUntilMs > state.worldTimeMs ? 2.4 : 0);
  return (
    distance(enemy.position, hero) <= Math.max(1.5, enemy.visionRadius - stealthPenalty) &&
    hasLineOfSight(state, enemy.position, hero)
  );
}

function enemyRetreatPath(state: GameState, enemy: Enemy): Point[] {
  const hero = state.hero.positions[state.zone];
  const blocked = livingEnemyKeys(state, enemy.zone, enemy.id);
  const map = mapForZone(enemy.zone);
  const candidates: { path: Point[]; score: number }[] = [];
  for (let y = 0; y < map.rows.length; y += 1) {
    for (let x = 0; x < map.rows[0].length; x += 1) {
      const point = { x, y };
      if (!isWalkableIn(state, enemy.zone, point)) continue;
      const path = findPath(state, enemy.zone, enemy.position, point, blocked, "enemy");
      if (!path) continue;
      const cover = tileAtZone(state, enemy.zone, point) === "c" ? 3 : 0;
      candidates.push({ path, score: distance(point, hero) + cover - path.length * 0.05 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.path.slice(1) ?? [];
}

function thinkForEnemy(state: GameState, enemy: Enemy): Enemy {
  if (enemy.hp <= 0) return { ...enemy, mode: "disabled", path: [] };
  if (enemy.zone !== state.zone) return enemy;
  if (enemy.stunnedUntilMs > state.worldTimeMs) {
    return { ...enemy, path: [], thinkCooldownMs: 120 };
  }
  if (isSamosborActiveIn(state, enemy.zone)) {
    // Существо не охотится во время активной фазы: оно уходит в собственное логово так же, как герой ищет контур.
    const atHome = distance(enemy.position, enemy.home) <= 1.2;
    const retreat = enemy.path.length || atHome
      ? enemy.path
      : findPath(
          state,
          enemy.zone,
          enemy.position,
          enemy.home,
          livingEnemyKeys(state, enemy.zone, enemy.id),
          "enemy",
        )?.slice(1) ?? [];
    return {
      ...enemy,
      mode: "retreat",
      path: retreat,
      lastKnownHero: null,
      memoryMs: 0,
      castUntilMs: 0,
      thinkCooldownMs: 620,
    };
  }
  const hero = state.hero.positions[state.zone];
  const heroDistance = distance(enemy.position, hero);
  const sees = canEnemySeeHero(state, enemy);
  const critical = enemy.hp <= Math.ceil(enemy.maxHp * 0.3);

  if (critical) {
    return {
      ...enemy,
      mode: "retreat",
      path: enemy.path.length ? enemy.path : enemyRetreatPath(state, enemy),
      thinkCooldownMs: 350,
    };
  }

  if (sees && (heroDistance <= enemy.aggroRadius || ["hunting", "combat"].includes(enemy.mode))) {
    if (heroDistance <= enemy.attackRange) {
      return {
        ...enemy,
        mode: "combat",
        path: [],
        lastKnownHero: copyPoint(hero),
        memoryMs: 5200,
        thinkCooldownMs: 180,
      };
    }
    const blocked = livingEnemyKeys(state, enemy.zone, enemy.id);
    const path = findPath(state, enemy.zone, enemy.position, gridPoint(hero), blocked, "enemy");
    return {
      ...enemy,
      mode: "hunting",
      path: path?.slice(1) ?? enemy.path,
      lastKnownHero: copyPoint(hero),
      memoryMs: 5200,
      thinkCooldownMs: 240,
    };
  }

  if (sees) {
    return {
      ...enemy,
      mode: "suspicious",
      lastKnownHero: copyPoint(hero),
      memoryMs: 2800,
      thinkCooldownMs: 300,
    };
  }

  const hearsNoise =
    state.noise?.zone === enemy.zone &&
    state.noise.ttlMs > 0 &&
    distance(enemy.position, state.noise.position) <=
      Math.min(enemy.hearingRadius, state.noise.radius);
  if (hearsNoise && state.noise) {
    const blocked = livingEnemyKeys(state, enemy.zone, enemy.id);
    const path = findPath(state, enemy.zone, enemy.position, gridPoint(state.noise.position), blocked, "enemy");
    return {
      ...enemy,
      mode: "suspicious",
      path: path?.slice(1) ?? [],
      lastKnownHero: copyPoint(state.noise.position),
      memoryMs: 3200,
      thinkCooldownMs: 260,
    };
  }

  if (["hunting", "combat", "suspicious"].includes(enemy.mode) && enemy.memoryMs > 0 && enemy.lastKnownHero) {
    const blocked = livingEnemyKeys(state, enemy.zone, enemy.id);
    const path = findPath(state, enemy.zone, enemy.position, gridPoint(enemy.lastKnownHero), blocked, "enemy");
    return {
      ...enemy,
      mode: enemy.mode === "suspicious" ? "suspicious" : "hunting",
      path: path?.slice(1) ?? enemy.path,
      thinkCooldownMs: 300,
    };
  }

  const patrolTarget = enemy.patrol[enemy.patrolIndex];
  const reached = distance(enemy.position, patrolTarget) < 0.18;
  const patrolIndex = reached ? (enemy.patrolIndex + 1) % enemy.patrol.length : enemy.patrolIndex;
  const nextTarget = enemy.patrol[patrolIndex];
  const blocked = livingEnemyKeys(state, enemy.zone, enemy.id);
  const path = findPath(state, enemy.zone, enemy.position, nextTarget, blocked, "enemy");
  return {
    ...enemy,
    mode: "patrol",
    patrolIndex,
    path: path?.slice(1) ?? enemy.path,
    lastKnownHero: null,
    memoryMs: 0,
    thinkCooldownMs: 420,
  };
}

function alertGroup(state: GameState): GameState {
  const spotters = state.enemies.filter(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      ["combat", "hunting"].includes(enemy.mode),
  );
  if (!spotters.length) return state;
  const hero = state.hero.positions[state.zone];
  return {
    ...state,
    enemies: state.enemies.map((enemy) => {
      if (
        enemy.zone !== state.zone ||
        enemy.hp <= 0 ||
        ["combat", "hunting", "retreat"].includes(enemy.mode)
      ) {
        return enemy;
      }
      const alerted = spotters.some(
        (spotter) => distance(spotter.position, enemy.position) <= GROUP_ALERT_RADIUS,
      );
      return alerted
        ? {
            ...enemy,
            mode: "hunting" as const,
            lastKnownHero: copyPoint(hero),
            memoryMs: 4800,
            thinkCooldownMs: 0,
          }
        : enemy;
    }),
  };
}

function enemyAttackTick(state: GameState, enemyId: string): GameState {
  const enemy = enemyById(state, enemyId);
  if (isSamosborProtectedAt(state, state.zone, state.hero.positions[state.zone])) return state;
  if (isSamosborActiveIn(state, state.zone)) return state;
  if (!enemy || enemy.zone !== state.zone || enemy.mode !== "combat" || enemy.attackCooldownMs > 0) {
    return state;
  }
  const heroPosition = state.hero.positions[state.zone];
  if (
    distance(enemy.position, heroPosition) > enemy.attackRange ||
    !hasLineOfSight(state, enemy.position, heroPosition)
  ) {
    return state;
  }
  if (enemy.stunnedUntilMs > state.worldTimeMs) return state;
  if (enemy.castUntilMs <= 0) {
    // Тяжёлый замах — не случайность, а ритм: противник периодически
    // вкладывается в один читаемый удар, и это единственный момент, когда у
    // игрока есть настоящий выбор ответа.
    const heavy = (enemy.attackCount ?? 0) % 3 === 2;
    const tier: TelegraphTier = heavy ? "heavy" : "quick";
    return updateEnemy(state, enemy.id, (current) => ({
      ...current,
      castTier: tier,
      castStartedMs: state.worldTimeMs,
      castUntilMs:
        state.worldTimeMs +
        (tier === "heavy"
          ? TELEGRAPHS.heavy.windUpMs
          : current.kind === "collector"
            ? 700
            : TELEGRAPHS.quick.windUpMs),
    }));
  }
  if (enemy.castUntilMs > state.worldTimeMs) return state;
  const tier: TelegraphTier = enemy.castTier ?? "quick";
  let next = updateEnemy(state, enemy.id, (current) => ({
    ...current,
    attackCooldownMs: current.attackCooldownBaseMs,
    castUntilMs: 0,
    castStartedMs: 0,
    attackCount: (current.attackCount ?? 0) + 1,
  }));
  // Кадры неуязвимости уклонения отменяют удар целиком.
  if (next.hero.dodgeInvulnerableUntilMs > next.worldTimeMs) {
    next = addEffect(next, enemy.position, heroPosition, "miss", 0);
    return appendLog(next, `${enemy.name}: удар прошёл мимо — уклонение.`);
  }
  const spread = rollPercent(next);
  next = spread.state;
  const heroStanceMax = maxHeroStance(next);
  const strike = resolveStrike(
    {
      damage: telegraphDamage(enemy.damage, tier),
      stanceDamage: Math.max(4, Math.round(telegraphDamage(enemy.damage, tier) * 0.6)),
      damageType: enemy.kind === "sentry" ? "electric" : "kinetic",
      kind: tier === "heavy" ? "heavy" : "light",
    },
    {
      hp: next.hero.hp,
      maxHp: maxHeroHp(next),
      // Броню считает защитный конвейер ниже: здесь она обнулена, иначе удар
      // гасился бы дважды.
      armor: 0,
      flatAbsorb: 0,
      stance: next.hero.stance,
      maxStance: heroStanceMax,
      rank: "common",
      staggered: next.hero.staggeredUntilMs > next.worldTimeMs,
    },
    { roll: spread.roll / 99 },
  );
  // Защитный конвейер: уклонение и парирование отменяют удар целиком, блок,
  // броня и сопротивление гасят его долю. Ни один слой не требует нажатия —
  // всё это свойства сборки (game-defence.ts).
  const damageType: DamageType = enemy.kind === "sentry" ? "electric" : "kinetic";
  const rawDamage = enemy.rank === "boss" ? capBossHitOnHero(strike.damage, next.hero.hp) : strike.damage;
  const evasionRoll = rollPercent(next);
  next = evasionRoll.state;
  const parryRoll = rollPercent(next);
  next = parryRoll.state;
  const blockRoll = rollPercent(next);
  next = blockRoll.state;
  const staggerResist = Math.min(0.75, talentBonus(next, "staggerResist"));
  const rawStance = Math.round((next.hero.stance - strike.targetStance) * (1 - staggerResist));
  const outcome = resolveDefence(
    rawDamage,
    damageType,
    heroDefenceProfile(next),
    {
      evasion: evasionRoll.roll / 100,
      parry: parryRoll.roll / 100,
      block: blockRoll.roll / 100,
    },
    rawStance,
  );
  if (outcome.avoided) {
    next = addEffect(next, enemy.position, heroPosition, "miss", 0);
    if (outcome.parried) {
      // Парирование обращает защиту в атаку: атакующий теряет замах и стойку.
      next = updateEnemy(next, enemy.id, (current) => ({
        ...current,
        castUntilMs: 0,
        castStartedMs: 0,
        stance: Math.max(0, current.stance - 12),
        attackCooldownMs: Math.max(current.attackCooldownMs, 900),
      }));
    }
    return appendLog(next, `${enemy.name}: ${describeDefence(outcome)}.`);
  }
  const damage = outcome.damage;
  const incomingStance = outcome.postureDamage;
  const heroStanceAfter = Math.max(0, next.hero.stance - incomingStance);
  const heroStagger = heroStanceAfter <= 0 && next.hero.stance > 0
    && next.hero.staggerImmuneUntilMs <= next.worldTimeMs;
  next = {
    ...next,
    hero: {
      ...next.hero,
      hp: Math.max(0, next.hero.hp - damage),
      stance: heroStagger ? Math.round(heroStanceMax * 0.35) : heroStanceAfter,
      stanceIdleMs: 0,
      staggeredUntilMs: heroStagger
        ? next.worldTimeMs + staggerProfile("common").durationMs
        : next.hero.staggeredUntilMs,
      staggerImmuneUntilMs: heroStagger
        ? next.worldTimeMs + staggerProfile("common").durationMs + staggerProfile("common").immunityMs
        : next.hero.staggerImmuneUntilMs,
      breath: Math.max(0, Math.min(maxHeroBreath(next), next.hero.breath - strike.breathCost)),
      breathIdleMs: 0,
      stress: Math.min(100, next.hero.stress + 5 + Math.round(damage / 6)),
    },
  };
  next = addEffect(next, enemy.position, heroPosition, "enemy-hit", damage);
  // Разбор удара по слоям: игрок должен понимать, что именно сработало, а не
  // видеть одно итоговое число.
  const mitigated = outcome.steps.filter((step) => step.applied);
  next = appendLog(
    next,
    `${enemy.name}: ${damage} урона` +
      `${mitigated.length ? ` (${describeDefence(outcome)})` : ""}` +
      `${heroStagger ? "; стойка сломана" : ""}.`,
  );
  if (next.hero.hp <= Math.max(1, Math.floor(maxHeroHp(next) * 0.25)) && hasTalent(next, "legendary:second-beat") && next.hero.secondBeatReady) {
    next = {
      ...next,
      hero: {
        ...next.hero,
        hp: Math.max(3, next.hero.hp),
        secondBeatReady: false,
        stress: Math.max(0, next.hero.stress - 20),
      },
    };
    next = appendLog(next, "Второй удар лифта удержал героя на границе эвакуации.");
  }
  return next.hero.hp <= 0 ? applyRescue(next, "Герой потерял боеспособность.") : next;
}

function tickDrone(state: GameState): GameState {
  if (state.hero.evadeMode || talentBonus(state, "droneDamage") <= 0 || state.hero.droneCooldownMs > 0) return state;
  const hero = state.hero.positions[state.zone];
  const target = state.enemies
    .filter(
      (enemy) =>
        enemyVisibleToHero(state, enemy) &&
        distance(hero, enemy.position) <= 3.8,
    )
    .sort((a, b) => distance(hero, a.position) - distance(hero, b.position))[0];
  if (!target) return state;
  const droneDamage = Math.max(1, 1 + Math.round(talentBonus(state, "droneDamage")));
  const hp = Math.max(0, target.hp - droneDamage);
  let next = updateEnemy(state, target.id, (enemy) => ({
    ...enemy,
    hp,
    mode: hp <= 0 ? "disabled" : "combat",
    lastKnownHero: copyPoint(hero),
    memoryMs: 4200,
  }));
  next = {
    ...next,
    hero: {
      ...next.hero,
      droneCooldownMs: Math.max(
        620,
        1600 * (1 - talentBonus(next, "droneSpeed") - (next.hero.overclockUntilMs > next.worldTimeMs ? 0.25 : 0)),
      ),
    },
  };
  next = addEffect(next, { x: hero.x + 0.2, y: hero.y - 0.25 }, target.position, "drone", droneDamage);
  if (hp <= 0) {
    next = dropEnemyLoot(next, target);
    next = registerPopulationCasualty(next, target);
    next = awardXp(next, enemyXpReward(next, target));
    return appendLog(next, `Рембот Р-3 отключил цель «${target.name}».`);
  }
  return next;
}

function nearestGroundLoot(state: GameState): GroundLoot | null {
  const hero = state.hero.positions[state.zone];
  return (
    state.groundLoot
      .filter((loot) => loot.zone === state.zone && distance(hero, loot.position) <= 1.2)
      .sort((a, b) => distance(hero, a.position) - distance(hero, b.position))[0] ?? null
  );
}

function collectGroundLoot(state: GameState, loot: GroundLoot): GameState {
  const result = addInventoryItem(state, loot.itemId, loot.quantity, loot.condition);
  if (!result.added) {
    return appendLog(state, `${ITEMS[loot.itemId].name}: не хватает грузоподъёмности.`);
  }
  return appendLog(
    {
      ...result.state,
      hero: { ...result.state.hero, pendingInteraction: null },
      groundLoot: result.state.groundLoot.filter((item) => item.id !== loot.id),
    },
    `Подобрано: ${ITEMS[loot.itemId].name}${loot.quantity > 1 ? ` ×${loot.quantity}` : ""}.`,
  );
}

function containerKey(state: GameState, point: Point): string {
  const grid = gridPoint(point);
  return `${state.zone}:${grid.x}:${grid.y}`;
}

function containerContents(key: string): { itemId: ItemId; quantity?: number; condition?: number }[] {
  const regional = REGION_CONTAINER_CONTENTS[key];
  if (regional) return regional as { itemId: ItemId; quantity?: number; condition?: number }[];
  if (key === "floor556:11:13") {
    return [
      { itemId: "bandage" },
      { itemId: "repairKit" },
      { itemId: "keyWithoutDoor" },
    ];
  }
  if (key === "floor554:22:33") {
    return [
      { itemId: "bandage", quantity: 2 },
      { itemId: "fieldRation", quantity: 2 },
      { itemId: "painkillers" },
    ];
  }
  if (key === "floor554:52:33") {
    return [{ itemId: "filterCartridge" }, { itemId: "repairKit" }];
  }
  if (key === "voidLab:8:5") {
    return [
      { itemId: "traumaInjector" },
      { itemId: "filterCartridge", quantity: 2 },
      { itemId: "coilRifle", condition: 64 },
      { itemId: "platedVestBn3", condition: 72 },
      { itemId: "horizonCarbine", condition: 100 },
    ];
  }
  return [];
}

function openContainer(state: GameState, point: Point): GameState {
  const key = containerKey(state, point);
  if (state.openedContainers.includes(key)) return appendLog(state, "Шкаф уже пуст.");
  let next: GameState = {
    ...state,
    openedContainers: [...state.openedContainers, key],
  };
  const collected: string[] = [];
  const spilled: string[] = [];
  for (const content of containerContents(key)) {
    const quantity = content.quantity ?? 1;
    const result = addInventoryItem(next, content.itemId, quantity, content.condition ?? 100);
    if (result.added) {
      next = result.state;
      collected.push(`${ITEMS[content.itemId].shortName}${quantity > 1 ? ` ×${quantity}` : ""}`);
    } else {
      next = spawnGroundLoot(
        next,
        state.zone,
        point,
        content.itemId,
        quantity,
        content.condition ?? 100,
      );
      spilled.push(ITEMS[content.itemId].shortName);
    }
  }
  // Пустой шкаф и переполненный рюкзак — разные события: раньше оба сообщали
  // о перегрузе, и пустой шкаф выглядел как ошибка инвентаря.
  const message = collected.length
    ? `Шкаф открыт. Получено: ${collected.join(", ")}.${spilled.length ? ` На полу осталось: ${spilled.join(", ")}.` : ""}`
    : spilled.length
      ? "Шкаф открыт, но весь груз остался на полу: рюкзак перегружен."
      : "Шкаф вскрыт. Внутри пусто.";
  return appendLog(next, message);
}

function nearestInteractive(state: GameState): { point: Point; tile: string } | null {
  const map = mapForZone(state.zone);
  const hero = state.hero.positions[state.zone];
  let nearest: { point: Point; tile: string; distance: number } | null = null;
  for (let y = 0; y < map.rows.length; y += 1) {
    for (let x = 0; x < map.rows[0].length; x += 1) {
      const point = { x, y };
      const tile = tileAt(state, point);
      if (!["S", "H", "T", "A", "P", "U", "D", "L", "c", "B", "N"].includes(tile)) continue;
      const currentDistance = distance(hero, point);
      if (currentDistance <= 1.2 && (!nearest || currentDistance < nearest.distance)) {
        nearest = { point, tile, distance: currentDistance };
      }
    }
  }
  return nearest ? { point: nearest.point, tile: nearest.tile } : null;
}

function nearestNpc(state: GameState, maximumDistance = 1.35): Npc | null {
  const hero = state.hero.positions[state.zone];
  return state.npcs
    .filter((npc) => npc.zone === state.zone && distance(hero, npc.position) <= maximumDistance)
    .sort((left, right) => distance(hero, left.position) - distance(hero, right.position))[0] ?? null;
}

function npcInteractionText(npc: Npc): string {
  if (npc.kind === "merchant") {
    const stock = (npc.vendorStock ?? []).map((itemId) => ITEMS[itemId].shortName).join(", ");
    return `«Показываю текущий запас: ${stock || "поставки задерживаются"}. Полноценный городской обмен будет подключён к экономике хаба».`;
  }
  if (npc.role === "registrar") return "«Город считает тебя временным обходчиком. Нижний выход на этаж 550 открыт, но за воротами уже нет городской защиты».";
  if (npc.role === "medic") return "«Сядь у стены и не дёргайся. В городе восстановление идёт быстрее, но чудес у нас не осталось».";
  if (npc.kind === "liquidator") return "«После сирены не геройствуй. Гермодверь, тишина, потом выходишь вслед за нами».";
  if (npc.role === "courier") return "«Трафик между кварталами держится на ногах и расписках. Лифты слишком часто думают сами».";
  if (npc.role === "archivist") return "«У города шесть номеров этажей и одна память. Не путай карту с местностью».";
  return "«Живём, пока держит гермоконтур. Остальное обсуждают только после закрытия дверей».";
}

function interactWithNpc(state: GameState, npc: Npc): GameState {
  let next: GameState = {
    ...state,
    hero: { ...state.hero, pendingInteraction: null },
    npcs: state.npcs.map((entry) =>
      entry.id === npc.id
        ? { ...entry, speech: npcInteractionText(npc), speechUntilMs: state.worldTimeMs + 5200 }
        : entry,
    ),
  };
  if (npc.role === "medic") {
    next = {
      ...next,
      hero: {
        ...next.hero,
        hp: Math.min(maxHeroHp(next), next.hero.hp + 2),
        stress: Math.max(0, next.hero.stress - 12),
      },
    };
  }
  return appendLog(next, `${npc.name}, ${npcRoleLabel(npc.role)}: ${npcInteractionText(npc)}`);
}

export function interactionHint(state: GameState): string {
  const loot = nearestGroundLoot(state);
  if (loot) return `Подобрать: ${ITEMS[loot.itemId].shortName}`;
  const npc = nearestNpc(state);
  if (npc) return `Поговорить: ${npc.name} · ${npcRoleLabel(npc.role)}`;
  const target = nearestInteractive(state);
  if (!target) return "Подойдите к объекту";
  return {
    S: "Восстановить датчик СБ-04",
    H: "Проверить гермодверь и защищённую комнату",
    T: "Прочитать терминал",
    A: "Извлечь артефакт",
    P: state.zone === "voidLab" ? "Покинуть войд-зону через случайный разрыв" : "Войти в редкую войд-зону",
    U: state.zone === "floor550" ? "Вернуться в Город 550" : state.zone === "floor554" ? "Подняться на этаж 555" : "Перейти на этаж выше",
    D: state.zone === "floor554" ? "Выйти из города на этаж 550" : state.zone === "floor555" ? "Спуститься в Город 550" : "Перейти на этаж ниже",
    L: "Проверить лифт",
    c: "Осмотреть укрытие",
    N: state.zone === "floor554" ? "Поговорить с регистратором Города 550" : "Поговорить с диспетчером Орловой",
    B: state.openedContainers.includes(containerKey(state, target.point))
      ? "Проверить пустой шкаф"
      : "Открыть аварийный шкаф",
  }[target.tile] ?? "Использовать";
}

function transitionFloor(state: GameState, tile: "U" | "D"): GameState {
  const regionalTransition = REGION_TRANSITIONS[`${state.zone}:${tile}`];
  if (regionalTransition) {
    const targetZone = regionalTransition.zone as ZoneId;
    return reveal(
      appendLog(
        {
          ...state,
          zone: targetZone,
          hero: {
            ...state.hero,
            path: [],
            destination: null,
            attackTargetId: null,
            pendingInteraction: null,
            evadeMode: isCitySafeZone(targetZone) ? false : state.hero.evadeMode,
            positions: { ...state.hero.positions, [targetZone]: copyPoint(regionalTransition.position) },
          },
        },
        regionalTransition.message,
      ),
    );
  }
  const transition =
    state.zone === "floor550" && tile === "U"
      ? { zone: "floor554" as const, position: FLOOR_554_DOWN, message: "Возвращение выполнено: Город 550, Большой разлом." }
      : state.zone === "floor554" && tile === "D"
        ? { zone: "floor550" as const, position: FLOOR_550_UP, message: "Городские ворота закрылись за спиной. Этаж 550, нижний выход." }
        : state.zone === "floor554" && tile === "U"
          ? { zone: "floor555" as const, position: FLOOR_555_DOWN, message: "Подъём выполнен: этаж 555, ремонтный пояс." }
          : state.zone === "floor555" && tile === "D"
            ? { zone: "floor554" as const, position: FLOOR_554_UP, message: "Спуск выполнен: Город 550, Большой разлом." }
        : state.zone === "floor555" && tile === "U"
      ? { zone: "floor556" as const, position: FLOOR_556_DOWN, message: "Подъём выполнен: этаж 556." }
      : state.zone === "floor556" && tile === "D"
        ? { zone: "floor555" as const, position: FLOOR_555_UP, message: "Спуск выполнен: этаж 555, ремонтный пояс." }
        : state.zone === "floor556" && tile === "U"
          ? { zone: "floor557" as const, position: FLOOR_557_DOWN, message: "Подъём выполнен: этаж 557, жилой контур." }
          : state.zone === "floor557" && tile === "D"
            ? { zone: "floor556" as const, position: FLOOR_556_UP, message: "Спуск выполнен: этаж 556." }
            : null;
  if (!transition) return appendLog(state, "Переход не отвечает на вызов.");
  return reveal(
    appendLog(
      {
        ...state,
        zone: transition.zone,
        hero: {
          ...state.hero,
          path: [],
          destination: null,
          attackTargetId: null,
          pendingInteraction: null,
          evadeMode: transition.zone === "floor554" ? false : state.hero.evadeMode,
          positions: {
            ...state.hero.positions,
            [transition.zone]: copyPoint(transition.position),
          },
        },
      },
      transition.message,
    ),
  );
}

function interactWithTarget(state: GameState, target: { point: Point; tile: string }): GameState {
  let next = state;
  const regionalTerminal = REGION_TERMINAL_MESSAGES[state.zone as RegionZoneId];
  const regionalNpc = REGION_NPC_MESSAGES[state.zone as RegionZoneId];
  if (target.tile === "T" && regionalTerminal) {
    next = appendLog(state, regionalTerminal);
  } else if (target.tile === "N" && regionalNpc) {
    next = appendLog(state, regionalNpc);
  } else if (state.zone === "floor556" && target.tile === "S") {
    if (state.sensorFixed) {
      next = appendLog(state, "Датчик СБ-04 работает в допустимом диапазоне.");
    } else {
      const reward = questXpReward(state, 0.08);
      next = awardXp({ ...state, sensorFixed: true }, reward);
      next = armScriptedSamosbor(next, "floor556");
      next = appendLog(next, `Датчик СБ-04 восстановлен. Полевая задача: +${reward} опыта. Первое же измерение показало подготовку среды: диспетчерская требует немедленно пройти в гермосектор.`);
    }
  } else if (state.zone === "floor556" && target.tile === "H") {
    if (state.missionComplete) {
      next = appendLog(state, "Учебная операция уже закрыта. Открыт маршрут вниз, к ремонтному поясу 555.");
    } else if (state.sensorFixed) {
      const reward = questXpReward(state, 0.4);
      next = awardXp(state, reward);
      next = appendLog({ ...next, missionComplete: true }, `Учебная смена завершена. Операция: +${reward} опыта. Следующая директива: спуститься на этаж 555.`);
    } else {
      next = appendLog(state, "Гермодверь исправна, но директива ещё не выполнена.");
    }
  } else if (state.zone === "floor556" && target.tile === "T") {
    next = appendLog(state, "Терминал: старая линия ВЖ-7 активна. В лаборатории числится производство катушек.");
  } else if (state.zone === "voidLab" && target.tile === "A") {
    if (state.artifactRecovered) {
      next = appendLog(state, "Артефактное гнездо пусто.");
    } else {
      const explorationReward = questXpReward(state, 0.12);
      const recovered = awardXp({
        ...state,
        artifactRecovered: true,
        voidStabilityMs: Math.max(5000, state.voidStabilityMs - 9000),
      }, explorationReward);
      const result = addInventoryItem(recovered, "reverseCoil");
      if (result.added) {
        const heartbeat = addInventoryItem(result.state, "elevatorHeartbeat");
        next = heartbeat.added
          ? appendLog(
              heartbeat.state,
              `Получены Катушка обратного шага и легендарное «Сердцебиение лифта». Исследование: +${explorationReward} опыта. Стабильность войд-зоны резко снизилась.`,
            )
          : appendLog(
              spawnGroundLoot(result.state, state.zone, target.point, "elevatorHeartbeat"),
              `Катушка получена; легендарный артефакт остался на полу из-за перегруза. Исследование: +${explorationReward} опыта.`,
            );
      } else {
        next = spawnGroundLoot(recovered, state.zone, target.point, "reverseCoil");
        next = spawnGroundLoot(next, state.zone, target.point, "elevatorHeartbeat");
        next = appendLog(next, `Оба артефакта остались на полу: рюкзак перегружен. Исследование: +${explorationReward} опыта.`);
      }
    }
  } else if (state.zone === "voidLab" && target.tile === "P") {
    const destinations: { zone: ZoneId; position: Point; label: string }[] = [
      { zone: "floor547", position: { x: 28, y: 18 }, label: "архив НИИ-547" },
      { zone: "floor550", position: { x: 6, y: 33 }, label: "нижний выход, этаж 550" },
      { zone: "floor554", position: { x: 8, y: 33 }, label: "Город 550" },
      { zone: "floor555", position: { x: 4, y: 19 }, label: "этаж 555" },
      { zone: "floor556", position: { x: 30, y: 18 }, label: "этаж 556" },
      { zone: "floor557", position: { x: 5, y: 19 }, label: "этаж 557" },
    ];
    const index = Math.abs(state.rngSeed + Math.floor(state.worldTimeMs / 1000)) % destinations.length;
    const destination = destinations[index];
    next = appendLog(
      {
        ...state,
        zone: destination.zone,
        rngSeed: (Math.imul(state.rngSeed, 1664525) + 1013904223) >>> 0,
        hero: {
          ...state.hero,
          path: [],
          destination: null,
          attackTargetId: null,
          pendingInteraction: null,
          evadeMode: false,
          positions: { ...state.hero.positions, [destination.zone]: copyPoint(destination.position) },
        },
      },
      `Войд-зона схлопнулась за спиной. Героя выбросило на ${destination.label}; обратный маршрут исчез.`,
    );
  } else if (state.zone !== "voidLab" && target.tile === "P") {
    next = appendLog(
      {
        ...state,
        zone: "voidLab",
        voidStabilityMs: VOID_STABILITY_MS,
        hero: {
          ...state.hero,
          path: [],
          destination: null,
          attackTargetId: null,
          pendingInteraction: null,
          evadeMode: false,
          positions: { ...state.hero.positions, voidLab: copyPoint(VOID_START) },
        },
      },
      "Герой сознательно вошёл в редкую войд-зону. Обратный проход сразу исчез.",
    );
  } else if (state.zone === "floor556" && target.tile === "N") {
    next = appendLog(state, "Диспетчер Орлова: «Сначала освойся в секторе. Проверь датчик СБ-04, затем доберись до гермоблока. В коридорах замечены четыре малые группы существ». ");
  } else if (state.zone === "floor554" && target.tile === "T") {
    next = appendLog(state, "Схема Города 550: одна физическая карта объединяет кварталы уровней 554–551. Нижние ворота ведут сразу на опасный этаж 550; отдельного города под городом не будет.");
  } else if (target.tile === "H") {
    next = appendLog(state, "Гермодверь исправна. За ней находится автономная комната: существа, слизь и последствия Самосбора внутрь не проникают.");
  } else if (target.tile === "U" || target.tile === "D") {
    next = transitionFloor(state, target.tile);
  } else if (target.tile === "L") {
    next = appendLog(state, state.zone === "floor554"
      ? "Городская линия связывает кварталы внутри одной большой карты. Для дальнейшего спуска используй нижние ворота на этаж 550."
      : "Лифт закреплён за городом П-46. Внешние маршруты закрыты.");
  } else if (target.tile === "c") {
    next = appendLog(state, "Низкое укрытие даёт +2 к защите от дистанционных атак.");
  } else if (target.tile === "B") {
    next = openContainer(state, target.point);
  }
  return emitNoise(
    { ...next, hero: { ...next.hero, pendingInteraction: null } },
    next.hero.positions[next.zone],
    3.5,
    "взаимодействие",
  );
}

export function interact(state: GameState): GameState {
  const loot = nearestGroundLoot(state);
  if (loot) return collectGroundLoot(state, loot);
  const npc = nearestNpc(state);
  if (npc) return interactWithNpc(state, npc);
  const target = nearestInteractive(state);
  return target ? interactWithTarget(state, target) : appendLog(state, "Рядом нет доступного объекта.");
}

export function commandCollectLoot(state: GameState, lootId: string): GameState {
  const loot = state.groundLoot.find((entry) => entry.id === lootId && entry.zone === state.zone);
  if (!loot) return state;
  if (distance(state.hero.positions[state.zone], loot.position) <= 1.2) return collectGroundLoot(state, loot);
  const moving = commandMove(state, loot.position);
  return {
    ...moving,
    hero: { ...moving.hero, pendingInteraction: { kind: "loot", id: loot.id } },
  };
}

export function commandInteractAt(state: GameState, point: Point): GameState {
  const tile = tileAt(state, point);
  if (!["S", "H", "T", "A", "P", "U", "D", "L", "c", "B", "N"].includes(tile)) {
    return commandMove(state, point);
  }
  if (distance(state.hero.positions[state.zone], point) <= 1.2) {
    return interactWithTarget(state, { point: gridPoint(point), tile });
  }
  const moving = commandMove(state, point);
  return {
    ...moving,
    hero: {
      ...moving.hero,
      pendingInteraction: { kind: "tile", zone: state.zone, point: gridPoint(point) },
    },
  };
}

export function commandTalkToNpc(state: GameState, npcId: string): GameState {
  const npc = npcById(state, npcId);
  if (!npc || npc.zone !== state.zone) return state;
  if (distance(state.hero.positions[state.zone], npc.position) <= 1.35) return interactWithNpc(state, npc);
  const moving = commandMove(state, npc.position);
  return {
    ...moving,
    hero: { ...moving.hero, pendingInteraction: { kind: "npc", id: npc.id } },
  };
}

function resolvePendingInteraction(state: GameState): GameState {
  const pending = state.hero.pendingInteraction;
  if (!pending) return state;
  const hero = state.hero.positions[state.zone];
  if (pending.kind === "loot") {
    const loot = state.groundLoot.find((entry) => entry.id === pending.id && entry.zone === state.zone);
    if (!loot) return { ...state, hero: { ...state.hero, pendingInteraction: null } };
    if (distance(hero, loot.position) <= 1.2) return collectGroundLoot(state, loot);
    if (!state.hero.path.length) return commandCollectLoot(state, loot.id);
    return state;
  }
  if (pending.kind === "npc") {
    const npc = npcById(state, pending.id);
    if (!npc || npc.zone !== state.zone) return { ...state, hero: { ...state.hero, pendingInteraction: null } };
    if (distance(hero, npc.position) <= 1.35) return interactWithNpc(state, npc);
    if (!state.hero.path.length) return commandTalkToNpc(state, npc.id);
    return state;
  }
  if (pending.zone !== state.zone) return { ...state, hero: { ...state.hero, pendingInteraction: null } };
  const tile = tileAt(state, pending.point);
  if (distance(hero, pending.point) <= 1.2) return interactWithTarget(state, { point: pending.point, tile });
  if (!state.hero.path.length) return commandInteractAt(state, pending.point);
  return state;
}

const SAMOSBOR_ZONES = Object.keys(ZONE_STARTS) as ZoneId[];

function samosborScheduleRoll(seed: number, salt: number): number {
  const mixed = Math.imul(seed ^ Math.imul(salt + 1, 0x9e3779b1), 1664525) + 1013904223;
  return (mixed >>> 0) % 100;
}

function createSamosborState(seed: number): SamosborState {
  const zones = {} as Record<ZoneId, SamosborZoneEvent>;
  SAMOSBOR_ZONES.forEach((zone, index) => {
    const profile = samosborProfileFor(zone);
    const scheduled = !profile.sheltered && !profile.scripted;
    zones[zone] = {
      phase: "calm",
      phaseEndsAtMs: scheduled
        ? samosborQuietDurationMs(profile, samosborScheduleRoll(seed, index))
        : 0,
      severity: profile.severity,
      scripted: profile.scripted,
      completed: 0,
    };
  });
  return {
    zones,
    exposureMs: 0,
    exposureHits: 0,
    caughtCount: 0,
    lastCompletedZone: null,
    lastCompletedAtMs: 0,
  };
}

export function samosborEventIn(state: GameState, zone: ZoneId = state.zone): SamosborZoneEvent {
  return state.samosbor.zones[zone] ?? {
    phase: "calm",
    phaseEndsAtMs: 0,
    severity: samosborProfileFor(zone).severity,
    scripted: false,
    completed: 0,
  };
}

export function samosborPhaseIn(state: GameState, zone: ZoneId = state.zone): SamosborPhase {
  return samosborEventIn(state, zone).phase;
}

/** Активная фаза на этаже: открытое пространство наносит урон, существа прячутся. */
export function isSamosborActiveIn(state: GameState, zone: ZoneId = state.zone): boolean {
  return isSamosborLethalPhase(samosborPhaseIn(state, zone));
}

/** Сирена и активная фаза подсвечивают известные гермоукрытия на схеме. */
export function samosborHighlightsShelters(state: GameState, zone: ZoneId = state.zone): boolean {
  const phase = samosborPhaseIn(state, zone);
  return phase === "siren" || phase === "active";
}

export function samosborExposureSeconds(state: GameState): number {
  return Math.floor(state.samosbor.exposureMs / 1000);
}

function withSamosborZone(
  state: GameState,
  zone: ZoneId,
  update: (event: SamosborZoneEvent) => SamosborZoneEvent,
): GameState {
  return {
    ...state,
    samosbor: {
      ...state.samosbor,
      zones: { ...state.samosbor.zones, [zone]: update(samosborEventIn(state, zone)) },
    },
  };
}

/** Сценарный первый Самосбор этажа 556 запускается восстановленным датчиком, а не таймером. */
function armScriptedSamosbor(state: GameState, zone: ZoneId): GameState {
  const event = samosborEventIn(state, zone);
  if (!event.scripted || event.phase !== "calm" || event.phaseEndsAtMs > 0) return state;
  return withSamosborZone(state, zone, (current) => ({
    ...current,
    phaseEndsAtMs: state.worldTimeMs + 4000,
  }));
}

function applySamosborAftermath(state: GameState, zone: ZoneId): GameState {
  const affected = state.populations.filter((population) => population.zone === zone);
  const next: GameState = {
    ...state,
    populations: state.populations.map((population) =>
      population.zone === zone
        ? {
            ...population,
            agitation: clampPopulation(population.agitation + SAMOSBOR_AGITATION_GAIN, 0, 100),
          }
        : population,
    ),
    samosbor: {
      ...state.samosbor,
      lastCompletedZone: zone,
      lastCompletedAtMs: state.worldTimeMs,
    },
  };
  return zone === state.zone && affected.length
    ? appendLog(next, `Популяции этажа пережили событие в укрытиях и вышли встревоженными: ${affected.map((population) => population.name).join(", ")}.`)
    : next;
}

function advanceSamosborZone(state: GameState, zone: ZoneId): GameState {
  const event = samosborEventIn(state, zone);
  const profile = samosborProfileFor(zone);
  const phase = nextSamosborPhase(event.phase);
  const rolled = rollPercent(state);
  const scripted = event.scripted && phase !== "calm";
  const durationMs = phase === "calm"
    ? samosborQuietDurationMs(profile, rolled.roll)
    : scripted
      ? SAMOSBOR_SCRIPTED_PHASE_MS[phase]
      : samosborPhaseDurationMs(phase, profile, rolled.roll);

  let next = withSamosborZone(rolled.state, zone, (current) => ({
    ...current,
    phase,
    phaseEndsAtMs: rolled.state.worldTimeMs + durationMs,
    severity: profile.severity,
    scripted,
    completed: phase === "calm" ? current.completed + 1 : current.completed,
  }));

  if (phase === "active") {
    next = {
      ...next,
      enemies: next.enemies.map((enemy) =>
        enemy.zone === zone && enemy.hp > 0
          ? {
              ...enemy,
              mode: "retreat" as const,
              path: [],
              lastKnownHero: null,
              memoryMs: 0,
              castUntilMs: 0,
            }
          : enemy,
      ),
    };
    next = reconcilePopulationEnemies(next);
  }
  if (phase === "calm") {
    next = applySamosborAftermath(next, zone);
    next = reconcilePopulationEnemies(next);
  }
  if (zone === next.zone) {
    next = appendLog(next, samosborPhaseMessage(phase, mapForZone(zone).name));
    if (phase === "active") {
      next = appendLog(
        next,
        isSamosborProtectedAt(next, zone, next.hero.positions[zone])
          ? SAMOSBOR_SHELTER_MESSAGE
          : SAMOSBOR_EXPOSURE_MESSAGE,
      );
    }
  }
  return next;
}

function tickSamosborSchedule(state: GameState): GameState {
  let next = state;
  for (const zone of SAMOSBOR_ZONES) {
    const profile = samosborProfileFor(zone);
    if (profile.sheltered) continue;
    const event = samosborEventIn(next, zone);
    if (event.phaseEndsAtMs <= 0) continue;
    if (next.worldTimeMs < event.phaseEndsAtMs) continue;
    next = advanceSamosborZone(next, zone);
  }
  return next;
}

function firstHermeticPoint(zone: ZoneId): Point | null {
  const map = mapForZone(zone);
  for (let y = 0; y < map.rows.length; y += 1) {
    const x = map.rows[y].indexOf("g");
    if (x >= 0) return { x, y };
  }
  return null;
}

function applySamosborCatch(state: GameState): GameState {
  const shelter: ZoneId = state.visited.floor554.length > 0 ? "floor554" : "floor556";
  const caught = applyRescue(state, SAMOSBOR_CATCH_MESSAGE, "head", {
    zone: shelter,
    equipmentDamage: 26,
    stressGain: 45,
    contaminationGain: 30,
  });
  // Аварийная группа не может высадить героя обратно под активную фазу: выход только в защищённый контур.
  const refuge = isSamosborActiveIn(caught, shelter) ? firstHermeticPoint(shelter) : null;
  return {
    ...caught,
    hero: refuge
      ? {
          ...caught.hero,
          positions: { ...caught.hero.positions, [shelter]: copyPoint(refuge) },
        }
      : caught.hero,
    samosbor: {
      ...caught.samosbor,
      exposureMs: 0,
      exposureHits: 0,
      caughtCount: caught.samosbor.caughtCount + 1,
    },
  };
}

function tickSamosborExposure(state: GameState, deltaMs: number): GameState {
  const event = samosborEventIn(state, state.zone);
  if (!isSamosborLethalPhase(event.phase)) {
    return state.samosbor.exposureMs === 0 && state.samosbor.exposureHits === 0
      ? state
      : { ...state, samosbor: { ...state.samosbor, exposureMs: 0, exposureHits: 0 } };
  }

  const severity = event.severity;
  if (isSamosborProtectedAt(state, state.zone, state.hero.positions[state.zone])) {
    // Внутри контура экспозиция рассасывается вдвое быстрее, чем накапливается.
    const exposureMs = Math.max(0, state.samosbor.exposureMs - deltaMs * 2);
    return {
      ...state,
      samosbor: {
        ...state.samosbor,
        exposureMs,
        exposureHits: Math.min(
          state.samosbor.exposureHits,
          samosborExposureHits(exposureMs, severity),
        ),
      },
    };
  }

  const exposureMs = state.samosbor.exposureMs + deltaMs;
  const hits = samosborExposureHits(exposureMs, severity);
  // Один «удар» среды снимает долю максимума и усиливается с каждой секундой
  // снаружи: чем дольше герой в открытом пространстве, тем быстрее он рассыпается.
  const newHits = Math.max(0, hits - state.samosbor.exposureHits);
  let damage = 0;
  for (let index = 0; index < newHits; index += 1) {
    const order = state.samosbor.exposureHits + index;
    damage += Math.max(1, Math.round(maxHeroHp(state) * 0.06 * (1 + order * 0.12)));
  }
  const contaminationFactor = Math.max(0.3, 1 - talentBonus(state, "contaminationResist"));
  let next: GameState = {
    ...state,
    samosbor: { ...state.samosbor, exposureMs, exposureHits: hits },
    hero: {
      ...state.hero,
      hp: Math.max(0, state.hero.hp - damage),
      contamination: Math.min(
        100,
        state.hero.contamination + deltaMs * SAMOSBOR_CONTAMINATION_PER_MS * severity * contaminationFactor,
      ),
      stress: Math.min(100, state.hero.stress + deltaMs * SAMOSBOR_STRESS_PER_MS * severity),
    },
  };
  if (damage > 0 && next.hero.hp > 0 && state.samosbor.exposureHits === 0) {
    next = appendLog(next, "Среда начала разбирать снаряжение и ткани героя. Гермодверь ещё можно успеть закрыть.");
  }
  return next.hero.hp <= 0 ? applySamosborCatch(next) : next;
}

export function createInitialState(): GameState {
  const state: GameState = {
    zone: "floor556",
    hero: {
      positions: {
        floor545: { ...REGION_STARTS.floor545 },
        floor546: { ...REGION_STARTS.floor546 },
        floor547: { ...REGION_STARTS.floor547 },
        floor548: { ...REGION_STARTS.floor548 },
        floor549: { ...REGION_STARTS.floor549 },
        floor550: { ...FLOOR_550_START },
        floor554: { ...FLOOR_554_START },
        floor555: { ...FLOOR_555_START },
        floor556: { ...FLOOR_START },
        floor557: { ...FLOOR_557_START },
        voidLab: { ...VOID_START },
      },
      path: [],
      destination: null,
      attackTargetId: null,
      pendingInteraction: null,
      evadeMode: false,
      attackCooldownMs: 0,
      repathCooldownMs: 0,
      stepNoiseCooldownMs: 0,
      droneCooldownMs: 0,
      hp: 120,
      stance: 76,
      stanceIdleMs: 0,
      staggeredUntilMs: 0,
      staggerImmuneUntilMs: 0,
      breath: 111,
      breathIdleMs: 0,
      blockingSinceMs: 0,
      blockBrokenUntilMs: 0,
      dodgeInvulnerableUntilMs: 0,
      dodgeReadyAtMs: 0,
      perfectDodgeUntilMs: 0,
      riposteUntilMs: 0,
      chargingSinceMs: 0,
      surgeMs: 0,
      aimMs: 0,
      scoutUntilMs: 0,
      footingMs: 0,
      tempoStacks: 0,
      tempoGainedAtMs: 0,
      heat: 0,
      firingMs: 0,
      deployedSinceMs: 0,
      overheatedUntilMs: 0,
      ventVulnerableUntilMs: 0,
      reverseShadowUntilMs: 0,
      level: 1,
      xp: 0,
      totalXp: 0,
      skillPoints: 1,
      generalPoints: 1,
      attributePoints: 0,
      attributes: {
        body: 2,
        reaction: 3,
        attention: 2,
        technique: 3,
        will: 2,
      },
      skills: {
        power: 0,
        guard: 0,
        agility: 0,
        precision: 0,
        suppression: 0,
        resonance: 0,
      },
      talents: [],
      discoveredTalents: [],
      activeSkillSlots: [null, null, null, null],
      activeSkillCooldowns: {},
      autocastDecisionCooldownMs: 0,
      combatDirective: "adaptive",
      controlMode: "manual",
      autopilotTemper: "aggressive",
      braceUntilMs: 0,
      silentUntilMs: 0,
      overclockUntilMs: 0,
      isolatedTargetId: null,
      isolatedUntilMs: 0,
      secondBeatReady: true,
      inventory: [
        { instanceId: "itm-1", itemId: "respiratorIp7", quantity: 1, condition: 88 },
        { instanceId: "itm-2", itemId: "repairCoatRs12", quantity: 1, condition: 80 },
        { instanceId: "itm-3", itemId: "installerGloves", quantity: 1, condition: 92 },
        { instanceId: "itm-4", itemId: "dielectricBoots", quantity: 1, condition: 86 },
        { instanceId: "itm-5", itemId: "backpackRd54", quantity: 1, condition: 90 },
        { instanceId: "itm-6", itemId: "servicePistol", quantity: 1, condition: 78 },
        { instanceId: "itm-7", itemId: "shockBaton", quantity: 1, condition: 70 },
        { instanceId: "itm-8", itemId: "bandage", quantity: 2, condition: 100 },
        { instanceId: "itm-9", itemId: "filterCartridge", quantity: 1, condition: 100 },
      ],
      equipment: {
        head: "itm-1",
        body: "itm-2",
        hands: "itm-3",
        feet: "itm-4",
        back: "itm-5",
        weapon: "itm-6",
        artifact: null,
      },
      itemCounter: 9,
      contamination: 0,
      stress: 0,
      artifactCooldownMs: 0,
      relievedInjury: null,
      injuryReliefUntilMs: 0,
    },
    worldTimeMs: 0,
    discordZones: [],
    mutated: false,
    sensorFixed: false,
    artifactRecovered: false,
    missionComplete: false,
    voidStabilityMs: VOID_STABILITY_MS,
    injuries: { ...EMPTY_INJURIES },
    rescueCount: 0,
    enemies: createEnemies(),
    npcs: createCityNpcs(),
    npcConversationCooldownMs: 4200,
    noise: null,
    effects: [],
    effectCounter: 0,
    rngSeed: 5560401,
    visited: { floor545: [], floor546: [], floor547: [], floor548: [], floor549: [], floor550: [], floor554: [], floor555: [], floor556: [], floor557: [], voidLab: [] },
    openedContainers: [],
    milestoneLootDrops: [],
    groundLoot: [],
    lootCounter: 0,
    populations: createPopulations(),
    populationCycle: 0,
    samosbor: createSamosborState(5560401),
    log: [
      "Управление переведено в непрерывный режим. Мир не ждёт действий героя.",
      "Квалификация: уровень 1. Доступно по одному очку общего и профессионального контуров.",
      "Директива: проверить датчик СБ-04 и укрыться в герметичном секторе.",
      "Лифт прибыл на этаж 556. Связь с диспетчерской нестабильна.",
    ],
  };
  return reveal(reconcilePopulationEnemies(state, 0));
}

export function migrateGameState(raw: Partial<GameState>): GameState {
  const fresh = createInitialState();
  const rawHero = raw.hero as Partial<Hero> | undefined;
  const populations = fresh.populations.map((population) => {
    const saved = raw.populations?.find((entry) => entry.id === population.id);
    return saved ? { ...population, ...saved } : population;
  });
  const rawSamosbor = raw.samosbor as Partial<SamosborState> | undefined;
  const samosborZones = { ...fresh.samosbor.zones };
  for (const zone of SAMOSBOR_ZONES) {
    const saved = rawSamosbor?.zones?.[zone];
    if (!saved || typeof saved.phase !== "string") continue;
    const profile = samosborProfileFor(zone);
    // Защищённый этаж не наследует событие из старого сохранения.
    samosborZones[zone] = profile.sheltered
      ? samosborZones[zone]
      : { ...samosborZones[zone], ...saved, severity: profile.severity };
  }
  // Дерево v2: старые классовые ветки переименованы в направления, поэтому
  // сохранённые таланты и очки переносятся по таблице соответствия.
  const LEGACY_BRANCHES: Record<string, SkillBranch> = {
    force: "power",
    fire: "precision",
    stealth: "agility",
    bulwark: "guard",
    engineer: "suppression",
    resonance: "resonance",
  };
  const migrateTalentId = (id: string): string => {
    const [scope, rest] = id.split(":");
    const mapped = LEGACY_BRANCHES[scope];
    if (mapped && rest) return `${mapped}:${rest}`;
    if (scope === "hybrid" && rest) {
      const [left, right] = rest.split("-");
      const mappedPair = [LEGACY_BRANCHES[left] ?? left, LEGACY_BRANCHES[right] ?? right].sort();
      return `hybrid:${mappedPair[0]}-${mappedPair[1]}`;
    }
    return id;
  };

  // Сохранение до боевой модели v2 не знает о стойке: его полосы пересчитываются
  // долей, иначе герой с 5 ОЗ из 8 очнётся почти трупом на шкале в 120.
  const legacyBars = rawHero !== undefined && rawHero.stance === undefined;
  // Пустой или дореформенный список противников заменяется свежим: мир без
  // врагов — это испорченное сохранение, а не законная ситуация.
  const legacyEnemies =
    Array.isArray(raw.enemies) &&
    (raw.enemies.length === 0 || raw.enemies.some((enemy) => enemy?.maxStance === undefined));

  const migrated: GameState = {
    ...fresh,
    ...raw,
    hero: {
      ...fresh.hero,
      ...rawHero,
      positions: { ...fresh.hero.positions, ...(rawHero?.positions ?? {}) },
      pendingInteraction: null,
      evadeMode: rawHero?.evadeMode ?? false,
      talents: (rawHero?.talents ?? [])
        .map(migrateTalentId)
        .filter((id) => TALENT_BY_ID[id] !== undefined),
      discoveredTalents: (rawHero?.discoveredTalents ?? [])
        .map(migrateTalentId)
        .filter((id) => TALENT_BY_ID[id] !== undefined),
      skills: { ...fresh.hero.skills },
    },
    enemies: legacyEnemies ? fresh.enemies : (raw.enemies ?? fresh.enemies),
    visited: { ...fresh.visited, ...(raw.visited ?? {}) },
    populations,
    npcs: Array.isArray(raw.npcs) && raw.npcs.length === 34 ? raw.npcs : fresh.npcs,
    // Звучащие участки временны и не переживают загрузку: восстанавливать
    // недожившую до сохранения область бессмысленно.
    discordZones: [],
    npcConversationCooldownMs: raw.npcConversationCooldownMs ?? fresh.npcConversationCooldownMs,
    samosbor: {
      ...fresh.samosbor,
      ...(rawSamosbor ?? {}),
      zones: samosborZones,
    },
  };
  const rescaled: GameState = legacyBars
    ? {
        ...migrated,
        hero: {
          ...migrated.hero,
          hp: migrateHpShare(rawHero?.hp ?? 8, 8, maxHeroHp(migrated)),
          stance: maxHeroStance(migrated),
          breath: maxHeroBreath(migrated),
          stanceIdleMs: 0,
          breathIdleMs: 0,
          staggeredUntilMs: 0,
          staggerImmuneUntilMs: 0,
          blockingSinceMs: 0,
          blockBrokenUntilMs: 0,
          dodgeInvulnerableUntilMs: 0,
          dodgeReadyAtMs: 0,
          perfectDodgeUntilMs: 0,
          riposteUntilMs: 0,
        },
      }
    : {
        ...migrated,
        hero: {
          ...migrated.hero,
          hp: Math.min(migrated.hero.hp, maxHeroHp(migrated)),
          stance: Math.min(migrated.hero.stance, maxHeroStance(migrated)),
          breath: Math.min(migrated.hero.breath, maxHeroBreath(migrated)),
        },
      };
  return reveal(reconcilePopulationEnemies(rescaled, rescaled.populationCycle));
}

function ejectHermeticIntrusions(state: GameState): GameState {
  const maps = new Map<ZoneId, Point[]>();
  const candidatesFor = (zone: ZoneId): Point[] => {
    const cached = maps.get(zone);
    if (cached) return cached;
    const map = mapForZone(zone);
    const candidates: Point[] = [];
    for (let y = 1; y < map.rows.length - 1; y += 1) {
      for (let x = 1; x < map.rows[0].length - 1; x += 1) {
        const point = { x, y };
        if (isEnemyWalkableIn(state, zone, point)) candidates.push(point);
      }
    }
    maps.set(zone, candidates);
    return candidates;
  };

  let changed = false;
  const enemies = state.enemies.map((enemy) => {
    if (enemy.hp <= 0) return enemy;
    const tile = tileAtZone(state, enemy.zone, enemy.position);
    if (tile !== "g" && tile !== "H" && !isCitySafeZone(enemy.zone)) return enemy;
    changed = true;
    if (isCitySafeZone(enemy.zone)) {
      return { ...enemy, hp: 0, mode: "disabled" as const, path: [], castUntilMs: 0 };
    }
    const destination = candidatesFor(enemy.zone)
      .sort((left, right) => distance(left, enemy.position) - distance(right, enemy.position))[0];
    return destination
      ? {
          ...enemy,
          position: copyPoint(destination),
          home: copyPoint(destination),
          path: [],
          mode: "suspicious" as const,
          castUntilMs: 0,
        }
      : { ...enemy, path: [], mode: "retreat" as const, castUntilMs: 0 };
  });
  return changed ? { ...state, enemies } : state;
}

function applySafeAreaRecovery(state: GameState, previousWorldTimeMs: number): GameState {
  const heroPosition = state.hero.positions[state.zone];
  if (!isSamosborProtectedAt(state, state.zone, heroPosition)) return state;
  const intervalMs = isCitySafeZone(state.zone) ? 3000 : 5000;
  const crossedRecoveryTick =
    Math.floor(previousWorldTimeMs / intervalMs) < Math.floor(state.worldTimeMs / intervalMs);
  return {
    ...state,
    hero: {
      ...state.hero,
      hp: crossedRecoveryTick
        ? Math.min(maxHeroHp(state), state.hero.hp + Math.max(1, Math.round(maxHeroHp(state) * 0.04)))
        : state.hero.hp,
      stress: Math.max(0, state.hero.stress - (state.worldTimeMs - previousWorldTimeMs) * 0.003),
      contamination: Math.max(0, state.hero.contamination - (state.worldTimeMs - previousWorldTimeMs) * 0.0002),
      attackTargetId: null,
    },
  };
}

export function tickGame(state: GameState, rawDeltaMs: number): GameState {
  const deltaMs = Math.min(100, Math.max(0, rawDeltaMs));
  let next: GameState = {
    ...state,
    worldTimeMs: state.worldTimeMs + deltaMs,
    noise: state.noise
      ? { ...state.noise, ttlMs: Math.max(0, state.noise.ttlMs - deltaMs) }
      : null,
    effects: state.effects
      .map((effect) => ({ ...effect, ttlMs: effect.ttlMs - deltaMs }))
      .filter((effect) => effect.ttlMs > 0),
    hero: {
      ...state.hero,
      attackCooldownMs: Math.max(0, state.hero.attackCooldownMs - deltaMs),
      repathCooldownMs: Math.max(0, state.hero.repathCooldownMs - deltaMs),
      stepNoiseCooldownMs: Math.max(0, state.hero.stepNoiseCooldownMs - deltaMs),
      droneCooldownMs: Math.max(0, state.hero.droneCooldownMs - deltaMs),
      artifactCooldownMs: Math.max(0, state.hero.artifactCooldownMs - deltaMs),
      autocastDecisionCooldownMs: Math.max(0, state.hero.autocastDecisionCooldownMs - deltaMs),
      activeSkillCooldowns: Object.fromEntries(
        Object.entries(state.hero.activeSkillCooldowns).map(([skillId, cooldown]) => [
          skillId,
          Math.max(0, (cooldown ?? 0) - deltaMs),
        ]),
      ) as Partial<Record<ActiveSkillId, number>>,
      stress: Math.max(0, state.hero.stress - deltaMs * 0.004),
    },
    enemies: state.enemies.map((enemy) => ({
      ...enemy,
      attackCooldownMs: Math.max(0, enemy.attackCooldownMs - deltaMs),
      thinkCooldownMs: Math.max(0, enemy.thinkCooldownMs - deltaMs),
      memoryMs: Math.max(0, enemy.memoryMs - deltaMs),
    })),
  };
  next = ejectHermeticIntrusions(next);
  // Разгон копится движением к любому видимому противнику, а не только к
  // выбранной цели: силач заряжается самим сближением.
  const heroBefore = state.hero.positions[state.zone];
  const locked = enemyById(state, state.hero.attackTargetId);
  // Сближение хотя бы с одним видимым противником: ближайший может оказаться за спиной.
  const surgeCandidates = state.enemies.filter(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      (enemy.id === locked?.id || enemyVisibleToHero(state, enemy)),
  );
  const wasMoving = state.hero.path.length > 0;
  next = tickHeroBars(next, deltaMs);
  next = tickEnemyStance(next, deltaMs);

  if (!next.mutated && next.worldTimeMs >= MUTATION_AT_MS) {
    next = appendLog(
      { ...next, mutated: true },
      "Топология этажа изменилась. Открыт проход в межэтажное пространство.",
    );
  }

  const populationCycle = Math.floor(next.worldTimeMs / POPULATION_STEP_MS);
  if (populationCycle > next.populationCycle) {
    next = evolvePopulations(next, populationCycle);
  }

  next = tickSamosborSchedule(next);
  next = tickDiscordZones(next);

  const heroPosition = next.hero.positions[next.zone];
  const combatDirective = combatDirectiveFor(next);
  if (
    !next.hero.evadeMode &&
    next.hero.attackTargetId &&
    next.hero.repathCooldownMs <= 0 &&
    combatDirective !== "mobileFire"
  ) {
    const target = enemyById(next, next.hero.attackTargetId);
    if (target && target.zone === next.zone) {
      const inRange =
        distance(heroPosition, target.position) <= heroAttackRange(next) &&
        hasLineOfSight(next, heroPosition, target.position);
      if (!inRange) {
        const route = approachPath(next, target, heroAttackRange(next));
        next = {
          ...next,
          hero: {
            ...next.hero,
            path: route?.slice(1) ?? next.hero.path,
            destination: route?.at(-1) ?? next.hero.destination,
            repathCooldownMs: 360,
          },
        };
      }
    }
  }

  if (next.hero.path.length > 0) {
    const motion = advanceAlongPath(
      next.hero.positions[next.zone],
      next.hero.path,
      heroMoveSpeed(next) * (deltaMs / 1000),
    );
    next = {
      ...next,
      hero: {
        ...next.hero,
        positions: { ...next.hero.positions, [next.zone]: motion.position },
        path: motion.path,
        destination: motion.path.length ? next.hero.destination : null,
      },
    };
    if (next.hero.stepNoiseCooldownMs <= 0) {
      next = emitNoise(
        next,
        motion.position,
        Math.max(
          0.6,
          2.4 -
            talentBonus(next, "noiseReduction") -
            equipmentScalar(next, "stealth") -
            (next.hero.silentUntilMs > next.worldTimeMs ? 2 : 0),
        ),
        "шаги",
      );
      next = { ...next, hero: { ...next.hero, stepNoiseCooldownMs: 520 } };
    }
  }

  const movedTowardTarget =
    wasMoving &&
    surgeCandidates.some(
      (enemy) =>
        distance(next.hero.positions[next.zone], enemy.position) <
        distance(heroBefore, enemy.position) - 0.0001,
    );
  next = tickArchetypeResource(next, deltaMs, movedTowardTarget);

  next = resolvePendingInteraction(next);
  next = tickCityNpcs(next, deltaMs);

  const wasProtected = isSamosborProtectedAt(
    state,
    state.zone,
    state.hero.positions[state.zone],
  );
  next = reveal(next);
  next = applySafeAreaRecovery(next, state.worldTimeMs);
  next = tickSamosborExposure(next, deltaMs);
  const nowProtected = isSamosborProtectedAt(
    next,
    next.zone,
    next.hero.positions[next.zone],
  );
  if (!wasProtected && nowProtected && next.zone === state.zone) {
    next = appendLog(
      next,
      isSamosborActiveIn(next, next.zone)
        ? SAMOSBOR_SHELTER_MESSAGE
        : "Гермодверь закрылась за спиной. Контур изолирован: можно перевести дух и восстановиться.",
    );
  }

  // Автозахват цели не отменяет явный приказ игрока. Раньше любое существо,
  // забредшее в поле зрения, обнуляло маршрут и отложенное взаимодействие:
  // игрок нажимал «дойти до лестницы и спуститься», герой бросал приказ на
  // первом же шаге и после боя оставался стоять на месте.
  const holdingOrder = next.hero.pendingInteraction !== null || next.hero.path.length > 0;
  if (!next.hero.evadeMode && !next.hero.attackTargetId && !holdingOrder) {
    const heroNow = next.hero.positions[next.zone];
    const nearest = next.enemies
      .filter(
        (enemy) =>
          enemyVisibleToHero(next, enemy) &&
          ["hunting", "combat"].includes(enemy.mode),
      )
      .sort((a, b) => distance(heroNow, a.position) - distance(heroNow, b.position))[0];
    if (nearest) {
      if (combatDirective === "mobileFire") {
        if (
          weaponFor(next).category === "ranged" &&
          distance(heroNow, nearest.position) <= heroAttackRange(next) &&
          hasLineOfSight(next, heroNow, nearest.position)
        ) {
          next = { ...next, hero: { ...next.hero, attackTargetId: nearest.id } };
        }
      } else {
        next = commandAttack(next, nearest.id);
      }
    }
  }

  next = tickAutocast(next);

  next = {
    ...next,
    enemies: next.enemies.map((enemy) =>
      enemy.zone === next.zone && enemy.hp > 0 && enemy.thinkCooldownMs <= 0
        ? thinkForEnemy(next, enemy)
        : enemy,
    ),
  };
  next = alertGroup(next);

  next = {
    ...next,
    enemies: next.enemies.map((enemy) => {
      if (
        enemy.zone !== next.zone ||
        enemy.hp <= 0 ||
        enemy.path.length === 0 ||
        enemy.stunnedUntilMs > next.worldTimeMs
      ) return enemy;
      const heroNow = next.hero.positions[next.zone];
      if (!isEnemyWalkableIn(next, enemy.zone, enemy.path[0])) {
        return { ...enemy, path: [], mode: enemy.mode === "combat" ? "hunting" : enemy.mode };
      }
      if (["hunting", "combat"].includes(enemy.mode) && distance(enemy.position, heroNow) <= enemy.attackRange) {
        return { ...enemy, path: [] };
      }
      const motion = advanceAlongPath(enemy.position, enemy.path, enemy.speed * (deltaMs / 1000));
      return { ...enemy, position: motion.position, path: motion.path };
    }),
  };

  for (const enemy of next.enemies) {
    if (next.hero.hp <= 0) break;
    next = enemyAttackTick(next, enemy.id);
  }

  next = heroAttackTick(next);
  next = tickDrone(next);

  if (next.zone === "voidLab") {
    const resonanceFactor = Math.max(0.45, 1 - talentBonus(next, "voidStability"));
    const contaminationFactor = Math.max(0.3, 1 - talentBonus(next, "contaminationResist"));
    next = {
      ...next,
      voidStabilityMs: next.voidStabilityMs - deltaMs * resonanceFactor,
      hero: {
        ...next.hero,
        contamination: Math.min(100, next.hero.contamination + deltaMs * 0.0008 * contaminationFactor),
      },
    };
    if (next.voidStabilityMs <= 0) {
      next = applyRescue(next, "Войд-зона потеряла стабильность.", "leg");
    }
  }

  return next;
}

export function objectiveFor(state: GameState): string {
  const samosborPhase = samosborPhaseIn(state, state.zone);
  if (isSamosborLethalPhase(samosborPhase)) {
    return isSamosborProtectedAt(state, state.zone, state.hero.positions[state.zone])
      ? "Переждать активную фазу Самосбора внутри контура"
      : "Немедленно уйти за гермодверь: активная фаза Самосбора";
  }
  if (isSamosborWarningPhase(samosborPhase)) {
    return "Дойти до ближайшей гермодвери до начала активной фазы Самосбора";
  }
  if (state.zone === "voidLab") {
    return state.artifactRecovered
      ? "Вернуться к межэтажному переходу"
      : "Исследовать лабораторию или отступить";
  }
  const regionalObjective = REGION_OBJECTIVES[state.zone as RegionZoneId];
  if (regionalObjective) return regionalObjective;
  if (state.zone === "floor550") return "Пройти нижний выход, сохранить путь к гермокомнате и разведать дальнейшую цепочку";
  if (state.zone === "floor554") return "Познакомиться с жителями Города 550 и найти нижние ворота на этаж 550";
  if (state.zone === "floor555") return "Найти нижний переход и войти в Город 550";
  if (state.zone === "floor557") return "Осмотреть жилой контур или вернуться на этаж 556";
  if (state.missionComplete) return "Спуститься на этаж 555 и продолжить маршрут к Городу 550";
  return state.sensorFixed ? "Укрыться за гермодверью" : "Восстановить датчик СБ-04";
}

export function formattedWorldTime(state: GameState): string {
  const totalSeconds = Math.floor(state.worldTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
