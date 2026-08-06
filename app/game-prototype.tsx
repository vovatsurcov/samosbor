"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACTIVE_SKILLS,
  type ActiveSkillId,
  activateSkillSlot,
  activateEquippedArtifact,
  allocateTalent,
  applyTrainingBuild,
  applyFirstAid,
  assignActiveSkill,
  BASE_TALENT_COUNT,
  branchTalentPoints,
  canAllocateTalent,
  cancelHeroAction,
  carryCapacity,
  commandAttack,
  commandAttackNearest,
  commandMove,
  consumeInventoryItem,
  createInitialState,
  distance,
  dropInventoryItem,
  effectiveAttribute,
  effectiveInjury,
  Enemy,
  EnemyMode,
  enemyById,
  enemyVisibleToHero,
  equippedArtifact,
  equippedEntry,
  equipItem,
  formattedWorldTime,
  GameState,
  GearSlot,
  gridPoint,
  hasLineOfSight,
  heroAttackCooldown,
  heroAttackDamage,
  heroAttackRange,
  heroDefense,
  heroMoveSpeed,
  interact,
  interactionHint,
  inventoryWeight,
  InventoryEntry,
  isKnown,
  isVisible,
  ITEMS,
  mapForZone,
  maxHeroHp,
  objectiveFor,
  populationPressureForZone,
  populationsForZone,
  Point,
  SKILL_DESCRIPTIONS,
  SKILL_NAMES,
  SkillBranch,
  SLOT_NAMES,
  setCombatDirective,
  TALENT_NODES,
  tickGame,
  tileAt,
  WEAPONS,
  weaponFor,
  unlockedActiveSkills,
  xpToNextLevel,
} from "./game-engine";

const SAVE_KEY = "samosbor-shift-556-stage-4b";
const TILE_WIDTH = 82;
const TILE_HEIGHT = 41;
const DESKTOP_FRAME_INTERVAL = 16;
const TV_FRAME_INTERVAL = 33;

const TILE_LABELS: Record<string, string> = {
  ".": "Проход",
  "#": "Стена",
  c: "Низкое укрытие",
  L: "Лифтовый узел",
  T: "Служебный терминал",
  S: "Датчик СБ-04",
  H: "Гермодверь",
  P: "Межэтажный переход",
  U: "Переход вверх",
  D: "Переход вниз",
  A: "Артефактное гнездо",
  B: "Аварийный шкаф",
};

const TILE_MARKS: Record<string, string> = {
  c: "▰",
  L: "Л",
  T: "Т",
  S: "Д",
  H: "Г",
  P: "∅",
  U: "↑",
  D: "↓",
  A: "◈",
  B: "▣",
};

const MODE_LABELS: Record<EnemyMode, string> = {
  patrol: "патруль",
  suspicious: "подозрение",
  hunting: "преследование",
  combat: "бой",
  retreat: "отступление",
  disabled: "отключён",
};

const MODE_COLORS: Record<EnemyMode, string> = {
  patrol: "#78a99e",
  suspicious: "#d2b356",
  hunting: "#d5814e",
  combat: "#db6058",
  retreat: "#a580ba",
  disabled: "#62675f",
};

const ENEMY_SIGNS: Record<Enemy["kind"], string> = {
  sentry: "А",
  stalker: "О",
  collector: "С",
};

const GENOME_LABELS = {
  maintenance: "ремонтный",
  bureaucratic: "ведомственный",
  feral: "одичавший",
  pilgrim: "паломнический",
  anomalous: "аномальный",
} as const;

const SKILL_BRANCHES = Object.keys(SKILL_NAMES) as SkillBranch[];
type TalentView = "core" | SkillBranch | "hybrid" | "legendary";
const PAPERDOLL_SLOTS: GearSlot[] = ["head", "body", "hands", "feet", "back", "weapon", "artifact"];

function pointsForDiamond(cx: number, cy: number): string {
  return [
    `${cx},${cy}`,
    `${cx + TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`,
    `${cx},${cy + TILE_HEIGHT}`,
    `${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`,
  ].join(" ");
}

function toIso(point: Point, originX: number, originY: number): Point {
  return {
    x: originX + ((point.x - point.y) * TILE_WIDTH) / 2,
    y: originY + ((point.x + point.y) * TILE_HEIGHT) / 2 + TILE_HEIGHT / 2,
  };
}

function tileColor(tile: string, zoneIsVoid: boolean, visible: boolean): string {
  if (!visible) return zoneIsVoid ? "#151019" : "#151815";
  if (tile === "#") return zoneIsVoid ? "#34263c" : "#3c413a";
  if (tile === "c") return zoneIsVoid ? "#57495d" : "#526059";
  if (tile === "P") return "#5f2b76";
  if (tile === "U" || tile === "D") return "#526f6a";
  if (tile === "A") return "#806b45";
  if (tile === "H") return "#586c60";
  if (tile === "S") return "#665e43";
  if (tile === "L") return "#48515a";
  if (tile === "T") return "#52605b";
  if (tile === "B") return "#51584b";
  return zoneIsVoid ? "#47364d" : "#64695c";
}

function injuryItems(state: GameState): string[] {
  const result: string[] = [];
  const suffix = (injury: keyof GameState["injuries"]) =>
    state.hero.relievedInjury === injury && state.hero.injuryReliefUntilMs > state.worldTimeMs
      ? " · стабилизировано"
      : "";
  if (state.injuries.leg) result.push(`Нога: скорость −${effectiveInjury(state, "leg") * 16}%${suffix("leg")}`);
  if (state.injuries.arm) result.push(`Рука: точность и урон −${effectiveInjury(state, "arm")}${suffix("arm")}`);
  if (state.injuries.eye) result.push(`Глаз: обзор и точность −${effectiveInjury(state, "eye")}${suffix("eye")}`);
  if (state.injuries.head) result.push(`Голова: защита −${effectiveInjury(state, "head")}${suffix("head")}`);
  if (state.injuries.torso) result.push(`Корпус: максимум ОЗ −${effectiveInjury(state, "torso") * 2}${suffix("torso")}`);
  return result;
}

function enemyDescription(enemy: Enemy): string {
  if (enemy.kind === "sentry") {
    return "Ведомственный автомат. Держит дальнюю дистанцию и передаёт тревогу.";
  }
  if (enemy.kind === "stalker") {
    return "Быстрый обходчик с хорошим слухом. Опасен в непосредственной близости.";
  }
  return "Бронированная лабораторная машина, охраняющая старое производство.";
}

function branchGlyph(branch: SkillBranch): string {
  return {
    force: "С",
    fire: "О",
    stealth: "Т",
    bulwark: "Г",
    engineer: "И",
    resonance: "А",
  }[branch];
}

function itemGlyph(entry: InventoryEntry): string {
  const item = ITEMS[entry.itemId];
  if (item.kind === "weapon") return WEAPONS[entry.itemId as keyof typeof WEAPONS].category === "melee" ? "Б" : "О";
  if (item.kind === "artifact") return "◈";
  if (item.kind === "consumable") return "+";
  if (item.kind === "material") return "Д";
  return {
    head: "Г",
    body: "К",
    hands: "Р",
    feet: "Н",
    back: "С",
    weapon: "О",
    artifact: "А",
  }[item.slot ?? "body"];
}

