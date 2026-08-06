export type RegionZoneId = "floor545" | "floor546" | "floor547" | "floor548" | "floor549";

export type RegionPoint = { x: number; y: number };

export type RegionMapDefinition = {
  id: RegionZoneId;
  name: string;
  subtitle: string;
  rows: string[];
};

export type RegionPopulationSpec = {
  id: string;
  name: string;
  genome: "maintenance" | "bureaucratic" | "feral" | "pilgrim" | "anomalous";
  zone: RegionZoneId;
  count: number;
  agitation: number;
  goal: string;
};

export type RegionEnemySpec = {
  id: string;
  name: string;
  kind: "sentry" | "stalker" | "collector";
  zone: RegionZoneId;
  position: RegionPoint;
  patrol: RegionPoint[];
  rank?: "common" | "enhanced" | "veteran" | "elite" | "boss";
  scale?: number;
};

export type RegionTransitionSpec = {
  zone: RegionZoneId | "floor550";
  position: RegionPoint;
  message: string;
};

export type RegionContainerEntry = {
  itemId: string;
  quantity?: number;
  condition?: number;
};

const WIDTH = 56;
const HEIGHT = 36;

type Grid = string[][];

type MapOptions = {
  id: RegionZoneId;
  name: string;
  subtitle: string;
  up: RegionPoint;
  down?: RegionPoint;
  solids: [number, number, number, number][];
  covers: RegionPoint[];
  containers: RegionPoint[];
  terminal: RegionPoint;
  npc?: RegionPoint;
  voidGate?: RegionPoint;
  lift?: RegionPoint;
  hermetic?: { x: number; y: number; width: number; height: number; door: "left" | "right" | "top" | "bottom" };
};

function blankGrid(): Grid {
  return Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? "#" : ".")),
  );
}

function set(grid: Grid, point: RegionPoint, value: string): void {
  if (point.x <= 0 || point.x >= WIDTH - 1 || point.y <= 0 || point.y >= HEIGHT - 1) {
    throw new Error(`Точка ${point.x}:${point.y} выходит за границы карты`);
  }
  grid[point.y][point.x] = value;
}

function solidRect(grid: Grid, x: number, y: number, width: number, height: number): void {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      if (column > 0 && column < WIDTH - 1 && row > 0 && row < HEIGHT - 1) grid[row][column] = "#";
    }
  }
}

function hermeticRoom(
  grid: Grid,
  room: NonNullable<MapOptions["hermetic"]>,
): void {
  const { x, y, width, height, door } = room;
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      const border = row === y || row === y + height - 1 || column === x || column === x + width - 1;
      grid[row][column] = border ? "#" : "g";
    }
  }
  const doorPoint: RegionPoint =
    door === "left"
      ? { x, y: y + height - 2 }
      : door === "right"
        ? { x: x + width - 1, y: y + height - 2 }
        : door === "top"
          ? { x: x + Math.floor(width / 2), y }
          : { x: x + Math.floor(width / 2), y: y + height - 1 };
  set(grid, doorPoint, "H");
}

function buildMap(options: MapOptions): RegionMapDefinition {
  const grid = blankGrid();
  for (const [x, y, width, height] of options.solids) solidRect(grid, x, y, width, height);
  if (options.hermetic) hermeticRoom(grid, options.hermetic);
  for (const point of options.covers) set(grid, point, "c");
  for (const point of options.containers) set(grid, point, "B");
  set(grid, options.terminal, "T");
  set(grid, options.up, "U");
  if (options.down) set(grid, options.down, "D");
  if (options.npc) set(grid, options.npc, "N");
  if (options.voidGate) set(grid, options.voidGate, "P");
  if (options.lift) set(grid, options.lift, "L");
  return { id: options.id, name: options.name, subtitle: options.subtitle, rows: grid.map((row) => row.join("")) };
}

export const FLOOR_549_MAP = buildMap({
  id: "floor549",
  name: "Этаж 549 · кабельный пролёт",
  subtitle: "Магистральные коридоры под Городом 550 · кабельные реки, тяговые щиты и обесточенные посты",
  up: { x: 2, y: 33 },
  down: { x: 52, y: 2 },
  terminal: { x: 47, y: 3 },
  lift: { x: 5, y: 31 },
  covers: [{ x: 15, y: 14 }, { x: 27, y: 17 }, { x: 40, y: 22 }, { x: 48, y: 29 }],
  containers: [{ x: 11, y: 31 }, { x: 34, y: 12 }, { x: 49, y: 10 }],
  solids: [
    [6, 5, 13, 5], [23, 4, 9, 8], [36, 6, 13, 5],
    [8, 17, 10, 8], [23, 18, 11, 7], [39, 16, 10, 9],
    [14, 28, 12, 4], [31, 28, 12, 4],
  ],
  hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
});

