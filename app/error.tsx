"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="overflow-hidden border-border p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" aria-hidden />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              Something went wrong
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. You can try again or return to the journal.
            </p>
            {process.env.NODE_ENV === "development" && error?.message && (
              <pre className="w-full overflow-auto rounded-md border border-border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
                {error.message}
              </pre>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={reset}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Try again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to journal</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
