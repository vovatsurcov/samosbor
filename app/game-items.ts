export type WeaponId =
  | "shockBaton"
  | "breachAxe"
  | "servicePistol"
  | "coilRifle"
  | "horizonCarbine"
  | "sectorMaul";

export type GearSlot =
  | "head"
  | "body"
  | "hands"
  | "feet"
  | "back"
  | "weapon"
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
  | "repairKit"
  | "coilPart"
  | "reverseCoil"
  | "keyWithoutDoor"
  | "seventhToleranceHarness"
  | "elevatorHeartbeat";

export type ItemKind = "weapon" | "clothing" | "consumable" | "material" | "artifact";
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

export type WeaponDefinition = {
  id: WeaponId;
  name: string;
  shortName: string;
  category: "melee" | "ranged";
  range: number;
  damage: number;
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
    damage: 5,
    accuracy: 5,
    cooldownMs: 680,
    noiseRadius: 1.5,
    description: "Тихое оружие ближнего боя. Высокий урон без громкого сигнала.",
  },
  breachAxe: {
    id: "breachAxe",
    name: "Штурмовой топор ШТ-6",
    shortName: "ШТ-6",
    category: "melee",
    range: 1.4,
    damage: 7,
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
    damage: 3,
    accuracy: 4,
    cooldownMs: 920,
    noiseRadius: 7,
    description: "Штатное оружие аварийной службы. Универсальная средняя дистанция.",
  },
  coilRifle: {
    id: "coilRifle",
    name: "Катушечная винтовка КВ-11",
    shortName: "КВ-11",
    category: "ranged",
    range: 5.8,
    damage: 6,
    accuracy: 3,
    cooldownMs: 1550,
    noiseRadius: 9,
    description: "Тяжёлая дальнобойная система. Медленный, но разрушительный выстрел.",
  },
  horizonCarbine: {
    id: "horizonCarbine",
    name: "Карабин «Маятник горизонта»",
    shortName: "Маятник",
    category: "ranged",
    range: 5.2,
    damage: 4,
    accuracy: 5,
    cooldownMs: 760,
    noiseRadius: 7.5,
    description: "Легендарный гиростабилизированный карабин. Сохраняет огонь в движении.",
  },
  sectorMaul: {
    id: "sectorMaul",
    name: "Кувалда «Секция двенадцать»",
    shortName: "Секция-12",
    category: "melee",
    range: 1.45,
    damage: 8,
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
    kind: "clothing",
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
    kind: "clothing",
    slot: "body",
    weight: 3.5,
    stackable: false,
    description: "Плотный штатный ватник. Немного защищает корпус.",
    stats: { armor: 1, maxHp: 1 },
  },
  installerGloves: {
    id: "installerGloves",
    name: "Перчатки монтажника",
    shortName: "ПМ-4",
    kind: "clothing",
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
    kind: "clothing",
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
    kind: "clothing",
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
    kind: "clothing",
    slot: "body",
    weight: 6.2,
    stackable: false,
    description: "Тяжёлые вставки держат удар, но мешают быстро перемещаться.",
    stats: { armor: 3, maxHp: 1, moveSpeed: -0.18 },
  },
  hermeticJacketGk3: {
    id: "hermeticJacketGk3",
    name: "Гермокуртка ГК-3",
    shortName: "ГК-3",
    kind: "clothing",
    slot: "body",
    weight: 3.9,
    stackable: false,
    rarity: "uncommon",
    description: "Усиленная куртка аварийной службы с жёстким воротом и внутренними шинами. +3 к максимальному здоровью.",
    stats: { armor: 1, maxHp: 3 },
  },
  quietHoodTo2: {
    id: "quietHoodTo2",
    name: "Тихий капюшон ТО-2",
    shortName: "ТО-2",
    kind: "clothing",
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
    kind: "clothing",
    slot: "body",
    weight: 4.6,
    stackable: false,
    rarity: "legendary",
    grantedTalents: ["legendary:seventh-tolerance"],
    description: "Опытный образец НИИ связывает устройства с аномальным контуром и открывает внешний талант.",
    stats: { armor: 2, maxHp: 2, attributes: { technique: 1, will: 1 } },
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
  weapon: "Оружие",
  artifact: "Артефакт",
};
