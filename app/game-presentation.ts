// Модели представления: то, что интерфейс имеет право знать об игре.
//
// Правило Gate 4.5: между игрой и экраном стоит слой моделей.
//
//   ИГРОВОЕ СОСТОЯНИЕ → МОДЕЛЬ ПРЕДСТАВЛЕНИЯ → ИНТЕРФЕЙС
//
// Боевые системы ничего не знают ни про DOM, ни про React: они отдают числа и
// смыслы. Интерфейс не лезет в состояние мира за подробностями и не считает
// игровых правил сам. При переносе в Unity меняется только последний шаг —
// модели остаются теми же.
//
// Второе правило этого слоя: **на боевой экран попадает только то, что нужно
// для решения прямо сейчас.** Броня, блок, парирование, уклонение и
// сопротивления — сведения листа персонажа, а не HUD.

import {
  ACTIVE_SKILLS,
  ARCHETYPES,
  type ActiveSkillId,
  type ActionSlot,
  CHARGE_MAX_STEPS,
  type GameState,
  HEAT_OVERHEAT,
  type ItemId,
  ITEMS,
  KEYSTONES,
  QUICK_SLOTS,
  QUICK_SLOT_COOLDOWN_MS,
  type QuickSlotId,
  SKILL_NAMES,
  type SkillBranch,
  TALENT_NODES,
  type TalentNode,
  THREAT_LABELS,
  WEAPONS,
  type WeaponId,
  archetypeFor,
  archetypeResourceSteps,
  canAllocateTalent,
  carryCapacity,
  combineHands,
  describeCombination,
  effectiveAttribute,
  handChangeFor,
  heroAction,
  heroActionTransformed,
  heroAttackCooldown,
  heroAttackDamage,
  heroAttackRange,
  heroChargeSteps,
  heroDefenceProfile,
  heroHandCombination,
  heroMoveSpeed,
  inventoryEntryById,
  inventoryWeight,
  maxHeroBreath,
  maxHeroHp,
  maxHeroStance,
  objectiveFor,
  quickSlotCharges,
  quickSlotEntry,
  ruleReadout,
  talentBonus,
  talentTransform,
  unlockedActiveSkills,
  xpToNextLevel,
} from "./game-engine.ts";

// --- Общие части -------------------------------------------------------------

export type MeterTone = "health" | "stance" | "breath" | "experience" | "resource";

export type MeterModel = {
  id: string;
  label: string;
  value: number;
  max: number;
  share: number;
  tone: MeterTone;
  /** Короткая приписка справа: состояние, а не расшифровка формулы. */
  note?: string;
  /** Полоса меняется прямо сейчас: интерфейс может это подсветить. */
  active?: boolean;
};

function meter(
  id: string,
  label: string,
  value: number,
  max: number,
  tone: MeterTone,
  extra: { note?: string; active?: boolean } = {},
): MeterModel {
  const safeMax = Math.max(1, max);
  return {
    id,
    label,
    value: Math.round(value),
    max: Math.round(safeMax),
    share: Math.max(0, Math.min(1, value / safeMax)),
    tone,
    ...extra,
  };
}

// --- Слоты управления ---------------------------------------------------------

export type SlotModel = {
  slot: ActionSlot;
  /** Что нажимать. Читается мгновенно и не требует легенды. */
  binding: string;
  name: string;
  /** Одна строка под названием: что это стоит или чем ограничено. */
  detail: string;
  /** Слот заменён талантом — у него другая личность, и это должно быть видно. */
  transformed: boolean;
  /** Доля незавершённого восстановления, 0…1. */
  cooldownShare: number;
  /** Заполнение заряда для удерживаемых слотов, 0…1. */
  chargeShare: number;
  disabled: boolean;
};

const SLOT_BINDINGS: Record<ActionSlot, string> = {
  primary: "ЛКМ",
  strong: "ПКМ",
  movement: "SHIFT",
};

