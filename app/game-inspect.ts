// Осмотр: единая модель того, как игра объясняет саму себя.
//
// Правило Gate 4.5: подсказка — не текст, написанный под каждую сущность, а
// **карточка осмотра**, собранная из общих частей. Противник, житель, предмет,
// способность, талант и объект окружения описываются одной структурой и
// рисуются одним компонентом. Новый тип сущности добавляет сборщик карточки, а
// не новую реализацию всплывающей подсказки.
//
// Модуль чистый и сериализуемый: он не знает про React, DOM и состояние мира.
// На входе — плоское описание предмета осмотра, на выходе — карточка. При
// переносе в Unity меняется только отрисовка.

import { COMBAT_STATES, type CombatStateId } from "./game-combat-states.ts";
import { RULE_INFO, type RuleFlag } from "./game-rules.ts";
import { ROLE_LABELS, ROLE_READING, type EnemyRole } from "./game-enemy-roster.ts";
import {
  ACTION_TRANSFORMATIONS,
  BASE_ACTIONS,
  SLOT_LABELS,
  type ActionDefinition,
  type ActionSlot,
} from "./game-actions.ts";

export type InspectKind =
  | "enemy"
  | "npc"
  | "item"
  | "ability"
  | "talent"
  | "interactive";

/**
 * Тон строки. Интерфейс красит по тону, а не по тому, откуда строка пришла:
 * «что даёт» всегда выглядит одинаково, кем бы оно ни выдавалось.
 */
export type LineTone = "neutral" | "gain" | "cost" | "danger" | "change" | "locked";

export type InspectLine = { label?: string; value: string; tone?: LineTone };

export type BarTone = "health" | "stance" | "charges" | "progress" | "danger";

export type InspectBar = {
  id: string;
  label: string;
  value: number;
  max: number;
  tone: BarTone;
};

export type InspectSection = { title?: string; lines: InspectLine[] };

/**
 * Замена: то, ради чего вообще существует этот блок. Если талант, предмет или
 * сборка меняют управление, игрок обязан увидеть это одной строкой:
 * «Shift · перемещение: Ускорение → Пространственный перенос».
 */
export type InspectTransform = { binding: string; from: string; to: string };

export type InspectCard = {
  kind: InspectKind;
  title: string;
  subtitle?: string;
  /** Чем это вызывается: «ЛКМ», «ПКМ», «Shift», «Q», «1». */
  binding?: string;
  /** Почему сейчас нельзя. Пустое — можно. */
  blocked?: string;
  bars: InspectBar[];
  transform?: InspectTransform;
  sections: InspectSection[];
  footer?: string;
};

// --- Сборка ----------------------------------------------------------------

type MaybeLine = InspectLine | null | undefined | false | "";

export function line(value: string, label?: string, tone: LineTone = "neutral"): InspectLine {
  return label ? { label, value, tone } : { value, tone };
}

/** Секция из строк; пустые отбрасываются, пустая секция не создаётся. */
export function section(title: string | undefined, lines: MaybeLine[]): InspectSection | null {
  const kept = lines.filter((candidate): candidate is InspectLine => Boolean(candidate));
  return kept.length ? { title, lines: kept } : null;
}

function compact(sections: (InspectSection | null)[]): InspectSection[] {
  return sections.filter((candidate): candidate is InspectSection => Boolean(candidate));
}

function seconds(ms: number): string {
  return `${Math.max(0, ms / 1000).toFixed(1)} с`;
}

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

// --- Наведённые состояния ---------------------------------------------------

export type ActiveState = {
  id: CombatStateId;
  /** Стеки, если состояние их считает. */
  stacks?: number;
  /** Сколько ещё держится. Ноль — бессрочно, пока держится источник. */
  remainingMs?: number;
};

/**
 * Состояния описываются из общего справочника: интерфейс не хранит собственных
 * формулировок и не может разойтись с боевой моделью.
 */
