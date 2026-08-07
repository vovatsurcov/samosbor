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
  assert.match(html, /Action RPG прототип · этап 4B/);
  assert.match(html, /ПРОТОКОЛ СМЕНЫ · СБ\/556-04/);
  assert.match(html, /Экран \/ пульт/);

  // Боевая модель v2 должна быть видна игроку, а не только движку.
  assert.match(html, /Стойка/, "полоса стойки");
  assert.match(html, /Дыхание/, "полоса дыхания");
  assert.match(html, /Тяжёлый удар/, "кнопка тяжёлого удара");
  assert.match(html, /Уклонение/, "кнопка уклонения");
  assert.match(html, /Добивание/, "кнопка добивания");
  assert.match(html, />Блок</, "кнопка блока");
  for (const archetype of ["Силач", "Танк", "Ловкач", "Стрелок", "Тяжёлый стрелок", "Резонанс"]) {
    assert.ok(html.includes(archetype), `переключатель архетипа: ${archetype}`);
  }
  assert.match(html, /Разгон/, "ресурс архетипа по умолчанию");
  assert.match(html, /Директива/, "режим управления");
});
