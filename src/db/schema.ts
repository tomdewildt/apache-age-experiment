import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  properties: jsonb("properties").notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
