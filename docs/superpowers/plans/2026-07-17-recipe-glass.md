# Recipe Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the layered receipt glass with five compact, translucent mixed-liquid CSS variants and an accessible click wobble.

**Architecture:** Recipe data exposes a single `glass` visual theme keyed by recipe ID. The receipt binds that theme to CSS custom properties, while React owns only the short-lived wobble state and CSS owns the drawing and animation.

**Tech Stack:** React, TypeScript, CSS, Node test runner, vinext.

## Global Constraints

- Use CSS only; add no canvas, image assets, or dependencies.
- Support exactly five recipe palettes and bubbles only for `R02` and `R04`.
- Keep the glass compact and compatible with reduced-motion preferences.

---

### Task 1: Mixed Recipe Visual Data

**Files:**
- Modify: `tests/lab-engine.test.mjs`
- Modify: `app/lib/lab-engine.mjs`

**Interfaces:**
- Produces: `recipe.glass = { top: string, middle: string, bottom: string, sparkling: boolean }`.

- [x] **Step 1: Write the failing test**

Replace the layer assertions with checks that every recipe returns three six-digit hex colors and that only `R02` and `R04` are sparkling.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/lab-engine.test.mjs`
Expected: FAIL because `recipe.glass` is undefined.

- [x] **Step 3: Write minimal implementation**

Replace each `visualLayers` array with one recipe-specific `glass` object.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/lab-engine.test.mjs`
Expected: all engine tests pass.

### Task 2: Interactive CSS Glass

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/lab-app.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `result.recipe.glass` from Task 1.
- Produces: a `.recipe-glass` button with CSS variables `--liquid-top`, `--liquid-middle`, and `--liquid-bottom`.

- [x] **Step 1: Write the failing test**

Require `mixed-liquid`, `aria-label="轻晃这杯酒"`, the wobble state class, and remove the `liquid-layers` expectation.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/rendered-html.test.mjs`
Expected: FAIL because the receipt still renders layered spans.

- [x] **Step 3: Write minimal implementation**

Render one liquid element, optional bubbles, glass highlights, and a button that toggles wobble state for 620 ms. Draw a 135-by-137-pixel stemmed glass with translucent gradients and `@keyframes glass-wobble` / `liquid-wobble`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: production build succeeds and rendered tests pass.

- [ ] **Step 5: Verify and publish**

Run: `git diff --check && npm test`
Expected: no whitespace errors and all tests pass, then commit, push, save a Sites version, and deploy it to the existing private URL.
