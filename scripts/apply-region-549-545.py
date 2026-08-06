#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "app/game-engine.ts"
PACKAGE = ROOT / "package.json"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: ожидалось одно совпадение, найдено {count}")
    return text.replace(old, new, 1)


def replace_count(text: str, old: str, new: str, expected: int, label: str) -> str:
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f"{label}: ожидалось {expected} совпадений, найдено {count}")
    return text.replace(old, new)


engine = ENGINE.read_text(encoding="utf-8")

if 'from "./game-region-549-545.ts"' in engine:
    print("Регион 549–545 уже интегрирован; повторное применение не требуется.")
    raise SystemExit(0)

engine = replace_once(
    engine,
    '} from "./game-skills.ts";\n\nexport { ITEMS, SLOT_NAMES, WEAPONS }',
    '} from "./game-skills.ts";\nimport {\n'
    '  FLOOR_545_MAP,\n'
    '  FLOOR_546_MAP,\n'
    '  FLOOR_547_MAP,\n'
    '  FLOOR_548_MAP,\n'
    '  FLOOR_549_MAP,\n'
    '  REGION_CONTAINER_CONTENTS,\n'
    '  REGION_ENEMIES,\n'
    '  REGION_MAPS,\n'
    '  REGION_NPC_MESSAGES,\n'
    '  REGION_OBJECTIVES,\n'
    '  REGION_POPULATIONS,\n'
    '  REGION_SAFE_ZONES,\n'
    '  REGION_STARTS,\n'
    '  REGION_TERMINAL_MESSAGES,\n'
    '  REGION_TRANSITIONS,\n'
    '  type RegionZoneId,\n'
    '} from "./game-region-549-545.ts";\n\n'
    'export { ITEMS, SLOT_NAMES, WEAPONS }',
    "region import",
)

engine = replace_once(
    engine,
    'export type { ActiveSkillId, SkillBranch, TalentNode } from "./game-skills.ts";\n\n'
    'export type ZoneId = "floor550" | "floor554" | "floor555" | "floor556" | "floor557" | "voidLab";',
    'export type { ActiveSkillId, SkillBranch, TalentNode } from "./game-skills.ts";\n'
    'export {\n'
    '  FLOOR_545_MAP,\n'
    '  FLOOR_546_MAP,\n'
    '  FLOOR_547_MAP,\n'
    '  FLOOR_548_MAP,\n'
    '  FLOOR_549_MAP,\n'
    '  REGION_MAPS,\n'
    '  REGION_STARTS,\n'
    '} from "./game-region-549-545.ts";\n\n'
    'export type ZoneId = RegionZoneId | "floor550" | "floor554" | "floor555" | "floor556" | "floor557" | "voidLab";',
    "zone union and exports",
)

engine = replace_once(
    engine,
    '"#.U....................................................#",',
    '"#.U.................................................D..#",',
    "floor550 lower transition",
)

engine = replace_once(
    engine,
    'const ZONE_STARTS: Record<ZoneId, Point> = {\n  floor550: FLOOR_550_START,',
    'const ZONE_STARTS: Record<ZoneId, Point> = {\n'
    '  floor545: { ...REGION_STARTS.floor545 },\n'
    '  floor546: { ...REGION_STARTS.floor546 },\n'
    '  floor547: { ...REGION_STARTS.floor547 },\n'
    '  floor548: { ...REGION_STARTS.floor548 },\n'
    '  floor549: { ...REGION_STARTS.floor549 },\n'
    '  floor550: FLOOR_550_START,',
    "zone starts",
)

engine = replace_once(
    engine,
    'function createPopulations(): WorldPopulation[] {\n  return [\n    {\n      id: "lower-gate-scavengers",',
    'function createPopulations(): WorldPopulation[] {\n  return [\n'
    '    ...REGION_POPULATIONS.map((population) => ({ ...population, zone: population.zone as ZoneId })),\n'
    '    {\n      id: "lower-gate-scavengers",',
    "region populations",
)

engine = replace_once(
    engine,
    'function createEnemies(): Enemy[] {\n  return [\n    // Этаж 550:',
    'function createEnemies(): Enemy[] {\n'
    '  const regionalEnemies = REGION_ENEMIES.map((spec) => {\n'
    '    const enemy = createStaticEnemy(\n'
    '      spec.id,\n'
    '      spec.name,\n'
    '      spec.kind,\n'
    '      spec.zone as ZoneId,\n'
    '      spec.position,\n'
    '      spec.patrol,\n'
    '      spec.rank ?? "common",\n'
    '    );\n'
    '    const scale = spec.scale ?? (spec.rank === "boss" ? 2.4 : spec.rank === "elite" ? 1.55 : spec.rank === "veteran" ? 1.25 : 1);\n'
    '    return {\n'
    '      ...enemy,\n'
    '      hp: Math.round(enemy.hp * scale),\n'
    '      maxHp: Math.round(enemy.maxHp * scale),\n'
    '      damage: Math.max(enemy.damage, Math.round(enemy.damage * Math.min(1.75, scale))),\n'
    '      armor: enemy.armor + (spec.rank === "boss" ? 3 : spec.rank === "elite" ? 2 : spec.rank === "veteran" ? 1 : 0),\n'
    '      xpValue: Math.round(enemy.xpValue * scale),\n'
    '    };\n'
    '  });\n'
    '  return [\n'
    '    ...regionalEnemies,\n'
    '    // Этаж 550:',
    "region enemies",
)

