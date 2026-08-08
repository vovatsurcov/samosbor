// Тестовые сборки для разработки. НЕ часть игры.
//
// Нужны, чтобы воспроизводимо проверять бой и защиту: чтобы посмотреть, как
// один и тот же удар воспринимается чистым Разгоном и чистой Опорой, не нужно
// двадцать раз прокликивать дерево.
//
// Это не система билдостроения и не контент. Загрузчик доступен только когда
// `import.meta.env.DEV`, в production-сборке панель не рендерится вовсе.

import type { SkillBranch } from "./game-skills.ts";

export type DevProfile = {
  id: string;
  name: string;
  /** Куда вложены очки: направление и сколько узлов по порядку. */
  invest: Partial<Record<SkillBranch, number>>;
  note: string;
};

export const DEV_PROFILES: DevProfile[] = [
  { id: "clean", name: "Без вложений", invest: {}, note: "База сравнения: ни одного узла." },

  { id: "pure-surge", name: "Чистый Разгон", invest: { power: 16 }, note: "Тяжёлый ближний бой, слом стойки, детонация резонанса." },
  { id: "pure-aim", name: "Чистый Прицел", invest: { precision: 16 }, note: "Метки, неподвижность, точные выстрелы." },
  { id: "pure-footing", name: "Чистая Опора", invest: { guard: 16 }, note: "Блок, броня, устойчивость, сопротивления." },
  { id: "pure-tempo", name: "Чистый Темп", invest: { agility: 16 }, note: "Уклонение, парирование, скорость." },
  { id: "pure-heat", name: "Чистая Температура", invest: { suppression: 16 }, note: "Подавление, развёртывание, перегрев." },
  { id: "pure-resonance", name: "Чистый Резонанс", invest: { resonance: 16 }, note: "Резонансные метки, цепи, разрыв синхронизации." },

  { id: "hybrid-surge-resonance", name: "Разгон + Резонанс", invest: { power: 9, resonance: 7 }, note: "Ставит резонанс и срывает его тяжёлым ударом." },
  { id: "hybrid-footing-tempo", name: "Опора + Темп", invest: { guard: 8, agility: 8 }, note: "Блок и парирование в одной сборке." },
  { id: "hybrid-aim-heat", name: "Прицел + Температура", invest: { precision: 8, suppression: 8 }, note: "Метка и подавление на дистанции." },

  { id: "glass-cannon", name: "Стеклянная пушка", invest: { power: 8, precision: 8 }, note: "Урон без защитных вложений: любой пропущенный удар дорог." },
  { id: "armour-block", name: "Броня и блок", invest: { guard: 15 }, note: "Проверка слоёв брони и блока без уклонения." },
  { id: "evasion-parry", name: "Уклонение и парирование", invest: { agility: 16 }, note: "Проверка слоёв уклонения и парирования без брони." },
  { id: "resistance", name: "Сопротивления", invest: { guard: 12, resonance: 4 }, note: "Проверка сопротивлений по категориям угроз." },
];

export function devProfileById(id: string): DevProfile | null {
  return DEV_PROFILES.find((profile) => profile.id === id) ?? null;
}
