import * as base from "./game-engine-base.ts";
import { completeMainStoryBeat } from "./game-main-story.ts";

export type LowerSettlementArcId =
  | "542-third-circuit"
  | "542-borrowed-heat"
  | "542-defense"
  | "539-no-list"
  | "539-borrowed-documents"
  | "539-last-official"
  | "536-range-reserve"
  | "536-parts-below"
  | "536-caravan-defense";

export type LowerSettlementArcStatus = "locked" | "available" | "active" | "completed" | "failed";
export type LowerSettlementArcOutcome = "full" | "partial" | "failed" | null;
export type LowerSettlementId = "heat542" | "city539" | "artel536";

export type LowerSettlementArcDefinition = {
  id: LowerSettlementArcId;
  settlementId: LowerSettlementId;
  title: string;
  summary: string;
  stages: string[];
  choices?: string[];
  dynamic: boolean;
};

export type LowerSettlementArcProgress = {
  status: LowerSettlementArcStatus;
  stageIndex: number;
  choice: string | null;
  outcome: LowerSettlementArcOutcome;
  startedAtMs: number;
  completedAtMs: number;
};

export type LowerExcellentRewardContract = {
  id: string;
  settlementId: Exclude<LowerSettlementId, "city539">;
  quality: "excellent";
  selectionAuthority: "claude";
  poolId: string;
  itemId: null;
  grantedAtMs: number;
};

export type LowerSettlementStoryState = {
  version: 1;
  arcs: Record<LowerSettlementArcId, LowerSettlementArcProgress>;
  facts: string[];
  excellentRewards: LowerExcellentRewardContract[];
};

export const LOWER_SETTLEMENT_ARCS: Record<LowerSettlementArcId, LowerSettlementArcDefinition> = {
  "542-third-circuit": {
    id: "542-third-circuit",
    settlementId: "heat542",
    title: "Третий контур",
    summary: "Стабилизировать третий теплообменный контур, от которого зависит всё малое поселение.",
    stages: ["Диагностика", "Поиск клапана", "Очистка коллектора", "Перезапуск"],
    choices: ["repair", "bypass", "city_supply"],
    dynamic: false,
  },
  "542-borrowed-heat": {
    id: "542-borrowed-heat",
    settlementId: "heat542",
    title: "Чужое тепло",
    summary: "Выяснить, почему тепло приходит на пост по линии, в документах предназначенной другому потребителю.",
    stages: ["Снять показания", "Проследить магистраль", "Найти старую ведомость", "Решить судьбу подключения"],
    choices: ["keep_hidden", "register", "share"],
    dynamic: false,
  },
  "542-defense": {
    id: "542-defense",
    settlementId: "heat542",
    title: "Паровой заслон",
    summary: "Удержать гермоблок Теплового поста во время прорыва существ из затопленного коллектора.",
    stages: ["Предупреждение", "Подготовка", "Прорыв", "Гермодверь", "Итоги"],
    dynamic: true,
  },
  "539-no-list": {
    id: "539-no-list",
    settlementId: "city539",
    title: "Нас нет в списках",
    summary: "Проверить, как крупный город существует без официального номера и снабжения.",
    stages: ["Совет города", "Сверка реестров", "Внешний канал снабжения", "Городская запись"],
    choices: ["stay_hidden", "seek_recognition", "parallel_registry"],
    dynamic: false,
  },
  "539-borrowed-documents": {
    id: "539-borrowed-documents",
    settlementId: "city539",
    title: "Чужие документы",
    summary: "Проследить документы исчезнувших городов, которыми жители 539-го поддерживают доступ к ресурсам.",
    stages: ["Проверить печати", "Архив 541", "Караванная цепочка", "Источник документов"],
    choices: ["preserve_scheme", "replace_documents", "expose_chain"],
    dynamic: false,
  },
  "539-last-official": {
    id: "539-last-official",
    settlementId: "city539",
    title: "Последний официальный человек",
    summary: "Разобраться с человеком, который единственный всё ещё числится представителем несуществующего города.",
    stages: ["Найти запись", "Найти человека", "Проверить полномочия", "Передать или погасить статус"],
    choices: ["keep_authority", "council_authority", "void_authority"],
    dynamic: false,
  },
  "536-range-reserve": {
    id: "536-range-reserve",
    settlementId: "artel536",
    title: "Запас хода",
    summary: "Вернуть Моторной артели возможность обслуживать караваны дальше одного перехода.",
    stages: ["Осмотр станков", "Поиск подшипников", "Сборка привода", "Испытание каравана"],
    choices: ["caravan_priority", "settlement_priority", "shared_stock"],
    dynamic: false,
  },
  "536-parts-below": {
    id: "536-parts-below",
    settlementId: "artel536",
    title: "Детали снизу",
    summary: "Установить происхождение слишком новых деталей, которые поднимают с нижних неучтённых линий.",
    stages: ["Осмотреть деталь", "Сверить маркировку", "Спуститься к грузовому узлу", "Решить, продолжать ли поставки"],
    choices: ["continue", "quarantine", "trace_source"],
    dynamic: false,
  },
  "536-caravan-defense": {
    id: "536-caravan-defense",
    settlementId: "artel536",
    title: "Моторная смена",
    summary: "Защитить артель и караванный ремонтный двор от налёта глубинной популяции.",
    stages: ["Сирена", "Баррикады", "Первая группа", "Цех", "Караванный выход", "Итоги"],
    dynamic: true,
  },
};

