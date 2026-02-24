import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="overflow-hidden border-border p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="size-6" aria-hidden />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              Page not found
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              The page you’re looking for doesn’t exist or has been moved.
            </p>
            <Button asChild className="mt-2 bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/">Back to journal</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