function slotModel(state: GameState, slot: ActionSlot): SlotModel {
  const action = heroAction(state, slot);
  const staggered = state.hero.staggeredUntilMs > state.worldTimeMs;
  const weapon = WEAPONS[state.hero.equipment.weapon ? weaponIdFor(state) : "servicePistol"];
  const chargeSteps = heroChargeSteps(state);

  if (slot === "primary") {
    const cooldown = heroAttackCooldown(state);
    return {
      slot,
      binding: SLOT_BINDINGS[slot],
      name: action.name,
      detail: `${weapon.shortName} · ${heroAttackDamage(state)} урон`,
      transformed: heroActionTransformed(state, slot),
      cooldownShare: cooldown > 0 ? Math.min(1, state.hero.attackCooldownMs / cooldown) : 0,
      chargeShare: 0,
      disabled: staggered,
    };
  }

  if (slot === "strong") {
    return {
      slot,
      binding: SLOT_BINDINGS[slot],
      name: action.name,
      detail: chargeSteps > 0
        ? `заряд ${chargeSteps} / ${CHARGE_MAX_STEPS}`
        : `удержать для заряда · ${action.breathCost ?? 0} дых.`,
      transformed: heroActionTransformed(state, slot),
      cooldownShare: 0,
      chargeShare: chargeSteps / CHARGE_MAX_STEPS,
      disabled: staggered,
    };
  }

  const recovering = Math.max(0, state.hero.dodgeReadyAtMs - state.worldTimeMs);
  const cooldownMs = action.cooldownMs ?? 0;
  return {
    slot,
    binding: SLOT_BINDINGS[slot],
    name: action.name,
    detail: action.sustained
      ? `${action.breathPerSecond ?? 0} дых./с, пока удержан`
      : `откат ${(cooldownMs / 1000).toFixed(1)} с`,
    transformed: heroActionTransformed(state, slot),
    cooldownShare: cooldownMs > 0 ? Math.min(1, recovering / cooldownMs) : 0,
    chargeShare: 0,
    disabled: staggered || (action.sustained && state.hero.breath <= 4),
  };
}

function weaponIdFor(state: GameState): WeaponId {
  const entry = inventoryEntryById(state, state.hero.equipment.weapon ?? null);
  return (entry?.itemId ?? "servicePistol") as WeaponId;
}

// --- Ячейки способностей -------------------------------------------------------

export type AbilitySlotModel = {
  index: number;
  binding: string;
  skillId: ActiveSkillId | null;
  name: string;
  /** Направление, из которого пришла способность: цвет и принадлежность. */
  branch: string | null;
  detail: string;
  cooldownShare: number;
  ready: boolean;
  empty: boolean;
};

function abilitySlotModel(state: GameState, index: number): AbilitySlotModel {
  const skillId = (state.hero.activeSkillSlots[index] ?? null) as ActiveSkillId | null;
  const binding = `${index + 1}`;
  if (!skillId) {
    return {
      index, binding, skillId: null,
      name: "—", branch: null, detail: "пусто",
      cooldownShare: 0, ready: false, empty: true,
    };
  }
  const skill = ACTIVE_SKILLS[skillId];
  const cooldown = state.hero.activeSkillCooldowns[skillId] ?? 0;
  const known = unlockedActiveSkills(state).includes(skillId);
  return {
    index, binding, skillId,
    name: skill.shortName,
    branch: SKILL_NAMES[skill.branch],
    detail: !known
      ? "нет допуска"
      : cooldown > 0
        ? `${(cooldown / 1000).toFixed(1)} с`
        : SKILL_NAMES[skill.branch],
    cooldownShare: skill.cooldownMs > 0 ? Math.min(1, cooldown / skill.cooldownMs) : 0,
    ready: known && cooldown <= 0 && state.hero.staggeredUntilMs <= state.worldTimeMs,
    empty: false,
  };
}

// --- Быстрые ячейки ------------------------------------------------------------

export type QuickSlotModel = {
  id: QuickSlotId;
  binding: string;
  name: string;
  /** Что лежит в ячейке сейчас. Пусто — ячейка не назначена «пустотой». */
  itemName: string | null;
  charges: number;
  cooldownShare: number;
  ready: boolean;
};

function quickSlotModel(state: GameState, id: QuickSlotId): QuickSlotModel {
  const definition = QUICK_SLOTS[id];
  const entry = quickSlotEntry(state, id);
  const charges = quickSlotCharges(state, id);
  const cooldown = state.hero.quickSlotCooldownMs ?? 0;
  return {
    id,
    binding: id.toUpperCase(),
    name: definition.name,
    itemName: entry ? ITEMS[entry.itemId].shortName : null,
    charges,
    cooldownShare: Math.min(1, cooldown / QUICK_SLOT_COOLDOWN_MS),
    ready: charges > 0 && cooldown <= 0,
  };
}

