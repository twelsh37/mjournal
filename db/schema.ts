import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  date,
} from "drizzle-orm/pg-core";

/**
 * Journal entries (optional starter schema).
 * Run `npm run db:generate` then `npm run db:push` or `npm run db:migrate` to apply.
 */
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  heading: varchar("heading", { length: 512 }),
  content: text("content").notNull().default(""),
  imageDataUrl: text("image_data_url"),
  diagramDataUrl: text("diagram_data_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