function conditionTone(condition: number): string {
  if (condition < 35) return "critical";
  if (condition < 70) return "worn";
  return "serviceable";
}

export default function GamePrototype() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [characterOpen, setCharacterOpen] = useState(false);
  const [talentView, setTalentView] = useState<TalentView>("fire");
  const [selectedSkillSlot, setSelectedSkillSlot] = useState(0);
  const [tvMode, setTvMode] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [lastInput, setLastInput] = useState("—");
  const [measuredFps, setMeasuredFps] = useState(0);
  const stateRef = useRef(state);
  const lastFrameRef = useRef(0);
  const tvModeRef = useRef(tvMode);
  const fpsRef = useRef({ started: 0, frames: 0 });
  const gamepadLockRef = useRef(0);
  const gamepadButtonsRef = useRef<Set<number>>(new Set());
  const okHeldRef = useRef(false);
  const okChordRef = useRef(false);
  const map = mapForZone(state.zone);
  const hero = state.hero.positions[state.zone];
  const weapon = weaponFor(state);
  const target = enemyById(state, state.hero.attackTargetId);
  const heroMaxHp = maxHeroHp(state);
  const injuries = injuryItems(state);
  const carriedWeight = inventoryWeight(state);
  const weightLimit = carryCapacity(state);
  const artifact = equippedArtifact(state);
  const localPopulations = populationsForZone(state);
  const localPopulationPressure = populationPressureForZone(state);
  const bandageCount = state.hero.inventory.find((entry) => entry.itemId === "bandage")?.quantity ?? 0;
  const visibleLoot = state.groundLoot.filter(
    (loot) => loot.zone === state.zone && isKnown(state, loot.position),
  );
  const sortedInventory = [...state.hero.inventory].sort((a, b) => {
    const order = { weapon: 0, clothing: 1, artifact: 2, consumable: 3, material: 4 };
    return order[ITEMS[a.itemId].kind] - order[ITEMS[b.itemId].kind] ||
      ITEMS[a.itemId].name.localeCompare(ITEMS[b.itemId].name, "ru");
  });
  const unlockedSkills = unlockedActiveSkills(state);
  const selectedTalents = TALENT_NODES.filter((node) => node.scope === talentView);
  const branchPoints = Object.fromEntries(
    SKILL_BRANCHES.map((branch) => [branch, branchTalentPoints(state, branch)]),
  ) as Record<SkillBranch, number>;
  const leadingBranches = [...SKILL_BRANCHES]
    .filter((branch) => branchPoints[branch] > 0)
    .sort((left, right) => branchPoints[right] - branchPoints[left]);
  const hybridClass = leadingBranches.length >= 2
    ? TALENT_NODES.find(
        (node) =>
          node.scope === "hybrid" &&
          node.pair?.includes(leadingBranches[0]) &&
          node.pair?.includes(leadingBranches[1]),
      )?.name
    : null;
  const classTitle = hybridClass ?? (leadingBranches[0] ? SKILL_NAMES[leadingBranches[0]] : "Младший обходчик");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    tvModeRef.current = tvMode;
  }, [tvMode]);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const looksLikeTv = /tv|smarttv|yandexstation|yaos/i.test(navigator.userAgent) ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2 && window.innerWidth >= 960);
    if (looksLikeTv) {
      const timer = window.setTimeout(() => setTvMode(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(SAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          if (
            parsed?.hero?.positions?.floor555 &&
            parsed?.hero?.positions?.floor556 &&
            parsed?.hero?.positions?.floor557 &&
            parsed?.hero?.positions?.voidLab &&
            parsed?.hero?.equipment &&
            Array.isArray(parsed?.hero?.inventory) &&
            Array.isArray(parsed.enemies) &&
            Array.isArray(parsed.groundLoot) &&
            Array.isArray(parsed.populations) &&
            typeof parsed.populationCycle === "number" &&
            typeof parsed.worldTimeMs === "number"
          ) {
            setState(parsed);
          }
        }
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
      } finally {
        setSaveLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!saveLoaded) return;
    const timer = window.setInterval(() => {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    }, 1200);
    return () => window.clearInterval(timer);
  }, [saveLoaded]);

  useEffect(() => {
    let frame = 0;
    const animate = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const delta = now - lastFrameRef.current;
      const frameInterval = tvModeRef.current ? TV_FRAME_INTERVAL : DESKTOP_FRAME_INTERVAL;
      if (delta >= frameInterval) {
        lastFrameRef.current = now;
        setState((current) => tickGame(current, delta));
        if (!fpsRef.current.started) fpsRef.current.started = now;
        fpsRef.current.frames += 1;
        if (now - fpsRef.current.started >= 1000) {
          setMeasuredFps(Math.round((fpsRef.current.frames * 1000) / (now - fpsRef.current.started)));
          fpsRef.current = { started: now, frames: 0 };
        }
      }
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const moveTo = useCallback((point: Point) => {
    setState((current) => commandMove(current, point));
  }, []);

  const attackEnemy = useCallback((enemyId: string) => {
    setState((current) => commandAttack(current, enemyId));
  }, []);

  const attackNearest = useCallback(() => {
    setState((current) => commandAttackNearest(current));
  }, []);

  const interactNow = useCallback(() => {
    setState((current) => interact(current));
  }, []);

  const firstAidNow = useCallback(() => {
    setState((current) => applyFirstAid(current));
  }, []);

  const artifactNow = useCallback(() => {
    setState((current) => activateEquippedArtifact(current));
  }, []);

  const activeSkillNow = useCallback((slot: number) => {
    setState((current) => activateSkillSlot(current, slot));
  }, []);

  const loadTrainingBuild = useCallback((build: "mobileFire" | "splashGuard") => {
    setState((current) => applyTrainingBuild(current, build));
    setTalentView(build === "mobileFire" ? "fire" : "force");
  }, []);

  const cancelAction = useCallback(() => {
    setState((current) => cancelHeroAction(current));
  }, []);

  useEffect(() => {
    const moveFocus = (key: string) => {
      const focusRoot: ParentNode = diagnosticsOpen
        ? document.querySelector(".diagnostic-overlay") ?? document
        : characterOpen
          ? document.querySelector(".character-overlay") ?? document
          : document;
      const focusable = [...focusRoot.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']")]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!active || !focusable.includes(active)) {
        focusable[0].focus();
        return;
      }
      const source = active.getBoundingClientRect();
      const sx = source.left + source.width / 2;
      const sy = source.top + source.height / 2;
      const candidates = focusable.flatMap((element) => {
        if (element === active) return [];
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const dx = x - sx;
        const dy = y - sy;
        const valid = key === "arrowleft" ? dx < -4 : key === "arrowright" ? dx > 4 : key === "arrowup" ? dy < -4 : dy > 4;
        if (!valid) return [];
        const primary = key === "arrowleft" || key === "arrowright" ? Math.abs(dx) : Math.abs(dy);
        const secondary = key === "arrowleft" || key === "arrowright" ? Math.abs(dy) : Math.abs(dx);
        return [{ element, score: primary + secondary * 2.4 }];
      });
      candidates.sort((a, b) => a.score - b.score);
      candidates[0]?.element.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      setLastInput(`${event.code || event.key} · ${event.keyCode}`);
      if (key === "c") {
        event.preventDefault();
        setCharacterOpen((open) => !open);
        return;
      }
      if (key === "escape" || key === "browserback" || event.keyCode === 461) {
        event.preventDefault();
        if (diagnosticsOpen) setDiagnosticsOpen(false);
        else if (characterOpen) setCharacterOpen(false);
        else cancelAction();
        return;
      }
      if (characterOpen || diagnosticsOpen) {
        if (["arrowup", "arrowright", "arrowdown", "arrowleft"].includes(key)) {
          event.preventDefault();
          moveFocus(key);
        }
        return;
      }
      if (key === "enter" || key === " ") {
        event.preventDefault();
        if (!event.repeat) {
          okHeldRef.current = true;
          okChordRef.current = false;
        }
        return;
      }
      if (key === "1" || key === "f") {
        event.preventDefault();
        attackNearest();
      } else if (["2", "3", "4", "5"].includes(key)) {
        event.preventDefault();
        activeSkillNow(Number(key) - 2);
      } else if (key === "e") {
        event.preventDefault();
        interactNow();
      } else if (key === "q") {
        event.preventDefault();
        firstAidNow();
      } else if (key === "r") {
        event.preventDefault();
        artifactNow();
      } else {
        const current = gridPoint(stateRef.current.hero.positions[stateRef.current.zone]);
        const direction =
          key === "w" || key === "arrowup"
            ? { x: 0, y: -1 }
            : key === "s" || key === "arrowdown"
              ? { x: 0, y: 1 }
              : key === "a" || key === "arrowleft"
                ? { x: -1, y: 0 }
                : key === "d" || key === "arrowright"
                  ? { x: 1, y: 0 }
                  : null;
        if (direction) {
          event.preventDefault();
          if (okHeldRef.current && key.startsWith("arrow")) {
            okChordRef.current = true;
            const slot = key === "arrowup" ? 0 : key === "arrowright" ? 1 : key === "arrowdown" ? 2 : 3;
            activeSkillNow(slot);
          } else {
            moveTo({ x: current.x + direction.x, y: current.y + direction.y });
          }
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== "enter" && key !== " ") return;
      event.preventDefault();
      const usedChord = okChordRef.current;
      okHeldRef.current = false;
      okChordRef.current = false;
      if (usedChord || characterOpen || diagnosticsOpen) return;
      const hint = interactionHint(stateRef.current);
      if (hint !== "Подойдите к объекту") interactNow();
      else attackNearest();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [activeSkillNow, artifactNow, attackNearest, cancelAction, characterOpen, diagnosticsOpen, firstAidNow, interactNow, moveTo]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const pad = navigator.getGamepads?.().find((candidate) => candidate?.connected);
      if (!pad) {
        gamepadButtonsRef.current.clear();
        return;
      }
      const pressed = new Set<number>();
      pad.buttons.forEach((button, index) => {
        if (button.pressed) pressed.add(index);
      });
      const fresh = [...pressed].filter((index) => !gamepadButtonsRef.current.has(index));
      gamepadButtonsRef.current = pressed;
      if (!fresh.length || performance.now() < gamepadLockRef.current) return;
      gamepadLockRef.current = performance.now() + 130;
      const index = fresh[0];
      setLastInput(`Gamepad · кнопка ${index}`);
      if (index >= 4 && index <= 7) activeSkillNow(index - 4);
      else if (index === 0) attackNearest();
      else if (index === 1) cancelAction();
      else if (index === 2) interactNow();
      else if (index === 3) setCharacterOpen((open) => !open);
      else if (index >= 12 && index <= 15 && !characterOpen && !diagnosticsOpen) {
        const direction = index === 12 ? { x: 0, y: -1 } : index === 13 ? { x: 0, y: 1 } : index === 14 ? { x: -1, y: 0 } : { x: 1, y: 0 };
        const current = gridPoint(stateRef.current.hero.positions[stateRef.current.zone]);
        moveTo({ x: current.x + direction.x, y: current.y + direction.y });
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [activeSkillNow, attackNearest, cancelAction, characterOpen, diagnosticsOpen, interactNow, moveTo]);

  const tiles = useMemo(() => {
    const result: Point[] = [];
    for (let y = 0; y < map.rows.length; y += 1) {
      for (let x = 0; x < map.rows[0].length; x += 1) result.push({ x, y });
    }
    return result.sort((a, b) => a.x + a.y - (b.x + b.y) || a.y - b.y);
  }, [map]);

  const visibleEnemies = state.enemies.filter((enemy) => enemyVisibleToHero(state, enemy));
  const activeThreats = state.enemies.filter(
    (enemy) =>
      enemy.zone === state.zone &&
      enemy.hp > 0 &&
      ["suspicious", "hunting", "combat"].includes(enemy.mode),
  );
  const svgWidth = ((map.rows[0].length + map.rows.length) * TILE_WIDTH) / 2 + 96;
  const svgHeight = ((map.rows[0].length + map.rows.length) * TILE_HEIGHT) / 2 + 108;
  const originX = (map.rows.length * TILE_WIDTH) / 2 + 48;
  const originY = 28;
  const heroIso = toIso(hero, originX, originY);
  const cooldownPercent = Math.min(
    100,
    (state.hero.attackCooldownMs / heroAttackCooldown(state)) * 100,
  );

  const resetGame = () => {
    const fresh = createInitialState();
    setState(fresh);
    setCharacterOpen(false);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
  };

  return (
    <main className={`game-shell realtime-shell ${tvMode ? "tv-mode" : ""}`}>
      <header className="game-header compact-header">
        <div>
          <p className="eyebrow">ПРОТОКОЛ СМЕНЫ · СБ/556-04</p>
          <h1>Самосбор: Смена 556</h1>
          <p className="game-subtitle">Action RPG прототип · этап 4B · фоновые популяции живого мира</p>
        </div>
        <div className="header-indicators">
          <div className="live-indicator"><i />РЕАЛЬНОЕ ВРЕМЯ</div>
          <button
            type="button"
            className={`tv-profile-button ${tvMode ? "active" : ""}`}
            onClick={() => setDiagnosticsOpen(true)}
          >
            {tvMode ? "ТВ · 30 FPS" : "Экран / пульт"}
          </button>
          <div className={`header-status ${activeThreats.length ? "alert" : ""}`}>
            <span className="status-dot" />
            <span>{activeThreats.length ? `Тревога · ${activeThreats.length}` : "Связь нестабильна"}</span>
          </div>
        </div>
      </header>

      <section className="world-strip compact-strip" aria-label="Положение в мире">
        <div><span className="strip-label">Город</span><strong>П-46</strong><small>единый кластер</small></div>
        <span className="strip-connector">→</span>
        <div className={state.zone === "floor555" ? "strip-current" : ""}><span className="strip-label">Ниже</span><strong>Этаж 555</strong><small>ремонтный пояс</small></div>
        <span className="strip-connector">⇅</span>
        <div className={state.zone === "floor556" ? "strip-current" : ""}><span className="strip-label">Опорный</span><strong>Этаж 556</strong><small>технический пояс</small></div>
        <span className="strip-connector">⇅</span>
        <div className={state.zone === "floor557" ? "strip-current" : ""}><span className="strip-label">Выше</span><strong>Этаж 557</strong><small>жилой контур</small></div>
        <span className="strip-connector">⇄</span>
        <div className={state.zone === "voidLab" ? "strip-current void" : ""}><span className="strip-label">Межэтажье</span><strong>ВЖ-7</strong><small>лабораторный слой</small></div>
      </section>

      <section className="game-layout realtime-layout">
        <div className={`map-card realtime-map-card ${state.zone === "voidLab" ? "void-card" : ""}`}>
          <div className="map-heading realtime-heading">
            <div>
              <p className="map-kicker">ТЕКУЩАЯ ЛОКАЦИЯ</p>
              <h2>{map.name}</h2>
              <p>{map.subtitle}</p>
            </div>
            <div className="realtime-readout">
              <span>Время смены</span>
              <strong>{formattedWorldTime(state)}</strong>
              <small>Скорость {heroMoveSpeed(state).toFixed(1)} кл/с</small>
            </div>
          </div>

          <div className="map-stage realtime-stage">
            <svg
              className="iso-map realtime-map"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              role="img"
              aria-label={`Карта: ${map.name}`}
            >
              <defs>
                <filter id="void-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="actor-shadow" x="-70%" y="-70%" width="240%" height="240%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
                </filter>
              </defs>

              {tiles.map((point) => {
                const tile = tileAt(state, point);
                const known = isKnown(state, point);
                const visible = isVisible(state, point);
                const iso = toIso(point, originX, originY);
                const cx = iso.x;
                const cy = iso.y - TILE_HEIGHT / 2;
                const isWall = tile === "#";
                const marker = !isWall && known ? TILE_MARKS[tile] : null;
                const inTargetVision =
                  target &&
                  known &&
                  distance(target.position, point) <= target.visionRadius &&
                  hasLineOfSight(state, target.position, point);
                const inTargetAggro =
                  target &&
                  inTargetVision &&
                  distance(target.position, point) <= target.aggroRadius;
                const inWeaponRange =
                  target &&
                  known &&
                  distance(hero, point) <= heroAttackRange(state) &&
                  hasLineOfSight(state, hero, point);
                const stroke = inTargetAggro
                  ? "#d65e56"
                  : inTargetVision
                    ? "#c29c4d"
                    : inWeaponRange
                      ? "#7cae96"
                      : tile === "c" && known
                        ? "#7ea59d"
                        : tile === "P" && known
                          ? "#b06bdd"
                          : (tile === "U" || tile === "D") && known
                            ? "#82b7ad"
                            : "#252a26";

                return (
                  <g
                    key={`${point.x}-${point.y}`}
                    className={`iso-tile ${known ? "known" : "unknown"}`}
                    onPointerDown={() => known && !isWall && moveTo(point)}
                    role={known && !isWall ? "button" : undefined}
                    aria-label={known ? TILE_LABELS[tile] : undefined}
                  >
                    {isWall && known ? (
                      <polygon
                        points={`${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2 - 9} ${cx},${cy + TILE_HEIGHT - 9} ${cx},${cy + TILE_HEIGHT} ${cx - TILE_WIDTH / 2},${cy + TILE_HEIGHT / 2}`}
                        fill={state.zone === "voidLab" ? "#211928" : "#2d302c"}
                      />
                    ) : null}
                    <polygon
                      points={pointsForDiamond(cx, cy - (isWall && known ? 9 : 0))}
                      fill={tileColor(tile, state.zone === "voidLab", known)}
                      opacity={visible ? 1 : known ? 0.5 : 0.78}
                      stroke={stroke}
                      strokeWidth={inTargetAggro ? 2.8 : inTargetVision || inWeaponRange ? 2 : 1.3}
                      filter={(tile === "P" || tile === "U" || tile === "D") && visible ? "url(#void-glow)" : undefined}
                    />
                    {marker ? (
                      <g opacity={visible ? 1 : 0.55}>
                        <circle cx={cx} cy={cy + TILE_HEIGHT / 2 - 3} r={tile === "P" || tile === "U" || tile === "D" ? 13 : 10} fill="#20231f" stroke={tile === "A" ? "#e4c170" : "#aeb4a7"} strokeWidth="2" />
                        <text x={cx} y={cy + TILE_HEIGHT / 2 + 2} textAnchor="middle" className="map-symbol">{marker}</text>
                      </g>
                    ) : null}
                  </g>
                );
              })}

              {state.hero.path.length ? (
                <polyline
                  className="movement-path"
                  points={[hero, ...state.hero.path]
                    .map((point) => {
                      const iso = toIso(point, originX, originY);
                      return `${iso.x},${iso.y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#d7c76f"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                />
              ) : null}

              {state.hero.destination ? (() => {
                const iso = toIso(state.hero.destination, originX, originY);
                return <circle className="destination-ring" cx={iso.x} cy={iso.y} r="13" fill="none" stroke="#e7cf72" strokeWidth="2" />;
              })() : null}

              {state.effects.map((effect) => {
                const from = toIso(effect.from, originX, originY);
                const to = toIso(effect.to, originX, originY);
                const color = effect.kind === "enemy-hit" ? "#e46a5e" : effect.kind === "drone" ? "#79c5c0" : effect.kind === "miss" ? "#9b9d91" : "#f0d26d";
                return (
                  <g key={effect.id} className={`combat-effect effect-${effect.kind}`} opacity={Math.min(1, effect.ttlMs / 180)}>
                    <line x1={from.x} y1={from.y - 12} x2={to.x} y2={to.y - 12} stroke={color} strokeWidth={effect.kind === "drone" ? 2 : 3} />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 20} textAnchor="middle" fill={color}>{effect.kind === "miss" ? "МИМО" : `−${effect.value}`}</text>
                  </g>
                );
              })}

              {visibleLoot.map((loot, index) => {
                const iso = toIso(loot.position, originX, originY);
                const item = ITEMS[loot.itemId];
                const visible = isVisible(state, loot.position);
                return (
                  <g
                    key={loot.id}
                    className="loot-marker"
                    transform={`translate(${iso.x + (index % 2) * 9} ${iso.y - 18 - (index % 3) * 3})`}
                    opacity={visible ? 1 : 0.5}
                    role="button"
                    aria-label={`Добыча: ${item.name}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      moveTo(loot.position);
                    }}
                  >
                    <path d="M -9 3 L -6 -7 L 7 -7 L 10 3 L 0 9 Z" fill="#39372a" stroke="#e1c86d" strokeWidth="2" />
                    <text x="0" y="2" textAnchor="middle" fill="#f2dfa0">{item.kind === "artifact" ? "◈" : "•"}</text>
                  </g>
                );
              })}

              {visibleEnemies.map((enemy) => {
                const iso = toIso(enemy.position, originX, originY);
                const color = MODE_COLORS[enemy.mode];
                const selected = target?.id === enemy.id;
                return (
                  <g
                    key={enemy.id}
                    className={`enemy-marker ${selected ? "targeted" : ""}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      attackEnemy(enemy.id);
                    }}
                    role="button"
                    aria-label={`${enemy.name}, ${MODE_LABELS[enemy.mode]}`}
                    filter="url(#actor-shadow)"
                  >
                    {selected ? <circle cx={iso.x} cy={iso.y + 1} r="24" fill="none" stroke="#efcf68" strokeWidth="2" strokeDasharray="5 4" /> : null}
                    <ellipse cx={iso.x} cy={iso.y + 8} rx="19" ry="8" fill="#100f0e" opacity="0.72" />
                    <rect x={iso.x - 14} y={iso.y - 22} width="28" height="28" rx={enemy.kind === "stalker" ? 14 : 5} fill="#292523" stroke={color} strokeWidth="3" />
                    <text x={iso.x} y={iso.y - 4} textAnchor="middle" className="enemy-symbol" fill={color}>{ENEMY_SIGNS[enemy.kind]}</text>
                    <rect x={iso.x - 18} y={iso.y + 13} width="36" height="4" rx="2" fill="#171412" />
                    <rect x={iso.x - 18} y={iso.y + 13} width={36 * (enemy.hp / enemy.maxHp)} height="4" rx="2" fill={color} />
                  </g>
                );
              })}

              {branchPoints.engineer >= 1 ? (
                <g className="drone-marker" transform={`translate(${heroIso.x + 20} ${heroIso.y - 31})`} filter="url(#actor-shadow)">
                  <path d="M -8 0 L 0 -7 L 8 0 L 0 7 Z" fill="#3d5552" stroke="#8ec7c0" strokeWidth="2" />
                  <circle cx="0" cy="0" r="2.5" fill="#d4f2ed" />
                </g>
              ) : null}

              <g className="hero-marker" aria-label="Главный герой" filter="url(#actor-shadow)">
                <ellipse cx={heroIso.x} cy={heroIso.y + 7} rx="18" ry="8" fill="#11140f" opacity="0.68" />
                <circle cx={heroIso.x} cy={heroIso.y - 8} r="14" fill={state.hero.hp <= Math.ceil(heroMaxHp / 3) ? "#c86e5b" : "#d2c06e"} stroke="#f7eaa1" strokeWidth="3" />
                <path d={`M ${heroIso.x - 7} ${heroIso.y - 9} L ${heroIso.x} ${heroIso.y - 17} L ${heroIso.x + 7} ${heroIso.y - 9}`} fill="none" stroke="#34362e" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>

            <div className="map-instruction"><strong>КЛИК · КАСАНИЕ · D-PAD</strong><span>позиционирование героя</span><i />Мир движется непрерывно</div>

            {state.missionComplete ? (
              <div className="mission-complete" role="status">
                <span>ДИРЕКТИВА ВЫПОЛНЕНА</span>
                <strong>Смена 556 закрыта</strong>
                <button type="button" onClick={resetGame}>Начать заново</button>
              </div>
            ) : null}
          </div>

          <div className={`anomaly-line ${state.mutated || activeThreats.length ? "active" : ""}`}>
            <span>{activeThreats.length ? "ТРЕВОГА" : state.mutated ? "АНОМАЛИЯ" : "КОНТРОЛЬ"}</span>
            <strong>{state.zone === "voidLab" ? `Стабильность: ${Math.ceil(state.voidStabilityMs / 1000)} сек.` : activeThreats.length ? `Активных угроз: ${activeThreats.length}` : "Сектор наблюдается в реальном времени"}</strong>
            {state.noise?.ttlMs ? <small>Шум: {state.noise.label} · {state.noise.radius.toFixed(1)}</small> : null}
          </div>
        </div>

        <aside className="side-panel realtime-side">
          <section className="panel-card objective-card">
            <p className="panel-label">ТЕКУЩАЯ ДИРЕКТИВА</p>
            <h2>{objectiveFor(state)}</h2>
            <p>Перемещайтесь кликом, касанием, D-pad или стиком. Боевая директива: <strong>{state.hero.combatDirective === "mobileFire" ? "мобильный огонь" : state.hero.combatDirective === "splashGuard" ? "сбор пачки" : "ручная цель"}</strong>.</p>
          </section>

          <section className="panel-card population-card">
            <div className="population-heading">
              <div><p className="panel-label">ЖИВОЙ ЭТАЖ</p><h3>Давление популяций: {localPopulationPressure}</h3></div>
              <span className={`population-pressure ${localPopulationPressure >= 25 ? "high" : ""}`}>{localPopulations.length}</span>
            </div>
            {localPopulations.length ? (
              <ul className="population-list">
                {localPopulations.map((population) => (
                  <li key={population.id}>
                    <div><strong>{population.name}</strong><small>{GENOME_LABELS[population.genome]} геном · цель: {population.goal}</small></div>
                    <span><b>{population.count}</b><small>{Math.round(population.agitation)}% тревоги</small></span>
                  </li>
                ))}
              </ul>
            ) : <p>В зоне не зафиксировано устойчивых групп.</p>}
          </section>

          <section className="panel-card hero-card">
            <div className="hero-card-head">
              <div><p className="panel-label">СОТРУДНИК 556-04</p><h3>{classTitle}</h3></div>
              <button type="button" className="character-shortcut" onClick={() => setCharacterOpen(true)}>Персонаж <kbd>C</kbd></button>
            </div>
            <div className="stat-row"><span>Здоровье</span><strong>{state.hero.hp} / {heroMaxHp}</strong></div>
            <div className="meter health-meter"><i style={{ width: `${(state.hero.hp / heroMaxHp) * 100}%` }} /></div>
            <div className="stat-row compact"><span>Уровень</span><strong>{state.hero.level}</strong></div>
            <div className="meter xp-meter"><i style={{ width: `${(state.hero.xp / xpToNextLevel(state)) * 100}%` }} /></div>
            <div className="stat-row compact"><span>Оружие</span><strong>{weapon.shortName} · {weapon.range.toFixed(1)} кл.</strong></div>
            <div className="stat-row compact"><span>Защита</span><strong>{heroDefense(state)}</strong></div>
            <div className="survival-stats">
              <span className={carriedWeight > weightLimit ? "danger" : ""}><small>Груз</small><strong>{carriedWeight.toFixed(1)} / {weightLimit.toFixed(0)} кг</strong></span>
              <span className={state.hero.stress >= 60 ? "danger" : ""}><small>Стресс</small><strong>{Math.round(state.hero.stress)}%</strong></span>
              <span className={state.hero.contamination >= 40 ? "danger" : ""}><small>Заражение</small><strong>{Math.round(state.hero.contamination)}%</strong></span>
            </div>
            {injuries.length ? <ul className="injury-list">{injuries.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </section>

          <section className={`panel-card target-card ${target ? "has-target" : ""}`}>
            <p className="panel-label">БОЕВАЯ ЦЕЛЬ</p>
            {target ? (
              <>
                <div className="target-title"><h3>{target.name}</h3><span className={`mode-badge mode-${target.mode}`}>{MODE_LABELS[target.mode]}</span></div>
                {target.stunnedUntilMs > state.worldTimeMs ? <div className="cast-status interrupted">МИКРООГЛУШЕНИЕ · команда сорвана</div> : target.castUntilMs > state.worldTimeMs ? <div className="cast-status">ПОДГОТОВКА АТАКИ · {Math.max(0, target.castUntilMs - state.worldTimeMs).toFixed(0)} мс</div> : null}
                <div className="stat-row"><span>Состояние</span><strong>{target.hp} / {target.maxHp} ОЗ</strong></div>
                <div className="meter enemy-meter"><i style={{ width: `${(target.hp / target.maxHp) * 100}%`, background: MODE_COLORS[target.mode] }} /></div>
                <p>{enemyDescription(target)}</p>
                <div className="target-data">
                  <span><small>До цели</small><strong>{distance(hero, target.position).toFixed(1)}</strong></span>
                  <span><small>Ваш радиус</small><strong>{heroAttackRange(state).toFixed(1)}</strong></span>
                  <span><small>Агро</small><strong>{target.aggroRadius.toFixed(1)}</strong></span>
                </div>
                <button type="button" className="cancel-target" onClick={cancelAction}>Снять цель <kbd>Esc</kbd></button>
              </>
            ) : (
              <p>Кликните по противнику. Герой сам подойдёт на дистанцию экипированного оружия и начнёт атаковать.</p>
            )}
          </section>

          <section className="panel-card threats-card">
            <p className="panel-label">ВИДИМЫЕ УГРОЗЫ</p>
            {visibleEnemies.length ? (
              <div className="threat-list">
                {visibleEnemies.map((enemy) => (
                  <button key={enemy.id} type="button" onClick={() => attackEnemy(enemy.id)} className={target?.id === enemy.id ? "selected-threat" : ""}>
                    <i style={{ background: MODE_COLORS[enemy.mode] }} />
                    <span><strong>{enemy.name}</strong><small>{MODE_LABELS[enemy.mode]} · {distance(hero, enemy.position).toFixed(1)} кл.</small></span>
                  </button>
                ))}
              </div>
            ) : <p>Контактов нет. Шум может изменить ситуацию за несколько секунд.</p>}
          </section>

          <section className="panel-card log-card" aria-live="polite">
            <p className="panel-label">ЖУРНАЛ СОБЫТИЙ</p>
            <ol>{state.log.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
          </section>
        </aside>
      </section>

      <section className="action-dock" aria-label="Управление героем">
        <div className="health-orb" style={{ "--health": `${(state.hero.hp / heroMaxHp) * 100}%` } as CSSProperties}>
          <strong>{state.hero.hp}</strong><span>ОЗ</span>
        </div>
        <div className="movement-help"><strong>ДВИЖЕНИЕ</strong><span>Клик / касание по карте</span><small>WASD также доступен</small></div>
        <div className="action-slots">
          <button type="button" className="ability attack-ability" onClick={attackNearest}>
            <span className="ability-key">1</span><strong>{weapon.shortName}</strong><small>{heroAttackDamage(state)} урона · {weapon.range.toFixed(1)} кл.</small>
            <i className="cooldown-mask" style={{ height: `${cooldownPercent}%` }} />
          </button>
          {state.hero.activeSkillSlots.map((skillId, slot) => {
            const skill = skillId ? ACTIVE_SKILLS[skillId] : null;
            const cooldown = skillId ? state.hero.activeSkillCooldowns[skillId] ?? 0 : 0;
            const cooldownHeight = skill ? Math.min(100, (cooldown / skill.cooldownMs) * 100) : 0;
            return (
              <button
                key={`active-${slot}`}
                type="button"
                className={`ability active-skill branch-${skill?.branch ?? "empty"}`}
                onClick={() => activeSkillNow(slot)}
                disabled={!skill}
              >
                <span className="ability-key">{slot + 2}</span>
                <strong>{skill?.shortName ?? `Ячейка ${slot + 1}`}</strong>
                <small>{skill?.role ?? "Назначьте навык"}</small>
                <i className="cooldown-mask" style={{ height: `${cooldownHeight}%` }} />
              </button>
            );
          })}
          <button type="button" className="ability" onClick={interactNow}><span className="ability-key">E</span><strong>Использовать</strong><small>{interactionHint(state)}</small></button>
          <button type="button" className="ability aid-ability" onClick={firstAidNow} disabled={!bandageCount}><span className="ability-key">Q</span><strong>Перевязка ×{bandageCount}</strong><small>2 ОЗ · стабилизация травмы</small></button>
          <button type="button" className="ability artifact-ability" onClick={artifactNow} disabled={!artifact}><span className="ability-key">R</span><strong>{artifact ? ITEMS[artifact.itemId].shortName : "Артефакт"}</strong><small>{artifact ? ITEMS[artifact.itemId].useLabel : "Не экипирован"}</small><i className="cooldown-mask artifact-cooldown" style={{ height: `${Math.min(100, (state.hero.artifactCooldownMs / 30000) * 100)}%` }} /></button>
          <button type="button" className="ability" onClick={() => setCharacterOpen(true)}><span className="ability-key">C</span><strong>Персонаж</strong><small>Дерево · {state.hero.talents.length}/{BASE_TALENT_COUNT + 4}</small></button>
        </div>
        <div className="weapon-readout"><span>Оружие</span><strong>{weapon.name}</strong><small>{(heroAttackCooldown(state) / 1000).toFixed(2)} сек. между атаками</small></div>
      </section>

      {characterOpen ? (
        <div className="character-overlay" role="dialog" aria-modal="false" aria-label="Панель персонажа">
          <div className="character-window">
            <header>
              <div><p className="eyebrow">ЛИЧНОЕ ДЕЛО · 556-04</p><h2>Панель персонажа</h2><p>Мир продолжает двигаться, пока открыто личное дело.</p></div>
              <div className="window-status"><i />LIVE</div>
              <button type="button" className="close-character" onClick={() => setCharacterOpen(false)} aria-label="Закрыть панель персонажа">×</button>
            </header>

            <div className="character-grid">
              <section className="paperdoll-section">
                <p className="panel-label">ЭКИПИРОВКА</p>
                <div className="paperdoll">
                  <div className="doll-silhouette"><i className="doll-head" /><i className="doll-body" /><i className="doll-arm left" /><i className="doll-arm right" /><i className="doll-leg left" /><i className="doll-leg right" /></div>
                  {PAPERDOLL_SLOTS.map((slot) => {
                    const entry = equippedEntry(state, slot);
                    const item = entry ? ITEMS[entry.itemId] : null;
                    return (
                      <div key={slot} className={`gear-slot slot-${slot} ${entry ? "filled" : "empty"} ${item?.rarity === "legendary" ? "legendary" : ""}`}>
                        <small>{SLOT_NAMES[slot]}</small>
                        <strong>{item?.shortName ?? "Пусто"}</strong>
                        {entry ? <em className={conditionTone(entry.condition)}>{Math.round(entry.condition)}%</em> : null}
                      </div>
                    );
                  })}
                  <div className={`gear-slot slot-drone ${branchPoints.engineer >= 1 ? "unlocked" : ""}`}><small>Спутник</small><strong>{branchPoints.engineer >= 1 ? "Рембот Р-3" : "Требуется Инженер I"}</strong></div>
                </div>
                <div className="character-status-grid">
                  <span><small>ОЗ</small><strong>{state.hero.hp}/{heroMaxHp}</strong></span>
                  <span><small>Защита</small><strong>{heroDefense(state)}</strong></span>
                  <span><small>Скорость</small><strong>{heroMoveSpeed(state).toFixed(1)}</strong></span>
                  <span className={carriedWeight > weightLimit ? "danger" : ""}><small>Груз</small><strong>{carriedWeight.toFixed(1)}/{weightLimit.toFixed(0)}</strong></span>
                  <span className={state.hero.stress >= 60 ? "danger" : ""}><small>Стресс</small><strong>{Math.round(state.hero.stress)}%</strong></span>
                  <span className={state.hero.contamination >= 40 ? "danger" : ""}><small>Заражение</small><strong>{Math.round(state.hero.contamination)}%</strong></span>
                </div>
                {injuries.length ? <ul className="character-injuries">{injuries.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </section>

              <section className="loadout-section inventory-section">
                <div className="inventory-heading">
                  <div><p className="panel-label">РЮКЗАК И ДОБЫЧА</p><h3>Предметы смены</h3></div>
                  <strong className={carriedWeight > weightLimit ? "overloaded" : ""}>{carriedWeight.toFixed(1)} / {weightLimit.toFixed(1)} кг</strong>
                </div>
                <div className="carry-meter"><i style={{ width: `${Math.min(100, (carriedWeight / weightLimit) * 100)}%` }} /></div>
                <div className="inventory-list">
                  {sortedInventory.map((entry) => {
                    const item = ITEMS[entry.itemId];
                    const equipped = Object.values(state.hero.equipment).includes(entry.instanceId);
                    const weaponStats = item.kind === "weapon" ? WEAPONS[entry.itemId as keyof typeof WEAPONS] : null;
                    return (
                      <article key={entry.instanceId} className={`inventory-item kind-${item.kind} rarity-${item.rarity ?? "common"} ${equipped ? "equipped" : ""}`}>
                        <span className="item-glyph">{itemGlyph(entry)}</span>
                        <div className="item-copy">
                          <h4>{item.rarity === "legendary" ? <em className="rarity-label">ЛЕГЕНДАРНОЕ</em> : null}{item.name}{entry.quantity > 1 ? ` ×${entry.quantity}` : ""}</h4>
                          <p>{item.description}</p>
                          <div className="item-facts">
                            <span>{(item.weight * entry.quantity).toFixed(1)} кг</span>
                            {!item.stackable ? <span className={conditionTone(entry.condition)}>состояние {Math.round(entry.condition)}%</span> : null}
                            {weaponStats ? <><span>{weaponStats.damage} урон</span><span>{weaponStats.range.toFixed(1)} кл.</span></> : null}
                            {item.stats?.armor ? <span>броня +{item.stats.armor}</span> : null}
                            {item.grantedTalents?.map((talentId) => <span key={talentId} className="legendary-fact">узел: {TALENT_NODES.find((node) => node.id === talentId)?.name}</span>)}
                          </div>
                        </div>
                        <div className="item-actions">
                          {equipped ? <span className="equipped-label">Экипировано</span> : item.slot ? (
                            <button type="button" onClick={() => setState((current) => equipItem(current, entry.instanceId))}>Надеть</button>
                          ) : item.kind === "consumable" ? (
                            <button type="button" onClick={() => setState((current) => consumeInventoryItem(current, entry.instanceId))}>{item.useLabel ?? "Использовать"}</button>
                          ) : <span className="stored-label">В рюкзаке</span>}
                          {!equipped ? <button type="button" className="drop-item" onClick={() => setState((current) => dropInventoryItem(current, entry.instanceId))}>Выложить</button> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <p className="panel-label attributes-label">ХАРАКТЕРИСТИКИ</p>
                <div className="attribute-row">
                  <span><small>Тело</small><strong>{effectiveAttribute(state, "body")}</strong><em>база {state.hero.attributes.body}</em></span>
                  <span><small>Реакция</small><strong>{effectiveAttribute(state, "reaction")}</strong><em>база {state.hero.attributes.reaction}</em></span>
                  <span><small>Внимание</small><strong>{effectiveAttribute(state, "attention")}</strong><em>база {state.hero.attributes.attention}</em></span>
                  <span><small>Техника</small><strong>{effectiveAttribute(state, "technique")}</strong><em>база {state.hero.attributes.technique}</em></span>
                  <span><small>Воля</small><strong>{effectiveAttribute(state, "will")}</strong><em>база {state.hero.attributes.will}</em></span>
                </div>
              </section>

              <section className="skills-section">
                <div className="skills-heading">
                  <div>
                    <p className="panel-label">ДЕРЕВО ДОПУСКОВ · 121 БАЗОВЫЙ + 4 ВНЕШНИХ</p>
                    <h3>{classTitle}</h3>
                    <p>Основные очки уходят в пассивы. Активные навыки открываются на 1/4/8 очках ветви; гибридный допуск требует 8+8.</p>
                  </div>
                  <strong>{state.hero.skillPoints} очк.</strong>
                </div>

                <div className="training-builds">
                  <div><p className="panel-label">ИСПЫТАТЕЛЬНЫЕ СБОРКИ ДЛЯ ПУЛЬТА</p><span>Загружают готовый боевой стенд и легендарный внешний узел.</span></div>
                  <button type="button" onClick={() => loadTrainingBuild("mobileFire")}>Стрелок на муве<small>кайт · головокружение · срыв кастов</small></button>
                  <button type="button" onClick={() => loadTrainingBuild("splashGuard")}>Воин-сплэшер<small>сбор пачки · провокация · урон по площади</small></button>
                </div>

                <div className="directive-selector" aria-label="Боевая директива">
                  {([
                    ["manual", "Ручная цель", "Все решения игрока"],
                    ["mobileFire", "Мобильный огонь", "Автоцель, игрок кайтит"],
                    ["splashGuard", "Сбор пачки", "Автоцель ближнего боя"],
                  ] as const).map(([directive, label, note]) => (
                    <button
                      key={directive}
                      type="button"
                      className={state.hero.combatDirective === directive ? "active" : ""}
                      onClick={() => setState((current) => setCombatDirective(current, directive))}
                    >
                      <strong>{label}</strong><small>{note}</small>
                    </button>
                  ))}
                </div>

                <nav className="talent-tabs" aria-label="Разделы дерева">
                  <button type="button" className={talentView === "core" ? "active" : ""} onClick={() => setTalentView("core")}>Центр</button>
                  {SKILL_BRANCHES.map((branch) => (
                    <button key={branch} type="button" className={`${talentView === branch ? "active" : ""} branch-${branch}`} onClick={() => setTalentView(branch)}>
                      <span>{branchGlyph(branch)}</span>{SKILL_NAMES[branch]}<em>{branchPoints[branch]}</em>
                    </button>
                  ))}
                  <button type="button" className={talentView === "hybrid" ? "active" : ""} onClick={() => setTalentView("hybrid")}>Совмещённые<em>{state.hero.talents.filter((id) => id.startsWith("hybrid:")).length}/15</em></button>
                  <button type="button" className={`${talentView === "legendary" ? "active" : ""} legendary-tab`} onClick={() => setTalentView("legendary")}>Легендарные<em>{state.hero.discoveredTalents.length}/4</em></button>
                </nav>

                {SKILL_BRANCHES.includes(talentView as SkillBranch) ? (
                  <div className="branch-summary">
                    <span className={`threshold ${branchPoints[talentView as SkillBranch] >= 4 ? "reached" : ""}`}>I · 4</span>
                    <span className={`threshold ${branchPoints[talentView as SkillBranch] >= 8 ? "reached" : ""}`}>II · 8</span>
                    <span className={`threshold ${branchPoints[talentView as SkillBranch] >= 14 ? "reached" : ""}`}>III · 14</span>
                    <p>{SKILL_DESCRIPTIONS[talentView as SkillBranch]}</p>
                  </div>
                ) : null}

                <div className={`skill-tree talent-grid view-${talentView}`}>
                  {selectedTalents.map((node) => {
                    const active = state.hero.talents.includes(node.id);
                    const discovered = node.scope !== "legendary" || state.hero.discoveredTalents.includes(node.id);
                    const available = canAllocateTalent(state, node.id);
                    const pairProgress = node.pair ? `${branchPoints[node.pair[0]]}/8 + ${branchPoints[node.pair[1]]}/8` : null;
                    return (
                      <article key={node.id} className={`talent-node kind-${node.kind} ${active ? "active" : ""} ${!discovered ? "undiscovered" : ""}`}>
                        <span className="skill-glyph">{node.scope === "legendary" ? "✦" : node.scope === "hybrid" ? "×" : node.scope === "core" ? "•" : branchGlyph(node.scope)}</span>
                        <div>
                          <small className="node-type">{!discovered ? "НЕИЗВЕСТНЫЙ ВНЕШНИЙ УЗЕЛ" : `${node.kind} · уровень ${node.tier}`}</small>
                          <h4>{discovered ? node.name : "Запись отсутствует"}</h4>
                          <p>{discovered ? node.description : "Открывается сюжетной наградой, редким боссом или легендарным предметом."}</p>
                          {pairProgress ? <em className="pair-progress">Допуск: {pairProgress}</em> : null}
                          {node.requiredBranchPoints ? <em className="pair-progress">Требуется {node.requiredBranchPoints} очков этой ветви</em> : null}
                        </div>
                        <button
                          type="button"
                          disabled={!available}
                          className={active ? "allocated" : ""}
                          onClick={() => setState((current) => allocateTalent(current, node.id))}
                          aria-label={`Освоить ${node.name}`}
                        >
                          {active ? "✓" : "+"}
                        </button>
                      </article>
                    );
                  })}
                </div>

                <div className="active-loadout-editor">
                  <div className="active-loadout-heading">
                    <div><p className="panel-label">АКТИВНАЯ РОТАЦИЯ</p><h3>Четыре ячейки</h3><p>Любой навык работает отдельно и имеет межветочные теги. Выберите ячейку, затем назначьте открытый навык.</p></div>
                  </div>
                  <div className="active-slot-selector">
                    {state.hero.activeSkillSlots.map((skillId, slot) => (
                      <button key={slot} type="button" className={selectedSkillSlot === slot ? "active" : ""} onClick={() => setSelectedSkillSlot(slot)}>
                        <span>{slot + 2}</span><strong>{skillId ? ACTIVE_SKILLS[skillId].shortName : "Пусто"}</strong><small>ячейка {slot + 1}</small>
                      </button>
                    ))}
                  </div>
                  <div className="active-skill-catalog">
                    {(Object.keys(ACTIVE_SKILLS) as ActiveSkillId[]).map((skillId) => {
                      const skill = ACTIVE_SKILLS[skillId];
                      const unlocked = unlockedSkills.includes(skillId);
                      const assigned = state.hero.activeSkillSlots.includes(skillId);
                      return (
                        <button
                          key={skillId}
                          type="button"
                          className={`skill-choice branch-${skill.branch} ${assigned ? "assigned" : ""}`}
                          disabled={!unlocked}
                          onClick={() => setState((current) => assignActiveSkill(current, selectedSkillSlot, skillId))}
                        >
                          <span>{branchGlyph(skill.branch)}</span>
                          <strong>{skill.name}</strong>
                          <small>{unlocked ? `${skill.role} · ${(skill.cooldownMs / 1000).toFixed(1)} с` : `нужно ${skill.unlockAt} очк. ${SKILL_NAMES[skill.branch]}`}</small>
                          <em>{skill.description}</em>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            <footer><button type="button" className="reset-character" onClick={resetGame}>Сбросить прототип</button><button type="button" className="close-main" onClick={() => setCharacterOpen(false)}>Вернуться в локацию</button></footer>
          </div>
        </div>
      ) : null}

      {diagnosticsOpen ? (
        <div className="character-overlay diagnostic-overlay" role="dialog" aria-modal="false" aria-label="Диагностика телевизора и пульта">
          <div className="diagnostic-window">
            <header>
              <div><p className="eyebrow">ТЕХНИЧЕСКИЙ ПОДХОД · ТВ-БРАУЗЕР</p><h2>Диагностика пульта и производительности</h2><p>Нажимайте кнопки пульта или геймпада: последнее событие отображается без привязки к конкретной прошивке.</p></div>
              <button type="button" className="close-character" onClick={() => setDiagnosticsOpen(false)} aria-label="Закрыть диагностику">×</button>
            </header>
            <div className="diagnostic-grid">
              <section>
                <p className="panel-label">ПРОФИЛЬ</p>
                <strong>{tvMode ? "Телевизор · 1280×720 логический слой · 30 FPS" : "Стандартный · адаптивный слой · до 60 FPS"}</strong>
                <button type="button" className={tvMode ? "active" : ""} onClick={() => setTvMode((value) => !value)}>{tvMode ? "Отключить ТВ-профиль" : "Включить ТВ-профиль"}</button>
              </section>
              <section>
                <p className="panel-label">ФАКТИЧЕСКИЙ КАДР</p>
                <strong>{measuredFps || "…"} FPS</strong>
                <span>Цель: {tvMode ? "стабильные 30" : "до 60"}</span>
              </section>
              <section>
                <p className="panel-label">ПОСЛЕДНИЙ ВВОД</p>
                <strong>{lastInput}</strong>
                <span>Проверяются key, code и числовой код.</span>
              </section>
              <section>
                <p className="panel-label">ГЕЙМПАД</p>
                <strong>{typeof navigator !== "undefined" && navigator.getGamepads?.().some((pad) => pad?.connected) ? "Подключён" : "Не обнаружен"}</strong>
                <span>A — атака, X — действие, плечи — четыре навыка.</span>
              </section>
            </div>
            <div className="remote-map">
              <div><kbd>↑ ↓ ← →</kbd><span>Движение героя; в меню — пространственный фокус</span></div>
              <div><kbd>OK</kbd><span>Контекстное действие или атака ближайшей цели</span></div>
              <div><kbd>OK + направление</kbd><span>Четыре активных навыка</span></div>
              <div><kbd>Назад</kbd><span>Закрыть окно или снять цель</span></div>
            </div>
            <footer><button type="button" onClick={() => { setDiagnosticsOpen(false); setCharacterOpen(true); }}>Проверить фокус в дереве</button><button type="button" className="close-main" onClick={() => setDiagnosticsOpen(false)}>Вернуться в игру</button></footer>
          </div>
        </div>
      ) : null}
    </main>
  );
}
