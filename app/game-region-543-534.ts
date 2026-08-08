export type LowerRegionZoneId =
  | "floor543"
  | "floor542"
  | "floor541"
  | "floor540"
  | "floor539"
  | "floor538"
  | "floor537"
  | "floor536"
  | "floor535"
  | "floor534";

export type LowerRegionPoint = { x: number; y: number };

export type LowerRegionMapDefinition = {
  id: LowerRegionZoneId;
  name: string;
  subtitle: string;
  rows: string[];
};

export type LowerRegionPopulationSpec = {
  id: string;
  name: string;
  genome: "maintenance" | "bureaucratic" | "feral" | "pilgrim" | "anomalous";
  zone: LowerRegionZoneId;
  count: number;
  agitation: number;
  goal: string;
};

export type LowerRegionEnemySpec = {
  id: string;
  name: string;
  kind: "sentry" | "stalker" | "collector";
  zone: LowerRegionZoneId;
  position: LowerRegionPoint;
  patrol: LowerRegionPoint[];
  rank?: "common" | "enhanced" | "veteran" | "elite" | "boss";
  scale?: number;
};

export type LowerRegionContainerEntry = {
  itemId: string;
  quantity?: number;
  condition?: number;
};

const WIDTH = 56;
const HEIGHT = 36;
type Grid = string[][];

type MapOptions = {
  id: LowerRegionZoneId;
  name: string;
  subtitle: string;
  down?: boolean;
  terminal?: LowerRegionPoint;
  npc?: LowerRegionPoint;
  lift?: LowerRegionPoint;
  special?: LowerRegionPoint;
  hermetic?: { x: number; y: number; width: number; height: number; door: "left" | "right" | "top" | "bottom" };
  solids: [number, number, number, number][];
  covers?: LowerRegionPoint[];
  containers?: LowerRegionPoint[];
};

function blankGrid(): Grid {
  return Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1 ? "#" : ".",
    ),
  );
}

function set(grid: Grid, point: LowerRegionPoint, value: string): void {
  if (point.x <= 0 || point.x >= WIDTH - 1 || point.y <= 0 || point.y >= HEIGHT - 1) return;
  grid[point.y][point.x] = value;
}

function solidRect(grid: Grid, x: number, y: number, width: number, height: number): void {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      if (column > 0 && column < WIDTH - 1 && row > 0 && row < HEIGHT - 1) grid[row][column] = "#";
    }
  }
}

function hermeticRoom(grid: Grid, room: NonNullable<MapOptions["hermetic"]>): void {
  const { x, y, width, height, door } = room;
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      const border = row === y || row === y + height - 1 || column === x || column === x + width - 1;
      grid[row][column] = border ? "#" : "g";
    }
  }
  const doorPoint = door === "left"
    ? { x, y: y + Math.floor(height / 2) }
    : door === "right"
      ? { x: x + width - 1, y: y + Math.floor(height / 2) }
      : door === "top"
        ? { x: x + Math.floor(width / 2), y }
        : { x: x + Math.floor(width / 2), y: y + height - 1 };
  set(grid, doorPoint, "H");
}

function buildMap(options: MapOptions): LowerRegionMapDefinition {
  const grid = blankGrid();
  for (const block of options.solids) solidRect(grid, ...block);
  if (options.hermetic) hermeticRoom(grid, options.hermetic);
  for (const point of options.covers ?? []) set(grid, point, "c");
  for (const point of options.containers ?? []) set(grid, point, "B");
  set(grid, { x: 2, y: 33 }, "U");
  if (options.down !== false) set(grid, { x: 52, y: 2 }, "D");
  if (options.terminal) set(grid, options.terminal, "T");
  if (options.npc) set(grid, options.npc, "N");
  if (options.lift) set(grid, options.lift, "L");
  if (options.special) set(grid, options.special, "A");
  return { id: options.id, name: options.name, subtitle: options.subtitle, rows: grid.map((row) => row.join("")) };
}

