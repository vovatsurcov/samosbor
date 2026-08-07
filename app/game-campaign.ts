import * as base from "./game-engine-base.ts";

export type StarterQuestId =
  | "START-001"
  | "START-002"
  | "START-003"
  | "START-004"
  | "START-005"
  | "START-006"
  | "START-007";

export type StarterApproach = "scout" | "caravan";

export type StarterCampaignState = {
  version: 1;
  currentQuest: StarterQuestId | "complete";
  completedQuests: StarterQuestId[];
  rewardedQuests: StarterQuestId[];
  dispatcherBriefed: boolean;
  cityServicesVisited: string[];
  approach: StarterApproach | null;
  completedAtMs: number;
};

export type StarterQuestDefinition = {
  id: StarterQuestId;
  title: string;
  zone: string;
  objective: string;
  next: StarterQuestId | "complete";
  xpRatio: number;
};

export const STARTER_QUESTS: Record<StarterQuestId, StarterQuestDefinition> = {
  "START-001": {
    id: "START-001",
    title: "Смена принята",
    zone: "floor556",
    objective: "Получить маршрут смены у диспетчера Орловой и осмотреть стартовый сектор",
    next: "START-002",
    xpRatio: 0.04,
  },
  "START-002": {
    id: "START-002",
    title: "Слепая зона",
    zone: "floor556",
    objective: "Найти датчик СБ-04, восстановить его и пережить первый бой",
    next: "START-003",
    // Базовый движок уже выдаёт опыт за восстановление датчика.
    xpRatio: 0,
  },
  "START-003": {
    id: "START-003",
    title: "После сирены",
    zone: "floor556",
    objective: "Добраться до гермоблока и завершить первую учебную смену",
    next: "START-004",
    // Базовый движок уже выдаёт крупную награду за завершение учебной операции.
    xpRatio: 0,
  },
  "START-004": {
    id: "START-004",
    title: "Первый маршрут",
    zone: "floor555",
    objective: "Пройти ремонтный пояс 555 и зарегистрироваться в Городе 550",
    next: "START-005",
    xpRatio: 0.18,
  },
  "START-005": {
    id: "START-005",
    title: "Город считает живых",
    zone: "floor554",
    objective: "Познакомиться минимум с тремя городскими службами и получить пробный профессиональный допуск",
    next: "START-006",
    xpRatio: 0.12,
  },
  "START-006": {
    id: "START-006",
    title: "Линия не отвечает",
    zone: "floor554",
    objective: "Разведать и восстановить хотя бы один внешний узел межэтажной связи",
    next: "START-007",
    xpRatio: 0.24,
  },
  "START-007": {
    id: "START-007",
    title: "Нижняя смена",
    zone: "floor545",
    objective: "Выбрать разведку или сопровождение каравана и добраться до Города 545",
    next: "complete",
    xpRatio: 0.32,
  },
};

type CommunicationView = Record<string, { status?: string; repairedBy?: string | null }>;

type CampaignHost = {
  zone: string;
  worldTimeMs: number;
  sensorFixed?: boolean;
  missionComplete?: boolean;
  hero: {
    level: number;
    xp: number;
    totalXp: number;
  } & Record<string, unknown>;
  log: string[];
  worldSystems?: {
    communications?: CommunicationView;
  };
  campaign?: Partial<StarterCampaignState>;
};

const QUEST_ORDER: StarterQuestId[] = [
  "START-001",
  "START-002",
  "START-003",
  "START-004",
  "START-005",
  "START-006",
  "START-007",
];

export function createStarterCampaign(saved?: Partial<StarterCampaignState>): StarterCampaignState {
  const completed = Array.isArray(saved?.completedQuests)
    ? saved.completedQuests.filter((id): id is StarterQuestId => QUEST_ORDER.includes(id as StarterQuestId))
    : [];
  const rewarded = Array.isArray(saved?.rewardedQuests)
    ? saved.rewardedQuests.filter((id): id is StarterQuestId => QUEST_ORDER.includes(id as StarterQuestId))
    : [];
  const inferredCurrent = completed.length >= QUEST_ORDER.length
    ? "complete"
    : QUEST_ORDER.find((id) => !completed.includes(id)) ?? "START-001";
  return {
    version: 1,
    currentQuest: saved?.currentQuest === "complete" || QUEST_ORDER.includes(saved?.currentQuest as StarterQuestId)
      ? saved.currentQuest as StarterQuestId | "complete"
      : inferredCurrent,
    completedQuests: [...new Set(completed)],
    rewardedQuests: [...new Set(rewarded)],
    dispatcherBriefed: saved?.dispatcherBriefed ?? false,
    cityServicesVisited: Array.isArray(saved?.cityServicesVisited)
      ? [...new Set(saved.cityServicesVisited.filter((entry) => typeof entry === "string"))]
      : [],
    approach: saved?.approach === "scout" || saved?.approach === "caravan" ? saved.approach : null,
    completedAtMs: Math.max(0, saved?.completedAtMs ?? 0),
  };
}

export function ensureStarterCampaign<T extends CampaignHost>(state: T): T & { campaign: StarterCampaignState } {
  return {
    ...state,
    campaign: createStarterCampaign(state.campaign),
  };
}

function appendCampaignLog<T extends CampaignHost>(state: T, message: string): T {
  return { ...state, log: [message, ...state.log].slice(0, 18) };
}

