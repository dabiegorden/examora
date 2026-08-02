/** Pagination defaults applied by `normalizePagination`. */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
} as const;

/** Bounds enforced by the validators and, where cheap, by the schema. */
export const LIMITS = {
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 120,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,

  COURSE_TITLE_MIN: 2,
  COURSE_TITLE_MAX: 160,
  COURSE_CODE_MIN: 2,
  COURSE_CODE_MAX: 24,
  COURSE_DESCRIPTION_MAX: 2_000,

  EXAM_TITLE_MIN: 2,
  EXAM_TITLE_MAX: 160,
  EXAM_INSTRUCTIONS_MAX: 5_000,
  EXAM_DURATION_MIN_MINUTES: 1,
  EXAM_DURATION_MAX_MINUTES: 8 * 60,
  QUESTION_DURATION_MIN_SECONDS: 5,
  QUESTION_DURATION_MAX_SECONDS: 60 * 60,

  QUESTION_TEXT_MIN: 1,
  QUESTION_TEXT_MAX: 4_000,
  QUESTION_MARKS_MIN: 1,
  QUESTION_MARKS_MAX: 100,

  OPTION_TEXT_MIN: 1,
  OPTION_TEXT_MAX: 1_000,
  /** A multiple-choice question needs at least two options to be a choice. */
  OPTIONS_PER_QUESTION_MIN: 2,
  OPTIONS_PER_QUESTION_MAX: 8,

  STUDENT_NUMBER_MIN: 1,
  STUDENT_NUMBER_MAX: 40,

  /** Cap on a single bulk student import. */
  BULK_IMPORT_MAX_ROWS: 2_000,
} as const;

/** How long a sign-in session stays valid. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * An attempt with no heartbeat for this long is treated as abandoned and is
 * eligible for auto-submission by the sweeper.
 */
export const ATTEMPT_STALE_AFTER_MS = 5 * 60 * 1000;
