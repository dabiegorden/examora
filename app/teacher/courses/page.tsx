import type { Metadata } from "next";
import { BookOpenIcon, ClipboardListIcon, UsersIcon } from "lucide-react";

import { MetricCard } from "@/components/app/cards";
import { PageHeader, Section } from "@/components/app/page";
import { CoursesView } from "@/components/courses";
import { requireTeacher } from "@/lib/auth/dal";
import { CourseRepository } from "@/repositories";
import { listCoursesSchema } from "@/validators/course";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Collapse repeated query parameters.
 *
 * `?status=a&status=b` arrives as an array, which every field of the schema
 * would reject — and one malformed parameter must not throw away the rest of a
 * shared link. The first value wins.
 */
function firstValues(params: SearchParams): Record<string, string> {
  const entries = Object.entries(params).flatMap(([key, value]) => {
    const first = Array.isArray(value) ? value[0] : value;
    return first === undefined ? [] : [[key, first] as const];
  });

  return Object.fromEntries(entries);
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // The layout already established that this is a teacher. It is repeated here
  // rather than assumed: authorization belongs to the DAL at every entry point,
  // and a page must not depend on a layout having run to be safe.
  const teacher = await requireTeacher();

  const raw = firstValues(await searchParams);
  const parsed = listCoursesSchema.safeParse(raw);
  // A hand-edited query string degrades to the default view rather than an
  // error page.
  const query = parsed.success ? parsed.data : listCoursesSchema.parse({});

  const [page, academicYears, counts, totals] = await Promise.all([
    CourseRepository.listByTeacher(teacher.id, query),
    CourseRepository.listAcademicYears(teacher.id),
    CourseRepository.countByStatus(teacher.id),
    CourseRepository.totalsForTeacher(teacher.id),
  ]);

  return (
    <>
      <PageHeader
        title="Courses"
        description="Every subject you assess. Courses hold your students, exams, and results."
      />

      <Section delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Active courses"
            value={String(counts.active)}
            hint={
              counts.archived > 0
                ? `${counts.archived} archived`
                : "Visible to students"
            }
            icon={BookOpenIcon}
          />
          <MetricCard
            label="Enrolled students"
            value={String(totals.students)}
            hint="Across active courses"
            icon={UsersIcon}
          />
          <MetricCard
            label="Exams created"
            value={String(totals.exams)}
            hint="Drafts and published"
            icon={ClipboardListIcon}
          />
        </div>
      </Section>

      <Section delay={0.1}>
        <CoursesView
          page={page}
          query={query}
          academicYears={academicYears}
          counts={counts}
        />
      </Section>
    </>
  );
}
