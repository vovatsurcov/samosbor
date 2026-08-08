/**
 * Направления общего дерева. Это НЕ классы: игрок не выбирает направление,
 * оно проявляется из набранных талантов. Классовые ветки скрытности и
 * инженерной службы упразднены — см. docs/TALENT_TREE_V2.md.
 */
export type SkillBranch =
  | "power"
  | "guard"
  | "agility"
  | "precision"
  | "suppression"
  | "resonance";

export type TalentScope = "core" | SkillBranch | "hybrid" | "legendary";
export type TalentKind = "minor" | "notable" | "protocol" | "keystone" | "permit" | "external";

export type TalentBonusKey =
  | "maxHp"
  | "armor"
  | "moveSpeed"
  | "carry"
  | "meleeDamage"
  | "rangedDamage"
  | "accuracy"
  | "attackSpeed"
  | "stealth"
  | "noiseReduction"
  | "splash"
  | "autoTarget"
  | "movingFire"
  | "dizzy"
  | "microStun"
  | "tauntRadius"
  | "droneDamage"
  | "droneSpeed"
  | "voidStability"
  | "contaminationResist"
  | "block"
  | "markPower"
  | "critical"
  | "healing"
  | "stressResist"
  // Пассивные слои защиты: блок, парирование и уклонение — свойства сборки,
  // а не нажатия (app/game-defence.ts).
  | "blockPower"
  | "parry"
  | "evasion"
  | "resistKinetic"
  | "resistThermal"
  | "resistChemical"
  | "resistAnomalous"
  | "staggerResist"
  | "chargeRate"
  | "chargeSteps"
  | "chargePower";

export type TalentBonuses = Partial<Record<TalentBonusKey, number>>;

export type TalentNode = {
  id: string;
  name: string;
  description: string;
  scope: TalentScope;
  kind: TalentKind;
  tier: number;
  cost: number;
  requiredBranchPoints?: number;
  pair?: [SkillBranch, SkillBranch];
  tags: string[];
  bonuses: TalentBonuses;
};

export type ActiveSkillId =
  | "force-charge"
  | "force-arc"
  | "force-execute"
  | "fire-mark"
  | "fire-burst"
  | "fire-relocate"
  | "stealth-muffle"
  | "stealth-decoy"
  | "stealth-isolate"
  | "bulwark-brace"
  | "bulwark-challenge"
  | "bulwark-counter"
  | "engineer-deploy"
  | "engineer-designate"
  | "engineer-overclock"
  | "resonance-distort"
  | "resonance-collapse"
  | "resonance-stabilize";

export type ActiveSkillDefinition = {
  id: ActiveSkillId;
  name: string;
  shortName: string;
  branch: SkillBranch;
  unlockAt: 1 | 4 | 8;
  role: "entry" | "setup" | "builder" | "spender" | "defense" | "exit";
  cooldownMs: number;
  tags: string[];
  description: string;
};

/**
 * Канонические названия шести направлений. Имя направления совпадает с именем
 * его ресурса: игрок видит одно слово везде — в дереве, в панели ресурса и в
 * читаемом архетипе. Технические идентификаторы (`power`, `agility`, …)
 * оставлены как есть, чтобы не ломать сохранения.
 */
export const SKILL_NAMES: Record<SkillBranch, string> = {
  power: "Разгон",
  guard: "Опора",
  agility: "Темп",
  precision: "Прицел",
  suppression: "Температура",
  resonance: "Резонанс",
};

export const SKILL_DESCRIPTIONS: Record<SkillBranch, string> = {
  power: "Разгон, таран, заряжаемый удар и слом чужой стойки.",
  guard: "Защитная стойка, устойчивость, сопротивление ошеломлению и удержание прохода.",
  agility: "Уклонение, парирование, серии, смена позиции и удары в спину.",
  precision: "Метки, прицел, точные выстрелы и контроль дистанции.",
  suppression: "Позиция, раскрутка, подавление, перегрев и тяжёлые устройства.",
  resonance: "Искажение, резонансные метки, цепи и разрыв синхронизации.",
};

