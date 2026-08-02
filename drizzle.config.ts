// `dotenv/config` must be first: it populates process.env before `lib/env`
// validates it. ES import order guarantees that.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { env } from "./lib/env";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  verbose: true,
  strict: true,
});