// --- Ресурс направления ---------------------------------------------------------

export type ResourceModel = {
  name: string;
  value: number;
  max: number;
  share: number;
  /** Ресурс показывается, только когда сборка им действительно пользуется. */
  visible: boolean;
  warning: boolean;
};

function resourceModel(state: GameState): ResourceModel {
  const archetype = archetypeFor(state);
  const definition = ARCHETYPES[archetype];
  const overheated = state.hero.heat >= HEAT_OVERHEAT;
  const steps = archetypeResourceSteps(state);
  const heat = archetype === "heavy_gunner";
  const value = heat ? Math.round(state.hero.heat) : steps;
  const max = heat ? HEAT_OVERHEAT : Math.max(1, definition.maxResource);
  // Без единого вложенного очка направление не выбрано, и приборная панель
  // ресурса на экране только мешает.
  const invested = state.hero.talents.length > 0;
  return {
    name: definition.resourceName,
    value,
    max,
    share: Math.max(0, Math.min(1, value / max)),
    visible: invested,
    warning: heat && overheated,
  };
}

// --- Боевой экран ----------------------------------------------------------------

export type HudModel = {
  health: MeterModel;
  stance: MeterModel;
  /** Дыхание показывается, только когда им платят: базовый Shift, тяжёлые атаки. */
  breath: MeterModel & { relevant: boolean };
  experience: MeterModel;
  level: number;
  slots: SlotModel[];
  abilities: AbilitySlotModel[];
  quick: QuickSlotModel[];
  resource: ResourceModel;
  objective: { title: string; detail: string | null };
  /** Изменённые сборкой правила: короткие строки, подробности — в листе. */
  rules: { name: string; line: string }[];
  threats: number;
  /** Последние события. Полный журнал живёт в развёрнутом виде. */
  log: string[];
  staggered: boolean;
};

export function hudModel(state: GameState): HudModel {
  const maxHp = maxHeroHp(state);
  const maxStance = maxHeroStance(state);
  const maxBreath = maxHeroBreath(state);
  const required = xpToNextLevel(state);
  const movement = heroAction(state, "movement");
  const stanceShare = state.hero.stance / Math.max(1, maxStance);

  return {
    health: meter("hp", "Здоровье", state.hero.hp, maxHp, "health"),
    stance: meter("stance", "Стойка", state.hero.stance, maxStance, "stance", {
      note: state.hero.staggeredUntilMs > state.worldTimeMs
        ? "ошеломление"
        : stanceShare < 0.35 ? "пошатнулся" : undefined,
    }),
    breath: {
      ...meter("breath", "Дыхание", state.hero.breath, maxBreath, "breath", {
        active: state.hero.movementHeld && movement.sustained,
      }),
      // Индикатор следует за действием, а не за клавишей: если талант заменил
      // Shift на перенос, дыхание за бег больше не платится и полоса уходит.
      relevant: movement.sustained || (heroAction(state, "strong").breathCost ?? 0) > 0,
    },
    experience: meter("xp", "Опыт", state.hero.xp, Math.max(1, required), "experience"),
    level: state.hero.level,
    slots: (["primary", "strong", "movement"] as ActionSlot[]).map((slot) => slotModel(state, slot)),
    abilities: [0, 1, 2].map((index) => abilitySlotModel(state, index)),
    quick: (["q", "e"] as QuickSlotId[]).map((id) => quickSlotModel(state, id)),
    resource: resourceModel(state),
    objective: { title: objectiveFor(state), detail: null },
    rules: ruleReadout(state),
    threats: state.enemies.filter(
      (enemy) => enemy.zone === state.zone && enemy.hp > 0 && enemy.mode !== "patrol" && enemy.mode !== "disabled",
    ).length,
    log: state.log.slice(0, 5),
    staggered: state.hero.staggeredUntilMs > state.worldTimeMs,
  };
}

// --- Лист персонажа ----------------------------------------------------------------

export type StatLine = {
  label: string;
  value: string;
  /** Почему это число такое. Подробность второго плана, не основная строка. */
  note?: string;
};

export type StatGroup = { id: string; title: string; lines: StatLine[] };

