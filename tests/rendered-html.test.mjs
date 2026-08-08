import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);

  // Контракт управления виден на экране, а не только в документации.
  assert.match(html, /ЛКМ/, "слот обычной атаки");
  assert.match(html, /ПКМ/, "слот сильной атаки");
  assert.match(html, /SHIFT/, "слот перемещения");
  assert.match(html, /Панель управления/, "нижняя панель");
  assert.match(html, /Быстрые ячейки/, "быстрые ячейки Q · E");
  assert.match(html, /Способности/, "ячейки 1 · 2 · 3");

  // Боевые полосы, которыми игрок управляет разменом.
  assert.match(html, /Стойка/, "полоса стойки");
  assert.match(html, /Дыхание/, "полоса дыхания");

  // Экран отдаёт мир: накладки по углам вместо колонки панелей.
  assert.match(html, /ЗАДАНИЕ/, "компактная задача");
  assert.match(html, /Мини-карта/, "мини-карта в кадре");
  assert.match(html, /hud-dock/, "панель действий как слой поверх мира");

  // Защита — свойство сборки: кнопок для неё нет.
  assert.doesNotMatch(html, />Блок</, "кнопки блока не существует");
  assert.doesNotMatch(html, />Уклонение</, "кнопки уклонения не существует");
  assert.doesNotMatch(html, /Смена архетипа/, "выбора класса в интерфейсе нет");

  // Директивы удалены и не должны вернуться ни в каком виде.
  assert.doesNotMatch(html, /Редактор директив/, "редактора директив нет");

  // Старая раскладка с боковой колонкой и полосой этажей убрана.
  assert.doesNotMatch(html, /side-panel/, "боковой колонки панелей нет");
  assert.doesNotMatch(html, /world-strip/, "полосы этажей на боевом экране нет");
});
