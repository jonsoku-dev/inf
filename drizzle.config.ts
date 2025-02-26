import { defineConfig } from "drizzle-kit";
console.log(process.env.DATABASE_URL!)
export default defineConfig({
  schema: "./app/features/**/schema.ts",
  out: "./app/sql/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