function awardQuestXp<T extends CampaignHost>(state: T, questId: StarterQuestId): T & { campaign: StarterCampaignState } {
  const campaign = createStarterCampaign(state.campaign);
  const definition = STARTER_QUESTS[questId];
  if (campaign.rewardedQuests.includes(questId) || definition.xpRatio <= 0) {
    return ensureStarterCampaign(state);
  }
  const xp = Math.max(1, Math.round(base.xpRequiredForLevel(state.hero.level) * definition.xpRatio));
  const rewarded = base.awardXp(state as unknown as base.GameState, xp) as unknown as T;
  const next = ensureStarterCampaign(rewarded);
  return appendCampaignLog(
    {
      ...next,
      campaign: {
        ...next.campaign,
        rewardedQuests: [...next.campaign.rewardedQuests, questId],
      },
    },
    `${definition.title}: +${xp} опыта.`,
  );
}

function completeQuest<T extends CampaignHost>(state: T, questId: StarterQuestId): T & { campaign: StarterCampaignState } {
  let ensured = ensureStarterCampaign(state);
  if (ensured.campaign.completedQuests.includes(questId)) return ensured;
  if (ensured.campaign.currentQuest !== questId) return ensured;

  const definition = STARTER_QUESTS[questId];
  ensured = {
    ...ensured,
    campaign: {
      ...ensured.campaign,
      currentQuest: definition.next,
      completedQuests: [...ensured.campaign.completedQuests, questId],
      completedAtMs: definition.next === "complete" ? ensured.worldTimeMs : ensured.campaign.completedAtMs,
    },
  };
  let next = awardQuestXp(ensured, questId) as T & { campaign: StarterCampaignState };
  next = appendCampaignLog(next, `Задание завершено: ${questId} «${definition.title}».`);
  return next;
}

export function recordDispatcherBriefing<T extends CampaignHost>(state: T): T & { campaign: StarterCampaignState } {
  let next = ensureStarterCampaign(state);
  next = {
    ...next,
    campaign: { ...next.campaign, dispatcherBriefed: true },
  };
  return completeQuest(next, "START-001");
}

export function recordCityServiceVisit<T extends CampaignHost>(
  state: T,
  service: string,
): T & { campaign: StarterCampaignState } {
  let next = ensureStarterCampaign(state);
  if (next.campaign.currentQuest !== "START-005") return next;
  const cityServicesVisited = [...new Set([...next.campaign.cityServicesVisited, service])];
  next = {
    ...next,
    campaign: { ...next.campaign, cityServicesVisited },
  };
  return cityServicesVisited.length >= 3 ? completeQuest(next, "START-005") : next;
}

export function chooseStarterApproach<T extends CampaignHost>(
  state: T,
  approach: StarterApproach,
): T & { campaign: StarterCampaignState } {
  const next = ensureStarterCampaign(state);
  if (next.campaign.currentQuest !== "START-007") {
    return appendCampaignLog(next, "Маршрут к Городу 545 ещё не выдан.");
  }
  return appendCampaignLog(
    {
      ...next,
      campaign: { ...next.campaign, approach },
    },
    approach === "scout"
      ? "Выбран путь разведчика: промышленный пояс будет пройден как разведывательная операция."
      : "Выбран путь каравана: герой идёт к Городу 545 вместе со снабженческой колонной.",
  );
}

function anyExternalCommunicationOnline(state: CampaignHost): boolean {
  const communications = state.worldSystems?.communications ?? {};
  return Object.entries(communications).some(
    ([id, communication]) => id !== "city550" && communication?.status === "online",
  );
}

export function tickStarterCampaign<T extends CampaignHost>(state: T): T & { campaign: StarterCampaignState } {
  let next = ensureStarterCampaign(state);
  if (next.campaign.currentQuest === "START-001" && next.campaign.dispatcherBriefed) {
    next = completeQuest(next, "START-001");
  }
  if (next.campaign.currentQuest === "START-002" && next.sensorFixed) {
    next = completeQuest(next, "START-002");
  }
  if (next.campaign.currentQuest === "START-003" && next.missionComplete) {
    next = completeQuest(next, "START-003");
  }
  if (next.campaign.currentQuest === "START-004" && next.zone === "floor554") {
    next = completeQuest(next, "START-004");
  }
  if (next.campaign.currentQuest === "START-006" && anyExternalCommunicationOnline(next)) {
    next = completeQuest(next, "START-006");
  }
  if (
    next.campaign.currentQuest === "START-007" &&
    next.campaign.approach &&
    (next.zone === "floor545" || next.zone === "floor544")
  ) {
    next = completeQuest(next, "START-007");
  }
  return next;
}

export function starterObjective(state: CampaignHost): string | null {
  const campaign = createStarterCampaign(state.campaign);
  if (campaign.currentQuest === "complete") return null;
  const quest = STARTER_QUESTS[campaign.currentQuest];
  if (campaign.currentQuest === "START-005") {
    return `${quest.id} · ${quest.title}: городские службы ${campaign.cityServicesVisited.length}/3`;
  }
  if (campaign.currentQuest === "START-007" && !campaign.approach) {
    return `${quest.id} · ${quest.title}: выбрать разведку промышленного пояса или сопровождение каравана`;
  }
  return `${quest.id} · ${quest.title}: ${quest.objective}`;
}

export function starterCampaignComplete(state: CampaignHost): boolean {
  return createStarterCampaign(state.campaign).currentQuest === "complete";
}
