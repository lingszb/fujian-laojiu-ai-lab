import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("global likes use a D1 counter with read and atomic increment routes", async () => {
  const [route, schema, hosting] = await Promise.all([
    readFile(new URL("../app/api/likes/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(schema, /sqliteTable\("counters"/);
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(route, /ON CONFLICT\(key\) DO UPDATE SET value = value \+ 1/);
  assert.match(route, /fuxiaoniang-likes/);
  assert.match(route, /status:\s*503/);
});
