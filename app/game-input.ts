// Намерения игрока: слой между устройством ввода и боевой логикой.
//
// Боевые системы не должны знать про KeyboardEvent и MouseEvent. Браузерный
// адаптер переводит клавиатуру и мышь в намерения, а движок работает уже с
// ними. При переносе в Unity меняется только адаптер: правила боя остаются.
//
// Каноническая схема PC (docs/COMBAT_DEPTH_ROADMAP.md):
//
//   WASD  — движение
//   мышь  — направление внимания и прицела
//   ЛКМ   — основная атака текущего снаряжения
//
// Движение и прицел независимы: стрелок не обязан бежать туда, куда стреляет.

export type Vector = { x: number; y: number };

export type PlayerIntent =
  /** Направление движения. Нулевой вектор — стоять. */
  | { kind: "move"; vector: Vector }
  /** Куда смотрит персонаж: точка в мировых координатах. */
  | { kind: "aim"; point: Vector }
  /** Основная атака. `held` — кнопка удерживается. */
  | { kind: "primary"; held: boolean }
  | { kind: "ability"; slot: number }
  | { kind: "movementAction" }
  | { kind: "interact" }
  | { kind: "cancel" };

export function normalise(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y);
  if (length < 0.001) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

export function isIdle(vector: Vector): boolean {
  return Math.hypot(vector.x, vector.y) < 0.001;
}

/**
 * Небольшой буфер ввода: нажатие чуть раньше конца восстановления не теряется.
 *
 * Именно буфер, а не очередь команд. Слэшер должен ощущаться отзывчивым, но
 * игрок не выстраивает последовательность действий заранее.
 */
export const INPUT_BUFFER_MS = 220;

export type BufferedIntent = {
  intent: PlayerIntent;
  atMs: number;
};

export function bufferIsFresh(buffered: BufferedIntent | null, nowMs: number): boolean {
  if (!buffered) return false;
  return nowMs - buffered.atMs <= INPUT_BUFFER_MS;
}

/**
 * Раскладка клавиш браузерного адаптера. Живёт здесь, чтобы combat-код не
 * содержал ни одной строки с именем клавиши.
 */
export const MOVE_KEYS: Record<string, Vector> = {
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  arrowup: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
};

/** Собирает вектор движения из набора зажатых клавиш. */
export function moveVectorFromKeys(pressed: Iterable<string>): Vector {
  let x = 0;
  let y = 0;
  for (const key of pressed) {
    const direction = MOVE_KEYS[key];
    if (!direction) continue;
    x += direction.x;
    y += direction.y;
  }
  return normalise({ x, y });
}
