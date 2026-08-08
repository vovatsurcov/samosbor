export type WeaponId =
  | "shockBaton"
  | "breachAxe"
  | "servicePistol"
  | "coilRifle"
  | "horizonCarbine"
  | "launchContour"
  | "pairedTray"
  | "gripMg4"
  | "heatShroud"
  | "ballastBl9"
  | "reflectorOt1"
  | "dischargerRz5"
  | "platelessArmour"
  | "breachGun"
  | "suppressor"
  | "sectorMaul";

export type GearSlot =
  | "head"
  | "body"
  | "hands"
  | "feet"
  | "back"
  | "weapon"
  | "offhand"
  | "artifact";

export type AttributeId = "body" | "reaction" | "attention" | "technique" | "will";

export type ItemId =
  | WeaponId
  | "respiratorIp7"
  | "repairCoatRs12"
  | "installerGloves"
  | "dielectricBoots"
  | "backpackRd54"
  | "platedVestBn3"
  | "hermeticJacketGk3"
  | "quietHoodTo2"
  | "bandage"
  | "fieldRation"
  | "painkillers"
  | "traumaInjector"
  | "filterCartridge"
  | "batteryPack"
  | "breachGun"
  | "suppressor"
  | "resonator"
  | "pryBar"
  | "riotShield"
  | "reserveSidearm"
  | "repairKit"
  | "coilPart"
  | "reverseCoil"
  | "keyWithoutDoor"
  | "seventhToleranceHarness"
  | "elevatorHeartbeat";

// «Снаряжение» — одно понятие и одно имя. Раньше половина предметов была
// объявлена как "clothing", половина как "gear", и ни одна ветка кода их не
// различала: на экране это давало предмет с типом «GEAR» без перевода.
export type ItemKind = "weapon" | "gear" | "consumable" | "material" | "artifact";
export type ItemRarity = "common" | "uncommon" | "rare" | "legendary";
export type ConsumableCategory = "bandage" | "healing" | "pills" | "booster" | "food" | "utility";

export type ItemStats = {
  armor?: number;
  maxHp?: number;
  moveSpeed?: number;
  carry?: number;
  stealth?: number;
  attributes?: Partial<Record<AttributeId, number>>;
};

export type ItemDefinition = {
  id: ItemId;
  name: string;
  shortName: string;
  kind: ItemKind;
  slot?: GearSlot;
  weight: number;
  stackable: boolean;
  description: string;
  rarity?: ItemRarity;
  grantedTalents?: string[];
  stats?: ItemStats;
  useLabel?: string;
  consumableCategory?: ConsumableCategory;
};

export type WeaponDamageType = "kinetic" | "electric" | "thermal" | "resonant";

export type WeaponDefinition = {
  id: WeaponId;
  name: string;
  shortName: string;
  category: "melee" | "ranged";
  range: number;
  /** Урон по ОЗ в шкале боевой модели v2. */
  damage: number;
  /** Урон по стойке: отдельный канал, см. COMBAT_NUMERIC_MODEL_V2.md §1.2. */
  stanceDamage: number;
  damageType: WeaponDamageType;
  penetration: number;
  accuracy: number;
  cooldownMs: number;
  noiseRadius: number;
  description: string;
};

