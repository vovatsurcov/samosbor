"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACTIVE_SKILLS,
  activateEquippedArtifact,
  allocateTalent,
  branchTalentPoints,
  canAllocateTalent,
  cancelHeroAction,
  carryCapacity,
  commandAttack,
  commandAttackNearest,
  commandCollectLoot,
  commandInteractAt,
  commandMove,
  commandTalkToNpc,
  consumeInventoryItem,
  createInitialState,
  distance,
  Enemy,
  EnemyMode,
  enemyById,
  enemyVisibleToHero,
  equippedEntry,
  equipItem,
  formattedWorldTime,
  GameState,
  GearSlot,
  gridPoint,
  hasLineOfSight,
  heroAttackRange,
  interact,
  commandFastTravel,
  interactionHint,
  localMapSnapshot,
  globalMapSnapshot,
  inventoryWeight,
  InventoryEntry,
  type ControlMode,
  MOVE_KEYS,
  bufferStrongAttack,
  takeBufferedStrongAttack,
  commandHeavyAttack,
  moveVectorFromKeys,
  setAimPoint,
  setMoveIntent,
  setMovementAction,
  setPrimaryAttack,
  DEV_PROFILES,
  ENCOUNTERS,
  spawnEncounter,
  applyDevProfile,
  devProfileById,
  type InspectCard,
  type ItemKind,
  type ItemId,
  type QuickSlotId,
  heroAbilityShape,
  inspectQuickSlot,
  applyQuickSlot,
  inspectEnemyAt,
  inspectHeroSlot,
  inspectInteractive,
  inspectInventoryItem,
  inspectNpc,
  inspectTalentNode,
  inspectAbility,
  activateSkillSlot,
  assignActiveSkill,
  TELEGRAPHS,
  windUpProgress,
  RESONANCE_MAX_STACKS,
  beginCharge,
  releaseCharge,
  controlModeFor,
  isKnown,
  isSamosborLethalPhase,
  isSamosborProtectedAt,
  isSamosborWarningPhase,
  isVisible,
  ITEMS,
  mapForZone,
  maxHeroHp,
  migrateGameState,
  Npc,
  npcRoleLabel,
  Point,
  samosborHighlightsShelters,
  samosborPhaseIn,
  samosborPhaseLabel,
  setControlMode,
  SKILL_NAMES,
  SkillBranch,
  SLOT_NAMES,
  TALENT_NODES,
  tickGame,
  tileAt,
  WEAPONS,
  unlockedActiveSkills,
} from "./game-engine";
import {
  DIRECTION_ANGLES,
  attributeLines,
  availableAbilities,
  characterGroups,
  compareItem,
  handsModel,
  hudModel,
  talentTreeView,
} from "./game-presentation.ts";

const SAVE_KEY = "samosbor-shift-556-stage-5-progression";
const TILE_WIDTH = 82;
const TILE_HEIGHT = 41;
const DESKTOP_FRAME_INTERVAL = 16;

const TILE_LABELS: Record<string, string> = {
  ".": "Проход",
  "#": "Стена",
  c: "Низкое укрытие",
  L: "Лифтовый узел",
  T: "Служебный терминал",
  S: "Датчик СБ-04",
  H: "Гермодверь",
  g: "Гермокомната",
  P: "Межэтажный переход",
  U: "Переход вверх",
  D: "Переход вниз",
  A: "Артефактное гнездо",
  B: "Аварийный шкаф",
  N: "Диспетчер Орлова",
};

/**
 * Что делает взаимодействие с этой плиткой. Раньше осмотр подставлял сюда
 * подсказку ближайшего к герою объекта, и карточка диспетчера обещала
 * «проверить лифт»: описание должно принадлежать тому, на что навели.
 */
const TILE_ACTIONS: Record<string, string> = {
  T: "прочитать журналы и карту",
  B: "вскрыть шкаф",
  L: "вызвать лифт",
  S: "осмотреть датчик",
  A: "снять артефакт",
  U: "подняться этажом выше",
  D: "спуститься этажом ниже",
  P: "войти в переход",
  N: "заговорить",
  H: "пройти через гермодверь",
};

const TILE_MARKS: Record<string, string> = {
  c: "▰",
  L: "Л",
  T: "Т",
  S: "Д",
  H: "Г",
  P: "∅",
  U: "↑",
  D: "↓",
  A: "◈",
  B: "▣",
  N: "Н",
};

const MODE_LABELS: Record<EnemyMode, string> = {
  patrol: "патруль",
  suspicious: "подозрение",
  hunting: "преследование",
  combat: "бой",
  retreat: "отступление",
  disabled: "отключён",
};

const MODE_COLORS: Record<EnemyMode, string> = {
  patrol: "#78a99e",
  suspicious: "#d2b356",
  hunting: "#d5814e",
  combat: "#db6058",
  retreat: "#a580ba",
  disabled: "#62675f",
};

/**
 * Силуэты существ по визуальной библии: происхождение читается формой, а не
 * подписью. Раньше все существа были одинаковым кружком или квадратом с буквой,
 * и различить их можно было только прочитав символ.
 *
 * Ноль по X — центр фигуры, ноль по Y — точка опоры на плитке, поэтому силуэт
 * ставится обычным переносом в изометрическую координату.
 *
 * Формы намеренно крупные и простые: библия требует читаемости силуэта с
 * игровой дистанции, а не анатомической точности.
 */

/** Человеческое происхождение: прямая осанка, снаряжение на поясе. */
const SILHOUETTE_HUMAN =
  "M -6 -21 L 6 -21 L 8 -9 L 4 -9 L 4 0 L 1.5 0 L 1.5 -8 L -1.5 -8 L -1.5 0 L -4 0 L -4 -9 L -8 -9 Z";

/** Аномальное: сутулость, смещённая ось, вывернутые пропорции. */
const SILHOUETTE_ANOMALOUS =
  "M -9 -14 L -2 -20 L 6 -18 L 9 -8 L 5 -7 L 6 0 L 3 0 L 1 -7 L -1 -6 L -2 0 L -5 0 L -5 -8 L -9 -9 Z";

/** Промышленное: корпус, кожух, узнаваемо заводская форма. */
const SILHOUETTE_INDUSTRIAL =
  "M -8 -22 L 8 -22 L 8 -8 L 5 -8 L 5 0 L 2 0 L 2 -8 L -2 -8 L -2 0 L -5 0 L -5 -8 L -8 -8 Z";

const ENEMY_SILHOUETTES: Record<Enemy["kind"], string> = {
  sentry: SILHOUETTE_INDUSTRIAL,
  stalker: SILHOUETTE_ANOMALOUS,
  collector: SILHOUETTE_HUMAN,
};

const NPC_COLORS: Record<Npc["kind"], string> = {
  resident: "#8eb5a8",
  merchant: "#d6bd69",
  liquidator: "#c87962",
};

const COMMUNICATION_LABELS: Record<"offline" | "unstable" | "online", string> = {
  offline: "нет",
  unstable: "с помехами",
  online: "есть",
};

const SKILL_BRANCHES = Object.keys(SKILL_NAMES) as SkillBranch[];
type MenuPanel = "character" | "inventory" | "talents" | "map" | null;
function pointsForDiamond(cx: number, cy: number): string {
  return [
    `${cx},${cy}`,
    `${cx + TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`,
    `${cx},${cy + TILE_HEIGHT}`,
    `${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`,
  ].join(" ");
}

/**
 * Обратное изометрическое преобразование: экранная точка курсора в мировые
 * координаты. Нужно, чтобы мышь задавала прицел независимо от движения.
 */
function fromIso(screen: Point, originX: number, originY: number): Point {
  const dx = screen.x - originX;
  const dy = screen.y - originY - TILE_HEIGHT / 2;
  return {
    x: dx / TILE_WIDTH + dy / TILE_HEIGHT,
    y: dy / TILE_HEIGHT - dx / TILE_WIDTH,
  };
}

function toIso(point: Point, originX: number, originY: number): Point {
  return {
    x: originX + ((point.x - point.y) * TILE_WIDTH) / 2,
    y: originY + ((point.x + point.y) * TILE_HEIGHT) / 2 + TILE_HEIGHT / 2,
  };
}

/**
 * Материалы этажа по визуальной библии: пол — тёплый бетон, конструкции —
 * холодный крашеный металл, ведомственное оборудование — выцветшая олива.
 * Раньше все плитки лежали в пределах нескольких пунктов одного серо-зелёного,
 * и этаж читался как ровное поле без материалов.
 *
 * Насыщенность здесь — сигнал, а не украшение: янтарь помечает то, что можно
 * забрать, ржавчина — промышленные узлы, пурпурный закреплён за аномальным и
 * не встречается в бытовой среде.
 */
function tileColor(tile: string, zoneIsVoid: boolean, visible: boolean): string {
  if (!visible) return zoneIsVoid ? "#151019" : "#14160f";
  if (zoneIsVoid) {
    if (tile === "#") return "#312139";
    if (tile === "c") return "#4a3a52";
    if (tile === "P") return "#6d2f88";
    return "#3f2c47";
  }
  switch (tile) {
    // Несущие конструкции: холодный крашеный металл поверх бетона.
    case "#": return "#31382f";
    // Укрытие: тот же металл, но подсвеченный как проходимый объект.
    case "c": return "#4a5647";
    // Аномалия: единственный пурпурный в бытовой палитре.
    case "P": return "#5f2b76";
    // Лестницы между этажами: окисленная медь.
    case "U":
    case "D": return "#4b6f66";
    // Артефакт: янтарь, самый тёплый акцент на этаже.
    case "A": return "#8a6f3e";
    // Гермокомната: выцветшая ведомственная краска, читается как безопасность.
    case "H": return "#6d8f7a";
    // Гермодверь.
    case "g": return "#38705d";
    // Склад снабжения: брезент и дерево.
    case "S": return "#6b5f3d";
    // Лифт: тёмный технический металл.
    case "L": return "#414a52";
    // Терминал: подсвеченный прибор.
    case "T": return "#4c5f5b";
    // Контейнер: крашеный ящик со ржавчиной по кромкам.
    case "B": return "#5c5341";
    // Пост NPC.
    case "N": return "#47645c";
    // Пол: тёплый пыльный бетон.
    default: return "#6b6a5b";
  }
}

function npcDescription(npc: Npc): string {
  if (npc.kind === "liquidator") return "Участник городского отряда ликвидации последствий Самосбора. Патрулирует кварталы и готовится к выходу за ворота.";
  if (npc.kind === "merchant") return `Городской специалист: ${npcRoleLabel(npc.role)}. Запасы меняются вместе с поставками и состоянием внешних этажей.`;
  return `Житель Города 550: ${npcRoleLabel(npc.role)}. Следует собственному маршруту между кварталами.`;
}