export function stateLines(states: ActiveState[]): InspectLine[] {
  return states.map((active) => {
    const info = COMBAT_STATES[active.id];
    const stacks = active.stacks && active.stacks > 1 ? ` ×${active.stacks}` : "";
    const left = active.remainingMs ? ` · ещё ${seconds(active.remainingMs)}` : "";
    const consumed = info.consumedBy ? ` Снимает: ${info.consumedBy}.` : "";
    return line(`${info.description}${consumed}`, `${info.name}${stacks}${left}`, "change");
  });
}

// --- Противник --------------------------------------------------------------

export type EnemyRank = "common" | "enhanced" | "veteran" | "elite" | "boss";

const RANK_LABELS: Record<EnemyRank, string> = {
  common: "рядовой",
  enhanced: "усиленный",
  veteran: "ветеран",
  elite: "элита",
  boss: "минибосс",
};

export type EnemySubject = {
  name: string;
  role?: EnemyRole;
  rank: EnemyRank;
  hp: number;
  maxHp: number;
  stance: number;
  maxStance: number;
  armour: number;
  damage: number;
  attackRange: number;
  /** Что противник делает прямо сейчас: патруль, поиск, бой. */
  modeLabel: string;
  origin?: string;
  stateAffinity?: string;
  dangerous: boolean;
  states: ActiveState[];
  /** Идёт замах: игрок должен увидеть это и в карточке, а не только на поле. */
  windUp?: { heavy: boolean; progress: number } | null;
};

export function inspectEnemy(subject: EnemySubject): InspectCard {
  const rankLabel = RANK_LABELS[subject.rank];
  const roleLabel = subject.role ? ROLE_LABELS[subject.role] : "противник";

  return {
    kind: "enemy",
    title: subject.name,
    subtitle: subject.rank === "common" ? roleLabel : `${roleLabel} · ${rankLabel}`,
    blocked: subject.windUp
      ? subject.windUp.heavy
        ? `Замах тяжёлого удара: ${percent(subject.windUp.progress)}`
        : "Готовит удар"
      : undefined,
    bars: [
      { id: "hp", label: "Здоровье", value: subject.hp, max: subject.maxHp, tone: "health" },
      { id: "stance", label: "Стойка", value: subject.stance, max: subject.maxStance, tone: "stance" },
    ],
    sections: compact([
      section(undefined, [
        subject.origin && line(subject.origin),
        subject.role && line(ROLE_READING[subject.role], "Как читается"),
      ]),
      section("Состояния", stateLines(subject.states)),
      section("Бой", [
        line(subject.modeLabel, "Сейчас"),
        line(`${subject.damage} за удар с ${subject.attackRange.toFixed(1)} кл.`, "Урон"),
        line(subject.armour > 0 ? `${subject.armour}` : "нет", "Броня"),
        subject.dangerous
          ? line("Каждый третий удар — телеграфированный тяжёлый: замах видно заранее.", "Опасное действие", "danger")
          : line("Бьёт ровно, без телеграфированного замаха.", "Опасное действие"),
      ]),
      section("Против сборки", [subject.stateAffinity && line(subject.stateAffinity)]),
    ]),
  };
}

// --- Житель -----------------------------------------------------------------

export type NpcSubject = {
  name: string;
  roleLabel: string;
  kindLabel: string;
  description: string;
  /** Что произойдёт по нажатию. Взаимодействие перекрывает атаку. */
  interaction: string;
  /** Чем торгует, если торгует. */
  offers?: string;
};

export function inspectNpc(subject: NpcSubject): InspectCard {
  return {
    kind: "npc",
    title: subject.name,
    subtitle: `${subject.roleLabel} · ${subject.kindLabel}`,
    binding: "ЛКМ",
    bars: [],
    sections: compact([
      section(undefined, [line(subject.description)]),
      section("Взаимодействие", [
        line(subject.interaction, "ЛКМ по жителю"),
        subject.offers && line(subject.offers, "Предлагает"),
      ]),
    ]),
    footer: "Наведение на жителя отменяет атаку: по своим герой не бьёт.",
  };
}

// --- Предмет ----------------------------------------------------------------