const percent = (share: number) => `${Math.round(share * 100)}%`;

/**
 * Лист персонажа: сначала осмысленное производное, потом подробности.
 * Не таблица всех полей состояния — четыре группы, по которым игрок принимает
 * решения о сборке.
 */
export function characterGroups(state: GameState): StatGroup[] {
  const defence = heroDefenceProfile(state);
  const hands = heroHandCombination(state);
  const weapon = WEAPONS[weaponIdFor(state)];

  const resistances = (Object.entries(defence.resistances) as [keyof typeof defence.resistances, number][])
    .filter(([, share]) => share > 0)
    .map(([threat, share]) => ({ label: THREAT_LABELS[threat], value: percent(share) }));

  return [
    {
      id: "offence",
      title: "Нападение",
      lines: [
        { label: "Урон", value: `${heroAttackDamage(state)}`, note: weapon.shortName },
        { label: "Дистанция", value: `${heroAttackRange(state).toFixed(1)} кл.` },
        { label: "Темп атак", value: `${(1000 / Math.max(1, heroAttackCooldown(state))).toFixed(2)} / с` },
        { label: "По стойке", value: `${Math.round(weapon.stanceDamage * hands.stance)}` },
        { label: "Пробитие", value: `${weapon.penetration + hands.penetration}` },
        { label: "Крит. удар", value: percent(talentBonus(state, "critical")) },
      ],
    },
    {
      id: "defence",
      title: "Защита",
      lines: [
        { label: "Броня", value: `${defence.armour}`, note: "гасит долю каждого удара" },
        { label: "Блок", value: percent(defence.blockChance), note: `снимает ${percent(defence.blockEffectiveness)}` },
        { label: "Парирование", value: percent(defence.parryChance), note: "отменяет удар целиком" },
        { label: "Уклонение", value: percent(defence.evasion), note: "разброс, а не надёжность" },
        { label: "Устойчивость", value: percent(defence.posture), note: "насколько слабее ломают стойку" },
        ...resistances,
      ],
    },
    {
      id: "movement",
      title: "Движение",
      lines: [
        { label: "Скорость", value: `${heroMoveSpeed(state).toFixed(2)} кл./с` },
        { label: "Подвижность рук", value: percent(hands.mobility), note: hands.name },
        { label: "Груз", value: `${inventoryWeight(state).toFixed(1)} / ${carryCapacity(state).toFixed(0)} кг` },
        { label: "Дыхание", value: `${Math.round(state.hero.breath)} / ${maxHeroBreath(state)}` },
      ],
    },
    {
      id: "build",
      title: "Сборка",
      lines: [
        { label: "Руки", value: hands.name, note: hands.verb },
        { label: "Сильная сторона", value: hands.strength },
        { label: "Слабое место", value: hands.weakness },
        ...(hands.stateLoop ? [{ label: "Цикл состояний", value: "замкнут в паре" }] : []),
        ...ruleReadout(state).map((rule) => ({ label: "Правило", value: rule.name, note: rule.line })),
      ],
    },
  ];
}

/** Атрибуты отдельно: они меняются очками, а не выводятся из снаряжения. */
export function attributeLines(state: GameState): StatLine[] {
  return (["body", "reaction", "attention", "technique", "will"] as const).map((id) => ({
    label: { body: "Тело", reaction: "Реакция", attention: "Внимание", technique: "Техника", will: "Воля" }[id],
    value: `${effectiveAttribute(state, id)}`,
  }));
}

// --- Сравнение предметов ------------------------------------------------------------

export type ComparisonRow = {
  label: string;
  current: string;
  candidate: string;
  /** +1 кандидат лучше, −1 хуже, 0 без разницы. */
  direction: -1 | 0 | 1;
};

export type ComparisonModel = {
  currentName: string | null;
  candidateName: string;
  rows: ComparisonRow[];
  /**
   * Главное, чего не видно в числах: во что превращается связка рук. Смена
   * второй руки может ухудшить все цифры и при этом сменить способ игры.
   */
  combination: { from: string; to: string; note: string } | null;
};

