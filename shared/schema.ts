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

export const userRoleEnum = pgEnum("user_role", ["admin", "tribunal_head", "senior_staff", "staff", "user"]);

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
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  // Tribunal staff information
  department: varchar("department"), // "investigation", "review", "appeals", "enforcement"
  specialization: varchar("specialization"), // "financial_crimes", "identity_theft", "cyber_fraud"
  staffId: varchar("staff_id").unique(),
  phoneNumber: varchar("phone_number"),
  officeLocation: varchar("office_location"),
  emergencyContact: varchar("emergency_contact"),
  certifications: text("certifications").array(),
  // Discord OAuth fields
  discordId: varchar("discord_id").unique(),
  discordUsername: varchar("discord_username"),
  discordDiscriminator: varchar("discord_discriminator"),
  discordAvatar: varchar("discord_avatar"),
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
  aiAnalysis: jsonb("ai_analysis"), // AI analysis results
  aiRiskScore: integer("ai_risk_score"), // 1-10 risk assessment
  aiUrgencyLevel: varchar("ai_urgency_level"), // low, medium, high, critical
  moderationAdvice: text("moderation_advice"), // AI-generated advice for mods
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

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: varchar("status").default("new").notNull(), // "new", "in_progress", "resolved", "closed"
  assignedTo: varchar("assigned_to"), // staff member ID
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Staff assignments table
export const staffAssignments = pgTable("staff_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").notNull(),
  caseId: varchar("case_id"),
  contactId: varchar("contact_id"),
  assignmentType: varchar("assignment_type").notNull(), // "primary", "secondary", "reviewer"
  assignedBy: varchar("assigned_by").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Tribunal proceedings table
