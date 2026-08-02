/**
 * Database entry point.
 *
 * Import from `@/db` for the client and tables; import from `@/repositories`
 * for query logic. Application code should not build queries inline.
 */

export { db, schema, type Database } from "./client";
export * from "./schema";
export * from "./utils";
