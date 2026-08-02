ALTER TYPE "public"."audit_action" ADD VALUE 'COURSE_CREATED' BEFORE 'EXAM_PUBLISHED';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'COURSE_UPDATED' BEFORE 'EXAM_PUBLISHED';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'COURSE_ARCHIVED' BEFORE 'EXAM_PUBLISHED';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'COURSE_RESTORED' BEFORE 'EXAM_PUBLISHED';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'COURSE_DELETED' BEFORE 'EXAM_PUBLISHED';--> statement-breakpoint
DROP INDEX "courses_teacher_code_unique_idx";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "courses_deleted_at_idx" ON "courses" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_teacher_code_unique_idx" ON "courses" USING btree ("teacher_id","code") WHERE "courses"."deleted_at" is null;