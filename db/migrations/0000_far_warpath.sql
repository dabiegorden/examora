CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'submitted', 'auto_submitted');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_REVOKED', 'EXAM_PUBLISHED', 'EXAM_STARTED', 'QUESTION_ANSWERED', 'TAB_SWITCH', 'FULLSCREEN_EXIT', 'EXAM_SUBMITTED', 'AUTO_SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('draft', 'published', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('teacher', 'student');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"student_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"title" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"academic_year" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_students" (
	"course_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_students_course_id_student_id_pk" PRIMARY KEY("course_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text,
	"status" "exam_status" DEFAULT 'draft' NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"overall_duration_minutes" integer DEFAULT 60 NOT NULL,
	"question_duration_seconds" integer,
	"randomize_questions" boolean DEFAULT true NOT NULL,
	"randomize_options" boolean DEFAULT true NOT NULL,
	"allow_review" boolean DEFAULT true NOT NULL,
	"allow_results_immediately" boolean DEFAULT false NOT NULL,
	"fullscreen_required" boolean DEFAULT true NOT NULL,
	"auto_submit" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"question" text NOT NULL,
	"marks" integer DEFAULT 1 NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"percentage" numeric(5, 2),
	"tab_switch_count" integer DEFAULT 0 NOT NULL,
	"fullscreen_exit_count" integer DEFAULT 0 NOT NULL,
	"last_activity" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "active_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"exam_id" uuid,
	"action" "audit_action" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_students" ADD CONSTRAINT "course_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_selected_option_id_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "students_user_id_unique_idx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_student_number_unique_idx" ON "students" USING btree ("student_number");--> statement-breakpoint
CREATE INDEX "students_created_at_idx" ON "students" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_teacher_code_unique_idx" ON "courses" USING btree ("teacher_id","code");--> statement-breakpoint
CREATE INDEX "courses_teacher_id_idx" ON "courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "courses_is_archived_idx" ON "courses" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "course_students_course_id_idx" ON "course_students" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_students_student_id_idx" ON "course_students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "exams_course_id_idx" ON "exams" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "exams_status_idx" ON "exams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exams_created_at_idx" ON "exams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exams_start_time_idx" ON "exams" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "exams_course_status_idx" ON "exams" USING btree ("course_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_exam_order_unique_idx" ON "questions" USING btree ("exam_id","order");--> statement-breakpoint
CREATE INDEX "questions_exam_id_idx" ON "questions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "questions_created_at_idx" ON "questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "options_question_id_idx" ON "options" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempts_exam_student_unique_idx" ON "attempts" USING btree ("exam_id","student_id");--> statement-breakpoint
CREATE INDEX "attempts_exam_id_idx" ON "attempts" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "attempts_student_id_idx" ON "attempts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "attempts_status_idx" ON "attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attempts_started_at_idx" ON "attempts" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "attempts_exam_status_idx" ON "attempts" USING btree ("exam_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "answers_attempt_question_unique_idx" ON "answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "answers_attempt_id_idx" ON "answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "answers_question_id_idx" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "active_sessions_token_unique_idx" ON "active_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "active_sessions_user_id_idx" ON "active_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "active_sessions_expires_at_idx" ON "active_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_exam_id_idx" ON "audit_logs" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_exam_created_at_idx" ON "audit_logs" USING btree ("exam_id","created_at");