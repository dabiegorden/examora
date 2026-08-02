"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AppField,
  AppForm,
  AppFormActions,
  AppInput,
  AppTextarea,
} from "@/components/app/forms";
import { ActionButton, PrimaryButton } from "@/components/app/actions";
import { LIMITS } from "@/constants/app";
import {
  courseFormSchema,
  EMPTY_COURSE_FORM,
  type CourseFormValues,
} from "@/validators/course";
import type { ActionResult } from "@/types/common";

/**
 * The create/edit course form.
 *
 * One component serves both: an edit is the same fields with values in them, so
 * a second copy would only be a second place for the two to drift apart.
 *
 * Validation runs against `courseFormSchema` for instant feedback, but the
 * server re-validates everything and owns the rules it alone can check — chiefly
 * whether the code is already used by another of this teacher's courses. Those
 * come back as `fieldErrors` and are attached to the field that caused them.
 */

export interface CourseFormProps {
  defaultValues?: CourseFormValues;
  submitLabel: string;
  /** Runs the server action. Resolving with a failure keeps the form open. */
  onSubmit: (values: CourseFormValues) => Promise<ActionResult<unknown>>;
  onCancel: () => void;
}

/** Field names the server may report against, so unknown keys are not swallowed. */
const FORM_FIELDS: ReadonlyArray<keyof CourseFormValues> = [
  "title",
  "code",
  "description",
  "academicYear",
];

export function CourseForm({
  defaultValues = EMPTY_COURSE_FORM,
  submitLabel,
  onSubmit,
  onCancel,
}: CourseFormProps) {
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const submitting = form.formState.isSubmitting;

  const handleSubmit = async (values: CourseFormValues) => {
    setFormError(null);
    const result = await onSubmit(values);
    if (result.success) return;

    const { fieldErrors, message } = result.error;
    let attached = false;

    for (const field of FORM_FIELDS) {
      const messages = fieldErrors?.[field];
      if (!messages?.length) continue;
      form.setError(field, { type: "server", message: messages[0] });
      attached = true;
    }

    // A conflict on the course code arrives as a plain message, not a field
    // error. Pin it to the code field, since that is what has to change.
    if (!attached && /course code|code /i.test(message)) {
      form.setError("code", { type: "server", message });
      return;
    }

    if (!attached) setFormError(message);
  };

  return (
    <AppForm form={form} onSubmit={handleSubmit} error={formError}>
      <AppField<CourseFormValues, "title">
        name="title"
        label="Course name"
        required
        description="What your students will see in their course list."
      >
        {({ field, aria }) => (
          <AppInput
            placeholder="Introduction to Physics"
            autoComplete="off"
            maxLength={LIMITS.COURSE_TITLE_MAX}
            {...field}
            {...aria}
          />
        )}
      </AppField>

      <div className="grid gap-5 sm:grid-cols-2">
        <AppField<CourseFormValues, "code">
          name="code"
          label="Course code"
          required
          description="Unique across your courses."
        >
          {({ field, aria }) => (
            <AppInput
              placeholder="PHY101"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={LIMITS.COURSE_CODE_MAX}
              className="uppercase"
              {...field}
              // Upper-cased as it is typed, so what the teacher sees is what
              // gets stored — the schema would otherwise silently change it.
              onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              {...aria}
            />
          )}
        </AppField>

        <AppField<CourseFormValues, "academicYear">
          name="academicYear"
          label="Academic year"
          description="Optional. For example 2025/2026."
        >
          {({ field, aria }) => (
            <AppInput
              placeholder="2025/2026"
              inputMode="numeric"
              autoComplete="off"
              maxLength={9}
              {...field}
              {...aria}
            />
          )}
        </AppField>
      </div>

      <AppField<CourseFormValues, "description">
        name="description"
        label="Description"
        description="Optional. A sentence or two about what this course covers."
      >
        {({ field, aria }) => (
          <AppTextarea
            placeholder="Mechanics, waves, and thermodynamics for first-year students."
            maxLength={LIMITS.COURSE_DESCRIPTION_MAX}
            {...field}
            {...aria}
          />
        )}
      </AppField>

      <AppFormActions>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </ActionButton>
        <PrimaryButton type="submit" loading={submitting} loadingLabel="Saving">
          {submitLabel}
        </PrimaryButton>
      </AppFormActions>
    </AppForm>
  );
}
