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
import { Trash2, Pencil } from "lucide-react";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  type JournalEntryForUI,
} from "@/app/actions/journal";
import { useAuth } from "@/components/AuthProvider";

export type JournalEntry = JournalEntryForUI;

function formatEntryDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Week key (Sunday–Saturday) for a YYYY-MM-DD date string; returns the Sunday of that week. */
function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function JournalClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
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
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editHeading, setEditHeading] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editDiagramFile, setEditDiagramFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editDiagramPreview, setEditDiagramPreview] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const modalOpen = searchParams.get("new") === "1";
  const historicalModalOpen = searchParams.get("historical") === "1";
  const deleteModalOpen = deleteEntryId !== null;

  // Non-admin: don't show add-entry modals (clear URL if they opened via direct link)
  useEffect(() => {
    if (isAdmin) return;
    if (modalOpen || historicalModalOpen) {
      router.replace("/", { scroll: false });
    }
  }, [isAdmin, modalOpen, historicalModalOpen, router]);

  const refreshEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const list = await getEntries();
      setEntries(list);
    } catch (err) {
      setEntriesError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const closeModal = useCallback(() => {
    router.replace("/", { scroll: false });
    setPostError(null);
    setHeading("");
    setContent("");
    setImageFile(null);
    setDiagramFile(null);
    setImagePreview(null);
    setDiagramPreview(null);
  }, [router]);

  const closeHistoricalModal = useCallback(() => {
    router.replace("/", { scroll: false });
    setPostError(null);
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
      setPostError(null);
      const headingTrimmed = heading.trim();
      const text = content.trim();
      if (!headingTrimmed && !text && !imageFile && !diagramFile) return;

      const today = new Date().toISOString().slice(0, 10);
      let imageDataUrl: string | undefined;
      let diagramDataUrl: string | undefined;
      if (imageFile) imageDataUrl = await readFileAsDataUrl(imageFile);
      if (diagramFile) diagramDataUrl = await readFileAsDataUrl(diagramFile);

      const result = await createEntry({
        date: today,
        heading: headingTrimmed || undefined,
        content: text || "(No text)",
        imageDataUrl,
        diagramDataUrl,
      });
      if (!result.success) {
        setPostError(result.error);
        return;
      }
      await refreshEntries();
      closeModal();
    },
    [heading, content, imageFile, diagramFile, closeModal, refreshEntries]
  );

  const handleHistoricalPost = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPostError(null);
      const headingTrimmed = histHeading.trim();
      const text = histContent.trim();
      if (!headingTrimmed && !text && !histImageFile && !histDiagramFile) return;

      let imageDataUrl: string | undefined;
      let diagramDataUrl: string | undefined;
      if (histImageFile) imageDataUrl = await readFileAsDataUrl(histImageFile);
      if (histDiagramFile)
        diagramDataUrl = await readFileAsDataUrl(histDiagramFile);

      const result = await createEntry({
        date: histDate,
        heading: headingTrimmed || undefined,
        content: text || "(No text)",
        imageDataUrl,
        diagramDataUrl,
      });
      if (!result.success) {
        setPostError(result.error);
        return;
      }
      await refreshEntries();
      closeHistoricalModal();
    },
    [
      histDate,
      histHeading,
      histContent,
      histImageFile,
      histDiagramFile,
      closeHistoricalModal,
      refreshEntries,
    ]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      const result = await deleteEntry(id);
      if (!result.success) return;
      await refreshEntries();
    },
    [refreshEntries]
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteEntryId(null);
    setDeleteConfirmText("");
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteEntryId || deleteConfirmText.trim() !== "Delete me") return;
    await removeEntry(deleteEntryId);
    closeDeleteModal();
  }, [deleteEntryId, deleteConfirmText, removeEntry, closeDeleteModal]);

  const openEditModal = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditDate(entry.date);
    setEditHeading(entry.heading ?? "");
    setEditContent(entry.content);
    setEditImageFile(null);
    setEditDiagramFile(null);
    setEditImagePreview(entry.imageDataUrl ?? null);
    setEditDiagramPreview(entry.diagramDataUrl ?? null);
    setEditError(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingEntry(null);
    setEditDate("");
    setEditHeading("");
    setEditContent("");
    setEditImageFile(null);
    setEditDiagramFile(null);
    setEditImagePreview(null);
    setEditDiagramPreview(null);
    setEditError(null);
  }, []);

  const handleEditImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setEditImageFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setEditImagePreview);
      } else {
        setEditImagePreview(editingEntry?.imageDataUrl ?? null);
      }
    },
    [editingEntry?.imageDataUrl]
  );

  const handleEditDiagramChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setEditDiagramFile(file ?? null);
      if (file) {
        readFileAsDataUrl(file).then(setEditDiagramPreview);
      } else {
        setEditDiagramPreview(editingEntry?.diagramDataUrl ?? null);
      }
    },
    [editingEntry?.diagramDataUrl]
  );

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingEntry) return;
      setEditError(null);
      const headingTrimmed = editHeading.trim();
      const text = editContent.trim();
      if (!headingTrimmed && !text && !editImageFile && !editDiagramFile && !editingEntry.imageDataUrl && !editingEntry.diagramDataUrl) return;

      let imageDataUrl: string | null | undefined = editingEntry.imageDataUrl ?? null;
      let diagramDataUrl: string | null | undefined = editingEntry.diagramDataUrl ?? null;
      if (editImageFile) imageDataUrl = await readFileAsDataUrl(editImageFile);
      else imageDataUrl = editImagePreview ?? null;
      if (editDiagramFile) diagramDataUrl = await readFileAsDataUrl(editDiagramFile);
      else diagramDataUrl = editDiagramPreview ?? null;

      const result = await updateEntry(editingEntry.id, {
        date: editDate,
        heading: headingTrimmed || undefined,
        content: text || "(No text)",
        imageDataUrl,
        diagramDataUrl,
      });
      if (!result.success) {
        setEditError(result.error);
        return;
      }
      await refreshEntries();
      closeEditModal();
    },
    [
      editingEntry,
      editDate,
      editHeading,
      editContent,
      editImageFile,
      editDiagramFile,
      editImagePreview,
      editDiagramPreview,
      closeEditModal,
      refreshEntries,
    ]
  );

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });

  return (
    <>
      <div className="min-h-[calc(100vh-3.5rem)] w-full bg-background">
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <p className="font-sans text-[14pt] leading-relaxed text-foreground/90 max-w-2xl">
              Welcome to my online journal—a place where I capture my day-to-day life in tech. The highs, the lows, the breakthroughs, the dead ends, and everything in between. No polish, just notes and reflections as I remember them.
              <span className="block mt-3">You never know I might actually update this.</span>
            </p>
            <div
              className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-5 py-3 shadow-sm"
              aria-label={`${entries.length} post${entries.length === 1 ? "" : "s"} in the journal`}
            >
              <span className="text-sm font-medium text-muted-foreground">Number of Entries</span>
              <span className="font-heading text-2xl font-bold tabular-nums text-brand">
                {entriesLoading ? "—" : entries.length}
              </span>
            </div>
          </div>
          <hr className="my-8 border-border" aria-hidden="true" />
          {entriesLoading ? (
            <p className="text-muted-foreground">Loading entries…</p>
          ) : entriesError ? (
            <p className="text-destructive">{entriesError}</p>
          ) : sortedEntries.length > 0 ? (
            <ul className="space-y-6" aria-label="Journal entries">
              {sortedEntries.flatMap((entry, i) => {
                const weekKey = getWeekKey(entry.date);
                const prevWeekKey = i > 0 ? getWeekKey(sortedEntries[i - 1].date) : null;
                const showWeekHr = prevWeekKey !== null && weekKey !== prevWeekKey;
                return [
                  ...(showWeekHr
                    ? [
                        <li key={`week-${weekKey}`} className="list-none" aria-hidden="true">
                          <hr className="my-8 border-2 border-brand" />
                        </li>,
                      ]
                    : []),
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
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:bg-brand/15 hover:text-brand"
                            onClick={() => openEditModal(entry)}
                            aria-label="Edit entry"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setDeleteEntryId(entry.id);
                              setDeleteConfirmText("");
                            }}
                            aria-label="Delete entry"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                  </li>,
                ];
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No entries yet. Click &quot;New Entry&quot; in the menu to add one.
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[32rem]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
          </DialogHeader>
          {postError && (
            <p className="text-sm text-destructive">{postError}</p>
          )}
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
      )}

      {isAdmin && (
      <Dialog
        open={historicalModalOpen}
        onOpenChange={(open) => !open && closeHistoricalModal()}
      >
        <DialogContent className="sm:max-w-[32rem]" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Historical Entry</DialogTitle>
          </DialogHeader>
          {postError && (
            <p className="text-sm text-destructive">{postError}</p>
          )}
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
      )}

      {isAdmin && editingEntry && (
      <Dialog open={true} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-h-[75vh] max-w-[min(32rem,75vw)] overflow-hidden" style={{ display: "flex", flexDirection: "column" }} showCloseButton={true}>
          <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Edit entry</DialogTitle>
          </DialogHeader>
          {editError && (
            <p className="shrink-0 text-sm text-destructive">{editError}</p>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">
          <form onSubmit={handleEditSubmit} id="edit-entry-form">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="edit-date" className="text-sm font-medium text-foreground">
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Entry date"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-heading" className="text-sm font-medium text-foreground">
                  Heading
                </label>
                <input
                  id="edit-heading"
                  type="text"
                  placeholder="Entry title"
                  value={editHeading}
                  onChange={(e) => setEditHeading(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-body" className="text-sm font-medium text-foreground">
                  Body
                </label>
                <Textarea
                  id="edit-body"
                  placeholder="Write in **markdown**… headings, lists, code, links."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[160px] resize-y font-mono text-sm"
                  rows={6}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add image
                  </span>
                  {(editImagePreview || editImageFile) && (
                    <span className="text-xs">1 image selected</span>
                  )}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditDiagramChange}
                    className="sr-only"
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                  >
                    Add diagram
                  </span>
                  {(editDiagramPreview || editDiagramFile) && (
                    <span className="text-xs">1 diagram selected</span>
                  )}
                </label>
              </div>
              {(editImagePreview || editDiagramPreview) && (
                <div className="flex flex-wrap gap-4">
                  {editImagePreview && (
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                  {editDiagramPreview && (
                    <img
                      src={editDiagramPreview}
                      alt="Diagram preview"
                      className="h-24 w-auto rounded border border-border object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </form>
          </div>
          <DialogFooter className="shrink-0" showCloseButton={false}>
            <Button type="button" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit" form="edit-entry-form">
              Save changes
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      )}

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