const A: [number, number, number, number][] = [
  [6, 5, 11, 7], [21, 4, 12, 8], [38, 6, 12, 6],
  [7, 17, 12, 8], [24, 17, 8, 10], [38, 18, 12, 8],
  [12, 29, 12, 3], [31, 29, 12, 3],
];
const B: [number, number, number, number][] = [
  [5, 4, 8, 10], [17, 5, 10, 6], [32, 4, 8, 10], [44, 6, 7, 8],
  [8, 19, 9, 8], [22, 17, 10, 11], [37, 19, 12, 7],
  [18, 30, 8, 3], [34, 29, 11, 4],
];
const C: [number, number, number, number][] = [
  [7, 5, 14, 5], [26, 4, 8, 9], [39, 5, 11, 7],
  [6, 17, 9, 10], [20, 18, 14, 7], [40, 17, 9, 10],
  [9, 30, 9, 3], [23, 28, 12, 4], [40, 30, 8, 3],
];

export const LOWER_REGION_MAPS: Record<LowerRegionZoneId, LowerRegionMapDefinition> = {
  floor543: buildMap({
    id: "floor543",
    name: "Этаж 543 · межгородской технический транзит",
    subtitle: "Грузовые галереи под Городом 545 · старые тяговые кабины и закрытые распределительные посты",
    solids: A,
    hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
    terminal: { x: 48, y: 31 },
    lift: { x: 6, y: 31 },
    covers: [{ x: 18, y: 14 }, { x: 35, y: 15 }, { x: 44, y: 27 }],
    containers: [{ x: 10, y: 31 }, { x: 28, y: 13 }, { x: 46, y: 14 }],
  }),
  floor542: buildMap({
    id: "floor542",
    name: "Этаж 542 · теплообменный пояс",
    subtitle: "Паровые коллекторы и затопленные теплообменники · в гермоблоке живёт малое поселение Тепловой пост",
    solids: B,
    hermetic: { x: 4, y: 25, width: 13, height: 8, door: "bottom" },
    terminal: { x: 49, y: 30 },
    npc: { x: 9, y: 29 },
    covers: [{ x: 15, y: 14 }, { x: 29, y: 15 }, { x: 42, y: 16 }],
    containers: [{ x: 19, y: 29 }, { x: 35, y: 14 }, { x: 48, y: 27 }],
  }),
  floor541: buildMap({
    id: "floor541",
    name: "Этаж 541 · ведомственный архив",
    subtitle: "Брошенные реестры снабжения и перемещения · часть дел относится к городам, отсутствующим на картах",
    solids: C,
    hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
    terminal: { x: 44, y: 27 },
    special: { x: 28, y: 26 },
    covers: [{ x: 16, y: 13 }, { x: 36, y: 14 }, { x: 47, y: 28 }],
    containers: [{ x: 11, y: 28 }, { x: 27, y: 14 }, { x: 46, y: 12 }],
  }),
  floor540: buildMap({
    id: "floor540",
    name: "Этаж 540 · безымянный промышленный пояс",
    subtitle: "Работающие без персонала линии, снятые таблички и грузовые маршруты, которые заканчиваются у запечатанных ворот",
    solids: A,
    hermetic: { x: 4, y: 24, width: 12, height: 9, door: "bottom" },
    terminal: { x: 49, y: 30 },
    covers: [{ x: 20, y: 14 }, { x: 35, y: 16 }, { x: 45, y: 26 }],
    containers: [{ x: 9, y: 29 }, { x: 29, y: 14 }, { x: 47, y: 14 }],
  }),
  floor539: buildMap({
    id: "floor539",
    name: "Город 539 · Город без номера",
    subtitle: "Крупный защищённый город, физически существующий в Гигахрущёвке, но отсутствующий в официальных реестрах",
    solids: [
      [5, 4, 11, 7], [20, 4, 8, 7], [32, 4, 8, 7], [44, 4, 7, 7],
      [6, 16, 10, 8], [21, 15, 14, 10], [40, 16, 10, 8],
      [8, 28, 10, 3], [23, 29, 11, 3], [39, 28, 10, 3],
    ],
    terminal: { x: 47, y: 31 },
    npc: { x: 10, y: 31 },
    lift: { x: 51, y: 31 },
    special: { x: 28, y: 13 },
    covers: [{ x: 17, y: 14 }, { x: 28, y: 26 }, { x: 40, y: 14 }],
    containers: [{ x: 19, y: 31 }, { x: 38, y: 31 }],
  }),
  floor538: buildMap({
    id: "floor538",
    name: "Этаж 538 · карантинный пояс",
    subtitle: "Гермосекции с двойными шлюзами · следы старых эвакуаций и помещения, опечатанные после неизвестного заражения",
    solids: B,
    hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
    terminal: { x: 48, y: 29 },
    covers: [{ x: 16, y: 15 }, { x: 31, y: 15 }, { x: 44, y: 18 }],
    containers: [{ x: 10, y: 30 }, { x: 28, y: 14 }, { x: 47, y: 27 }],
  }),
  floor537: buildMap({
    id: "floor537",
    name: "Этаж 537 · силовая магистраль",
    subtitle: "Высоковольтные коридоры и распределительные клетки · питание нижних линий идёт неизвестному потребителю",
    solids: C,
    hermetic: { x: 4, y: 25, width: 12, height: 8, door: "bottom" },
    terminal: { x: 49, y: 30 },
    lift: { x: 6, y: 31 },
    covers: [{ x: 16, y: 14 }, { x: 36, y: 15 }, { x: 46, y: 25 }],
    containers: [{ x: 10, y: 28 }, { x: 29, y: 14 }, { x: 47, y: 14 }],
  }),
  floor536: buildMap({
    id: "floor536",
    name: "Этаж 536 · машинный лабиринт",
    subtitle: "Старые машинные залы · в защищённом блоке существует малое поселение Моторная артель",
    solids: A,
    hermetic: { x: 41, y: 23, width: 12, height: 10, door: "bottom" },
    terminal: { x: 48, y: 30 },
    npc: { x: 47, y: 28 },
    covers: [{ x: 18, y: 15 }, { x: 34, y: 15 }, { x: 40, y: 27 }],
    containers: [{ x: 10, y: 30 }, { x: 28, y: 14 }, { x: 39, y: 30 }],
  }),
  floor535: buildMap({
    id: "floor535",
    name: "Этаж 535 · глубокий грузовой узел",
    subtitle: "Рельсовые тупики и вертикальные контейнерные шахты · часть грузов маркирована индексом НЛ-507/0",
    solids: B,
    hermetic: { x: 4, y: 25, width: 12, height: 8, door: "bottom" },
    terminal: { x: 49, y: 30 },
    special: { x: 30, y: 15 },
    covers: [{ x: 16, y: 14 }, { x: 34, y: 16 }, { x: 46, y: 26 }],
    containers: [{ x: 10, y: 29 }, { x: 29, y: 13 }, { x: 47, y: 14 }],
  }),
  floor534: buildMap({
    id: "floor534",
    name: "Этаж 534 · нижний разведывательный фронтир",
    subtitle: "Последняя подтверждённая линия текущей экспедиции · дальше идут неучтённые шахты и сигналы Нулевой линии",
    down: false,
    solids: C,
    hermetic: { x: 42, y: 3, width: 11, height: 8, door: "bottom" },
    terminal: { x: 49, y: 30 },
    lift: { x: 6, y: 31 },
    special: { x: 29, y: 27 },
    covers: [{ x: 16, y: 14 }, { x: 37, y: 16 }, { x: 46, y: 27 }],
    containers: [{ x: 10, y: 30 }, { x: 28, y: 14 }, { x: 47, y: 13 }],
  }),
};

