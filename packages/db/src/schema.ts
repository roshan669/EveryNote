import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth-schema";

export const Todo = pgTable("todo", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  created_at: t.timestamp().defaultNow().notNull(),
  completed: t.boolean().notNull().default(false),
  updated_at: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
  owner: t.text("owner_id") // Use a more descriptive column name like 'owner_id'
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
}));

export const CreateTodoSchema = createInsertSchema(Todo, {
  title: z.string().max(256).min(1, "Title is required"),
  content: z.string().max(256).min(1, "Content is required"),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
  completed: true,
  owner: true,
});

export * from "./auth-schema"