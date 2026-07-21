import assert from "node:assert/strict";
import test from "node:test";

import { alternateDrinkName, computeResult, normalizeCreatorName } from "../app/lib/lab-engine.mjs";

const socialAnswers = ["state-hustle", "taste-bubbles", "delete-bug", "launch", "task-start"];
const reflectiveAnswers = ["state-offline", "taste-quiet", "delete-rumination", "vacation", "task-research"];

test("social, energetic answers with fruit and bubbles select R04", () => {
  const result = computeResult({
    answers: socialAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: [],
    },
    seed: "social-case",
  });

  assert.equal(result.recipe?.id, "R04");
  assert.equal(result.adjustmentCode, "SPARKLING");
  assert.match(result.reason, /气泡|果香/);
  assert.equal(result.metrics.length, 4);
});

test("quiet, reflective answers with tea preference select R03", () => {
  const result = computeResult({
    answers: reflectiveAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: [],
    },
    seed: "tea-case",
  });

  assert.equal(result.recipe?.id, "R03");
  assert.equal(result.adjustmentCode, "TEA");
  assert.match(result.reason, /茶香|灵感|安静/);
});

test("all five recipes expose one mixed glass palette with recipe-specific bubbles", () => {
  const recipes = new Map();
  const states = ["state-new", "state-offline", "state-hustle", "state-survive", "state-unknown"];
  const tastes = ["taste-sour", "taste-sweet", "taste-bubbles", "taste-quiet", "taste-bold"];
  const deletions = ["delete-monday", "delete-group", "delete-boss", "delete-todos", "delete-rumination", "delete-anxiety", "delete-bug", "delete-alarm", "delete-ddl"];
  const wishes = ["vacation", "wealth", "launch", "love", "ai-work"];
  const tasks = ["task-start", "task-research", "task-delay", "task-ai"];

  collectRecipes: for (const state of states) for (const taste of tastes) for (const deleted of deletions) for (const wish of wishes) for (const task of tasks) {
    const result = computeResult({
      answers: [state, taste, deleted, wish, task],
      preferences: { tastes: [], sweetness: "balanced", restrictions: [] },
      seed: "mixed-glass-recipes",
    });
    if (result.recipe) recipes.set(result.recipe.id, result.recipe);
    if (recipes.size === 5) break collectRecipes;
  }

  assert.equal(recipes.size, 5);
  for (const recipe of recipes.values()) {
    assert.ok(recipe.glass);
    assert.deepEqual(Object.keys(recipe.glass).sort(), ["color", "sparkling"]);
    assert.match(recipe.glass.color, /^#[0-9a-f]{6}$/i);
    assert.equal(recipe.glass.sparkling, ["R02", "R04"].includes(recipe.id));
    assert.equal("visualLayers" in recipe, false);
  }
});

test("taste preferences adjust liquid ratios while keeping ice in every recipe", () => {
  const input = {
    answers: ["state-new", "taste-sweet", "delete-monday", "vacation", "task-start"],
    preferences: { restrictions: [], sweetness: "balanced", tastes: [] },
    seed: "ratio-adjustment",
  };
  const result = computeResult(input);
  const liquids = result.recipe.ingredients.filter(([, amount]) => amount.endsWith("%"));
  if (liquids.length > 0) {
    assert.equal(liquids.reduce((sum, [, amount]) => sum + Number.parseInt(amount, 10), 0), 100);
  }
  assert.deepEqual(result.recipe.ingredients.at(-1), ["冰块", "适量"]);
});

test("turns all five answers into abstract joke names instead of literal combinations", () => {
  const result = computeResult({
    answers: socialAnswers,
    preferences: { tastes: [], sweetness: "balanced", restrictions: [] },
    seed: "joke-name-case",
  });

  assert.deepEqual(result.drinkNames, [
    "加班请求已退回",
    "Bug 泡酒了",
    "开局先碰杯",
  ]);
  assert.equal(new Set(result.drinkNames).size, 3);
  assert.doesNotMatch(result.drinkNames.join("|"), /冒点泡|正在冒泡|马上开始|火力全开/);
  assert.equal(alternateDrinkName(result, 1), result.drinkNames[(result.drinkNames.indexOf(result.drinkName) + 1) % 3]);
});

test("every final quiz combination keeps its available distinct name options", () => {
  const groups = [
    ["state-new", "state-offline", "state-hustle", "state-survive", "state-unknown"],
    ["taste-sour", "taste-sweet", "taste-bubbles", "taste-quiet", "taste-bold"],
    ["delete-monday", "delete-group", "delete-boss", "delete-todos", "delete-rumination", "delete-anxiety", "delete-bug", "delete-alarm", "delete-ddl"],
    ["vacation", "wealth", "launch", "love", "ai-work"],
    ["task-start", "task-research", "task-delay", "task-ai"],
  ];
  let checked = 0;

  for (const state of groups[0]) for (const taste of groups[1]) for (const deleted of groups[2]) {
    for (const wish of groups[3]) for (const task of groups[4]) {
      const result = computeResult({
        answers: [state, taste, deleted, wish, task],
        preferences: { tastes: [], sweetness: "balanced", restrictions: ["none"] },
        seed: "all-name-combinations",
      });
      assert.ok(result.drinkNames.length >= 1 && result.drinkNames.length <= 3, result.drinkNames.join(" | "));
      assert.equal(new Set(result.drinkNames).size, result.drinkNames.length, result.drinkNames.join(" | "));
      checked += 1;
    }
  }

  assert.equal(checked, 4500);
});

test("builds receipt decoration without replacing the existing percentage metrics", () => {
  const result = computeResult({
    answers: socialAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: [],
    },
    seed: "receipt-profile-case",
  });

  assert.equal(result.receiptProfile.mbti, "N/A");
  assert.equal(result.metrics.length, 4);
  assert.ok(result.metrics.every((metric) => Number.isInteger(metric.value)));
  assert.equal("actions" in result.receiptProfile, false);
  assert.ok(Array.from(result.receiptProfile.total).length <= 8);
  assert.ok(result.receiptProfile.type.length > 0);
  assert.match(result.receiptProfile.typeGlyph, /\n/);
  assert.ok(result.receiptProfile.verdict.length <= 32);
  assert.match(result.receiptProfile.barcode, /^[| ]+$/);
});