const numberRow = (label: string, current: number, candidate: number, better: "up" | "down" = "up"): ComparisonRow => {
  const delta = candidate - current;
  const sign = Math.abs(delta) < 0.005 ? 0 : delta > 0 ? 1 : -1;
  const direction = (sign === 0 ? 0 : better === "up" ? sign : -sign) as -1 | 0 | 1;
  return {
    label,
    current: Number.isInteger(current) ? `${current}` : current.toFixed(2),
    candidate: Number.isInteger(candidate) ? `${candidate}` : candidate.toFixed(2),
    direction,
  };
};

/**
 * Сравнение «что надето» против «что рассматривается». Сравниваются не только
 * числа: если предмет занимает руку, сообщается смена сочетания.
 */
export function compareItem(state: GameState, itemId: ItemId): ComparisonModel | null {
  const candidate = ITEMS[itemId];
  if (!candidate.slot) return null;
  const currentEntry = inventoryEntryById(state, state.hero.equipment[candidate.slot] ?? null);
  const current = currentEntry ? ITEMS[currentEntry.itemId] : null;

  const rows: ComparisonRow[] = [];
  const currentWeapon = current?.kind === "weapon" ? WEAPONS[currentEntry!.itemId as WeaponId] : null;
  const candidateWeapon = candidate.kind === "weapon" ? WEAPONS[itemId as WeaponId] : null;

  if (candidateWeapon || currentWeapon) {
    rows.push(numberRow("Урон", currentWeapon?.damage ?? 0, candidateWeapon?.damage ?? 0));
    rows.push(numberRow("Дистанция", currentWeapon?.range ?? 0, candidateWeapon?.range ?? 0));
    rows.push(numberRow("По стойке", currentWeapon?.stanceDamage ?? 0, candidateWeapon?.stanceDamage ?? 0));
    rows.push(numberRow("Пробитие", currentWeapon?.penetration ?? 0, candidateWeapon?.penetration ?? 0));
  }
  const statKeys = ["armor", "maxHp", "moveSpeed", "carry", "stealth"] as const;
  const statLabels: Record<(typeof statKeys)[number], string> = {
    armor: "Броня", maxHp: "Здоровье", moveSpeed: "Скорость", carry: "Груз", stealth: "Скрытность",
  };
  for (const key of statKeys) {
    const from = current?.stats?.[key] ?? 0;
    const to = candidate.stats?.[key] ?? 0;
    if (from === 0 && to === 0) continue;
    rows.push(numberRow(statLabels[key], from, to));
  }
  rows.push(numberRow("Вес", current?.weight ?? 0, candidate.weight, "down"));

  return {
    currentName: current?.name ?? null,
    candidateName: candidate.name,
    rows,
    combination: handChangeFor(state, itemId),
  };
}

/** Что сейчас в руках — для листа персонажа и для экрана снаряжения. */
export function handsModel(state: GameState): {
  primary: { name: string; detail: string } | null;
  secondary: { name: string; detail: string } | null;
  twoHanded: boolean;
  combination: { name: string; verb: string; summary: string };
} {
  const weaponEntry = inventoryEntryById(state, state.hero.equipment.weapon ?? null);
  const offhandEntry = inventoryEntryById(state, state.hero.equipment.offhand ?? null);
  const hands = heroHandCombination(state);
  const weapon = WEAPONS[weaponIdFor(state)];
  return {
    primary: weaponEntry
      ? { name: ITEMS[weaponEntry.itemId].name, detail: `${weapon.damage} урон · ${weapon.range.toFixed(1)} кл.` }
      : null,
    secondary: offhandEntry
      ? { name: ITEMS[offhandEntry.itemId].name, detail: ITEMS[offhandEntry.itemId].shortName }
      : null,
    twoHanded: hands.id === "two_handed",
    combination: { name: hands.name, verb: hands.verb, summary: describeCombination(hands) },
  };
}

/** Пустые руки — тоже сочетание: интерфейс не должен выдумывать «ничего». */
export function emptyHandCombinationName(): string {
  return combineHands(null, null).name;
}

// --- Дерево талантов ------------------------------------------------------------
//
// Одно дерево, а не шесть классов. Ядро в центре, шесть направлений расходятся
// лучами, а между соседними лучами стоят гибридные узлы, физически связанные
// с обоими направлениями. Игрок должен видеть переходы, а не выбор ветки.
//
// Раскладка — чистая функция от данных дерева: те же координаты можно
// построить в Unity, не переписывая правила.

