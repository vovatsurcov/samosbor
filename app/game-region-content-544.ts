export type RegionQuestStage =
  | "arrival"
  | "restore-pumps"
  | "recover-archives"
  | "disable-overseer"
  | "report-to-dock"
  | "complete";

export type RegionalProgress = {
  questStage: RegionQuestStage;
  pumpRelays: string[];
  pumpsRestored: boolean;
  researchRecords: string[];
  archiveComplete: boolean;
  bossPhase: 1 | 2 | 3 | 4;
  bossGoalIndex: number;
  bossGoalChangedAtMs: number;
  bossDefeated: boolean;
  settlementTrust: number;
  settlementDefense: number;
  servicesRestored: boolean;
  lowerDockUnlocked: boolean;
};

export type RegionInteractionSpec = {
  id: string;
  zone: "floor548" | "floor547";
  position: { x: number; y: number };
  label: string;
  log: string;
};

export type RegionNpcSpec = {
  id: string;
  name: string;
  kind: "resident" | "merchant" | "liquidator";
  role:
    | "registrar"
    | "grocer"
    | "medic"
    | "weaponsmith"
    | "armorer"
    | "technician"
    | "courier"
    | "porter"
    | "cook"
    | "archivist"
    | "electrician"
    | "watermaster"
    | "tailor"
    | "teacher"
    | "watchman"
    | "resident"
    | "liquidator-leader"
    | "liquidator-chemist"
    | "liquidator-rifleman";
  zone: "floor545" | "floor544";
  route: { x: number; y: number }[];
  speed?: number;
  vendorStock?: string[];
  greeting: string;
};

export const DEFAULT_REGIONAL_PROGRESS: RegionalProgress = {
  questStage: "arrival",
  pumpRelays: [],
  pumpsRestored: false,
  researchRecords: [],
  archiveComplete: false,
  bossPhase: 1,
  bossGoalIndex: 0,
  bossGoalChangedAtMs: 0,
  bossDefeated: false,
  settlementTrust: 0,
  settlementDefense: 8,
  servicesRestored: false,
  lowerDockUnlocked: false,
};

export const REGION_PUMP_RELAYS: Record<string, RegionInteractionSpec> = {
  "floor548:8:4": {
    id: "pump-control",
    zone: "floor548",
    position: { x: 8, y: 4 },
    label: "Запустить центральный пульт насосов",
    log: "Центральный пульт принял команду. Насосы пытаются войти в общий ритм.",
  },
  "floor548:18:12": {
    id: "pump-west",
    zone: "floor548",
    position: { x: 18, y: 12 },
    label: "Замкнуть западное реле",
    log: "Западное реле замкнуто. Чёрная вода начала отступать от мостков.",
  },
  "floor548:47:17": {
    id: "pump-east",
    zone: "floor548",
    position: { x: 47, y: 17 },
    label: "Перезапустить восточную силовую линию",
    log: "Восточная линия ожила. По трубам прошёл тяжёлый удар давления.",
  },
};

export const REGION_RESEARCH_RECORDS: Record<string, RegionInteractionSpec> = {
  "floor547:46:31": {
    id: "archive-commission",
    zone: "floor547",
    position: { x: 46, y: 31 },
    label: "Извлечь протокол несуществующей комиссии",
    log: "Извлечён протокол комиссии, отсутствующей во всех городских реестрах.",
  },
  "floor547:25:8": {
    id: "archive-resonance",
    zone: "floor547",
    position: { x: 25, y: 8 },
    label: "Считать журнал резонансных испытаний",
    log: "Журнал описывает совпадение ритма грузовых автоматов с предвестниками Самосбора.",
  },
  "floor547:43:28": {
    id: "archive-route",
    zone: "floor547",
    position: { x: 43, y: 28 },
    label: "Восстановить схему закрытой нижней линии",
    log: "Восстановлена схема линии, уходящей ниже официальной нумерации этажей.",
  },
};

