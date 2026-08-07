import {
  commandDefensePreparation,
  grantDefenseVictoryRewards,
  recordDefenseWaveVictory,
  startDefenseEvent,
  type SettlementId,
} from "./game-world-systems.ts";

export type SettlementArcId =
  | "550-city-memory"
  | "550-liquidator-shifts"
  | "550-price-of-silence"
  | "550-district-load"
  | "545-dry-line"
  | "545-city-holds-pressure"
  | "545-lower-workshop"
  | "545-caravan-debt"
  | "545-hermetic-awake";

export type SettlementArcStatus = "locked" | "available" | "active" | "completed" | "failed";
export type SettlementArcOutcome = "full" | "partial" | "failed" | null;
export type City545DefensePriority = "upper_gate" | "production" | "hermetic" | "communications";
export type NamedNpcCondition = "alive" | "injured" | "evacuated" | "dead";

export type SettlementArcDefinition = {
  id: SettlementArcId;
  settlementId: SettlementId;
  title: string;
  summary: string;
  stages: string[];
  choices?: string[];
  dynamic?: boolean;
};

export type SettlementArcProgress = {
  status: SettlementArcStatus;
  stageIndex: number;
  choice: string | null;
  startedAtMs: number;
  completedAtMs: number;
  outcome: SettlementArcOutcome;
};

export type NamedNpcStoryState = {
  condition: NamedNpcCondition;
  causeMissionId: string | null;
};

export type SettlementStoryState = {
  version: 1;
  arcs: Record<SettlementArcId, SettlementArcProgress>;
  facts: string[];
  defense545Priorities: City545DefensePriority[];
  casualtyPermissions: string[];
  namedNpcStates: Record<string, NamedNpcStoryState>;
};

export const SETTLEMENT_ARCS: Record<SettlementArcId, SettlementArcDefinition> = {
  "550-city-memory": {
    id: "550-city-memory",
    settlementId: "city550",
    title: "Городская память",
    summary: "Вернуть официальный статус районам, которые существуют физически, но исчезли из схем.",
    stages: ["Найти расхождение", "Проверить жителей", "Восстановить цепочку документов", "Принять решение"],
    choices: ["restore", "conceal", "independent"],
  },
  "550-liquidator-shifts": {
    id: "550-liquidator-shifts",
    settlementId: "city550",
    title: "Три смены ликвидаторов",
    summary: "Определить, как город распределит ликвидаторов между гарнизоном и внешними операциями.",
    stages: ["Опросить три смены", "Проверить внешние посты", "Провести учение", "Утвердить модель"],
    choices: ["garrison", "mobile", "mixed"],
  },
  "550-price-of-silence": {
    id: "550-price-of-silence",
    settlementId: "city550",
    title: "Цена тишины",
    summary: "Решить, сколько информации об угрозах должен знать город.",
    stages: ["Собрать сведения", "Оценить риск паники", "Совет служб", "Опубликовать решение"],
    choices: ["publish", "limited", "secret"],
  },
  "550-district-load": {
    id: "550-district-load",
    settlementId: "city550",
    title: "Квартал под нагрузкой",
    summary: "Распределить дефицитную энергию между жильём, мастерскими и транспортом.",
    stages: ["Диагностика сети", "Поиск резерва", "Переключение нагрузки", "Стабилизация"],
    choices: ["housing", "workshops", "lifts", "restore_generator"],
  },
  "545-dry-line": {
    id: "545-dry-line",
    settlementId: "city545",
    title: "Сухая линия",
    summary: "Восстановить насосы, собрать архив НИИ-547 и отключить Смотрителя ГУ-46.",
    stages: ["Насосы 548", "Архив НИИ-547", "Смотритель ГУ-46", "Доклад администрации"],
  },
  "545-city-holds-pressure": {
    id: "545-city-holds-pressure",
    settlementId: "city545",
    title: "Город держит давление",
    summary: "Подготовить оба яруса Города 545 и пережить многоэтапную атаку.",
    stages: ["Предупреждение", "Подготовка", "Верхняя волна", "Нижняя волна", "Давление", "Итоги"],
    dynamic: true,
  },
  "545-lower-workshop": {
    id: "545-lower-workshop",
    settlementId: "city545",
    title: "Нижняя мастерская",
    summary: "Выбрать производственный приоритет нижнего яруса.",
    stages: ["Оценить мощности", "Собрать дефицит", "Испытать линию", "Утвердить серию"],
    choices: ["armor", "weapons", "lift_parts", "hermetic_doors"],
  },
  "545-caravan-debt": {
    id: "545-caravan-debt",
    settlementId: "city545",
    title: "Караванный долг",
    summary: "Разобраться с долгами малых поселений и исчезающими грузами.",
    stages: ["Сверить ведомости", "Найти пропавший груз", "Поговорить с должниками", "Закрепить договор"],
    choices: ["collect", "investigate", "labor", "defense_network"],
  },
  "545-hermetic-awake": {
    id: "545-hermetic-awake",
    settlementId: "city545",
    title: "Гермоконтур не спит",
    summary: "Исследовать самопроизвольные закрытия и изменения внутренних маршрутов.",
    stages: ["Зафиксировать закрытия", "Проверить старые шкафы", "Пройти изменённый маршрут", "Изолировать причину"],
    choices: ["isolate", "observe", "integrate"],
  },
};

