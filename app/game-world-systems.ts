import * as base from "./game-engine-base.ts";
import {
  FLOOR_544_MAP,
  FLOOR_545_MAP,
  FLOOR_547_MAP,
  FLOOR_548_MAP,
} from "./game-region-map-544.ts";

export type TravelNodeId =
  | "city550"
  | "city545"
  | "technical556"
  | "archive547"
  | "traction549";

export type CommunicationStatus = "offline" | "unstable" | "online";
export type RepairMaterialId = "coilPart" | "repairKit" | "batteryPack" | "filterCartridge";
export type SettlementId = "city550" | "city545";
export type DefenseStatus = "idle" | "warning" | "active" | "victory" | "defeat";

export type ResourceBundle = Record<RepairMaterialId, number>;

export type CommunicationState = {
  status: CommunicationStatus;
  contributed: ResourceBundle;
  repairedBy: null | "hero" | "city";
};

export type DefenseEventState = {
  status: DefenseStatus;
  wave: number;
  totalWaves: number;
  threat: number;
  preparedness: number;
  heroContribution: number;
  startedAtMs: number;
  nextWaveAtMs: number;
  completedAtMs: number;
  rewardClaimed: boolean;
  missionId: string | null;
};

export type ExcellentRewardContract = {
  id: string;
  settlementId: SettlementId;
  quality: "excellent";
  poolId: string;
  selectionAuthority: "claude";
  itemId: null;
  grantedAtMs: number;
};

export type WorldSystemsState = {
  communications: Record<TravelNodeId, CommunicationState>;
  defense: Record<SettlementId, DefenseEventState>;
  excellentRewards: ExcellentRewardContract[];
};

export type TravelNodeSpec = {
  id: TravelNodeId;
  label: string;
  shortLabel: string;
  zone: string;
  position: base.Point;
  kind: "city" | "interest";
  cityId?: SettlementId;
};

export type GlobalMapNode = {
  id: string;
  label: string;
  floors: string[];
  kind: "city" | "floor" | "anomaly";
  discovered: boolean;
  current: boolean;
  communication: CommunicationStatus | null;
  travelNodeId: TravelNodeId | null;
  travelAvailable: boolean;
  travelReason: string;
  defenseStatus: DefenseStatus | null;
};

export type LocalMapCell = {
  x: number;
  y: number;
  tile: string;
  known: boolean;
  visible: boolean;
  hero: boolean;
  npc: boolean;
  enemy: boolean;
  loot: boolean;
};

export const EMPTY_RESOURCE_BUNDLE: ResourceBundle = {
  coilPart: 0,
  repairKit: 0,
  batteryPack: 0,
  filterCartridge: 0,
};

export const TRAVEL_NODES: Record<TravelNodeId, TravelNodeSpec> = {
  city550: {
    id: "city550",
    label: "Город 550 · Большой разлом",
    shortLabel: "Город 550",
    zone: "floor554",
    position: { x: 4, y: 32 },
    kind: "city",
    cityId: "city550",
  },
  city545: {
    id: "city545",
    label: "Город 545 · Сухой док",
    shortLabel: "Город 545",
    zone: "floor545",
    position: { x: 51, y: 31 },
    kind: "city",
    cityId: "city545",
  },
  technical556: {
    id: "technical556",
    label: "Технический пояс 556",
    shortLabel: "Пояс 556",
    zone: "floor556",
    position: { x: 2, y: 18 },
    kind: "interest",
  },
  archive547: {
    id: "archive547",
    label: "Архив НИИ-547",
    shortLabel: "НИИ-547",
    zone: "floor547",
    position: { x: 46, y: 31 },
    kind: "interest",
  },
  traction549: {
    id: "traction549",
    label: "Тяговая станция 549",
    shortLabel: "Станция 549",
    zone: "floor549",
    position: { x: 5, y: 31 },
    kind: "interest",
  },
};

