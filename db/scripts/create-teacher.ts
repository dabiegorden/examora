import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { UserProvisioningService } from "@/services/user-provisioning.service";
import { UserRepository } from "@/repositories";
import { isAppError } from "@/lib/errors";
import { createTeacherSchema } from "@/validators/teacher";
import { flattenZodError } from "@/utils/validation";

/**
 * Create a teacher account from the command line.
 *
 * Examora has no self-service teacher sign-up, so this is the bootstrap path
 * for the first account on an environment — and the way an administrator adds
 * colleagues afterwards.
 *
 *   npm run db:create-teacher -- --name "Naomi Adjetey" --email naomi@school.edu
 *   npm run db:create-teacher                      # prompts for each field
 *
 * Omitting `--password` generates a temporary one and forces a change at first
 * sign-in, which is the recommended path: a password typed on a command line
 * ends up in your shell history.
 */

const USAGE = `
Create an Examora teacher account.

Usage:
  npm run db:create-teacher -- [options]

Options:
  --name <name>       Full name.
  --email <email>     Sign-in address.
  --password <pw>     Password. Omit to generate a temporary one (recommended).
  --force-change      Require a password change at first sign-in.
  --help              Show this message.

With no options, each field is prompted for interactively.
`.trim();

/** Read a line without echoing it, so passwords stay off the screen. */
async function promptHidden(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  // `readline` has no built-in masking: intercept the write that echoes typed
  // characters and swallow everything after the prompt itself is printed.
  const output = rl as unknown as {
    output: NodeJS.WriteStream;
    _writeToOutput?: (text: string) => void;
  };

  let muted = false;
  output._writeToOutput = (text: string) => {
    if (!muted || text.includes(question)) output.output.write(text);
  };

  const answer = rl.question(question);
  muted = true;

  try {
    return await answer;
  } finally {
    muted = false;
    rl.close();
    process.stdout.write("\n");
  }
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

class CliError extends Error {}

/** Abort with a clean message. Thrown rather than exiting, so stdio flushes. */
function fail(message: string): never {
  throw new CliError(message);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
      "force-change": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(USAGE);
    return;
  }

  const interactive = process.stdin.isTTY === true;

  if (!interactive && (!values.name || !values.email)) {
    fail(`--name and --email are required when there is no terminal to prompt.\n\n${USAGE}`);
  }

  const fullName = values.name ?? (await prompt("Full name: "));
  const email = values.email ?? (await prompt("Email: "));

  // Validate the identity fields before asking for a password, so a typo in the
  // email does not cost the operator two password entries.
  const identity = createTeacherSchema
    .pick({ fullName: true, email: true })
    .safeParse({ fullName, email });

  if (!identity.success) {
    const issues = Object.entries(flattenZodError(identity.error))
      .map(([field, messages]) => `  • ${field}: ${messages[0]}`)
      .join("\n");
    fail(`Invalid details:\n${issues}`);
  }

  // Checked up front purely for a clearer message; `UserRepository.create`
  // enforces it for real, and the unique index behind that is the last word.
  if (await UserRepository.existsByEmail(identity.data.email)) {
    fail(`An account already exists for ${identity.data.email}.`);
  }

  let password = values.password;

  if (password === undefined && interactive) {
    const entered = await promptHidden(
      "Password (leave blank to generate a temporary one): "
    );

    if (entered.length > 0) {
      const confirmed = await promptHidden("Confirm password: ");
      if (entered !== confirmed) fail("The passwords do not match.");
      password = entered;
    }
  }

  if (password !== undefined) {
    const checked = createTeacherSchema.shape.password.safeParse(password);
    if (!checked.success) {
      fail(`Password rejected:\n  • ${checked.error.issues[0].message}`);
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("⚠ Creating a teacher against a PRODUCTION database.\n");
  }

  try {
    const { user, password: issued, isGenerated } =
      await UserProvisioningService.createTeacher({
        fullName: identity.data.fullName,
        email: identity.data.email,
        password,
        mustChangePassword: values["force-change"] || undefined,
      });

    console.log("\n✔ Teacher account created\n");
    console.table({
      name: user.fullName,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });

    if (isGenerated) {
      console.log(`\nTemporary password: ${issued}`);
      console.log(
        "Shown once — it is stored only as a bcrypt hash. They must change it at first sign-in.\n"
      );
    } else {
      console.log("\nThey can sign in at /login with the password you set.\n");
    }
  } catch (error) {
    fail(isAppError(error) ? error.message : "Could not create the account.");
  }
}

// No `process.exit(0)` on success: forcing exit while libuv is still closing
// stdio handles trips an assertion on Windows. Nothing here holds the loop open,
// so the process ends on its own.
main().catch((error: unknown) => {
  if (error instanceof CliError) {
    console.error(`\n✖ ${error.message}\n`);
  } else {
    console.error("\n✖ Failed\n", error);
  }
  process.exitCode = 1;
});