type BranchEntry = [name: string, description: string, bonuses: TalentBonuses, tags?: string[]];

const BRANCH_ENTRIES: Record<SkillBranch, BranchEntry[]> = {
  power: [
    ["Рабочий замах", "+1 к урону ближнего боя.", { meleeDamage: 1 }, ["melee"]],
    ["Короткий разгон", "+4% к скорости перемещения при сближении.", { moveSpeed: 0.04 }, ["movement"]],
    ["Срыв опоры", "Тяжёлые попадания сильнее давят на стойку цели.", { microStun: 0.08 }, ["control"]],
    ["Масса инструмента", "+2 кг грузоподъёмности и +1% площадного урона.", { carry: 2, splash: 0.01 }],
    ["Протокол тарана", "Открывает силовой вход в бой.", { meleeDamage: 1 }, ["protocol", "entry"]],
    ["Широкая дуга", "+12% урона соседним целям.", { splash: 0.12 }, ["area"]],
    ["Плечо в замах", "Заряд копится на четверть быстрее.", { chargeRate: 0.25 }, ["charge"]],
    ["Обратный импульс", "Контроль цели ускоряет следующую атаку.", { attackSpeed: 0.03 }, ["control"]],
    ["Регламент пролома", "Удары по отмеченным целям наносят больше урона.", { meleeDamage: 2 }, ["protocol", "mark"]],
    ["Секция целиком", "+16% площадного урона.", { splash: 0.16 }, ["area"]],
    ["Плечом вперёд", "+6% скорости и +1 брони в ближнем бою.", { moveSpeed: 0.06, armor: 1 }, ["movement"]],
    ["Не отпускать", "Автовыбор ближайшей цели ближнего боя.", { autoTarget: 1 }, ["passive"]],
    ["Долгий замах", "Заряд получает четвёртую ступень.", { chargeSteps: 1 }, ["protocol", "charge"]],
    ["Вес удара", "Каждая ступень заряда бьёт заметно сильнее.", { chargePower: 0.08 }, ["charge"]],
    ["Пробой контура", "+3 к урону ближнего боя.", { meleeDamage: 3 }, ["notable", "melee"]],
    ["Нарушение: масса решает", "Полный заряд ломает стойку любой небоссовой цели.", { chargePower: 0.14, chargeSteps: 1, microStun: 0.2 }, ["keystone", "charge"]],
  ],
  guard: [
    ["Уверенный упор", "+2 брони.", { armor: 2 }, ["defense"]],
    ["Ремень снаряжения", "+3 кг грузоподъёмности.", { carry: 3 }],
    ["Пластинчатая вставка", "+6% шанса блока.", { block: 0.06 }, ["protocol", "block"]],
    ["Кинетический настил", "+8% сопротивления кинетическому воздействию.", { resistKinetic: 0.08 }, ["resist"]],
    ["Плотный контур", "+3 брони.", { armor: 3 }, ["defense"]],
    ["Широкий хват", "+8% шанса блока.", { block: 0.08 }, ["block"]],
    ["Устойчивость", "Входящий урон по стойке снижен на 15%.", { staggerResist: 0.15 }, ["stagger"]],
    ["Гасящая подложка", "Сработавший блок снимает на 10% больше урона.", { blockPower: 0.1 }, ["notable", "block"]],
    ["Регламент удержания", "Провокация собирает противников плотнее.", { tauntRadius: 2 }, ["protocol", "control"]],
    ["Второе плечо", "+10% шанса блока и +1 ОЗ на уровень контура.", { block: 0.1, maxHp: 1 }, ["notable", "block"]],
    ["Ровно на ногах", "Ещё 15% сопротивления урону по стойке.", { staggerResist: 0.15 }, ["stagger"]],
    ["Аварийная изоляция", "+10% сопротивления термическому и химическому воздействию.", { resistThermal: 0.1, resistChemical: 0.1 }, ["resist"]],
    ["Протокол гермодвери", "Сработавший блок снимает ещё на 12% больше урона.", { blockPower: 0.12 }, ["protocol", "block"]],
    ["Держать проход", "Провокация и броня усиливаются в узких местах.", { tauntRadius: 2, armor: 3 }, ["control"]],
    ["Несдвигаемый", "+4 брони и +12% сопротивления ошеломлению.", { armor: 4, staggerResist: 0.12 }, ["notable", "defense"]],
    ["Нарушение: глухой контур", "Блок гасит почти весь удар и держит стойку намертво, но контур сковывает движение: скорость ниже на четверть.", { blockPower: 0.3, block: 0.12, staggerResist: 0.25, moveSpeed: -0.25 }, ["keystone", "block"]],
  ],
  agility: [
    ["Лёгкий шаг", "+4% к скорости перемещения.", { moveSpeed: 0.04 }, ["movement"]],
    ["Тихая подошва", "Снижает шум шагов.", { noiseReduction: 0.2 }, ["stealth"]],
    ["Скользящий уход", "+5% шанса полностью уклониться от удара.", { evasion: 0.05 }, ["protocol", "evasion"]],
    ["Чтение замаха", "+4% шанса уклонения.", { evasion: 0.04 }, ["evasion"]],
    ["Протокол ухода", "+3% скорости и +1% критического шанса.", { moveSpeed: 0.03, critical: 0.01 }, ["protocol"]],
    ["Разрыв контакта", "+25% скрытности при выходе из боя.", { stealth: 0.25 }, ["stealth"]],
    ["Встречное движение", "+6% шанса парировать удар: защита обращается в атаку.", { parry: 0.06 }, ["notable", "parry"]],
    ["Скорость кисти", "+4% к скорости атак.", { attackSpeed: 0.04 }, ["melee"]],
    ["Регламент серии", "+2% критического шанса.", { critical: 0.02 }, ["protocol"]],
    ["Точка под ребро", "+3% критического шанса по изолированной цели.", { critical: 0.03 }, ["notable"]],
    ["Длинный шаг", "+6% шанса уклонения.", { evasion: 0.06 }, ["evasion"]],
    ["Смена стороны", "+6% скорости перемещения.", { moveSpeed: 0.06 }, ["movement"]],
    ["Протокол тени", "Скрытность и снижение шума растут.", { stealth: 0.3, noiseReduction: 0.25 }, ["protocol", "stealth"]],
    ["Зеркальный ответ", "+8% шанса парирования.", { parry: 0.08 }, ["parry"]],
    ["Работа по слабому", "+4% критического шанса.", { critical: 0.04 }, ["notable"]],
    ["Нарушение: чужой темп", "Парирование становится основным слоем защиты, но броня на герое почти не работает: тяжёлое снаряжение мешает встречному движению.", { parry: 0.18, evasion: 0.08, attackSpeed: 0.06, armor: -6 }, ["keystone", "parry"]],
  ],
  precision: [
    ["Огневая поправка", "+1 к урону дальнего боя.", { rangedDamage: 1 }, ["ranged"]],
    ["Ровный хват", "+1 к точности.", { accuracy: 1 }, ["ranged"]],
    ["Протокол метки", "Открывает огневую метку.", { markPower: 1 }, ["protocol", "mark"]],
    ["Дальний контроль", "Метка держится дольше и бьёт сильнее.", { markPower: 1 }, ["mark"]],
    ["Стрельба на ходу", "Автоогонь не сбрасывает маршрут.", { movingFire: 1 }, ["protocol", "movement"]],
    ["Второй выстрел", "+2 к урону дальнего боя.", { rangedDamage: 2 }, ["ranged"]],
    ["Головокружение", "Попадания накапливают дезориентацию.", { dizzy: 1 }, ["control"]],
    ["Смена позиции", "+5% скорости перемещения после выстрела.", { moveSpeed: 0.05 }, ["movement"]],
    ["Регламент прицела", "+2 к точности.", { accuracy: 2 }, ["protocol", "ranged"]],
    ["Микрооглушение", "Третья дезориентация срывает подготовку атаки.", { microStun: 0.2 }, ["notable", "interrupt"]],
    ["Холодный расчёт", "+3% критического шанса.", { critical: 0.03 }, ["ranged"]],
    ["Плотная группа", "+3 к урону дальнего боя.", { rangedDamage: 3 }, ["ranged"]],
    ["Протокол наблюдателя", "Метка видна сквозь стены и усиливает союзный урон.", { markPower: 2 }, ["protocol", "mark"]],
    ["Дыхание на спуске", "+4% к скорости атак дальнего боя.", { attackSpeed: 0.04 }, ["ranged"]],
    ["Работа по приоритету", "+4 к урону по отмеченной цели.", { rangedDamage: 4, markPower: 1 }, ["notable", "mark"]],
    ["Нарушение: один выстрел", "Первый выстрел по не заметившей цели всегда критический.", { critical: 0.08, markPower: 2, accuracy: 2 }, ["keystone", "ranged"]],
  ],
  suppression: [
    ["Упор приклада", "+1 к урону дальнего боя.", { rangedDamage: 1 }, ["ranged"]],
    ["Тяжёлый ремень", "+4 кг грузоподъёмности.", { carry: 4 }],
    ["Протокол позиции", "Устойчивая позиция повышает урон.", { rangedDamage: 1, armor: 1 }, ["protocol", "position"]],
    ["Ровная лента", "Ствол греется на 15% медленнее.", { attackSpeed: 0.03 }, ["heat"]],
    ["Подавляющий огонь", "Открывает подавление участка.", { tauntRadius: 2 }, ["protocol", "control"]],
    ["Раскрутка", "+5% к скорости атак в позиции.", { attackSpeed: 0.05 }, ["heat"]],
    ["Пробитие строя", "+10% урона соседним целям.", { splash: 0.1 }, ["area"]],
    ["Развёрнутый контур", "+2 брони в позиции.", { armor: 2 }, ["position"]],
    ["Регламент подавления", "Подавление держит противников дольше.", { tauntRadius: 2, microStun: 0.1 }, ["protocol", "control"]],
    ["Тяжёлый калибр", "+3 к урону дальнего боя.", { rangedDamage: 3 }, ["notable", "ranged"]],
    ["Устройство сопровождения", "Выводит рембота и усиливает его.", { droneDamage: 1 }, ["device"]],
    ["Скорость привода", "+8% скорости рембота.", { droneSpeed: 0.08 }, ["device"]],
    ["Протокол коридора", "+16% урона соседним целям.", { splash: 0.16 }, ["protocol", "area"]],
    ["Толстый кожух", "+12% сопротивления урону по стойке.", { staggerResist: 0.12 }, ["position"]],
    ["Сектор простреливается", "+4 к урону дальнего боя из позиции.", { rangedDamage: 4 }, ["notable", "position"]],
    ["Нарушение: коридор закрыт", "Подавление снимает у целей дыхание и удерживает их вне сближения.", { tauntRadius: 3, microStun: 0.18, splash: 0.2 }, ["keystone", "control"]],
  ],
  resonance: [
    ["Резонансный слух", "+4% сопротивления заражению.", { contaminationResist: 0.04 }, ["anomaly"]],
    ["Наведённая помеха", "+1 к силе меток.", { markPower: 1 }, ["anomaly", "mark"]],
    ["Протокол искажения", "Открывает наложение резонанса.", { markPower: 1 }, ["protocol", "anomaly"]],
    ["Стабильный контур", "Войд-зона стабильнее на 6%.", { voidStability: 0.06 }, ["anomaly"]],
    ["Цепной след", "+10% урона соседним целям.", { splash: 0.1 }, ["protocol", "area"]],
    ["Глушение сигнала", "Дезориентация накапливается быстрее.", { dizzy: 1 }, ["control"]],
    ["Обратная тень", "+6% сопротивления заражению.", { contaminationResist: 0.06 }, ["anomaly"]],
    ["Разрыв команды", "Аномальный контроль прерывает подготовку атаки.", { microStun: 0.12 }, ["interrupt"]],
    ["Регламент резонанса", "+2 к силе меток.", { markPower: 2 }, ["protocol", "mark"]],
    ["Зона тишины", "Снижает шум и повышает скрытность.", { noiseReduction: 0.25, stealth: 0.2 }, ["notable", "anomaly"]],
    ["Запас устойчивости", "Войд-зона стабильнее ещё на 8%.", { voidStability: 0.08 }, ["anomaly"]],
    ["Резонансный след", "Автоатаки поддерживают искажение цели.", { autoTarget: 1, markPower: 1 }, ["passive"]],
    ["Протокол схлопывания", "+16% урона соседним целям.", { splash: 0.16 }, ["protocol", "area"]],
    ["Плата за силу", "+8% сопротивления заражению.", { contaminationResist: 0.08 }, ["anomaly"]],
    ["Ломкая синхронизация", "+16% контроля и +1 к силе меток.", { microStun: 0.16, markPower: 1 }, ["notable", "control"]],
    ["Нарушение: нулевая инструкция", "Схлопывание не требует остановки, но повышает заражение.", { movingFire: 1, splash: 0.16, contaminationResist: -0.06 }, ["keystone", "anomaly"]],
  ],
};

