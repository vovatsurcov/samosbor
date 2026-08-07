import * as base from "./game-engine-base.ts";
import {
  bossPhaseFor,
  REGION_BOSS_GOALS,
  REGION_SETTLEMENT_CONVERSATIONS,
} from "./game-region-content-544.ts";
import {
  advanceRegionalPath,
  distance,
  findRegionalPath,
  FLOOR_544,
  FLOOR_545,
} from "./game-region-map-544.ts";
import {
  REGION_NPC_IDS,
  updateRegionalQuestStage,
  withRegionalLog,
} from "./game-region-state-544.ts";

export function moveRegionalNpcs(state: any, deltaMs: number): any {
  if (![FLOOR_544, FLOOR_545].includes(state.zone)) return state;
  const now = state.worldTimeMs;
  const npcs = state.npcs.map((npc: base.Npc, index: number) => {
    if (!REGION_NPC_IDS.has(npc.id)) return npc;
    let current = {
      ...npc,
      speech: npc.speechUntilMs > now ? npc.speech : null,
      thinkCooldownMs: Math.max(0, npc.thinkCooldownMs - deltaMs),
    };
    if (current.zone !== state.zone) return current;
    const route = current.route.length ? current.route : [current.home];
    let target = route[current.routeIndex % route.length] ?? current.home;
    if (distance(current.position, target) < 0.3) {
      current = {
        ...current,
        routeIndex: (current.routeIndex + 1) % route.length,
        path: [],
      };
      target = route[current.routeIndex % route.length] ?? current.home;
    }
    if (!current.path.length && current.thinkCooldownMs <= 0) {
      const path = findRegionalPath(String(current.zone), current.position, target);
      current = {
        ...current,
        path: path?.slice(1) ?? [],
        thinkCooldownMs: 600 + (index * 83) % 500,
      };
    }
    if (current.path.length) {
      const motion = advanceRegionalPath(
        current.position,
        current.path,
        current.speed * deltaMs / 1000,
      );
      current = { ...current, position: motion.position, path: motion.path };
    }
    return current;
  });

  let next = {
    ...state,
    npcs,
    npcConversationCooldownMs: Math.max(0, state.npcConversationCooldownMs - deltaMs),
  };
  if (next.npcConversationCooldownMs > 0) return next;
  const local = npcs.filter(
    (npc: base.Npc) => npc.zone === state.zone && REGION_NPC_IDS.has(npc.id),
  );
  let pair: [base.Npc, base.Npc] | null = null;
  let best = Infinity;
  for (let left = 0; left < local.length; left += 1) {
    for (let right = left + 1; right < local.length; right += 1) {
      const currentDistance = distance(local[left].position, local[right].position);
      if (currentDistance < best && currentDistance <= 5) {
        best = currentDistance;
        pair = [local[left], local[right]];
      }
    }
  }
  if (!pair) return { ...next, npcConversationCooldownMs: 2500 };
  const cycle = Math.floor(now / 9000);
  const lines = REGION_SETTLEMENT_CONVERSATIONS[cycle % REGION_SETTLEMENT_CONVERSATIONS.length];
  next = {
    ...next,
    npcConversationCooldownMs: 7200 + cycle % 4 * 800,
    npcs: next.npcs.map((npc: base.Npc) =>
      npc.id === pair?.[0].id
        ? { ...npc, speech: lines[0], speechUntilMs: now + 4200 }
        : npc.id === pair?.[1].id
          ? { ...npc, speech: lines[1], speechUntilMs: now + 4600 }
          : npc,
    ),
  };
  return withRegionalLog(
    next,
    `${pair[0].name}: «${lines[0]}» ${pair[1].name}: «${lines[1]}»`,
  );
}

