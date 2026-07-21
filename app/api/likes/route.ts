export const dynamic = "force-dynamic";

const LIKE_KEY = "fuxiaoniang-likes";
const CREATE_COUNTERS_SQL = `
  CREATE TABLE IF NOT EXISTS counters (
    key TEXT PRIMARY KEY NOT NULL,
    value INTEGER DEFAULT 0 NOT NULL
  )
`;

async function likesDatabase() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

async function ensureCountersTable() {
  const db = await likesDatabase();
  await db.prepare(CREATE_COUNTERS_SQL).run();
  return db;
}

async function readCount() {
  const db = await ensureCountersTable();
  const row = await db.prepare("SELECT value FROM counters WHERE key = ?")
    .bind(LIKE_KEY)
    .first<{ value: number }>();
  return Number(row?.value ?? 0);
}

function unavailable() {
  return Response.json(
    { count: null },
    { status: 503, headers: { "cache-control": "no-store" } },
  );
}

export async function GET() {
  try {
    return Response.json(
      { count: await readCount() },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return unavailable();
  }
}

export async function POST() {
  try {
    const db = await ensureCountersTable();
    await db.prepare(`
      INSERT INTO counters (key, value) VALUES (?, 1)
      ON CONFLICT(key) DO UPDATE SET value = value + 1
    `).bind(LIKE_KEY).run();
    const row = await db.prepare("SELECT value FROM counters WHERE key = ?")
      .bind(LIKE_KEY)
      .first<{ value: number }>();
    return Response.json(
      { count: Number(row?.value ?? 1) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return unavailable();
  }
}
