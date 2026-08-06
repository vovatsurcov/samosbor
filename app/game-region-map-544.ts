import * as base from "./game-engine-base.ts";
import {
  REGION_PUMP_RELAYS,
  REGION_RESEARCH_RECORDS,
} from "./game-region-content-544.ts";

export const FLOOR_544 = "floor544";
export const FLOOR_545 = "floor545";
export const FLOOR_544_START: base.Point = { x: 3, y: 33 };
export const FLOOR_545_LOWER_ENTRY: base.Point = { x: 52, y: 3 };

export const RUNTIME_RESEARCH_RECORDS = {
  "floor547:46:31": REGION_RESEARCH_RECORDS["floor547:46:31"],
  "floor547:16:15": {
    ...REGION_RESEARCH_RECORDS["floor547:25:8"],
    position: { x: 16, y: 15 },
  },
  "floor547:42:28": {
    ...REGION_RESEARCH_RECORDS["floor547:43:28"],
    position: { x: 42, y: 28 },
  },
};

function buildLowerDockMap(): base.MapDefinition {
  const width = 56;
  const height = 36;
  const grid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || y === 0 || x === width - 1 || y === height - 1 ? "#" : ".",
    ),
  );
  const solid = (x: number, y: number, w: number, h: number) => {
    for (let row = y; row < y + h; row += 1) {
      for (let column = x; column < x + w; column += 1) grid[row][column] = "#";
    }
  };
  solid(5, 4, 13, 8);
  solid(22, 4, 12, 8);
  solid(38, 4, 13, 8);
  solid(6, 17, 11, 9);
  solid(40, 17, 10, 9);
  solid(8, 28, 9, 3);
  solid(22, 29, 12, 3);
  solid(39, 28, 9, 3);

  for (let y = 16; y < 27; y += 1) {
    for (let x = 21; x < 35; x += 1) {
      const border = y === 16 || y === 26 || x === 21 || x === 34;
      grid[y][x] = border ? "#" : "g";
    }
  }
  grid[26][27] = "H";
  grid[33][2] = "U";
  grid[31][49] = "T";
  grid[31][9] = "N";
  grid[31][52] = "L";
  grid[31][18] = "B";
  grid[31][37] = "B";
  grid[14][28] = "B";
  grid[28][14] = "c";
  grid[18][19] = "c";
  grid[27][42] = "c";
  grid[13][47] = "c";
  return {
    id: FLOOR_544 as base.ZoneId,
    name: "Поселение 545 · нижний Сухой док",
    subtitle: "Производство, гермоконтур и оборонительный периметр малого поселения",
    rows: grid.map((row) => row.join("")),
  };
}

function withTiles(
  map: base.MapDefinition,
  tiles: { x: number; y: number; tile: string }[],
): base.MapDefinition {
  const rows = map.rows.map((row) => [...row]);
  for (const { x, y, tile } of tiles) {
    if (rows[y]?.[x] != null) rows[y][x] = tile;
  }
  return { ...map, rows: rows.map((row) => row.join("")) };
}

export const FLOOR_544_MAP = buildLowerDockMap();
export const FLOOR_545_MAP = withTiles(base.mapForZone(FLOOR_545 as base.ZoneId), [
  { x: 52, y: 2, tile: "D" },
]);
export const FLOOR_548_MAP = withTiles(base.mapForZone("floor548" as base.ZoneId), [
  { x: 8, y: 4, tile: "S" },
  { x: 18, y: 12, tile: "S" },
  { x: 47, y: 17, tile: "S" },
]);
export const FLOOR_547_MAP = withTiles(base.mapForZone("floor547" as base.ZoneId), [
  { x: 46, y: 31, tile: "A" },
  { x: 16, y: 15, tile: "A" },
  { x: 42, y: 28, tile: "A" },
]);

export const REGION_MAPS_544 = {
  ...base.REGION_MAPS,
  floor544: FLOOR_544_MAP,
  floor545: FLOOR_545_MAP,
  floor548: FLOOR_548_MAP,
  floor547: FLOOR_547_MAP,
};

export function copyPoint(point: base.Point): base.Point {
  return { x: point.x, y: point.y };
}

export function gridPoint(point: base.Point): base.Point {
  return { x: Math.round(point.x), y: Math.round(point.y) };
}

export function pointKey(point: base.Point): string {
  const grid = gridPoint(point);
  return `${grid.x}:${grid.y}`;
}

export function zonePointKey(zone: string, point: base.Point): string {
  const grid = gridPoint(point);
  return `${zone}:${grid.x}:${grid.y}`;
}

export function distance(a: base.Point, b: base.Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function mapForRegionalZone(zone: string): base.MapDefinition | null {
  if (zone === FLOOR_544) return FLOOR_544_MAP;
  if (zone === FLOOR_545) return FLOOR_545_MAP;
  if (zone === "floor548") return FLOOR_548_MAP;
  if (zone === "floor547") return FLOOR_547_MAP;
  return null;
}

export function mapTile(map: base.MapDefinition, point: base.Point): string {
  const grid = gridPoint(point);
  return map.rows[grid.y]?.[grid.x] ?? "#";
}

export function walkable(zone: string, point: base.Point): boolean {
  const map = mapForRegionalZone(zone) ?? base.mapForZone(zone as base.ZoneId);
  return mapTile(map, point) !== "#";
}

const DIRECTIONS = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
  { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 },
];

export function findRegionalPath(
  zone: string,
  start: base.Point,
  goal: base.Point,
): base.Point[] | null {
  const from = gridPoint(start);
  const to = gridPoint(goal);
  if (!walkable(zone, to)) return null;
  const queue = [from];
  const came = new Map<string, base.Point | null>([[pointKey(from), null]]);
  while (queue.length) {
    const current = queue.shift() as base.Point;
    if (pointKey(current) === pointKey(to)) break;
    for (const direction of DIRECTIONS) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = pointKey(next);
      if (came.has(key) || !walkable(zone, next)) continue;
      if (direction.x !== 0 && direction.y !== 0) {
        if (!walkable(zone, { x: current.x + direction.x, y: current.y }) ||
            !walkable(zone, { x: current.x, y: current.y + direction.y })) continue;
      }
      came.set(key, current);
      queue.push(next);
    }
  }
  if (!came.has(pointKey(to))) return null;
  const path: base.Point[] = [];
  let cursor: base.Point | null = to;
  while (cursor) {
    path.unshift(copyPoint(cursor));
    cursor = came.get(pointKey(cursor)) ?? null;
  }
  return path;
}

export function advanceRegionalPath(
  position: base.Point,
  path: base.Point[],
  travel: number,
): { position: base.Point; path: base.Point[] } {
  let current = copyPoint(position);
  const route = path.map(copyPoint);
  let remaining = travel;
  while (route.length && remaining > 0) {
    const target = route[0];
    const segment = distance(current, target);
    if (segment <= 0.001) {
      current = copyPoint(target);
      route.shift();
    } else if (segment <= remaining) {
      current = copyPoint(target);
      route.shift();
      remaining -= segment;
    } else {
      const ratio = remaining / segment;
      current = {
        x: current.x + (target.x - current.x) * ratio,
        y: current.y + (target.y - current.y) * ratio,
      };
      remaining = 0;
    }
  }
  return { position: current, path: route };
}

export function regionalNode(zone: string, point: base.Point): any | null {
  const key = zonePointKey(zone, point);
  return REGION_PUMP_RELAYS[key] ??
    RUNTIME_RESEARCH_RECORDS[key as keyof typeof RUNTIME_RESEARCH_RECORDS] ??
    null;
}
