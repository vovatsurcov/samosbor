#!/usr/bin/env bash
# Создаёт каталог одного визуального ассета по его Asset ID.
#
#   art/_scripts/new-asset.sh WPN-ENG-01
#   art/_scripts/new-asset.sh CLO-TORSO-02 "Телогрейка"
#
# Категория определяется по префиксу идентификатора. Правила именования —
# в art/_docs/ASSET_NAMING.md, стадии производства — в ASSET_PIPELINE.md.
set -euo pipefail

art_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Использование: new-asset.sh <ASSET-ID> [название по-русски]" >&2
  exit 64
}

[[ $# -ge 1 ]] || usage
asset_id="$1"
name_ru="${2:-}"

[[ "${asset_id}" =~ ^[A-Z]+(-[A-Z]+)?-[0-9]{2,3}$ ]] || {
  echo "Некорректный Asset ID: ${asset_id}" >&2
  echo "Ожидается формат СЕМЕЙСТВО-ПОДТИП-НОМЕР, например WPN-ENG-01." >&2
  exit 64
}

case "${asset_id}" in
  CHAR-BASE-*)   dir="characters/base" ;;
  CHAR-PLAYER-*) dir="characters/player" ;;
  CHAR-NPC-*)    dir="characters/npc" ;;
  MOB-HUM-*)     dir="characters/enemies/human" ;;
  MOB-ALT-*)     dir="characters/enemies/altered" ;;
  MOB-IND-*)     dir="characters/enemies/industrial" ;;
  MOB-VOID-*)    dir="characters/enemies/void" ;;
  CLO-HEAD-*)    dir="equipment/head" ;;
  CLO-FACE-*)    dir="equipment/face" ;;
  CLO-TORSO-*)   dir="equipment/torso" ;;
  ARM-CHEST-*)   dir="equipment/armor" ;;
  CLO-HANDS-*)   dir="equipment/hands" ;;
  CLO-LEGS-*)    dir="equipment/legs" ;;
  CLO-FEET-*)    dir="equipment/feet" ;;
  EQ-BACK-*)     dir="equipment/back" ;;
  EQ-ACC-*)      dir="equipment/accessories" ;;
  WPN-MELEE-*)   dir="weapons/melee" ;;
  WPN-RANGED-*)  dir="weapons/ranged" ;;
  WPN-ENG-*)     dir="weapons/engineering" ;;
  OFF-*)         dir="weapons/offhand" ;;
  ITEM-RES-*)    dir="items/resources" ;;
  ITEM-CONS-*)   dir="items/consumables" ;;
  ITEM-QUEST-*)  dir="items/quest" ;;
  ENV-ARCH-*)    dir="environment/architecture" ;;
  ENV-PROP-*)    dir="environment/props" ;;
  ENV-IND-*)     dir="environment/industrial" ;;
  ENV-DEBRIS-*)  dir="environment/debris" ;;
  ENV-ANOM-*)    dir="environment/anomalies" ;;
  VFX-ATK-*)     dir="vfx/attacks" ;;
  VFX-SPELL-*)   dir="vfx/spells" ;;
  VFX-ENV-*)     dir="vfx/environment" ;;
  VFX-ANOM-*)    dir="vfx/anomalies" ;;
  *)
    echo "Неизвестное семейство: ${asset_id}" >&2
    echo "Добавьте его в art/_docs/ASSET_NAMING.md и в этот скрипт." >&2
    exit 64
    ;;
esac

target="${art_root}/${dir}/${asset_id}"
[[ ! -d "${target}" ]] || {
  echo "Каталог уже существует: ${target#"${art_root}/"}" >&2
  exit 65
}

mkdir -p "${target}"/{references,concept,source,textures,materials,rig,animations,export,meta}
for sub in references concept source textures materials rig animations export; do
  touch "${target}/${sub}/.gitkeep"
done

category="${asset_id%%-*}"
subcategory="$(basename "${dir}")"
cat > "${target}/meta/asset.meta.json" <<JSON
{
  "id": "${asset_id}",
  "name": "",
  "nameRu": "${name_ru}",
  "category": "${category}",
  "subcategory": "${subcategory}",
  "status": "concept",

  "description": "",

  "gameItemId": null,
  "rarity": null,

  "equipSlot": null,
  "attachmentPoint": null,
  "hidesBodyRegions": [],

  "compatibleBodies": [],
  "compatibleSkeleton": null,

  "dimensions": { "unit": "m", "length": null, "width": null, "height": null },
  "scale": 1.0,

  "conceptReferences": [],
  "conceptFiles": [],
  "sourceFiles": [],
  "textureFiles": [],
  "materialFiles": [],
  "rigFiles": [],
  "animationFiles": [],
  "exportFiles": [],
  "thumbnailPath": null,

  "createdBy": "",
  "approvedBy": null,
  "approvedAt": null,

  "tags": [],
  "notes": ""
}
JSON

echo "Создан каталог ассета: ${dir}/${asset_id}"
echo "Не забудьте перевести статус в art/asset-manifest.json на \"concept\"."