export const COMMUNICATION_REQUIREMENTS: Record<TravelNodeId, ResourceBundle> = {
  city550: { coilPart: 0, repairKit: 0, batteryPack: 0, filterCartridge: 0 },
  city545: { coilPart: 8, repairKit: 2, batteryPack: 2, filterCartridge: 1 },
  technical556: { coilPart: 4, repairKit: 1, batteryPack: 1, filterCartridge: 0 },
  archive547: { coilPart: 6, repairKit: 2, batteryPack: 1, filterCartridge: 1 },
  traction549: { coilPart: 8, repairKit: 2, batteryPack: 2, filterCartridge: 1 },
};

const GLOBAL_NODE_SPECS = [
  { id: "floor557", label: "Жилой контур 557", floors: ["floor557"], kind: "floor" as const, travelNodeId: null },
  { id: "technical556", label: "Технический пояс 556", floors: ["floor556"], kind: "floor" as const, travelNodeId: "technical556" as const },
  { id: "floor555", label: "Ремонтный пояс 555", floors: ["floor555"], kind: "floor" as const, travelNodeId: null },
  { id: "city550", label: "Город 550 · уровни 554–551", floors: ["floor554"], kind: "city" as const, travelNodeId: "city550" as const },
  { id: "floor550", label: "Нижний выход 550", floors: ["floor550"], kind: "floor" as const, travelNodeId: null },
  { id: "traction549", label: "Кабельный пролёт 549", floors: ["floor549"], kind: "floor" as const, travelNodeId: "traction549" as const },
  { id: "floor548", label: "Насосный каскад 548", floors: ["floor548"], kind: "floor" as const, travelNodeId: null },
  { id: "archive547", label: "Архив НИИ-547", floors: ["floor547"], kind: "floor" as const, travelNodeId: "archive547" as const },
  { id: "floor546", label: "Грузовой узел ГУ-46", floors: ["floor546"], kind: "floor" as const, travelNodeId: null },
  { id: "city545", label: "Город 545 · уровни 545–544", floors: ["floor545", "floor544"], kind: "city" as const, travelNodeId: "city545" as const },
  { id: "voidLab", label: "Войд-зона ВЖ-7", floors: ["voidLab"], kind: "anomaly" as const, travelNodeId: null },
];

export const GLOBAL_MAP_CONNECTIONS: [string, string][] = [
  ["floor557", "technical556"],
  ["technical556", "floor555"],
  ["floor555", "city550"],
  ["city550", "floor550"],
  ["floor550", "traction549"],
  ["traction549", "floor548"],
  ["floor548", "archive547"],
  ["archive547", "floor546"],
  ["floor546", "city545"],
];

function copyBundle(source?: Partial<ResourceBundle>): ResourceBundle {
  return {
    coilPart: Math.max(0, source?.coilPart ?? 0),
    repairKit: Math.max(0, source?.repairKit ?? 0),
    batteryPack: Math.max(0, source?.batteryPack ?? 0),
    filterCartridge: Math.max(0, source?.filterCartridge ?? 0),
  };
}

function createCommunication(
  status: CommunicationStatus,
  saved?: Partial<CommunicationState>,
): CommunicationState {
  return {
    status: saved?.status ?? status,
    contributed: copyBundle(saved?.contributed),
    repairedBy: saved?.repairedBy ?? null,
  };
}

function createDefense(saved?: Partial<DefenseEventState>): DefenseEventState {
  return {
    status: saved?.status ?? "idle",
    wave: Math.max(0, saved?.wave ?? 0),
    totalWaves: Math.max(1, saved?.totalWaves ?? 3),
    threat: Math.max(0, saved?.threat ?? 0),
    preparedness: Math.max(0, saved?.preparedness ?? 0),
    heroContribution: Math.max(0, saved?.heroContribution ?? 0),
    startedAtMs: Math.max(0, saved?.startedAtMs ?? 0),
    nextWaveAtMs: Math.max(0, saved?.nextWaveAtMs ?? 0),
    completedAtMs: Math.max(0, saved?.completedAtMs ?? 0),
    rewardClaimed: saved?.rewardClaimed ?? false,
    missionId: saved?.missionId ?? null,
  };
}

