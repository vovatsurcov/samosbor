# Художественные исходники «Самосбора»

Версия: 1.0  
Статус: обязательные правила хранения визуальных ассетов

## Что здесь лежит

`art/` — каталог **исходников**: референсы, утверждённые концепты, файлы Blender, текстуры, материалы, риги, анимации и готовые к игре экспорты.

`art/` **не является** каталогом ресурсов, которые грузит игра. Ни один файл отсюда не попадает в веб-сборку автоматически: браузерная сборка собирает только `app/`, а статикой раздаётся исключительно `public/`. Перенос в рантайм — всегда осознанный шаг, описанный в `ASSET_PIPELINE.md`.

Каталог согласован с уже утверждённым визуальным планом: `docs/CLAUDE_FABLE_VISUAL_WORKSTREAM.md` §17.2 закрепляет `art/**` как рабочий путь художественной части, а `unity-client/**` — как будущий визуальный клиент на Unity 6.3 LTS + URP.

## Структура

```text
art/
├── _docs/          правила: эта папка
├── _scripts/       вспомогательные скрипты пайплайна
├── _templates/     шаблон каталога ассета и шаблон метаданных
├── asset-manifest.json   машинно-читаемый реестр всех ассетов
│
├── characters/     base, player, npc, enemies/{human,altered,industrial,void}
├── equipment/      head, face, torso, armor, hands, legs, feet, back, accessories
├── weapons/        melee, ranged, engineering, offhand
├── items/          resources, consumables, quest, misc
├── environment/    architecture, props, furniture, industrial, debris, vegetation, anomalies
├── creatures/      нечеловеческие существа вне классификации врагов
├── vfx/            attacks, spells, environment, anomalies
├── animations/     humanoid/{locomotion,combat,interaction,reactions}, creatures, machines
└── shared/         materials, textures, decals, shaders
```

## Одна директория — один ассет

Внутри категории модели не сваливаются в кучу. Каждый ассет получает собственный каталог, названный своим Asset ID:

```text
art/weapons/engineering/WPN-ENG-01/
├── references/   исходные референсы, фотографии, mood references
├── concept/      утверждённые изображения GPT Image, model sheets, turnaround
├── source/       .blend и другие исходники
├── textures/     карты текстур
├── materials/    материалы
├── rig/          риг и скелетные исходники
├── animations/   анимации, специфичные именно для этого объекта
├── export/       готовые игровые файлы (.glb)
└── meta/         asset.meta.json — описание и состояние производства
```

Подкаталоги, бессмысленные для конкретного ассета, можно не создавать до появления данных. Например, у обычного предмета обычно нет `rig/`, а общие humanoid-анимации никогда не копируются в каталог одежды — они лежат в `art/animations/humanoid/`.

Быстрое создание каталога:

```bash
art/_scripts/new-asset.sh WPN-ENG-01
```

## Реестр

`art/asset-manifest.json` — единственный источник правды о том, какие ассеты существуют, в какой они стадии и где лежат. Любой новый ассет сначала появляется в реестре со статусом `planned`, и только потом на диске.

## Остальные документы

- `ASSET_NAMING.md` — Asset ID и правила именования файлов;
- `CHARACTER_MODULARITY.md` — модульный персонаж, слоты и запрет цельных моделей классов;
- `ASSET_PIPELINE.md` — стадии производства и путь из GPT Image в игру;
- `ATTACHMENT_POINTS.md` — скелет `SKEL-HUMANOID-01` и точки крепления;
- `ART_DIRECTION.md` — краткая художественная рамка проекта.

Полный визуальный план и процесс согласования моделей остаются в `docs/CLAUDE_FABLE_VISUAL_WORKSTREAM.md` и `docs/CLAUDE_VISUAL_COMBAT_WORKSTREAM_V2.md`. Эти документы главнее: `art/_docs/` описывает только хранение и производственный учёт.