engine = replace_once(
    engine,
    'export function mapForZone(zone: ZoneId): MapDefinition {\n  if (zone === "floor550") return FLOOR_550_MAP;',
    'export function mapForZone(zone: ZoneId): MapDefinition {\n'
    '  if (zone in REGION_MAPS) return REGION_MAPS[zone as RegionZoneId] as MapDefinition;\n'
    '  if (zone === "floor550") return FLOOR_550_MAP;',
    "region map lookup",
)

engine = replace_once(
    engine,
    'export function isCitySafeZone(zone: ZoneId): boolean {\n  return zone === "floor554";\n}',
    'export function isCitySafeZone(zone: ZoneId): boolean {\n'
    '  return zone === "floor554" || REGION_SAFE_ZONES.has(zone as RegionZoneId);\n'
    '}',
    "safe settlement",
)

engine = replace_once(
    engine,
    'function containerContents(key: string): { itemId: ItemId; quantity?: number; condition?: number }[] {\n  if (key === "floor556:17:8") {',
    'function containerContents(key: string): { itemId: ItemId; quantity?: number; condition?: number }[] {\n'
    '  const regional = REGION_CONTAINER_CONTENTS[key];\n'
    '  if (regional) return regional as { itemId: ItemId; quantity?: number; condition?: number }[];\n'
    '  if (key === "floor556:17:8") {',
    "region containers",
)

engine = replace_once(
    engine,
    'function transitionFloor(state: GameState, tile: "U" | "D"): GameState {\n  const transition =',
    'function transitionFloor(state: GameState, tile: "U" | "D"): GameState {\n'
    '  const regionalTransition = REGION_TRANSITIONS[`${state.zone}:${tile}`];\n'
    '  if (regionalTransition) {\n'
    '    const targetZone = regionalTransition.zone as ZoneId;\n'
    '    return reveal(\n'
    '      appendLog(\n'
    '        {\n'
    '          ...state,\n'
    '          zone: targetZone,\n'
    '          hero: {\n'
    '            ...state.hero,\n'
    '            path: [],\n'
    '            destination: null,\n'
    '            attackTargetId: null,\n'
    '            pendingInteraction: null,\n'
    '            evadeMode: isCitySafeZone(targetZone) ? false : state.hero.evadeMode,\n'
    '            positions: { ...state.hero.positions, [targetZone]: copyPoint(regionalTransition.position) },\n'
    '          },\n'
    '        },\n'
    '        regionalTransition.message,\n'
    '      ),\n'
    '    );\n'
    '  }\n'
    '  const transition =',
    "region transitions",
)

engine = replace_once(
    engine,
    'function interactWithTarget(state: GameState, target: { point: Point; tile: string }): GameState {\n  let next = state;\n  if (state.zone === "floor556" && target.tile === "S") {',
    'function interactWithTarget(state: GameState, target: { point: Point; tile: string }): GameState {\n'
    '  let next = state;\n'
    '  const regionalTerminal = REGION_TERMINAL_MESSAGES[state.zone as RegionZoneId];\n'
    '  const regionalNpc = REGION_NPC_MESSAGES[state.zone as RegionZoneId];\n'
    '  if (target.tile === "T" && regionalTerminal) {\n'
    '    next = appendLog(state, regionalTerminal);\n'
    '  } else if (target.tile === "N" && regionalNpc) {\n'
    '    next = appendLog(state, regionalNpc);\n'
    '  } else if (state.zone === "floor556" && target.tile === "S") {',
    "region interactions",
)

engine = replace_once(
    engine,
    '      { zone: "floor550", position: { x: 6, y: 33 }, label: "нижний выход, этаж 550" },\n      { zone: "floor554",',
    '      { zone: "floor547", position: { x: 28, y: 18 }, label: "архив НИИ-547" },\n'
    '      { zone: "floor550", position: { x: 6, y: 33 }, label: "нижний выход, этаж 550" },\n'
    '      { zone: "floor554",',
    "void destination",
)

positions_old = (
    'positions: {\n'
    '        floor550: { ...FLOOR_550_START },\n'
    '        floor554: { ...FLOOR_554_START },'
)
positions_new = (
    'positions: {\n'
    '        floor545: { ...REGION_STARTS.floor545 },\n'
    '        floor546: { ...REGION_STARTS.floor546 },\n'
    '        floor547: { ...REGION_STARTS.floor547 },\n'
    '        floor548: { ...REGION_STARTS.floor548 },\n'
    '        floor549: { ...REGION_STARTS.floor549 },\n'
    '        floor550: { ...FLOOR_550_START },\n'
    '        floor554: { ...FLOOR_554_START },'
)
engine = replace_count(engine, positions_old, positions_new, 2, "hero position records")

engine = replace_once(
    engine,
    'visited: { floor550: [], floor554: [], floor555: [], floor556: [], floor557: [], voidLab: [] },',
    'visited: { floor545: [], floor546: [], floor547: [], floor548: [], floor549: [], floor550: [], floor554: [], floor555: [], floor556: [], floor557: [], voidLab: [] },',
    "visited zones",
)

engine = replace_once(
    engine,
    '  if (state.zone === "floor550") return "Пройти нижний выход, сохранить путь к гермокомнате и разведать дальнейшую цепочку";',
    '  const regionalObjective = REGION_OBJECTIVES[state.zone as RegionZoneId];\n'
    '  if (regionalObjective) return regionalObjective;\n'
    '  if (state.zone === "floor550") return "Пройти нижний выход, сохранить путь к гермокомнате и разведать дальнейшую цепочку";',
    "region objectives",
)

ENGINE.write_text(engine, encoding="utf-8")

package = json.loads(PACKAGE.read_text(encoding="utf-8"))
package["scripts"]["test:engine"] = (
    "node --experimental-strip-types --test tests/game-engine.test.mjs tests/region-549-545.test.mjs"
)
PACKAGE.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
