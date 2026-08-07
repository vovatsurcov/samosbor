# Claude Code Handoff — Environment 557–545

## Когда использовать

Этот документ применяется **только после завершения текущей браузерной задачи**, regression check и контрольной Git-точки. До этого не переводить проект на новый Unity/environment pipeline.

## Источники истины

Перед началом прочитать:

1. `README.md` — фактический runtime-статус и проектный канон;
2. `docs/art/environment/SAMOSBOR_ENVIRONMENT_BIBLE_v0.2.md`;
3. `docs/level-design/SAMOSBOR_SYSTEMIC_CONSEQUENCES_v0.2.md`;
4. `docs/level-design/SAMOSBOR_LEVEL_DESIGN_557-545_v0.2.md`;
5. `game-data/floors/floor_manifest_557-545.json`.

Не выдавать утверждённый дизайн за уже реализованную механику.

## Первый этап

Сначала ничего массово не переносить.

1. Провести gap analysis текущего проекта.
2. Зафиксировать, какие материалы, карты, NPC, enemies, lighting и VFX уже существуют.
3. Предложить scalable Unity architecture.
4. Реализовать visual vertical slice на **этаже 556**.
5. Только после рабочего 556 переносить pipeline на другие этажи.

## Предпочтительная data architecture

Эквивалент `FloorDefinition`:

- `floorId`;
- `displayName`;
- `biomeId`;
- `role`;
- `baselinePressure`;
- `currentPressure`;
- `state`;
- `lightingProfile`;
- `moduleSet`;
- `enemyPool`;
- `npcProfile`;
- `authoredOverrides`;
- `persistentFlags`.

Эквивалент `BiomeDefinition`:

- materials;
- prop pools;
- lighting presets;
- decal presets;
- room modules;
- corridor modules;
- enemy tables;
- ambient audio.

## Unity-принцип

Не создавать по уникальной технологической системе на каждый этаж.

Использовать:

- modular room/corridor prefabs;
- reusable materials;
- trim sheets;
- biome-specific props;
- authored landmark zones;
- lighting presets;
- `STABLE / DISTORTED / SAMOSBOR` variants;
- persistent state.

## Visual benchmark 556

Минимум:

- CHAR-BASE-01 в рабочей изометрической сцене;
- locomotion/combat animations;
- минимум один NPC;
- минимум два типа врагов;
- бетон, старая краска, кафель, крашеный/ржавый металл, резина, дерево;
- трубы, проводка, электрощит, двери, радиаторы, светильники;
- decals грязи, воды, номеров, объявлений и ремонта;
- normal technical lighting;
- один `DISTORTED` вариант;
- один `SAMOSBOR` вариант;
- изменение `SAMOSBOR_PRESSURE` через инфраструктурное действие.

## Следующие проверки после 556

Проверять pipeline на этажах:

- 557 — жилой;
- 555 — мокрый ремонтно-технический;
- 549 — энергетический;
- 548 — гидротехнический;
- 547 — НИИ/аномальный;
- 546 — логистико-боссовый;
- 545 — безопасный промышленно-караванный город.

Этот набор покрывает почти весь визуальный диапазон текущего региона.

## Запреты

- не создавать десятки полузаконченных систем параллельно;
- не менять канон этажей без явного решения владельца;
- не заменять существующий рабочий runtime до успешного vertical slice;
- не делать runtime procedural topology до готовой системы authored variants;
- не использовать `settings.local.json` как проектную документацию;
- не начинать работу по этому handoff до завершения текущей браузерной задачи.

## Definition of Done

Переход к масштабированию разрешён только когда 556 запускается в Unity, игрок перемещается и сражается, NPC и enemies анимированы, environment читается с изометрической камеры, а `STABLE / DISTORTED / SAMOSBOR` визуально и геймплейно различаются.