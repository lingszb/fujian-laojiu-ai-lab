import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const LIKE_KEY = "fujian-laojiu-ai-lab:fuxiaoniang-likes:v1";
let redis: Redis | null = null;

function likesStore() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is unavailable");
  return redis ??= new Redis({ url, token });
}

function countValue(value: unknown) {
  const count = Number(value ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Invalid likes counter");
  }
  return count;
}

function countResponse(count: number) {
  return Response.json(
    { count },
    { headers: { "cache-control": "no-store" } },
  );
}

function unavailable() {
  return Response.json(
    { count: null },
    { status: 503, headers: { "cache-control": "no-store" } },
  );
}

export async function GET() {
  try {
    return countResponse(countValue(await likesStore().get(LIKE_KEY)));
  } catch {
    return unavailable();
  }
}

export async function POST() {
  try {
    return countResponse(countValue(await likesStore().incr(LIKE_KEY)));
  } catch {
    return unavailable();
  }
}
