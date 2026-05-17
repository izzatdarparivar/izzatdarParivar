"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-amber-50/50">
        <h2 className="font-serif text-3xl font-bold text-amber-950 mb-3">
          Fatal System Error
        </h2>
        <p className="text-amber-800 max-w-md mb-8">
          A critical system error occurred. We are working to restore service immediately.
        </p>
        <button
          onClick={() => reset()}
          className="bg-amber-700 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-amber-800 transition"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
