import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { countExpression, findUserByEmail, findUserById } from "@/db/utils";
import { USER_ROLE } from "@/constants/roles";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import { hashPassword } from "@/utils/password";
import { normalizeEmail } from "@/utils/text";
import type { Paginated, PaginationParams } from "@/types/common";
import type { NewUser, User, UserRole, UserStatus } from "@/types/db";

/**
 * Account-level reads and writes shared by teachers and students.
 *
 * Role-specific concerns (student numbers, enrolments) belong in
 * `StudentRepository`; this layer only knows about sign-in identity.
 */
export const UserRepository = {
  findById: findUserById,
  findByEmail: findUserByEmail,

  async findByIdOrThrow(userId: string): Promise<User> {
    const user = await findUserById(userId);
    if (!user) throw new NotFoundError("User", userId);
    return user;
  },

  async existsByEmail(email: string): Promise<boolean> {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);

    return row !== undefined;
  },

  /**
   * Create an account from a plain-text password.
   *
   * Hashing lives here so no caller can accidentally persist a raw password;
   * `NewUser` requires `passwordHash`, which only this method produces.
   */
  async create(input: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
    /** Set for provisioned accounts issued a generated password. */
    mustChangePassword?: boolean;
  }): Promise<User> {
    const email = normalizeEmail(input.email);

    if (await this.existsByEmail(email)) {
      throw new ConflictError(`An account already exists for ${email}.`);
    }

    const values: NewUser = {
      fullName: input.fullName,
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      status: input.status ?? "active",
      mustChangePassword: input.mustChangePassword ?? false,
    };

    const [user] = await db.insert(users).values(values).returning();
    return user;
  },

  async update(
    userId: string,
    input: Partial<Pick<User, "fullName" | "email" | "status">>
  ): Promise<User> {
    const patch: Partial<NewUser> = { ...input };
    if (input.email) patch.email = normalizeEmail(input.email);

    const [user] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new NotFoundError("User", userId);
    return user;
  },

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  },

  /** Raise or clear the forced-password-change flag. */
  async setMustChangePassword(userId: string, value: boolean): Promise<void> {
    await db
      .update(users)
      .set({ mustChangePassword: value })
      .where(eq(users.id, userId));
  },

  /** Called on successful sign-in. */
  async touchLastLogin(userId: string): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  },

  async setStatus(userId: string, status: UserStatus): Promise<User> {
    return this.update(userId, { status });
  },

  async listTeachers(
    params: PaginationParams & { search?: string } = {}
  ): Promise<Paginated<User>> {
    return listByRole(USER_ROLE.TEACHER, params);
  },

  async delete(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  },
};

async function listByRole(
  role: UserRole,
  params: PaginationParams & { search?: string }
): Promise<Paginated<User>> {
  const pagination = normalizePagination(params);
  const search = params.search?.trim();

  const where = and(
    eq(users.role, role),
    search
      ? or(ilike(users.fullName, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined
  );

  const [items, [totals]] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db.select({ count: countExpression }).from(users).where(where),
  ]);

  return buildPaginated(items, totals?.count ?? 0, pagination);
}