export type ItemSubject = {
  name: string;
  kindLabel: string;
  rarityLabel?: string;
  description: string;
  weight?: number;
  quantity?: number;
  condition?: number;
  stats: InspectLine[];
  rules: RuleFlag[];
  /** Быстрая ячейка, если предмет к ней привязан. */
  binding?: string;
  /** Почему сейчас нельзя применить. */
  blocked?: string;
  /**
   * Как изменится сочетание рук, если предмет взять. Пара рук — не сумма
   * характеристик, поэтому предмет обязан объяснять, во что превратится
   * связка, а не только что он добавит к числам.
   */
  handChange?: { from: string; to: string; note: string };
  /** Заряды расходника. */
  charges?: { value: number; max: number };
};

export function inspectItem(subject: ItemSubject): InspectCard {
  const meta: MaybeLine[] = [
    subject.quantity !== undefined && subject.quantity > 1 && line(`${subject.quantity} шт.`, "Количество"),
    subject.condition !== undefined && line(`${Math.round(subject.condition)}%`, "Состояние"),
    subject.weight !== undefined && line(`${subject.weight.toFixed(1)} кг`, "Вес"),
  ];

  return {
    kind: "item",
    title: subject.name,
    subtitle: subject.rarityLabel ? `${subject.kindLabel} · ${subject.rarityLabel}` : subject.kindLabel,
    binding: subject.binding,
    blocked: subject.blocked,
    bars: subject.charges
      ? [{ id: "charges", label: "Заряды", value: subject.charges.value, max: subject.charges.max, tone: "charges" }]
      : [],
    // Замена показывается только когда связка действительно меняется: стрелка
    // «свободная рука → свободная рука» — шум, а не сведения.
    transform: subject.handChange && subject.handChange.from !== subject.handChange.to
      ? { binding: "Сочетание рук", from: subject.handChange.from, to: subject.handChange.to }
      : undefined,
    sections: compact([
      section(undefined, [line(subject.description)]),
      section("Сочетание рук", [subject.handChange && line(subject.handChange.note, undefined, "change")]),
      section("Свойства", subject.stats),
      section("Меняет правила", ruleLines(subject.rules)),
      section(undefined, meta),
    ]),
  };
}

/**
 * Правило описывается тем же способом, кто бы его ни давал — узел или предмет.
 * Цена показывается рядом с выигрышем и никогда не прячется.
 */
export function ruleLines(rules: RuleFlag[]): InspectLine[] {
  return rules.flatMap((flag) => {
    const info = RULE_INFO[flag];
    return [
      line(info.changes, "Меняет", "change"),
      line(info.gains, "Даёт", "gain"),
      line(info.costs, "Отнимает", "cost"),
      line(info.interacts, "Задевает"),
    ];
  });
}

// --- Способность ------------------------------------------------------------

export type AbilitySubject = {
  name: string;
  /** Клавиша или кнопка мыши. */
  binding: string;
  description: string;
  /** Как выбирается цель: курсор, ближайший, область, сам герой. */
  targeting: string;
  cooldownMs?: number;
  cooldownLeftMs?: number;
  breathCost?: number;
  breathPerSecond?: number;
  applies?: CombatStateId[];
  consumes?: CombatStateId[];
  /** Чем заменена базовая версия, если заменена. */
  transform?: InspectTransform;
  /** Почему сейчас нельзя. */
  blocked?: string;
  /** Как исполняется при текущем сочетании рук. */
  handNote?: string;
};

