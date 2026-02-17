"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EntryMarkdown } from "@/components/EntryMarkdown";
import { Trash2 } from "lucide-react";

const STORAGE_KEY = "work-journal-entries";

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  heading?: string;
  content: string;
  imageDataUrl?: string;
  diagramDataUrl?: string;
  createdAt: number;
};

function formatEntryDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function loadEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function JournalClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [diagramFile, setDiagramFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diagramPreview, setDiagramPreview] = useState<string | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [histDate, setHistDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [histHeading, setHistHeading] = useState("");
  const [histContent, setHistContent] = useState("");
  const [histImageFile, setHistImageFile] = useState<File | null>(null);
  const [histDiagramFile, setHistDiagramFile] = useState<File | null>(null);
  const [histImagePreview, setHistImagePreview] = useState<string | null>(null);
  const [histDiagramPreview, setHistDiagramPreview] = useState<string | null>(null);

  const modalOpen = searchParams.get("new") === "1";
  const historicalModalOpen = searchParams.get("historical") === "1";
  const deleteModalOpen = deleteEntryId !== null;

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const closeModal = useCallback(() => {
    router.replace("/", { scroll: false });
    setHeading("");
    setContent("");
    setImageFile(null);
    setDiagramFile(null);
    setImagePreview(null);
    setDiagramPreview(null);
  }, [router]);

  const closeHistoricalModal = useCallback(() => {
    router.replace("/", { scroll: false });
    setHistDate(new Date().toISOString().slice(0, 10));
    setHistHeading("");
    setHistContent("");
    setHistImageFile(null);
    setHistDiagramFile(null);
    setHistImagePreview(null);
    setHistDiagramPreview(null);
  }, [router]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImageFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setImagePreview);
      } else {
        setImagePreview(null);
      }
    },
    []
  );

  const handleDiagramChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setDiagramFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setDiagramPreview);
      } else {
        setDiagramPreview(null);
      }
    },
    []
  );

  const handleHistImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setHistImageFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setHistImagePreview);
      } else {
        setHistImagePreview(null);
      }
    },
    []
  );

  const handleHistDiagramChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setHistDiagramFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setHistDiagramPreview);
      } else {
        setHistDiagramPreview(null);
      }
    },
    []
  );

  const handlePost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const headingTrimmed = heading.trim();
      const text = content.trim();
      if (!headingTrimmed && !text && !imageFile && !diagramFile) return;

      const today = new Date().toISOString().slice(0, 10);
      let imageDataUrl: string | undefined;
      let diagramDataUrl: string | undefined;
      if (imageFile) imageDataUrl = await readFileAsDataUrl(imageFile);
      if (diagramFile) diagramDataUrl = await readFileAsDataUrl(diagramFile);

      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: today,
        heading: headingTrimmed || undefined,
        content: text || "(No text)",
        imageDataUrl,
        diagramDataUrl,
        createdAt: Date.now(),
      };

      const next = [newEntry, ...entries];
      setEntries(next);
      saveEntries(next);
      closeModal();
    },
    [heading, content, entries, imageFile, diagramFile, closeModal]
  );

  const handleHistoricalPost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const headingTrimmed = histHeading.trim();
      const text = histContent.trim();
      if (!headingTrimmed && !text && !histImageFile && !histDiagramFile) return;

      let imageDataUrl: string | undefined;
      let diagramDataUrl: string | undefined;
      if (histImageFile) imageDataUrl = await readFileAsDataUrl(histImageFile);
      if (histDiagramFile)
        diagramDataUrl = await readFileAsDataUrl(histDiagramFile);

      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: histDate,
        heading: headingTrimmed || undefined,
        content: text || "(No text)",
        imageDataUrl,
        diagramDataUrl,
        createdAt: new Date(histDate + "T12:00:00").getTime(),
      };

      const next = [newEntry, ...entries];
      setEntries(next);
      saveEntries(next);
      closeHistoricalModal();
    },
    [
      histDate,
      histHeading,
      histContent,
      histImageFile,
      histDiagramFile,
      entries,
      closeHistoricalModal,
    ]
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteEntryId(null);
    setDeleteConfirmText("");
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteEntryId && deleteConfirmText.trim() === "Delete me") {
      removeEntry(deleteEntryId);
      closeDeleteModal();
    }
  }, [deleteEntryId, deleteConfirmText, removeEntry, closeDeleteModal]);

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });

  return (
    <>
      <div className="min-h-[calc(100vh-3.5rem)] w-full bg-background">
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          {sortedEntries.length > 0 ? (
            <ul className="space-y-6" aria-label="Journal entries">
              {sortedEntries.map((entry) => (
                <li key={entry.id}>
                  <Card className="overflow-hidden border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          {formatEntryDate(entry.date)}
                        </p>
                        {entry.heading && (
                          <h3 className="mb-2 font-heading text-[20pt] font-bold text-foreground">
                            {entry.heading}
                          </h3>
                        )}
                        <div className="font-sans text-[12pt] text-foreground">
                          <EntryMarkdown content={entry.content} />
                        </div>
                        {(entry.imageDataUrl || entry.diagramDataUrl) && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {entry.imageDataUrl && (
                              <img
                                src={entry.imageDataUrl}
                                alt="Entry attachment"
                                className="max-h-48 w-auto rounded border border-border object-contain"
                              />
                            )}
                            {entry.diagramDataUrl && (
                              <img
                                src={entry.diagramDataUrl}
                                alt="Diagram"
                                className="max-h-48 w-auto rounded border border-border object-contain"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDeleteEntryId(entry.id);
                          setDeleteConfirmText("");
                        }}
                        aria-label="Delete entry"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No entries yet. Click &quot;New Entry&quot; in the menu to add one.
            </p>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[32rem]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePost} id="new-entry-form">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="entry-heading" className="text-sm font-medium text-foreground">
                  Heading
                </label>
                <input
                  id="entry-heading"
                  type="text"
                  placeholder="Entry title"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="entry-body" className="text-sm font-medium text-foreground">
                  Body
                </label>
                <Textarea
                  id="entry-body"
                  placeholder="Write in **markdown**… headings, lists, code, links."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] resize-y font-mono text-sm"
                  rows={6}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add image
                  </span>
                  {imagePreview && (
                    <span className="text-xs">1 image selected</span>
                  )}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiagramChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add diagram
                  </span>
                  {diagramPreview && (
                    <span className="text-xs">1 diagram selected</span>
                  )}
                </label>
              </div>
              {(imagePreview || diagramPreview) && (
                <div className="flex flex-wrap gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                  {diagramPreview && (
                    <img
                      src={diagramPreview}
                      alt="Diagram preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </form>
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button type="submit" form="new-entry-form">
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={historicalModalOpen}
        onOpenChange={(open) => !open && closeHistoricalModal()}
      >
        <DialogContent className="sm:max-w-[32rem]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Historical Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHistoricalPost} id="historical-entry-form">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label
                  htmlFor="hist-date"
                  className="text-sm font-medium text-foreground"
                >
                  Date
                </label>
                <input
                  id="hist-date"
                  type="date"
                  value={histDate}
                  onChange={(e) => setHistDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Entry date"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="hist-heading"
                  className="text-sm font-medium text-foreground"
                >
                  Heading
                </label>
                <input
                  id="hist-heading"
                  type="text"
                  placeholder="Entry title"
                  value={histHeading}
                  onChange={(e) => setHistHeading(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="hist-body"
                  className="text-sm font-medium text-foreground"
                >
                  Body
                </label>
                <Textarea
                  id="hist-body"
                  placeholder="Write in **markdown**… headings, lists, code, links."
                  value={histContent}
                  onChange={(e) => setHistContent(e.target.value)}
                  className="min-h-[160px] resize-y font-mono text-sm"
                  rows={6}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHistImageChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add image
                  </span>
                  {histImagePreview && (
                    <span className="text-xs">1 image selected</span>
                  )}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHistDiagramChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add diagram
                  </span>
                  {histDiagramPreview && (
                    <span className="text-xs">1 diagram selected</span>
                  )}
                </label>
              </div>
              {(histImagePreview || histDiagramPreview) && (
                <div className="flex flex-wrap gap-4">
                  {histImagePreview && (
                    <img
                      src={histImagePreview}
                      alt="Preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                  {histDiagramPreview && (
                    <img
                      src={histDiagramPreview}
                      alt="Diagram preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </form>
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={closeHistoricalModal}
            >
              Cancel
            </Button>
            <Button type="submit" form="historical-entry-form">
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Delete entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This cannot be undone. Type{" "}
              <strong>Delete me</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <input
              type="text"
              placeholder="Delete me"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Type Delete me to confirm"
            />
          </div>
          <DialogFooter showCloseButton={false}>
            <Button type="button" variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteConfirmText.trim() !== "Delete me"}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