export function createWorldSystemsState(saved?: Partial<WorldSystemsState>): WorldSystemsState {
  return {
    communications: {
      city550: createCommunication("online", saved?.communications?.city550),
      city545: createCommunication("unstable", saved?.communications?.city545),
      technical556: createCommunication("unstable", saved?.communications?.technical556),
      archive547: createCommunication("offline", saved?.communications?.archive547),
      traction549: createCommunication("offline", saved?.communications?.traction549),
    },
    defense: {
      city550: createDefense(saved?.defense?.city550),
      city545: createDefense(saved?.defense?.city545),
    },
    excellentRewards: Array.isArray(saved?.excellentRewards)
      ? saved.excellentRewards.map((reward) => ({ ...reward }))
      : [],
  };
}

export function ensureWorldSystemsState(state: any): any {
  return {
    ...state,
    worldSystems: createWorldSystemsState(state.worldSystems),
  };
}

function pointKey(point: base.Point): string {
  return `${Math.round(point.x)}:${Math.round(point.y)}`;
}

function cityForZone(zone: string): SettlementId | null {
  if (zone === "floor554") return "city550";
  if (zone === "floor545" || zone === "floor544") return "city545";
  return null;
}

export function travelNodeForZone(zone: string): TravelNodeId | null {
  if (zone === "floor554") return "city550";
  if (zone === "floor545" || zone === "floor544") return "city545";
  if (zone === "floor556") return "technical556";
  if (zone === "floor547") return "archive547";
  if (zone === "floor549") return "traction549";
  return null;
}

export function isTravelNodeDiscovered(state: any, nodeId: TravelNodeId): boolean {
  const node = TRAVEL_NODES[nodeId];
  if (nodeId === "city545") {
    return ["floor545", "floor544"].some(
      (zone) => state.zone === zone || (state.visited?.[zone]?.length ?? 0) > 0,
    );
  }
  return state.zone === node.zone || (state.visited?.[node.zone]?.length ?? 0) > 0;
}

function isAtTravelAccess(state: any, nodeId: TravelNodeId): boolean {
  const currentNode = travelNodeForZone(state.zone);
  if (currentNode !== nodeId) return false;
  if (TRAVEL_NODES[nodeId].kind === "city") return true;
  const hero = state.hero.positions[state.zone];
  const target = TRAVEL_NODES[nodeId].position;
  return Math.hypot(hero.x - target.x, hero.y - target.y) <= 3;
}