export function inspectAbility(subject: AbilitySubject): InspectCard {
  const cost: MaybeLine[] = [
    subject.breathCost !== undefined && subject.breathCost > 0 && line(`${subject.breathCost} дыхания`, "Расход", "cost"),
    subject.breathPerSecond !== undefined &&
      subject.breathPerSecond > 0 &&
      line(`${subject.breathPerSecond} дыхания в секунду, пока удерживается`, "Расход", "cost"),
    subject.cooldownMs !== undefined && subject.cooldownMs > 0 && line(seconds(subject.cooldownMs), "Откат"),
  ];

  return {
    kind: "ability",
    title: subject.name,
    subtitle: subject.transform ? "изменена сборкой" : undefined,
    binding: subject.binding,
    blocked: subject.blocked,
    bars:
      subject.cooldownLeftMs && subject.cooldownMs
        ? [
            {
              id: "cooldown",
              label: "Восстановление",
              value: subject.cooldownMs - subject.cooldownLeftMs,
              max: subject.cooldownMs,
              tone: "progress",
            },
          ]
        : [],
    transform: subject.transform,
    sections: compact([
      section(undefined, [line(subject.description)]),
      section("Цель", [
        line(subject.targeting),
        subject.handNote && line(subject.handNote, "Руки"),
      ]),
      section("Состояния", [
        ...(subject.applies ?? []).map((id) => line(COMBAT_STATES[id].description, `Наводит ${COMBAT_STATES[id].name}`, "gain")),
        ...(subject.consumes ?? []).map((id) => line(COMBAT_STATES[id].description, `Расходует ${COMBAT_STATES[id].name}`, "change")),
      ]),
      section("Цена", cost),
    ]),
  };
}

/** Карточка слота управления: сама выводит, заменён он или базовый. */
export function inspectActionSlot(
  slot: ActionSlot,
  active: ActionDefinition,
  base: ActionDefinition,
  extra: { cooldownLeftMs?: number; blocked?: string; handNote?: string } = {},
): InspectCard {
  const replaced = active.id !== base.id;
  return inspectAbility({
    name: active.name,
    binding: SLOT_LABELS[slot],
    description: active.description,
    targeting: slot === "movement" ? "направление задаёт курсор или WASD" : "цель под курсором",
    cooldownMs: active.cooldownMs,
    cooldownLeftMs: extra.cooldownLeftMs,
    breathCost: active.breathCost,
    breathPerSecond: active.breathPerSecond,
    transform: replaced ? { binding: SLOT_LABELS[slot], from: base.name, to: active.name } : undefined,
    blocked: extra.blocked,
    handNote: extra.handNote,
  });
}

// --- Талант -----------------------------------------------------------------

export type TalentSubject = {
  name: string;
  kindLabel: string;
  branchLabel: string;
  description: string;
  /** Числовые прибавки — строками, уже переведёнными в человеческий язык. */
  bonuses: InspectLine[];
  rules: RuleFlag[];
  /** Что именно в управлении изменится. Главное в карточке. */
  transform?: InspectTransform;
  cost: number;
  taken: boolean;
  /** Почему пока нельзя взять. */
  blocked?: string;
  flavour?: string;
};

/**
 * Меняет ли талант управление — и если да, что именно встанет под клавишу.
 *
 * Ответ выводится из реестра трансформаций, поэтому дерево не может разойтись
 * с тем, что действительно произойдёт при нажатии.
 */
export function talentTransform(talentId: string): InspectTransform | undefined {
  const action = ACTION_TRANSFORMATIONS.find((candidate) => candidate.talentId === talentId);
  if (!action) return undefined;
  return {
    binding: SLOT_LABELS[action.slot],
    from: BASE_ACTIONS[action.slot].name,
    to: action.name,
  };
}

/**
 * Числовые прибавки человеческим языком. Одна таблица на всю игру: узел,
 * предмет и лист персонажа называют один и тот же параметр одинаково.
 */
