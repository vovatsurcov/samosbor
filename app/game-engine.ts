import * as base from "./game-engine-base.ts";
import {
  createRegionalProgress,
  REGION_SETTLEMENT_NPCS,
  regionalObjective,
} from "./game-region-content-544.ts";
import {
  applyRegionalNode,
  applyRegionalNpc,
  ensureRegionalState,
  FLOOR_544,
  FLOOR_544_START,
  FLOOR_545,
  FLOOR_545_LOWER_ENTRY,
  migrateRegionalState,
  openLowerContainer,
  REGION_NPC_IDS,
  regionalNpc,
  transitionRegionalState,
  withRegionalLog,
} from "./game-region-state-544.ts";
import {
  distance,
  findRegionalPath,
  FLOOR_544_MAP,
  mapForRegionalZone,
  mapTile,
  REGION_MAPS_544,
  regionalNode,
} from "./game-region-map-544.ts";
import {
  moveRegionalNpcs,
  tickLowerDock,
  tickRegionalBoss,
} from "./game-region-tick-544.ts";
import {
  ensureWorldSystemsState,
  liftInteractionMessage,
  tickWorldSystems,
} from "./game-world-systems.ts";

export * from "./game-engine-base.ts";
export * from "./game-world-systems.ts";
export { FLOOR_544_MAP } from "./game-region-map-544.ts";
export const REGION_MAPS = REGION_MAPS_544;

function normalizeCityState(state: any): any {
  const regional = ensureRegionalState(state);
  return ensureWorldSystemsState({
    ...regional,
    regionProgress: {
      ...regional.regionProgress,
      lowerDockUnlocked: true,
    },
  });
}

export function mapForZone(zone: base.ZoneId | typeof FLOOR_544): base.MapDefinition {
  const map = mapForRegionalZone(String(zone)) ?? base.mapForZone(zone as base.ZoneId);
  if (zone === FLOOR_545) {
    return {
      ...map,
      name: "Город 545 · Сухой док · верхний ярус",
      subtitle: "Администрация, караванный двор, медицина и Управление межэтажных сообщений",
    };
  }
  if (zone === FLOOR_544) {
    return {
      ...map,
      name: "Город 545 · Сухой док · нижний ярус",
      subtitle: "Производство, бронные мастерские, гермоконтур и оборонительный периметр",
    };
  }
  return map;
}

export function tileAt(state: any, point: base.Point): string {
  return mapTile(mapForZone(state.zone), point);
}

export function isCitySafeZone(zone: base.ZoneId | typeof FLOOR_544): boolean {
  return [FLOOR_544, FLOOR_545, "floor554"].includes(String(zone)) ||
    base.isCitySafeZone(zone as base.ZoneId);
}

export function isSamosborProtectedAt(
  state: any,
  zone: any,
  point: base.Point,
): boolean {
  return [FLOOR_544, FLOOR_545].includes(String(zone)) ||
    base.isSamosborProtectedAt(state, zone, point);
}

export function isKnown(state: any, point: base.Point): boolean {
  return state.zone === FLOOR_544 ? true : base.isKnown(state, point);
}

export function isVisible(state: any, point: base.Point): boolean {
  return state.zone === FLOOR_544 ? true : base.isVisible(state, point);
}

export function createInitialState(): any {
  return normalizeCityState(base.createInitialState());
}

export function migrateGameState(raw: any): any {
  const fresh = base.createInitialState();
  const requestedZone = typeof raw?.zone === "string" ? raw.zone : null;
  const knownZone = requestedZone === FLOOR_544 ||
    (requestedZone != null && Object.prototype.hasOwnProperty.call(fresh.hero.positions, requestedZone));
  const safeRaw = {
    ...(raw ?? {}),
    zone: knownZone ? requestedZone : fresh.zone,
  };
  return normalizeCityState(migrateRegionalState(safeRaw));
}

export function commandMove(state: any, target: base.Point): any {
  if (state.zone !== FLOOR_544) return base.commandMove(state, target);
  const path = findRegionalPath(FLOOR_544, state.hero.positions[FLOOR_544], target);
  if (!path) return withRegionalLog(state, "Маршрут перекрыт.");
  return {
    ...state,
    hero: {
      ...state.hero,
      path: path.slice(1),
      destination: { x: Math.round(target.x), y: Math.round(target.y) },
      attackTargetId: null,
      pendingInteraction: null,
      evadeMode: false,
    },
  };
}

export function commandTalkToNpc(state: any, npcId: string): any {
  const npc = regionalNpc(state, npcId);
  return npc ? applyRegionalNpc(state, npc) : base.commandTalkToNpc(state, npcId);
}

