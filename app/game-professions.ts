export type ProfessionDirectionId =
  | "infrastructure"
  | "expedition"
  | "support"
  | "field_technical";

export type ProfessionSpecializationId =
  | "electromechanic"
  | "hermetic_specialist"
  | "comms_specialist"
  | "scout_cartographer"
  | "field_medic"
  | "quartermaster"
  | "weaponsmith_armorer"
  | "anomalous_operator";

export type ProfessionState = {
  version: 1;
  pointsAvailable: number;
  pointsSpent: number;
  primaryDirection: ProfessionDirectionId | null;
  unlockedDirections: ProfessionDirectionId[];
  specializations: ProfessionSpecializationId[];
  trialPermit: ProfessionSpecializationId | null;
  trialUsed: boolean;
};

export type ProfessionSpecializationDefinition = {
  id: ProfessionSpecializationId;
  direction: ProfessionDirectionId;
  title: string;
  purpose: string;
  capabilities: string[];
};

export const PROFESSION_DIRECTIONS: Record<ProfessionDirectionId, { title: string; description: string }> = {
  infrastructure: {
    title: "Инфраструктурная служба",
    description: "Лифты, питание, насосы, гермоконтуры и стационарные системы поселений.",
  },
  expedition: {
    title: "Экспедиционная служба",
    description: "Связь, разведка, картография, маршруты и сопровождение экспедиций.",
  },
  support: {
    title: "Служба обеспечения",
    description: "Медицина, снабжение, караваны, склады и сохранение населения.",
  },
  field_technical: {
    title: "Техническая полевая служба",
    description: "Оружие, броня, аномальные системы и сложное оборудование вне городских мастерских.",
  },
};

export const PROFESSION_SPECIALIZATIONS: Record<ProfessionSpecializationId, ProfessionSpecializationDefinition> = {
  electromechanic: {
    id: "electromechanic",
    direction: "infrastructure",
    title: "Электромеханик",
    purpose: "Восстановление лифтов, приводов, насосов, генераторов и силовых шкафов.",
    capabilities: ["lift-field-repair", "power-routing", "pump-repair", "defense-power"],
  },
  hermetic_specialist: {
    id: "hermetic_specialist",
    direction: "infrastructure",
    title: "Специалист гермоконтуров",
    purpose: "Гермодвери, убежища, утечки и подготовка поселений к Самосбору.",
    capabilities: ["hermetic-repair", "shelter-fortification", "leak-diagnostics"],
  },
  comms_specialist: {
    id: "comms_specialist",
    direction: "expedition",
    title: "Связист",
    purpose: "Ретрансляторы, диагностика маршрутов и устойчивость межэтажной связи.",
    capabilities: ["relay-repair", "remote-diagnostics", "early-warning"],
  },
  scout_cartographer: {
    id: "scout_cartographer",
    direction: "expedition",
    title: "Разведчик-картограф",
    purpose: "Разведка территорий, безопасные маршруты, точки интереса и сопровождение караванов.",
    capabilities: ["fast-survey", "route-planning", "population-recon", "caravan-scout"],
  },
  field_medic: {
    id: "field_medic",
    direction: "support",
    title: "Полевой медик",
    purpose: "Травмы, эвакуация, медицинские посты и снижение потерь населения.",
    capabilities: ["trauma-stabilization", "defense-medical-post", "npc-rescue"],
  },
  quartermaster: {
    id: "quartermaster",
    direction: "support",
    title: "Квартирмейстер-логист",
    purpose: "Поставки, склады, караваны, нормы ресурсов и производственные приоритеты.",
    capabilities: ["supply-discount", "caravan-logistics", "warehouse-reserve"],
  },
  weaponsmith_armorer: {
    id: "weaponsmith_armorer",
    direction: "field_technical",
    title: "Оружейник-бронник",
    purpose: "Ремонт и модификация оружия, брони, турелей и оснащения гарнизонов.",
    capabilities: ["weapon-repair", "armor-repair", "defense-emplacement"],
  },
  anomalous_operator: {
    id: "anomalous_operator",
    direction: "field_technical",
    title: "Оператор аномальных систем",
    purpose: "Войд-узлы, артефакты, резонансные помехи и необычные источники энергии.",
    capabilities: ["void-stabilization", "resonance-diagnostics", "anomalous-routing"],
  },
};

type ProfessionHost = {
  log: string[];
  campaign?: { currentQuest?: string; completedQuests?: string[] };
  professions?: Partial<ProfessionState>;
};

