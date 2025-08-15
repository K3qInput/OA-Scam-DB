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
  "archived",
  "investigating"
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
  detectionMethod: varchar("detection_method").notNull(), // "ip_match", "device_fingerprint", "behavior_pattern", "manual_report", "email_similarity", "registration_pattern", "vpn_detection"
  confidenceScore: integer("confidence_score").notNull(), // 1-100 confidence level
  evidence: jsonb("evidence").notNull(), // Detailed evidence data
  status: varchar("status").default("pending").notNull(), // "pending", "confirmed", "false_positive", "investigating", "auto_blocked"
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken"), // "warning", "suspension", "ban", "none", "verification_required", "account_merge"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  // Enhanced fields for beta testing
  severity: varchar("severity").default("medium").notNull(), // "low", "medium", "high", "critical"
  autoGenerated: boolean("auto_generated").default(false).notNull(),
  falsePositiveProbability: integer("false_positive_probability"), // 0-100
  similarityMetrics: jsonb("similarity_metrics"), // Detailed similarity analysis
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
  // Enhanced alt detection fields
  screenResolution: varchar("screen_resolution"),
  timezone: varchar("timezone"),
  language: varchar("language"),
  platform: varchar("platform"),
  browserVersion: varchar("browser_version"),
  plugins: text("plugins").array(),
  fonts: text("fonts").array(),
  hardwareConcurrency: integer("hardware_concurrency"),
  deviceMemory: integer("device_memory"),
  connectionType: varchar("connection_type"),
  suspiciousActivity: boolean("suspicious_activity").default(false).notNull(),
  riskScore: integer("risk_score").default(0).notNull(),
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