export const LOWER_REGION_STARTS: Record<LowerRegionZoneId, LowerRegionPoint> = Object.fromEntries(
  Object.keys(LOWER_REGION_MAPS).map((zone) => [zone, { x: 3, y: 33 }]),
) as Record<LowerRegionZoneId, LowerRegionPoint>;

export const LOWER_REGION_POPULATIONS: LowerRegionPopulationSpec[] = [
  { id: "543-transit-scavengers", name: "Транзитные сборщики", genome: "feral", zone: "floor543", count: 17, agitation: 64, goal: "разбирать тяговые кабины и удерживать верхний маршрут" },
  { id: "542-heat-servitors", name: "Тепловые исполнители", genome: "maintenance", zone: "floor542", count: 15, agitation: 55, goal: "поддерживать температуру несуществующего потребителя" },
  { id: "541-registry-imprints", name: "Реестровые слепки", genome: "bureaucratic", zone: "floor541", count: 18, agitation: 70, goal: "восстанавливать удалённые строки ведомственных архивов" },
  { id: "540-line-workers", name: "Безымянная смена", genome: "maintenance", zone: "floor540", count: 20, agitation: 73, goal: "производить детали без получателя и номера заказа" },
  { id: "539-unregistered-citizens", name: "Жители Города без номера", genome: "maintenance", zone: "floor539", count: 58, agitation: 15, goal: "сохранять город вне официальной системы" },
  { id: "538-quarantine-pack", name: "Карантинные жильцы", genome: "feral", zone: "floor538", count: 22, agitation: 81, goal: "не выпускать живых из бывшей зоны изоляции" },
  { id: "537-grid-keepers", name: "Хранители силовой линии", genome: "bureaucratic", zone: "floor537", count: 19, agitation: 78, goal: "обеспечивать питание закрытого нижнего потребителя" },
  { id: "536-machine-artel", name: "Моторная артель", genome: "maintenance", zone: "floor536", count: 14, agitation: 22, goal: "удерживать машинный гермоблок и ремонтировать караваны" },
  { id: "535-cargo-pilgrims", name: "Паломники накладной", genome: "pilgrim", zone: "floor535", count: 17, agitation: 76, goal: "следовать за грузами с индексом НЛ-507/0" },
  { id: "534-frontier-resonance", name: "Нижний резонанс", genome: "anomalous", zone: "floor534", count: 21, agitation: 86, goal: "закрепиться вокруг сигнала неучтённой нижней линии" },
];

