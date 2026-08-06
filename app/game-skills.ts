export type SkillBranch =
  | "force"
  | "fire"
  | "stealth"
  | "bulwark"
  | "engineer"
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
  | "stressResist";

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

export const SKILL_NAMES: Record<SkillBranch, string> = {
  force: "Силовой контур",
  fire: "Огневой регламент",
  stealth: "Тихий обход",
  bulwark: "Гермозащита",
  engineer: "Инженерная служба",
  resonance: "Аномальный допуск",
};

export const SKILL_DESCRIPTIONS: Record<SkillBranch, string> = {
  force: "Сближение, нарушение равновесия, пробой и площадные удары.",
  fire: "Метки, огневая поправка, стрельба на ходу и контроль дистанции.",
  stealth: "Шум, потеря контакта, изоляция целей и безопасный выход.",
  bulwark: "Упор, блокирование, удержание пространства и контратаки.",
  engineer: "Ремботы, устройства, перегрев, назначение целей и ремонт контура.",
  resonance: "Искажение, заражение, схлопывание эффектов и стабилизация.",
};

type BranchEntry = [name: string, description: string, bonuses: TalentBonuses, tags?: string[]];

const BRANCH_ENTRIES: Record<SkillBranch, BranchEntry[]> = {
  force: [
    ["Рабочий замах", "+1 к урону ближнего боя.", { meleeDamage: 1 }, ["melee"]],
    ["Короткий разгон", "+4% к скорости перемещения при сближении.", { moveSpeed: 0.04 }, ["movement"]],
    ["Срыв опоры", "Тяжёлые попадания усиливают контроль.", { microStun: 0.08 }, ["control"]],
    ["Масса инструмента", "+2 кг грузоподъёмности и +1% площадного урона.", { carry: 2, splash: 0.01 }],
    ["Протокол тарана", "Открывает силовой вход в бой.", { meleeDamage: 1 }, ["protocol", "entry"]],
    ["Широкая дуга", "+12% урона соседним целям.", { splash: 0.12 }, ["area"]],
    ["Через защиту", "+1 к точности тяжёлых ударов.", { accuracy: 1 }, ["heavy"]],
    ["Обратный импульс", "Контроль цели ускоряет следующую атаку.", { attackSpeed: 0.03 }, ["control"]],
    ["Регламент пролома", "Удары по отмеченным целям наносят больше урона.", { meleeDamage: 2 }, ["protocol", "mark"]],
    ["Секция целиком", "+16% площадного урона.", { splash: 0.16 }, ["area"]],
    ["Плечом вперёд", "+6% скорости и +1 брони в ближнем бою.", { moveSpeed: 0.06, armor: 1 }, ["movement"]],
    ["Не отпускать", "Автовыбор ближайшей цели ближнего боя.", { autoTarget: 1 }, ["passive"]],
    ["Сотрясение стыка", "Повышает шанс микрооглушения.", { microStun: 0.12 }, ["control"]],
    ["Молотобоец", "+2 к урону ближнего боя.", { meleeDamage: 2 }, ["melee"]],
    ["Сбор пачки", "Удары провоцируют противников вокруг цели.", { tauntRadius: 3.5 }, ["area", "passive"]],
    ["Нарушение: несущая стена", "Площадь удара резко растёт, но герой обязан держать ближнюю дистанцию.", { splash: 0.28, meleeDamage: 2 }, ["keystone", "area"]],
  ],
  fire: [
    ["Холодный пристрел", "+1 к точности дальнего оружия.", { accuracy: 1 }, ["ranged"]],
    ["Мягкий спуск", "+3% к темпу стрельбы.", { attackSpeed: 0.03 }, ["ranged"]],
    ["Смена плеча", "+3% скорости перемещения.", { moveSpeed: 0.03 }, ["movement"]],
    ["Поправка на бетон", "+1 к дальнему урону.", { rangedDamage: 1 }, ["ranged"]],
    ["Протокол метки", "Открывает метку цели и огневую подготовку.", { markPower: 1 }, ["protocol", "setup"]],
    ["Стрельба в шаге", "Обычная атака реже сбрасывает маршрут.", { movingFire: 0.5 }, ["movement", "passive"]],
    ["Двойная сверка", "+4% критического шанса.", { critical: 0.04 }, ["critical"]],
    ["Пыль в визире", "Попадания накапливают дезориентацию.", { dizzy: 1 }, ["control"]],
    ["Регламент точной серии", "Метка усиливает серию выстрелов.", { markPower: 1, rangedDamage: 1 }, ["protocol", "spender"]],
    ["Огневая дорожка", "Полная стрельба на ходу.", { movingFire: 1 }, ["movement", "passive"]],
    ["Сбить команду", "Дезориентация способна сорвать подготовку атаки.", { microStun: 0.16 }, ["interrupt"]],
    ["Цель ближе, чем кажется", "Автоматически выбирает видимую угрозу.", { autoTarget: 1 }, ["passive"]],
    ["Калибровка катушки", "+2 к дальнему урону.", { rangedDamage: 2 }, ["ranged"]],
    ["Непрерывная поправка", "+5% к темпу стрельбы.", { attackSpeed: 0.05 }, ["ranged"]],
    ["Головокружение", "Каждое третье накопление дезориентации вызывает микрооглушение.", { dizzy: 1, microStun: 0.2 }, ["control", "interrupt"]],
    ["Нарушение: стрелять на муве", "Герой ведёт автоматический огонь, пока игрок управляет только позицией.", { movingFire: 1, autoTarget: 1, attackSpeed: 0.08 }, ["keystone", "passive"]],
  ],
  stealth: [
    ["Мягкая подошва", "Шаги слышны на меньшей дистанции.", { noiseReduction: 0.35 }, ["stealth"]],
    ["Тень кабеля", "+0,25 к скрытности.", { stealth: 0.25 }, ["stealth"]],
    ["Запасной маршрут", "+4% к скорости перемещения.", { moveSpeed: 0.04 }, ["movement"]],
    ["Тихая укладка", "+1 кг грузоподъёмности без роста шума.", { carry: 1, noiseReduction: 0.15 }],
    ["Протокол гашения", "Открывает тихий режим.", { stealth: 0.35 }, ["protocol", "defense"]],
    ["Ложный источник", "Шум-приманка действует дальше.", { noiseReduction: -0.2 }, ["decoy"]],
    ["Изолированная цель", "+1 к урону по одиночной цели.", { meleeDamage: 1, rangedDamage: 1 }, ["single"]],
    ["После контакта", "+5% скорости выхода из боя.", { moveSpeed: 0.05 }, ["exit"]],
    ["Регламент исчезновения", "Потеря контакта снижает стресс.", { stressResist: 0.12 }, ["protocol", "exit"]],
    ["Мёртвый угол", "+1 к точности первой атаки.", { accuracy: 1 }, ["setup"]],
    ["Поглощение блика", "+0,35 к скрытности.", { stealth: 0.35 }, ["stealth"]],
    ["Без свидетелей", "+5% критического шанса по изолированной цели.", { critical: 0.05 }, ["critical"]],
    ["Дыхание по инструкции", "Стресс накапливается медленнее.", { stressResist: 0.15 }, ["survival"]],
    ["Выстрел без эха", "Снижает шум оружия.", { noiseReduction: 0.6 }, ["ranged"]],
    ["Контакт потерян", "Автоматический выход из агро после длинного разрыва дистанции.", { stealth: 0.45 }, ["passive"]],
    ["Нарушение: отсутствующий сотрудник", "После выхода из контакта следующая атака резко усилена.", { critical: 0.12, accuracy: 2 }, ["keystone", "setup"]],
  ],
  bulwark: [
    ["Плотный ворот", "+1 к максимальному здоровью.", { maxHp: 1 }, ["defense"]],
    ["Слой под ватником", "+1 брони.", { armor: 1 }, ["defense"]],
    ["Широкая стойка", "+2% блока.", { block: 0.02 }, ["defense"]],
    ["Перенос нагрузки", "+2 кг грузоподъёмности.", { carry: 2 }, ["defense"]],
    ["Протокол упора", "Открывает защитную стойку.", { armor: 1 }, ["protocol", "defense"]],
    ["Принять импульс", "+3% блока.", { block: 0.03 }, ["defense"]],
    ["Стоп-линия", "Удержание позиции усиливает контроль.", { microStun: 0.06 }, ["control"]],
    ["Не отступать", "+2 к максимальному здоровью.", { maxHp: 2 }, ["defense"]],
    ["Регламент вызова", "Открывает групповую провокацию.", { tauntRadius: 2.5 }, ["protocol", "setup"]],
    ["Ответный контур", "+1 к урону после блока.", { meleeDamage: 1 }, ["counter"]],
    ["Глухая плита", "+1 брони и −2% скорости.", { armor: 1, moveSpeed: -0.02 }, ["defense"]],
    ["Общий периметр", "Провокация действует дальше.", { tauntRadius: 1.5 }, ["area"]],
    ["Аварийный запас", "+2 к максимальному здоровью.", { maxHp: 2 }, ["survival"]],
    ["Держать проход", "+4% блока.", { block: 0.04 }, ["defense"]],
    ["Пружина ответа", "Блок ускоряет следующую атаку.", { attackSpeed: 0.05 }, ["counter"]],
    ["Нарушение: человек-гермодверь", "Герой удерживает пачку и усиливает площадные контратаки.", { armor: 2, tauntRadius: 2, splash: 0.12 }, ["keystone", "area"]],
  ],
  engineer: [
    ["Чистый контакт", "+1 к точности устройств и оружия.", { accuracy: 1 }, ["device"]],
    ["Запас кабеля", "+2 кг грузоподъёмности.", { carry: 2 }, ["device"]],
    ["Быстрый разъём", "+3% к темпу атак.", { attackSpeed: 0.03 }, ["device"]],
    ["Ремонт на ходу", "+5% эффективности лечения и ремонта.", { healing: 0.05 }, ["repair"]],
    ["Протокол Р-3", "Открывает рембота сопровождения.", { droneDamage: 1 }, ["protocol", "companion"]],
    ["Назначение цели", "Метка усиливает устройства.", { markPower: 1 }, ["device", "mark"]],
    ["Удлинённая шина", "Рембот действует чаще.", { droneSpeed: 0.08 }, ["companion"]],
    ["Тепловой резерв", "+1 к урону рембота.", { droneDamage: 1 }, ["companion"]],
    ["Регламент перегруза", "Открывает краткий форсаж устройств.", { droneSpeed: 0.1 }, ["protocol", "spender"]],
    ["Парная телеметрия", "Удары героя заряжают спутника.", { droneSpeed: 0.06 }, ["hybrid"]],
    ["Боевой ремонт", "+10% эффективности лечения.", { healing: 0.1 }, ["repair"]],
    ["Дежурный алгоритм", "Рембот самостоятельно выбирает угрозу.", { autoTarget: 1 }, ["passive", "companion"]],
    ["Вторая батарея", "+2 кг грузоподъёмности и +1 ОЗ.", { carry: 2, maxHp: 1 }, ["survival"]],
    ["Усиленный привод", "+2 к урону рембота.", { droneDamage: 2 }, ["companion"]],
    ["Сетка устройств", "Атака рембота поражает соседнюю цель.", { splash: 0.1 }, ["area", "companion"]],
    ["Нарушение: автономная смена", "Спутник продолжает ротацию без ручных команд.", { droneDamage: 2, droneSpeed: 0.14, autoTarget: 1 }, ["keystone", "passive"]],
  ],
  resonance: [
    ["Порог допуска", "Заражение накапливается медленнее.", { contaminationResist: 0.05 }, ["anomaly"]],
    ["Тихий резонанс", "Снижает шум аномальных действий.", { noiseReduction: 0.2 }, ["anomaly"]],
    ["Гибкая топология", "+3% скорости перемещения.", { moveSpeed: 0.03 }, ["movement"]],
    ["Волевой контур", "Стресс накапливается медленнее.", { stressResist: 0.08 }, ["anomaly"]],
    ["Протокол искажения", "Открывает наложение резонанса.", { markPower: 1 }, ["protocol", "setup"]],
    ["Медленное схлопывание", "Войд-зона стабильнее на 6%.", { voidStability: 0.06 }, ["anomaly"]],
    ["Обратная волна", "+8% площадного урона.", { splash: 0.08 }, ["area"]],
    ["Контролируемый озноб", "Резонанс усиливает дезориентацию.", { dizzy: 1 }, ["control"]],
    ["Регламент схлопывания", "Открывает расход резонанса по области.", { splash: 0.1 }, ["protocol", "spender"]],
    ["Чужая частота", "+1 к урону всех источников по отмеченным целям.", { meleeDamage: 1, rangedDamage: 1 }, ["mark"]],
    ["Стабилизатор кожи", "Заражение накапливается медленнее.", { contaminationResist: 0.08 }, ["survival"]],
    ["Зона тишины", "Снижает шум и повышает скрытность.", { noiseReduction: 0.25, stealth: 0.2 }, ["anomaly"]],
    ["Разрыв команды", "Аномальный контроль способен прервать подготовку атаки.", { microStun: 0.12 }, ["interrupt"]],
    ["Запас устойчивости", "Войд-зона стабильнее на 8%.", { voidStability: 0.08 }, ["anomaly"]],
    ["Резонансный след", "Автоатаки поддерживают искажение цели.", { autoTarget: 1, markPower: 1 }, ["passive"]],
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
  ["force", "fire", "Ударная баллистика", "Выстрел по дезориентированной цели создаёт силовой импульс.", { rangedDamage: 1, microStun: 0.08 }],
  ["force", "stealth", "Тихий пролом", "Первая тяжёлая атака после потери контакта поражает область.", { splash: 0.12, critical: 0.04 }],
  ["force", "bulwark", "Гермоштурм", "Блок и провокация усиливают следующий силовой удар.", { armor: 1, meleeDamage: 1, tauntRadius: 1 }],
  ["force", "engineer", "Приводной молот", "Рембот добавляет импульс к площадному удару.", { droneDamage: 1, splash: 0.1 }],
  ["force", "resonance", "Сдвиг массы", "Тяжёлые удары накладывают резонанс и дезориентацию.", { meleeDamage: 1, dizzy: 1 }],
  ["fire", "stealth", "Безэховая серия", "Стрельба на ходу производит меньше шума.", { movingFire: 1, noiseReduction: 0.45 }],
  ["fire", "bulwark", "Огневая позиция", "Упор повышает точность и темп стрельбы.", { accuracy: 1, attackSpeed: 0.04 }],
  ["fire", "engineer", "Оператор огневых систем", "Попадания героя заряжают рембота, а рембот поддерживает метку.", { droneSpeed: 0.08, markPower: 1 }],
  ["fire", "resonance", "Резонансный боеприпас", "Каждое третье попадание способно сорвать подготовку атаки.", { dizzy: 1, microStun: 0.14 }],
  ["stealth", "bulwark", "Ложная гермопозиция", "Провокация из укрытия создаёт ложный источник шума.", { stealth: 0.2, armor: 1 }],
  ["stealth", "engineer", "Разведывательный контур", "Спутник отвлекает цели, пока герой меняет позицию.", { droneSpeed: 0.06, stealth: 0.25 }],
  ["stealth", "resonance", "Войд-проводник", "Искажение скрывает движение и снижает шум.", { stealth: 0.35, noiseReduction: 0.3 }],
  ["bulwark", "engineer", "Сервисный бастион", "Рембот ремонтирует удерживаемый контур.", { maxHp: 1, healing: 0.12, droneDamage: 1 }],
  ["bulwark", "resonance", "Неподвижная аномалия", "Упор стабилизирует войд-зону и усиливает блок.", { block: 0.04, voidStability: 0.08 }],
  ["engineer", "resonance", "Контурщик НИИ", "Устройства накладывают резонанс, а схлопывание перезапускает спутника.", { droneDamage: 1, markPower: 1, voidStability: 0.05 }],
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
  "force-charge": { id: "force-charge", name: "Силовой заход", shortName: "Заход", branch: "force", unlockAt: 1, role: "entry", cooldownMs: 5200, tags: ["melee", "movement", "control"], description: "Рывок к цели, урон и короткий срыв подготовки." },
  "force-arc": { id: "force-arc", name: "Размашистый удар", shortName: "Дуга", branch: "force", unlockAt: 4, role: "builder", cooldownMs: 3800, tags: ["melee", "area"], description: "Удар по всем целям рядом с героем." },
  "force-execute": { id: "force-execute", name: "Регламент добивания", shortName: "Добить", branch: "force", unlockAt: 8, role: "spender", cooldownMs: 7600, tags: ["melee", "heavy"], description: "Тяжёлый удар, особенно опасный для ослабленной цели." },
  "fire-mark": { id: "fire-mark", name: "Огневая метка", shortName: "Метка", branch: "fire", unlockAt: 1, role: "setup", cooldownMs: 4200, tags: ["ranged", "mark"], description: "Помечает ближайшую видимую цель и повышает точность по ней." },
  "fire-burst": { id: "fire-burst", name: "Точная серия", shortName: "Серия", branch: "fire", unlockAt: 4, role: "spender", cooldownMs: 6200, tags: ["ranged", "mark"], description: "Три быстрых импульса; помеченная цель получает усиленный урон." },
  "fire-relocate": { id: "fire-relocate", name: "Смена позиции", shortName: "Кайт", branch: "fire", unlockAt: 8, role: "exit", cooldownMs: 5000, tags: ["movement", "ranged"], description: "Отходит от выбранной цели, сохраняя огневой контакт." },
  "stealth-muffle": { id: "stealth-muffle", name: "Тихий режим", shortName: "Тишина", branch: "stealth", unlockAt: 1, role: "defense", cooldownMs: 9000, tags: ["stealth", "defense"], description: "На несколько секунд резко снижает шум и заметность." },
  "stealth-decoy": { id: "stealth-decoy", name: "Ложный шум", shortName: "Приманка", branch: "stealth", unlockAt: 4, role: "setup", cooldownMs: 6500, tags: ["stealth", "device"], description: "Создаёт источник шума в стороне от героя." },
  "stealth-isolate": { id: "stealth-isolate", name: "Изолирующий контакт", shortName: "Изоляция", branch: "stealth", unlockAt: 8, role: "spender", cooldownMs: 7200, tags: ["stealth", "control"], description: "Срывает групповую тревогу одной цели и усиливает следующую атаку." },
  "bulwark-brace": { id: "bulwark-brace", name: "Упор", shortName: "Упор", branch: "bulwark", unlockAt: 1, role: "defense", cooldownMs: 7000, tags: ["defense"], description: "Повышает броню и блок, пока герой удерживает сектор." },
  "bulwark-challenge": { id: "bulwark-challenge", name: "Регламент вызова", shortName: "Вызов", branch: "bulwark", unlockAt: 4, role: "setup", cooldownMs: 6800, tags: ["control", "area"], description: "Собирает ближайших противников на герое." },
  "bulwark-counter": { id: "bulwark-counter", name: "Ответный импульс", shortName: "Ответ", branch: "bulwark", unlockAt: 8, role: "spender", cooldownMs: 7400, tags: ["defense", "area"], description: "Площадная контратака, сильнее после полученного удара." },
  "engineer-deploy": { id: "engineer-deploy", name: "Вывести Р-3", shortName: "Рембот", branch: "engineer", unlockAt: 1, role: "entry", cooldownMs: 5000, tags: ["device", "companion"], description: "Перезапускает и выводит рембота сопровождения." },
  "engineer-designate": { id: "engineer-designate", name: "Назначить цель", shortName: "Целеуказ.", branch: "engineer", unlockAt: 4, role: "setup", cooldownMs: 4300, tags: ["device", "mark"], description: "Рембот и герой концентрируют огонь на одной цели." },
  "engineer-overclock": { id: "engineer-overclock", name: "Перегрузить контур", shortName: "Форсаж", branch: "engineer", unlockAt: 8, role: "spender", cooldownMs: 10500, tags: ["device", "companion"], description: "Временно ускоряет рембота и оружие, затем повышает стресс." },
  "resonance-distort": { id: "resonance-distort", name: "Наложить искажение", shortName: "Искажение", branch: "resonance", unlockAt: 1, role: "setup", cooldownMs: 4500, tags: ["anomaly", "mark"], description: "Накладывает резонанс на цель ценой заражения." },
  "resonance-collapse": { id: "resonance-collapse", name: "Схлопнуть резонанс", shortName: "Схлопнуть", branch: "resonance", unlockAt: 4, role: "spender", cooldownMs: 7600, tags: ["anomaly", "area"], description: "Расходует искажение и поражает область вокруг цели." },
  "resonance-stabilize": { id: "resonance-stabilize", name: "Стабилизация", shortName: "Стабилиз.", branch: "resonance", unlockAt: 8, role: "defense", cooldownMs: 12000, tags: ["anomaly", "defense"], description: "Снижает заражение и восстанавливает устойчивость войд-зоны." },
};

export const ACTIVE_SKILL_IDS = Object.keys(ACTIVE_SKILLS) as ActiveSkillId[];

export function branchForTalent(node: TalentNode): SkillBranch | null {
  return BRANCHES.includes(node.scope as SkillBranch) ? node.scope as SkillBranch : null;
}
