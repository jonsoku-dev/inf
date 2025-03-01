CREATE TYPE "public"."application_status" AS ENUM('approved', 'rejected', 'completed', 'pending');--> statement-breakpoint
ALTER TABLE "applications" RENAME COLUMN "status" TO "application_status";