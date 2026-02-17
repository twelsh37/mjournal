"use server";

import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export type JournalEntryForUI = {
  id: string;
  date: string;
  heading?: string;
  content: string;
  imageDataUrl?: string;
  diagramDataUrl?: string;
  createdAt: number;
};

function rowToEntry(row: {
  id: number;
  date: string;
  heading: string | null;
  content: string;
  imageDataUrl: string | null;
  diagramDataUrl: string | null;
  createdAt: Date;
}): JournalEntryForUI {
  return {
    id: String(row.id),
    date: row.date,
    heading: row.heading ?? undefined,
    content: row.content,
    imageDataUrl: row.imageDataUrl ?? undefined,
    diagramDataUrl: row.diagramDataUrl ?? undefined,
    createdAt: new Date(row.createdAt).getTime(),
  };
}

export async function getEntries(): Promise<JournalEntryForUI[]> {
  const rows = await db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.date), desc(journalEntries.createdAt));
  return rows.map(rowToEntry);
}

export async function createEntry(params: {
  date: string;
  heading?: string;
  content: string;
  imageDataUrl?: string;
  diagramDataUrl?: string;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      return { success: false, error: "Only the admin can add entries. Please sign in." };
    }
    const [row] = await db
      .insert(journalEntries)
      .values({
        date: params.date,
        heading: params.heading ?? null,
        content: params.content || "(No text)",
        imageDataUrl: params.imageDataUrl ?? null,
        diagramDataUrl: params.diagramDataUrl ?? null,
      })
      .returning({ id: journalEntries.id });
    if (!row) return { success: false, error: "Insert failed" };
    return { success: true, id: String(row.id) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateEntry(
  id: string,
  params: {
    date: string;
    heading?: string;
    content: string;
    imageDataUrl?: string | null;
    diagramDataUrl?: string | null;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      return { success: false, error: "Only the admin can edit entries. Please sign in." };
    }
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return { success: false, error: "Invalid id" };
    await db
      .update(journalEntries)
      .set({
        date: params.date,
        heading: params.heading ?? null,
        content: params.content || "(No text)",
        imageDataUrl: params.imageDataUrl ?? null,
        diagramDataUrl: params.diagramDataUrl ?? null,
      })
      .where(eq(journalEntries.id, numId));
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteEntry(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      return { success: false, error: "Only the admin can delete entries. Please sign in." };
    }
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return { success: false, error: "Invalid id" };
    await db.delete(journalEntries).where(eq(journalEntries.id, numId));
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