/**
 * Осмотр рисуется одним компонентом для всех сущностей. Карточку собирает
 * движок (`app/game-inspect.ts`), интерфейс только раскладывает её по разметке:
 * иначе каждая новая сущность требовала бы собственной подсказки.
 */
function InspectCardView({ card }: { card: InspectCard }) {
  return (
    <div className={`inspect-card inspect-${card.kind}`} role="status">
      <header>
        <div>
          <strong>{card.title}</strong>
          {card.subtitle ? <small>{card.subtitle}</small> : null}
        </div>
        {card.binding ? <kbd>{card.binding}</kbd> : null}
      </header>

      {card.blocked ? <p className="inspect-blocked">{card.blocked}</p> : null}

      {card.transform ? (
        <div className="inspect-transform">
          <small>{card.transform.binding}</small>
          <p>
            <s>{card.transform.from}</s>
            <i>→</i>
            <b>{card.transform.to}</b>
          </p>
        </div>
      ) : null}

      {card.bars.map((bar) => (
        <div key={bar.id} className={`inspect-bar bar-${bar.tone}`}>
          <span>{bar.label}</span>
          <i style={{ width: `${Math.max(0, Math.min(100, (bar.value / Math.max(1, bar.max)) * 100))}%` }} />
          <b>{Math.round(bar.value)} / {Math.round(bar.max)}</b>
        </div>
      ))}

      {card.sections.map((part, index) => (
        <section key={part.title ?? `part-${index}`}>
          {part.title ? <h5>{part.title}</h5> : null}
          {part.lines.map((entry, lineIndex) => (
            <p key={`${entry.label ?? ""}-${lineIndex}`} className={`tone-${entry.tone ?? "neutral"}`}>
              {entry.label ? <span>{entry.label}</span> : null}
              {entry.value}
            </p>
          ))}
        </section>
      ))}

      {card.footer ? <footer>{card.footer}</footer> : null}
    </div>
  );
}

function tileDescription(tile: string, zoneIsVoid: boolean): string {
  const descriptions: Record<string, string> = {
    N: "Дежурный диспетчер стартового сектора. Выдаёт первое поручение и объясняет текущие угрозы.",
    S: "Повреждённый датчик СБ-04. Его восстановление является первой полевой задачей.",
    H: "Гермодверь отделяет автономную комнату от этажа. Существа, слизь и последствия Самосбора через неё не проходят.",
    g: "Пол автономной гермокомнаты. Здесь можно безопасно восстановить здоровье, снизить стресс и переждать угрозу.",
    U: "Межэтажный переход. Срабатывает только после взаимодействия рядом с узлом.",
    D: "Спуск на следующий этаж. Переход выполняется только явной командой взаимодействия.",
    P: zoneIsVoid ? "Нестабильный выход. Он выбросит героя на случайный этаж и исчезнет." : "Редкая войд-аномалия. После входа обратного пути не будет.",
    B: "Аварийный шкаф с расходниками, инструментом или редкой находкой.",
    T: "Служебный терминал с картой, журналами и локальными поручениями.",
    L: "Лифтовый узел. Большинство линий требует допуска или восстановления.",
    c: "Низкое укрытие. Даёт защиту от дистанционных атак.",
    A: "Аномальное гнездо с артефактом и повышенным риском заражения.",
  };
  return descriptions[tile] ?? "Часть окружения текущего этажа.";
}

function itemGlyph(entry: InventoryEntry): string {
  const item = ITEMS[entry.itemId];
  if (item.kind === "weapon") return WEAPONS[entry.itemId as keyof typeof WEAPONS].category === "melee" ? "Б" : "О";
  if (item.kind === "artifact") return "◈";
  if (item.kind === "consumable") return "+";
  if (item.kind === "material") return "Д";
  return {
    head: "Г",
    body: "К",
    hands: "Р",
    feet: "Н",
    back: "С",
    weapon: "О",
    offhand: "Л",
    artifact: "А",
  }[item.slot ?? "body"];
}


function conditionTone(condition: number): string {
  if (condition < 35) return "critical";
  if (condition < 70) return "worn";
  return "serviceable";
}