export const REGION_BOSS_GOALS = [
  "вернуть под контроль сортировочную линию и возобновить приём несуществующих составов",
  "перенаправить питание насосного каскада на грузовые краны ГУ-46",
  "запечатать проход к Сухому доку как объект без действующей накладной",
  "изъять жителей поселения в качестве бесхозного груза",
] as const;

const FLOOR_545_ROUTE_A = [
  { x: 5, y: 32 }, { x: 16, y: 32 }, { x: 28, y: 26 }, { x: 41, y: 15 }, { x: 49, y: 31 },
];
const FLOOR_545_ROUTE_B = [
  { x: 9, y: 31 }, { x: 15, y: 15 }, { x: 28, y: 14 }, { x: 41, y: 15 }, { x: 46, y: 31 },
];
const FLOOR_544_ROUTE_A = [
  { x: 5, y: 32 }, { x: 14, y: 28 }, { x: 27, y: 18 }, { x: 42, y: 27 }, { x: 50, y: 32 },
];
const FLOOR_544_ROUTE_B = [
  { x: 8, y: 9 }, { x: 22, y: 12 }, { x: 34, y: 12 }, { x: 47, y: 9 }, { x: 27, y: 28 },
];

export const REGION_SETTLEMENT_NPCS: RegionNpcSpec[] = [
  {
    id: "dock-elder",
    name: "Староста Лидия Веденеева",
    kind: "resident",
    role: "registrar",
    zone: "floor545",
    route: FLOOR_545_ROUTE_A,
    speed: 0.82,
    greeting: "Сухой док держится не стенами, а теми, кто возвращается с нижних линий.",
  },
  {
    id: "dock-quartermaster",
    name: "Снабженец Егор Мартынов",
    kind: "merchant",
    role: "grocer",
    zone: "floor545",
    route: FLOOR_545_ROUTE_B,
    speed: 0.72,
    vendorStock: ["fieldRation", "bandage", "painkillers", "filterCartridge"],
    greeting: "Пока насосы стоят, продаю только то, что можно унести в одном ящике.",
  },
  {
    id: "dock-medic",
    name: "Фельдшер Ася Ремезова",
    kind: "merchant",
    role: "medic",
    zone: "floor545",
    route: FLOOR_545_ROUTE_A,
    speed: 0.76,
    vendorStock: ["bandage", "painkillers", "traumaInjector"],
    greeting: "Сначала дыхание, потом героизм. В обратном порядке людей обычно приносят.",
  },
  {
    id: "dock-mechanic",
    name: "Механик Назар Костров",
    kind: "merchant",
    role: "technician",
    zone: "floor545",
    route: FLOOR_545_ROUTE_B,
    speed: 0.8,
    vendorStock: ["repairKit", "batteryPack", "coilPart"],
    greeting: "Верни давление на 548-м, и мастерская снова сможет держать дугу.",
  },
  {
    id: "dock-scout",
    name: "Разведчица Инга Ратникова",
    kind: "liquidator",
    role: "liquidator-rifleman",
    zone: "floor545",
    route: FLOOR_545_ROUTE_A,
    speed: 1.25,
    greeting: "Смотритель не охраняет узел. Он оформляет весь регион как собственный груз.",
  },
  {
    id: "dock-archivist",
    name: "Архивист Семён Левин",
    kind: "resident",
    role: "archivist",
    zone: "floor545",
    route: FLOOR_545_ROUTE_B,
    greeting: "НИИ-547 закрыли так тщательно, что забыли объяснить, кто именно его закрыл.",
  },
  {
    id: "lower-foreman",
    name: "Мастер нижнего дока Рудольф Яшин",
    kind: "merchant",
    role: "weaponsmith",
    zone: "floor544",
    route: FLOOR_544_ROUTE_A,
    speed: 0.78,
    vendorStock: ["shockBaton", "servicePistol", "breachAxe", "coilRifle"],
    greeting: "Нижний док производит мало, зато каждую вещь здесь проверяют дверью и молотком.",
  },
  {
    id: "lower-armorer",
    name: "Бронник Зоя Устинова",
    kind: "merchant",
    role: "armorer",
    zone: "floor544",
    route: FLOOR_544_ROUTE_B,
    speed: 0.74,
    vendorStock: ["hermeticJacketGk3", "platedVestBn3", "respiratorIp7"],
    greeting: "Броня должна пережить владельца ровно настолько, чтобы его успели вытащить.",
  },
  {
    id: "lower-warden",
    name: "Смотритель гермоконтура Савелий Чен",
    kind: "resident",
    role: "watchman",
    zone: "floor544",
    route: FLOOR_544_ROUTE_A,
    greeting: "Нижний контур старше поселения. Он не любит, когда его называют безопасным.",
  },
  {
    id: "lower-medic",
    name: "Санитарка Нелли Прохорова",
    kind: "merchant",
    role: "medic",
    zone: "floor544",
    route: FLOOR_544_ROUTE_B,
    vendorStock: ["bandage", "traumaInjector", "filterCartridge"],
    greeting: "Внизу лечат быстро. Сирена редко даёт закончить процедуру красиво.",
  },
  {
    id: "lower-liquidator",
    name: "Старший ликвидатор Дорофеев",
    kind: "liquidator",
    role: "liquidator-leader",
    zone: "floor544",
    route: FLOOR_544_ROUTE_A,
    speed: 1.3,
    greeting: "Следующий пояс уже не считает нас соседями. Там каждый выход оформляется как операция.",
  },
  {
    id: "lower-resident",
    name: "Рабочая Тамара Седых",
    kind: "resident",
    role: "resident",
    zone: "floor544",
    route: FLOOR_544_ROUTE_B,
    greeting: "Когда краны молчат, слышно, как этаж под нами двигает стены.",
  },
];