export const LOWER_REGION_ENEMIES: LowerRegionEnemySpec[] = [
  { id: "543-hauler", name: "Транзитный грузчик 43-Г", kind: "collector", zone: "floor543", position: { x: 25, y: 14 }, patrol: [{ x: 25, y: 14 }, { x: 38, y: 14 }], rank: "veteran", scale: 1.45 },
  { id: "543-cutter", name: "Резчик тягового кабеля", kind: "stalker", zone: "floor543", position: { x: 18, y: 27 }, patrol: [{ x: 18, y: 27 }, { x: 36, y: 27 }], rank: "enhanced" },
  { id: "542-boiler", name: "Исполнитель теплообмена Т-42", kind: "sentry", zone: "floor542", position: { x: 30, y: 14 }, patrol: [{ x: 30, y: 14 }, { x: 44, y: 14 }], rank: "veteran" },
  { id: "542-steam", name: "Обваренный обходчик", kind: "stalker", zone: "floor542", position: { x: 25, y: 28 }, patrol: [{ x: 25, y: 28 }, { x: 38, y: 28 }], rank: "enhanced" },
  { id: "541-clerk", name: "Контролёр исключённых записей", kind: "sentry", zone: "floor541", position: { x: 18, y: 14 }, patrol: [{ x: 18, y: 14 }, { x: 32, y: 14 }], rank: "veteran" },
  { id: "541-index", name: "Сборщик карточного индекса", kind: "collector", zone: "floor541", position: { x: 36, y: 27 }, patrol: [{ x: 36, y: 27 }, { x: 47, y: 27 }], rank: "elite", scale: 1.65 },
  { id: "540-worker", name: "Рабочий без табельного номера", kind: "stalker", zone: "floor540", position: { x: 18, y: 14 }, patrol: [{ x: 18, y: 14 }, { x: 30, y: 14 }], rank: "veteran" },
  { id: "540-controller", name: "Контролёр безымянной линии", kind: "sentry", zone: "floor540", position: { x: 40, y: 27 }, patrol: [{ x: 40, y: 27 }, { x: 48, y: 27 }], rank: "elite", scale: 1.7 },
  { id: "538-quarantine", name: "Карантинный сторож К-38", kind: "sentry", zone: "floor538", position: { x: 18, y: 14 }, patrol: [{ x: 18, y: 14 }, { x: 34, y: 14 }], rank: "elite", scale: 1.75 },
  { id: "538-resident", name: "Изолированный жилец", kind: "stalker", zone: "floor538", position: { x: 38, y: 27 }, patrol: [{ x: 38, y: 27 }, { x: 47, y: 27 }], rank: "veteran" },
  { id: "537-grid", name: "Силовой контролёр СМ-37", kind: "sentry", zone: "floor537", position: { x: 24, y: 14 }, patrol: [{ x: 24, y: 14 }, { x: 40, y: 14 }], rank: "elite", scale: 1.8 },
  { id: "537-collector", name: "Сборщик токоведущей брони", kind: "collector", zone: "floor537", position: { x: 34, y: 27 }, patrol: [{ x: 34, y: 27 }, { x: 48, y: 27 }], rank: "elite", scale: 1.85 },
  { id: "536-maze", name: "Машинный бродяга", kind: "stalker", zone: "floor536", position: { x: 18, y: 14 }, patrol: [{ x: 18, y: 14 }, { x: 34, y: 14 }], rank: "veteran" },
  { id: "536-servo", name: "Сервоисполнитель М-36", kind: "collector", zone: "floor536", position: { x: 28, y: 27 }, patrol: [{ x: 28, y: 27 }, { x: 40, y: 27 }], rank: "elite", scale: 1.8 },
  { id: "535-pilgrim", name: "Паломник нулевой накладной", kind: "stalker", zone: "floor535", position: { x: 20, y: 14 }, patrol: [{ x: 20, y: 14 }, { x: 34, y: 14 }], rank: "elite", scale: 1.85 },
  { id: "535-loader", name: "Глубинный погрузчик ГУ-35", kind: "collector", zone: "floor535", position: { x: 37, y: 27 }, patrol: [{ x: 37, y: 27 }, { x: 48, y: 27 }], rank: "elite", scale: 1.95 },
  { id: "534-resonator", name: "Резонансный обходчик 34-Н", kind: "stalker", zone: "floor534", position: { x: 20, y: 14 }, patrol: [{ x: 20, y: 14 }, { x: 35, y: 14 }], rank: "elite", scale: 2.0 },
  { id: "534-frontier", name: "Сторож нижней линии", kind: "collector", zone: "floor534", position: { x: 35, y: 27 }, patrol: [{ x: 35, y: 27 }, { x: 48, y: 27 }, { x: 30, y: 14 }], rank: "boss", scale: 2.65 },
];

