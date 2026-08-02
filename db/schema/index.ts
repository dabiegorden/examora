/**
 * Schema barrel.
 *
 * This is the single module drizzle-kit reads (see `drizzle.config.ts`) and the
 * one the client passes to `drizzle({ schema })`, so every table and relation
 * must be re-exported here to exist in migrations and in `db.query`.
 */

export * from "./enums";

export * from "./users";
export * from "./students";
export * from "./courses";
export * from "./course-students";
export * from "./exams";
export * from "./questions";
export * from "./options";
export * from "./attempts";
export * from "./answers";
export * from "./active-sessions";
export * from "./audit-logs";

export * from "./relations";