export const FLOOR_548_MAP = buildMap({
  id: "floor548",
  name: "Этаж 548 · насосный каскад",
  subtitle: "Затопленная система водоотлива · помпы работают рывками, мостки дрожат над чёрной водой",
  up: { x: 2, y: 33 },
  down: { x: 52, y: 2 },
  terminal: { x: 8, y: 4 },
  covers: [{ x: 18, y: 12 }, { x: 29, y: 9 }, { x: 37, y: 25 }, { x: 47, y: 17 }],
  containers: [{ x: 10, y: 29 }, { x: 28, y: 31 }, { x: 44, y: 12 }],
  solids: [
    [5, 7, 11, 8], [20, 5, 15, 6], [38, 12, 12, 4],
    [7, 19, 14, 8], [26, 16, 8, 12], [39, 21, 12, 7],
    [17, 30, 7, 3], [33, 30, 12, 3],
  ],
  hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
});

export const FLOOR_547_MAP = buildMap({
  id: "floor547",
  name: "Этаж 547 · архив НИИ-547",
  subtitle: "Законсервированный научный сектор · бумажные фонды, экранированные камеры и односторонний разрыв ВЖ",
  up: { x: 2, y: 33 },
  down: { x: 52, y: 2 },
  terminal: { x: 46, y: 31 },
  voidGate: { x: 28, y: 17 },
  covers: [{ x: 12, y: 13 }, { x: 23, y: 27 }, { x: 34, y: 10 }, { x: 45, y: 20 }],
  containers: [{ x: 9, y: 30 }, { x: 25, y: 8 }, { x: 43, y: 28 }],
  solids: [
    [5, 5, 10, 9], [19, 4, 8, 11], [32, 5, 8, 10], [44, 12, 7, 3],
    [7, 18, 11, 9], [21, 19, 8, 8], [34, 18, 8, 10], [46, 18, 6, 8],
    [18, 30, 9, 3], [31, 30, 10, 3],
  ],
  hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
});

export const FLOOR_546_MAP = buildMap({
  id: "floor546",
  name: "Этаж 546 · грузовой узел ГУ-46",
  subtitle: "Сортировочный зал региональной линии · контейнерные поля и диспетчерский автомат Смотритель",
  up: { x: 2, y: 33 },
  down: { x: 52, y: 2 },
  terminal: { x: 50, y: 31 },
  covers: [{ x: 13, y: 11 }, { x: 21, y: 23 }, { x: 35, y: 23 }, { x: 45, y: 12 }],
  containers: [{ x: 8, y: 29 }, { x: 30, y: 17 }, { x: 48, y: 28 }],
  solids: [
    [5, 5, 12, 7], [20, 5, 8, 7], [32, 5, 8, 7], [43, 5, 8, 7],
    [7, 17, 10, 9], [21, 16, 7, 11], [35, 16, 7, 11], [46, 17, 6, 9],
    [17, 30, 12, 3], [33, 30, 12, 3],
  ],
  hermetic: { x: 4, y: 25, width: 11, height: 8, door: "bottom" },
});

export const FLOOR_545_MAP = buildMap({
  id: "floor545",
  name: "Поселение 545 · Сухой док",
  subtitle: "Защищённый перевалочный посёлок · жильё, мастерские и караванный двор промышленного пояса",
  up: { x: 2, y: 33 },
  terminal: { x: 46, y: 31 },
  npc: { x: 9, y: 31 },
  lift: { x: 51, y: 31 },
  covers: [{ x: 15, y: 15 }, { x: 28, y: 14 }, { x: 41, y: 15 }, { x: 28, y: 26 }],
  containers: [{ x: 18, y: 31 }, { x: 38, y: 31 }],
  solids: [
    [5, 4, 13, 8], [22, 4, 12, 8], [38, 4, 13, 8],
    [6, 18, 10, 7], [20, 17, 16, 9], [40, 18, 10, 7],
    [8, 28, 9, 3], [22, 29, 12, 3], [39, 28, 9, 3],
  ],
});

export const REGION_MAPS: Record<RegionZoneId, RegionMapDefinition> = {
  floor549: FLOOR_549_MAP,
  floor548: FLOOR_548_MAP,
  floor547: FLOOR_547_MAP,
  floor546: FLOOR_546_MAP,
  floor545: FLOOR_545_MAP,
};

