"use client";

import { useEffect, useMemo, useState } from "react";
import {
  commandFastTravel,
  communicationProgress,
  createInitialState,
  donateLiftResources,
  globalMapSnapshot,
  localMapSnapshot,
  migrateGameState,
  type RepairMaterialId,
  type TravelNodeId,
} from "./game-engine";

const SAVE_KEY = "samosbor-shift-556-stage-5-progression";

const MATERIAL_LABELS: Record<RepairMaterialId, string> = {
  coilPart: "Катушки",
  repairKit: "Ремкомплекты",
  batteryPack: "Аккумуляторы",
  filterCartridge: "Фильтры",
};

function loadState(): any {
  if (typeof window === "undefined") return createInitialState();
  try {
    const saved = window.localStorage.getItem(SAVE_KEY);
    return saved ? migrateGameState(JSON.parse(saved)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function mapCellColor(cell: ReturnType<typeof localMapSnapshot>["cells"][number]): string {
  if (!cell.known) return "#080a09";
  if (cell.hero) return "#f1d66d";
  if (cell.enemy) return "#d8645a";
  if (cell.npc) return "#75b7a5";
  if (cell.loot) return "#c7a75d";
  if (cell.tile === "#") return cell.visible ? "#565c54" : "#30352f";
  if (["L", "U", "D", "T", "A", "P"].includes(cell.tile)) return "#78968e";
  if (cell.tile === "g" || cell.tile === "H") return "#477764";
  return cell.visible ? "#777d70" : "#444940";
}

function statusLabel(status: string | null): string {
  if (status === "online") return "связь работает";
  if (status === "unstable") return "связь нестабильна";
  if (status === "offline") return "связь отключена";
  return "без лифтовой станции";
}

function defenseLabel(status: string | null): string | null {
  if (!status || status === "idle") return null;
  if (status === "warning") return "подготовка к обороне";
  if (status === "active") return "город атакован";
  if (status === "victory") return "оборона завершена";
  return "оборона прорвана";
}

export default function WorldNavigationOverlay() {
  const [snapshot, setSnapshot] = useState<any>(() => createInitialState());
  const [globalOpen, setGlobalOpen] = useState(false);

  useEffect(() => {
    const update = () => setSnapshot(loadState());
    update();
    const timer = window.setInterval(update, 600);
    const onStorage = () => update();
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        setGlobalOpen((open) => !open);
      } else if (event.key === "Escape") {
        setGlobalOpen(false);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const local = useMemo(() => localMapSnapshot(snapshot), [snapshot]);
  const global = useMemo(() => globalMapSnapshot(snapshot), [snapshot]);
  const columns = local.maxX - local.minX + 1;
  const inCity = ["floor544", "floor545", "floor554"].includes(snapshot.zone);

  const applyStateChange = (change: (state: any) => any) => {
    const current = loadState();
    const next = change(current);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSnapshot(next);
    window.setTimeout(() => window.location.reload(), 80);
  };

  const travel = (nodeId: TravelNodeId) => {
    applyStateChange((state) => commandFastTravel(state, nodeId));
  };

  const donate = (nodeId: TravelNodeId) => {
    applyStateChange((state) => donateLiftResources(state, nodeId));
  };

  return (
    <>
      <aside
        aria-label="Мини-карта локации"
        style={{
          position: "fixed",
          right: 18,
          top: 132,
          zIndex: 30,
          width: 188,
          padding: 10,
          border: "1px solid rgba(173,188,170,.35)",
          background: "rgba(14,17,15,.9)",
          boxShadow: "0 12px 32px rgba(0,0,0,.45)",
          color: "#d7ddd3",
          fontFamily: "inherit",
        }}
      >
        <button
          type="button"
          onClick={() => setGlobalOpen(true)}
          style={{
            width: "100%",
            border: 0,
            background: "transparent",
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <strong style={{ display: "block", fontSize: 12 }}>МИНИ-КАРТА · M</strong>
          <span style={{ display: "block", marginTop: 3, fontSize: 10, opacity: 0.7 }}>{local.title}</span>
        </button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 1,
            marginTop: 8,
            aspectRatio: "1 / 1",
            background: "#050605",
            padding: 3,
          }}
        >
          {local.cells.map((cell) => (
            <i
              key={`${cell.x}:${cell.y}`}
              title={`${cell.x}:${cell.y} · ${cell.tile}`}
              style={{
                display: "block",
                minWidth: 0,
                background: mapCellColor(cell),
                opacity: cell.visible || cell.hero ? 1 : 0.72,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 7, fontSize: 9, opacity: 0.8 }}>
          <span>● герой</span><span>■ враг</span><span>■ NPC</span>
        </div>
      </aside>

      {globalOpen ? (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Глобальная карта разведанных территорий"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "grid",
            placeItems: "center",
            padding: 24,
            background: "rgba(4,6,5,.88)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setGlobalOpen(false);
          }}
        >
          <div
            style={{
              width: "min(980px, 96vw)",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid rgba(186,199,178,.38)",
              background: "#151915",
              color: "#e0e5dd",
              boxShadow: "0 24px 80px rgba(0,0,0,.65)",
              padding: 20,
            }}
          >
            <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: ".14em", opacity: 0.62 }}>РАЗВЕДАННЫЕ ТЕРРИТОРИИ</p>
                <h2 style={{ margin: "5px 0 0", fontSize: 24 }}>Глобальная карта и межэтажная связь</h2>
                <p style={{ margin: "7px 0 0", maxWidth: 700, fontSize: 13, opacity: 0.75 }}>
                  Быстрое перемещение работает только между разведанными узлами с исправной связью. Материалы принимает Управление межэтажных сообщений в городах.
                </p>
              </div>
              <button type="button" onClick={() => setGlobalOpen(false)} style={{ padding: "8px 12px" }}>Закрыть</button>
            </header>

            <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
              {global.nodes.map((node, index) => {
                const defense = defenseLabel(node.defenseStatus);
                const progress = node.travelNodeId ? communicationProgress(snapshot, node.travelNodeId) : null;
                const missing = progress
                  ? (Object.keys(progress.remaining) as RepairMaterialId[])
                      .filter((itemId) => progress.remaining[itemId] > 0)
                      .map((itemId) => `${MATERIAL_LABELS[itemId]} ${progress.remaining[itemId]}`)
                      .join(" · ")
                  : "";
                return (
                  <article
                    key={node.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(220px, 1fr) minmax(180px, auto)",
                      gap: 12,
                      alignItems: "center",
                      padding: 12,
                      border: node.current ? "1px solid #b7a85f" : "1px solid rgba(180,194,178,.18)",
                      background: node.discovered ? "rgba(61,70,61,.34)" : "rgba(18,20,18,.5)",
                      opacity: node.discovered ? 1 : 0.48,
                    }}
                  >
                    <strong style={{ fontSize: 13, opacity: 0.7 }}>{String(index + 1).padStart(2, "0")}</strong>
                    <div>
                      <strong>{node.discovered ? node.label : "Неразведанная территория"}</strong>
                      <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
                        {node.current ? "Текущее положение · " : ""}{statusLabel(node.communication)}
                        {defense ? ` · ${defense}` : ""}
                      </div>
                      {node.discovered && missing ? <div style={{ marginTop: 4, fontSize: 10, color: "#c9b878" }}>Требуется: {missing}</div> : null}
                    </div>
                    <div style={{ display: "flex", justifyContent: "end", gap: 7, flexWrap: "wrap" }}>
                      {node.travelNodeId && node.discovered && node.communication !== "online" && inCity ? (
                        <button type="button" onClick={() => donate(node.travelNodeId as TravelNodeId)}>
                          Сдать материалы УМС
                        </button>
                      ) : null}
                      {node.travelNodeId && node.discovered ? (
                        <button
                          type="button"
                          disabled={!node.travelAvailable}
                          title={node.travelReason}
                          onClick={() => travel(node.travelNodeId as TravelNodeId)}
                        >
                          {node.current ? "Текущий узел" : "Вызвать лифт"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 16, fontSize: 11, opacity: 0.7 }}>
              <span>Связи на схеме: {global.connections.length}</span>
              <span>Награда за оборону: высокий опыт и предмет отличного качества из пула Claude</span>
            </footer>
          </div>
        </section>
      ) : null}
    </>
  );
}