const ARC_IDS = Object.keys(SETTLEMENT_ARCS) as SettlementArcId[];
const DESIGNATED_NPC_CASUALTY_MISSIONS = new Set<string>(["DEF-545"]);

type DefenseView = {
  status: string;
  wave: number;
  totalWaves: number;
  preparedness: number;
  heroContribution: number;
  rewardClaimed: boolean;
};

type SettlementStoryHost = {
  zone: string;
  worldTimeMs: number;
  log: string[];
  campaign?: { currentQuest?: string; completedQuests?: string[] };
  visited?: Record<string, string[]>;
  regionProgress?: { questStage?: string; bossDefeated?: boolean; servicesRestored?: boolean };
  worldSystems: {
    defense: Record<string, DefenseView>;
    excellentRewards: unknown[];
  } & Record<string, unknown>;
  settlementStory?: Partial<SettlementStoryState>;
};

function createArcProgress(saved?: Partial<SettlementArcProgress>): SettlementArcProgress {
  return {
    status: saved?.status ?? "locked",
    stageIndex: Math.max(0, saved?.stageIndex ?? 0),
    choice: typeof saved?.choice === "string" ? saved.choice : null,
    startedAtMs: Math.max(0, saved?.startedAtMs ?? 0),
    completedAtMs: Math.max(0, saved?.completedAtMs ?? 0),
    outcome: saved?.outcome ?? null,
  };
}

export function createSettlementStoryState(saved?: Partial<SettlementStoryState>): SettlementStoryState {
  const arcs = Object.fromEntries(
    ARC_IDS.map((id) => [id, createArcProgress(saved?.arcs?.[id])]),
  ) as Record<SettlementArcId, SettlementArcProgress>;
  return {
    version: 1,
    arcs,
    facts: Array.isArray(saved?.facts) ? [...new Set(saved.facts.filter((entry) => typeof entry === "string"))] : [],
    defense545Priorities: Array.isArray(saved?.defense545Priorities)
      ? [...new Set(saved.defense545Priorities.filter((entry): entry is City545DefensePriority =>
          ["upper_gate", "production", "hermetic", "communications"].includes(entry as City545DefensePriority),
        ))].slice(0, 2)
      : [],
    casualtyPermissions: Array.isArray(saved?.casualtyPermissions)
      ? [...new Set(saved.casualtyPermissions.filter((entry) => typeof entry === "string"))]
      : [],
    namedNpcStates: saved?.namedNpcStates && typeof saved.namedNpcStates === "object"
      ? { ...saved.namedNpcStates }
      : {},
  };
}

export function ensureSettlementStoryState<T extends SettlementStoryHost>(
  state: T,
): T & { settlementStory: SettlementStoryState } {
  return { ...state, settlementStory: createSettlementStoryState(state.settlementStory) };
}

function appendStoryLog<T extends SettlementStoryHost>(state: T, message: string): T {
  return { ...state, log: [message, ...state.log].slice(0, 18) };
}

function starterComplete(state: SettlementStoryHost): boolean {
  return state.campaign?.currentQuest === "complete" || Boolean(state.campaign?.completedQuests?.includes("START-007"));
}

function city545Discovered(state: SettlementStoryHost): boolean {
  return ["floor545", "floor544"].includes(state.zone) ||
    (state.visited?.floor545?.length ?? 0) > 0 ||
    (state.visited?.floor544?.length ?? 0) > 0;
}

