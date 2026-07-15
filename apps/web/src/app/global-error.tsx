"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body className="font-sans antialiased">
        {/* This boundary replaces the entire root layout, so LocaleProvider/ThemeProvider
            are unavailable here — text is hardcoded English rather than using t(). */}
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. You can try again, or head back to the homepage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
