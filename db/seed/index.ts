import "dotenv/config";

import { sql } from "drizzle-orm";

import { EXAM_STATUS, USER_ROLE } from "@/constants/roles";
import { hashPassword } from "@/utils/password";
import { db } from "../client";
import {
  activeSessions,
  answers,
  attempts,
  auditLogs,
  courseStudents,
  courses,
  exams,
  options,
  questions,
  students,
  users,
} from "../schema";
import {
  SEED_PASSWORD,
  mathsQuestions,
  physicsQuestions,
  seedCourses,
  seedStudents,
  seedTeacher,
  type SeedQuestion,
} from "./data";

/**
 * Development seed.
 *
 * Idempotent by construction: it truncates the tables it owns before inserting,
 * so running it twice leaves the same database rather than duplicate students.
 *
 * Run with `npm run db:seed`. It refuses to run against NODE_ENV=production.
 */

async function reset(): Promise<void> {
  // One statement, so the FK graph never has to be traversed in dependency
  // order. RESTART IDENTITY keeps re-seeds byte-identical.
  await db.execute(sql`
    TRUNCATE TABLE
      ${auditLogs}, ${activeSessions}, ${answers}, ${attempts},
      ${options}, ${questions}, ${exams},
      ${courseStudents}, ${courses}, ${students}, ${users}
    RESTART IDENTITY CASCADE
  `);
}

async function seedExam(
  courseId: string,
  title: string,
  instructions: string,
  bank: readonly SeedQuestion[],
  overrides: { status: "draft" | "published"; startsInDays: number }
): Promise<{ examId: string; questionCount: number; optionCount: number }> {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + overrides.startsInDays);
  startTime.setHours(9, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(11, 0, 0, 0);

  const [exam] = await db
    .insert(exams)
    .values({
      courseId,
      title,
      instructions,
      status: overrides.status,
      startTime: overrides.status === EXAM_STATUS.PUBLISHED ? startTime : null,
      endTime: overrides.status === EXAM_STATUS.PUBLISHED ? endTime : null,
      overallDurationMinutes: 45,
      questionDurationSeconds: 90,
      randomizeQuestions: true,
      randomizeOptions: true,
      allowReview: true,
      allowResultsImmediately: false,
      fullscreenRequired: true,
      autoSubmit: true,
    })
    .returning();

  const insertedQuestions = await db
    .insert(questions)
    .values(
      bank.map((item, index) => ({
        examId: exam.id,
        question: item.question,
        marks: item.marks,
        order: index,
      }))
    )
    .returning();

  const optionRows = insertedQuestions.flatMap((question, questionIndex) =>
    bank[questionIndex].options.map((option, optionIndex) => ({
      questionId: question.id,
      text: option.text,
      isCorrect: option.isCorrect,
      order: optionIndex,
    }))
  );

  const insertedOptions = await db.insert(options).values(optionRows).returning();

  return {
    examId: exam.id,
    questionCount: insertedQuestions.length,
    optionCount: insertedOptions.length,
  };
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a production database.");
  }

  console.log("→ Clearing existing data…");
  await reset();

  // Hashed once and reused: bcrypt at cost 12 takes ~250ms, and hashing 16
  // identical dev passwords separately would add ~4s for no benefit.
  const passwordHash = await hashPassword(SEED_PASSWORD);

  console.log("→ Creating teacher…");
  const [teacher] = await db
    .insert(users)
    .values({
      fullName: seedTeacher.fullName,
      email: seedTeacher.email,
      passwordHash,
      role: USER_ROLE.TEACHER,
      status: "active",
    })
    .returning();

  console.log(`→ Creating ${seedStudents.length} students…`);
  const studentUsers = await db
    .insert(users)
    .values(
      seedStudents.map((student, index) => ({
        fullName: student.fullName,
        email: student.email,
        passwordHash,
        role: USER_ROLE.STUDENT,
        status: "active" as const,
        // The last student is left on a "temporary" password so the forced
        // first-login change is reachable by hand without provisioning someone.
        mustChangePassword: index === seedStudents.length - 1,
      }))
    )
    .returning();

  const studentRows = await db
    .insert(students)
    .values(
      studentUsers.map((user, index) => ({
        userId: user.id,
        studentNumber: seedStudents[index].studentNumber,
      }))
    )
    .returning();

  console.log(`→ Creating ${seedCourses.length} courses…`);
  const courseRows = await db
    .insert(courses)
    .values(
      seedCourses.map((course) => ({
        teacherId: teacher.id,
        title: course.title,
        code: course.code,
        description: course.description,
        academicYear: course.academicYear,
      }))
    )
    .returning();

  const [physics, maths] = courseRows;

  // Everyone takes Physics; the first ten also take Maths, so the seed exercises
  // both the "whole cohort" and "subset" enrolment paths.
  console.log("→ Enrolling students…");
  await db.insert(courseStudents).values([
    ...studentRows.map((student) => ({
      courseId: physics.id,
      studentId: student.id,
    })),
    ...studentRows.slice(0, 10).map((student) => ({
      courseId: maths.id,
      studentId: student.id,
    })),
  ]);

  console.log("→ Creating exams, questions, and options…");
  const physicsExam = await seedExam(
    physics.id,
    "Physics — Mid-Term Assessment",
    "Answer all questions. You may revisit answered questions before submitting.",
    physicsQuestions,
    { status: EXAM_STATUS.PUBLISHED, startsInDays: 3 }
  );

  const mathsExam = await seedExam(
    maths.id,
    "Mathematics — Mid-Term Assessment",
    "Answer all questions. Calculators are not permitted.",
    mathsQuestions,
    { status: EXAM_STATUS.DRAFT, startsInDays: 10 }
  );

  console.log("\n✔ Seed complete\n");
  console.table({
    teachers: 1,
    students: studentRows.length,
    courses: courseRows.length,
    exams: 2,
    questions: physicsExam.questionCount + mathsExam.questionCount,
    options: physicsExam.optionCount + mathsExam.optionCount,
    enrolments: studentRows.length + 10,
  });

  console.log(`Sign in as any seeded account with password: ${SEED_PASSWORD}`);
  console.log(`  Teacher: ${seedTeacher.email}`);
  console.log(`  Student: ${seedStudents[0].email}`);
  console.log(
    `  Student (forced password change): ${seedStudents[seedStudents.length - 1].email}\n`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("\n✖ Seed failed\n", error);
    process.exit(1);
  });
