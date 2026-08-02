# Server Actions

Mutation entry points called from client components.

Empty during the backend-foundation phase: actions are the boundary between the
UI and the domain, and there is no UI yet. The infrastructure they will use is
already in place.

## The shape every action takes

```ts
"use server";

export async function createCourseAction(
  input: unknown
): Promise<ActionResult<Course>> {
  // 1. Authorize first — never trust an id from the client.
  const teacher = await requireTeacher();

  // 2. Validate. `parseOrThrow` raises a ValidationError with field errors.
  const data = parseOrThrow(createCourseSchema, input);

  // 3. Delegate. No queries and no business rules inline.
  try {
    const course = await CourseRepository.create(teacher.id, data);
    revalidatePath("/dashboard/courses");
    return ok(course);
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}
```

## Rules

- Return `ActionResult<T>` (`types/common.ts`) rather than throwing across the
  boundary, so the form can render the failure.
- Authorize before validating. Validation errors on a resource the caller cannot
  see are themselves an information leak.
- Route handlers (`app/api/**`) only for things actions cannot do: webhooks,
  file downloads, third-party callbacks.
