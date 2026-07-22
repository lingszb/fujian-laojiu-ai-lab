import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished Fujian Laojiu experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>WOPC × 福建老酒 AI 调酒实验室<\/title>/i);
  assert.match(html, /正在连接今日风味/);
  assert.match(html, /WOPC × 福建老酒/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the product flow local, compliant, and free of a flavor catalog", async () => {
  const [app, engine, css, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/lab-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/lab-engine.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(app, /我已年满十八周岁，符合饮酒年龄，继续体验/);
  assert.match(app, /我要喝无酒精/);
  assert.doesNotMatch(app, /不喝气泡饮品/);
  assert.match(app, /useState<Screen>\("home"\)/);
  assert.match(app, /home-cta" onClick=\{\(\) => setScreen\("age"\)\}/);
  assert.match(app, /setParticipation\("drink"\); setScreen\("creator"\)/);
  assert.match(app, /WOPC × 福建老酒出品/);
  assert.ok(app.indexOf("PERSONALITY RESULT FOR TODAY ONLY") < app.indexOf("receipt-producer"));
  assert.match(app, /localStorage/);
  assert.match(app, /给工作人员看/);
  assert.match(app, /下载酒方图片/);
  assert.match(app, /downloadReceipt/);
  assert.match(app, /receiptRef/);
  assert.match(app, /toPng/);
  assert.doesNotMatch(app, /截图保存/);
  assert.match(app, /receipt-wine-name[^>]*>《\{displayName\}》/);
  assert.match(app, /CREATED BY/);
  assert.doesNotMatch(app, /receipt-word">RECEIPT/);
  assert.match(app, /recipe-glass/);
  assert.match(app, /mixed-liquid/);
  assert.match(app, /aria-label="轻晃这杯酒"/);
  assert.match(app, /glassWobbling/);
  assert.match(app, /}, 900\);/);
  assert.match(app, /--liquid-color/);
  assert.doesNotMatch(app, /liquid-layers/);
  assert.doesNotMatch(app, /--liquid-(top|middle|bottom)/);
  assert.doesNotMatch(app, /className="type-mark"/);
  assert.match(app, /CASHIER/);
  assert.match(app, /PAYMENT/);
  assert.match(app, /TOTAL/);
  assert.match(app, /MBTI/);
  assert.match(app, /metric-list/);
  assert.doesNotMatch(app, />ACTION</);
  assert.match(app, /Demo|Bug|路演/);
  assert.match(app, /今天状态不错，来点新的/);
  assert.match(app, /今天最想删掉什么/);
  assert.match(app, /让 AI 干 哈哈哈哈/);
  assert.match(app, /AI 替我修 Bug，我替 AI 喝彩/);
  assert.doesNotMatch(app, /口感偏好|最多选 2 项/);
  assert.match(app, /prefers-reduced-motion|BREW_STEPS/);
  assert.doesNotMatch(app, /5 种风味原型|已验证的风味|已验证风味/);

  assert.match(engine, /blockedBy/);
  assert.match(engine, /FJL-2026-/);
  assert.match(engine, /R01/);
  assert.match(engine, /R05/);
  assert.match(css, /@keyframes glass-wobble/);
  assert.match(css, /@keyframes liquid-wobble/);
  assert.match(css, /glass-wobble 900ms/);
  assert.match(css, /liquid-wobble 900ms/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion[\s\S]*recipe-glass\.is-wobbling[\s\S]*drop-shadow/);
  assert.match(css, /var\(--liquid-color\)/);
  assert.match(css, /--coupe-fluting/);
  assert.match(css, /\.glass-bowl[\s\S]*width:\s*128px[\s\S]*height:\s*58px/);
  assert.match(css, /\.mixed-liquid[\s\S]*opacity:\s*0\.72/);
  assert.doesNotMatch(css, /var\(--liquid-(top|middle|bottom)\)/);
  assert.match(page, /<LabApp \/>/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /html-to-image/);
});

test("wires the quiz funnel to deduplicated Plausible events", async () => {
  const [app, layout] = await Promise.all([
    readFile(new URL("../app/lab-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /window\.plausible\.q/);
  assert.match(app, /trackPlausibleOnce/);
  assert.match(app, /Start Quiz/);
  assert.match(app, /Answer Question/);
  assert.match(app, /Generate Recipe/);
  assert.match(app, /question: `Q\$\{questionIndex \+ 1\}`/);
  assert.match(app, /answer: id/);
});

test("places the global 福小酿 like action before the receipt share row", async () => {
  const [app, css] = await Promise.all([
    readFile(new URL("../app/lab-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const staffIndex = app.indexOf("给工作人员看");
  const likeIndex = app.indexOf("为福小酿点赞");
  const receiptActionsIndex = app.indexOf('className="share-row"');
  assert.ok(staffIndex >= 0 && staffIndex < likeIndex && likeIndex < receiptActionsIndex);
  assert.match(app, /\/api\/likes/);
  assert.match(app, /Like Fuxiaoniang/);
  assert.match(app, /aria-pressed=\{liked\}/);
  assert.match(app, /like-count/);
  assert.match(app, />👍<\/span>/);
  assert.doesNotMatch(app, /liked \? "♥" : "♡"/);
  assert.match(app, /感谢！福小酿收到你的点赞啦。/);
  assert.match(app, /likeCelebrating/);
  assert.match(app, /like-burst/);
  assert.match(app, /like-thanks/);
  assert.match(app, /setLikeCelebrating\(true\)/);
  assert.match(app, /setLikeCelebrating\(false\)/);
  assert.match(css, /\.like-button/);
  assert.match(css, /\.like-icon/);
  assert.match(css, /@keyframes like-pop/);
  assert.match(css, /@keyframes like-float/);
  assert.match(css, /@keyframes like-count-tick/);
  assert.match(css, /@keyframes like-thanks-in/);
  assert.match(css, /prefers-reduced-motion[\s\S]*\.like-button\.is-celebrating/);
});