export default function GamePrototype() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<MenuPanel>(null);
  const [selectedTalentId, setSelectedTalentId] = useState<string>("precision:01");
  const [inspected, setInspected] = useState<InspectCard | null>(null);
  const [logExpanded, setLogExpanded] = useState(false);
  const [inspectedItemId, setInspectedItemId] = useState<ItemId | null>(null);
  const stateRef = useRef(state);
  const lastFrameRef = useRef(0);
  const gamepadLockRef = useRef(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  const gamepadButtonsRef = useRef<Set<number>>(new Set());
  const okHeldRef = useRef(false);
  const okChordRef = useRef(false);
  const characterOpen = activePanel === "character";
  const inventoryOpen = activePanel === "inventory";
  const talentsOpen = activePanel === "talents";
  const mapOpen = activePanel === "map";
  const menuOpen = activePanel !== null;
  const map = mapForZone(state.zone);
  const hero = state.hero.positions[state.zone];
  const target = enemyById(state, state.hero.attackTargetId);
  const heroMaxHp = maxHeroHp(state);
  const carriedWeight = inventoryWeight(state);
  const weightLimit = carryCapacity(state);
  const hermeticSafe = isSamosborProtectedAt(state, state.zone, hero);
  const samosborPhase = samosborPhaseIn(state, state.zone);
  const samosborLethal = isSamosborLethalPhase(samosborPhase);
  const samosborWarning = isSamosborWarningPhase(samosborPhase);
  const samosborAlarm = samosborLethal || samosborWarning;
  const shelterHighlight = samosborHighlightsShelters(state, state.zone);
  // Интерфейс читает модель представления, а не состояние мира напрямую
  // (app/game-presentation.ts): правила игры считает движок, экран их рисует.
  const hud = hudModel(state);
  const hands = handsModel(state);
  const minimap = useMemo(() => {
    const snapshot = localMapSnapshot(state, 9);
    return {
      width: snapshot.maxX - snapshot.minX + 1,
      cells: snapshot.cells,
    };
  }, [state]);
  // Дерево строится только когда экран открыт: раскладка из 125 узлов не
  // должна пересчитываться каждый кадр боя.
  const tree = useMemo(() => (talentsOpen ? talentTreeView(state) : null), [talentsOpen, state]);
  const abilities = useMemo(() => (talentsOpen ? availableAbilities(state) : []), [talentsOpen, state]);
  const floorPlan = useMemo(() => {
    if (!mapOpen) return { width: 1, cells: [] as ReturnType<typeof localMapSnapshot>["cells"] };
    const snapshot = localMapSnapshot(state, 400);
    return { width: snapshot.maxX - snapshot.minX + 1, cells: snapshot.cells };
  }, [mapOpen, state]);
  const cluster = useMemo(() => (mapOpen ? globalMapSnapshot(state) : { nodes: [], connections: [] }), [mapOpen, state]);
  // Сравнение считается для предмета под курсором: карточка осмотра и таблица
  // сравнения — две части одного ответа на вопрос «брать или нет».
  const comparison = inspected?.kind === "item" && inspectedItemId ? compareItem(state, inspectedItemId) : null;
  const abilityShapeNow = heroAbilityShape(state);
  const visibleLoot = state.groundLoot.filter(
    (loot) => loot.zone === state.zone && isKnown(state, loot.position),
  );
  const sortedInventory = [...state.hero.inventory].sort((a, b) => {
    const order: Record<ItemKind, number> = { weapon: 0, gear: 1, artifact: 2, consumable: 3, material: 4 };
    return order[ITEMS[a.itemId].kind] - order[ITEMS[b.itemId].kind] ||
      ITEMS[a.itemId].name.localeCompare(ITEMS[b.itemId].name, "ru");
  });
  const unlockedSkills = unlockedActiveSkills(state);
  // Вкладок направлений больше нет: дерево одно, выбор идёт по узлу на схеме.
  const selectedTalent = TALENT_NODES.find((node) => node.id === selectedTalentId) ?? null;
  const branchPoints = Object.fromEntries(
    SKILL_BRANCHES.map((branch) => [branch, branchTalentPoints(state, branch)]),
  ) as Record<SkillBranch, number>;
  const leadingBranches = [...SKILL_BRANCHES]
    .filter((branch) => branchPoints[branch] > 0)
    .sort((left, right) => branchPoints[right] - branchPoints[left]);
  const hybridClass = leadingBranches.length >= 2
    ? TALENT_NODES.find(
        (node) =>
          node.scope === "hybrid" &&
          node.pair?.includes(leadingBranches[0]) &&
          node.pair?.includes(leadingBranches[1]),
      )?.name
    : null;
  const classTitle = hybridClass ?? (leadingBranches[0] ? SKILL_NAMES[leadingBranches[0]] : "Младший обходчик");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);


  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(SAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          if (
            parsed?.hero?.positions?.floor555 &&
            parsed?.hero?.positions?.floor556 &&
            parsed?.hero?.positions?.floor557 &&
            parsed?.hero?.positions?.voidLab &&
            parsed?.hero?.equipment &&
            Array.isArray(parsed?.hero?.inventory) &&
            Array.isArray(parsed.enemies) &&
            Array.isArray(parsed.groundLoot) &&
            Array.isArray(parsed.populations) &&
            typeof parsed.populationCycle === "number" &&
            typeof parsed.worldTimeMs === "number"
          ) {
            setState(migrateGameState(parsed));
          }
        }
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
      } finally {
        setSaveLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!saveLoaded) return;
    const timer = window.setInterval(() => {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    }, 1200);
    return () => window.clearInterval(timer);
  }, [saveLoaded]);

  useEffect(() => {
    let frame = 0;
    const animate = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const delta = now - lastFrameRef.current;
      const frameInterval = DESKTOP_FRAME_INTERVAL;
      if (delta >= frameInterval) {
        lastFrameRef.current = now;
        setState((current) => {
          const ticked = tickGame(current, delta);
          // Отложенное нажатие выполняется, как только оружие позволило.
          const taken = takeBufferedStrongAttack(ticked);
          return taken.pending ? commandHeavyAttack(taken.state) : taken.state;
        });
      }
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const moveTo = useCallback((point: Point) => {
    setState((current) => commandMove(current, point));
  }, []);

  const interactAtPoint = useCallback((point: Point) => {
    setState((current) => commandInteractAt(current, point));
  }, []);

  const collectLoot = useCallback((lootId: string) => {
    setState((current) => commandCollectLoot(current, lootId));
  }, []);

  const talkToNpc = useCallback((npcId: string) => {
    setState((current) => commandTalkToNpc(current, npcId));
  }, []);

  const attackEnemy = useCallback((enemyId: string) => {
    setState((current) => commandAttack(current, enemyId));
  }, []);

  const attackNearest = useCallback(() => {
    setState((current) => commandAttackNearest(current));
  }, []);

  const interactNow = useCallback(() => {
    setState((current) => interact(current));
  }, []);

  /** Карточка ячейки способности: заполненной или пустой. */
  const abilityCardFor = (index: number): InspectCard => {
    const skillId = state.hero.activeSkillSlots[index] ?? null;
    if (!skillId) {
      return inspectAbility({
        name: `Ячейка ${index + 1}`,
        binding: `${index + 1}`,
        description: "Дерево талантов определяет, что персонаж знает; панель — что из этого лежит под рукой.",
        targeting: "назначается в дереве талантов",
        blocked: unlockedSkills.length ? "Ячейка не назначена" : "Освоенных способностей пока нет",
      });
    }
    const skill = ACTIVE_SKILLS[skillId];
    const cooldown = state.hero.activeSkillCooldowns[skillId] ?? 0;
    const known = unlockedSkills.includes(skillId);
    return inspectAbility({
      name: skill.name,
      binding: `${index + 1}`,
      description: skill.description,
      targeting: skill.tags.includes("area")
        ? "область вокруг цели"
        : skill.tags.includes("device") ? "снаряжение героя" : "выбранная цель",
      cooldownMs: skill.cooldownMs,
      cooldownLeftMs: cooldown,
      applies: skill.tags.includes("mark") ? ["resonance"] : undefined,
      consumes: skill.role === "spender" ? ["resonance"] : undefined,
      blocked: !known
        ? "Направление ещё не набрано"
        : cooldown > 0 ? `Восстановление: ${(cooldown / 1000).toFixed(1)} с` : undefined,
      handNote: abilityShapeNow.note,
    });
  };

  /** Быстрая ячейка: что в ней лежит и готова ли она, решает движок. */
  const quickSlotNow = useCallback((slot: QuickSlotId) => {
    setState((current) => applyQuickSlot(current, slot));
  }, []);

  const artifactNow = useCallback(() => {
    setState((current) => activateEquippedArtifact(current));
  }, []);

  const cancelAction = useCallback(() => {
    setState((current) => cancelHeroAction(current));
  }, []);

  const startCharge = useCallback(() => {
    setState((current) => beginCharge(current));
  }, []);

  /**
   * Отпускание ПКМ. Если оружие ещё восстанавливается, нажатие не теряется:
   * короткий буфер выполнит сильную атаку, как только она станет допустимой.
   */
  const finishCharge = useCallback(() => {
    setState((current) => {
      if (current.hero.chargingSinceMs <= 0) return current;
      if (current.hero.attackCooldownMs > 0 || current.hero.staggeredUntilMs > current.worldTimeMs) {
        return bufferStrongAttack({ ...current, hero: { ...current.hero, chargingSinceMs: 0 } });
      }
      return releaseCharge(current);
    });
  }, []);

  const cycleControlMode = useCallback(() => {
    setState((current) => {
      const order: ControlMode[] = ["manual", "autopilot"];
      const index = order.indexOf(controlModeFor(current));
      return setControlMode(current, order[(index + 1) % order.length]);
    });
  }, []);

  /**
   * Ячейки 1 · 2 · 3. Дерево талантов определяет, что персонаж **знает**,
   * панель — что из этого лежит под рукой. Классов нет: в ячейку ложится любая
   * освоенная способность любого направления.
   */
  const activateAbilitySlot = useCallback((slot: number) => {
    setState((current) => activateSkillSlot(current, slot));
  }, []);

  useEffect(() => {
    const moveFocus = (key: string) => {
      const focusRoot: ParentNode = menuOpen
        ? document.querySelector(".game-menu-overlay") ?? document
        : document;
      const focusable = [...focusRoot.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']")]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!active || !focusable.includes(active)) {
        focusable[0].focus();
        return;
      }
      const source = active.getBoundingClientRect();
      const sx = source.left + source.width / 2;
      const sy = source.top + source.height / 2;
      const candidates = focusable.flatMap((element) => {
        if (element === active) return [];
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const dx = x - sx;
        const dy = y - sy;
        const valid = key === "arrowleft" ? dx < -4 : key === "arrowright" ? dx > 4 : key === "arrowup" ? dy < -4 : dy > 4;
        if (!valid) return [];
        const primary = key === "arrowleft" || key === "arrowright" ? Math.abs(dx) : Math.abs(dy);
        const secondary = key === "arrowleft" || key === "arrowright" ? Math.abs(dy) : Math.abs(dx);
        return [{ element, score: primary + secondary * 2.4 }];
      });
      candidates.sort((a, b) => a.score - b.score);
      candidates[0]?.element.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "c") {
        event.preventDefault();
        setActivePanel((panel) => panel === "character" ? null : "character");
        return;
      }
      if (key === "i") {
        event.preventDefault();
        setActivePanel((panel) => panel === "inventory" ? null : "inventory");
        return;
      }
      if (key === "t") {
        event.preventDefault();
        setActivePanel((panel) => panel === "talents" ? null : "talents");
        return;
      }
      if (key === "m") {
        event.preventDefault();
        setActivePanel((panel) => panel === "map" ? null : "map");
        return;
      }
      if (key === "k") {
        event.preventDefault();
        return;
      }
      if (key === "escape" || key === "browserback" || event.keyCode === 461) {
        event.preventDefault();
        if (menuOpen) setActivePanel(null);
        else cancelAction();
        return;
      }
      if (menuOpen) {
        if (["arrowup", "arrowright", "arrowdown", "arrowleft"].includes(key)) {
          event.preventDefault();
          moveFocus(key);
        }
        return;
      }
      if (key === "enter" || key === " ") {
        event.preventDefault();
        if (!event.repeat) {
          okHeldRef.current = true;
          okChordRef.current = false;
        }
        return;
      }
      // Контракт управления Gate 4.5: 1 · 2 · 3 — способности, Q · E —
      // расходники, Shift — действие перемещения. Атака живёт на мыши.
      if (key === "1" || key === "2" || key === "3") {
        event.preventDefault();
        if (!event.repeat) activateAbilitySlot(Number(key) - 1);
      } else if (key === "q") {
        event.preventDefault();
        if (!event.repeat) quickSlotNow("q");
      } else if (key === "e") {
        event.preventDefault();
        if (!event.repeat) quickSlotNow("e");
      } else if (key === "f") {
        event.preventDefault();
        interactNow();
      } else if (key === "x") {
        event.preventDefault();
        cancelAction();
      } else if (key === "r") {
        event.preventDefault();
        artifactNow();
      } else if (key === "shift") {
        event.preventDefault();
        if (!event.repeat) setState((current) => setMovementAction(current, true));
      } else if (MOVE_KEYS[key]) {
        // Браузерный адаптер: клавиша превращается в намерение движения, а не
        // в маршрут. Боевая логика про клавиши ничего не знает.
        event.preventDefault();
        if (okHeldRef.current && key.startsWith("arrow")) okChordRef.current = true;
        if (!heldKeysRef.current.has(key)) {
          heldKeysRef.current.add(key);
          setState((current) => setMoveIntent(current, moveVectorFromKeys(heldKeysRef.current)));
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "shift") {
        event.preventDefault();
        setState((current) => setMovementAction(current, false));
        return;
      }
      if (MOVE_KEYS[key] && heldKeysRef.current.delete(key)) {
        event.preventDefault();
        setState((current) => setMoveIntent(current, moveVectorFromKeys(heldKeysRef.current)));
        return;
      }
      if (key !== "enter" && key !== " ") return;
      event.preventDefault();
      const usedChord = okChordRef.current;
      okHeldRef.current = false;
      okChordRef.current = false;
      if (usedChord || menuOpen) return;
      const hint = interactionHint(stateRef.current);
      if (hint !== "Подойдите к объекту") interactNow();
      else attackNearest();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [artifactNow, attackNearest, cancelAction, cycleControlMode, interactNow, menuOpen, moveTo, quickSlotNow, activateAbilitySlot]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const pad = navigator.getGamepads?.().find((candidate) => candidate?.connected);
      if (!pad) {
        gamepadButtonsRef.current.clear();
        return;
      }
      const pressed = new Set<number>();
      pad.buttons.forEach((button, index) => {
        if (button.pressed) pressed.add(index);
      });
      const fresh = [...pressed].filter((index) => !gamepadButtonsRef.current.has(index));
      gamepadButtonsRef.current = pressed;
      if (!fresh.length || performance.now() < gamepadLockRef.current) return;
      gamepadLockRef.current = performance.now() + 130;
      const index = fresh[0];
      if (index === 0) attackNearest();
      else if (index === 1) cancelAction();
      else if (index === 2) interactNow();
      else if (index === 3) setActivePanel((panel) => panel === "character" ? null : "character");
      else if (index >= 12 && index <= 15 && !menuOpen) {
        const direction = index === 12 ? { x: 0, y: -1 } : index === 13 ? { x: 0, y: 1 } : index === 14 ? { x: -1, y: 0 } : { x: 1, y: 0 };
        const current = gridPoint(stateRef.current.hero.positions[stateRef.current.zone]);
        moveTo({ x: current.x + direction.x, y: current.y + direction.y });
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [attackNearest, cancelAction, interactNow, menuOpen, moveTo]);

  const tiles = useMemo(() => {
    const result: Point[] = [];
    for (let y = 0; y < map.rows.length; y += 1) {
      for (let x = 0; x < map.rows[0].length; x += 1) result.push({ x, y });
    }
    return result.sort((a, b) => a.x + a.y - (b.x + b.y) || a.y - b.y);
  }, [map]);

  const visibleNpcs = state.npcs.filter(
    (npc) => npc.zone === state.zone && isKnown(state, npc.position),
  );
  // В городе разговаривают одновременно несколько жителей, их реплики
  // накладывались друг на друга и становились нечитаемыми. Показываем реплику
  // только ближайшего к герою — того, кого он и мог бы расслышать.
  const heroPoint = state.hero.positions[state.zone];
  const speakingNpcId = visibleNpcs
    .filter((npc) => npc.speech && npc.speechUntilMs > state.worldTimeMs)
    .sort(
      (left, right) =>
        (left.position.x - heroPoint.x) ** 2 + (left.position.y - heroPoint.y) ** 2 -
        ((right.position.x - heroPoint.x) ** 2 + (right.position.y - heroPoint.y) ** 2),
    )[0]?.id ?? null;
  const visibleEnemies = state.enemies.filter((enemy) => enemyVisibleToHero(state, enemy));

  // Что сейчас под курсором. Дружественное и интерактивное перехватывает
  // ЛКМ/ПКМ: атака остаётся только для враждебного и пустого пространства.
  //
  // Считается здесь, а не выше по файлу: `visibleNpcs` объявлен рядом, и при
  // чтении его раньше объявления первое же движение мыши по карте роняло
  // экран с ReferenceError.
  const contextualUnderCursor = (() => {
    const aim = state.hero.aimPoint;
    if (!aim) return null;
    const npc = visibleNpcs.find((entry) => distance(entry.position, aim) <= 1.2);
    if (npc) return { kind: "npc" as const, name: npc.name };
    const loot = (state.groundLoot ?? []).find(
      (entry) => entry.zone === state.zone && distance(entry.position, aim) <= 1.2,
    );
    if (loot) return { kind: "loot" as const, name: ITEMS[loot.itemId].shortName };
    return null;
  })();
  const svgWidth = ((map.rows[0].length + map.rows.length) * TILE_WIDTH) / 2 + 96;
  const svgHeight = ((map.rows[0].length + map.rows.length) * TILE_HEIGHT) / 2 + 108;
  const originX = (map.rows.length * TILE_WIDTH) / 2 + 48;
  const originY = 28;
  const heroIso = toIso(hero, originX, originY);
  // Камера: постоянный зум, соотношение кадра, слежение за героем. Раньше
  // границы зажимались в [0, размер − окно]; на карте меньше окна это
  // выражение отрицательное, и мир прижимался к левому верхнему углу вместо
  // того, чтобы встать по центру кадра.
  // Зум ограничен сверху, но маленький этаж не оставляет пустых полей: если
  // карта меньше окна, окно сжимается до карты, а preserveAspectRatio="slice"
  // растягивает её на весь кадр.
  const cameraHeight = Math.min(760, svgHeight);
  const cameraWidth = Math.min(Math.round((cameraHeight * 16) / 9), svgWidth);
  const centreCamera = (wanted: number, span: number, total: number) =>
    total <= span ? (total - span) / 2 : Math.max(0, Math.min(total - span, wanted));
  const cameraX = centreCamera(heroIso.x - cameraWidth / 2, cameraWidth, svgWidth);
  const cameraY = centreCamera(heroIso.y - cameraHeight / 2, cameraHeight, svgHeight);
  const resetGame = () => {
    const fresh = createInitialState();
    setState(fresh);
    setActivePanel(null);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
  };

  /** Клетка мини-карты: что важно, то и красится. */
  const minimapClass = (cell: { known: boolean; visible: boolean; hero: boolean; npc: boolean; enemy: boolean; loot: boolean; tile: string }) => {
    if (!cell.known) return "mm mm-dark";
    if (cell.hero) return "mm mm-hero";
    if (cell.enemy) return "mm mm-enemy";
    if (cell.npc) return "mm mm-npc";
    if (cell.loot) return "mm mm-loot";
    if (cell.tile === "#") return "mm mm-wall";
    if ("UDPL".includes(cell.tile)) return "mm mm-link";
    return `mm mm-floor${cell.visible ? " lit" : ""}`;
  };

  /** Осмотр предмета: карточка и сравнение показывают одно и то же. */
  const inspectItemNow = (itemId: ItemId, quantity?: number, condition?: number) => {
    setInspectedItemId(itemId);
    setInspected(inspectInventoryItem(state, itemId, { quantity, condition }));
  };
  const clearInspect = () => {
    setInspectedItemId(null);
    setInspected(null);
  };

  /** Ячейка снаряжения на кукле: одна разметка на все слоты. */
  const renderGearSlot = (slot: GearSlot) => {
    const entry = equippedEntry(state, slot);
    const item = entry ? ITEMS[entry.itemId] : null;
    return (
      <button
        key={slot}
        type="button"
        className={`doll-slot ${entry ? "filled" : "empty"} rarity-${item?.rarity ?? "common"}`}
        onPointerEnter={() => entry && inspectItemNow(entry.itemId, entry.quantity, entry.condition)}
        onPointerLeave={() => clearInspect()}
      >
        <small>{SLOT_NAMES[slot]}</small>
        <strong>{item?.shortName ?? "—"}</strong>
        {entry ? <em className={conditionTone(entry.condition)}>{Math.round(entry.condition)}%</em> : null}
      </button>
    );
  };


  return (
    <main className={`game-shell realtime-shell ${state.hero.evadeMode ? "evade-mode" : ""}`}>
      <section className="game-layout realtime-layout">
        <div className={`world-view ${state.zone === "voidLab" ? "void-view" : ""} ${samosborLethal ? "samosbor-active" : samosborWarning ? "samosbor-warning" : ""}`}>
          <div className="map-stage realtime-stage">
            <svg
              className="iso-map realtime-map"
              viewBox={`${cameraX} ${cameraY} ${cameraWidth} ${cameraHeight}`}
              // Камера заполняет игровую область и обрезает лишнее, а не
              // вписывается в неё целиком. При "meet" широкая и невысокая
              // область давала поля по бокам и уменьшала мир до нечитаемого
              // масштаба. Камера следует за героем, поэтому обрезка краёв —
              // ожидаемое поведение, а не потеря информации.
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label={`Карта: ${map.name}`}
              onPointerMove={(event) => {
                // Мышь задаёт направление внимания. Движение при этом остаётся
                // за WASD: стрелок не обязан бежать туда, куда целится.
                const svg = event.currentTarget;
                const rect = svg.getBoundingClientRect();
                const scale = cameraWidth / rect.width;
                const local = {
                  x: cameraX + (event.clientX - rect.left) * scale,
                  y: cameraY + (event.clientY - rect.top) * (cameraHeight / rect.height),
                };
                setState((current) => setAimPoint(current, fromIso(local, originX, originY)));
              }}
              onContextMenu={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                // Курсор над дружественным или интерактивным объектом означает
                // взаимодействие, а не атаку: игрока нельзя заставлять бить
                // NPC только потому, что ЛКМ назначена на атаку.
                if (contextualUnderCursor) {
                  event.preventDefault();
                  interactNow();
                  return;
                }
                if (event.button === 0) setState((current) => setPrimaryAttack(current, true));
                // ПКМ — слот сильной атаки. Короткое нажатие бьёт сразу,
                // удержание копит заряд: отдельной кнопки заряда нет.
                if (event.button === 2) {
                  event.preventDefault();
                  startCharge();
                }
              }}
              onPointerUp={(event) => {
                if (event.button === 2) finishCharge();
                else setState((current) => setPrimaryAttack(current, false));
              }}
              onPointerLeave={() => {
                setState((current) => setPrimaryAttack(current, false));
                if (stateRef.current.hero.chargingSinceMs > 0) finishCharge();
              }}
            >
              <defs>
                <filter id="void-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="actor-shadow" x="-70%" y="-70%" width="240%" height="240%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
                </filter>
              </defs>

              {tiles.map((point) => {
                const tile = tileAt(state, point);
                const known = isKnown(state, point);
                const visible = isVisible(state, point);
                const iso = toIso(point, originX, originY);
                const cx = iso.x;
                const cy = iso.y - TILE_HEIGHT / 2;
                const isWall = tile === "#";
                const marker = !isWall && known ? TILE_MARKS[tile] : null;
                const inTargetVision =
                  target &&
                  known &&
                  distance(target.position, point) <= target.visionRadius &&
                  hasLineOfSight(state, target.position, point);
                const inTargetAggro =
                  target &&
                  inTargetVision &&
                  distance(target.position, point) <= target.aggroRadius;
                const inWeaponRange =
                  target &&
                  known &&
                  distance(hero, point) <= heroAttackRange(state) &&
                  hasLineOfSight(state, hero, point);
                const shelterMarked = shelterHighlight && known && (tile === "H" || tile === "g");
                const stroke = shelterMarked
                  ? "#7fe0c8"
                  : inTargetAggro
                  ? "#d65e56"
                  : inTargetVision
                    ? "#c29c4d"
                    : inWeaponRange
                      ? "#7cae96"
                      : tile === "c" && known
                        ? "#7ea59d"
                        : tile === "P" && known
                          ? "#b06bdd"
                          : (tile === "U" || tile === "D") && known
                            ? "#82b7ad"
                            : "#252a26";

                return (
                  <g
                    key={`${point.x}-${point.y}`}
                    className={`iso-tile ${known ? "known" : "unknown"} ${shelterMarked ? "shelter-marked" : ""}`}
                    onPointerDown={() => known && !isWall && interactAtPoint(point)}
                    onPointerEnter={() => known && !isWall && setInspected(inspectInteractive({
                      name: TILE_LABELS[tile] ?? "Объект",
                      description: tileDescription(tile, state.zone === "voidLab"),
                      interaction: TILE_ACTIONS[tile],
                      coordinates: point,
                    }))}
                    onPointerLeave={() => setInspected(null)}
                    role={known && !isWall ? "button" : undefined}
                    aria-label={known ? TILE_LABELS[tile] : undefined}
                  >
                    {isWall && known ? (
                      <polygon
                        points={`${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2 - 9} ${cx},${cy + TILE_HEIGHT - 9} ${cx},${cy + TILE_HEIGHT} ${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`}
                        fill={state.zone === "voidLab" ? "#1c1523" : "#20251f"}
                      />
                    ) : null}
                    <polygon
                      points={pointsForDiamond(cx, cy - (isWall && known ? 9 : 0))}
                      fill={tileColor(tile, state.zone === "voidLab", known)}
                      opacity={visible ? 1 : known ? 0.5 : 0.78}
                      stroke={stroke}
                      strokeWidth={shelterMarked ? 2.6 : inTargetAggro ? 2.8 : inTargetVision || inWeaponRange ? 2 : 1.3}
                      filter={(tile === "P" || tile === "U" || tile === "D") && visible ? "url(#void-glow)" : undefined}
                    />
                    {marker ? (
                      <g opacity={visible ? 1 : 0.55}>
                        <circle cx={cx} cy={cy + TILE_HEIGHT / 2 - 3} r={tile === "P" || tile === "U" || tile === "D" ? 13 : 10} fill="#20231f" stroke={tile === "A" ? "#e4c170" : "#aeb4a7"} strokeWidth="2" />
                        <text x={cx} y={cy + TILE_HEIGHT / 2 + 2} textAnchor="middle" className="map-symbol">{marker}</text>
                      </g>
                    ) : null}
                  </g>
                );
              })}

              {state.hero.path.length ? (
                <polyline
                  className="movement-path"
                  points={[hero, ...state.hero.path]
                    .map((point) => {
                      const iso = toIso(point, originX, originY);
                      return `${iso.x},${iso.y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#d7c76f"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                />
              ) : null}

              {state.hero.destination ? (() => {
                const iso = toIso(state.hero.destination, originX, originY);
                return <circle className="destination-ring" cx={iso.x} cy={iso.y} r="13" fill="none" stroke="#e7cf72" strokeWidth="2" />;
              })() : null}

              {state.effects.map((effect) => {
                const from = toIso(effect.from, originX, originY);
                const to = toIso(effect.to, originX, originY);
                const color = effect.kind === "enemy-hit" ? "#e46a5e" : effect.kind === "drone" ? "#79c5c0" : effect.kind === "miss" ? "#9b9d91" : "#f0d26d";
                return (
                  <g key={effect.id} className={`combat-effect effect-${effect.kind}`} opacity={Math.min(1, effect.ttlMs / 180)}>
                    <line x1={from.x} y1={from.y - 12} x2={to.x} y2={to.y - 12} stroke={color} strokeWidth={effect.kind === "drone" ? 2 : 3} />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 20} textAnchor="middle" fill={color}>{effect.kind === "miss" ? "МИМО" : `−${effect.value}`}</text>
                  </g>
                );
              })}

              {visibleLoot.map((loot, index) => {
                const iso = toIso(loot.position, originX, originY);
                const item = ITEMS[loot.itemId];
                const visible = isVisible(state, loot.position);
                return (
                  <g
                    key={loot.id}
                    className="loot-marker"
                    transform={`translate(${iso.x + (index % 2) * 9} ${iso.y - 18 - (index % 3) * 3})`}
                    opacity={visible ? 1 : 0.5}
                    role="button"
                    aria-label={`Добыча: ${item.name}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      collectLoot(loot.id);
                    }}
                    onPointerEnter={() => setInspected(inspectInventoryItem(state, loot.itemId, {
                      quantity: loot.quantity,
                      condition: loot.condition,
                      binding: "ЛКМ",
                    }))}
                    onPointerLeave={() => setInspected(null)}
                  >
                    <rect className="actor-hit" x="-14" y="-12" width="28" height="26" fill="transparent" />
                    <path d="M -9 3 L -6 -7 L 7 -7 L 10 3 L 0 9 Z" fill="#39372a" stroke="#e1c86d" strokeWidth="2" />
                    <text x="0" y="2" textAnchor="middle" fill="#f2dfa0">{item.kind === "artifact" ? "◈" : "•"}</text>
                  </g>
                );
              })}

              {visibleNpcs.map((npc) => {
                const iso = toIso(npc.position, originX, originY);
                const color = NPC_COLORS[npc.kind];
                const visible = isVisible(state, npc.position);
                const formationOffset = npc.role === "liquidator-leader" ? -13 : npc.role === "liquidator-rifleman" ? 13 : 0;
                return (
                  <g
                    key={npc.id}
                    className={`npc-marker npc-${npc.kind}`}
                    transform={`translate(${formationOffset} ${npc.kind === "liquidator" ? Math.abs(formationOffset) * 0.18 : 0})`}
                    opacity={visible ? 1 : 0.55}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      talkToNpc(npc.id);
                    }}
                    onPointerEnter={() => setInspected(inspectNpc({
                      name: npc.name,
                      roleLabel: npcRoleLabel(npc.role),
                      kindLabel: npc.kind === "liquidator" ? "отряд ликвидации" : npc.kind === "merchant" ? "торговая точка" : "городской маршрут",
                      description: npcDescription(npc),
                      interaction: npc.kind === "merchant" ? "открыть обмен" : "заговорить",
                      offers: npc.vendorStock?.length
                        ? npc.vendorStock.map((itemId) => ITEMS[itemId].shortName).join(", ")
                        : undefined,
                    }))}
                    onPointerLeave={() => setInspected(null)}
                    role="button"
                    aria-label={`${npc.name}, ${npcRoleLabel(npc.role)}`}
                    filter="url(#actor-shadow)"
                  >
                    <ellipse cx={iso.x} cy={iso.y + 8} rx="15" ry="6" fill="#11130f" opacity="0.55" />
                    <rect className="actor-hit" x={iso.x - 15} y={iso.y - 32} width="30" height="42" fill="transparent" />
                    {/*
                      Жители различаются занятием и снаряжением, а не цветом:
                      перекрашенный дубль — не новый персонаж. Торговца выдаёт
                      короб за спиной, ликвидатора — наплечная защита и оружие
                      на ремне, жильца — отсутствие и того, и другого.
                    */}
                    <g transform={`translate(${iso.x} ${iso.y + 6})`}>
                      {npc.kind === "merchant" ? (
                        <rect x="-11" y="-19" width="7" height="11" rx="1" fill="#22261f" stroke={color} strokeWidth="1.6" />
                      ) : null}
                      <path d={SILHOUETTE_HUMAN} fill="#252b25" stroke={color} strokeWidth="2" strokeLinejoin="round" />
                      {npc.kind === "liquidator" ? (
                        <>
                          <path d="M -7 -20 L -3 -22 M 7 -20 L 3 -22" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
                          <path d="M 6 -22 L 11 -6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
                        </>
                      ) : null}
                      <circle cx="0" cy="-26" r="4.5" fill="#252b25" stroke={color} strokeWidth="2" />
                    </g>
                    {npc.id === speakingNpcId ? (
                      <g className="npc-speech" transform={`translate(${iso.x - 74} ${iso.y - 62})`}>
                        <rect width="148" height="30" rx="6" fill="#171a16" stroke={color} strokeWidth="1.5" />
                        <text x="74" y="19" textAnchor="middle" fill="#e7eadf">{(npc.speech ?? "").length > 42 ? `${npc.speech?.slice(0, 42)}…` : npc.speech}</text>
                      </g>
                    ) : null}
                  </g>
                );
              })}

              {/*
                Звучащие участки Резонанса: область продолжает наводить
                резонанс сама, поэтому её обязательно видно на полу — иначе
                игрок не понимает, откуда на целях берутся новые стеки.
              */}
              {(state.discordZones ?? [])
                .filter((zone) => zone.zone === state.zone && zone.untilMs > state.worldTimeMs)
                .map((zone) => {
                  const centre = toIso(zone.position, originX, originY);
                  const life = Math.max(0, Math.min(1, (zone.untilMs - state.worldTimeMs) / 4000));
                  return (
                    <ellipse
                      key={zone.id}
                      className="discord-zone"
                      cx={centre.x}
                      cy={centre.y + 6}
                      rx={zone.radius * 27}
                      ry={zone.radius * 14}
                      fill="rgba(158, 120, 214, 0.15)"
                      stroke="#9e78d6"
                      strokeWidth="1.8"
                      strokeDasharray="7 5"
                      opacity={0.45 + life * 0.5}
                    />
                  );
                })}

              {visibleEnemies.map((enemy) => {
                const iso = toIso(enemy.position, originX, originY);
                const color = MODE_COLORS[enemy.mode];
                const selected = target?.id === enemy.id;
                return (
                  <g
                    key={enemy.id}
                    className={`enemy-marker ${selected ? "targeted" : ""}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      attackEnemy(enemy.id);
                    }}
                    onPointerEnter={() => setInspected(inspectEnemyAt(state, enemy))}
                    onPointerLeave={() => setInspected(null)}
                    role="button"
                    aria-label={`${enemy.name}, ${MODE_LABELS[enemy.mode]}`}
                    filter="url(#actor-shadow)"
                  >
                    {/*
                      Зона наведения. Силуэт — тонкая фигура с просветами, и
                      курсор между её линиями попадал в пол под ней: осмотр
                      показывал плитку вместо противника. Прозрачная область
                      закрывает весь след фигуры.
                    */}
                    <rect
                      className="actor-hit"
                      x={iso.x - 17}
                      y={iso.y - 34}
                      width="34"
                      height="44"
                      fill="transparent"
                    />
                    {selected ? <circle cx={iso.x} cy={iso.y + 1} r="24" fill="none" stroke="#efcf68" strokeWidth="2" strokeDasharray="5 4" /> : null}
                    {/*
                      Замах видно заранее — иначе на него нельзя ответить.
                      Тяжёлый показывает опасную зону и заполняющуюся дугу:
                      игрок читает и время, и место удара, а чем ответить —
                      выходом из зоны, уклонением, блоком, парированием или
                      сломом стойки — решает его сборка.
                    */}
                    {enemy.castUntilMs > state.worldTimeMs ? (() => {
                      const tier = enemy.castTier ?? "quick";
                      const progress = windUpProgress(enemy.castStartedMs ?? 0, state.worldTimeMs, tier);
                      const heavy = tier === "heavy";
                      const radius = heavy ? 30 : 22;
                      const circumference = 2 * Math.PI * radius;
                      return (
                        <g className={`telegraph telegraph-${tier}`}>
                          {heavy ? (
                            <ellipse
                              cx={iso.x}
                              cy={iso.y + 6}
                              rx={TELEGRAPHS.heavy.areaRadius * 27}
                              ry={TELEGRAPHS.heavy.areaRadius * 14}
                              fill="rgba(214, 96, 72, 0.16)"
                              stroke="#d66048"
                              strokeWidth="1.6"
                              strokeDasharray="6 5"
                            />
                          ) : null}
                          <circle
                            cx={iso.x}
                            cy={iso.y - 4}
                            r={radius}
                            fill="none"
                            stroke={heavy ? "#e8734f" : "#d6c06a"}
                            strokeOpacity="0.85"
                            strokeWidth={heavy ? 4 : 2.5}
                            strokeDasharray={`${circumference * progress} ${circumference}`}
                            transform={`rotate(-90 ${iso.x} ${iso.y - 4})`}
                          />
                        </g>
                      );
                    })() : null}
                    <ellipse cx={iso.x} cy={iso.y + 8} rx="17" ry="7" fill="#100f0e" opacity="0.72" />
                    <g transform={`translate(${iso.x} ${iso.y + 6}) scale(${enemy.role === "heavy" ? 1.35 : enemy.role === "swarm" ? 0.78 : 1})`}>
                      <path d={ENEMY_SILHOUETTES[enemy.kind]} fill="#22201d" stroke={color} strokeWidth="2" strokeLinejoin="round" />
                      {/*
                        Роль читается силуэтом до чтения названия: напор мелкий
                        и низкий, тяжёлый — крупный и широкий, помеха несёт
                        антенну, дистанция — вынесенный ствол.
                      */}
                      {enemy.role === "controller" ? (
                        <path d="M 0 -30 L 0 -40 M -5 -38 L 5 -38" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                      ) : null}
                      {enemy.role === "ranged" ? (
                        <path d="M 7 -16 L 17 -16" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
                      ) : null}
                      {enemy.kind === "sentry" ? (
                        // Манипулятор ведомственного автомата: это рабочий
                        // инструмент, применяемый не по назначению.
                        <path d="M 8 -18 L 15 -15 L 15 -11" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
                      ) : (
                        <circle cx={enemy.kind === "stalker" ? 2 : 0} cy={enemy.kind === "stalker" ? -24 : -26} r="4.5" fill="#22201d" stroke={color} strokeWidth="2" />
                      )}
                    </g>
                    <rect x={iso.x - 18} y={iso.y + 13} width="36" height="4" rx="2" fill="#171412" />
                    <rect x={iso.x - 18} y={iso.y + 13} width={36 * (enemy.hp / enemy.maxHp)} height="4" rx="2" fill={color} />
                    {/*
                      Наведённые состояния видно на цели: связка «подготовил →
                      сорвал» существует, только если игрок видит, что цель
                      подготовлена. Резонанс — по делению на стек, вскрытие —
                      разошедшейся скобой.
                    */}
                    {enemy.resonanceStacks > 0 ? (
                      <g className="state-resonance">
                        {Array.from({ length: Math.min(enemy.resonanceStacks, RESONANCE_MAX_STACKS) }).map((_, index) => (
                          <rect key={index} x={iso.x - 17 + index * 9} y={iso.y + 19} width="7" height="3" rx="1.5" fill="#c9a9e8" />
                        ))}
                      </g>
                    ) : null}
                    {(enemy.exposedUntilMs ?? 0) > state.worldTimeMs ? (
                      <path
                        className="state-exposure"
                        d={`M ${iso.x - 9} ${iso.y - 30} L ${iso.x - 4} ${iso.y - 34} M ${iso.x + 9} ${iso.y - 30} L ${iso.x + 4} ${iso.y - 34}`}
                        fill="none"
                        stroke="#f0b45c"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    ) : null}
                  </g>
                );
              })}

              {branchPoints.suppression >= 1 ? (
                <g className="drone-marker" transform={`translate(${heroIso.x + 20} ${heroIso.y - 31})`} filter="url(#actor-shadow)">
                  <path d="M -8 0 L 0 -7 L 8 0 L 0 7 Z" fill="#3d5552" stroke="#8ec7c0" strokeWidth="2" />
                  <circle cx="0" cy="0" r="2.5" fill="#d4f2ed" />
                </g>
              ) : null}

              <g className="hero-marker" aria-label="Главный герой" filter="url(#actor-shadow)">
                <ellipse cx={heroIso.x} cy={heroIso.y + 7} rx="17" ry="7" fill="#11140f" opacity="0.68" />
                {/*
                  Герой отличается от жителей не яркостью, а снаряжённостью: он
                  единственный на этаже, кто собран в дорогу. Отсюда рюкзак,
                  ремни и капюшон поверх того же человеческого силуэта.
                  Цвет остаётся сигналом состояния: тревожный оттенок на низком
                  здоровье виден раньше, чем игрок прочитает полосу ОЗ.
                */}
                {(() => {
                  const hurt = state.hero.hp <= Math.ceil(heroMaxHp / 3);
                  const edge = hurt ? "#e2856d" : "#f2dc9c";
                  const cloth = hurt ? "#4a2f2a" : "#3b3f2f";
                  return (
                    <g transform={`translate(${heroIso.x} ${heroIso.y + 6})`}>
                      <rect x="-12" y="-20" width="8" height="12" rx="1.5" fill={cloth} stroke={edge} strokeWidth="1.6" />
                      <path d={SILHOUETTE_HUMAN} fill={cloth} stroke={edge} strokeWidth="2.4" strokeLinejoin="round" />
                      <path d="M -6 -16 L 6 -16" fill="none" stroke={edge} strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M -5.5 -23 Q 0 -32 5.5 -23 Z" fill={cloth} stroke={edge} strokeWidth="2.2" strokeLinejoin="round" />
                    </g>
                  );
                })()}
              </g>
            </svg>

            {/*
              Накладки лежат по углам кадра тонким слоем. Мир — главное
              изображение: интерфейс не отрезает от него колонку и не
              превращается в приборную панель.
            */}
            <div className="hud-locale">
              <strong>{map.name}</strong>
              <span>{formattedWorldTime(state)}</span>
              {hermeticSafe ? <i className="locale-flag safe">ГЕРМОКОНТУР</i> : null}
              {samosborAlarm ? (
                <i className={`locale-flag alarm phase-${samosborPhase}`}>{`САМОСБОР · ${samosborPhaseLabel(samosborPhase)}`}</i>
              ) : null}
              {hud.threats > 0 ? <i className="locale-flag threat">{`УГРОЗ: ${hud.threats}`}</i> : null}
            </div>

            <div className="hud-objective">
              <span>ЗАДАНИЕ</span>
              <strong>{hud.objective.title}</strong>
            </div>

            {/*
              Мини-карта — часть игрового кадра, а не отдельный компонент,
              перечитывающий сохранение: раньше она жила своей жизнью и
              показывала состояние с задержкой.
            */}
            <div className="hud-minimap" aria-label="Мини-карта">
              <div className="minimap-head"><span>СЕКТОР</span><kbd>M</kbd></div>
              <div className="minimap-grid" style={{ gridTemplateColumns: `repeat(${minimap.width}, 1fr)` }}>
                {minimap.cells.map((cell) => (
                  <i key={`${cell.x}:${cell.y}`} className={minimapClass(cell)} />
                ))}
              </div>
            </div>

            {inspected ? (
              <div className="hud-inspect">
                <InspectCardView card={inspected} />
              </div>
            ) : null}

            {/*
              Панель тестовых сборок. Только для разработки: в production
              import.meta.env.DEV === false и панель не рендерится вовсе,
              поэтому dev-инструмент не может попасть в игру.
            */}
            {import.meta.env.DEV ? (
              <div className="dev-profiles" aria-label="Тестовые сборки (разработка)">
                <span>DEV · сборка</span>
                <select
                  value=""
                  onChange={(event) => {
                    const profile = devProfileById(event.target.value);
                    if (profile) setState((current) => applyDevProfile(current, profile));
                  }}
                >
                  <option value="">выбрать…</option>
                  {DEV_PROFILES.map((profile) => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))}
                </select>
                <span>встреча</span>
                <select
                  value=""
                  onChange={(event) => {
                    const id = event.target.value;
                    if (!id) return;
                    setState((current) => {
                      const hero = current.hero.positions[current.zone];
                      return spawnEncounter(current, id, { x: hero.x + 4, y: hero.y });
                    });
                  }}
                >
                  <option value="">выбрать…</option>
                  {ENCOUNTERS.map((encounter) => (
                    <option key={encounter.id} value={encounter.id}>{encounter.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {state.missionComplete ? (
              <div className="mission-complete" role="status">
                <span>ДИРЕКТИВА ВЫПОЛНЕНА</span>
                <strong>Смена 556 закрыта</strong>
                <button type="button" onClick={resetGame}>Начать заново</button>
              </div>
            ) : null}
          </div>

        </div>

        {/*
          Журнал боя остаётся: механики SAMOSBOR без него не читаются. Но он
          вторичен — последние строки тают у нижнего края и не претендуют на
          место мира. Полный журнал открывается по нажатию.
        */}
        <div className={`hud-log ${logExpanded ? "expanded" : ""}`} aria-live="polite">
          <button type="button" className="log-toggle" onClick={() => setLogExpanded((open) => !open)}>
            {logExpanded ? "СВЕРНУТЬ ЖУРНАЛ" : "ЖУРНАЛ"}
          </button>
          <ol>
            {(logExpanded ? state.log : hud.log).map((item, index) => (
              <li key={`${item}-${index}`} style={{ opacity: logExpanded ? 1 : Math.max(0.28, 1 - index * 0.19) }}>{item}</li>
            ))}
          </ol>
        </div>

        {/*
          Нижняя панель — единственное плотное место интерфейса. Слева сфера
          здоровья, справа сфера ресурса направления, между ними ровно то, чем
          игрок управляет: мышь, перемещение, способности и расходники.
        */}
        <section className="hud-dock" aria-label="Панель управления">
          <div className="dock-orb orb-health" style={{ "--fill": `${hud.health.share * 100}%` } as CSSProperties}>
            <strong>{hud.health.value}</strong>
            <small>{hud.health.max}</small>
          </div>

          <div className="dock-column dock-quick" aria-label="Быстрые ячейки">
            {hud.quick.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`dock-cell quick-cell ${slot.ready ? "" : "unavailable"}`}
                onClick={() => quickSlotNow(slot.id)}
                disabled={!slot.ready}
                onPointerEnter={() => setInspected(inspectQuickSlot(state, slot.id))}
                onPointerLeave={() => setInspected(null)}
              >
                <kbd>{slot.binding}</kbd>
                <span className="cell-glyph">{slot.id === "q" ? "✚" : "⚡"}</span>
                <b className="cell-charges">{slot.charges}</b>
                {slot.cooldownShare > 0 ? <i className="cell-cooldown" style={{ height: `${slot.cooldownShare * 100}%` }} /> : null}
              </button>
            ))}
          </div>

          <div className="dock-column dock-controls" aria-label="Мышь и перемещение">
            {hud.slots.map((slot) => (
              <div
                key={slot.slot}
                className={`dock-cell control-cell ${slot.transformed ? "transformed" : ""} ${slot.disabled ? "unavailable" : ""}`}
                onPointerEnter={() => setInspected(inspectHeroSlot(state, slot.slot))}
                onPointerLeave={() => setInspected(null)}
              >
                <kbd>{slot.binding}</kbd>
                <strong>{slot.name}</strong>
                <small>{slot.detail}</small>
                {slot.cooldownShare > 0 ? <i className="cell-cooldown" style={{ height: `${slot.cooldownShare * 100}%` }} /> : null}
                {slot.chargeShare > 0 ? <i className="cell-charge" style={{ width: `${slot.chargeShare * 100}%` }} /> : null}
                {slot.transformed ? <em className="cell-mark" title="Действие заменено сборкой">◆</em> : null}
              </div>
            ))}
          </div>

          <div className="dock-column dock-abilities" aria-label="Способности">
            {hud.abilities.map((slot) => (
              <button
                key={slot.index}
                type="button"
                className={`dock-cell ability-cell ${slot.empty ? "empty" : ""} ${slot.ready ? "" : "unavailable"}`}
                onClick={() => activateAbilitySlot(slot.index)}
                disabled={!slot.ready}
                onPointerEnter={() => setInspected(abilityCardFor(slot.index))}
                onPointerLeave={() => setInspected(null)}
              >
                <kbd>{slot.binding}</kbd>
                <strong>{slot.name}</strong>
                <small>{slot.detail}</small>
                {slot.cooldownShare > 0 ? <i className="cell-cooldown" style={{ height: `${slot.cooldownShare * 100}%` }} /> : null}
              </button>
            ))}
          </div>

          {/*
            Правая сфера показывает ресурс ведущего направления, а пока сборка
            пуста — дыхание. Приборной доски из шести шкал здесь не будет: на
            экране только то, чем игрок платит прямо сейчас.
          */}
          <div
            className={`dock-orb orb-resource ${hud.resource.warning ? "warning" : ""}`}
            style={{ "--fill": `${(hud.resource.visible ? hud.resource.share : hud.breath.share) * 100}%` } as CSSProperties}
            title={hud.resource.visible ? hud.resource.name : hud.breath.label}
          >
            <strong>{hud.resource.visible ? hud.resource.value : hud.breath.value}</strong>
            <small>{hud.resource.visible ? hud.resource.name : "дых."}</small>
          </div>

          <div className="dock-bars">
            <div className={`dock-bar bar-stance ${hud.stance.note ? "warn" : ""}`} title={`Стойка ${hud.stance.value} / ${hud.stance.max}`}>
              <i style={{ width: `${hud.stance.share * 100}%` }} />
            </div>
            {/*
              Дыхание показывается, только когда сборка им платит: заменённый
              талантом Shift перестаёт его тратить, и полоса уходит с экрана.
            */}
            {hud.breath.relevant ? (
              <div className={`dock-bar bar-breath ${hud.breath.active ? "draining" : ""}`} title={`Дыхание ${hud.breath.value} / ${hud.breath.max}`}>
                <i style={{ width: `${hud.breath.share * 100}%` }} />
              </div>
            ) : null}
            <div className="dock-bar bar-xp" title={`Опыт ${hud.experience.value} / ${hud.experience.max}`}>
              <i style={{ width: `${hud.experience.share * 100}%` }} />
            </div>
          </div>
        </section>

        <nav className="hud-screens" aria-label="Экраны">
          <button type="button" onClick={() => setActivePanel("character")} title="Персонаж"><kbd>C</kbd><span>Персонаж</span></button>
          <button type="button" onClick={() => setActivePanel("inventory")} title="Инвентарь"><kbd>I</kbd><span>Инвентарь</span></button>
          <button type="button" onClick={() => setActivePanel("talents")} title="Таланты"><kbd>T</kbd><span>Таланты</span>{state.hero.generalPoints + state.hero.skillPoints > 0 ? <em>{state.hero.generalPoints + state.hero.skillPoints}</em> : null}</button>
          <button type="button" onClick={() => setActivePanel("map")} title="Карта"><kbd>M</kbd><span>Карта</span></button>
        </nav>
      </section>

      {/*
        Персонаж и сумка — один экран. Игрок не должен прыгать между окнами,
        чтобы увидеть героя и предмет: слева комплект и лист, справа сумка.
        Клавиши C и I ведут в один и тот же экран, отличается только фокус.
      */}
      {characterOpen || inventoryOpen ? (
        <div className="screen-overlay" role="dialog" aria-modal="false" aria-label="Персонаж и снаряжение">
          <div className="screen-window">
            <header className="screen-header">
              <div className="screen-title">
                <span>ЛИЧНОЕ ДЕЛО · СБ/556-04</span>
                <h2>{classTitle}</h2>
              </div>
              <nav className="screen-tabs">
                <button type="button" className="active">Персонаж</button>
                <button type="button" onClick={() => setActivePanel("talents")}>Таланты<kbd>T</kbd></button>
                <button type="button" onClick={() => setActivePanel("map")}>Карта<kbd>M</kbd></button>
              </nav>
              <button type="button" className="screen-close" onClick={() => setActivePanel(null)} aria-label="Закрыть">✕</button>
            </header>

            <div className="sheet-layout">
              {/* --- Левая колонка: кто это и что на нём надето ------------- */}
              <section className="sheet-left">
                <div className="doll-frame">
                  <div className="doll-column">
                    {(["head", "body", "hands", "feet"] as GearSlot[]).map((slot) => renderGearSlot(slot))}
                  </div>
                  <div className="doll-figure">
                    {/*
                      Фигура — тот же снаряжённый обходчик, что и в мире:
                      капюшон, ремни, рюкзак. Контурная, а не залитая: это
                      схема снаряжения, а не портрет.
                    */}
                    <svg viewBox="0 0 120 220" aria-hidden="true">
                      <ellipse cx="60" cy="206" rx="30" ry="8" fill="#0d0f0b" opacity="0.7" />
                      <g fill="none" stroke="#8d9680" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
                        <path d="M 60 30 Q 46 32 46 46 L 46 56 Q 60 64 74 56 L 74 46 Q 74 32 60 30 Z" />
                        <path d="M 60 22 Q 44 24 43 42" strokeWidth="2.2" stroke="#a8b298" />
                        <path d="M 60 22 Q 76 24 77 42" strokeWidth="2.2" stroke="#a8b298" />
                        <path d="M 46 60 L 38 74 L 34 128 L 44 128 L 46 96" />
                        <path d="M 74 60 L 82 74 L 86 128 L 76 128 L 74 96" />
                        <rect x="45" y="60" width="30" height="66" rx="4" />
                        <path d="M 45 88 L 75 88" stroke="#c9a45a" strokeWidth="2.4" />
                        <path d="M 50 96 L 50 104 M 70 96 L 70 104" stroke="#c9a45a" strokeWidth="1.4" />
                        <path d="M 48 126 L 46 176 L 44 196 L 56 196 L 58 150" />
                        <path d="M 72 126 L 74 176 L 76 196 L 64 196 L 62 150" />
                        <path d="M 78 62 L 90 68 L 92 104 L 80 100 Z" stroke="#6f7a66" />
                      </g>
                    </svg>
                    <div className="doll-vitals">
                      <span><small>ОЗ</small><strong>{hud.health.value} / {hud.health.max}</strong></span>
                      <span><small>Уровень</small><strong>{state.hero.level}</strong></span>
                    </div>
                  </div>
                  <div className="doll-column">
                    {(["weapon", "offhand", "back", "artifact"] as GearSlot[]).map((slot) => renderGearSlot(slot))}
                  </div>
                </div>

                {/*
                  Руки показываются отдельно и всегда: пара — не сумма двух
                  предметов, а способ работы. Двуручное занимает оба слота
                  явно, а не молча блокирует второй.
                */}
                <div className={`hands-panel ${hands.twoHanded ? "two-handed" : ""}`}>
                  <div className="hands-row">
                    <div className="hand-side">
                      <small>ПРАВАЯ РУКА</small>
                      <strong>{hands.primary?.name ?? "пусто"}</strong>
                      <em>{hands.primary?.detail ?? "—"}</em>
                    </div>
                    <div className="hand-link">{hands.twoHanded ? "⟷" : "+"}</div>
                    <div className="hand-side">
                      <small>ЛЕВАЯ РУКА</small>
                      <strong>{hands.twoHanded ? "занята двуручным" : hands.secondary?.name ?? "свободна"}</strong>
                      <em>{hands.twoHanded ? "оба слота на одном оружии" : hands.secondary?.detail ?? "слот простаивает"}</em>
                    </div>
                  </div>
                  <div className="hands-result">
                    <span>СОЧЕТАНИЕ</span>
                    <strong>{hands.combination.name}</strong>
                    <p>{hands.combination.summary}</p>
                  </div>
                </div>

                {/*
                  Режим управления — свойство сборки, а не боевая кнопка: на
                  HUD ему места нет, но и выкидывать работающую механику
                  нельзя. Переключатель живёт здесь, рядом с характеристиками.
                */}
                <div className="control-mode-row">
                  <div>
                    <small>РЕЖИМ УПРАВЛЕНИЯ</small>
                    <strong>{controlModeFor(state) === "manual" ? "Ручной" : "Автоконтур"}</strong>
                  </div>
                  <button type="button" onClick={cycleControlMode}>переключить</button>
                </div>

                <div className="attribute-strip">
                  {attributeLines(state).map((line) => (
                    <span key={line.label}><small>{line.label}</small><strong>{line.value}</strong></span>
                  ))}
                  {state.hero.attributePoints > 0 ? <em>{state.hero.attributePoints} очк.</em> : null}
                </div>
              </section>

              {/* --- Средняя колонка: лист персонажа ------------------------ */}
              <section className="sheet-stats">
                {characterGroups(state).map((group) => (
                  <div key={group.id} className={`stat-group group-${group.id}`}>
                    <h4>{group.title}</h4>
                    <dl>
                      {group.lines.map((line, index) => (
                        <div key={`${line.label}-${index}`}>
                          <dt>{line.label}</dt>
                          <dd>{line.value}{line.note ? <i>{line.note}</i> : null}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </section>

              {/* --- Правая колонка: сумка --------------------------------- */}
              <section className="sheet-bag">
                <div className="bag-head">
                  <span>СУМКА</span>
                  <strong className={carriedWeight > weightLimit ? "overloaded" : ""}>
                    {carriedWeight.toFixed(1)} / {weightLimit.toFixed(0)} кг
                  </strong>
                </div>
                <div className="carry-meter"><i style={{ width: `${Math.min(100, (carriedWeight / weightLimit) * 100)}%` }} /></div>
                <div className="bag-grid">
                  {sortedInventory.map((entry) => {
                    const item = ITEMS[entry.itemId];
                    const equipped = Object.values(state.hero.equipment).includes(entry.instanceId);
                    return (
                      <button
                        key={entry.instanceId}
                        type="button"
                        className={`bag-cell rarity-${item.rarity ?? "common"} ${equipped ? "equipped" : ""}`}
                        onClick={() => setState((current) => (item.slot
                          ? equipItem(current, entry.instanceId)
                          : item.kind === "consumable" ? consumeInventoryItem(current, entry.instanceId) : current))}
                        onPointerEnter={() => inspectItemNow(entry.itemId, entry.quantity, entry.condition)}
                        onPointerLeave={() => clearInspect()}
                      >
                        <span className="bag-glyph">{itemGlyph(entry)}</span>
                        {entry.quantity > 1 ? <b>{entry.quantity}</b> : null}
                        {equipped ? <i className="bag-equipped" title="Надето" /> : null}
                      </button>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 40 - sortedInventory.length) }).map((_, index) => (
                    <span key={`empty-${index}`} className="bag-cell empty" />
                  ))}
                </div>
                <p className="bag-hint">ЛКМ по предмету — надеть или применить. Наведение — свойства и сравнение.</p>
              </section>

              {/* --- Сравнение: то, ради чего вообще открывают сумку -------- */}
              <aside className="sheet-inspect">
                {inspected ? <InspectCardView card={inspected} /> : (
                  <div className="inspect-idle">
                    <span>ОСМОТР</span>
                    <p>Наведите на предмет, чтобы увидеть его свойства, сравнение с надетым и то, как изменится связка рук.</p>
                  </div>
                )}
                {comparison ? (
                  <div className="comparison-card">
                    <header>
                      <span>СРАВНЕНИЕ</span>
                      <strong>{comparison.currentName ?? "пустой слот"} → {comparison.candidateName}</strong>
                    </header>
                    {comparison.combination ? (
                      <div className={`comparison-combination ${comparison.combination.from === comparison.combination.to ? "unchanged" : ""}`}>
                        <small>СОЧЕТАНИЕ РУК</small>
                        {comparison.combination.from === comparison.combination.to ? (
                          <p><b>{comparison.combination.to}</b> — не меняется</p>
                        ) : (
                          <p><s>{comparison.combination.from}</s> <i>→</i> <b>{comparison.combination.to}</b></p>
                        )}
                        <em>{comparison.combination.note}</em>
                      </div>
                    ) : null}
                    <table>
                      <tbody>
                        {comparison.rows.map((row) => (
                          <tr key={row.label} className={row.direction > 0 ? "better" : row.direction < 0 ? "worse" : ""}>
                            <th>{row.label}</th>
                            <td>{row.current}</td>
                            <td className="arrow">→</td>
                            <td>{row.candidate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {/*
        Дерево талантов: ОДНО дерево с шестью направлениями, а не выбор класса.
        Ядро в центре, лучи расходятся от него, между соседними лучами стоят
        гибридные узлы, физически связанные с обоими направлениями. Перемычки
        нарисованы отдельным цветом: именно они делают дерево одним.
      */}
      {/*
        Карта: план текущего этажа и вертикальная сводка кластера. Раньше
        навигация по этажам жила полосой поверх боевого экрана и отъедала у
        мира верхнюю кромку — теперь у неё собственный экран.
      */}
      {mapOpen ? (
        <div className="screen-overlay" role="dialog" aria-modal="false" aria-label="Карта">
          <div className="screen-window">
            <header className="screen-header">
              <div className="screen-title">
                <span>НАВИГАЦИЯ · ГИГАХРУЩЁВКА</span>
                <h2>{map.name}</h2>
              </div>
              <nav className="screen-tabs">
                <button type="button" onClick={() => setActivePanel("character")}>Персонаж<kbd>C</kbd></button>
                <button type="button" onClick={() => setActivePanel("talents")}>Таланты<kbd>T</kbd></button>
                <button type="button" className="active">Карта</button>
              </nav>
              <button type="button" className="screen-close" onClick={() => setActivePanel(null)} aria-label="Закрыть">✕</button>
            </header>

            <div className="map-layout">
              <aside className="map-side">
                <div className="map-plate">
                  <span>ТЕКУЩИЙ СЕКТОР</span>
                  <strong>{map.name}</strong>
                  <p>{map.subtitle}</p>
                </div>
                <div className="map-plate">
                  <span>ЗАДАНИЕ</span>
                  <strong>{hud.objective.title}</strong>
                </div>
                <ul className="map-legend">
                  <li><i className="mm mm-hero" /> герой</li>
                  <li><i className="mm mm-enemy" /> противник</li>
                  <li><i className="mm mm-npc" /> житель</li>
                  <li><i className="mm mm-loot" /> добыча</li>
                  <li><i className="mm mm-link" /> переход</li>
                  <li><i className="mm mm-dark" /> не разведано</li>
                </ul>
              </aside>

              <div className="map-plan">
                <div
                  className="plan-grid"
                  style={{
                    gridTemplateColumns: `repeat(${floorPlan.width}, 1fr)`,
                    aspectRatio: `${floorPlan.width} / ${Math.max(1, Math.ceil(floorPlan.cells.length / Math.max(1, floorPlan.width)))}`,
                  }}
                >
                  {floorPlan.cells.map((cell) => (
                    <i key={`${cell.x}:${cell.y}`} className={minimapClass(cell)} title={`${cell.x}:${cell.y}`} />
                  ))}
                </div>
              </div>

              <aside className="map-cluster">
                <div className="cluster-head"><span>КЛАСТЕР</span><small>{cluster.nodes.filter((node) => node.discovered).length} / {cluster.nodes.length} открыто</small></div>
                <ul className="cluster-list">
                  {cluster.nodes.map((node) => (
                    <li key={node.id} className={`cluster-node ${node.current ? "current" : ""} ${node.discovered ? "" : "unknown"} kind-${node.kind}`}>
                      <div>
                        <strong>{node.discovered ? node.label : "Сектор не разведан"}</strong>
                        <small>
                          {node.current
                            ? "вы здесь"
                            : node.communication
                              ? `связь: ${COMMUNICATION_LABELS[node.communication]}`
                              : "нет узла перемещения"}
                        </small>
                      </div>
                      {node.travelNodeId ? (
                        <button
                          type="button"
                          disabled={!node.travelAvailable || node.current}
                          title={node.travelReason}
                          onClick={() => setState((current) => commandFastTravel(current, node.travelNodeId!))}
                        >
                          {node.current ? "здесь" : "перейти"}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="tree-note">
                  Быстрое перемещение работает только между разведанными узлами
                  с исправной связью. Мир продолжает жить, пока карта открыта.
                </p>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {talentsOpen && tree ? (
        <div className="screen-overlay" role="dialog" aria-modal="false" aria-label="Дерево талантов">
          <div className="screen-window">
            <header className="screen-header">
              <div className="screen-title">
                <span>ОБЩЕЕ ДЕРЕВО · КЛАССОВ НЕТ</span>
                <h2>Таланты</h2>
              </div>
              <nav className="screen-tabs">
                <button type="button" onClick={() => setActivePanel("character")}>Персонаж<kbd>C</kbd></button>
                <button type="button" className="active">Таланты</button>
                <button type="button" onClick={() => setActivePanel("map")}>Карта<kbd>M</kbd></button>
              </nav>
              <button type="button" className="screen-close" onClick={() => setActivePanel(null)} aria-label="Закрыть">✕</button>
            </header>

            <div className="tree-layout">
              <aside className="tree-directions">
                <div className="points-plate">
                  <span>ОЧКИ</span>
                  <strong>{state.hero.generalPoints + state.hero.skillPoints}</strong>
                  <small>{state.hero.talents.length} узлов освоено</small>
                </div>
                <ul className="direction-list">
                  {(Object.keys(DIRECTION_ANGLES) as SkillBranch[]).map((branch) => (
                    <li key={branch} className={`direction-row dir-${branch}`}>
                      <i />
                      <span>{SKILL_NAMES[branch]}</span>
                      <strong>{branchPoints[branch] ?? 0}</strong>
                    </li>
                  ))}
                </ul>
                <p className="tree-note">
                  Архетип не выбирается: он читается по тому, куда вложено больше очков.
                  Перемычки между направлениями открывают гибридные узлы.
                </p>
              </aside>

              <div className="tree-canvas">
                <svg viewBox={`0 0 ${tree.size} ${tree.size}`} role="img" aria-label="Дерево талантов">
                  <defs>
                    <radialGradient id="tree-core-glow">
                      <stop offset="0%" stopColor="rgba(240, 212, 137, 0.22)" />
                      <stop offset="100%" stopColor="rgba(240, 212, 137, 0)" />
                    </radialGradient>
                  </defs>
                  <circle cx={tree.size / 2} cy={tree.size / 2} r={230} fill="url(#tree-core-glow)" />
                  <circle cx={tree.size / 2} cy={tree.size / 2} r={34} fill="#1b1e16" stroke="#c9a45a" strokeWidth="2" />
                  <text x={tree.size / 2} y={tree.size / 2 + 5} textAnchor="middle" className="tree-core-mark">✶</text>

                  {tree.links.map((edge) => (
                    <line
                      key={edge.id}
                      className={`tree-link ${edge.active ? "active" : ""} ${edge.cross ? "cross" : ""}`}
                      x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                    />
                  ))}

                  {(Object.keys(DIRECTION_ANGLES) as SkillBranch[]).map((branch) => {
                    const angle = (DIRECTION_ANGLES[branch] * Math.PI) / 180;
                    const x = tree.size / 2 + Math.cos(angle) * 476;
                    const y = tree.size / 2 + Math.sin(angle) * 476;
                    return (
                      <text key={branch} x={x} y={y} textAnchor="middle" className={`tree-direction-label dir-${branch}`}>
                        {SKILL_NAMES[branch].toUpperCase()}
                      </text>
                    );
                  })}

                  {tree.nodes.map((node) => (
                    <g
                      key={node.id}
                      className={`tree-node scope-${node.scope} ${node.branch ? `dir-${node.branch}` : ""} ${node.taken ? "taken" : node.available ? "available" : "locked"} ${selectedTalentId === node.id ? "selected" : ""} ${node.keystone ? "keystone" : ""} ${node.transforms ? "transforms" : ""}`}
                      onClick={() => setSelectedTalentId(node.id)}
                      onPointerEnter={() => setInspected(inspectTalentNode(state, node.id))}
                      onPointerLeave={() => setInspected(null)}
                      role="button"
                      aria-label={node.discovered ? node.name : "Неизвестный протокол"}
                    >
                      {node.keystone ? (
                        <rect x={node.x - 15} y={node.y - 15} width="30" height="30" transform={`rotate(45 ${node.x} ${node.y})`} />
                      ) : (
                        <circle cx={node.x} cy={node.y} r={node.scope === "hybrid" ? 13 : node.scope === "legendary" ? 14 : node.tier >= 3 ? 12 : 10} />
                      )}
                      {node.transforms ? <text x={node.x} y={node.y + 4} textAnchor="middle" className="node-mark">◆</text> : null}
                      {node.keystone ? <text x={node.x} y={node.y + 4} textAnchor="middle" className="node-mark">✶</text> : null}
                    </g>
                  ))}
                </svg>
              </div>

              <aside className="tree-inspector">
                {selectedTalent ? (() => {
                  const card = inspectTalentNode(state, selectedTalent.id);
                  const active = state.hero.talents.includes(selectedTalent.id);
                  const available = canAllocateTalent(state, selectedTalent.id);
                  return (
                    <>
                      {card ? <InspectCardView card={card} /> : null}
                      <button
                        type="button"
                        className={`learn-node ${active ? "learned" : ""}`}
                        disabled={!available}
                        onClick={() => setState((current) => allocateTalent(current, selectedTalent.id))}
                      >
                        {active ? "Освоено" : available ? `Освоить за ${selectedTalent.cost}` : "Недостаточный допуск"}
                      </button>
                    </>
                  );
                })() : <div className="inspect-idle"><span>УЗЕЛ</span><p>Выберите узел дерева.</p></div>}

                {/*
                  Модель простая: дерево открывает способность, здесь она
                  становится известной, а панель 1 · 2 · 3 определяет, что из
                  известного лежит под рукой.
                */}
                <section className="abilities-panel">
                  <div className="abilities-head">
                    <span>ОСВОЕННЫЕ СПОСОБНОСТИ</span>
                    <strong>{abilities.length}</strong>
                  </div>
                  {abilities.length ? (
                    <ul className="abilities-list">
                      {abilities.map((ability) => (
                        <li
                          key={ability.id}
                          className={ability.equippedSlot !== null ? "equipped" : ""}
                          onPointerEnter={() => setInspected(inspectAbility({
                            name: ability.name,
                            binding: ability.equippedSlot !== null ? `${ability.equippedSlot + 1}` : "не назначена",
                            description: ACTIVE_SKILLS[ability.id].description,
                            targeting: "выбранная цель",
                            cooldownMs: ability.cooldownMs,
                          }))}
                          onPointerLeave={() => setInspected(null)}
                        >
                          <div><strong>{ability.name}</strong><small>{ability.branch}</small></div>
                          <div className="ability-assign">
                            {[0, 1, 2].map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                className={ability.equippedSlot === slot ? "active" : ""}
                                onClick={() => setState((current) => assignActiveSkill(
                                  current,
                                  slot,
                                  ability.equippedSlot === slot ? null : ability.id,
                                ))}
                              >
                                {slot + 1}
                              </button>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="abilities-empty">Способности открываются вложениями в направления.</p>}
                </section>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

    </main>
  );
}
