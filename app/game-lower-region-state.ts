import { LOWER_REGION_STARTS, type LowerRegionZoneId } from "./game-region-543-534.ts";

export const LOWER_REGION_ZONE_IDS = Object.keys(LOWER_REGION_STARTS) as LowerRegionZoneId[];

export function isLowerRegionZone(zone: unknown): zone is LowerRegionZoneId {
  return typeof zone === "string" && LOWER_REGION_ZONE_IDS.includes(zone as LowerRegionZoneId);
}

function copyPoint(point: { x: number; y: number }): { x: number; y: number } {
  return { x: point.x, y: point.y };
}

type LowerRegionStateHost = {
  zone: string;
  hero: {
    positions: Record<string, { x: number; y: number }>;
  } & Record<string, unknown>;
  visited: Record<string, string[]>;
} & Record<string, unknown>;

type SavedLowerState = {
  zone?: unknown;
  hero?: {
    positions?: Record<string, { x?: unknown; y?: unknown }>;
  };
  visited?: Record<string, unknown>;
};

function savedPoint(raw: SavedLowerState | undefined, zone: LowerRegionZoneId): { x: number; y: number } | null {
  const point = raw?.hero?.positions?.[zone];
  return point && Number.isFinite(point.x) && Number.isFinite(point.y)
    ? { x: Number(point.x), y: Number(point.y) }
    : null;
}

export function ensureLowerRegionState<T extends LowerRegionStateHost>(
  state: T,
  raw?: SavedLowerState,
): T {
  const positions = { ...state.hero.positions };
  const visited = { ...state.visited };
  for (const zone of LOWER_REGION_ZONE_IDS) {
    positions[zone] = savedPoint(raw, zone) ?? positions[zone] ?? copyPoint(LOWER_REGION_STARTS[zone]);
    visited[zone] = Array.isArray(raw?.visited?.[zone])
      ? (raw?.visited?.[zone] as unknown[]).filter((entry): entry is string => typeof entry === "string")
      : Array.isArray(visited[zone])
        ? visited[zone]
        : [];
  }
  return {
    ...state,
    hero: { ...state.hero, positions },
    visited,
  };
}