function hasActiveThreats(state: any): boolean {
  return state.enemies.some(
    (enemy: base.Enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      ["suspicious", "hunting", "combat"].includes(enemy.mode),
  );
}

export function communicationProgress(state: any, nodeId: TravelNodeId): {
  contributed: ResourceBundle;
  required: ResourceBundle;
  remaining: ResourceBundle;
  complete: boolean;
} {
  const ensured = ensureWorldSystemsState(state);
  const contributed = copyBundle(ensured.worldSystems.communications[nodeId].contributed);
  const required = copyBundle(COMMUNICATION_REQUIREMENTS[nodeId]);
  const remaining = {
    coilPart: Math.max(0, required.coilPart - contributed.coilPart),
    repairKit: Math.max(0, required.repairKit - contributed.repairKit),
    batteryPack: Math.max(0, required.batteryPack - contributed.batteryPack),
    filterCartridge: Math.max(0, required.filterCartridge - contributed.filterCartridge),
  };
  return {
    contributed,
    required,
    remaining,
    complete: Object.values(remaining).every((value) => value <= 0),
  };
}

export function canFastTravel(state: any, destinationId: TravelNodeId): {
  allowed: boolean;
  reason: string;
} {
  const ensured = ensureWorldSystemsState(state);
  const originId = travelNodeForZone(ensured.zone);
  if (!originId) return { allowed: false, reason: "Поблизости нет зарегистрированного лифтового узла." };
  if (!isAtTravelAccess(ensured, originId)) {
    return { allowed: false, reason: "Нужно подойти к лифтовому узлу." };
  }
  if (originId === destinationId) return { allowed: false, reason: "Герой уже находится в этом узле." };
  if (!isTravelNodeDiscovered(ensured, destinationId)) {
    return { allowed: false, reason: "Маршрут ещё не разведан." };
  }
  if (ensured.worldSystems.communications[originId].status !== "online") {
    return { allowed: false, reason: "Исходящий узел не имеет устойчивой связи." };
  }
  if (ensured.worldSystems.communications[destinationId].status !== "online") {
    return { allowed: false, reason: "Связь с пунктом назначения не восстановлена." };
  }
  if (hasActiveThreats(ensured)) {
    return { allowed: false, reason: "Лифт заблокирован локальной тревогой." };
  }
  const settlement = cityForZone(ensured.zone);
  if (settlement && ensured.worldSystems.defense[settlement].status === "active") {
    return { allowed: false, reason: "Во время обороны города лифты работают только на эвакуацию." };
  }
  return { allowed: true, reason: "Маршрут доступен." };
}

function appendWorldLog(state: any, message: string): any {
  return { ...state, log: [message, ...(state.log ?? [])].slice(0, 18) };
}

export function commandFastTravel(state: any, destinationId: TravelNodeId): any {
  const ensured = ensureWorldSystemsState(state);
  const permission = canFastTravel(ensured, destinationId);
  if (!permission.allowed) return appendWorldLog(ensured, permission.reason);
  const destination = TRAVEL_NODES[destinationId];
  const originId = travelNodeForZone(ensured.zone) as TravelNodeId;
  const travelMs = TRAVEL_NODES[originId].kind === "city" && destination.kind === "city" ? 18000 : 11000;
  return appendWorldLog(
    {
      ...ensured,
      zone: destination.zone,
      worldTimeMs: ensured.worldTimeMs + travelMs,
      hero: {
        ...ensured.hero,
        positions: {
          ...ensured.hero.positions,
          [destination.zone]: { ...destination.position },
        },
        path: [],
        destination: null,
        attackTargetId: null,
        pendingInteraction: null,
        evadeMode: false,
        stress: Math.min(100, ensured.hero.stress + 2),
      },
    },
    `Лифт принял маршрут: ${destination.label}. Время в пути: ${Math.round(travelMs / 1000)} сек.`,
  );
}

function takeMaterial(
  inventory: base.InventoryEntry[],
  itemId: RepairMaterialId,
  requested: number,
): { inventory: base.InventoryEntry[]; taken: number } {
  let remaining = requested;
  let taken = 0;
  const next = inventory.flatMap((entry) => {
    if (entry.itemId !== itemId || remaining <= 0) return [entry];
    const amount = Math.min(entry.quantity, remaining);
    remaining -= amount;
    taken += amount;
    const quantity = entry.quantity - amount;
    return quantity > 0 ? [{ ...entry, quantity }] : [];
  });
  return { inventory: next, taken };
}

export function donateLiftResources(state: any, nodeId: TravelNodeId): any {
  const ensured = ensureWorldSystemsState(state);
  const city = cityForZone(ensured.zone);
  if (!city) {
    return appendWorldLog(
      ensured,
      "Ресурсы принимает только городское Управление межэтажных сообщений.",
    );
  }
  if (!isTravelNodeDiscovered(ensured, nodeId)) {
    return appendWorldLog(ensured, "УМС не принимает материалы на неразведанный маршрут.");
  }
  const communication = ensured.worldSystems.communications[nodeId];
  if (communication.status === "online") {
    return appendWorldLog(ensured, `${TRAVEL_NODES[nodeId].shortLabel}: связь уже работает.`);
  }
  const progress = communicationProgress(ensured, nodeId);
  let inventory = ensured.hero.inventory as base.InventoryEntry[];
  const donated = copyBundle();
  for (const itemId of Object.keys(progress.remaining) as RepairMaterialId[]) {
    const result = takeMaterial(inventory, itemId, progress.remaining[itemId]);
    inventory = result.inventory;
    donated[itemId] = result.taken;
  }
  const total = Object.values(donated).reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return appendWorldLog(ensured, "Для ремонта линии нет подходящих материалов в инвентаре.");
  }
  const contributed = {
    coilPart: communication.contributed.coilPart + donated.coilPart,
    repairKit: communication.contributed.repairKit + donated.repairKit,
    batteryPack: communication.contributed.batteryPack + donated.batteryPack,
    filterCartridge: communication.contributed.filterCartridge + donated.filterCartridge,
  };
  const required = COMMUNICATION_REQUIREMENTS[nodeId];
  const complete = (Object.keys(required) as RepairMaterialId[]).every(
    (itemId) => contributed[itemId] >= required[itemId],
  );
  const next = {
    ...ensured,
    hero: { ...ensured.hero, inventory },
    worldSystems: {
      ...ensured.worldSystems,
      communications: {
        ...ensured.worldSystems.communications,
        [nodeId]: {
          ...communication,
          contributed,
          status: complete ? "online" : "unstable",
          repairedBy: complete ? "city" : communication.repairedBy,
        },
      },
      defense: complete
        ? {
            ...ensured.worldSystems.defense,
            [city]: {
              ...ensured.worldSystems.defense[city],
              preparedness: ensured.worldSystems.defense[city].preparedness + 1,
            },
          }
        : ensured.worldSystems.defense,
    },
  };
  const donatedText = (Object.keys(donated) as RepairMaterialId[])
    .filter((itemId) => donated[itemId] > 0)
    .map((itemId) => `${base.ITEMS[itemId].shortName} ×${donated[itemId]}`)
    .join(", ");
  return appendWorldLog(
    next,
    complete
      ? `УМС приняло материалы: ${donatedText}. Связь «${TRAVEL_NODES[nodeId].shortLabel}» восстановлена.`
      : `УМС приняло материалы: ${donatedText}. Ремонт линии продолжается.`,
  );
}