const BONUS_LABELS: Record<string, { label: string; unit: "flat" | "share" }> = {
  maxHp: { label: "Здоровье", unit: "flat" },
  armor: { label: "Броня", unit: "flat" },
  moveSpeed: { label: "Скорость", unit: "share" },
  carry: { label: "Переносимый вес", unit: "flat" },
  meleeDamage: { label: "Урон вблизи", unit: "flat" },
  rangedDamage: { label: "Урон на дистанции", unit: "flat" },
  accuracy: { label: "Точность", unit: "flat" },
  attackSpeed: { label: "Темп атак", unit: "share" },
  stealth: { label: "Скрытность", unit: "flat" },
  noiseReduction: { label: "Тише шаг", unit: "share" },
  splash: { label: "Задевает рядом", unit: "share" },
  autoTarget: { label: "Автонаведение", unit: "flat" },
  movingFire: { label: "Стрельба в движении", unit: "flat" },
  dizzy: { label: "Оглушение", unit: "flat" },
  microStun: { label: "Микрооглушение", unit: "share" },
  tauntRadius: { label: "Радиус вызова", unit: "flat" },
  droneDamage: { label: "Урон рембота", unit: "flat" },
  droneSpeed: { label: "Скорость рембота", unit: "share" },
  voidStability: { label: "Устойчивость в войде", unit: "flat" },
  contaminationResist: { label: "Стойкость к заражению", unit: "share" },
  block: { label: "Шанс блока", unit: "share" },
  blockPower: { label: "Сила блока", unit: "share" },
  parry: { label: "Парирование", unit: "share" },
  evasion: { label: "Уклонение", unit: "share" },
  markPower: { label: "Сила метки", unit: "share" },
  critical: { label: "Критический удар", unit: "share" },
  healing: { label: "Лечение", unit: "share" },
  stressResist: { label: "Стойкость к стрессу", unit: "share" },
  resistKinetic: { label: "Сопр. кинетике", unit: "share" },
  resistThermal: { label: "Сопр. температуре", unit: "share" },
  resistChemical: { label: "Сопр. химии", unit: "share" },
  resistAnomalous: { label: "Сопр. аномальному", unit: "share" },
  staggerResist: { label: "Стойкость к слому", unit: "share" },
  chargeRate: { label: "Скорость заряда", unit: "share" },
  chargeSteps: { label: "Ступени заряда", unit: "flat" },
  chargePower: { label: "Сила заряда", unit: "share" },
};

export function bonusLines(bonuses: Record<string, number | undefined>): InspectLine[] {
  return Object.entries(bonuses)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] !== 0)
    .map(([key, amount]) => {
      const info = BONUS_LABELS[key];
      const sign = amount > 0 ? "+" : "−";
      const magnitude = Math.abs(amount);
      const value = info?.unit === "share" ? `${sign}${percent(magnitude)}` : `${sign}${magnitude}`;
      return line(value, info?.label ?? key, amount > 0 ? "gain" : "cost");
    });
}

export function inspectTalent(subject: TalentSubject): InspectCard {
  const keystone = subject.rules.length > 0;
  return {
    kind: "talent",
    title: subject.name,
    subtitle: `${subject.branchLabel} · ${subject.kindLabel}${keystone ? " · меняет правило" : ""}`,
    blocked: subject.blocked,
    bars: [],
    transform: subject.transform,
    sections: compact([
      // Замена управления идёт выше всего остального: игрок должен понять, что
      // изменится под рукой, до того как читать проценты.
      section("Меняет управление", [
        subject.transform &&
          line(
            `${subject.transform.binding}: ${subject.transform.from} → ${subject.transform.to}`,
            undefined,
            "change",
          ),
      ]),
      section(undefined, [line(subject.description)]),
      section("Меняет правила", ruleLines(subject.rules)),
      section("Даёт", subject.bonuses),
      section(undefined, [
        line(subject.taken ? "освоен" : `${subject.cost} очк.`, "Стоимость", subject.taken ? "gain" : "neutral"),
        subject.flavour && line(subject.flavour),
      ]),
    ]),
  };
}

// --- Объект окружения --------------------------------------------------------

export type InteractiveSubject = {
  name: string;
  description: string;
  /** Что произойдёт по нажатию. */
  interaction?: string;
  coordinates?: { x: number; y: number };
};

export function inspectInteractive(subject: InteractiveSubject): InspectCard {
  return {
    kind: "interactive",
    title: subject.name,
    binding: subject.interaction ? "ЛКМ" : undefined,
    bars: [],
    sections: compact([
      section(undefined, [line(subject.description)]),
      section(undefined, [
        subject.interaction && line(subject.interaction, "ЛКМ по объекту"),
        subject.coordinates && line(`${subject.coordinates.x}:${subject.coordinates.y}`, "Координаты"),
      ]),
    ]),
  };
}
