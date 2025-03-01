ALTER TABLE "public"."influencer_profiles" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."gender";--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
ALTER TABLE "public"."influencer_profiles" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
DROP TYPE "public"."influencer_category";--> statement-breakpoint
CREATE TYPE "public"."influencer_category" AS ENUM('FASHION', 'BEAUTY', 'FOOD', 'TRAVEL', 'TECH', 'GAME', 'ENTERTAINMENT', 'LIFESTYLE', 'PARENTING', 'PETS', 'OTHER');