export function liftInteractionMessage(state: any): string {
  const ensured = ensureWorldSystemsState(state);
  const nodeId = travelNodeForZone(ensured.zone);
  if (!nodeId) return "Лифтовый узел не зарегистрирован в городской сети.";
  const communication = ensured.worldSystems.communications[nodeId];
  if (communication.status === "online") {
    return "Лифтовая связь устойчива. Откройте глобальную карту клавишей M для выбора маршрута.";
  }
  const progress = communicationProgress(ensured, nodeId);
  const missing = (Object.keys(progress.remaining) as RepairMaterialId[])
    .filter((itemId) => progress.remaining[itemId] > 0)
    .map((itemId) => `${base.ITEMS[itemId].shortName} ×${progress.remaining[itemId]}`)
    .join(", ");
  return `Линия связи ${communication.status === "offline" ? "отключена" : "нестабильна"}. УМС запрашивает: ${missing || "диагностику"}.`;
}

export function startDefenseEvent(
  state: any,
  settlementId: SettlementId,
  missionId: string,
  threat = 12,
  totalWaves = 3,
): any {
  const ensured = ensureWorldSystemsState(state);
  const current = ensured.worldSystems.defense[settlementId];
  if (["warning", "active"].includes(current.status)) return ensured;
  return appendWorldLog(
    {
      ...ensured,
      worldSystems: {
        ...ensured.worldSystems,
        defense: {
          ...ensured.worldSystems.defense,
          [settlementId]: {
            ...createDefense(),
            status: "warning",
            totalWaves,
            threat,
            preparedness: current.preparedness,
            startedAtMs: ensured.worldTimeMs,
            nextWaveAtMs: ensured.worldTimeMs + 15000,
            missionId,
          },
        },
      },
    },
    `${settlementId === "city545" ? "Город 545" : "Город 550"}: объявлена подготовка к обороне.`,
  );
}

