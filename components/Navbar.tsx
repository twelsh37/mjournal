import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-14 w-full items-center" aria-label="Main">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground no-underline"
          >
            m&apos;Journal
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/?historical=1"
              className="text-sm font-medium text-muted-foreground no-underline hover:text-foreground"
            >
              Historical Entry
            </Link>
            <Link
              href="/?new=1"
              className="text-sm font-medium text-muted-foreground no-underline hover:text-foreground"
            >
              New Entry
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
