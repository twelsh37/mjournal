export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="h-[4.5rem] w-full max-w-2xl animate-pulse rounded-md bg-muted/60" />
          <div className="h-16 w-24 shrink-0 animate-pulse rounded-xl bg-muted/60" />
        </div>
        <hr className="my-8 border-border" aria-hidden="true" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-border bg-muted/40"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
