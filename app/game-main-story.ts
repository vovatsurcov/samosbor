export const MAIN_STORY_SCHEMA_VERSION = 1 as const;
export const MAIN_STORY_CONTENT_VERSION = "1.0" as const;

export type MainStoryBeatId =
  | "MAIN-001"
  | "MAIN-002"
  | "MAIN-003"
  | "MAIN-004"
  | "MAIN-005"
  | "MAIN-006"
  | "MAIN-007"
  | "MAIN-008"
  | "MAIN-009"
  | "MAIN-010"
  | "MAIN-011"
  | "MAIN-012";

export type MainStoryStatus = "dormant" | "active" | "complete";
export type MainStoryRecipient = "city550_administration" | "liquidators" | "nii_archivists";
export type ProvisionalStoryFactId =
  | "zero_line_is_distributed_system"
  | "zero_line_predicts_samosbor"
  | "zero_line_uses_samosbor"
  | "zero_line_causes_structural_damage"
  | "zero_line_evacuates_selected_cities"
  | "inspector_k0_is_human"
  | "inspector_k0_is_machine"
  | "inspector_k0_is_role"
  | "inspector_k0_is_system_interface";

export type MainStoryBeatDefinition = {
  id: MainStoryBeatId;
  act: 1 | 2 | 3 | 4;
  title: string;
  summary: string;
  zoneHint: string;
  next: MainStoryBeatId | null;
  implementation: "runtime" | "lower-region" | "future";
};

export type MainStoryState = {
  schemaVersion: 1;
  contentVersion: string;
  status: MainStoryStatus;
  activeBeat: MainStoryBeatId | null;
  completedBeats: MainStoryBeatId[];
  startedAtMs: number;
  completedAtMs: number;
  evidence: string[];
  recipient: MainStoryRecipient | null;
  choices: Record<string, string>;
  facts: string[];
  provisionalFacts: Partial<Record<ProvisionalStoryFactId, "unknown" | "suggested" | "supported" | "rejected">>;
  migrationNotes: string[];
};

export const MAIN_STORY_BEATS: Record<MainStoryBeatId, MainStoryBeatDefinition> = {
  "MAIN-001": {
    id: "MAIN-001",
    act: 1,
    title: "Накладная на живых",
    summary: "Получить в Городе 545 фрагмент НЛ-507/0 и доставить его в архив Города 550.",
    zoneHint: "Город 545 → Город 550",
    next: "MAIN-002",
    implementation: "runtime",
  },
  "MAIN-002": {
    id: "MAIN-002",
    act: 1,
    title: "Три подтверждения",
    summary: "Проверить подлинность документа через городской архив, диспетчерскую лифтов и корпус ликвидаторов.",
    zoneHint: "Город 550",
    next: "MAIN-003",
    implementation: "runtime",
  },
  "MAIN-003": {
    id: "MAIN-003",
    act: 1,
    title: "Состав без машиниста",
    summary: "Перехватить автономный грузовой состав с гермоконтейнерами человеческого размера.",
    zoneHint: "межэтажная грузовая линия",
    next: "MAIN-004",
    implementation: "future",
  },
  "MAIN-004": {
    id: "MAIN-004",
    act: 1,
    title: "Кому принадлежит документ",
    summary: "Определить, кто первым получит полный доступ к Нулевой накладной.",
    zoneHint: "Город 550",
    next: "MAIN-005",
    implementation: "runtime",
  },
  "MAIN-005": {
    id: "MAIN-005",
    act: 2,
    title: "Город без номера",
    summary: "Найти крупный город, который существует физически, но отсутствует во всех действующих реестрах.",
    zoneHint: "этаж 539",
    next: "MAIN-006",
    implementation: "lower-region",
  },
  "MAIN-006": {
    id: "MAIN-006",
    act: 2,
    title: "Нас нет в списках",
    summary: "Понять, как Город 539 живёт без официального снабжения и почему его исключили из маршрутов.",
    zoneHint: "Город 539",
    next: "MAIN-007",
    implementation: "lower-region",
  },
  "MAIN-007": {
    id: "MAIN-007",
    act: 2,
    title: "Чужие документы",
    summary: "Проследить цепочку документов исчезнувших городов, которыми пользуются жители 539-го.",
    zoneHint: "Город 539 / ведомственный архив 541",
    next: "MAIN-008",
    implementation: "lower-region",
  },
  "MAIN-008": {
    id: "MAIN-008",
    act: 3,
    title: "Перепись мёртвых этажей",
    summary: "Собрать следы городов и поселений, которые уже были перемещены Нулевой линией.",
    zoneHint: "этажи 538–520",
    next: "MAIN-009",
    implementation: "future",
  },
  "MAIN-009": {
    id: "MAIN-009",
    act: 3,
    title: "Ревизор К-0",
    summary: "Пережить первую полноценную ревизию и понять, что К-0 способен менять не только документы, но и доступ к инфраструктуре.",
    zoneHint: "переменная локация",
    next: "MAIN-010",
    implementation: "future",
  },
  "MAIN-010": {
    id: "MAIN-010",
    act: 3,
    title: "Получатель 507",
    summary: "Собрать достаточную часть Нулевой накладной, чтобы установить конечный адрес маршрута.",
    zoneHint: "нижние этажи",
    next: "MAIN-011",
    implementation: "future",
  },
  "MAIN-011": {
    id: "MAIN-011",
    act: 4,
    title: "Последняя смена",
    summary: "Добраться до центрального распределительного контура и определить реальную цену работы Нулевой линии.",
    zoneHint: "519–507",
    next: "MAIN-012",
    implementation: "future",
  },
  "MAIN-012": {
    id: "MAIN-012",
    act: 4,
    title: "Нулевой договор",
    summary: "Принять финальное решение о распределительном контуре. Конкретные варианты и последствия остаются версионируемыми.",
    zoneHint: "этаж 507",
    next: null,
    implementation: "future",
  },
};

