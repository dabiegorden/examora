# Services

Business logic that spans more than one repository.

This folder is intentionally empty in the backend-foundation phase — the rules
that belong here (grading a submission, enforcing the exam window, running a
bulk import) arrive with the features that need them. Creating speculative
services now would mean guessing at behaviour before it is specified.

## The boundary

| Layer            | Owns                                                    | May import         |
| ---------------- | ------------------------------------------------------- | ------------------ |
| `db/`            | Schema, client, primitive lookups                        | —                  |
| `repositories/`  | All queries for one entity                               | `db/`              |
| `services/`      | Multi-entity rules, orchestration, transactions          | `repositories/`    |
| `actions/`       | Server actions: authorize → validate → call a service    | `services/`        |
| `app/`           | Rendering                                                | `actions/`, `repositories/` (reads) |

A service never builds a query — that is the repository's job. An action never
contains business rules — that is the service's job.

## What lands here next

- `auth.service.ts` — sign-in, single-device enforcement, session lifecycle
- `exam.service.ts` — publishing preconditions, the sitting window
- `attempt.service.ts` — start/resume, auto-save, grading, auto-submission
- `import.service.ts` — CSV/Excel roster and question-bank ingestion
- `analytics.service.ts` — per-question difficulty, cohort distribution
