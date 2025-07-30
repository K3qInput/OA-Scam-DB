import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const caseStatusEnum = pgEnum("case_status", [
  "pending",
  "verified",
  "resolved",
  "appealed",
  "rejected",
  "archived"
]);

export const caseTypeEnum = pgEnum("case_type", [
  "financial_scam",
  "identity_theft",
  "fake_services",
  "account_fraud",
  "other"
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);

export const userRoleEnum = pgEnum("user_role", ["admin", "staff", "user"]);

export const appealStatusEnum = pgEnum("appeal_status", [
  "pending",
  "approved",
  "rejected",
  "under_review"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cases table
export const cases = pgTable("cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseNumber: varchar("case_number").unique().notNull(),
  reportedUserId: varchar("reported_user_id").notNull(),
  reporterUserId: varchar("reporter_user_id").notNull(),
  staffUserId: varchar("staff_user_id"),
  type: caseTypeEnum("type").notNull(),
  status: caseStatusEnum("status").default("pending").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  amountInvolved: decimal("amount_involved", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Evidence table
export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alt accounts table
export const altAccounts = pgTable("alt_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryUserId: varchar("primary_user_id").notNull(),
  altUserId: varchar("alt_user_id").notNull(),
  connectionType: varchar("connection_type").notNull(), // "suspected", "confirmed", "reported"
  evidence: text("evidence"),
  reportedBy: varchar("reported_by").notNull(),
  verifiedBy: varchar("verified_by"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Appeals table
export const appeals = pgTable("appeals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  appealedBy: varchar("appealed_by").notNull(),
  reason: text("reason").notNull(),
  status: appealStatusEnum("status").default("pending").notNull(),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Password reset requests table
export const passwordResetRequests = pgTable("password_reset_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").default("pending").notNull(), // "pending", "approved", "rejected"
  approvedBy: varchar("approved_by"),
  token: varchar("token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

// Case updates/timeline table
export const caseUpdates = pgTable("case_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  updatedBy: varchar("updated_by").notNull(),
  updateType: varchar("update_type").notNull(), // "status_change", "comment", "evidence_added", etc.
  oldValue: text("old_value"),
  newValue: text("new_value"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reportedCases: many(cases, { relationName: "reportedUser" }),
  reporterCases: many(cases, { relationName: "reporterUser" }),
  staffCases: many(cases, { relationName: "staffUser" }),
  appeals: many(appeals),
  altAccountsAsPrimary: many(altAccounts, { relationName: "primaryUser" }),
  altAccountsAsAlt: many(altAccounts, { relationName: "altUser" }),
  passwordResetRequests: many(passwordResetRequests),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  reportedUser: one(users, {
    fields: [cases.reportedUserId],
    references: [users.id],
    relationName: "reportedUser",
  }),
  reporterUser: one(users, {
    fields: [cases.reporterUserId],
    references: [users.id],
    relationName: "reporterUser",
  }),
  staffUser: one(users, {
    fields: [cases.staffUserId],
    references: [users.id],
    relationName: "staffUser",
  }),
  evidence: many(evidence),
  appeals: many(appeals),
  updates: many(caseUpdates),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  case: one(cases, {
    fields: [evidence.caseId],
    references: [cases.id],
  }),
  uploadedByUser: one(users, {
    fields: [evidence.uploadedBy],
    references: [users.id],
  }),
}));

export const altAccountsRelations = relations(altAccounts, ({ one }) => ({
  primaryUser: one(users, {
    fields: [altAccounts.primaryUserId],
    references: [users.id],
    relationName: "primaryUser",
  }),
  altUser: one(users, {
    fields: [altAccounts.altUserId],
    references: [users.id],
    relationName: "altUser",
  }),
  reportedByUser: one(users, {
    fields: [altAccounts.reportedBy],
    references: [users.id],
  }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  case: one(cases, {
    fields: [appeals.caseId],
    references: [cases.id],
  }),
  appealedByUser: one(users, {
    fields: [appeals.appealedBy],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [appeals.reviewedBy],
    references: [users.id],
  }),
}));

export const passwordResetRequestsRelations = relations(passwordResetRequests, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetRequests.userId],
    references: [users.id],
  }),
}));

export const caseUpdatesRelations = relations(caseUpdates, ({ one }) => ({
  case: one(cases, {
    fields: [caseUpdates.caseId],
    references: [cases.id],
  }),
  updatedByUser: one(users, {
    fields: [caseUpdates.updatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  caseNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({
  id: true,
  createdAt: true,
});

export const insertAltAccountSchema = createInsertSchema(altAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetRequestSchema = createInsertSchema(passwordResetRequests).omit({
  id: true,
  createdAt: true,
  token: true,
  expiresAt: true,
});

export const insertCaseUpdateSchema = createInsertSchema(caseUpdates).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type AltAccount = typeof altAccounts.$inferSelect;
export type InsertAltAccount = z.infer<typeof insertAltAccountSchema>;
export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type PasswordResetRequest = typeof passwordResetRequests.$inferSelect;
export type InsertPasswordResetRequest = z.infer<typeof insertPasswordResetRequestSchema>;
export type CaseUpdate = typeof caseUpdates.$inferSelect;
export type InsertCaseUpdate = z.infer<typeof insertCaseUpdateSchema>;
export type LoginData = z.infer<typeof loginSchema>;
