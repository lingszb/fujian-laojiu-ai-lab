# Coupe Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bulky rounded glass with a clear, lightweight coupe and brighten the five recipe liquid colors.

**Architecture:** Keep the existing recipe glass data contract and DOM structure. Update recipe color tokens in the engine, then restyle the existing CSS elements so animation, accessibility, receipt export, and sparkling behavior remain intact.

**Tech Stack:** React, CSS, Node test runner, vinext, html-to-image

## Global Constraints

- The liquid remains one mixed color per recipe with no visual layers.
- The existing 900 ms click wobble and reduced-motion fallback remain unchanged.
- The glass must fit the current receipt header area and PNG export.
- No new runtime dependency is introduced.

---

### Task 1: Lock The Coupe Contract With Tests

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: existing `.recipe-glass`, `.glass-bowl`, `.mixed-liquid`, and animation selectors.
- Produces: source-level checks for the coupe proportions and fluted glass treatment.

- [ ] **Step 1: Add failing assertions**

Assert that the stylesheet contains the `coupe-fluting` custom property, a wide shallow bowl, and translucent liquid styling while continuing to reject layered-liquid variables.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/rendered-html.test.mjs`

Expected: FAIL because the coupe-specific styling is not present yet.

### Task 2: Brighten The Five Mixed Recipe Colors

**Files:**
- Modify: `app/lib/lab-engine.mjs`
- Test: `tests/lab-engine.test.mjs`

**Interfaces:**
- Consumes: `recipe.glass.color` hexadecimal color strings.
- Produces: five brighter hexadecimal colors while preserving `{ color, sparkling }`.

- [ ] **Step 1: Replace the five muted color values**

Use distinct translucent-looking base colors for purple fruit, citrus soda, tea, grape soda, and orange yogurt recipes.

- [ ] **Step 2: Run engine tests**

Run: `node --test tests/lab-engine.test.mjs`

Expected: all tests pass and every recipe still exposes only `color` and `sparkling`.

### Task 3: Restyle The Existing Glass As A Coupe

**Files:**
- Modify: `app/globals.css`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: the existing glass DOM in `app/lab-app.tsx` and `--liquid-color`.
- Produces: shallow bowl, fine stem, elliptical base, fluting, clear mixed liquid, highlights, bubbles, and unchanged wobble selectors.

- [ ] **Step 1: Implement the coupe proportions and clear material**

Widen and flatten the bowl, extend the stem, reduce outline weight, brighten the liquid gradients, and add subtle lower-bowl fluting through CSS backgrounds.

- [ ] **Step 2: Run focused and full tests**

Run: `node --test tests/rendered-html.test.mjs`

Run: `npm test`

Expected: all tests and the production build pass.

- [ ] **Step 3: Verify in a browser**

Open the local receipt at mobile width, confirm the coupe is centered and compact, click it to confirm the 900 ms wobble, and confirm the receipt still exports as PNG.

- [ ] **Step 4: Commit and publish**

Commit the tested source, push the exact commit to the configured Sites repository, save a new Sites version, and deploy it to the existing private production URL.