export const LOWER_REGION_CONTAINER_CONTENTS: Record<string, LowerRegionContainerEntry[]> = {
  "floor543:10:31": [{ itemId: "coilPart", quantity: 4 }, { itemId: "repairKit" }],
  "floor543:28:13": [{ itemId: "batteryPack" }, { itemId: "bandage", quantity: 2 }],
  "floor542:19:29": [{ itemId: "traumaInjector" }, { itemId: "filterCartridge" }],
  "floor542:35:14": [{ itemId: "repairKit" }, { itemId: "fieldRation", quantity: 2 }],
  "floor541:11:28": [{ itemId: "painkillers", quantity: 2 }, { itemId: "filterCartridge" }],
  "floor541:46:12": [{ itemId: "coilRifle", condition: 86 }, { itemId: "batteryPack" }],
  "floor540:9:29": [{ itemId: "platedVestBn3", condition: 89 }, { itemId: "repairKit" }],
  "floor539:19:31": [{ itemId: "fieldRation", quantity: 3 }, { itemId: "bandage", quantity: 2 }],
  "floor538:10:30": [{ itemId: "filterCartridge", quantity: 2 }, { itemId: "traumaInjector" }],
  "floor537:10:28": [{ itemId: "batteryPack", quantity: 2 }, { itemId: "coilPart", quantity: 4 }],
  "floor536:10:30": [{ itemId: "repairKit", quantity: 2 }, { itemId: "bandage", quantity: 2 }],
  "floor535:10:29": [{ itemId: "fieldRation", quantity: 3 }, { itemId: "filterCartridge" }],
  "floor534:10:30": [{ itemId: "traumaInjector" }, { itemId: "batteryPack", quantity: 2 }],
};