const tierForIndex = (index: number) => (index < 5 ? 1 : index < 10 ? 2 : index < 15 ? 3 : 4);
const thresholdForIndex = (index: number) => (index < 5 ? 0 : index < 10 ? 4 : index < 15 ? 8 : 14);

function makeBranchNodes(branch: SkillBranch): TalentNode[] {
  return BRANCH_ENTRIES[branch].map(([name, description, bonuses, tags = []], index) => ({
    id: `${branch}:${String(index + 1).padStart(2, "0")}`,
    name,
    description,
    scope: branch,
    kind: index === 15 ? "keystone" : [4, 9, 14].includes(index) ? "notable" : [2, 7, 12].includes(index) ? "protocol" : "minor",
    tier: tierForIndex(index),
    cost: 1,
    requiredBranchPoints: thresholdForIndex(index),
    tags,
    bonuses,
  }));
}

const CORE_TALENTS: TalentNode[] = [
  ["core:01", "Полевая подготовка", "+1 ОЗ.", { maxHp: 1 }],
  ["core:02", "Рабочая реакция", "+3% скорости перемещения.", { moveSpeed: 0.03 }],
  ["core:03", "Штатный ремень", "+2 кг грузоподъёмности.", { carry: 2 }],
  ["core:04", "Проверка сектора", "+1 к точности.", { accuracy: 1 }],
  ["core:05", "Сменный фильтр", "+4% сопротивления заражению.", { contaminationResist: 0.04 }],
  ["core:06", "Собранность", "Стресс накапливается медленнее.", { stressResist: 0.05 }],
  ["core:07", "Темп смены", "+2% к скорости атак.", { attackSpeed: 0.02 }],
  ["core:08", "Слой ткани", "+1 брони.", { armor: 1 }],
  ["core:09", "Первая помощь", "+8% эффективности лечения.", { healing: 0.08 }],
  ["core:10", "Общий допуск", "+1% критического шанса и +1 кг груза.", { critical: 0.01, carry: 1 }],
].map(([id, name, description, bonuses], index) => ({
  id: id as string,
  name: name as string,
  description: description as string,
  scope: "core" as const,
  kind: index === 9 ? "notable" as const : "minor" as const,
  tier: index < 5 ? 1 : 2,
  cost: 1,
  tags: ["core"],
  bonuses: bonuses as TalentBonuses,
}));

