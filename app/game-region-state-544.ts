import * as base from "./game-engine-base.ts";
import {
  createRegionalProgress,
  REGION_PUMP_RELAYS,
  REGION_SETTLEMENT_NPCS,
  type RegionalProgress,
} from "./game-region-content-544.ts";
import {
  copyPoint,
  FLOOR_544,
  FLOOR_544_START,
  FLOOR_545,
  FLOOR_545_LOWER_ENTRY,
  mapForRegionalZone,
  mapTile,
  RUNTIME_RESEARCH_RECORDS,
  zonePointKey,
} from "./game-region-map-544.ts";

export const REGION_NPC_IDS = new Set(REGION_SETTLEMENT_NPCS.map((npc) => npc.id));

export function withRegionalLog(state: any, message: string): any {
  return { ...state, log: [message, ...(state.log ?? [])].slice(0, 18) };
}

function sanitizedRoute(spec: (typeof REGION_SETTLEMENT_NPCS)[number]): base.Point[] {
  const map = mapForRegionalZone(spec.zone) ?? base.mapForZone(spec.zone as base.ZoneId);
  const route = spec.route.filter((point) => mapTile(map, point) !== "#");
  if (route.length >= 2) return route.map(copyPoint);
  return spec.zone === FLOOR_544
    ? [{ x: 5, y: 32 }, { x: 19, y: 15 }, { x: 37, y: 27 }, { x: 50, y: 32 }]
    : [{ x: 5, y: 32 }, { x: 15, y: 15 }, { x: 41, y: 15 }, { x: 49, y: 31 }];
}

export function createRegionalNpcs(): base.Npc[] {
  return REGION_SETTLEMENT_NPCS.map((spec, index) => {
    const route = sanitizedRoute(spec);
    const position = copyPoint(route[index % route.length]);
    return {
      id: spec.id,
      name: spec.name,
      kind: spec.kind,
      role: spec.role,
      zone: spec.zone as base.ZoneId,
      position,
      home: copyPoint(position),
      route,
      routeIndex: (index + 1) % route.length,
      path: [],
      speed: spec.speed ?? (spec.kind === "liquidator" ? 1.25 : spec.kind === "merchant" ? 0.8 : 1),
      thinkCooldownMs: 200 + index * 70,
      speech: null,
      speechUntilMs: 0,
      vendorStock: spec.vendorStock as base.ItemId[] | undefined,
    };
  });
}

function mergeRegionalNpcs(fresh: base.Npc[], saved: base.Npc[] | undefined): base.Npc[] {
  if (!Array.isArray(saved)) return fresh;
  return fresh.map((npc) => {
    const old = saved.find((candidate) => candidate.id === npc.id);
    return old
      ? { ...npc, ...old, zone: npc.zone, route: npc.route, vendorStock: npc.vendorStock, path: [] }
      : npc;
  });
}

export function ensureRegionalState(state: any, savedProgress?: Partial<RegionalProgress>): any {
  const positions = {
    ...(state.hero?.positions ?? {}),
    [FLOOR_544]: copyPoint(state.hero?.positions?.[FLOOR_544] ?? FLOOR_544_START),
  };
  const visited = {
    ...(state.visited ?? {}),
    [FLOOR_544]: Array.isArray(state.visited?.[FLOOR_544]) ? state.visited[FLOOR_544] : [],
  };
  const fresh = createRegionalNpcs();
  const baseNpcs = (state.npcs ?? []).filter((npc: base.Npc) => !REGION_NPC_IDS.has(npc.id));
  const savedNpcs = (state.npcs ?? []).filter((npc: base.Npc) => REGION_NPC_IDS.has(npc.id));
  return {
    ...state,
    hero: { ...state.hero, positions },
    visited,
    npcs: [...baseNpcs, ...mergeRegionalNpcs(fresh, savedNpcs)],
    regionProgress: createRegionalProgress(savedProgress ?? state.regionProgress),
  };
}