export const LOWER_REGION_TERMINAL_MESSAGES: Partial<Record<LowerRegionZoneId, string>> = {
  floor543: "Транзит 543: линия к нижним этажам существовала в официальной схеме до ревизии 47/Б. Причина закрытия отсутствует.",
  floor542: "Тепловой пост: поселение просит не отключать третий контур. Ни в одной ведомости жители 542-го не числятся потребителями тепла.",
  floor541: "Архив 541: обнаружены накладные на имущество населённых пунктов. Несколько адресов позднее исчезают из реестра полностью.",
  floor540: "Производственный журнал: получатель серии удалён. Линия продолжает выпуск по старому нормативу и складывает продукцию у ворот 539-го.",
  floor539: "Городской терминал 539: официальный номер отсутствует. Внутренний совет использует номер этажа только для связи с внешними обходчиками.",
  floor538: "Карантин 538: эвакуация завершена досрочно. Список вывезенных жителей превышает довоенную численность сектора.",
  floor537: "Силовая магистраль: 31% мощности уходит ниже 534-го по линии без диспетчерского имени.",
  floor536: "Моторная артель: нижние караваны ремонтируются здесь уже три поколения. Официальных заказов не поступало ни разу.",
  floor535: "Грузовой узел 535: контейнеры с индексом НЛ-507/0 следуют вниз пустыми, возвращаются опломбированными.",
  floor534: "Фронтир 534: ниже зарегистрирован устойчивый ответ на служебный запрос. Адрес источника: 507/0.",
};

export const LOWER_REGION_NPC_MESSAGES: Partial<Record<LowerRegionZoneId, string>> = {
  floor542: "Смотритель Теплового поста: «Мы маленькие. Один сломанный контур, и нас здесь больше нет. Город 545 иногда меняет фильтры на наши детали».",
  floor539: "Дежурная Совета 539: «Номера у нас нет. Этаж есть, люди есть, дети есть. А в бумагах нас нет. Не первый год так живём».",
  floor536: "Мастер Моторной артели: «Вниз ходят редко. Возвращаются ещё реже. Но детали оттуда хорошие, старые, будто их вчера выпустили».",
};

export const LOWER_REGION_OBJECTIVES: Record<LowerRegionZoneId, string> = {
  floor543: "Открыть нижний транзит и разведать путь к Тепловому посту",
  floor542: "Проверить Тепловой пост и восстановить связь малого поселения",
  floor541: "Найти документы об удалённых из реестра городах",
  floor540: "Пересечь безымянную производственную линию и открыть ворота 539-го",
  floor539: "Зарегистрировать Город без номера на собственной карте и познакомиться с его Советом",
  floor538: "Пройти карантинный пояс и установить, кого на самом деле эвакуировали отсюда",
  floor537: "Проследить силовую магистраль, уходящую к неучтённому потребителю",
  floor536: "Закрепить маршрут через Моторную артель",
  floor535: "Исследовать грузы НЛ-507/0 и глубокую сортировочную линию",
  floor534: "Закрепить нижний фронтир и определить направление сигнала 507/0",
};

export const LOWER_REGION_SAFE_ZONES = new Set<LowerRegionZoneId>(["floor539"]);