export const tribunalProceedings = pgTable("tribunal_proceedings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  proceedingType: varchar("proceeding_type").notNull(), // "hearing", "review", "appeal", "final_decision"
  scheduledDate: timestamp("scheduled_date"),
  actualDate: timestamp("actual_date"),
  chairperson: varchar("chairperson").notNull(), // tribunal_head user ID
  panelMembers: text("panel_members").array(), // array of staff IDs
  outcome: varchar("outcome"), // "approved", "rejected", "pending", "deferred"
  decisionReason: text("decision_reason"),
  nextSteps: text("next_steps"),
  documents: text("documents").array(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vouch/Devouch System
export const vouchStatusEnum = pgEnum("vouch_status", ["vouched", "devouched"]);

export const vouches = pgTable("vouches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetUserId: varchar("target_user_id").notNull(), // User being vouched/devouched
  voucherUserId: varchar("voucher_user_id").notNull(), // User making the vouch/devouch
  status: vouchStatusEnum("status").notNull(),
  reason: text("reason").notNull(),
  evidence: text("evidence"), // Optional supporting evidence
  weight: integer("weight").default(1).notNull(), // Vouch weight based on voucher's reputation
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  expiresAt: timestamp("expires_at"), // Vouches can expire
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Public Dispute Resolutions with Anonymous Voting
export const disputeResolutions = pgTable("dispute_resolutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  proposedResolution: text("proposed_resolution").notNull(),
  proposedBy: varchar("proposed_by").notNull(), // Staff member
  isPublic: boolean("is_public").default(true).notNull(),
  votingStartDate: timestamp("voting_start_date").defaultNow().notNull(),
  votingEndDate: timestamp("voting_end_date").notNull(),
  minimumVotes: integer("minimum_votes").default(10).notNull(),
  status: varchar("status").default("active").notNull(), // "active", "completed", "cancelled"
  finalDecision: varchar("final_decision"), // "approved", "rejected", "modified"
  implementation: text("implementation"), // How the decision will be implemented
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const voteChoiceEnum = pgEnum("vote_choice", ["approve", "reject", "abstain"]);

export const disputeVotes = pgTable("dispute_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull(),
  voterHash: varchar("voter_hash").notNull().unique(), // Anonymized voter identifier
  choice: voteChoiceEnum("choice").notNull(),
  reason: text("reason"), // Optional explanation
  weight: integer("weight").default(1).notNull(), // Vote weight based on user reputation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Anti-Alt Detection System
export const altDetectionReports = pgTable("alt_detection_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  suspectedAltUserId: varchar("suspected_alt_user_id").notNull(),
  mainAccountUserId: varchar("main_account_user_id"),
  reportedBy: varchar("reported_by"),
  detectionMethod: varchar("detection_method").notNull(), // "ip_match", "device_fingerprint", "behavior_pattern", "manual_report"
  confidenceScore: integer("confidence_score").notNull(), // 1-100 confidence level
  evidence: jsonb("evidence").notNull(), // Detailed evidence data
  status: varchar("status").default("pending").notNull(), // "pending", "confirmed", "false_positive", "investigating"
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken"), // "warning", "suspension", "ban", "none"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Device/IP tracking for alt detection
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  deviceFingerprint: varchar("device_fingerprint"), // Browser fingerprint
  sessionToken: varchar("session_token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff Management and Permissions
export const staffPermissions = pgTable("staff_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  permission: varchar("permission").notNull(), // "manage_cases", "review_appeals", "ban_users", etc.
  grantedBy: varchar("granted_by").notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const staffPerformance = pgTable("staff_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").notNull(),
  period: varchar("period").notNull(), // "2025-01", "Q1-2025", etc.
  casesHandled: integer("cases_handled").default(0).notNull(),
  casesResolved: integer("cases_resolved").default(0).notNull(),
  averageResolutionTime: integer("average_resolution_time"), // in hours
  qualityScore: integer("quality_score"), // 1-100 based on reviews
  commendations: integer("commendations").default(0).notNull(),
  warnings: integer("warnings").default(0).notNull(),
  notes: text("notes"),
  evaluatedBy: varchar("evaluated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Utility Area - Staff Guides and Resources
export const utilityCategories = pgTable("utility_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const utilityDocuments = pgTable("utility_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  authorId: varchar("author_id").notNull(),
  lastEditedBy: varchar("last_edited_by"),
  version: integer("version").default(1).notNull(),
  isPublic: boolean("is_public").default(false).notNull(), // Staff only by default
  accessLevel: varchar("access_level").default("staff").notNull(), // "all", "staff", "senior_staff", "admin"
  downloadCount: integer("download_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }), // Average rating
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentRatings = pgTable("document_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Reputation System
export const userReputation = pgTable("user_reputation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  reputationScore: integer("reputation_score").default(100).notNull(), // Starting score: 100
  vouchesReceived: integer("vouches_received").default(0).notNull(),
  devouchesReceived: integer("devouches_received").default(0).notNull(),
  casesReported: integer("cases_reported").default(0).notNull(),
  validReports: integer("valid_reports").default(0).notNull(),
  falseReports: integer("false_reports").default(0).notNull(),
  communityScore: integer("community_score").default(0).notNull(),
  trustLevel: varchar("trust_level").default("bronze").notNull(), // "bronze", "silver", "gold", "platinum"
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Logs for all actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // "create_case", "vouch_user", "vote_dispute", etc.
  entityType: varchar("entity_type").notNull(), // "case", "user", "dispute", etc.
  entityId: varchar("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  additionalData: jsonb("additional_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  reportedCases: many(cases, { relationName: "reportedUser" }),
  reporterCases: many(cases, { relationName: "reporterUser" }),
  staffCases: many(cases, { relationName: "staffUser" }),
  appeals: many(appeals),
  altAccountsAsPrimary: many(altAccounts, { relationName: "primaryUser" }),
  altAccountsAsAlt: many(altAccounts, { relationName: "altUser" }),
  passwordResetRequests: many(passwordResetRequests),
  vouchesGiven: many(vouches, { relationName: "voucher" }),
  vouchesReceived: many(vouches, { relationName: "target" }),
  reputation: one(userReputation),
  permissions: many(staffPermissions),
  performance: many(staffPerformance),
  sessions: many(userSessions),
  auditLogs: many(auditLogs),
  utilityDocuments: many(utilityDocuments),
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

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  assignedToUser: one(users, {
    fields: [contactMessages.assignedTo],
    references: [users.id],
  }),
}));

export const staffAssignmentsRelations = relations(staffAssignments, ({ one }) => ({
  staff: one(users, {
    fields: [staffAssignments.staffId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [staffAssignments.caseId],
    references: [cases.id],
  }),
  contact: one(contactMessages, {
    fields: [staffAssignments.contactId],
    references: [contactMessages.id],
  }),
  assignedByUser: one(users, {
    fields: [staffAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const tribunalProceedingsRelations = relations(tribunalProceedings, ({ one }) => ({
  case: one(cases, {
    fields: [tribunalProceedings.caseId],
    references: [cases.id],
  }),
  chairpersonUser: one(users, {
    fields: [tribunalProceedings.chairperson],
    references: [users.id],
  }),
}));

// New Relations for all the new tables
export const vouchesRelations = relations(vouches, ({ one }) => ({
  targetUser: one(users, {
    fields: [vouches.targetUserId],
    references: [users.id],
    relationName: "target",
  }),
  voucherUser: one(users, {
    fields: [vouches.voucherUserId],
    references: [users.id],
    relationName: "voucher",
  }),
}));

export const disputeResolutionsRelations = relations(disputeResolutions, ({ one, many }) => ({
  case: one(cases, {
    fields: [disputeResolutions.caseId],
    references: [cases.id],
  }),
  proposedByUser: one(users, {
    fields: [disputeResolutions.proposedBy],
    references: [users.id],
  }),
  votes: many(disputeVotes),
}));

export const disputeVotesRelations = relations(disputeVotes, ({ one }) => ({
  dispute: one(disputeResolutions, {
    fields: [disputeVotes.disputeId],
    references: [disputeResolutions.id],
  }),
}));

export const altDetectionReportsRelations = relations(altDetectionReports, ({ one }) => ({
  suspectedAltUser: one(users, {
    fields: [altDetectionReports.suspectedAltUserId],
    references: [users.id],
  }),
  mainAccountUser: one(users, {
    fields: [altDetectionReports.mainAccountUserId],
    references: [users.id],
  }),
  reportedByUser: one(users, {
    fields: [altDetectionReports.reportedBy],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [altDetectionReports.reviewedBy],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const staffPermissionsRelations = relations(staffPermissions, ({ one }) => ({
  user: one(users, {
    fields: [staffPermissions.userId],
    references: [users.id],
  }),
  grantedByUser: one(users, {
    fields: [staffPermissions.grantedBy],
    references: [users.id],
  }),
}));

export const staffPerformanceRelations = relations(staffPerformance, ({ one }) => ({
  staff: one(users, {
    fields: [staffPerformance.staffId],
    references: [users.id],
  }),
  evaluatedByUser: one(users, {
    fields: [staffPerformance.evaluatedBy],
    references: [users.id],
  }),
}));

export const utilityCategoriesRelations = relations(utilityCategories, ({ many }) => ({
  documents: many(utilityDocuments),
}));

export const utilityDocumentsRelations = relations(utilityDocuments, ({ one, many }) => ({
  category: one(utilityCategories, {
    fields: [utilityDocuments.categoryId],
    references: [utilityCategories.id],
  }),
  author: one(users, {
    fields: [utilityDocuments.authorId],
    references: [users.id],
  }),
  lastEditedByUser: one(users, {
    fields: [utilityDocuments.lastEditedBy],
    references: [users.id],
  }),
  ratings: many(documentRatings),
}));

export const documentRatingsRelations = relations(documentRatings, ({ one }) => ({
  document: one(utilityDocuments, {
    fields: [documentRatings.documentId],
    references: [utilityDocuments.id],
  }),
  user: one(users, {
    fields: [documentRatings.userId],
    references: [users.id],
  }),
}));

export const userReputationRelations = relations(userReputation, ({ one }) => ({
  user: one(users, {
    fields: [userReputation.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
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

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffAssignmentSchema = createInsertSchema(staffAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertTribunalProceedingSchema = createInsertSchema(tribunalProceedings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New insert schemas for all new tables
export const insertVouchSchema = createInsertSchema(vouches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisputeResolutionSchema = createInsertSchema(disputeResolutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisputeVoteSchema = createInsertSchema(disputeVotes).omit({
  id: true,
  createdAt: true,
});

export const insertAltDetectionReportSchema = createInsertSchema(altDetectionReports).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertStaffPermissionSchema = createInsertSchema(staffPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertStaffPerformanceSchema = createInsertSchema(staffPerformance).omit({
  id: true,
  createdAt: true,
});

export const insertUtilityCategorySchema = createInsertSchema(utilityCategories).omit({
  id: true,
  createdAt: true,
});

export const insertUtilityDocumentSchema = createInsertSchema(utilityDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentRatingSchema = createInsertSchema(documentRatings).omit({
  id: true,
  createdAt: true,
});

export const insertUserReputationSchema = createInsertSchema(userReputation).omit({
  id: true,
  lastCalculated: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1),
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
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = z.infer<typeof insertStaffAssignmentSchema>;
export type TribunalProceeding = typeof tribunalProceedings.$inferSelect;
export type InsertTribunalProceeding = z.infer<typeof insertTribunalProceedingSchema>;

// New types for all new tables
export type Vouch = typeof vouches.$inferSelect;
export type InsertVouch = z.infer<typeof insertVouchSchema>;
export type DisputeResolution = typeof disputeResolutions.$inferSelect;
export type InsertDisputeResolution = z.infer<typeof insertDisputeResolutionSchema>;
export type DisputeVote = typeof disputeVotes.$inferSelect;
export type InsertDisputeVote = z.infer<typeof insertDisputeVoteSchema>;
export type AltDetectionReport = typeof altDetectionReports.$inferSelect;
export type InsertAltDetectionReport = z.infer<typeof insertAltDetectionReportSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type StaffPermission = typeof staffPermissions.$inferSelect;
export type InsertStaffPermission = z.infer<typeof insertStaffPermissionSchema>;
export type StaffPerformance = typeof staffPerformance.$inferSelect;
export type InsertStaffPerformance = z.infer<typeof insertStaffPerformanceSchema>;
export type UtilityCategory = typeof utilityCategories.$inferSelect;
export type InsertUtilityCategory = z.infer<typeof insertUtilityCategorySchema>;
export type UtilityDocument = typeof utilityDocuments.$inferSelect;
export type InsertUtilityDocument = z.infer<typeof insertUtilityDocumentSchema>;
export type DocumentRating = typeof documentRatings.$inferSelect;
export type InsertDocumentRating = z.infer<typeof insertDocumentRatingSchema>;
export type UserReputation = typeof userReputation.$inferSelect;
export type InsertUserReputation = z.infer<typeof insertUserReputationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type LoginData = z.infer<typeof loginSchema>;
