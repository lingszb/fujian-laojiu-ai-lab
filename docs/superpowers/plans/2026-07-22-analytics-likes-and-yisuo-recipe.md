# Analytics, Global Likes, and 一蓑烟雨 Recipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track the quiz funnel in Plausible, display and persist a global 福小酿 like count, and replace 一蓑烟雨 with the requested blue soda formula.

**Architecture:** A small browser analytics module sends deduplicated Plausible custom events. A same-origin Next route reads and atomically increments a single Cloudflare D1 counter, while the receipt UI prevents repeat likes in the same browser and displays the returned total. Recipe data stays in the existing engine and is verified through its current unit tests.

**Tech Stack:** React 19, Vinext/Next route handlers, Plausible custom events, Cloudflare D1, Drizzle ORM, Node.js test runner.

## Global Constraints

- Send no nickname or free-form user text to Plausible.
- Use exactly `Start Quiz`, `Answer Question`, `Generate Recipe`, and `Like Fuxiaoniang` as event names.
- Keep the like endpoint same-origin and keep the rest of the experience usable when it is unavailable.
- Preserve all current dynamic drink names and matching logic.
- 一蓑烟雨 uses 雪碧 38%、蓝色芬达 38%、黄酒 24%、冰块适量.
- Commit verified implementation and push `main` to `origin`.

---

### Task 1: Replace the 一蓑烟雨 Formula

**Files:**
- Modify: `app/lib/lab-engine.mjs`
- Modify: `tests/lab-engine.test.mjs`

**Interfaces:**
- Consumes: existing `RECIPES` entry `R03` and `computeResult()`.
- Produces: `R03.ingredients` with three liquids totaling 100%, a blue sparkling glass, and updated matching metadata.

- [ ] **Step 1: Write a failing R03 recipe test**

Collect `R03` using the existing combination loop and assert:

```js
assert.deepEqual(recipe.ingredients, [
  ["雪碧", "38%"],
  ["蓝色芬达", "38%"],
  ["黄酒", "24%"],
  ["冰块", "适量"],
]);
assert.equal(recipe.glass.sparkling, true);
assert.match(recipe.glass.color, /^#[0-9a-f]{6}$/i);
```

- [ ] **Step 2: Run the engine test and confirm it fails**

Run: `node --test tests/lab-engine.test.mjs`

Expected: the new R03 ingredient assertion fails against 青柠汁、蜂蜜糖浆、苏打水.

- [ ] **Step 3: Update R03 data**

Set:

```js
note: "雪碧、蓝色芬达与黄酒的蓝色气泡特调",
tastes: { fruit: 0.7, sparkling: 1, sweet: 0.65, refreshing: 0.82 },
blockedBy: ["sparkling", "citrus"],
ingredients: [
  ["雪碧", "38%"],
  ["蓝色芬达", "38%"],
  ["黄酒", "24%"],
  ["冰块", "适量"],
],
glass: { color: "#4f9fd8", sparkling: true },
method: "杯中加满冰，依次倒入黄酒、蓝色芬达与雪碧，轻轻提拉一次。",
```

- [ ] **Step 4: Run the engine test and confirm it passes**

Run: `node --test tests/lab-engine.test.mjs`

Expected: all engine tests pass.

---

### Task 2: Add Deduplicated Plausible Funnel Events

**Files:**
- Create: `app/lib/plausible.mjs`
- Create: `tests/plausible.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `app/lab-app.tsx`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `trackPlausibleOnce(scope, eventKey, eventName, props = {}): boolean`.
- Consumes: `window`, `sessionStorage`, the current test `seed`, quiz index, and answer ID.

- [ ] **Step 1: Write failing tracker tests**

Use a fake scope with `sessionStorage` and a `plausible` spy. Assert the first call sends `{ props }`, a repeat event key does not send again, and a different run seed sends again.

- [ ] **Step 2: Run the focused tracker test and confirm it fails**

Run: `node --test tests/plausible.test.mjs`

Expected: module-not-found failure for `app/lib/plausible.mjs`.

- [ ] **Step 3: Implement the tracker helper and global queue**

The helper checks `sessionStorage` before calling:

```js
scope.plausible(eventName, { props });
scope.sessionStorage.setItem(`fjl:analytics:${eventKey}`, "1");
```

Add the standard Plausible queue bootstrap before the existing external script in `app/layout.tsx` so early events are queued.

- [ ] **Step 4: Wire the three funnel events**

- Call `Start Quiz` from `continueWithCreator()` with key `${seed}:start-quiz`.
- Call `Answer Question` from `chooseAnswer()` with key `${seed}:answer:${questionIndex}` and props `{ question: `Q${questionIndex + 1}`, answer: id }`.
- Call `Generate Recipe` when `screen === "result"` with key `${seed}:generate-recipe` and props `{ participation, recipe: result.recipe?.id ?? "none" }`.

- [ ] **Step 5: Run tracker and rendered tests**

Run:

```bash
node --test tests/plausible.test.mjs
npm test
```

Expected: tracker tests and rendered HTML tests pass.

---

### Task 3: Add the D1 Global Like Counter and Receipt Button

**Files:**
- Modify: `.openai/hosting.json`
- Modify: `db/schema.ts`
- Create: `app/api/likes/route.ts`
- Create: generated `drizzle/0000_*.sql` and metadata
- Modify: `app/lab-app.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

**Interfaces:**
- `GET /api/likes` produces `{ count: number }`.
- `POST /api/likes` atomically increments and produces `{ count: number }`.
- The client consumes both methods and records `Like Fuxiaoniang` only after a successful POST.

- [ ] **Step 1: Write failing UI/source assertions**

Assert rendered source includes `/api/likes`, `Like Fuxiaoniang`, `为福小酿点赞`, `like-button`, and that the like button occurs after `给工作人员看` but before `share-row`.

- [ ] **Step 2: Run the rendered test and confirm it fails**

Run: `node --test tests/rendered-html.test.mjs`

Expected: missing like button and endpoint assertions fail.

- [ ] **Step 3: Enable D1 and create the counter schema**

Set `.openai/hosting.json` to use `"d1": "DB"`. Define:

```ts
export const counters = sqliteTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});
```

Run: `npm run db:generate`

Expected: one SQLite migration creating `counters`.

- [ ] **Step 4: Implement the likes route**

GET selects `fuxiaoniang-likes`, defaulting to zero. POST uses Drizzle `onConflictDoUpdate` with `sql`${counters.value} + 1`` and then selects the updated count. Return status 503 with `{ count: null }` if D1 is unavailable.

- [ ] **Step 5: Implement receipt like state and interaction**

On entering the receipt, GET the count. The POST handler disables while pending, persists `fjl-liked-fuxiaoniang-v1` after success, updates the count, sends `Like Fuxiaoniang`, and displays a filled heart. Add the button between the staff-mode button and `.share-row`.

- [ ] **Step 6: Style the icon button**

Add `.like-button`, `.like-icon`, `.like-count`, pending, hover, active, and `aria-pressed` styles consistent with the paper/ink/red visual system.

- [ ] **Step 7: Run focused and full verification**

Run:

```bash
node --test tests/plausible.test.mjs tests/lab-engine.test.mjs
npm test
npm run lint
git diff --check
```

Expected: all tests and build pass, lint reports no errors, and no whitespace errors are present.

- [ ] **Step 8: Commit and push**

```bash
git add .openai/hosting.json app/api/likes/route.ts app/globals.css app/lab-app.tsx app/layout.tsx app/lib/lab-engine.mjs app/lib/plausible.mjs db/schema.ts drizzle tests
git commit -m "Track quiz funnel and add global likes"
git push origin main
```
