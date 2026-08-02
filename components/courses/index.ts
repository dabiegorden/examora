/**
 * Course management UI.
 *
 * `CoursesView` is the only entry point a page needs; the form and its modal
 * are exported for reuse by surfaces that create a course outside the list.
 */

export { CourseForm, type CourseFormProps } from "./course-form";
export { CourseFormDialog, type CourseFormDialogProps } from "./course-form-dialog";
export { CoursesView, type CoursesViewProps } from "./courses-view";