export function commandInteractAt(state: any, point: base.Point): any {
  const ensured = normalizeCityState(state);
  const nodeResult = applyRegionalNode(ensured, point);
  if (nodeResult) return nodeResult;
  const tile = tileAt(ensured, point);

  if (ensured.zone === FLOOR_545 && tile === "D") {
    return transitionRegionalState(
      ensured,
      FLOOR_544,
      FLOOR_544_START,
      "Внутригородской спуск выполнен: Город 545, нижний ярус 544.",
    );
  }

  if (ensured.zone === FLOOR_544) {
    if (tile === "U") {
      return transitionRegionalState(
        ensured,
        FLOOR_545,
        FLOOR_545_LOWER_ENTRY,
        "Внутригородской подъём выполнен: Город 545, верхний ярус 545.",
      );
    }
    if (tile === "T") {
      return withRegionalLog(
        ensured,
        "Город 545: нижний гермоконтур держит. Производство и оборона работают как части одного городского организма.",
      );
    }
    if (tile === "N") {
      return withRegionalLog(
        ensured,
        "Мастер Яшин: «Верхний и нижний док спорят постоянно, но сирену слышат как один город».",
      );
    }
    if (tile === "B") return openLowerContainer(ensured, point);
  }

  if (tile === "L") return withRegionalLog(ensured, liftInteractionMessage(ensured));
  return base.commandInteractAt(ensured, point);
}

type RegionalTarget = {
  kind: "node" | "npc" | "tile";
  point: base.Point;
  npcId?: string;
  label: string;
  distance: number;
};

function nearestRegionalTarget(state: any): RegionalTarget | null {
  const hero = state.hero.positions[state.zone];
  const targets: RegionalTarget[] = [];
  const map = mapForZone(state.zone);
  for (let y = 0; y < map.rows.length; y += 1) {
    for (let x = 0; x < map.rows[y].length; x += 1) {
      const point = { x, y };
      const node = regionalNode(state.zone, point);
      if (node) {
        const currentDistance = distance(hero, point);
        if (currentDistance <= 1.35) {
          targets.push({ kind: "node", point, label: node.label, distance: currentDistance });
        }
      }
    }
  }
  for (const npc of state.npcs.filter(
    (entry: base.Npc) => entry.zone === state.zone && REGION_NPC_IDS.has(entry.id),
  )) {
    const currentDistance = distance(hero, npc.position);
    if (currentDistance <= 1.35) {
      targets.push({
        kind: "npc",
        point: npc.position,
        npcId: npc.id,
        label: `Поговорить: ${npc.name}`,
        distance: currentDistance,
      });
    }
  }
  if (state.zone === FLOOR_545) {
    const point = { x: 52, y: 2 };
    const currentDistance = distance(hero, point);
    if (currentDistance <= 1.35) {
      targets.push({
        kind: "tile",
        point,
        label: "Спуститься на нижний ярус Города 545",
        distance: currentDistance,
      });
    }
  }
  if (state.zone === FLOOR_544) {
    const labels: Record<string, string> = {
      U: "Подняться на верхний ярус Города 545",
      T: "Прочитать городской терминал",
      N: "Поговорить с мастером",
      L: "Проверить сеть межэтажных сообщений",
      B: "Открыть контейнер",
    };
    for (let y = 0; y < map.rows.length; y += 1) {
      for (let x = 0; x < map.rows[y].length; x += 1) {
        const tile = map.rows[y][x];
        if (!labels[tile]) continue;
        const point = { x, y };
        const currentDistance = distance(hero, point);
        if (currentDistance <= 1.35) {
          targets.push({ kind: "tile", point, label: labels[tile], distance: currentDistance });
        }
      }
    }
  }
  targets.sort((left, right) => left.distance - right.distance);
  return targets[0] ?? null;
}

export function interactionHint(state: any): string {
  const target = nearestRegionalTarget(state);
  return target?.label ??
    (state.zone === FLOOR_544 ? "Подойдите к объекту" : base.interactionHint(state));
}

export function interact(state: any): any {
  const target = nearestRegionalTarget(state);
  if (!target) return state.zone === FLOOR_544 ? state : base.interact(state);
  return target.kind === "npc" && target.npcId
    ? commandTalkToNpc(state, target.npcId)
    : commandInteractAt(state, target.point);
}

export function tickGame(state: any, rawDeltaMs: number): any {
  const ensured = normalizeCityState(state);
  let next: any;
  if (ensured.zone === FLOOR_544) {
    next = tickLowerDock(ensured, rawDeltaMs);
  } else {
    next = base.tickGame(ensured, rawDeltaMs);
    next = moveRegionalNpcs(next, Math.max(0, Math.min(100, rawDeltaMs)));
    next = tickRegionalBoss(next);
  }
  return tickWorldSystems(next);
}

export function objectiveFor(state: any): string {
  const progress = state.regionProgress ?? createRegionalProgress();
  if (progress.questStage === "complete" && [FLOOR_544, FLOOR_545].includes(state.zone)) {
    return "Пользоваться службами Города 545, восстанавливать связь и готовить оборону";
  }
  return regionalObjective(progress, state.zone) ?? base.objectiveFor(state);
}

export function cityPopulationCounts(
  state: any,
): { residents: number; liquidators: number } {
  if (![FLOOR_544, FLOOR_545].includes(state.zone)) {
    return base.cityPopulationCounts(state);
  }
  return state.npcs.reduce(
    (counts: { residents: number; liquidators: number }, npc: base.Npc) => {
      if (![FLOOR_544, FLOOR_545].includes(String(npc.zone))) return counts;
      if (npc.kind === "liquidator") counts.liquidators += 1;
      else counts.residents += 1;
      return counts;
    },
    { residents: 0, liquidators: 0 },
  );
}

export { REGION_SETTLEMENT_NPCS };
