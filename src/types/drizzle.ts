import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Example User Profile Table
 * Extends Supabase Auth with additional user data
 * 
 * Modify this schema to fit your application needs
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // References auth.users.id
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Example Posts Table
 * Demonstrates a basic content table with user relations
 */
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  content: text("content"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(profiles, {
    fields: [posts.userId],
    references: [profiles.id],
  }),
}));

// Export types for use in application
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: NewProfile;
        Update: Partial<NewProfile>;
      };
      posts: {
        Row: Post;
        Insert: NewPost;
        Update: Partial<NewPost>;
      };
    };
  };
};