export function migrateRegionalState(raw: any): any {
  const freshBase = base.createInitialState();
  const baseNpcIds = new Set(freshBase.npcs.map((npc) => npc.id));
  const savedBaseNpcs = Array.isArray(raw?.npcs)
    ? raw.npcs.filter((npc: base.Npc) => baseNpcIds.has(npc.id))
    : undefined;
  const savedRegionalNpcs = Array.isArray(raw?.npcs)
    ? raw.npcs.filter((npc: base.Npc) => REGION_NPC_IDS.has(npc.id))
    : undefined;
  const savedFloor544Position = raw?.hero?.positions?.[FLOOR_544];
  const savedFloor544Visited = raw?.visited?.[FLOOR_544];
  const sanitized = {
    ...raw,
    zone: raw?.zone === FLOOR_544 ? FLOOR_545 : raw?.zone,
    hero: raw?.hero
      ? {
          ...raw.hero,
          positions: Object.fromEntries(
            Object.entries(raw.hero.positions ?? {}).filter(([zone]) => zone !== FLOOR_544),
          ),
        }
      : raw?.hero,
    visited: Object.fromEntries(
      Object.entries(raw?.visited ?? {}).filter(([zone]) => zone !== FLOOR_544),
    ),
    npcs: savedBaseNpcs?.length === freshBase.npcs.length ? savedBaseNpcs : undefined,
  };
  const migrated = base.migrateGameState(sanitized);
  return ensureRegionalState(
    {
      ...migrated,
      zone: raw?.zone === FLOOR_544 ? FLOOR_544 : migrated.zone,
      hero: {
        ...migrated.hero,
        positions: {
          ...migrated.hero.positions,
          [FLOOR_544]: copyPoint(savedFloor544Position ?? FLOOR_544_START),
        },
      },
      visited: {
        ...migrated.visited,
        [FLOOR_544]: Array.isArray(savedFloor544Visited) ? savedFloor544Visited : [],
      },
      npcs: [...migrated.npcs, ...(savedRegionalNpcs ?? [])],
    },
    raw?.regionProgress,
  );
}

export function updateRegionalQuestStage(progress: RegionalProgress): RegionalProgress {
  if (
    progress.bossDefeated &&
    progress.archiveComplete &&
    progress.pumpsRestored &&
    progress.questStage !== "complete"
  ) {
    return { ...progress, questStage: "report-to-dock" };
  }
  if (
    progress.archiveComplete &&
    progress.pumpsRestored &&
    ["restore-pumps", "recover-archives"].includes(progress.questStage)
  ) {
    return { ...progress, questStage: "disable-overseer" };
  }
  if (progress.pumpsRestored && progress.questStage === "restore-pumps") {
    return { ...progress, questStage: "recover-archives" };
  }
  return progress;
}

export function applyRegionalNode(state: any, point: base.Point): any | null {
  const key = zonePointKey(state.zone, point);
  const pump = REGION_PUMP_RELAYS[key];
  if (pump) {
    if (state.regionProgress.questStage === "arrival") {
      return withRegionalLog(state, "Силовой пульт требует действующий наряд Сухого дока.");
    }
    if (state.regionProgress.pumpRelays.includes(pump.id)) {
      return withRegionalLog(state, `${pump.label}: узел уже работает.`);
    }
    const pumpRelays = [...state.regionProgress.pumpRelays, pump.id];
    const pumpsRestored = pumpRelays.length >= Object.keys(REGION_PUMP_RELAYS).length;
    const progress = updateRegionalQuestStage({
      ...state.regionProgress,
      pumpRelays,
      pumpsRestored,
      servicesRestored: pumpsRestored,
      settlementDefense: pumpsRestored
        ? Math.min(12, state.regionProgress.settlementDefense + 2)
        : state.regionProgress.settlementDefense,
    });
    let next = {
      ...state,
      regionProgress: progress,
      populations: state.populations.map((population: base.WorldPopulation) =>
        pumpsRestored && population.zone === "floor548"
          ? { ...population, agitation: Math.max(0, population.agitation - 18) }
          : population,
      ),
    };
    next = withRegionalLog(next, pump.log);
    if (pumpsRestored) {
      next = withRegionalLog(
        next,
        "Насосный каскад синхронизирован. Мастерская, медпункт и силовая сеть Сухого дока снова работают.",
      );
    }
    return next;
  }

  const record = RUNTIME_RESEARCH_RECORDS[key as keyof typeof RUNTIME_RESEARCH_RECORDS];
  if (!record) return null;
  if (state.regionProgress.researchRecords.includes(record.id)) {
    return withRegionalLog(state, `${record.label}: запись уже сохранена.`);
  }
  const researchRecords = [...state.regionProgress.researchRecords, record.id];
  const archiveComplete = researchRecords.length >= Object.keys(RUNTIME_RESEARCH_RECORDS).length;
  let next = {
    ...state,
    regionProgress: updateRegionalQuestStage({
      ...state.regionProgress,
      researchRecords,
      archiveComplete,
    }),
  };
  next = withRegionalLog(next, record.log);
  if (archiveComplete) {
    next = withRegionalLog(
      next,
      "Архивная картина собрана: Смотритель считает жителей поселения бесхозным грузом.",
    );
  }
  return next;
}

function addItem(
  state: any,
  itemId: base.ItemId,
  quantity = 1,
  condition = 100,
): any {
  const definition = base.ITEMS[itemId];
  if (!definition) return state;
  const existing = definition.stackable
    ? state.hero.inventory.find((entry: base.InventoryEntry) => entry.itemId === itemId)
    : null;
  if (existing) {
    return {
      ...state,
      hero: {
        ...state.hero,
        inventory: state.hero.inventory.map((entry: base.InventoryEntry) =>
          entry.instanceId === existing.instanceId
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        ),
      },
    };
  }
  let counter = state.hero.itemCounter;
  const additions: base.InventoryEntry[] = [];
  for (let index = 0; index < (definition.stackable ? 1 : quantity); index += 1) {
    counter += 1;
    additions.push({
      instanceId: `itm-${counter}`,
      itemId,
      quantity: definition.stackable ? quantity : 1,
      condition,
    });
  }
  return {
    ...state,
    hero: {
      ...state.hero,
      itemCounter: counter,
      inventory: [...state.hero.inventory, ...additions],
    },
  };
}

