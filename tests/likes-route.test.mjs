import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("global likes use Upstash Redis with read and atomic increment routes", async () => {
  const route = await readFile(new URL("../app/api/likes/route.ts", import.meta.url), "utf8");

  assert.match(route, /from "@upstash\/redis"/);
  assert.match(route, /process\.env\.UPSTASH_REDIS_REST_URL/);
  assert.match(route, /process\.env\.UPSTASH_REDIS_REST_TOKEN/);
  assert.match(route, /process\.env\.KV_REST_API_URL/);
  assert.match(route, /process\.env\.KV_REST_API_TOKEN/);
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(route, /\.get\(LIKE_KEY\)/);
  assert.match(route, /\.incr\(LIKE_KEY\)/);
  assert.match(route, /fujian-laojiu-ai-lab:fuxiaoniang-likes:v1/);
  assert.match(route, /Number\.isSafeInteger/);
  assert.match(route, /status:\s*503/);
  assert.doesNotMatch(route, /cloudflare:workers|D1 binding/);
});