const ARC_IDS = Object.keys(LOWER_SETTLEMENT_ARCS) as LowerSettlementArcId[];

type LowerStoryHost = {
  zone: string;
  worldTimeMs: number;
  log: string[];
  hero: { level: number; xp: number; totalXp: number } & Record<string, unknown>;
  campaign?: { currentQuest?: string };
  visited?: Record<string, string[]>;
  mainStory?: { activeBeat?: string | null };
  lowerSettlementStory?: Partial<LowerSettlementStoryState>;
};

function createArcProgress(saved?: Partial<LowerSettlementArcProgress>): LowerSettlementArcProgress {
  return {
    status: saved?.status ?? "locked",
    stageIndex: Math.max(0, saved?.stageIndex ?? 0),
    choice: typeof saved?.choice === "string" ? saved.choice : null,
    outcome: saved?.outcome ?? null,
    startedAtMs: Math.max(0, saved?.startedAtMs ?? 0),
    completedAtMs: Math.max(0, saved?.completedAtMs ?? 0),
  };
}

export function createLowerSettlementStoryState(saved?: Partial<LowerSettlementStoryState>): LowerSettlementStoryState {
  return {
    version: 1,
    arcs: Object.fromEntries(ARC_IDS.map((id) => [id, createArcProgress(saved?.arcs?.[id])])) as Record<LowerSettlementArcId, LowerSettlementArcProgress>,
    facts: Array.isArray(saved?.facts) ? [...new Set(saved.facts.filter((entry) => typeof entry === "string"))] : [],
    excellentRewards: Array.isArray(saved?.excellentRewards)
      ? saved.excellentRewards.filter((reward) => reward && typeof reward === "object").map((reward) => ({ ...reward })) as LowerExcellentRewardContract[]
      : [],
  };
}

export function ensureLowerSettlementStoryState<T extends LowerStoryHost>(
  state: T,
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  return { ...state, lowerSettlementStory: createLowerSettlementStoryState(state.lowerSettlementStory) };
}

function appendLog<T extends LowerStoryHost>(state: T, message: string): T {
  return { ...state, log: [message, ...state.log].slice(0, 18) };
}

function discovered(state: LowerStoryHost, zone: string): boolean {
  return state.zone === zone || (state.visited?.[zone]?.length ?? 0) > 0;
}

export function tickLowerSettlementArcs<T extends LowerStoryHost>(
  state: T,
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  const next = ensureLowerSettlementStoryState(state);
  if (next.campaign?.currentQuest !== "complete") return next;
  const arcs = { ...next.lowerSettlementStory.arcs };
  if (discovered(next, "floor542")) {
    for (const id of ["542-third-circuit", "542-borrowed-heat", "542-defense"] as LowerSettlementArcId[]) {
      if (arcs[id].status === "locked") arcs[id] = { ...arcs[id], status: "available" };
    }
  }
  if (discovered(next, "floor539")) {
    if (arcs["539-no-list"].status === "locked") arcs["539-no-list"] = { ...arcs["539-no-list"], status: "available" };
    if (arcs["539-no-list"].status === "completed" && arcs["539-borrowed-documents"].status === "locked") {
      arcs["539-borrowed-documents"] = { ...arcs["539-borrowed-documents"], status: "available" };
    }
    if (arcs["539-borrowed-documents"].status === "completed" && arcs["539-last-official"].status === "locked") {
      arcs["539-last-official"] = { ...arcs["539-last-official"], status: "available" };
    }
  }
  if (discovered(next, "floor536")) {
    for (const id of ["536-range-reserve", "536-parts-below", "536-caravan-defense"] as LowerSettlementArcId[]) {
      if (arcs[id].status === "locked") arcs[id] = { ...arcs[id], status: "available" };
    }
  }
  return { ...next, lowerSettlementStory: { ...next.lowerSettlementStory, arcs } };
}