export type TreeNodeView = {
  id: string;
  name: string;
  scope: string;
  kind: string;
  branch: SkillBranch | null;
  tier: number;
  x: number;
  y: number;
  taken: boolean;
  available: boolean;
  discovered: boolean;
  /** Узел меняет правило механики. */
  keystone: boolean;
  /** Узел заменяет действие под клавишей. */
  transforms: boolean;
};

export type TreeLinkView = {
  id: string;
  x1: number; y1: number; x2: number; y2: number;
  /** Связь пройдена: оба конца освоены. */
  active: boolean;
  /** Связь между направлениями — то, из-за чего это одно дерево. */
  cross: boolean;
};

export type TreeView = { size: number; nodes: TreeNodeView[]; links: TreeLinkView[] };

/** Углы направлений: Разгон сверху, дальше по часовой стрелке. */
export const DIRECTION_ANGLES: Record<SkillBranch, number> = {
  power: -90,
  agility: -30,
  suppression: 30,
  resonance: 90,
  precision: 150,
  guard: 210,
};

const TREE_SIZE = 1000;
const TREE_CENTRE = TREE_SIZE / 2;
const CORE_RADIUS = 78;
const TIER_RADII = [172, 252, 332, 420];
const LEGENDARY_RADIUS = 468;

const polar = (angleDeg: number, radius: number) => ({
  x: TREE_CENTRE + Math.cos((angleDeg * Math.PI) / 180) * radius,
  y: TREE_CENTRE + Math.sin((angleDeg * Math.PI) / 180) * radius,
});

/** Кратчайшая угловая середина между двумя направлениями. */
function midAngle(a: number, b: number): number {
  const delta = ((b - a + 540) % 360) - 180;
  return a + delta / 2;
}

