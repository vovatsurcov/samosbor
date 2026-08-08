// Две руки как часть боевого языка.
//
// Правило (docs/COMBAT_DEPTH_ROADMAP.md, этап 3): сочетание рук — **не сумма
// характеристик**. Пистолет с пистолетом не «двойной урон», пистолет со щитом
// не «пистолет и немного брони». Каждое сочетание задаёт свой способ работы
// руками.
//
// Архитектура data-driven: предметы объявляют способности, а поведение
// сочетания **выводится** из двух наборов способностей. Отдельного класса кода
// на каждую пару нет и быть не должно — иначе каждое новое оружие потребует
// переписывать боевое ядро.

export type HandCapability =
  | "one_handed"
  | "two_handed"
  | "ranged"
  | "melee"
  | "defensive"
  | "precise"
  | "sweep"
  | "breach"
  | "applies_state"
  | "consumes_state"
  | "heavy"
  | "light"
  | "industrial"
  | "anomalous";

/** Что именно предмет умеет. Из этого набора и выводится сочетание. */
export type HandItem = {
  id: string;
  name: string;
  capabilities: HandCapability[];
};

export function has(item: HandItem | null, capability: HandCapability): boolean {
  return Boolean(item?.capabilities.includes(capability));
}

/**
 * Поведение сочетания. Множители применяются к уже посчитанным значениям
 * оружия, поэтому новое оружие не требует правок здесь.
 */
export type HandCombination = {
  id: string;
  name: string;
  /** Что игрок делает руками. Это, а не цифры, отличает сочетания. */
  verb: string;
  /** Множитель времени между действиями. <1 — чаще. */
  cadence: number;
  /** Множитель подвижности. */
  mobility: number;
  /** Сколько целей задевает штатное действие. */
  sweep: number;
  /** Прибавка к шансу блока от защитной руки. */
  blockChance: number;
  /** Насколько быстрее персонаж входит в действие: свободные руки — быстрее. */
  handling: number;
  /** Прибавка к переносимому весу: незанятая рука разгружает снаряжение. */
  carry: number;
  /** Множитель урона по стойке. */
  stance: number;
  /** Устойчивость: насколько слабее чужой удар ломает стойку героя. */
  stability: number;
  /** Прибавка к пробитию брони. */
  penetration: number;
  /** На какой дистанции живёт сочетание. */
  reach: "close" | "ranged" | "hybrid";
  /** Замкнут ли в паре цикл «наложил состояние → израсходовал». */
  stateLoop: boolean;
  strength: string;
  weakness: string;
};

const BASE: Omit<HandCombination, "id" | "name" | "verb" | "strength" | "weakness"> = {
  cadence: 1,
  mobility: 1,
  sweep: 1,
  blockChance: 0,
  handling: 1,
  carry: 0,
  stance: 1,
  stability: 0,
  penetration: 0,
  reach: "close",
  stateLoop: false,
};

/**
 * Выводит поведение из двух наборов способностей.
 *
 * Порядок проверок — от самого специфичного сочетания к общему. Правила
 * опираются только на способности, поэтому любое новое оружие получает
 * поведение автоматически, как только объявит свои теги.
 */
export function combineHands(primary: HandItem | null, secondary: HandItem | null): HandCombination {
  const reach = (): HandCombination["reach"] => {
    const ranged = has(primary, "ranged") || has(secondary, "ranged");
    const melee = has(primary, "melee") || has(secondary, "melee");
    if (ranged && melee) return "hybrid";
    return ranged ? "ranged" : "close";
  };

  if (has(primary, "two_handed")) {
    return {
      ...BASE,
      id: "two_handed",
      name: "Обе руки на оружии",
      verb: "работает одним оружием в обе руки: вкладывает вес всего тела в каждое действие",
      reach: reach(),
      // Двуручное занимает оба слота и обязано это окупать не уроном, а
      // возможностями, которых у пары рук нет: вес в стойке, устойчивость,
      // пробитие и расход уже наведённого одним действием.
      stance: 1.35,
      stability: 0.2,
      penetration: 3,
      handling: 1.05,
      strength: "вес в удар, устойчивость и пробитие: то, чего пара рук не даёт",
      weakness: "ни защитной руки, ни второго инструмента — вся сборка в одном предмете",
    };
  }

  if (!secondary) {
    return {
      ...BASE,
      id: "free_hand",
      name: "Свободная рука",
      verb: "держит оружие в одной руке, вторая пуста: легче и собраннее, но слот простаивает",
      // Пустая рука — не самостоятельный билд, а рабочий запасной вариант.
      // Отсутствие предмета естественно даёт немного лёгкости и скорости
      // обращения, но не должно догонять полноценный второй слот: игрок
      // сознательно отказался от части силы персонажа.
      mobility: 1.02,
      handling: 0.94,
      carry: 2,
      reach: reach(),
      strength: "чуть легче и чуть собраннее",
      weakness: "свободный слот не даёт ни урона, ни защиты: полноценная пара сильнее",
    };
  }

  // Оборонительная рука: не «немного брони», а другой способ стоять в бою.
  if (has(secondary, "defensive")) {
    const ranged = has(primary, "ranged");
    return {
      ...BASE,
      id: ranged ? "covered_fire" : "shielded_melee",
      name: ranged ? "Стрельба с прикрытием" : "Щитовая связка",
      verb: ranged
        ? "давит огнём из-за прикрытия и держит позицию, а не бегает"
        : "работает вплотную, принимая удары на щит",
      cadence: ranged ? 1.12 : 1.05,
      mobility: 0.88,
      handling: 1.2,
      carry: -2,
      blockChance: ranged ? 0.22 : 0.3,
      stance: ranged ? 1 : 1.25,
      reach: ranged ? "ranged" : "close",
      strength: ranged ? "удержание позиции под огнём" : "безопасное удержание пространства",
      weakness: "подвижность и темп ниже: рука занята защитой",
    };
  }

  // Две одинаковые руки: чередование вместо удвоения.
  const bothRanged = has(primary, "ranged") && has(secondary, "ranged");
  const bothMelee = has(primary, "melee") && has(secondary, "melee");

  if (bothRanged) {
    return {
      ...BASE,
      id: "dual_ranged",
      name: "Парная стрельба",
      verb: "стреляет попеременно с обеих рук, не давая цели передышки",
      cadence: 0.62,
      mobility: 1,
      handling: 0.95,
      blockChance: 0,
      stance: 0.8,
      reach: "ranged",
      strength: "плотность огня и быстрый ритм",
      weakness: "нечем защищаться и плохо со стойкой: обе руки заняты стрельбой",
    };
  }

  if (bothMelee) {
    return {
      ...BASE,
      id: "dual_melee",
      name: "Парный ближний",
      verb: "бьёт в две руки короткими связками, перекрывая соседние цели",
      cadence: 0.68,
      mobility: 1.02,
      sweep: 2,
      blockChance: 0,
      stance: 0.9,
      reach: "close",
      strength: "темп и охват в ближней свалке",
      weakness: "нечем защищаться, каждый размен идёт в обе стороны",
    };
  }

  // Разные руки: главный гибрид SAMOSBOR.
  const applies = has(primary, "applies_state") || has(secondary, "applies_state");
  const consumes = has(primary, "consumes_state") || has(secondary, "consumes_state");
  return {
    ...BASE,
    id: "mixed_grip",
    name: "Смешанный хват",
    verb: "готовит цель одной рукой и добирает другой, меняя дистанцию по ходу боя",
    cadence: 0.9,
    mobility: 0.97,
    blockChance: 0,
    stance: 1.1,
    reach: reach(),
    stateLoop: applies && consumes,
    strength: applies && consumes
      ? "цикл замкнут в одной паре: одна рука наводит состояние, другая его расходует"
      : "работает и вблизи, и на дистанции",
    weakness: "ни в чём не лучший: и стрелок, и ближний бой сильнее в своём",
  };
}