const BEAT_IDS = Object.keys(MAIN_STORY_BEATS) as MainStoryBeatId[];
const EVIDENCE_REQUIRED = ["city550_archive", "lift_dispatch", "liquidators"] as const;

type MainStoryHost = {
  zone: string;
  worldTimeMs: number;
  log: string[];
  campaign?: { currentQuest?: string; completedQuests?: string[] };
  settlementStory?: {
    arcs?: Record<string, { status?: string; outcome?: string | null }>;
    facts?: string[];
  };
  visited?: Record<string, string[]>;
  mainStory?: Partial<MainStoryState>;
};

function isBeatId(value: unknown): value is MainStoryBeatId {
  return typeof value === "string" && BEAT_IDS.includes(value as MainStoryBeatId);
}

export function createMainStoryState(saved?: Partial<MainStoryState>): MainStoryState {
  const completedBeats = Array.isArray(saved?.completedBeats)
    ? [...new Set(saved.completedBeats.filter(isBeatId))]
    : [];
  const activeBeat = isBeatId(saved?.activeBeat) && !completedBeats.includes(saved.activeBeat)
    ? saved.activeBeat
    : null;
  const status: MainStoryStatus = saved?.status === "complete"
    ? "complete"
    : activeBeat
      ? "active"
      : "dormant";
  return {
    schemaVersion: 1,
    contentVersion: typeof saved?.contentVersion === "string" ? saved.contentVersion : MAIN_STORY_CONTENT_VERSION,
    status,
    activeBeat,
    completedBeats,
    startedAtMs: Math.max(0, saved?.startedAtMs ?? 0),
    completedAtMs: Math.max(0, saved?.completedAtMs ?? 0),
    evidence: Array.isArray(saved?.evidence) ? [...new Set(saved.evidence.filter((entry) => typeof entry === "string"))] : [],
    recipient: ["city550_administration", "liquidators", "nii_archivists"].includes(saved?.recipient ?? "")
      ? saved?.recipient as MainStoryRecipient
      : null,
    choices: saved?.choices && typeof saved.choices === "object" ? { ...saved.choices } : {},
    facts: Array.isArray(saved?.facts) ? [...new Set(saved.facts.filter((entry) => typeof entry === "string"))] : [],
    provisionalFacts: saved?.provisionalFacts && typeof saved.provisionalFacts === "object"
      ? { ...saved.provisionalFacts }
      : {},
    migrationNotes: Array.isArray(saved?.migrationNotes)
      ? [...new Set(saved.migrationNotes.filter((entry) => typeof entry === "string"))]
      : [],
  };
}

export function ensureMainStoryState<T extends MainStoryHost>(state: T): T & { mainStory: MainStoryState } {
  return { ...state, mainStory: createMainStoryState(state.mainStory) };
}

function appendStoryLog<T extends MainStoryHost>(state: T, message: string): T {
  return { ...state, log: [message, ...state.log].slice(0, 18) };
}

function starterComplete(state: MainStoryHost): boolean {
  return state.campaign?.currentQuest === "complete" || Boolean(state.campaign?.completedQuests?.includes("START-007"));
}

function dryLineComplete(state: MainStoryHost): boolean {
  return state.settlementStory?.arcs?.["545-dry-line"]?.status === "completed";
}

function city539Discovered(state: MainStoryHost): boolean {
  return state.zone === "floor539" || (state.visited?.floor539?.length ?? 0) > 0;
}

function activateBeat<T extends MainStoryHost>(
  state: T,
  beatId: MainStoryBeatId,
): T & { mainStory: MainStoryState } {
  const next = ensureMainStoryState(state);
  if (next.mainStory.status === "complete") return next;
  return appendStoryLog(
    {
      ...next,
      mainStory: {
        ...next.mainStory,
        status: "active",
        activeBeat: beatId,
        startedAtMs: next.mainStory.startedAtMs || Math.max(1, next.worldTimeMs),
      },
    },
    `Основная линия: ${beatId} «${MAIN_STORY_BEATS[beatId].title}».`,
  );
}