// Account Verification System
export const accountVerifications = pgTable("account_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  verificationType: varchar("verification_type").notNull(), // "phone", "email", "document", "social_media", "government_id"
  verificationData: jsonb("verification_data"), // Encrypted verification details
  status: varchar("status").default("pending").notNull(), // "pending", "verified", "failed", "expired"
  verifiedBy: varchar("verified_by"), // Staff member who verified
  verificationToken: varchar("verification_token"),
  expiresAt: timestamp("expires_at"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Rate Limiting System
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar("identifier").notNull(), // IP address, user ID, etc.
  action: varchar("action").notNull(), // "register", "login", "case_creation", "api_call"
  count: integer("count").default(1).notNull(),
  windowStart: timestamp("window_start").defaultNow().notNull(),
  windowEnd: timestamp("window_end").notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Security Events
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // "suspicious_login", "multiple_accounts", "proxy_detected", "bot_activity"
  severity: varchar("severity").default("medium").notNull(), // "low", "medium", "high", "critical"
  userId: varchar("user_id"),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  details: jsonb("details").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Reputation System
export const userReputation = pgTable("user_reputation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  reputationScore: integer("reputation_score").default(100).notNull(), // Starting score: 100
  verificationLevel: integer("verification_level").default(0).notNull(), // 0-5 levels
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

// ============ COMMUNITY PLATFORM FEATURES ============

// Member Verification System
export const memberVerifications = pgTable("member_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  verificationType: varchar("verification_type").notNull(), // "manual", "automated", "document", "social", "reputation"
  status: varchar("status").default("pending").notNull(), // "pending", "approved", "rejected", "expired"
  verificationData: jsonb("verification_data"), // Documents, social links, etc.
  submittedBy: varchar("submitted_by"), // User who submitted
  reviewedBy: varchar("reviewed_by"), // Staff who reviewed
  reviewNotes: text("review_notes"),
  verificationLevel: integer("verification_level").default(1).notNull(), // 1-5 verification levels
  expiresAt: timestamp("expires_at"), // Some verifications expire
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Public Reputation Profiles
export const reputationProfiles = pgTable("reputation_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  specialties: text("specialties").array(),
  publicRoles: text("public_roles").array(), // Public-facing roles
  isPublic: boolean("is_public").default(true).notNull(),
  projectsCompleted: integer("projects_completed").default(0).notNull(),
  totalEarnings: integer("total_earnings").default(0).notNull(), // In cents
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  portfolioItems: jsonb("portfolio_items"),
  socialLinks: jsonb("social_links"),
  availabilityStatus: varchar("availability_status").default("available").notNull(), // "available", "busy", "unavailable"
  hourlyRate: integer("hourly_rate"), // In cents
  preferredPaymentMethods: text("preferred_payment_methods").array(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Report Vault - Public Scammer Reports
export const reportVault = pgTable("report_vault", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportedUserId: varchar("reported_user_id"),
  reportedUsername: varchar("reported_username"), // In case user is deleted
  reportedDiscordId: varchar("reported_discord_id"),
  scamType: varchar("scam_type").notNull(), // "payment_scam", "fake_services", "impersonation", "exit_scam"
  description: text("description").notNull(),
  evidenceUrls: text("evidence_urls").array(),
  damageClaimed: integer("damage_claimed"), // In cents
  status: varchar("status").default("confirmed").notNull(), // "confirmed", "disputed", "resolved"
  reportedBy: varchar("reported_by").notNull(),
  verifiedBy: varchar("verified_by"), // Staff verification
  isPublic: boolean("is_public").default(true).notNull(),
  warningLevel: varchar("warning_level").default("high").notNull(), // "low", "medium", "high", "critical"
  tags: text("tags").array(),
  caseId: varchar("case_id"), // Link to original case
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Blacklist Database
export const blacklistEntries = pgTable("blacklist_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryType: varchar("entry_type").notNull(), // "user", "discord_id", "email", "ip_address", "domain"
  entryValue: varchar("entry_value").notNull(), // The actual value being blacklisted
  reason: text("reason").notNull(),
  severity: varchar("severity").default("high").notNull(), // "low", "medium", "high", "critical"
  evidence: jsonb("evidence"),
  addedBy: varchar("added_by").notNull(),
  approvedBy: varchar("approved_by"), // Requires approval for high-severity entries
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"), // Some blacklist entries can expire
  tags: text("tags").array(),
  relatedCases: text("related_cases").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

// Staff Transparency
export const staffProfiles = pgTable("staff_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  roleHistory: jsonb("role_history"), // Array of {role, startDate, endDate, reason}
  specializations: text("specializations").array(),
  contactMethods: jsonb("contact_methods"), // {discord, email, availability}
  bio: text("bio"),
  joinedStaffAt: timestamp("joined_staff_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isPublicContact: boolean("is_public_contact").default(true).notNull(),
  caseLoad: integer("case_load").default(0).notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00"),
  commendations: integer("commendations").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Anti-Impersonation System
export const impersonationReports = pgTable("impersonation_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  impersonatorUserId: varchar("impersonator_user_id"),
  impersonatorDiscordId: varchar("impersonator_discord_id"),
  targetUserId: varchar("target_user_id").notNull(),
  evidenceType: varchar("evidence_type").notNull(), // "username_similarity", "avatar_theft", "role_claim", "fake_profile"
  similarity: integer("similarity").notNull(), // 0-100 similarity score
  evidenceData: jsonb("evidence_data"),
  status: varchar("status").default("pending").notNull(), // "pending", "confirmed", "false_positive"
  actionTaken: varchar("action_taken"), // "warning", "ban", "forced_rename", "none"
  reportedBy: varchar("reported_by"),
  reviewedBy: varchar("reviewed_by"),
  autoDetected: boolean("auto_detected").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Server Ban Sync System
export const serverBanSync = pgTable("server_ban_sync", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bannedUserId: varchar("banned_user_id"),
  bannedDiscordId: varchar("banned_discord_id").notNull(),
  originServerId: varchar("origin_server_id").notNull(),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"),
  banType: varchar("ban_type").default("permanent").notNull(), // "permanent", "temporary", "warning"
  severity: varchar("severity").default("high").notNull(), // "low", "medium", "high", "critical"
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  syncedServers: text("synced_servers").array(), // Server IDs that have applied this ban
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Events System
export const communityEvents = pgTable("community_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  eventType: varchar("event_type").notNull(), // "competition", "dev_jam", "server_collab", "training", "webinar"
  status: varchar("status").default("upcoming").notNull(), // "upcoming", "active", "completed", "cancelled"
  organizerId: varchar("organizer_id").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0).notNull(),
  prizePool: integer("prize_pool"), // In cents
  requirements: jsonb("requirements"), // Skill level, tools needed, etc.
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline"),
  discordChannelId: varchar("discord_channel_id"),
  externalLinks: jsonb("external_links"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event Participants
export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  registrationData: jsonb("registration_data"), // Application details, team info, etc.
  status: varchar("status").default("registered").notNull(), // "registered", "accepted", "rejected", "completed", "disqualified"
  teamName: varchar("team_name"),
  submission: jsonb("submission"), // For competitions
  ranking: integer("ranking"),
  prizeAwarded: integer("prize_awarded"), // In cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Resource Hub for Server Owners
export const resourceCategories = pgTable("resource_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  targetAudience: varchar("target_audience").default("all").notNull(), // "server_owners", "developers", "builders", "all"
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resourceItems = pgTable("resource_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // "plugin", "script", "hosting", "service", "tutorial", "tool"
  url: varchar("url").notNull(),
  price: varchar("price"), // "Free", "$5/month", "One-time $20", etc.
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0).notNull(),
  tags: text("tags").array(),
  verifiedBy: varchar("verified_by"), // Staff verification
  isSponsored: boolean("is_sponsored").default(false).notNull(),
  isTrusted: boolean("is_trusted").default(false).notNull(),
  addedBy: varchar("added_by").notNull(),
  lastChecked: timestamp("last_checked"),
  metadata: jsonb("metadata"), // Version info, compatibility, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
}).partial({
  reporterUserId: true, // This will be set by the server from auth token
  reportedUserId: true, // Optional, can be set later if not provided
  staffUserId: true, // Optional staff assignment
  resolvedAt: true, // Set when case is resolved
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
}).partial({
  assignedBy: true, // Set by server from auth token
  completedAt: true, // Set when assignment is completed
  isActive: true, // Has default value
});

export const insertTribunalProceedingSchema = createInsertSchema(tribunalProceedings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  chairperson: z.string().optional(),
  scheduledDate: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : null),
  actualDate: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : null),
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

export const insertAccountVerificationSchema = createInsertSchema(accountVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  createdAt: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
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
export type AccountVerification = typeof accountVerifications.$inferSelect;
export type InsertAccountVerification = z.infer<typeof insertAccountVerificationSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type UserReputation = typeof userReputation.$inferSelect;
export type InsertUserReputation = z.infer<typeof insertUserReputationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;



// ============= AI TOOLS & FREELANCER MARKETPLACE =============

// AI Tool Categories and Services
export const aiToolCategories = pgTable("ai_tool_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Deal Generator", "Code Checker", "Build Visualizer", etc.
  description: text("description"),
  icon: varchar("icon"),
  targetRole: varchar("target_role"), // "developer", "builder", "server_owner", "all"
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiTools = pgTable("ai_tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(), // AI prompt instructions
  inputFields: jsonb("input_fields").notNull(), // Form field definitions
  outputFormat: varchar("output_format").default("text").notNull(), // "text", "markdown", "json", "code"
  requiredRole: varchar("required_role").default("user").notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiToolUsage = pgTable("ai_tool_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull(),
  userId: varchar("user_id").notNull(),
  inputData: jsonb("input_data").notNull(),
  outputData: jsonb("output_data"),
  status: varchar("status").default("pending").notNull(), // "pending", "completed", "failed"
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // milliseconds
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Freelancer Marketplace
export const freelancerProfiles = pgTable("freelancer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationLevel: varchar("verification_level").default("basic").notNull(), // "basic", "enhanced", "premium"
  title: varchar("title").notNull(),
  bio: text("bio").notNull(),
  skills: text("skills").array().notNull(),
  specializations: text("specializations").array(),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  currency: varchar("currency").default("USD").notNull(),
  availability: varchar("availability").default("available").notNull(), // "available", "busy", "unavailable"
  portfolio: jsonb("portfolio"), // Links to work examples
  experience: varchar("experience").notNull(), // "entry", "intermediate", "expert"
  completedJobs: integer("completed_jobs").default(0).notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0").notNull(),
  responseTime: integer("response_time"), // Average response time in hours
  languages: text("languages").array(),
  timezone: varchar("timezone"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const freelancerSkillEnum = pgEnum("freelancer_skill", [
  "web_development", "mobile_development", "game_development", "ui_ux_design",
  "graphic_design", "3d_modeling", "animation", "content_writing", "copywriting",
  "seo", "marketing", "project_management", "data_analysis", "ai_ml", "blockchain",
  "cybersecurity", "devops", "qa_testing", "minecraft_development", "discord_bots",
  "server_administration", "plugin_development", "mod_development"
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft", "open", "in_progress", "review", "completed", "cancelled", "disputed"
]);

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  freelancerId: varchar("freelancer_id"),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  category: varchar("category").notNull(),
  skills: text("skills").array().notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  budgetType: varchar("budget_type").default("fixed").notNull(), // "fixed", "hourly"
  currency: varchar("currency").default("USD").notNull(),
  deadline: timestamp("deadline"),
  status: projectStatusEnum("status").default("draft").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  isVerifiedOnly: boolean("is_verified_only").default(false).notNull(),
  applicationCount: integer("application_count").default(0).notNull(),
  attachments: text("attachments").array(),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  milestones: jsonb("milestones"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const projectApplications = pgTable("project_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  freelancerId: varchar("freelancer_id").notNull(),
  coverLetter: text("cover_letter").notNull(),
  proposedBudget: decimal("proposed_budget", { precision: 10, scale: 2 }),
  proposedTimeline: text("proposed_timeline"),
  portfolio: jsonb("portfolio"),
  status: varchar("status").default("pending").notNull(), // "pending", "accepted", "rejected", "withdrawn"
  clientNotes: text("client_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectReviews = pgTable("project_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull(), // Client or freelancer
  revieweeId: varchar("reviewee_id").notNull(), // Other party
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  skills: jsonb("skills"), // Skill ratings
  wouldWorkAgain: boolean("would_work_again"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project Collaboration Hub
export const collaborationSpaces = pgTable("collaboration_spaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  inviteCode: varchar("invite_code").unique(),
  maxMembers: integer("max_members").default(10).notNull(),
  memberCount: integer("member_count").default(1).notNull(),
  tags: text("tags").array(),
  category: varchar("category"),
  rules: text("rules"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collaborationMembers = pgTable("collaboration_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member").notNull(), // "owner", "admin", "member", "viewer"
  permissions: text("permissions").array(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const collaborationTasks = pgTable("collaboration_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to"),
  createdBy: varchar("created_by").notNull(),
  status: varchar("status").default("todo").notNull(), // "todo", "in_progress", "review", "completed"
  priority: priorityEnum("priority").default("medium").notNull(),
  tags: text("tags").array(),
  dueDate: timestamp("due_date"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  attachments: text("attachments").array(),
  dependencies: text("dependencies").array(), // Task IDs this depends on
  progress: integer("progress").default(0).notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const collaborationMessages = pgTable("collaboration_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull(),
  taskId: varchar("task_id"), // Optional: message related to specific task
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text").notNull(), // "text", "file", "system", "ai_generated"
  attachments: text("attachments").array(),
  mentions: text("mentions").array(), // User IDs mentioned in message
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Verification System for Freelancers
export const verificationRequests = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  freelancerId: varchar("freelancer_id").notNull(),
  verificationType: varchar("verification_type").notNull(), // "identity", "skills", "portfolio", "enhanced"
  requestedLevel: varchar("requested_level").notNull(), // "basic", "enhanced", "premium"
  submittedDocuments: jsonb("submitted_documents").notNull(),
  status: varchar("status").default("pending").notNull(), // "pending", "approved", "rejected", "needs_revision"
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// AI Tool Ratings and Feedback
export const aiToolRatings = pgTable("ai_tool_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  toolId: varchar("tool_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  isHelpful: boolean("is_helpful"),
  improvementSuggestions: text("improvement_suggestions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insurance System
export const insurancePolicies = pgTable('insurance_policies', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull(),
  coverageAmount: integer('coverage_amount').notNull(),
  premium: integer('premium').notNull(),
  trustScoreThreshold: integer('trust_score_threshold').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const insuranceClaims = pgTable('insurance_claims', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  policyId: text('policy_id').notNull(),
  reason: text('reason').notNull(),
  evidenceUrls: text('evidence_urls').array(),
  status: text('status').notNull().default('pending'),
  payoutAmount: integer('payout_amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
});

// Impersonation Detection
export const impersonationAlerts = pgTable('impersonation_alerts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  platform: text('platform').notNull(),
  username: text('username').notNull(),
  profileUrl: text('profile_url').notNull(),
  similarity: integer('similarity').notNull(),
  detectionMethod: text('detection_method').notNull(),
  location: text('location'),
  screenshots: text('screenshots').array(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// Proof of Ownership
export const ownershipClaims = pgTable('ownership_claims', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  verificationMethod: text('verification_method').notNull(),
  proofUrls: text('proof_urls').array(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
});

export const ownershipBadges = pgTable('ownership_badges', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull(),
  claimId: text('claim_id').notNull(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
});

// ============= RELATIONS FOR NEW TABLES =============

// AI Tools Relations
export const aiToolCategoriesRelations = relations(aiToolCategories, ({ many }) => ({
  tools: many(aiTools),
}));

export const aiToolsRelations = relations(aiTools, ({ one, many }) => ({
  category: one(aiToolCategories, {
    fields: [aiTools.categoryId],
    references: [aiToolCategories.id],
  }),
  usage: many(aiToolUsage),
  ratings: many(aiToolRatings),
}));

export const aiToolUsageRelations = relations(aiToolUsage, ({ one }) => ({
  tool: one(aiTools, {
    fields: [aiToolUsage.toolId],
    references: [aiTools.id],
  }),
  user: one(users, {
    fields: [aiToolUsage.userId],
    references: [users.id],
  }),
}));

export const aiToolRatingsRelations = relations(aiToolRatings, ({ one }) => ({
  tool: one(aiTools, {
    fields: [aiToolRatings.toolId],
    references: [aiTools.id],
  }),
  user: one(users, {
    fields: [aiToolRatings.userId],
    references: [users.id],
  }),
}));

// Freelancer Marketplace Relations
export const freelancerProfilesRelations = relations(freelancerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [freelancerProfiles.userId],
    references: [users.id],
  }),
  projectsAsFreelancer: many(projects, { relationName: "freelancer" }),
  applications: many(projectApplications),
  receivedReviews: many(projectReviews, { relationName: "reviewee" }),
  givenReviews: many(projectReviews, { relationName: "reviewer" }),
  verificationRequests: many(verificationRequests),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
    relationName: "client",
  }),
  freelancer: one(freelancerProfiles, {
    fields: [projects.freelancerId],
    references: [freelancerProfiles.userId],
    relationName: "freelancer",
  }),
  applications: many(projectApplications),
  reviews: many(projectReviews),
}));

export const projectApplicationsRelations = relations(projectApplications, ({ one }) => ({
  project: one(projects, {
    fields: [projectApplications.projectId],
    references: [projects.id],
  }),
  freelancer: one(freelancerProfiles, {
    fields: [projectApplications.freelancerId],
    references: [freelancerProfiles.userId],
  }),
}));

export const projectReviewsRelations = relations(projectReviews, ({ one }) => ({
  project: one(projects, {
    fields: [projectReviews.projectId],
    references: [projects.id],
  }),
  reviewer: one(users, {
    fields: [projectReviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [projectReviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

// Collaboration Relations
export const collaborationSpacesRelations = relations(collaborationSpaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [collaborationSpaces.ownerId],
    references: [users.id],
  }),
  members: many(collaborationMembers),
  tasks: many(collaborationTasks),
  messages: many(collaborationMessages),
}));

export const collaborationMembersRelations = relations(collaborationMembers, ({ one }) => ({
  space: one(collaborationSpaces, {
    fields: [collaborationMembers.spaceId],
    references: [collaborationSpaces.id],
  }),
  user: one(users, {
    fields: [collaborationMembers.userId],
    references: [users.id],
  }),
}));

export const collaborationTasksRelations = relations(collaborationTasks, ({ one, many }) => ({
  space: one(collaborationSpaces, {
    fields: [collaborationTasks.spaceId],
    references: [collaborationSpaces.id],
  }),
  assignedToUser: one(users, {
    fields: [collaborationTasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [collaborationTasks.createdBy],
    references: [users.id],
  }),
  messages: many(collaborationMessages),
}));

export const collaborationMessagesRelations = relations(collaborationMessages, ({ one }) => ({
  space: one(collaborationSpaces, {
    fields: [collaborationMessages.spaceId],
    references: [collaborationSpaces.id],
  }),
  task: one(collaborationTasks, {
    fields: [collaborationMessages.taskId],
    references: [collaborationTasks.id],
  }),
  user: one(users, {
    fields: [collaborationMessages.userId],
    references: [users.id],
  }),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  freelancer: one(freelancerProfiles, {
    fields: [verificationRequests.freelancerId],
    references: [freelancerProfiles.userId],
  }),
  reviewedByUser: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
  }),
}));

// ============= INSERT SCHEMAS FOR NEW TABLES =============

export const insertAiToolCategorySchema = createInsertSchema(aiToolCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAiToolSchema = createInsertSchema(aiTools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiToolUsageSchema = createInsertSchema(aiToolUsage).omit({
  id: true,
  createdAt: true,
});

export const insertAiToolRatingSchema = createInsertSchema(aiToolRatings).omit({
  id: true,
  createdAt: true,
});

export const insertFreelancerProfileSchema = createInsertSchema(freelancerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectApplicationSchema = createInsertSchema(projectApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectReviewSchema = createInsertSchema(projectReviews).omit({
  id: true,
  createdAt: true,
});

export const insertCollaborationSpaceSchema = createInsertSchema(collaborationSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaborationMemberSchema = createInsertSchema(collaborationMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertCollaborationTaskSchema = createInsertSchema(collaborationTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaborationMessageSchema = createInsertSchema(collaborationMessages).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new insurance, impersonation, and ownership tables
export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
});

export const insertImpersonationAlertSchema = createInsertSchema(impersonationAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertOwnershipClaimSchema = createInsertSchema(ownershipClaims).omit({
  id: true,
  createdAt: true,
});

export const insertOwnershipBadgeSchema = createInsertSchema(ownershipBadges).omit({
  id: true,
  verifiedAt: true,
});

// ============= TYPES FOR NEW TABLES =============

// AI Tools types
export type AiToolCategory = typeof aiToolCategories.$inferSelect;
export type InsertAiToolCategory = z.infer<typeof insertAiToolCategorySchema>;
export type AiTool = typeof aiTools.$inferSelect;
export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiToolUsage = typeof aiToolUsage.$inferSelect;
export type InsertAiToolUsage = z.infer<typeof insertAiToolUsageSchema>;
export type AiToolRating = typeof aiToolRatings.$inferSelect;
export type InsertAiToolRating = z.infer<typeof insertAiToolRatingSchema>;

// Freelancer marketplace types
export type FreelancerProfile = typeof freelancerProfiles.$inferSelect;
export type InsertFreelancerProfile = z.infer<typeof insertFreelancerProfileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectApplication = typeof projectApplications.$inferSelect;
export type InsertProjectApplication = z.infer<typeof insertProjectApplicationSchema>;
export type ProjectReview = typeof projectReviews.$inferSelect;
export type InsertProjectReview = z.infer<typeof insertProjectReviewSchema>;

// Collaboration system types
export type CollaborationSpace = typeof collaborationSpaces.$inferSelect;
export type InsertCollaborationSpace = z.infer<typeof insertCollaborationSpaceSchema>;
export type CollaborationMember = typeof collaborationMembers.$inferSelect;
export type InsertCollaborationMember = z.infer<typeof insertCollaborationMemberSchema>;
export type CollaborationTask = typeof collaborationTasks.$inferSelect;
export type InsertCollaborationTask = z.infer<typeof insertCollaborationTaskSchema>;
export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type InsertCollaborationMessage = z.infer<typeof insertCollaborationMessageSchema>;

// Verification and community types
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;

// Insurance types
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;

// Impersonation types
export type ImpersonationAlert = typeof impersonationAlerts.$inferSelect;
export type InsertImpersonationAlert = z.infer<typeof insertImpersonationAlertSchema>;

// Ownership types
export type OwnershipClaim = typeof ownershipClaims.$inferSelect;
export type InsertOwnershipClaim = z.infer<typeof insertOwnershipClaimSchema>;
export type OwnershipBadge = typeof ownershipBadges.$inferSelect;
export type InsertOwnershipBadge = z.infer<typeof insertOwnershipBadgeSchema>;