export function tickSettlementArcs<T extends SettlementStoryHost>(
  state: T,
): T & { settlementStory: SettlementStoryState } {
  let next = ensureSettlementStoryState(state);
  if (!starterComplete(next)) return next;

  const arcs = { ...next.settlementStory.arcs };
  for (const id of ["550-city-memory", "550-liquidator-shifts", "550-price-of-silence", "550-district-load"] as SettlementArcId[]) {
    if (arcs[id].status === "locked") arcs[id] = { ...arcs[id], status: "available" };
  }
  if (city545Discovered(next)) {
    for (const id of ["545-dry-line", "545-lower-workshop", "545-caravan-debt", "545-hermetic-awake"] as SettlementArcId[]) {
      if (arcs[id].status === "locked") arcs[id] = { ...arcs[id], status: "available" };
    }
  }
  if (next.regionProgress?.questStage === "complete") {
    arcs["545-dry-line"] = {
      ...arcs["545-dry-line"],
      status: "completed",
      stageIndex: SETTLEMENT_ARCS["545-dry-line"].stages.length,
      completedAtMs: arcs["545-dry-line"].completedAtMs || next.worldTimeMs,
      outcome: "full",
    };
  }
  return { ...next, settlementStory: { ...next.settlementStory, arcs } };
}

export function startSettlementArc<T extends SettlementStoryHost>(
  state: T,
  arcId: SettlementArcId,
): T & { settlementStory: SettlementStoryState } {
  let next = tickSettlementArcs(state);
  const progress = next.settlementStory.arcs[arcId];
  if (progress.status !== "available") return appendStoryLog(next, `Арка «${SETTLEMENT_ARCS[arcId].title}» сейчас недоступна.`);
  next = {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      arcs: {
        ...next.settlementStory.arcs,
        [arcId]: { ...progress, status: "active", stageIndex: 0, startedAtMs: next.worldTimeMs },
      },
    },
  };
  return appendStoryLog(next, `Начата городская арка: «${SETTLEMENT_ARCS[arcId].title}».`);
}

export function chooseSettlementArcOption<T extends SettlementStoryHost>(
  state: T,
  arcId: SettlementArcId,
  choice: string,
): T & { settlementStory: SettlementStoryState } {
  const next = ensureSettlementStoryState(state);
  const definition = SETTLEMENT_ARCS[arcId];
  const progress = next.settlementStory.arcs[arcId];
  if (progress.status !== "active") return appendStoryLog(next, "Сначала нужно начать эту арку.");
  if (!definition.choices?.includes(choice)) return appendStoryLog(next, "Такого решения в этой арке нет.");
  return appendStoryLog(
    {
      ...next,
      settlementStory: {
        ...next.settlementStory,
        arcs: { ...next.settlementStory.arcs, [arcId]: { ...progress, choice } },
      },
    },
    `Решение по арке «${definition.title}» зафиксировано: ${choice}.`,
  );
}

export function advanceSettlementArc<T extends SettlementStoryHost>(
  state: T,
  arcId: SettlementArcId,
): T & { settlementStory: SettlementStoryState } {
  const next = ensureSettlementStoryState(state);
  const definition = SETTLEMENT_ARCS[arcId];
  const progress = next.settlementStory.arcs[arcId];
  if (progress.status !== "active") return next;
  const finalStage = definition.stages.length - 1;
  if (progress.stageIndex >= finalStage) return completeSettlementArc(next, arcId, "full");
  return {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      arcs: {
        ...next.settlementStory.arcs,
        [arcId]: { ...progress, stageIndex: progress.stageIndex + 1 },
      },
    },
  };
}

export function completeSettlementArc<T extends SettlementStoryHost>(
  state: T,
  arcId: SettlementArcId,
  outcome: Exclude<SettlementArcOutcome, null> = "full",
): T & { settlementStory: SettlementStoryState } {
  let next = ensureSettlementStoryState(state);
  const definition = SETTLEMENT_ARCS[arcId];
  const progress = next.settlementStory.arcs[arcId];
  if (progress.status === "completed" || progress.status === "failed") return next;
  const fact = `${arcId}:${progress.choice ?? outcome}`;
  next = {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      facts: [...new Set([...next.settlementStory.facts, fact])],
      arcs: {
        ...next.settlementStory.arcs,
        [arcId]: {
          ...progress,
          status: outcome === "failed" ? "failed" : "completed",
          stageIndex: definition.stages.length,
          completedAtMs: next.worldTimeMs,
          outcome,
        },
      },
    },
  };
  return appendStoryLog(next, `Арка «${definition.title}» завершена: ${outcome}.`);
}

export function startCity545DefenseMission<T extends SettlementStoryHost>(
  state: T,
): T & { settlementStory: SettlementStoryState } {
  let next = tickSettlementArcs(state);
  const arcId: SettlementArcId = "545-city-holds-pressure";
  const progress = next.settlementStory.arcs[arcId];
  if (["active", "completed"].includes(progress.status)) return next;
  next = startDefenseEvent(next, "city545", "DEF-545", 16, 3) as T & { settlementStory: SettlementStoryState };
  next = ensureSettlementStoryState(next);
  next = {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      defense545Priorities: [],
      arcs: {
        ...next.settlementStory.arcs,
        [arcId]: { ...progress, status: "active", stageIndex: 0, startedAtMs: next.worldTimeMs },
      },
    },
  };
  return appendStoryLog(next, "DEF-545 «Город держит давление»: начато предупреждение и сбор городского совета.");
}

