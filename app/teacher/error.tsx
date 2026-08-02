"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/dashboard/error-state";
import { PageHeader } from "@/components/dashboard/page-header";

/**
 * Route error boundary for the whole teacher area.
 *
 * The real error is logged for the operator; the user sees a plain explanation
 * and a retry, never a stack trace.
 */
export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[examora] dashboard route error:", error);
  }, [error]);

  return (
    <>
      <PageHeader title="Something went wrong" />
      <ErrorState onRetry={reset} />
    </>
  );
}