export const REGION_STARTS: Record<RegionZoneId, RegionPoint> = {
  floor549: { x: 3, y: 33 },
  floor548: { x: 3, y: 33 },
  floor547: { x: 3, y: 33 },
  floor546: { x: 3, y: 33 },
  floor545: { x: 3, y: 33 },
};

export const REGION_TRANSITIONS: Record<string, RegionTransitionSpec> = {
  "floor550:D": { zone: "floor549", position: { x: 52, y: 3 }, message: "Спуск выполнен: этаж 549, кабельный пролёт." },
  "floor549:U": { zone: "floor550", position: { x: 52, y: 33 }, message: "Подъём выполнен: этаж 550, нижний выход Города 550." },
  "floor549:D": { zone: "floor548", position: { x: 3, y: 33 }, message: "Спуск выполнен: этаж 548, насосный каскад." },
  "floor548:U": { zone: "floor549", position: { x: 52, y: 3 }, message: "Подъём выполнен: этаж 549, кабельный пролёт." },
  "floor548:D": { zone: "floor547", position: { x: 3, y: 33 }, message: "Спуск выполнен: этаж 547, архив НИИ-547." },
  "floor547:U": { zone: "floor548", position: { x: 52, y: 3 }, message: "Подъём выполнен: этаж 548, насосный каскад." },
  "floor547:D": { zone: "floor546", position: { x: 3, y: 33 }, message: "Спуск выполнен: этаж 546, грузовой узел ГУ-46." },
  "floor546:U": { zone: "floor547", position: { x: 52, y: 3 }, message: "Подъём выполнен: этаж 547, архив НИИ-547." },
  "floor546:D": { zone: "floor545", position: { x: 3, y: 33 }, message: "Спуск выполнен: поселение 545, Сухой док." },
  "floor545:U": { zone: "floor546", position: { x: 52, y: 3 }, message: "Подъём выполнен: этаж 546, грузовой узел ГУ-46." },
};

export const REGION_POPULATIONS: RegionPopulationSpec[] = [
  { id: "cable-scavengers", name: "Кабельные сборщики", genome: "feral", zone: "floor549", count: 14, agitation: 58, goal: "выдирать силовые жилы и перекрывать маршрут к городу" },
  { id: "pump-servitors", name: "Насосные исполнители", genome: "maintenance", zone: "floor548", count: 16, agitation: 63, goal: "поддерживать давление в давно отключённой системе" },
  { id: "archive-imprints", name: "Архивные слепки", genome: "anomalous", zone: "floor547", count: 12, agitation: 72, goal: "восстановить отсутствующие фрагменты сотрудников НИИ" },
  { id: "cargo-controllers", name: "Контролёры грузового допуска", genome: "bureaucratic", zone: "floor546", count: 18, agitation: 76, goal: "вернуть весь проходящий груз в ведомственный учёт" },
  { id: "dry-dock-settlers", name: "Поселенцы Сухого дока", genome: "maintenance", zone: "floor545", count: 23, agitation: 12, goal: "удерживать караванный путь между 545-м и Городом 550" },
];

export const REGION_ENEMIES: RegionEnemySpec[] = [
  { id: "549-cutter-1", name: "Кабельный резчик 49-А", kind: "stalker", zone: "floor549", position: { x: 12, y: 14 }, patrol: [{ x: 12, y: 14 }, { x: 20, y: 14 }], rank: "enhanced" },
  { id: "549-guard-1", name: "Автомат тягового щита ТЩ-9", kind: "sentry", zone: "floor549", position: { x: 31, y: 14 }, patrol: [{ x: 31, y: 14 }, { x: 37, y: 14 }], rank: "enhanced" },
  { id: "549-hauler", name: "Тяжёлый сборщик кабельной брони", kind: "collector", zone: "floor549", position: { x: 27, y: 29 }, patrol: [{ x: 27, y: 29 }, { x: 44, y: 29 }], rank: "veteran", scale: 1.35 },

  { id: "548-pump-1", name: "Насосный исполнитель НК-4", kind: "sentry", zone: "floor548", position: { x: 17, y: 16 }, patrol: [{ x: 17, y: 16 }, { x: 22, y: 13 }], rank: "enhanced" },
  { id: "548-drowned-1", name: "Утопший обходчик 548-В", kind: "stalker", zone: "floor548", position: { x: 37, y: 14 }, patrol: [{ x: 37, y: 14 }, { x: 47, y: 18 }], rank: "veteran" },
  { id: "548-manifold", name: "Сборщик распределительного коллектора", kind: "collector", zone: "floor548", position: { x: 31, y: 30 }, patrol: [{ x: 31, y: 30 }, { x: 47, y: 30 }], rank: "veteran", scale: 1.45 },

  { id: "547-imprint-1", name: "Слепок архивиста НИИ-547", kind: "stalker", zone: "floor547", position: { x: 16, y: 15 }, patrol: [{ x: 16, y: 15 }, { x: 21, y: 14 }], rank: "enhanced" },
  { id: "547-warden-1", name: "Архивный контролёр АР-7", kind: "sentry", zone: "floor547", position: { x: 34, y: 16 }, patrol: [{ x: 34, y: 16 }, { x: 43, y: 15 }], rank: "veteran" },
  { id: "547-resonator", name: "Резонансный хранитель фонда", kind: "collector", zone: "floor547", position: { x: 30, y: 28 }, patrol: [{ x: 30, y: 28 }, { x: 44, y: 28 }], rank: "elite", scale: 1.7 },

  { id: "546-loader-1", name: "Одичавший грузчик ГУ-46", kind: "stalker", zone: "floor546", position: { x: 18, y: 14 }, patrol: [{ x: 18, y: 14 }, { x: 25, y: 14 }], rank: "veteran" },
  { id: "546-checkpoint", name: "Контролёр накладных КН-46", kind: "sentry", zone: "floor546", position: { x: 42, y: 14 }, patrol: [{ x: 42, y: 14 }, { x: 49, y: 15 }], rank: "veteran" },
  { id: "546-overseer", name: "Смотритель грузового узла ГУ-46", kind: "collector", zone: "floor546", position: { x: 31, y: 28 }, patrol: [{ x: 31, y: 28 }, { x: 44, y: 28 }, { x: 31, y: 14 }], rank: "boss", scale: 2.8 },
];

