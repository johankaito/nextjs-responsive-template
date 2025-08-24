import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/types/drizzle.ts",
  out: "./drizzle",
  dbCredentials: {
    // Use the service role key for migrations
    url: process.env.DATABASE_URL || 
         `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')?.replace('.supabase.co', '')}.supabase.co:5432/postgres`,
  },
});