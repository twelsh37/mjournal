import { Suspense } from "react";
import { JournalClient } from "@/components/JournalClient";

export default function Home() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-6 py-8 text-muted-foreground">Loading…</div>}>
      <JournalClient />
    </Suspense>
  );
}