test("dietary restrictions are hard filters", () => {
  const dairyFree = computeResult({
    answers: reflectiveAnswers,
    preferences: {
      tastes: ["lactic"],
      sweetness: "sweet",
      restrictions: ["dairy"],
    },
    seed: "dairy-case",
  });

  assert.ok(!["R01", "R05"].includes(dairyFree.recipe?.id));

  const noneAvailable = computeResult({
    answers: socialAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: ["dairy", "sparkling", "citrus"],
    },
    seed: "no-match-case",
  });

  assert.equal(noneAvailable.recipe, null);
  assert.equal(noneAvailable.adjustmentCode, null);

  const remainingUiRestrictions = computeResult({
    answers: socialAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: ["dairy", "citrus"],
    },
    seed: "remaining-ui-restrictions",
  });

  assert.equal(remainingUiRestrictions.recipe?.id, "R04");
});

test("the same answers and seed produce a stable receipt", () => {
  const input = {
    answers: socialAnswers,
    preferences: {
      tastes: [],
      sweetness: "balanced",
      restrictions: [],
    },
    seed: "stable-device-seed",
  };

  assert.deepEqual(computeResult(input), computeResult(input));
  assert.match(computeResult(input).receiptNumber, /^FJL-2026-\d{3}$/);
});

test("creator names are optional, clean, and limited to 12 characters", () => {
  assert.equal(normalizeCreatorName(""), "今日酿造者");
  assert.equal(normalizeCreatorName("  小酿\n<script>  "), "小酿script");
  assert.equal(normalizeCreatorName("十二个字以内昵称刚刚好再多一点"), "十二个字以内昵称刚刚好再");
});