const BRANCHES = Object.keys(SKILL_NAMES) as SkillBranch[];

const HYBRID_DEFINITIONS: [SkillBranch, SkillBranch, string, string, TalentBonuses][] = [
  ["power", "guard", "Гермоштурм", "Блок и провокация усиливают следующий силовой удар.", { armor: 1, meleeDamage: 1, tauntRadius: 1 }],
  ["power", "agility", "Тихий пролом", "Первая тяжёлая атака после потери контакта поражает область.", { splash: 0.12, critical: 0.04 }],
  ["power", "precision", "Ударная баллистика", "Выстрел по дезориентированной цели создаёт силовой импульс.", { rangedDamage: 1, microStun: 0.08 }],
  ["power", "suppression", "Приводной молот", "Устройство добавляет импульс к площадному удару.", { droneDamage: 1, splash: 0.1 }],
  ["power", "resonance", "Сдвиг массы", "Тяжёлые удары накладывают резонанс и дезориентацию.", { meleeDamage: 1, dizzy: 1 }],
  ["guard", "agility", "Встречный контур", "Блок и парирование работают в одной сборке: оба слоя усиливаются.", { block: 0.06, parry: 0.06 }],
  ["guard", "precision", "Огневая позиция", "Упор повышает точность и темп стрельбы.", { accuracy: 1, attackSpeed: 0.04 }],
  ["guard", "suppression", "Сервисный бастион", "Устройство ремонтирует удерживаемый контур.", { maxHp: 1, healing: 0.12, droneDamage: 1 }],
  ["guard", "resonance", "Неподвижная аномалия", "Упор стабилизирует войд-зону и усиливает блок.", { block: 0.04, voidStability: 0.08 }],
  ["agility", "precision", "Безэховая серия", "Стрельба на ходу производит меньше шума.", { movingFire: 1, noiseReduction: 0.45 }],
  ["agility", "suppression", "Разведывательный контур", "Устройство отвлекает цели, пока герой меняет позицию.", { droneSpeed: 0.06, stealth: 0.25 }],
  ["agility", "resonance", "Войд-проводник", "Искажение скрывает движение и снижает шум.", { stealth: 0.35, noiseReduction: 0.3 }],
  ["precision", "suppression", "Оператор огневых систем", "Попадания героя заряжают устройство, а оно поддерживает метку.", { droneSpeed: 0.08, markPower: 1 }],
  ["precision", "resonance", "Резонансный боеприпас", "Каждое третье попадание способно сорвать подготовку атаки.", { dizzy: 1, microStun: 0.14 }],
  ["suppression", "resonance", "Контурщик НИИ", "Устройства накладывают резонанс, а схлопывание их перезапускает.", { droneDamage: 1, markPower: 1, voidStability: 0.05 }],
];

