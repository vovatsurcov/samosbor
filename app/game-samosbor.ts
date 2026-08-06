export type SamosborPhase = "calm" | "omen" | "siren" | "active" | "fade";

export type SamosborPhaseProfile = {
  label: string;
  hint: string;
  minMs: number;
  maxMs: number;
};

export const SAMOSBOR_PHASE_PROFILES: Record<SamosborPhase, SamosborPhaseProfile> = {
  calm: {
    label: "ФОН",
    hint: "датчики среды не фиксируют подготовку Самосбора",
    minMs: 0,
    maxMs: 0,
  },
  omen: {
    label: "ПРЕДВЕСТНИКИ",
    hint: "низкий гул, дрожь конструкций и сбои света",
    minMs: 30000,
    maxMs: 90000,
  },
  siren: {
    label: "СИРЕНА",
    hint: "аварийный свет; известные гермоукрытия подсвечены",
    minMs: 20000,
    maxMs: 35000,
  },
  active: {
    label: "АКТИВНАЯ ФАЗА",
    hint: "открытое пространство смертельно; бой не спасает",
    minMs: 60000,
    maxMs: 300000,
  },
  fade: {
    label: "ЗАТУХАНИЕ",
    hint: "сирена смолкла, остались помехи и новые угрозы",
    minMs: 20000,
    maxMs: 60000,
  },
};

const PHASE_SEQUENCE: Record<SamosborPhase, SamosborPhase> = {
  calm: "omen",
  omen: "siren",
  siren: "active",
  active: "fade",
  fade: "calm",
};

/** Сценарный первый Самосбор на этаже 556 использует фиксированные длительности. */
export const SAMOSBOR_SCRIPTED_PHASE_MS: Record<SamosborPhase, number> = {
  calm: 0,
  omen: 90000,
  siren: 30000,
  active: 75000,
  fade: 25000,
};

export type SamosborZoneProfile = {
  /** Этаж полностью защищён: событие на нём не запускается. */
  sheltered: boolean;
  /** Тяжесть активной фазы: скорость урона, заражения и стресса вне контура. */
  severity: number;
  quietMinMs: number;
  quietMaxMs: number;
  /** Первое событие этажа является обучающим и запускается сценарием, а не таймером. */
  scripted: boolean;
  shelterReason?: string;
};

const DEFAULT_ZONE_PROFILE: SamosborZoneProfile = {
  sheltered: false,
  severity: 1,
  quietMinMs: 480000,
  quietMaxMs: 900000,
  scripted: false,
};

export const SAMOSBOR_ZONE_PROFILES: Record<string, SamosborZoneProfile> = {
  floor557: { sheltered: false, severity: 0.8, quietMinMs: 540000, quietMaxMs: 1020000, scripted: false },
  floor556: { sheltered: false, severity: 0.7, quietMinMs: 600000, quietMaxMs: 1080000, scripted: true },
  floor555: { sheltered: false, severity: 0.85, quietMinMs: 540000, quietMaxMs: 960000, scripted: false },
  floor554: {
    sheltered: true,
    severity: 0,
    quietMinMs: 0,
    quietMaxMs: 0,
    scripted: false,
    shelterReason: "Город 550 держит собственный защищённый контур",
  },
  floor550: { sheltered: false, severity: 1, quietMinMs: 480000, quietMaxMs: 900000, scripted: false },
  floor549: { sheltered: false, severity: 1.05, quietMinMs: 450000, quietMaxMs: 870000, scripted: false },
  floor548: { sheltered: false, severity: 1.1, quietMinMs: 450000, quietMaxMs: 840000, scripted: false },
  floor547: { sheltered: false, severity: 1.2, quietMinMs: 420000, quietMaxMs: 810000, scripted: false },
  floor546: { sheltered: false, severity: 1.15, quietMinMs: 420000, quietMaxMs: 810000, scripted: false },
  floor545: {
    sheltered: true,
    severity: 0,
    quietMinMs: 0,
    quietMaxMs: 0,
    scripted: false,
    shelterReason: "Сухой док удерживает герметичный контур посёлка",
  },
  voidLab: {
    sheltered: true,
    severity: 0,
    quietMinMs: 0,
    quietMaxMs: 0,
    scripted: false,
    shelterReason: "войд-зона живёт по собственным правилам риска",
  },
};