export function talentTreeView(state: GameState): TreeView {
  const positions = new Map<string, { x: number; y: number }>();
  const nodes: TreeNodeView[] = [];
  const links: TreeLinkView[] = [];

  const push = (node: TalentNode, point: { x: number; y: number }, branch: SkillBranch | null) => {
    positions.set(node.id, point);
    const keystone = KEYSTONES.some((candidate) => candidate.id === node.id);
    nodes.push({
      id: node.id,
      name: node.name,
      scope: node.scope,
      kind: node.kind,
      branch,
      tier: node.tier,
      x: point.x,
      y: point.y,
      taken: state.hero.talents.includes(node.id),
      available: canAllocateTalent(state, node.id),
      discovered: node.scope !== "legendary" || state.hero.discoveredTalents.includes(node.id),
      keystone,
      transforms: Boolean(talentTransform(node.id)),
    });
  };

  // Ядро: общий центр, из которого растут все направления.
  const core = TALENT_NODES.filter((node) => node.scope === "core");
  core.forEach((node, index) => {
    const angle = (360 / Math.max(1, core.length)) * index - 90;
    push(node, polar(angle, CORE_RADIUS), null);
  });

  // Направления: лучи из ядра. Внутри яруса узлы разведены по дуге.
  const branches = Object.keys(DIRECTION_ANGLES) as SkillBranch[];
  for (const branch of branches) {
    const angle = DIRECTION_ANGLES[branch];
    const tiers = new Map<number, TalentNode[]>();
    for (const node of TALENT_NODES.filter((candidate) => candidate.scope === branch)) {
      tiers.set(node.tier, [...(tiers.get(node.tier) ?? []), node]);
    }
    for (const [tier, tierNodes] of [...tiers.entries()].sort((a, b) => a[0] - b[0])) {
      const radius = TIER_RADII[Math.min(TIER_RADII.length - 1, tier - 1)];
      // Чем дальше от центра, тем уже разлёт: луч не расползается в веер.
      const spread = tierNodes.length > 1 ? 26 - tier * 3 : 0;
      tierNodes.forEach((node, index) => {
        const offset = tierNodes.length > 1
          ? -spread + (spread * 2 * index) / (tierNodes.length - 1)
          : 0;
        push(node, polar(angle + offset, radius), branch);
      });
    }
  }

  // Легендарные: внешнее кольцо, доступное любой сборке. Углы выбраны между
  // лучами — иначе узел встаёт ровно на подпись направления.
  const legendary = TALENT_NODES.filter((node) => node.scope === "legendary");
  const legendaryAngles = [-60, 0, 120, 180];
  legendary.forEach((node, index) => {
    push(node, polar(legendaryAngles[index % legendaryAngles.length], LEGENDARY_RADIUS), null);
  });

  // Гибриды: между двумя направлениями, а не внутри одного.
  const hybrids = TALENT_NODES.filter((node) => node.scope === "hybrid" && node.pair);
  for (const node of hybrids) {
    const [left, right] = node.pair as [SkillBranch, SkillBranch];
    const angle = midAngle(DIRECTION_ANGLES[left], DIRECTION_ANGLES[right]);
    const separation = Math.abs(((DIRECTION_ANGLES[right] - DIRECTION_ANGLES[left] + 540) % 360) - 180);
    // Соседние направления сходятся близко к центру, дальние — по внешнему
    // кольцу: связь между противоположными концами дерева существует, но
    // стоит дороже по расстоянию.
    const radius = separation <= 61 ? 214 : separation <= 121 ? 300 : 372;
    push(node, polar(angle, radius), null);
  }

  // --- Связи --------------------------------------------------------------
  const taken = (id: string) => state.hero.talents.includes(id);
  const link = (fromId: string, toId: string, cross = false) => {
    const from = positions.get(fromId);
    const to = positions.get(toId);
    if (!from || !to) return;
    links.push({
      id: `${fromId}->${toId}`,
      x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      active: taken(fromId) && taken(toId),
      cross,
    });
  };

  for (const branch of branches) {
    const tierNodes = (tier: number) =>
      TALENT_NODES.filter((node) => node.scope === branch && node.tier === tier);
    const first = tierNodes(1);
    // Первый ярус подвешен к ближайшему узлу ядра: направления растут из
    // общего основания, а не начинаются каждое само по себе.
    for (const node of first) {
      const anchor = core.reduce((best, candidate) => {
        const point = positions.get(candidate.id)!;
        const target = positions.get(node.id)!;
        const distance = Math.hypot(point.x - target.x, point.y - target.y);
        return distance < best.distance ? { id: candidate.id, distance } : best;
      }, { id: core[0]?.id ?? "", distance: Number.POSITIVE_INFINITY });
      if (anchor.id) link(anchor.id, node.id);
    }
    for (let tier = 2; tier <= 4; tier += 1) {
      const previous = tierNodes(tier - 1);
      for (const node of tierNodes(tier)) {
        const target = positions.get(node.id)!;
        const nearest = previous.reduce((best, candidate) => {
          const point = positions.get(candidate.id)!;
          const distance = Math.hypot(point.x - target.x, point.y - target.y);
          return distance < best.distance ? { id: candidate.id, distance } : best;
        }, { id: previous[0]?.id ?? "", distance: Number.POSITIVE_INFINITY });
        if (nearest.id) link(nearest.id, node.id);
      }
    }
  }

  // Перемычки: каждый гибрид физически соединён с обоими направлениями.
  for (const node of hybrids) {
    const [left, right] = node.pair as [SkillBranch, SkillBranch];
    for (const branch of [left, right]) {
      const candidates = TALENT_NODES.filter((candidate) => candidate.scope === branch && candidate.tier === 2);
      const target = positions.get(node.id)!;
      const nearest = candidates.reduce((best, candidate) => {
        const point = positions.get(candidate.id)!;
        const distance = Math.hypot(point.x - target.x, point.y - target.y);
        return distance < best.distance ? { id: candidate.id, distance } : best;
      }, { id: candidates[0]?.id ?? "", distance: Number.POSITIVE_INFINITY });
      if (nearest.id) link(nearest.id, node.id, true);
    }
  }

  return { size: TREE_SIZE, nodes, links };
}

/** Освоенные способности с их источником: «дерево открыло — панель использует». */
export function availableAbilities(state: GameState): {
  id: ActiveSkillId;
  name: string;
  branch: string;
  role: string;
  cooldownMs: number;
  equippedSlot: number | null;
}[] {
  return unlockedActiveSkills(state).map((id) => {
    const skill = ACTIVE_SKILLS[id];
    const slot = state.hero.activeSkillSlots.findIndex((candidate) => candidate === id);
    return {
      id,
      name: skill.name,
      branch: SKILL_NAMES[skill.branch],
      role: skill.role,
      cooldownMs: skill.cooldownMs,
      equippedSlot: slot >= 0 && slot < 3 ? slot : null,
    };
  });
}