const HYBRID_TALENTS: TalentNode[] = HYBRID_DEFINITIONS.map(([left, right, name, description, bonuses]) => ({
  id: `hybrid:${left}-${right}`,
  name,
  description,
  scope: "hybrid",
  kind: "permit",
  tier: 1,
  cost: 1,
  pair: [left, right],
  tags: [left, right, "hybrid"],
  bonuses,
}));

export const LEGENDARY_TALENTS: TalentNode[] = [
  {
    id: "legendary:kinetic-gyro",
    name: "Инерционный гироскоп «Маятник»",
    description: "Автоогонь не сбрасывает маршрут. Попадания вызывают головокружение, третье срывает подготовку атаки микрооглушением.",
    scope: "legendary",
    kind: "external",
    tier: 1,
    cost: 1,
    tags: ["ranged", "movement", "interrupt", "passive"],
    bonuses: { movingFire: 1, autoTarget: 1, dizzy: 1, microStun: 0.25 },
  },
  {
    id: "legendary:section-collapse",
    name: "Обрушение секции",
    description: "Тяжёлые удары поражают соседние цели и провоцируют всю пачку вокруг точки попадания.",
    scope: "legendary",
    kind: "external",
    tier: 1,
    cost: 1,
    tags: ["melee", "area", "passive"],
    bonuses: { splash: 0.55, tauntRadius: 4, autoTarget: 1 },
  },
  {
    id: "legendary:seventh-tolerance",
    name: "Седьмой допуск",
    description: "Устройства получают тег аномалии и могут поддерживать резонансную ротацию.",
    scope: "legendary",
    kind: "external",
    tier: 1,
    cost: 1,
    tags: ["device", "anomaly", "hybrid"],
    bonuses: { droneDamage: 2, markPower: 1, contaminationResist: 0.06 },
  },
  {
    id: "legendary:second-beat",
    name: "Второй удар лифта",
    description: "После опасного снижения здоровья артефактный контур один раз стабилизирует героя и ускоряет выход из боя.",
    scope: "legendary",
    kind: "external",
    tier: 1,
    cost: 1,
    tags: ["survival", "artifact"],
    bonuses: { healing: 0.2, moveSpeed: 0.08, stressResist: 0.1 },
  },
];