const LOWER_CONTAINERS: Record<
  string,
  { itemId: base.ItemId; quantity?: number; condition?: number }[]
> = {
  "floor544:18:31": [{ itemId: "coilPart", quantity: 4 }, { itemId: "repairKit" }],
  "floor544:37:31": [{ itemId: "bandage", quantity: 2 }, { itemId: "filterCartridge" }],
  "floor544:28:14": [{ itemId: "platedVestBn3", condition: 91 }, { itemId: "traumaInjector" }],
};

export function openLowerContainer(state: any, point: base.Point): any {
  const key = zonePointKey(state.zone, point);
  if (state.openedContainers.includes(key)) return withRegionalLog(state, "Контейнер уже пуст.");
  let next = { ...state, openedContainers: [...state.openedContainers, key] };
  for (const item of LOWER_CONTAINERS[key] ?? []) {
    next = addItem(next, item.itemId, item.quantity ?? 1, item.condition ?? 100);
  }
  return withRegionalLog(next, "Контейнер нижнего дока вскрыт. Содержимое перенесено в инвентарь.");
}

export function transitionRegionalState(
  state: any,
  zone: string,
  position: base.Point,
  message: string,
): any {
  return withRegionalLog(
    {
      ...state,
      zone,
      hero: {
        ...state.hero,
        path: [],
        destination: null,
        attackTargetId: null,
        pendingInteraction: null,
        evadeMode: false,
        positions: { ...state.hero.positions, [zone]: copyPoint(position) },
      },
    },
    message,
  );
}

export function regionalNpc(state: any, npcId: string): base.Npc | null {
  const npc = state.npcs.find((entry: base.Npc) => entry.id === npcId);
  return npc && REGION_NPC_IDS.has(npc.id) ? npc : null;
}

function regionalGreeting(npc: base.Npc): string {
  return REGION_SETTLEMENT_NPCS.find((spec) => spec.id === npc.id)?.greeting ??
    "Сухой док держит смену.";
}

export function applyRegionalNpc(state: any, npc: base.Npc): any {
  let next = withRegionalLog(state, `${npc.name}: «${regionalGreeting(npc)}»`);
  if (npc.id === "dock-elder" && next.regionProgress.questStage === "arrival") {
    next = {
      ...next,
      regionProgress: { ...next.regionProgress, questStage: "restore-pumps", settlementTrust: 1 },
    };
    return withRegionalLog(
      next,
      "Региональная операция «Сухая линия» начата: восстановить три силовых узла насосного каскада 548.",
    );
  }
  if (npc.id === "dock-elder" && next.regionProgress.questStage === "report-to-dock") {
    next = {
      ...next,
      regionProgress: {
        ...next.regionProgress,
        questStage: "complete",
        lowerDockUnlocked: true,
        settlementTrust: Math.min(10, next.regionProgress.settlementTrust + 3),
        settlementDefense: Math.min(12, next.regionProgress.settlementDefense + 2),
      },
    };
    return withRegionalLog(
      next,
      "Операция «Сухая линия» завершена. Староста открыла допуск в нижний Сухой док, этаж 544.",
    );
  }
  if (npc.role === "medic") {
    return withRegionalLog(
      {
        ...next,
        hero: { ...next.hero, hp: base.maxHeroHp(next) },
        injuries: { leg: 0, arm: 0, head: 0, torso: 0, eye: 0 },
      },
      "Медпункт Сухого дока завершил лечение.",
    );
  }
  if (npc.id === "dock-mechanic" && next.regionProgress.servicesRestored) {
    const equipped = new Set(Object.values(next.hero.equipment).filter(Boolean));
    const damaged = next.hero.inventory
      .filter((entry: base.InventoryEntry) => equipped.has(entry.instanceId) && entry.condition < 100)
      .sort((a: base.InventoryEntry, b: base.InventoryEntry) => a.condition - b.condition)[0];
    if (damaged) {
      next = {
        ...next,
        hero: {
          ...next.hero,
          inventory: next.hero.inventory.map((entry: base.InventoryEntry) =>
            entry.instanceId === damaged.instanceId
              ? { ...entry, condition: Math.min(100, entry.condition + 15) }
              : entry,
          ),
        },
      };
      return withRegionalLog(
        next,
        `Мастерская восстановила 15% состояния: ${base.ITEMS[damaged.itemId].name}.`,
      );
    }
  }
  return next;
}

export { FLOOR_544, FLOOR_544_START, FLOOR_545, FLOOR_545_LOWER_ENTRY };
