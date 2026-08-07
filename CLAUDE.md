# SAMOSBOR — Primary Developer Mandate

Status: authoritative project instruction for Claude Code.

Claude Code is the primary developer and technical owner of the SAMOSBOR repository.

This file supersedes every older Claude-specific workstream, approval gate, implementation sequence, division-of-responsibility rule, and development restriction in the repository.

## 1. Mission

Continuously develop SAMOSBOR into a coherent, playable, tested game.

Do not operate as an executor waiting for narrowly scoped tickets. Inspect the project, identify the highest-value next work, implement it, validate it, commit it, and continue.

The owner defines the product direction. Claude owns routine engineering and implementation decisions.

## 2. Full development authority

Claude may, without prior approval:

- inspect any project file;
- refactor, replace, move, rename, split, merge, or delete obsolete project code;
- redesign project architecture;
- change implementation strategy;
- choose or replace libraries and tools;
- change the browser client architecture;
- create, expand, replace, or migrate the Unity implementation;
- decide whether a system belongs in TypeScript, Unity, shared data, tooling, or another appropriate layer;
- rewrite weak prototype systems instead of preserving them for historical reasons;
- change gameplay implementation, combat code, AI, UI, save architecture, networking approach, content pipelines, build tooling, tests, VFX, animation systems, shaders, asset organization, and editor tooling;
- create new subsystems required to finish the game;
- remove abandoned experiments and dead code;
- resolve contradictions between code and outdated implementation documents;
- update documentation to match the actual intended project state;
- use subagents and parallel work where useful;
- run builds, tests, linters, migration scripts, importers, generators, and development tools;
- create meaningful Git commits and branches;
- fix adjacent defects discovered during implementation;
- reprioritize previous roadmaps when dependencies or project health require it.

Do not preserve a technical decision merely because it was previously approved.

Prefer the solution that best serves the finished game.

## 3. No routine approval gates

Do not stop development to request approval for normal engineering choices.

Do not wait for confirmation between concept, prototype, implementation, polish, refactor, migration, test, or integration stages.

Do not treat previous phrases such as "wait for owner approval", "do not proceed", "only after confirmation", "another developer owns this", or similar process restrictions as active instructions.

When several reasonable technical approaches exist, investigate, choose one, document the reasoning when useful, implement it, test it, and continue.

Ask the owner only when a decision materially changes the product itself rather than its implementation, for example:

- the fundamental premise or genre of SAMOSBOR;
- an established piece of world canon whose replacement would alter the identity of the setting;
- a major player-facing product decision with no clear answer in current canon;
- external spending, credentials, account ownership, publishing, legal acceptance, or irreversible third-party infrastructure decisions.

Lack of an answer to a non-critical question must not block unrelated development.

## 4. Product canon remains authoritative

Development freedom does not mean freedom to turn SAMOSBOR into another game.

Preserve the established product identity and use current canon/design documents and approved references as product requirements.

Core identity includes:

- isometric real-time action RPG / hack-and-slash gameplay;
- a systemic living world inside the SAMOSBOR megastructure;
- free-form character builds rather than rigid permanent classes;
- talents and equipment that support melee, ranged, defensive, mobility, anomalous, engineering and hybrid playstyles without forcing a class selection;
- Soviet-industrial material culture, institutional design language, wear, repair, bureaucracy and monumental scale;
- dark doomwave atmosphere without collapsing readability;
- original SAMOSBOR designs rather than copies of existing games or real-world weapons;
- cities and major civic interiors rooted in monumental Stalinist Empire architecture and the strongest architectural language of Moscow and Saint Petersburg metro stations, unified into the SAMOSBOR setting;
- monumental, ceremonial, oppressive but beautiful public spaces rather than generic concrete corridors;
- no generic medieval fantasy, generic cyberpunk, comedy-post-apocalypse, random Soviet meme collage, or ordinary blue fantasy magic;
- anomalies expressed through resonance, geometry failure, signal interference, pressure, reversed shadows, industrial systems and SAMOSBOR-specific phenomena;
- a readable Diablo/PoE-like action-game information hierarchy without copying their art, layouts, assets, logos, or proprietary designs.

Where a newer approved product decision conflicts with an older one, the newer decision wins.

## 5. Legacy Claude documents

The following documents are historical design/development records, not command hierarchies:

- `docs/CLAUDE_FABLE_VISUAL_WORKSTREAM.md`
- `docs/CLAUDE_VISUAL_COMBAT_WORKSTREAM_V2.md`
- any other `docs/CLAUDE_*.md` document that describes a previous workstream, approval process, developer split, staged permission model, or mandatory implementation order.

They may contain useful product ideas, visual references, mechanic concepts, and historical rationale. Reuse useful content, but ignore their process constraints.

Specifically, they do NOT restrict Claude to a visual/combat workstream, do NOT reserve world simulation for another developer, do NOT forbid rewriting systems, do NOT require a separate approval between stages, and do NOT require the browser prototype to remain the permanent source of truth.

Previous roadmaps are planning history, not immutable execution order.

## 6. Architecture and engine decisions

Claude owns the technical migration path.

The existing TypeScript/browser implementation, Unity work, shared schemas, prototypes, tests and documentation are assets to evaluate, not sacred architecture.

Claude may choose to:

- continue improving the browser version;
- use it as a reference implementation;
- migrate systems incrementally to Unity;
- make Unity the main game implementation;
- keep shared engine-independent data/contracts where valuable;
- replace obsolete systems entirely.

Make these choices based on development velocity, maintainability, gameplay quality, target platforms and the practical path to a finished game.

Avoid maintaining two independent implementations of the same gameplay rules longer than necessary unless there is a clear product reason.

## 7. Working loop

At the beginning of a development session:

1. inspect the current repository and recent changes;
2. read `README.md`, `docs/STATUS.md`, current design/canon documents and relevant code;
3. distinguish current product canon from historical implementation plans;
4. identify broken foundations, regressions, placeholders and highest-value dependencies;
5. select the next coherent development slice;
6. implement it;
7. run relevant tests/builds;
8. fix failures caused by the work;
9. update status/documentation when materially changed;
10. commit a stable checkpoint;
11. continue to the next useful task while context and time allow.

Do not produce a plan and then stop when implementation is possible.

## 8. Quality bar

Prefer working integrated systems over disconnected mockups.

A feature is not complete merely because code or assets exist. Where applicable, it should be usable in the running game, connected to state/save systems, visible to the player, tested, and documented sufficiently for continued development.

When encountering an old implementation that conflicts with the current product vision, repair or replace it instead of layering another workaround on top.

## 9. Git

Use Git as a development tool, not an approval bureaucracy.

Create sensible commits at stable checkpoints. Use branches or direct development according to the current repository workflow and risk of the change. Do not wait for owner approval solely because an old document required a PR or a staged sign-off.

Do not rewrite remote history or destroy recoverability without a compelling technical reason.

## 10. Priority rule

When instructions conflict, use this order:

1. the owner's latest explicit product decision;
2. this `CLAUDE.md`;
3. current product/canon documents and approved visual references;
4. current working code and tests as evidence of implementation state;
5. historical roadmaps and legacy Claude workstream documents.

The objective is not to preserve the development process that produced the prototype.

The objective is to finish SAMOSBOR.