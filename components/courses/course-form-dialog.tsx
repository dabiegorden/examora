"use client";

import { ResponsiveFormDialog } from "@/components/app/dialogs";
import { EMPTY_COURSE_FORM, type CourseFormValues } from "@/validators/course";
import type { CourseWithCounts } from "@/repositories";
import type { ActionResult } from "@/types/common";
import { CourseForm } from "./course-form";

/**
 * Create/edit course modal.
 *
 * A bottom sheet on phones and a dialog on desktop — see
 * `ResponsiveFormDialog`. The mode is derived from `course`: passing one edits
 * it, passing nothing creates.
 *
 * Submitting is the caller's job. That is what lets the list apply its
 * optimistic patch and run the server action inside a single transition, while
 * this component still gets the result back and can leave the dialog open with
 * a field error when the server rejects the change.
 */

export interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The course being edited. Omit to create a new one. */
  course?: CourseWithCounts | null;
  onCreate: (values: CourseFormValues) => Promise<ActionResult<CourseWithCounts>>;
  onUpdate: (
    courseId: string,
    values: CourseFormValues
  ) => Promise<ActionResult<CourseWithCounts>>;
}

function toFormValues(course: CourseWithCounts): CourseFormValues {
  return {
    title: course.title,
    code: course.code,
    description: course.description ?? "",
    academicYear: course.academicYear ?? "",
  };
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onCreate,
  onUpdate,
}: CourseFormDialogProps) {
  const editing = Boolean(course);

  const handleSubmit = async (values: CourseFormValues) => {
    const result = course
      ? await onUpdate(course.id, values)
      : await onCreate(values);

    if (result.success) onOpenChange(false);
    return result;
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit course" : "Create course"}
      description={
        editing
          ? "Changes apply immediately for everyone enrolled."
          : "Courses hold your students, exams, and results."
      }
    >
      <CourseForm
        // Remounts between a create and an edit, so the fields never carry a
        // previous course's values into a new one.
        key={course?.id ?? "new"}
        defaultValues={course ? toFormValues(course) : EMPTY_COURSE_FORM}
        submitLabel={editing ? "Save changes" : "Create course"}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveFormDialog>
  );
}