export function tickRegionalBoss(state: any): any {
  const boss = state.enemies.find((enemy: base.Enemy) => enemy.id === "546-overseer");
  if (!boss) return state;
  const phase = bossPhaseFor(boss.hp, boss.maxHp);
  let next = state;
  if (phase !== state.regionProgress.bossPhase) {
    const previousPhase = state.regionProgress.bossPhase;
    next = {
      ...next,
      regionProgress: updateRegionalQuestStage({
        ...next.regionProgress,
        bossPhase: phase,
        bossDefeated: phase === 4 || next.regionProgress.bossDefeated,
      }),
      enemies: next.enemies.map((enemy: base.Enemy) => {
        if (enemy.id !== boss.id || enemy.hp <= 0) return enemy;
        return {
          ...enemy,
          speed: enemy.speed + (previousPhase < 2 && phase >= 2 ? 0.2 : 0),
          damage: enemy.damage + (previousPhase < 2 && phase >= 2 ? 1 : 0),
          armor: enemy.armor + (previousPhase < 3 && phase >= 3 ? 1 : 0),
          attackCooldownBaseMs:
            previousPhase < 3 && phase >= 3
              ? Math.max(650, enemy.attackCooldownBaseMs - 260)
              : enemy.attackCooldownBaseMs,
          mode: "hunting" as const,
          thinkCooldownMs: 0,
        };
      }),
    };
    if (phase === 2) {
      next = withRegionalLog(
        next,
        "Смотритель ГУ-46 включил грузовые приводы: скорость и урон выросли.",
      );
    }
    if (phase === 3) {
      next = withRegionalLog(
        next,
        "Смотритель ГУ-46 сорвал ограничители: бронеконтур закрыт, цикл атак ускорен.",
      );
    }
    if (phase === 4 && !state.regionProgress.bossDefeated) {
      next = {
        ...next,
        regionProgress: updateRegionalQuestStage({
          ...next.regionProgress,
          bossPhase: 4,
          bossDefeated: true,
          settlementDefense: Math.min(12, next.regionProgress.settlementDefense + 2),
        }),
      };
      next = withRegionalLog(
        next,
        "Смотритель ГУ-46 отключён. Путь к Сухому доку стабилизирован.",
      );
    }
  }

  if (
    boss.hp > 0 &&
    next.worldTimeMs - next.regionProgress.bossGoalChangedAtMs >= 12000
  ) {
    const bossGoalIndex =
      (next.regionProgress.bossGoalIndex + 1) % REGION_BOSS_GOALS.length;
    const settlementDefense = next.regionProgress.servicesRestored
      ? next.regionProgress.settlementDefense
      : Math.max(1, next.regionProgress.settlementDefense - 1);
    next = {
      ...next,
      regionProgress: {
        ...next.regionProgress,
        bossGoalIndex,
        bossGoalChangedAtMs: next.worldTimeMs,
        settlementDefense,
      },
    };
    next = withRegionalLog(
      next,
      `Смотритель ГУ-46 меняет задачу: ${REGION_BOSS_GOALS[bossGoalIndex]}. Защита Сухого дока: ${settlementDefense}/12.`,
    );
  }
  return next;
}

export function tickLowerDock(state: any, rawDeltaMs: number): any {
  const deltaMs = Math.max(0, Math.min(100, rawDeltaMs));
  const previousTime = state.worldTimeMs;
  let next = {
    ...state,
    worldTimeMs: state.worldTimeMs + deltaMs,
    hero: {
      ...state.hero,
      attackCooldownMs: Math.max(0, state.hero.attackCooldownMs - deltaMs),
      repathCooldownMs: Math.max(0, state.hero.repathCooldownMs - deltaMs),
      artifactCooldownMs: Math.max(0, state.hero.artifactCooldownMs - deltaMs),
      activeSkillCooldowns: Object.fromEntries(
        Object.entries(state.hero.activeSkillCooldowns).map(([id, value]) => [
          id,
          Math.max(0, Number(value) - deltaMs),
        ]),
      ),
    },
  };
  if (next.hero.path.length) {
    const motion = advanceRegionalPath(
      next.hero.positions[FLOOR_544],
      next.hero.path,
      Math.max(1, base.heroMoveSpeed(next)) * deltaMs / 1000,
    );
    next = {
      ...next,
      hero: {
        ...next.hero,
        positions: { ...next.hero.positions, [FLOOR_544]: motion.position },
        path: motion.path,
        destination: motion.path.length ? next.hero.destination : null,
      },
    };
  }
  if (Math.floor(previousTime / 3000) !== Math.floor(next.worldTimeMs / 3000)) {
    next = {
      ...next,
      hero: {
        ...next.hero,
        hp: Math.min(base.maxHeroHp(next), next.hero.hp + 1),
      },
    };
  }
  next = moveRegionalNpcs(next, deltaMs);
  return tickRegionalBoss(next);
}