export function chooseCity545DefensePriorities<T extends SettlementStoryHost>(
  state: T,
  priorities: City545DefensePriority[],
): T & { settlementStory: SettlementStoryState } {
  const next = ensureSettlementStoryState(state);
  const unique = [...new Set(priorities)];
  if (unique.length !== 2) return appendStoryLog(next, "Для DEF-545 нужно выбрать ровно два главных городских приоритета.");
  if (unique.some((priority) => !["upper_gate", "production", "hermetic", "communications"].includes(priority))) {
    return appendStoryLog(next, "Получен неизвестный приоритет обороны.");
  }
  return appendStoryLog(
    {
      ...next,
      settlementStory: { ...next.settlementStory, defense545Priorities: unique },
    },
    `DEF-545: приоритеты обороны утверждены: ${unique.join(", ")}.`,
  );
}

export function prepareCity545Defense<T extends SettlementStoryHost>(
  state: T,
  action: "fortify" | "power" | "medical" | "recon",
): T & { settlementStory: SettlementStoryState } {
  const prepared = commandDefensePreparation(state, "city545", action) as T;
  const next = ensureSettlementStoryState(prepared);
  const arc = next.settlementStory.arcs["545-city-holds-pressure"];
  return {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      arcs: {
        ...next.settlementStory.arcs,
        "545-city-holds-pressure": { ...arc, stageIndex: Math.max(1, arc.stageIndex) },
      },
    },
  };
}

export function recordCity545DefenseWave<T extends SettlementStoryHost>(
  state: T,
  heroContribution = 2,
): T & { settlementStory: SettlementStoryState } {
  let next = recordDefenseWaveVictory(state, "city545", heroContribution) as T;
  next = ensureSettlementStoryState(next);
  const defense = next.worldSystems.defense.city545;
  const arc = next.settlementStory.arcs["545-city-holds-pressure"];
  const stageIndex = defense.status === "victory" ? 5 : Math.min(4, 1 + defense.wave);
  next = {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      arcs: { ...next.settlementStory.arcs, "545-city-holds-pressure": { ...arc, stageIndex } },
    },
  };
  if (defense.status !== "victory") return next;
  const full = defense.preparedness >= 8 && defense.heroContribution >= 6 && next.settlementStory.defense545Priorities.length === 2;
  return completeSettlementArc(next, "545-city-holds-pressure", full ? "full" : "partial");
}

export function claimCity545DefenseReward<T extends SettlementStoryHost>(state: T): T {
  return grantDefenseVictoryRewards(state, "city545") as T;
}

export function authorizeNamedNpcCasualty<T extends SettlementStoryHost>(
  state: T,
  missionId: string,
  npcId: string,
): T & { settlementStory: SettlementStoryState } {
  const next = ensureSettlementStoryState(state);
  if (!DESIGNATED_NPC_CASUALTY_MISSIONS.has(missionId)) {
    return appendStoryLog(next, "Именованный NPC защищён от случайной гибели вне обозначенной критической миссии.");
  }
  const permission = `${missionId}:${npcId}`;
  return {
    ...next,
    settlementStory: {
      ...next.settlementStory,
      casualtyPermissions: [...new Set([...next.settlementStory.casualtyPermissions, permission])],
    },
  };
}

export function applyNamedNpcCondition<T extends SettlementStoryHost>(
  state: T,
  missionId: string,
  npcId: string,
  condition: Exclude<NamedNpcCondition, "alive">,
): T & { settlementStory: SettlementStoryState } {
  const next = ensureSettlementStoryState(state);
  const permission = `${missionId}:${npcId}`;
  if (!next.settlementStory.casualtyPermissions.includes(permission)) {
    return appendStoryLog(next, `Изменение состояния ${npcId} отклонено: нет явного разрешения критической миссии.`);
  }
  return appendStoryLog(
    {
      ...next,
      settlementStory: {
        ...next.settlementStory,
        namedNpcStates: {
          ...next.settlementStory.namedNpcStates,
          [npcId]: { condition, causeMissionId: missionId },
        },
      },
    },
    `${npcId}: сюжетное состояние изменено на ${condition} в миссии ${missionId}.`,
  );
}
