import assert from "node:assert/strict";
import test from "node:test";

import { trackPlausibleOnce } from "../app/lib/plausible.mjs";

function fakeBrowser() {
  const events = [];
  const stored = new Map();
  return {
    events,
    plausible(name, options) {
      events.push([name, options]);
    },
    sessionStorage: {
      getItem(key) {
        return stored.get(key) ?? null;
      },
      setItem(key, value) {
        stored.set(key, value);
      },
    },
  };
}

test("sends an interactive Plausible event with non-personal properties", () => {
  const browser = fakeBrowser();

  const sent = trackPlausibleOnce(browser, "run-1:answer:0", "Answer Question", {
    question: "Q1",
    answer: "state-new",
  });

  assert.equal(sent, true);
  assert.deepEqual(browser.events, [["Answer Question", {
    props: { question: "Q1", answer: "state-new" },
  }]]);
});

test("deduplicates one event key within a browser session", () => {
  const browser = fakeBrowser();

  assert.equal(trackPlausibleOnce(browser, "run-1:start-quiz", "Start Quiz"), true);
  assert.equal(trackPlausibleOnce(browser, "run-1:start-quiz", "Start Quiz"), false);
  assert.equal(browser.events.length, 1);
});

test("allows the same funnel event in a new test run", () => {
  const browser = fakeBrowser();

  trackPlausibleOnce(browser, "run-1:generate-recipe", "Generate Recipe");
  trackPlausibleOnce(browser, "run-2:generate-recipe", "Generate Recipe");

  assert.equal(browser.events.length, 2);
});

test("does not mark an event sent when Plausible is unavailable", () => {
  const browser = fakeBrowser();
  browser.plausible = undefined;

  assert.equal(trackPlausibleOnce(browser, "run-1:start-quiz", "Start Quiz"), false);
});