export function commandDefensePreparation(
  state: any,
  settlementId: SettlementId,
  action: "fortify" | "power" | "medical" | "recon",
): any {
  const ensured = ensureWorldSystemsState(state);
  const event = ensured.worldSystems.defense[settlementId];
  if (event.status !== "warning") {
    return appendWorldLog(ensured, "Подготовительный этап обороны сейчас не активен.");
  }
  const value = action === "fortify" || action === "power" ? 3 : 2;
  const label = {
    fortify: "укреплены проходы",
    power: "подана энергия на оборонительные системы",
    medical: "подготовлены медицинские посты",
    recon: "разведаны направления атаки",
  }[action];
  return appendWorldLog(
    {
      ...ensured,
      worldSystems: {
        ...ensured.worldSystems,
        defense: {
          ...ensured.worldSystems.defense,
          [settlementId]: {
            ...event,
            preparedness: event.preparedness + value,
            heroContribution: event.heroContribution + value,
          },
        },
      },
    },
    `Подготовка обороны: ${label}.`,
  );
}

export function recordDefenseWaveVictory(
  state: any,
  settlementId: SettlementId,
  heroContribution = 2,
): any {
  const ensured = ensureWorldSystemsState(state);
  const event = ensured.worldSystems.defense[settlementId];
  if (!['warning', 'active'].includes(event.status)) return ensured;
  const wave = Math.min(event.totalWaves, event.wave + 1);
  const victory = wave >= event.totalWaves;
  const nextEvent: DefenseEventState = {
    ...event,
    status: victory ? "victory" : "active",
    wave,
    threat: Math.max(0, event.threat - event.preparedness - heroContribution),
    heroContribution: event.heroContribution + heroContribution,
    nextWaveAtMs: victory ? 0 : ensured.worldTimeMs + 12000,
    completedAtMs: victory ? ensured.worldTimeMs : 0,
  };
  return appendWorldLog(
    {
      ...ensured,
      worldSystems: {
        ...ensured.worldSystems,
        defense: { ...ensured.worldSystems.defense, [settlementId]: nextEvent },
      },
    },
    victory
      ? "Последняя волна отражена. Город удержан."
      : `Волна ${wave}/${event.totalWaves} отражена. Следующий сектор готовится к атаке.`,
  );
}

export function grantDefenseVictoryRewards(state: any, settlementId: SettlementId): any {
  const ensured = ensureWorldSystemsState(state);
  const event = ensured.worldSystems.defense[settlementId];
  if (event.status !== "victory" || event.rewardClaimed) return ensured;
  const share = TRAVEL_NODES[settlementId].kind === "city" ? 1.1 : 0.65;
  const xp = Math.max(1, Math.round(base.xpRequiredForLevel(ensured.hero.level) * share));
  let rewarded = base.awardXp(ensured, xp) as any;
  const contract: ExcellentRewardContract = {
    id: `defense:${settlementId}:${Math.round(ensured.worldTimeMs)}`,
    settlementId,
    quality: "excellent",
    poolId: `claude-defense-${settlementId}`,
    selectionAuthority: "claude",
    itemId: null,
    grantedAtMs: ensured.worldTimeMs,
  };
  rewarded = ensureWorldSystemsState(rewarded);
  rewarded = {
    ...rewarded,
    worldSystems: {
      ...rewarded.worldSystems,
      defense: {
        ...rewarded.worldSystems.defense,
        [settlementId]: { ...event, rewardClaimed: true },
      },
      excellentRewards: [...rewarded.worldSystems.excellentRewards, contract],
    },
  };
  return appendWorldLog(
    rewarded,
    `Оборона города: +${xp} опыта. Выдано право на снаряжение отличного качества, предмет определит Claude.`,
  );
}