export const TALENT_NODES: TalentNode[] = [
  ...CORE_TALENTS,
  ...BRANCHES.flatMap(makeBranchNodes),
  ...HYBRID_TALENTS,
  ...LEGENDARY_TALENTS,
];

export const TALENT_BY_ID: Record<string, TalentNode> = Object.fromEntries(
  TALENT_NODES.map((node) => [node.id, node]),
);

export const BASE_TALENT_COUNT = TALENT_NODES.length - LEGENDARY_TALENTS.length;

export const ACTIVE_SKILLS: Record<ActiveSkillId, ActiveSkillDefinition> = {
  "force-charge": { id: "force-charge", name: "Силовой заход", shortName: "Заход", branch: "power", unlockAt: 1, role: "entry", cooldownMs: 5200, tags: ["melee", "movement", "control"], description: "Рывок к цели, урон и короткий срыв подготовки." },
  "force-arc": { id: "force-arc", name: "Размашистый удар", shortName: "Дуга", branch: "power", unlockAt: 4, role: "builder", cooldownMs: 3800, tags: ["melee", "area"], description: "Удар по всем целям рядом с героем." },
  "force-execute": { id: "force-execute", name: "Регламент добивания", shortName: "Добить", branch: "power", unlockAt: 8, role: "spender", cooldownMs: 7600, tags: ["melee", "heavy"], description: "Тяжёлый удар, особенно опасный для ослабленной цели." },
  "fire-mark": { id: "fire-mark", name: "Огневая метка", shortName: "Метка", branch: "precision", unlockAt: 1, role: "setup", cooldownMs: 4200, tags: ["ranged", "mark"], description: "Помечает ближайшую видимую цель и повышает точность по ней." },
  "fire-burst": { id: "fire-burst", name: "Точная серия", shortName: "Серия", branch: "precision", unlockAt: 4, role: "spender", cooldownMs: 6200, tags: ["ranged", "mark"], description: "Три быстрых импульса; помеченная цель получает усиленный урон." },
  "fire-relocate": { id: "fire-relocate", name: "Смена позиции", shortName: "Кайт", branch: "precision", unlockAt: 8, role: "exit", cooldownMs: 5000, tags: ["movement", "ranged"], description: "Отходит от выбранной цели, сохраняя огневой контакт." },
  "stealth-muffle": { id: "stealth-muffle", name: "Тихий режим", shortName: "Тишина", branch: "agility", unlockAt: 1, role: "defense", cooldownMs: 9000, tags: ["stealth", "defense"], description: "На несколько секунд резко снижает шум и заметность." },
  "stealth-decoy": { id: "stealth-decoy", name: "Ложный шум", shortName: "Приманка", branch: "agility", unlockAt: 4, role: "setup", cooldownMs: 6500, tags: ["stealth", "device"], description: "Создаёт источник шума в стороне от героя." },
  "stealth-isolate": { id: "stealth-isolate", name: "Изолирующий контакт", shortName: "Изоляция", branch: "agility", unlockAt: 8, role: "spender", cooldownMs: 7200, tags: ["stealth", "control"], description: "Срывает групповую тревогу одной цели и усиливает следующую атаку." },
  "bulwark-brace": { id: "bulwark-brace", name: "Упор", shortName: "Упор", branch: "guard", unlockAt: 1, role: "defense", cooldownMs: 7000, tags: ["defense"], description: "Повышает броню и блок, пока герой удерживает сектор." },
  "bulwark-challenge": { id: "bulwark-challenge", name: "Регламент вызова", shortName: "Вызов", branch: "guard", unlockAt: 4, role: "setup", cooldownMs: 6800, tags: ["control", "area"], description: "Собирает ближайших противников на герое." },
  "bulwark-counter": { id: "bulwark-counter", name: "Ответный импульс", shortName: "Ответ", branch: "guard", unlockAt: 8, role: "spender", cooldownMs: 7400, tags: ["defense", "area"], description: "Площадная контратака, сильнее после полученного удара." },
  "engineer-deploy": { id: "engineer-deploy", name: "Вывести Р-3", shortName: "Рембот", branch: "suppression", unlockAt: 1, role: "entry", cooldownMs: 5000, tags: ["device", "companion"], description: "Перезапускает и выводит рембота сопровождения." },
  "engineer-designate": { id: "engineer-designate", name: "Назначить цель", shortName: "Целеуказ.", branch: "suppression", unlockAt: 4, role: "setup", cooldownMs: 4300, tags: ["device", "mark"], description: "Рембот и герой концентрируют огонь на одной цели." },
  "engineer-overclock": { id: "engineer-overclock", name: "Перегрузить контур", shortName: "Форсаж", branch: "suppression", unlockAt: 8, role: "spender", cooldownMs: 10500, tags: ["device", "companion"], description: "Временно ускоряет рембота и оружие, затем повышает стресс." },
  "resonance-distort": { id: "resonance-distort", name: "Наложить искажение", shortName: "Искажение", branch: "resonance", unlockAt: 1, role: "setup", cooldownMs: 4500, tags: ["anomaly", "mark"], description: "Накладывает резонанс на цель ценой заражения." },
  "resonance-collapse": { id: "resonance-collapse", name: "Схлопнуть резонанс", shortName: "Схлопнуть", branch: "resonance", unlockAt: 4, role: "spender", cooldownMs: 7600, tags: ["anomaly", "area"], description: "Расходует искажение и поражает область вокруг цели." },
  "resonance-stabilize": { id: "resonance-stabilize", name: "Стабилизация", shortName: "Стабилиз.", branch: "resonance", unlockAt: 8, role: "defense", cooldownMs: 12000, tags: ["anomaly", "defense"], description: "Снижает заражение и восстанавливает устойчивость войд-зоны." },
};

export const ACTIVE_SKILL_IDS = Object.keys(ACTIVE_SKILLS) as ActiveSkillId[];

export function branchForTalent(node: TalentNode): SkillBranch | null {
  return BRANCHES.includes(node.scope as SkillBranch) ? node.scope as SkillBranch : null;
}

/**
 * Ведущее направление билда. Оно выводится из набранных талантов, а не
 * выбирается игроком: классов в игре нет.
 */
export function dominantBranches(points: Record<SkillBranch, number>): SkillBranch[] {
  return (Object.keys(points) as SkillBranch[])
    .filter((branch) => points[branch] > 0)
    .sort((left, right) => points[right] - points[left] || left.localeCompare(right));
}

/** Порог, с которого направление считается заявленным, а не случайным. */
export const DIRECTION_THRESHOLD = 3;
