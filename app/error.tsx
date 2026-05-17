"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-[var(--on-surface)] mb-3">
        Something went wrong!
      </h2>
      <p className="text-[var(--on-surface-variant)] max-w-md mb-8 text-sm sm:text-base">
        We apologize for the inconvenience. Our technical team has been notified.
        Please try refreshing the page or navigating back.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 rounded-full px-6 shadow-md"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/"}
          className="rounded-full px-6 border-[var(--outline-variant)]"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