export const REGION_CONTAINER_CONTENTS: Record<string, RegionContainerEntry[]> = {
  "floor549:11:31": [{ itemId: "bandage", quantity: 2 }, { itemId: "coilPart", quantity: 2 }],
  "floor549:34:12": [{ itemId: "filterCartridge" }, { itemId: "repairKit" }],
  "floor548:10:29": [{ itemId: "traumaInjector" }, { itemId: "bandage", quantity: 2 }],
  "floor548:28:31": [{ itemId: "repairKit" }, { itemId: "coilPart", quantity: 3 }],
  "floor547:9:30": [{ itemId: "painkillers", quantity: 2 }, { itemId: "filterCartridge" }],
  "floor547:43:28": [{ itemId: "coilRifle", condition: 82 }, { itemId: "batteryPack" }],
  "floor546:8:29": [{ itemId: "fieldRation", quantity: 3 }, { itemId: "bandage", quantity: 2 }],
  "floor546:30:17": [{ itemId: "platedVestBn3", condition: 88 }, { itemId: "repairKit" }],
  "floor545:18:31": [{ itemId: "fieldRation", quantity: 2 }, { itemId: "bandage", quantity: 2 }],
  "floor545:38:31": [{ itemId: "filterCartridge", quantity: 2 }, { itemId: "repairKit" }],
};

export const REGION_TERMINAL_MESSAGES: Partial<Record<RegionZoneId, string>> = {
  floor549: "Тяговая ведомость: линия 550–545 обесточена частично. Кабельные сборщики вскрыли три магистральных канала.",
  floor548: "Насосный журнал: уровень воды стабилен только в центральном проходе. Резервная помпа отвечает на команды через раз.",
  floor547: "Архив НИИ-547: сектор закрыт решением комиссии, которой не существует в реестре. Разрыв ВЖ зарегистрирован как канцелярская ошибка.",
  floor546: "ГУ-46: Смотритель продолжает принимать несуществующие составы и удерживает проход к Сухому доку.",
  floor545: "Диспетчерская Сухого дока: караван в Город 550 задержан. Поселение принимает обходчиков и раненых ликвидаторов.",
};

export const REGION_NPC_MESSAGES: Partial<Record<RegionZoneId, string>> = {
  floor545: "Староста Веденеева: «Сухой док держится на караванах. Пока ГУ-46 не очищен, мы живём на запасах и старых обещаниях».",
};

export const REGION_OBJECTIVES: Record<RegionZoneId, string> = {
  floor549: "Пройти кабельный пролёт и восстановить маршрут к насосному каскаду",
  floor548: "Пересечь затопленные насосные залы и найти вход в НИИ-547",
  floor547: "Исследовать архив НИИ-547 или воспользоваться нестабильным разрывом",
  floor546: "Отключить Смотрителя ГУ-46 и открыть путь к поселению 545",
  floor545: "Добраться до Сухого дока, осмотреть поселение и закрепить безопасный маршрут",
};

export const REGION_SAFE_ZONES = new Set<RegionZoneId>(["floor545"]);
