import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Neon HTTP driver: one stateless fetch per query, which is what serverless and
 * edge runtimes want.
 *
 * Trade-off to know about: `db.transaction()` **throws** on this driver. For
 * atomic multi-statement writes use `db.batch([...])`, which Neon executes as a
 * single transaction — that is what the repositories here do. If a future
 * feature genuinely needs an interactive transaction (reading a row, branching
 * in JS, then writing), swap this for `drizzle-orm/neon-serverless` with a
 * `Pool`; the rest of the data layer is driver-agnostic.
 */
const sql = neon(env.DATABASE_URL);

/**
 * The Drizzle client.
 *
 * Cached on `globalThis` in development so Next.js hot reloads reuse one
 * instance instead of leaking a new client per module evaluation.
 */
const globalForDb = globalThis as unknown as {
  examoraDb: ReturnType<typeof createClient> | undefined;
};

function createClient() {
  return drizzle(sql, { schema, logger: env.DB_LOGGING });
}

export const db = globalForDb.examoraDb ?? createClient();

if (env.NODE_ENV !== "production") {
  globalForDb.examoraDb = db;
}

export type Database = typeof db;

/** Every table and relation, re-exported for callers that already have `db`. */
export { schema };