export function tickWorldSystems(state: any): any {
  const ensured = ensureWorldSystemsState(state);
  let next = ensured;
  for (const settlementId of Object.keys(ensured.worldSystems.defense) as SettlementId[]) {
    const event = next.worldSystems.defense[settlementId];
    if (event.status === "warning" && next.worldTimeMs >= event.nextWaveAtMs) {
      next = {
        ...next,
        worldSystems: {
          ...next.worldSystems,
          defense: {
            ...next.worldSystems.defense,
            [settlementId]: { ...event, status: "active", nextWaveAtMs: next.worldTimeMs + 12000 },
          },
        },
      };
      next = appendWorldLog(next, `${settlementId === "city545" ? "Город 545" : "Город 550"}: началась первая волна атаки.`);
    }
  }
  return next;
}

function mapForSystemZone(zone: string): base.MapDefinition {
  if (zone === "floor544") return FLOOR_544_MAP;
  if (zone === "floor545") return FLOOR_545_MAP;
  if (zone === "floor547") return FLOOR_547_MAP;
  if (zone === "floor548") return FLOOR_548_MAP;
  return base.mapForZone(zone as base.ZoneId);
}

export function localMapSnapshot(state: any, radius = 7): {
  zone: string;
  title: string;
  cells: LocalMapCell[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const map = mapForSystemZone(state.zone);
  const hero = state.hero.positions[state.zone];
  const centerX = Math.round(hero.x);
  const centerY = Math.round(hero.y);
  const minX = Math.max(0, centerX - radius);
  const maxX = Math.min(map.rows[0].length - 1, centerX + radius);
  const minY = Math.max(0, centerY - radius);
  const maxY = Math.min(map.rows.length - 1, centerY + radius);
  const known = new Set<string>(state.visited?.[state.zone] ?? []);
  const cells: LocalMapCell[] = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const point = { x, y };
      const revealed = state.zone === "floor544" || known.has(pointKey(point));
      const visible = revealed && Math.hypot(hero.x - x, hero.y - y) <= 5.5;
      cells.push({
        x,
        y,
        tile: map.rows[y]?.[x] ?? "#",
        known: revealed,
        visible,
        hero: x === centerX && y === centerY,
        npc: revealed && state.npcs.some((npc: base.Npc) => npc.zone === state.zone && pointKey(npc.position) === pointKey(point)),
        enemy: visible && state.enemies.some((enemy: base.Enemy) => enemy.zone === state.zone && enemy.hp > 0 && pointKey(enemy.position) === pointKey(point)),
        loot: revealed && state.groundLoot.some((loot: base.GroundLoot) => loot.zone === state.zone && pointKey(loot.position) === pointKey(point)),
      });
    }
  }
  return { zone: state.zone, title: map.name, cells, minX, maxX, minY, maxY };
}

export function globalMapSnapshot(state: any): {
  nodes: GlobalMapNode[];
  connections: [string, string][];
} {
  const ensured = ensureWorldSystemsState(state);
  const nodes = GLOBAL_NODE_SPECS.map((spec): GlobalMapNode => {
    const discovered = spec.floors.some(
      (zone) => ensured.zone === zone || (ensured.visited?.[zone]?.length ?? 0) > 0,
    );
    const current = spec.floors.includes(ensured.zone);
    const communication = spec.travelNodeId
      ? ensured.worldSystems.communications[spec.travelNodeId].status
      : null;
    const permission = spec.travelNodeId
      ? canFastTravel(ensured, spec.travelNodeId)
      : { allowed: false, reason: "В этой точке нет узла быстрого перемещения." };
    const settlement = spec.id === "city550" ? "city550" : spec.id === "city545" ? "city545" : null;
    return {
      id: spec.id,
      label: spec.label,
      floors: spec.floors,
      kind: spec.kind,
      discovered,
      current,
      communication,
      travelNodeId: spec.travelNodeId,
      travelAvailable: discovered && permission.allowed,
      travelReason: permission.reason,
      defenseStatus: settlement ? ensured.worldSystems.defense[settlement].status : null,
    };
  });
  return { nodes, connections: GLOBAL_MAP_CONNECTIONS.map((connection) => [...connection]) as [string, string][] };
}
