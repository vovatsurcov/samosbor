# CHAR-BASE-01 — Production Spec v0.1

Status: APPROVED FOR PRODUCTION
Role: base player humanoid
Skeleton target: `SKEL-HUMANOID-01`

## Visual identity

Male player base, approximately 25–35. Functional average build, realistic proportions, medium/long slightly unkempt dark hair, restrained facial hair, calm exhausted confidence rather than aggression.

The approved production sheet defines:
- front;
- back;
- left/right;
- 3/4 front/back;
- isometric game view;
- material references;
- modular clothing breakdown;
- equipment/attachment guide.

## Modular breakdown

Required separable slots:
- BASE BODY;
- HEAD / HAIR;
- FACE;
- TORSO;
- UNDERSHIRT;
- LEGS;
- HANDS;
- FEET;
- BELT;
- SHOULDER STRAP / HARNESS;
- BACK;
- MAIN HAND;
- OFF HAND.

Clothing and equipment must not be permanently baked into a class-specific body.

## Materials

Primary material families:
- worn canvas / cotton;
- painted woven patches;
- aged leather straps;
- old painted steel fasteners;
- leather/fabric gloves;
- scuffed/dry boot leather;
- heavy canvas bag fabric.

## Attachment points

Minimum:
`HEAD`, `FACE`, `CHEST`, `BACK`, `BACKPACK`, `BELT_L`, `BELT_R`, `L_HAND`, `R_HAND`, `WEAPON_L`, `WEAPON_R`, `SHOULDER_L`, `SHOULDER_R`.

Project-wide standard also supports forearm/thigh/shin/feet/back-weapon anchors.

## Animation families

### Locomotion
- IDLE
- WALK
- RUN
- DODGE

### Interaction
- PICKUP
- INTERACT

### Combat families
- MELEE_LIGHT
- MELEE_HEAVY
- RANGED
- PSI_LIGHT
- PSI_HEAVY
- SHIELD_BLOCK
- SHIELD_BASH

Combat implementation should use families rather than a bespoke Animator per item.

## Talent interaction

- Charged attack remains an active hold/release mechanic.
- Hold-block behavior is unlocked/modulated by passive defensive/tank-oriented talents.
- Parry is unlocked/modulated by passive agile-melee talents.
- Do not introduce hard classes such as Tank/Rogue. Builds emerge from talent choices.

## Unity constraints

- Humanoid rig where practical;
- isometric silhouette is more important than microdetail;
- wearable meshes must tolerate animation and equipment switching;
- separate source and runtime assets;
- no permanent baked weapons in the player mesh;
- animation-compatible hand placement and sockets required.

## Production status

Concept/model sheet: approved.
Next required art: clean animation pack + NPC production sheets.