export function startLowerSettlementArc<T extends LowerStoryHost>(
  state: T,
  arcId: LowerSettlementArcId,
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  let next = tickLowerSettlementArcs(state);
  const progress = next.lowerSettlementStory.arcs[arcId];
  if (progress.status !== "available") return appendLog(next, `Арка «${LOWER_SETTLEMENT_ARCS[arcId].title}» сейчас недоступна.`);
  next = {
    ...next,
    lowerSettlementStory: {
      ...next.lowerSettlementStory,
      arcs: {
        ...next.lowerSettlementStory.arcs,
        [arcId]: { ...progress, status: "active", stageIndex: 0, startedAtMs: next.worldTimeMs },
      },
    },
  };
  return appendLog(next, `Начата арка: «${LOWER_SETTLEMENT_ARCS[arcId].title}».`);
}

export function chooseLowerSettlementArcOption<T extends LowerStoryHost>(
  state: T,
  arcId: LowerSettlementArcId,
  choice: string,
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  const next = ensureLowerSettlementStoryState(state);
  const definition = LOWER_SETTLEMENT_ARCS[arcId];
  const progress = next.lowerSettlementStory.arcs[arcId];
  if (progress.status !== "active") return appendLog(next, "Сначала нужно начать эту арку.");
  if (!definition.choices?.includes(choice)) return appendLog(next, "Такого решения в этой арке нет.");
  return {
    ...next,
    lowerSettlementStory: {
      ...next.lowerSettlementStory,
      arcs: { ...next.lowerSettlementStory.arcs, [arcId]: { ...progress, choice } },
    },
  };
}

export function advanceLowerSettlementArc<T extends LowerStoryHost>(
  state: T,
  arcId: LowerSettlementArcId,
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  const next = ensureLowerSettlementStoryState(state);
  const definition = LOWER_SETTLEMENT_ARCS[arcId];
  const progress = next.lowerSettlementStory.arcs[arcId];
  if (progress.status !== "active") return next;
  if (progress.stageIndex >= definition.stages.length - 1) return completeLowerSettlementArc(next, arcId, "full");
  return {
    ...next,
    lowerSettlementStory: {
      ...next.lowerSettlementStory,
      arcs: {
        ...next.lowerSettlementStory.arcs,
        [arcId]: { ...progress, stageIndex: progress.stageIndex + 1 },
      },
    },
  };
}

export function completeLowerSettlementArc<T extends LowerStoryHost>(
  state: T,
  arcId: LowerSettlementArcId,
  outcome: Exclude<LowerSettlementArcOutcome, null> = "full",
): T & { lowerSettlementStory: LowerSettlementStoryState } {
  let next = ensureLowerSettlementStoryState(state);
  const definition = LOWER_SETTLEMENT_ARCS[arcId];
  const progress = next.lowerSettlementStory.arcs[arcId];
  if (["completed", "failed"].includes(progress.status)) return next;
  const facts = [...new Set([...next.lowerSettlementStory.facts, `${arcId}:${progress.choice ?? outcome}`])];
  let excellentRewards = next.lowerSettlementStory.excellentRewards;
  if (definition.dynamic && definition.settlementId !== "city539" && outcome !== "failed") {
    const xpRatio = outcome === "full" ? 0.65 : 0.4;
    const xp = Math.max(1, Math.round(base.xpRequiredForLevel(next.hero.level) * xpRatio));
    const rewarded = base.awardXp(next as unknown as base.GameState, xp) as unknown as T;
    next = ensureLowerSettlementStoryState(rewarded);
    excellentRewards = [
      ...next.lowerSettlementStory.excellentRewards,
      {
        id: `defense:${definition.settlementId}:${Math.round(next.worldTimeMs)}`,
        settlementId: definition.settlementId,
        quality: "excellent",
        selectionAuthority: "claude",
        poolId: `claude-defense-${definition.settlementId}`,
        itemId: null,
        grantedAtMs: next.worldTimeMs,
      },
    ];
    next = appendLog(next, `Оборона малого поселения: +${xp} опыта и право на предмет отличного качества от Claude.`);
  }
  next = {
    ...next,
    lowerSettlementStory: {
      ...next.lowerSettlementStory,
      facts,
      excellentRewards,
      arcs: {
        ...next.lowerSettlementStory.arcs,
        [arcId]: {
          ...progress,
          status: outcome === "failed" ? "failed" : "completed",
          stageIndex: definition.stages.length,
          outcome,
          completedAtMs: next.worldTimeMs,
        },
      },
    },
  };
  return appendLog(next, `Арка «${definition.title}» завершена: ${outcome}.`);
}

export function syncLowerSettlementArcsToMainStory<T extends LowerStoryHost>(state: T): T {
  const next = ensureLowerSettlementStoryState(state);
  const active = next.mainStory?.activeBeat;
  if (active === "MAIN-006" && next.lowerSettlementStory.arcs["539-no-list"].status === "completed") {
    return completeMainStoryBeat(next as never, "MAIN-006") as unknown as T;
  }
  if (active === "MAIN-007" && next.lowerSettlementStory.arcs["539-borrowed-documents"].status === "completed") {
    return completeMainStoryBeat(next as never, "MAIN-007") as unknown as T;
  }
  return next;
}