export const WEAPONS: Record<WeaponId, WeaponDefinition> = {
  shockBaton: {
    id: "shockBaton",
    name: "Шоковая дубинка ШД-8",
    shortName: "ШД-8",
    category: "melee",
    range: 1.25,
    damage: 30,
    stanceDamage: 14,
    damageType: "electric",
    penetration: 0,
    accuracy: 5,
    cooldownMs: 780,
    noiseRadius: 1.5,
    description: "Тихое оружие ближнего боя. Высокий урон без громкого сигнала.",
  },
  breachAxe: {
    id: "breachAxe",
    name: "Штурмовой топор ШТ-6",
    shortName: "ШТ-6",
    category: "melee",
    range: 1.4,
    damage: 38,
    stanceDamage: 22,
    damageType: "kinetic",
    penetration: 6,
    accuracy: 4,
    cooldownMs: 940,
    noiseRadius: 3.2,
    description: "Исправный аварийный топор для вскрытия гермоперегородок. Медленнее дубинки, но заметно мощнее.",
  },
  servicePistol: {
    id: "servicePistol",
    name: "Импульсный пистолет ИП-4",
    shortName: "ИП-4",
    category: "ranged",
    range: 3.6,
    damage: 24,
    stanceDamage: 6,
    damageType: "kinetic",
    penetration: 0,
    accuracy: 4,
    cooldownMs: 820,
    noiseRadius: 7,
    description: "Штатное оружие аварийной службы. Универсальная средняя дистанция.",
  },
  coilRifle: {
    id: "coilRifle",
    name: "Катушечная винтовка КВ-11",
    shortName: "КВ-11",
    category: "ranged",
    range: 5.8,
    damage: 52,
    stanceDamage: 16,
    damageType: "electric",
    penetration: 10,
    accuracy: 3,
    cooldownMs: 1450,
    noiseRadius: 9,
    description: "Тяжёлая дальнобойная система. Медленный, но разрушительный выстрел.",
  },
  horizonCarbine: {
    id: "horizonCarbine",
    name: "Карабин «Маятник горизонта»",
    shortName: "Маятник",
    category: "ranged",
    range: 5.2,
    damage: 34,
    stanceDamage: 10,
    damageType: "kinetic",
    penetration: 4,
    accuracy: 5,
    cooldownMs: 820,
    noiseRadius: 7.5,
    description: "Легендарный гиростабилизированный карабин. Сохраняет огонь в движении.",
  },
  breachGun: {
    id: "breachGun",
    name: "Аварийный дробовик АД-9",
    shortName: "АД-9",
    category: "ranged",
    range: 2.6,
    damage: 46,
    stanceDamage: 22,
    damageType: "kinetic",
    penetration: 2,
    accuracy: 2,
    cooldownMs: 700,
    noiseRadius: 9,
    description: "Служебный дробовик для вскрытия завалов. В упор сносит строй, за три клетки бесполезен.",
  },
  suppressor: {
    id: "suppressor",
    name: "Автомат подавления АП-12",
    shortName: "АП-12",
    category: "ranged",
    range: 4.8,
    damage: 14,
    stanceDamage: 5,
    damageType: "kinetic",
    penetration: 1,
    accuracy: 3,
    cooldownMs: 1000,
    noiseRadius: 11,
    description: "Ведомственное автоматическое оружие. Берёт объёмом огня, а не точностью.",
  },
  sectorMaul: {
    id: "sectorMaul",
    name: "Кувалда «Секция двенадцать»",
    shortName: "Секция-12",
    category: "melee",
    range: 1.45,
    damage: 48,
    stanceDamage: 30,
    damageType: "kinetic",
    penetration: 12,
    accuracy: 4,
    cooldownMs: 1120,
    noiseRadius: 4.5,
    description: "Легендарный аварийный инструмент, обрушивающий удар на соседние цели.",
  },
};

