CREATE TABLE "entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"properties" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