export function completeMainStoryBeat<T extends MainStoryHost>(
  state: T,
  beatId: MainStoryBeatId,
): T & { mainStory: MainStoryState } {
  let next = ensureMainStoryState(state);
  if (next.mainStory.activeBeat !== beatId || next.mainStory.completedBeats.includes(beatId)) return next;
  const definition = MAIN_STORY_BEATS[beatId];
  const completedBeats = [...next.mainStory.completedBeats, beatId];
  const finalBeat = definition.next == null;
  next = {
    ...next,
    mainStory: {
      ...next.mainStory,
      status: finalBeat ? "complete" : "active",
      activeBeat: finalBeat ? null : definition.next,
      completedBeats,
      completedAtMs: finalBeat ? Math.max(1, next.worldTimeMs) : next.mainStory.completedAtMs,
    },
  };
  next = appendStoryLog(next, `Завершено: ${beatId} «${definition.title}».`);
  if (!finalBeat && definition.next) {
    next = appendStoryLog(next, `Открыто: ${definition.next} «${MAIN_STORY_BEATS[definition.next].title}».`);
  }
  return next;
}

export function recordMainStoryEvidence<T extends MainStoryHost>(
  state: T,
  source: "city550_archive" | "lift_dispatch" | "liquidators",
): T & { mainStory: MainStoryState } {
  let next = ensureMainStoryState(state);
  if (next.mainStory.activeBeat !== "MAIN-002") return next;
  next = {
    ...next,
    mainStory: { ...next.mainStory, evidence: [...new Set([...next.mainStory.evidence, source])] },
  };
  const complete = EVIDENCE_REQUIRED.every((entry) => next.mainStory.evidence.includes(entry));
  return complete ? completeMainStoryBeat(next, "MAIN-002") : appendStoryLog(next, `MAIN-002: подтверждение получено: ${source}.`);
}

export function chooseMainStoryRecipient<T extends MainStoryHost>(
  state: T,
  recipient: MainStoryRecipient,
): T & { mainStory: MainStoryState } {
  let next = ensureMainStoryState(state);
  if (next.mainStory.activeBeat !== "MAIN-004") return appendStoryLog(next, "Решение о получателе документа сейчас недоступно.");
  next = {
    ...next,
    mainStory: {
      ...next.mainStory,
      recipient,
      choices: { ...next.mainStory.choices, "MAIN-004:recipient": recipient },
    },
  };
  return completeMainStoryBeat(next, "MAIN-004");
}

export function setProvisionalStoryFact<T extends MainStoryHost>(
  state: T,
  factId: ProvisionalStoryFactId,
  value: "unknown" | "suggested" | "supported" | "rejected",
): T & { mainStory: MainStoryState } {
  const next = ensureMainStoryState(state);
  return {
    ...next,
    mainStory: {
      ...next.mainStory,
      provisionalFacts: { ...next.mainStory.provisionalFacts, [factId]: value },
    },
  };
}

export function tickMainStory<T extends MainStoryHost>(state: T): T & { mainStory: MainStoryState } {
  let next = ensureMainStoryState(state);
  if (next.mainStory.status === "dormant" && starterComplete(next) && dryLineComplete(next)) {
    next = activateBeat(next, "MAIN-001");
  }
  if (next.mainStory.activeBeat === "MAIN-001" && next.zone === "floor554") {
    next = completeMainStoryBeat(next, "MAIN-001");
  }
  if (next.mainStory.activeBeat === "MAIN-005" && city539Discovered(next)) {
    next = completeMainStoryBeat(next, "MAIN-005");
  }
  return next;
}

export function mainStoryObjective(state: MainStoryHost): string | null {
  const story = createMainStoryState(state.mainStory);
  if (story.status === "dormant" || story.status === "complete" || !story.activeBeat) return null;
  const beat = MAIN_STORY_BEATS[story.activeBeat];
  if (story.activeBeat === "MAIN-002") {
    return `${beat.id} · ${beat.title}: подтверждения ${story.evidence.filter((entry) => EVIDENCE_REQUIRED.includes(entry as typeof EVIDENCE_REQUIRED[number])).length}/3`;
  }
  return `${beat.id} · ${beat.title}: ${beat.summary}`;
}

export function migrateMainStoryContent<T extends MainStoryHost>(
  state: T,
  targetContentVersion = MAIN_STORY_CONTENT_VERSION,
): T & { mainStory: MainStoryState } {
  const next = ensureMainStoryState(state);
  if (next.mainStory.contentVersion === targetContentVersion) return next;
  return {
    ...next,
    mainStory: {
      ...next.mainStory,
      contentVersion: targetContentVersion,
      migrationNotes: [...next.mainStory.migrationNotes, `story-content:${next.mainStory.contentVersion}->${targetContentVersion}`],
    },
  };
}
