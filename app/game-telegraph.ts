// Замахи противника и окна ответа.
//
// До этого модуля замах существовал (420–700 мс), но его не было видно: игрок
// не мог прочитать угрозу и потому не мог на неё ответить. Бой был обменом
// уроном, а не диалогом.
//
// Ключевое правило (docs/COMBAT_DEPTH_ROADMAP.md §3): один замах допускает
// несколько ответов. Противник создаёт ситуацию, а не требует нажать
// «правильную» защитную кнопку. Какой ответ выгоднее — решает билд игрока.
//
// Модуль чистый: работает с числами и не знает про состояние мира.

export type TelegraphTier = "quick" | "heavy";

export type TelegraphInfo = {
  tier: TelegraphTier;
  name: string;
  /** Длительность замаха: сколько у игрока есть на ответ. */
  windUpMs: number;
  /** Во сколько раз опаснее обычного удара. */
  damageScale: number;
  /** Радиус опасной зоны в клетках. 0 — удар только по цели. */
  areaRadius: number;
  description: string;
};

export const TELEGRAPHS: Record<TelegraphTier, TelegraphInfo> = {
  quick: {
    tier: "quick",
    name: "Быстрый удар",
    windUpMs: 420,
    damageScale: 1,
    areaRadius: 0,
    description: "Обычный удар. Отвечать необязательно, но и цена ошибки невысока.",
  },
  heavy: {
    tier: "heavy",
    // Замах долгий намеренно: он должен успеть прочитаться и допускать
    // несколько разных ответов, а не проверять скорость реакции.
    name: "Тяжёлый замах",
    windUpMs: 1250,
    damageScale: 2.4,
    areaRadius: 1.7,
    description:
      "Противник вкладывается в один удар. Видно заранее, бьёт по площади и дорого стоит, если принять его молча.",
  },
};

/** Все ответы на замах. Ни один не является «правильным» сам по себе. */
export type TelegraphResponse =
  | "evade_zone"
  | "dodge"
  | "block"
  | "parry"
  | "interrupt"
  | "absorb";

export type ResponseInfo = {
  id: TelegraphResponse;
  name: string;
  /** Чем ответ обеспечивается: действием игрока или свойствами билда. */
  source: "движение" | "действие" | "билд";
  description: string;
};

export const TELEGRAPH_RESPONSES: Record<TelegraphResponse, ResponseInfo> = {
  evade_zone: {
    id: "evade_zone",
    name: "Выйти из зоны",
    source: "движение",
    description: "Уйти с площади удара ногами. Ничего не стоит, но требует места и времени.",
  },
  dodge: {
    id: "dodge",
    name: "Уклонение",
    source: "действие",
    description: "Кадры неуязвимости отменяют удар целиком. Окно и восстановление задаются билдом.",
  },
  block: {
    id: "block",
    name: "Блок",
    source: "билд",
    description: "Принять удар на защиту. Сколько именно пройдёт — вопрос сборки, а не нажатия.",
  },
  parry: {
    id: "parry",
    name: "Парирование",
    source: "билд",
    description: "Узкое окно в начале удара: отменяет атаку и открывает противника. Доступно, если билд его поддерживает.",
  },
  interrupt: {
    id: "interrupt",
    name: "Прерывание",
    source: "действие",
    description: "Сломать стойку во время замаха: удар не состоится, а цель окажется вскрыта.",
  },
  absorb: {
    id: "absorb",
    name: "Принять удар",
    source: "билд",
    description: "Не отвечать вовсе. Урон гасят броня и сопротивления — это тоже полноценный ответ, если сборка его держит.",
  },
};

/** Урон телеграфированного удара до защиты цели. */
export function telegraphDamage(baseDamage: number, tier: TelegraphTier): number {
  return Math.round(baseDamage * TELEGRAPHS[tier].damageScale);
}

/**
 * Доля замаха, прошедшая к текущему моменту: 0 — только начался, 1 — удар.
 * Интерфейсу нужна именно доля, чтобы рисовать заполнение, а не миллисекунды.
 */
export function windUpProgress(
  startedMs: number,
  nowMs: number,
  tier: TelegraphTier,
): number {
  const total = TELEGRAPHS[tier].windUpMs;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, (nowMs - startedMs) / total));
}

/**
 * Окно парирования — начало замаха, а не его конец.
 *
 * Парирование награждает за чтение намерения: игрок отвечает, как только
 * увидел замах. Блок, в отличие от него, работает в любой момент, поэтому
 * парирование должно быть строго уже, иначе оно вытесняет блок полностью.
 */
export function withinParryWindow(
  progress: number,
  parryWindowShare: number,
): boolean {
  return progress <= Math.max(0, parryWindowShare);
}

/** Успевает ли игрок вообще ответить: замах короче времени реакции — нечестно. */
export function isReadable(tier: TelegraphTier): boolean {
  return TELEGRAPHS[tier].windUpMs >= 400;
}