export const ITEMS: Record<ItemId, ItemDefinition> = {
  shockBaton: {
    id: "shockBaton",
    name: WEAPONS.shockBaton.name,
    shortName: WEAPONS.shockBaton.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 1.4,
    stackable: false,
    description: WEAPONS.shockBaton.description,
  },
  breachAxe: {
    id: "breachAxe",
    name: WEAPONS.breachAxe.name,
    shortName: WEAPONS.breachAxe.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 3.1,
    stackable: false,
    rarity: "uncommon",
    description: WEAPONS.breachAxe.description,
  },
  servicePistol: {
    id: "servicePistol",
    name: WEAPONS.servicePistol.name,
    shortName: WEAPONS.servicePistol.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 2.2,
    stackable: false,
    description: WEAPONS.servicePistol.description,
  },
  coilRifle: {
    id: "coilRifle",
    name: WEAPONS.coilRifle.name,
    shortName: WEAPONS.coilRifle.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 5.4,
    stackable: false,
    description: WEAPONS.coilRifle.description,
  },
  horizonCarbine: {
    id: "horizonCarbine",
    name: WEAPONS.horizonCarbine.name,
    shortName: WEAPONS.horizonCarbine.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 4.8,
    stackable: false,
    rarity: "legendary",
    grantedTalents: ["legendary:kinetic-gyro"],
    description: `${WEAPONS.horizonCarbine.description} Открывает внешний талант «Инерционный гироскоп».`,
  },
  launchContour: {
    id: "launchContour",
    name: "Пусковой контур ПК-7",
    shortName: "ПК-7",
    kind: "gear",
    slot: "back",
    weight: 2.1,
    stackable: false,
    rarity: "legendary",
    description: "Опытный образец НИИ. Заряд набирается мгновенно, но дыхания на него уходит вдвое больше.",
    stats: {},
  },
  pairedTray: {
    id: "pairedTray",
    name: "Спаренный лоток СЛ-2",
    shortName: "СЛ-2",
    kind: "gear",
    slot: "back",
    weight: 1.9,
    stackable: false,
    rarity: "legendary",
    description: "Ведомственная переделка под две руки. Магазины короче вдвое, зато перезарядка одна на обе руки.",
    stats: {},
  },
  gripMg4: {
    id: "gripMg4",
    name: "Захват МГ-4",
    shortName: "МГ-4",
    kind: "gear",
    slot: "hands",
    weight: 0.8,
    stackable: false,
    rarity: "legendary",
    description: "Ликвидаторский хват. Удар вплотную по резонирующей цели вскрывает её без слома стойки.",
    stats: {},
  },
  heatShroud: {
    id: "heatShroud",
    name: "Кожух перегрева КП-3",
    shortName: "КП-3",
    kind: "gear",
    slot: "body",
    weight: 3.4,
    stackable: false,
    rarity: "legendary",
    description: "Заводская партия с неправильным режимом. Перегрев не глушит оружие, а разряжается во все стороны — и в носителя тоже.",
    stats: { armor: 2 },
  },
  ballastBl9: {
    id: "ballastBl9",
    name: "Балласт БЛ-9",
    shortName: "БЛ-9",
    kind: "gear",
    slot: "feet",
    weight: 5.8,
    stackable: false,
    rarity: "legendary",
    description: "Аварийный груз для работы в сквозняке шахты. Двуручное встаёт намертво: вес уходит в удар, а не в шаг.",
    stats: {},
  },
  reflectorOt1: {
    id: "reflectorOt1",
    name: "Отражатель ОТ-1",
    shortName: "ОТ-1",
    kind: "gear",
    slot: "hands",
    weight: 1.1,
    stackable: false,
    rarity: "legendary",
    description: "Изделие исчезнувшего производства. Парированный удар не сбивает противника, а оставляет на нём резонанс.",
    stats: {},
  },
  dischargerRz5: {
    id: "dischargerRz5",
    name: "Разрядник РЗ-5",
    shortName: "РЗ-5",
    kind: "gear",
    slot: "offhand",
    weight: 1.7,
    stackable: false,
    rarity: "legendary",
    description: "Запрещённая модернизация. Перегрузку наводит любое попадание — и каждое наведение достаётся носителю заражением.",
    stats: {},
  },
  platelessArmour: {
    id: "platelessArmour",
    name: "Пластина без номера",
    shortName: "б/н",
    kind: "gear",
    slot: "body",
    weight: 8.6,
    stackable: false,
    rarity: "legendary",
    description: "Нештатная партия без клейма. Броня работает в полную силу, уклоняться в ней невозможно.",
    stats: { armor: 14 },
  },
  breachGun: {
    id: "breachGun",
    name: WEAPONS.breachGun.name,
    shortName: WEAPONS.breachGun.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 4.6,
    stackable: false,
    description: WEAPONS.breachGun.description,
  },
  suppressor: {
    id: "suppressor",
    name: WEAPONS.suppressor.name,
    shortName: WEAPONS.suppressor.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 5.4,
    stackable: false,
    description: WEAPONS.suppressor.description,
  },
  sectorMaul: {
    id: "sectorMaul",
    name: WEAPONS.sectorMaul.name,
    shortName: WEAPONS.sectorMaul.shortName,
    kind: "weapon",
    slot: "weapon",
    weight: 7.2,
    stackable: false,
    rarity: "legendary",
    grantedTalents: ["legendary:section-collapse"],
    description: `${WEAPONS.sectorMaul.description} Открывает внешний талант «Обрушение секции».`,
  },
  respiratorIp7: {
    id: "respiratorIp7",
    name: "Респиратор ИП-7",
    shortName: "ИП-7",
    kind: "gear",
    slot: "head",
    weight: 1,
    stackable: false,
    description: "Служебная маска с линзовым блоком. Повышает внимание.",
    stats: { attributes: { attention: 1 } },
  },
  repairCoatRs12: {
    id: "repairCoatRs12",
    name: "Ремонтный ватник РС-12",
    shortName: "РС-12",
    kind: "gear",
    slot: "body",
    weight: 3.5,
    stackable: false,
    description: "Плотный штатный ватник. Немного защищает корпус.",
    stats: { armor: 10, maxHp: 14 },
  },
  installerGloves: {
    id: "installerGloves",
    name: "Перчатки монтажника",
    shortName: "ПМ-4",
    kind: "gear",
    slot: "hands",
    weight: 0.8,
    stackable: false,
    description: "Изолированные перчатки с разметкой захвата. +1 к Технике.",
    stats: { attributes: { technique: 1 } },
  },
  dielectricBoots: {
    id: "dielectricBoots",
    name: "Диэлектрические сапоги",
    shortName: "ДС-2",
    kind: "gear",
    slot: "feet",
    weight: 1.8,
    stackable: false,
    description: "Уверенное сцепление с мокрым бетоном. Незначительно повышают скорость.",
    stats: { moveSpeed: 0.12 },
  },
  backpackRd54: {
    id: "backpackRd54",
    name: "Рюкзак РД-54",
    shortName: "РД-54",
    kind: "gear",
    slot: "back",
    weight: 1.5,
    stackable: false,
    description: "Рамный рюкзак аварийной службы. +8 кг переносимого веса.",
    stats: { carry: 8 },
  },
  platedVestBn3: {
    id: "platedVestBn3",
    name: "Броневатник БН-3",
    shortName: "БН-3",
    kind: "gear",
    slot: "body",
    weight: 6.2,
    stackable: false,
    description: "Тяжёлые вставки держат удар, но мешают быстро перемещаться.",
    stats: { armor: 25, maxHp: 16, moveSpeed: -0.18 },
  },
  hermeticJacketGk3: {
    id: "hermeticJacketGk3",
    name: "Гермокуртка ГК-3",
    shortName: "ГК-3",
    kind: "gear",
    slot: "body",
    weight: 3.9,
    stackable: false,
    rarity: "uncommon",
    description: "Усиленная куртка аварийной службы с жёстким воротом и внутренними шинами. +3 к максимальному здоровью.",
    stats: { armor: 12, maxHp: 36 },
  },
  quietHoodTo2: {
    id: "quietHoodTo2",
    name: "Тихий капюшон ТО-2",
    shortName: "ТО-2",
    kind: "gear",
    slot: "head",
    weight: 0.7,
    stackable: false,
    description: "Гасит шорох ткани и блики линз. Снижает слышимость шагов.",
    stats: { stealth: 0.55 },
  },
  bandage: {
    id: "bandage",
    name: "Пакет перевязочный ПП-6",
    shortName: "ПП-6",
    kind: "consumable",
    weight: 0.2,
    stackable: true,
    description: "Восстанавливает 2 ОЗ и на 30 секунд ослабляет одну травму.",
    useLabel: "Перевязать",
    consumableCategory: "bandage",
  },
  fieldRation: {
    id: "fieldRation",
    name: "Полевой паёк ПР-4",
    shortName: "ПР-4",
    kind: "consumable",
    weight: 0.45,
    stackable: true,
    description: "Плотный брикет и сладкий концентрат. Восстанавливает 1 ОЗ и снижает стресс на 8.",
    useLabel: "Съесть",
    consumableCategory: "food",
  },
  painkillers: {
    id: "painkillers",
    name: "Таблетки ПТ-3",
    shortName: "ПТ-3",
    kind: "consumable",
    weight: 0.08,
    stackable: true,
    description: "Полевой анальгетик. На 45 секунд ослабляет самую тяжёлую травму и снижает стресс на 5.",
    useLabel: "Принять",
    consumableCategory: "pills",
  },
  traumaInjector: {
    id: "traumaInjector",
    name: "Травмоинъектор ТИ-9",
    shortName: "ТИ-9",
    kind: "consumable",
    weight: 0.35,
    stackable: true,
    description: "Восстанавливает 4 ОЗ, но резко повышает стресс.",
    useLabel: "Ввести",
    consumableCategory: "healing",
  },
  filterCartridge: {
    id: "filterCartridge",
    name: "Фильтр ФП-12",
    shortName: "ФП-12",
    kind: "consumable",
    weight: 0.4,
    stackable: true,
    description: "Снижает заражение на 15 единиц.",
    useLabel: "Заменить",
    consumableCategory: "utility",
  },
  batteryPack: {
    id: "batteryPack",
    name: "Аккумулятор АБ-18",
    shortName: "АБ-18",
    kind: "consumable",
    weight: 0.8,
    stackable: true,
    description: "Мгновенно перезапускает атакующий контур рембота.",
    useLabel: "Подключить",
    consumableCategory: "booster",
  },
  resonator: {
    id: "resonator",
    name: "Резонатор РН-2",
    shortName: "РН-2",
    kind: "gear",
    slot: "offhand",
    weight: 1.6,
    stackable: false,
    description: "Опытный образец НИИ под левую руку. Сам не бьёт: наводит резонанс и перестраивает уже наведённое.",
    stats: {},
  },
  pryBar: {
    id: "pryBar",
    name: "Монтировка МЛ-3",
    shortName: "МЛ-3",
    kind: "gear",
    slot: "offhand",
    weight: 2.4,
    stackable: false,
    description: "Ломик под левую руку. Позволяет добирать вплотную то, что подготовила правая.",
    stats: {},
  },
  riotShield: {
    id: "riotShield",
    name: "Щит охраны СБ-2",
    shortName: "СБ-2",
    kind: "gear",
    slot: "offhand",
    weight: 4.2,
    stackable: false,
    description: "Штатный щит службы безопасности. Занимает левую руку и меняет то, как персонаж стоит в бою.",
    stats: { armor: 3 },
  },
  reserveSidearm: {
    id: "reserveSidearm",
    name: "Запасной ИП-4",
    shortName: "ИП-4/з",
    kind: "gear",
    slot: "offhand",
    weight: 1.8,
    stackable: false,
    description: "Второй пистолет под левую руку. Стрельба идёт попеременно и заметно плотнее.",
    stats: {},
  },
  repairKit: {
    id: "repairKit",
    name: "Ремкомплект РК-3",
    shortName: "РК-3",
    kind: "consumable",
    weight: 0.9,
    stackable: true,
    description: "Восстанавливает 25% состояния наиболее повреждённой экипировки.",
    useLabel: "Ремонтировать",
    consumableCategory: "utility",
  },
  coilPart: {
    id: "coilPart",
    name: "Катушка автомата КЛ",
    shortName: "Катушка КЛ",
    kind: "material",
    weight: 1.1,
    stackable: true,
    description: "Исправная производственная деталь. Ценится ремонтными службами.",
  },
  reverseCoil: {
    id: "reverseCoil",
    name: "Катушка обратного шага",
    shortName: "К.О.Ш.",
    kind: "artifact",
    slot: "artifact",
    weight: 0.6,
    stackable: false,
    description: "Возвращает к входу в текущую область. Цена: заражение и потеря стабильности.",
    useLabel: "Свернуть путь",
  },
  keyWithoutDoor: {
    id: "keyWithoutDoor",
    name: "Ключ без двери",
    shortName: "КБД",
    kind: "artifact",
    slot: "artifact",
    weight: 0.2,
    stackable: false,
    description: "Насильно открывает межэтажный проход, одновременно запечатывая другой маршрут.",
    useLabel: "Повернуть",
  },
  seventhToleranceHarness: {
    id: "seventhToleranceHarness",
    name: "Разгрузка седьмого допуска",
    shortName: "РСД-7",
    kind: "gear",
    slot: "body",
    weight: 4.6,
    stackable: false,
    rarity: "legendary",
    grantedTalents: ["legendary:seventh-tolerance"],
    description: "Опытный образец НИИ связывает устройства с аномальным контуром и открывает внешний талант.",
    stats: { armor: 18, maxHp: 26, attributes: { technique: 1, will: 1 } },
  },
  elevatorHeartbeat: {
    id: "elevatorHeartbeat",
    name: "Сердцебиение лифта",
    shortName: "СЛ-2",
    kind: "artifact",
    slot: "artifact",
    weight: 0.4,
    stackable: false,
    rarity: "legendary",
    grantedTalents: ["legendary:second-beat"],
    description: "Именной артефакт повторяет удар подъёмного механизма там, где механизма уже нет. Открывает внешний талант.",
    useLabel: "Вызвать второй удар",
  },
};

export const SLOT_NAMES: Record<GearSlot, string> = {
  head: "Голова",
  body: "Корпус",
  hands: "Руки",
  feet: "Ноги",
  back: "Спина",
  weapon: "Правая рука",
  offhand: "Левая рука",
  artifact: "Артефакт",
};