export function createProfessionState(saved?: Partial<ProfessionState>): ProfessionState {
  const directions = Array.isArray(saved?.unlockedDirections)
    ? saved.unlockedDirections.filter((id): id is ProfessionDirectionId => id in PROFESSION_DIRECTIONS)
    : [];
  const specializations = Array.isArray(saved?.specializations)
    ? saved.specializations.filter((id): id is ProfessionSpecializationId => id in PROFESSION_SPECIALIZATIONS)
    : [];
  const primaryDirection = saved?.primaryDirection && saved.primaryDirection in PROFESSION_DIRECTIONS
    ? saved.primaryDirection
    : null;
  const trialPermit = saved?.trialPermit && saved.trialPermit in PROFESSION_SPECIALIZATIONS
    ? saved.trialPermit
    : null;
  return {
    version: 1,
    pointsAvailable: Math.max(0, saved?.pointsAvailable ?? 0),
    pointsSpent: Math.max(0, saved?.pointsSpent ?? 0),
    primaryDirection,
    unlockedDirections: [...new Set(primaryDirection ? [primaryDirection, ...directions] : directions)],
    specializations: [...new Set(specializations)],
    trialPermit,
    trialUsed: saved?.trialUsed ?? false,
  };
}

export function ensureProfessionState<T extends ProfessionHost>(state: T): T & { professions: ProfessionState } {
  return {
    ...state,
    professions: createProfessionState(state.professions),
  };
}

function appendProfessionLog<T extends ProfessionHost>(state: T, message: string): T {
  return { ...state, log: [message, ...state.log].slice(0, 18) };
}

export function grantTrialProfession<T extends ProfessionHost>(
  state: T,
  specializationId: ProfessionSpecializationId,
): T & { professions: ProfessionState } {
  const next = ensureProfessionState(state);
  if (next.professions.trialUsed) {
    return appendProfessionLog(next, "Пробный профессиональный допуск уже использован.");
  }
  const definition = PROFESSION_SPECIALIZATIONS[specializationId];
  return appendProfessionLog(
    {
      ...next,
      professions: { ...next.professions, trialPermit: specializationId, trialUsed: true },
    },
    `Выдан пробный допуск: ${definition.title}. Он действует до выбора основного направления.`,
  );
}

export function choosePrimaryProfession<T extends ProfessionHost>(
  state: T,
  directionId: ProfessionDirectionId,
): T & { professions: ProfessionState } {
  const next = ensureProfessionState(state);
  const starterComplete = next.campaign?.currentQuest === "complete" ||
    next.campaign?.completedQuests?.includes("START-007");
  if (!starterComplete) {
    return appendProfessionLog(next, "Основное профессиональное направление выбирается после стартовой аттестации.");
  }
  if (next.professions.primaryDirection) {
    return appendProfessionLog(next, "Основное профессиональное направление уже выбрано.");
  }
  return appendProfessionLog(
    {
      ...next,
      professions: {
        ...next.professions,
        primaryDirection: directionId,
        unlockedDirections: [...new Set([...next.professions.unlockedDirections, directionId])],
        trialPermit: null,
        pointsAvailable: next.professions.pointsAvailable + 1,
      },
    },
    `Основное направление: ${PROFESSION_DIRECTIONS[directionId].title}. Получено 1 профессиональное очко.`,
  );
}

export function unlockProfessionSpecialization<T extends ProfessionHost>(
  state: T,
  specializationId: ProfessionSpecializationId,
): T & { professions: ProfessionState } {
  const next = ensureProfessionState(state);
  if (next.professions.specializations.includes(specializationId)) return next;
  const definition = PROFESSION_SPECIALIZATIONS[specializationId];
  if (!next.professions.unlockedDirections.includes(definition.direction)) {
    return appendProfessionLog(next, "Эта специализация относится к ещё не открытому профессиональному направлению.");
  }
  if (next.professions.pointsAvailable <= 0) {
    return appendProfessionLog(next, "Нет свободных профессиональных очков.");
  }
  return appendProfessionLog(
    {
      ...next,
      professions: {
        ...next.professions,
        pointsAvailable: next.professions.pointsAvailable - 1,
        pointsSpent: next.professions.pointsSpent + 1,
        specializations: [...next.professions.specializations, specializationId],
      },
    },
    `Открыта специализация: ${definition.title}.`,
  );
}

export function hasProfessionSpecialization(
  state: ProfessionHost,
  specializationId: ProfessionSpecializationId,
): boolean {
  const professions = createProfessionState(state.professions);
  return professions.specializations.includes(specializationId) || professions.trialPermit === specializationId;
}

export function hasProfessionCapability(state: ProfessionHost, capability: string): boolean {
  const professions = createProfessionState(state.professions);
  const active = new Set<ProfessionSpecializationId>(professions.specializations);
  if (professions.trialPermit) active.add(professions.trialPermit);
  return [...active].some((id) => PROFESSION_SPECIALIZATIONS[id].capabilities.includes(capability));
}

export function professionSummary(state: ProfessionHost): string {
  const professions = createProfessionState(state.professions);
  if (!professions.primaryDirection) {
    return professions.trialPermit
      ? `Пробный допуск: ${PROFESSION_SPECIALIZATIONS[professions.trialPermit].title}`
      : "Профессиональное направление ещё не выбрано";
  }
  const names = professions.specializations.map((id) => PROFESSION_SPECIALIZATIONS[id].title);
  return `${PROFESSION_DIRECTIONS[professions.primaryDirection].title}${names.length ? ` · ${names.join(", ")}` : ""}`;
}
