// Правила, которые можно изменить: ключевые узлы и предметы, меняющие механику.
//
// Правило Gate 3: сила берётся не из чисел, а из изменения правила. Предмет или
// узел не «+15% урона», а «теперь эта механика работает иначе».
//
// Архитектура data-driven. Предмет и узел объявляют **флаги правил**; движок в
// одном месте на механику спрашивает, изменено ли правило. Никаких
// `if (itemId === ...)` в боевом ядре и никакого программирования поведения
// игроком: правило живёт внутри предмета, а не в настраиваемом списке условий.

export type RuleFlag =
  // Разгон
  | "surge:never_resets"
  // Прицел
  | "aim:instant_but_rooted"
  // Опора
  | "block:converts_to_surge"
  // Темп
  | "tempo:permanent_no_guard"
  // Температура
  | "heat:overheat_discharges"
  // Резонанс
  | "resonance:no_direct_consume"
  // Предметы, проходящие поперёк направлений
  | "charge:instant_costly"
  | "dual:shared_reload"
  | "melee:exposes_resonating"
  | "overload:any_hit_applies"
  | "twohanded:anchored"
  | "parry:yields_resonance"
  | "defence:armour_only";

/**
 * Что игрок должен понять без внешней энциклопедии: что меняется, что
 * приобретается, что теряется и с чем это взаимодействует.
 */
export type RuleInfo = {
  flag: RuleFlag;
  changes: string;
  gains: string;
  costs: string;
  interacts: string;
};

export const RULE_INFO: Record<RuleFlag, RuleInfo> = {
  "surge:never_resets": {
    flag: "surge:never_resets",
    changes: "Разгон больше не рассыпается от остановки.",
    gains: "Накопленный разгон держится, пока герой жив.",
    costs: "Каждая ступень разгона делает входящий урон тяжелее.",
    interacts: "разгон, тяжёлый удар, детонация резонанса",
  },
  "aim:instant_but_rooted": {
    flag: "aim:instant_but_rooted",
    changes: "Прицел набирается мгновенно, но только стоя намертво.",
    gains: "Полный прицел с первой секунды неподвижности.",
    costs: "В движении стрелять нельзя вовсе.",
    interacts: "прицел, вскрытие, стрелковое оружие",
  },
  "block:converts_to_surge": {
    flag: "block:converts_to_surge",
    changes: "Блок почти не гасит урон, но обращает его в разгон.",
    gains: "Каждый сработавший блок даёт наступательный ресурс.",
    costs: "Блок перестаёт быть защитой: урон проходит почти целиком.",
    interacts: "блок, щит, разгон, тяжёлый удар",
  },
  "tempo:permanent_no_guard": {
    flag: "tempo:permanent_no_guard",
    changes: "Темп не затухает, но защищаться больше нечем.",
    gains: "Ступени темпа держатся без постоянного движения.",
    costs: "Блок и парирование не работают совсем.",
    interacts: "темп, перенос резонанса, уклонение",
  },
  "heat:overheat_discharges": {
    flag: "heat:overheat_discharges",
    changes: "Перегрев не блокирует оружие, а разряжается в стороны.",
    gains: "На перегреве наводится перегрузка на всех рядом.",
    costs: "Разряд бьёт и по герою: перегрев теперь стоит здоровья.",
    interacts: "температура, перегрузка, автоматическое оружие",
  },
  "resonance:no_direct_consume": {
    flag: "resonance:no_direct_consume",
    changes: "Резонанс нельзя сорвать ударом: на пределе он сворачивается сам.",
    gains: "Полный резонанс сам становится звучащим участком, без действия игрока.",
    costs: "Мгновенного всплеска по подготовленной цели больше нет.",
    interacts: "резонанс, разлад, тяжёлый удар",
  },
  "charge:instant_costly": {
    flag: "charge:instant_costly",
    changes: "Заряд набирается мгновенно, но дышать становится нечем.",
    gains: "Полная ступень заряда без удержания.",
    costs: "Двойной расход дыхания на заряженный удар.",
    interacts: "заряжаемая атака, дыхание",
  },
  "dual:shared_reload": {
    flag: "dual:shared_reload",
    changes: "Обе руки перезаряжаются разом, но магазины вдвое короче.",
    gains: "Одна короткая перезарядка вместо двух вразнобой.",
    costs: "Вдвое меньше выстрелов до паузы, и пауза общая для обеих рук.",
    interacts: "парная стрельба, боезапас, ритм",
  },
  "melee:exposes_resonating": {
    flag: "melee:exposes_resonating",
    changes: "Удар вплотную по резонирующей цели вскрывает её.",
    gains: "Смешанный хват сам создаёт окно урона, без слома стойки.",
    costs: "Работает только по цели с резонансом: без подготовки бесполезно.",
    interacts: "смешанный хват, резонанс, вскрытие",
  },
  "overload:any_hit_applies": {
    flag: "overload:any_hit_applies",
    changes: "Перегрузку наводит любое попадание, а не только горячий ствол.",
    gains: "Электрический пробой доступен любой сборке и любому оружию.",
    costs: "Каждое наведение добавляет герою заражение.",
    interacts: "перегрузка, заражение, аномальное устройство",
  },
  "twohanded:anchored": {
    flag: "twohanded:anchored",
    changes: "Двуручное встаёт намертво: вес идёт в стойку, а не в ноги.",
    gains: "Резко больше урона по стойке и устойчивости.",
    costs: "Подвижность падает почти вдвое.",
    interacts: "двуручное оружие, стойка, устойчивость",
  },
  "parry:yields_resonance": {
    flag: "parry:yields_resonance",
    changes: "Парирование не ломает стойку атакующего, а наводит на него резонанс.",
    gains: "Защита начинает готовить цели вместо того, чтобы просто отменять удар.",
    costs: "Парирование перестаёт открывать противника ударом по стойке.",
    interacts: "парирование, резонанс, разлад",
  },
  "defence:armour_only": {
    flag: "defence:armour_only",
    changes: "Броня работает в полную силу, но уклоняться нечем.",
    gains: "Броня гасит заметно больше.",
    costs: "Уклонение обнуляется полностью.",
    interacts: "броня, уклонение, защитный конвейер",
  },
};