/** Окно, за которое герой обязан добежать до гермодвери после начала активной фазы. */
export const SAMOSBOR_GRACE_MS = 6000;
export const SAMOSBOR_DAMAGE_INTERVAL_MS = 1400;
export const SAMOSBOR_CONTAMINATION_PER_MS = 0.006;
export const SAMOSBOR_STRESS_PER_MS = 0.012;
/** Тревога популяций после пережитого события. */
export const SAMOSBOR_AGITATION_GAIN = 12;

export function samosborProfileFor(zone: string): SamosborZoneProfile {
  return SAMOSBOR_ZONE_PROFILES[zone] ?? DEFAULT_ZONE_PROFILE;
}

export function nextSamosborPhase(phase: SamosborPhase): SamosborPhase {
  return PHASE_SEQUENCE[phase];
}

export function samosborPhaseLabel(phase: SamosborPhase): string {
  return SAMOSBOR_PHASE_PROFILES[phase].label;
}

export function samosborPhaseHint(phase: SamosborPhase): string {
  return SAMOSBOR_PHASE_PROFILES[phase].hint;
}

/** Фаза, в которой игроку уже пора искать гермодверь. */
export function isSamosborWarningPhase(phase: SamosborPhase): boolean {
  return phase === "omen" || phase === "siren";
}

/** Фаза, в которой открытое пространство наносит урон. */
export function isSamosborLethalPhase(phase: SamosborPhase): boolean {
  return phase === "active";
}

function normalizeRoll(roll: number): number {
  return Math.min(99, Math.max(0, Math.floor(roll))) / 99;
}

export function samosborPhaseDurationMs(
  phase: SamosborPhase,
  profile: SamosborZoneProfile,
  roll: number,
): number {
  const { minMs, maxMs } = SAMOSBOR_PHASE_PROFILES[phase];
  if (maxMs <= minMs) return minMs;
  const normalized = normalizeRoll(roll);
  // Тяжёлые этажи держат активную фазу дольше, лёгкие отпускают раньше.
  const shaped = phase === "active"
    ? Math.min(1, normalized * (0.5 + profile.severity / 2))
    : normalized;
  return Math.round(minMs + (maxMs - minMs) * shaped);
}

export function samosborQuietDurationMs(profile: SamosborZoneProfile, roll: number): number {
  if (profile.sheltered) return 0;
  return Math.round(
    profile.quietMinMs + (profile.quietMaxMs - profile.quietMinMs) * normalizeRoll(roll),
  );
}

/** Сколько единиц здоровья уже снял Самосбор за накопленную экспозицию. */
export function samosborExposureHits(exposureMs: number, severity: number): number {
  const exposed = exposureMs - SAMOSBOR_GRACE_MS;
  if (exposed <= 0) return 0;
  return Math.floor(exposed / (SAMOSBOR_DAMAGE_INTERVAL_MS / Math.max(0.4, severity)));
}

export function samosborPhaseMessage(phase: SamosborPhase, zoneName: string): string {
  if (phase === "omen") {
    return `Датчики среды: ${zoneName} гудит на низкой ноте. Конструкции дрожат, свет сбивается — предвестники Самосбора.`;
  }
  if (phase === "siren") {
    return "Аварийная сирена. На схеме подсвечены известные гермоукрытия: до активной фазы остаются десятки секунд.";
  }
  if (phase === "active") {
    return "Самосбор вошёл в активную фазу. Открытое пространство смертельно: спасает только герметичный контур.";
  }
  if (phase === "fade") {
    return "Сирена смолкла. Самосбор затухает, но воздух остаётся мутным, а часть маршрутов изменилась.";
  }
  return `${zoneName} пережил Самосбор. Датчики среды вернулись к фоновым значениям.`;
}

export const SAMOSBOR_SHELTER_MESSAGE =
  "Гермоконтур держит активную фазу. Самосбор проходит снаружи и внутрь не проникает.";

export const SAMOSBOR_EXPOSURE_MESSAGE =
  "Герой остался в открытом пространстве. Заражение, стресс и повреждения растут каждую секунду.";

export const SAMOSBOR_CATCH_MESSAGE =
  "Прямой контакт с Самосбором. Смена прервана: аварийная группа вытащила то, что осталось, в защищённый контур.";