export const REGION_SETTLEMENT_CONVERSATIONS: [string, string][] = [
  ["На 548-м снова упало давление.", "Костров говорит, ещё один такой провал и мастерская встанет."],
  ["Смотритель передал новую накладную.", "На людей? Тогда сожги её вместе с курьером-автоматом."],
  ["Архивист просит бумагу из НИИ.", "Он просит бумагу даже тогда, когда приносишь ему пожар."],
  ["Караван из Города 550 вышел?", "Вышел. Вернётся ли, это уже другой документ."],
  ["Нижний док снова слышал гул.", "Чен проверяет контур. Значит, лучше не мешать."],
  ["После запуска насосов вода ушла на два пролёта.", "И открыла то, что раньше прятала."],
];

export function createRegionalProgress(saved?: Partial<RegionalProgress>): RegionalProgress {
  return {
    ...DEFAULT_REGIONAL_PROGRESS,
    ...saved,
    pumpRelays: Array.isArray(saved?.pumpRelays) ? [...new Set(saved.pumpRelays)] : [],
    researchRecords: Array.isArray(saved?.researchRecords) ? [...new Set(saved.researchRecords)] : [],
  };
}

export function bossPhaseFor(hp: number, maxHp: number): 1 | 2 | 3 | 4 {
  if (hp <= 0) return 4;
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  if (ratio <= 0.33) return 3;
  if (ratio <= 0.66) return 2;
  return 1;
}

export function regionalObjective(progress: RegionalProgress, zone: string): string | null {
  if (zone === "floor544") return "Осмотреть производственный и оборонительный контуры нижнего Сухого дока";
  if (progress.questStage === "arrival") return zone === "floor545" ? "Поговорить со старостой Веденеевой" : null;
  if (progress.questStage === "restore-pumps") return "Запустить три силовых узла насосного каскада на этаже 548";
  if (progress.questStage === "recover-archives") return "Извлечь три записи НИИ-547 и установить причину поведения Смотрителя";
  if (progress.questStage === "disable-overseer") return "Отключить Смотрителя ГУ-46 на этаже 546";
  if (progress.questStage === "report-to-dock") return "Вернуться к старосте Сухого дока и доложить о восстановлении маршрута";
  if (progress.questStage === "complete" && zone === "floor545") return "Спуститься в нижний Сухой док на этаж 544";
  return null;
}