/** Одна строка для подсказки: что меняется и чем за это платят. */
export function describeRule(flag: RuleFlag): string {
  const info = RULE_INFO[flag];
  return `${info.changes} Даёт: ${info.gains} Отнимает: ${info.costs}`;
}

/**
 * Ключевые узлы. Узел стоит рядом со своим направлением и поддерживает его
 * механику, но жёсткой привязки нет: гибрид может дотянуться до чужого узла и
 * построить вокруг него неожиданную сборку.
 */
export type Keystone = {
  id: string;
  name: string;
  /** Направление, рядом с которым узел стоит. Не ограничение доступа. */
  nearDirection: string;
  flag: RuleFlag;
  flavour: string;
};

export const KEYSTONES: Keystone[] = [
  {
    id: "power:16",
    name: "Нарушение: масса решает",
    nearDirection: "power",
    flag: "surge:never_resets",
    flavour: "Инструкция запрещала останавливать привод под нагрузкой. Инструкцию отменили вместе с цехом.",
  },
  {
    id: "precision:16",
    name: "Нарушение: один выстрел",
    nearDirection: "precision",
    flag: "aim:instant_but_rooted",
    flavour: "Прибор рассчитан на неподвижное основание. Основанием назначили стрелка.",
  },
  {
    id: "guard:16",
    name: "Нарушение: глухой контур",
    nearDirection: "guard",
    flag: "block:converts_to_surge",
    flavour: "Щит переделали в накопитель. Гасить он с тех пор почти перестал.",
  },
  {
    id: "agility:16",
    name: "Нарушение: чужой темп",
    nearDirection: "agility",
    flag: "tempo:permanent_no_guard",
    flavour: "Тело перестало сбрасывать набранный ритм. Заодно перестало и защищаться.",
  },
  {
    id: "suppression:16",
    name: "Нарушение: коридор закрыт",
    nearDirection: "suppression",
    flag: "heat:overheat_discharges",
    flavour: "Аварийный сброс вывели наружу. Наружу — это во все стороны, включая свою.",
  },
  {
    id: "resonance:16",
    name: "Нарушение: нулевая инструкция",
    nearDirection: "resonance",
    flag: "resonance:no_direct_consume",
    flavour: "Контур больше не гасится вручную. Он гасится сам, когда сочтёт нужным.",
  },
];

export function keystoneByFlag(flag: RuleFlag): Keystone | null {
  return KEYSTONES.find((keystone) => keystone.flag === flag) ?? null;
}
