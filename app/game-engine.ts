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

export * from "./game-engine-base.ts";
export { FLOOR_544_MAP } from "./game-region-map-544.ts";
export const REGION_MAPS = REGION_MAPS_544;

export function mapForZone(zone: base.ZoneId | typeof FLOOR_544): base.MapDefinition {
  return mapForRegionalZone(String(zone)) ?? base.mapForZone(zone as base.ZoneId);
}

export function tileAt(state: any, point: base.Point): string {
  return mapTile(mapForZone(state.zone), point);
}

export function isCitySafeZone(zone: base.ZoneId | typeof FLOOR_544): boolean {
  return zone === FLOOR_544 || base.isCitySafeZone(zone as base.ZoneId);
}

export function isSamosborProtectedAt(
  state: any,
  zone: any,
  point: base.Point,
): boolean {
  return zone === FLOOR_544 || base.isSamosborProtectedAt(state, zone, point);
}

export function isKnown(state: any, point: base.Point): boolean {
  return state.zone === FLOOR_544 ? true : base.isKnown(state, point);
}

export function isVisible(state: any, point: base.Point): boolean {
  return state.zone === FLOOR_544 ? true : base.isVisible(state, point);
}

export function createInitialState(): any {
  return ensureRegionalState(base.createInitialState());
}

export function migrateGameState(raw: any): any {
  return migrateRegionalState(raw);
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
  const nodeResult = applyRegionalNode(state, point);
  if (nodeResult) return nodeResult;
  const tile = tileAt(state, point);
  if (state.zone === FLOOR_545 && tile === "D") {
    if (!state.regionProgress.lowerDockUnlocked) {
      return withRegionalLog(
        state,
        "Нижний док закрыт. Завершите операцию «Сухая линия» и получите допуск старосты.",
      );
    }
    return transitionRegionalState(
      state,
      FLOOR_544,
      FLOOR_544_START,
      "Спуск выполнен: нижний Сухой док, этаж 544.",
    );
  }
  if (state.zone === FLOOR_544) {
    if (tile === "U") {
      return transitionRegionalState(
        state,
        FLOOR_545,
        FLOOR_545_LOWER_ENTRY,
        "Подъём выполнен: верхний Сухой док, этаж 545.",
      );
    }
    if (tile === "T") {
      return withRegionalLog(
        state,
        "Нижний док: гермоконтур держит. Производственная линия готова, следующий пояс закрыт распоряжением дозора.",
      );
    }
    if (tile === "N") {
      return withRegionalLog(
        state,
        "Мастер Яшин: «Дальше начинается пояс, где караваны уже ходят с прикрытием».",
      );
    }
    if (tile === "L") {
      return withRegionalLog(
        state,
        "Нижний грузовой лифт принимает вызовы только от дозора. Маршрут ниже пока не открыт.",
      );
    }
    if (tile === "B") return openLowerContainer(state, point);
  }
  return base.commandInteractAt(state, point);
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
        label: "Спуститься в нижний Сухой док",
        distance: currentDistance,
      });
    }
  }
  if (state.zone === FLOOR_544) {
    const labels: Record<string, string> = {
      U: "Подняться на этаж 545",
      T: "Прочитать терминал",
      N: "Поговорить с мастером",
      L: "Проверить лифт",
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
  const ensured = state.regionProgress ? state : ensureRegionalState(state);
  if (ensured.zone === FLOOR_544) return tickLowerDock(ensured, rawDeltaMs);
  let next = base.tickGame(ensured, rawDeltaMs);
  next = moveRegionalNpcs(next, Math.max(0, Math.min(100, rawDeltaMs)));
  return tickRegionalBoss(next);
}

export function objectiveFor(state: any): string {
  const progress = state.regionProgress ?? createRegionalProgress();
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
      if (npc.zone !== state.zone) return counts;
      if (npc.kind === "liquidator") counts.liquidators += 1;
      else counts.residents += 1;
      return counts;
    },
    { residents: 0, liquidators: 0 },
  );
}
