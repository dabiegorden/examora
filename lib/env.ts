import { z } from "zod";

/**
 * Server environment contract.
 *
 * Parsed once at module load so a misconfigured deployment fails immediately
 * and loudly, rather than at the first query against an undefined URL.
 *
 * Deliberately *not* guarded with `server-only`: drizzle-kit and the seed
 * script import this outside the Next.js runtime, where that package throws.
 * The browser guard below covers the case `server-only` exists to prevent.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/env.ts was imported from client code. Server environment variables must never reach the browser."
  );
}

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) =>
        value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a PostgreSQL connection string"
    ),
  /**
   * HMAC key for the session cookie signature. 32 bytes minimum so the MAC
   * cannot be brute-forced offline; rotating it invalidates every session.
   */
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /**
   * Echo every SQL statement to the console. Off by default — a bulk insert
   * logs kilobytes per statement, which buries everything else.
   */
  DB_LOGGING: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return parsed.data;
}

export const env = parseEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
