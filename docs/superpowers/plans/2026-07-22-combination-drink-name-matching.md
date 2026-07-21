# Combination Drink Name Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match three existing dynamic drink names from the complete five-answer profile instead of mapping names directly from individual answers.

**Architecture:** Replace the three per-question name maps with one immutable name catalog containing hidden dimension weights. Reuse `buildDimensions()` and a stable hash to score and deterministically tie-break every catalog entry, returning the top three unique names.

**Tech Stack:** JavaScript ES modules, Node.js test runner, React/Vinext.

## Global Constraints

- Preserve every currently available dynamic drink name exactly; do not add, delete, or rewrite copy.
- Every completed answer combination returns exactly three unique names.
- Identical answers and seed return identical names.
- Recipe matching, alcohol-free mode, daily status, and ingredient ratios remain unchanged.

---

### Task 1: Combination-Based Name Matcher

**Files:**
- Modify: `app/lib/lab-engine.mjs`
- Modify: `tests/lab-engine.test.mjs`
- Modify: `app/lab-app.tsx`

**Interfaces:**
- Consumes: `buildDimensions(answers)`, `hash(value)`, the five answer IDs, and `seed`.
- Produces: `buildDrinkNames(answers, dimensions, seed): string[]` returning exactly three unique existing names.

- [ ] **Step 1: Write failing combination-matching tests**

Add tests that capture the complete catalog before refactoring, assert all 4500 combinations return three unique names, assert deterministic output, and assert changing one answer changes at least one candidate across representative cases.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/lab-engine.test.mjs`

Expected: failure because the current matcher can return fewer than three names and maps names directly from individual answers.

- [ ] **Step 3: Implement the catalog scorer**

Create a catalog entry shape:

```js
{
  name: "existing name",
  weights: { energy: 0.8, comfort: 0.2, ai: 0.4 },
}
```

Score every entry with normalized complete-profile dimensions plus a small deterministic hash tie-breaker. Sort descending, deduplicate by `name`, and return three names.

- [ ] **Step 4: Restore the fixed three-name UI counter**

Set the result-page switcher back to modulo `3` and display `1/3`, `2/3`, `3/3`, because every complete combination again guarantees three names.

- [ ] **Step 5: Run all verification**

Run:

```bash
node --test tests/lab-engine.test.mjs
npm test
git diff --check
```

Expected: all engine tests pass, rendered HTML tests pass, and no whitespace errors are reported.

- [ ] **Step 6: Commit and push**

```bash
git add app/lib/lab-engine.mjs app/lab-app.tsx tests/lab-engine.test.mjs
git commit -m "Match drink names from complete answer profiles"
git push origin main
```