/** Короткое человекочитаемое объяснение для интерфейса. */
export function describeCombination(combination: HandCombination): string {
  const parts = [combination.verb];
  if (combination.stateLoop) parts.push("цикл состояний замкнут в паре");
  if (combination.blockChance > 0) parts.push(`блок +${Math.round(combination.blockChance * 100)}%`);
  if (combination.cadence < 1) parts.push(`темп быстрее на ${Math.round((1 - combination.cadence) * 100)}%`);
  if (combination.cadence > 1) parts.push(`темп медленнее на ${Math.round((combination.cadence - 1) * 100)}%`);
  if (combination.sweep > 1) parts.push(`задевает до ${combination.sweep} целей`);
  if (combination.mobility < 1) parts.push(`подвижность −${Math.round((1 - combination.mobility) * 100)}%`);
  return parts.join("; ");
}


// --- Способности и руки ----------------------------------------------------

/**
 * Форма исполнения способности при текущем сочетании рук.
 *
 * Способность не превращается в четыре разных умения: меняется её исполнение —
 * сколько ударов, по скольким целям, сохраняется ли защита во время действия,
 * наводит ли она состояние или расходует уже наведённое.
 *
 * Выводится из сочетания, а не прописана под каждую пару, поэтому новая пара
 * получает форму автоматически.
 */
export type AbilityShape = {
  /** Сколько отдельных попаданий содержит действие. */
  hits: number;
  /** По скольким целям может разойтись действие. */
  targets: number;
  /** Множитель восстановления после действия. */
  recovery: number;
  /** Держится ли защита во время действия: щит не опускается ради удара. */
  keepsGuard: boolean;
  /** Наводит ли действие состояние само. */
  applies: boolean;
  /** Расходует ли уже наведённое. */
  consumes: boolean;
  /** Как это читается игроком. */
  note: string;
};

export function abilityShape(combination: HandCombination): AbilityShape {
  const base: AbilityShape = {
    hits: 1,
    targets: 1,
    recovery: combination.handling,
    keepsGuard: false,
    applies: false,
    consumes: false,
    note: "",
  };

  if (combination.id === "dual_ranged") {
    return {
      ...base,
      hits: 2,
      targets: 2,
      note: "две руки бьют попеременно: два попадания, можно развести по целям",
    };
  }
  if (combination.id === "dual_melee") {
    return { ...base, hits: 2, targets: 2, note: "связка в две руки перекрывает соседнюю цель" };
  }
  if (combination.id === "covered_fire" || combination.id === "shielded_melee") {
    return {
      ...base,
      recovery: combination.handling,
      keepsGuard: true,
      note: "щит не опускается ради удара: защита держится всё действие",
    };
  }
  if (combination.id === "mixed_grip") {
    return {
      ...base,
      hits: 2,
      applies: true,
      consumes: combination.stateLoop,
      note: combination.stateLoop
        ? "правая рука готовит цель, левая тут же добирает подготовленное"
        : "правая работает на дистанции, левая добирает вплотную",
    };
  }
  if (combination.id === "two_handed") {
    return { ...base, recovery: 1.15, consumes: true, note: "вся отдача уходит в один удар" };
  }
  return { ...base, note: "одно чистое попадание, быстрый сбор" };
}
