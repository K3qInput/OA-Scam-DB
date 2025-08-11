import {
  type User,
  type InsertUser,
  type Case,
  type InsertCase,
  type Evidence,
  type InsertEvidence,
  type AltAccount,
  type InsertAltAccount,
  type Appeal,
  type InsertAppeal,
  type PasswordResetRequest,
  type InsertPasswordResetRequest,
  type CaseUpdate,
  type InsertCaseUpdate,
  type ContactMessage,
  type InsertContactMessage,
  type StaffAssignment,
  type InsertStaffAssignment,
  type TribunalProceeding,
  type InsertTribunalProceeding,
  type Vouch,
  type InsertVouch,
  type DisputeResolution,
  type InsertDisputeResolution,
  type DisputeVote,
  type InsertDisputeVote,
  type AltDetectionReport,
  type InsertAltDetectionReport,
  type UserSession,
  type InsertUserSession,
  type StaffPermission,
  type InsertStaffPermission,
  type StaffPerformance,
  type InsertStaffPerformance,
  type UtilityCategory,
  type InsertUtilityCategory,
  type UtilityDocument,
  type InsertUtilityDocument,
  type DocumentRating,
  type InsertDocumentRating,
  type UserReputation,
  type InsertUserReputation,
  type AuditLog,
  type InsertAuditLog,
  type AiToolCategory,
  type InsertAiToolCategory,
  type AiTool,
  type InsertAiTool,
  type AiToolUsage,
  type InsertAiToolUsage,
  type AiToolRating,
  type InsertAiToolRating,
  type FreelancerProfile,
  type InsertFreelancerProfile,
  type Project,
  type InsertProject,
  type ProjectApplication,
  type InsertProjectApplication,
  type ProjectReview,
  type InsertProjectReview,
  type CollaborationSpace,
  type InsertCollaborationSpace,
  type CollaborationMember,
  type InsertCollaborationMember,
  type CollaborationTask,
  type InsertCollaborationTask,
  type CollaborationMessage,
  type InsertCollaborationMessage,
  type VerificationRequest,
  type InsertVerificationRequest,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  getStaffMembers(): Promise<User[]>;

  // Case operations
  getCases(filters?: { status?: string; type?: string; search?: string; limit?: number; offset?: number }): Promise<Case[]>;
  getCase(id: string): Promise<Case | undefined>;
  getCaseCount(filters?: { status?: string; type?: string; search?: string }): Promise<number>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, caseData: Partial<InsertCase>): Promise<Case>;

  // Evidence operations
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidence(caseId: string): Promise<Evidence[]>;

  // Alt account operations
  createAltAccount(altAccount: InsertAltAccount): Promise<AltAccount>;
  getAltAccounts(userId: string): Promise<AltAccount[]>;

  // Appeal operations
  createAppeal(appeal: InsertAppeal): Promise<Appeal>;
  getAppeals(caseId: string): Promise<Appeal[]>;

  // Password reset operations
  createPasswordResetRequest(request: InsertPasswordResetRequest): Promise<PasswordResetRequest>;
  getPasswordResetRequests(): Promise<PasswordResetRequest[]>;
  updatePasswordResetRequest(id: string, request: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest>;

  // Case update operations
  createCaseUpdate(update: InsertCaseUpdate): Promise<CaseUpdate>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // Staff assignment operations
  createStaffAssignment(assignment: InsertStaffAssignment): Promise<StaffAssignment>;

  // Tribunal proceeding operations
  createTribunalProceeding(proceeding: InsertTribunalProceeding): Promise<TribunalProceeding>;
  getTribunalProceedings(): Promise<TribunalProceeding[]>;

  // Vouch/Devouch operations
  createVouch(vouch: InsertVouch): Promise<Vouch>;
  getVouches(userId: string): Promise<Vouch[]>;

  // Dispute resolution operations
  createDisputeResolution(dispute: InsertDisputeResolution): Promise<DisputeResolution>;
  getActiveDisputes(): Promise<DisputeResolution[]>;
  createDisputeVote(vote: InsertDisputeVote): Promise<DisputeVote>;

  // Alt detection operations
  createAltDetectionReport(report: InsertAltDetectionReport): Promise<AltDetectionReport>;
  getAltDetectionReports(): Promise<AltDetectionReport[]>;
  updateAltDetectionReport(id: string, report: Partial<InsertAltDetectionReport>): Promise<AltDetectionReport>;

  // User session operations
  createUserSession(session: InsertUserSession): Promise<UserSession>;

  // Staff permission operations
  createStaffPermission(permission: InsertStaffPermission): Promise<StaffPermission>;
  getStaffPermissions(userId?: string): Promise<StaffPermission[]>;

  // Staff performance operations
  createStaffPerformance(performance: InsertStaffPerformance): Promise<StaffPerformance>;
  getStaffPerformance(userId?: string): Promise<StaffPerformance[]>;

  // Utility operations
  createUtilityCategory(category: InsertUtilityCategory): Promise<UtilityCategory>;
  getUtilityCategories(): Promise<UtilityCategory[]>;
  createUtilityDocument(document: InsertUtilityDocument): Promise<UtilityDocument>;
  getUtilityDocuments(categoryId?: string): Promise<UtilityDocument[]>;
  updateUtilityDocument(id: string, document: Partial<InsertUtilityDocument>): Promise<UtilityDocument>;
  createDocumentRating(rating: InsertDocumentRating): Promise<DocumentRating>;

  // User reputation operations
  getUserReputation(userId: string): Promise<UserReputation | undefined>;
  createUserReputation(reputation: InsertUserReputation): Promise<UserReputation>;

  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  
  // Dashboard statistics
  getDashboardStatistics(): Promise<any>;

  // AI Tool operations
  getAiToolCategories(): Promise<AiToolCategory[]>;
  createAiToolCategory(category: InsertAiToolCategory): Promise<AiToolCategory>;
  getAiTools(categoryId?: string): Promise<AiTool[]>;
  createAiTool(tool: InsertAiTool): Promise<AiTool>;
  getAiTool(id: string): Promise<AiTool | undefined>;
  createAiToolUsage(usage: InsertAiToolUsage): Promise<AiToolUsage>;
  updateAiToolUsage(id: string, usage: Partial<InsertAiToolUsage>): Promise<AiToolUsage>;
  createAiToolRating(rating: InsertAiToolRating): Promise<AiToolRating>;

  // Freelancer operations
  createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile>;
  getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined>;
  getFreelancerProfiles(filters?: { skills?: string[]; verified?: boolean }): Promise<FreelancerProfile[]>;
  updateFreelancerProfile(userId: string, profile: Partial<InsertFreelancerProfile>): Promise<FreelancerProfile>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(filters?: { status?: string; skills?: string[]; clientId?: string }): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  createProjectApplication(application: InsertProjectApplication): Promise<ProjectApplication>;
  getProjectApplications(projectId: string): Promise<ProjectApplication[]>;
  createProjectReview(review: InsertProjectReview): Promise<ProjectReview>;

  // Collaboration operations
  createCollaborationSpace(space: InsertCollaborationSpace): Promise<CollaborationSpace>;
  getCollaborationSpaces(userId: string): Promise<CollaborationSpace[]>;
  getCollaborationSpace(id: string): Promise<CollaborationSpace | undefined>;
  createCollaborationMember(member: InsertCollaborationMember): Promise<CollaborationMember>;
  createCollaborationTask(task: InsertCollaborationTask): Promise<CollaborationTask>;
  getCollaborationTasks(spaceId: string): Promise<CollaborationTask[]>;
  createCollaborationMessage(message: InsertCollaborationMessage): Promise<CollaborationMessage>;
  getCollaborationMessages(spaceId: string, taskId?: string): Promise<CollaborationMessage[]>;

  // Verification operations
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(): Promise<VerificationRequest[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private cases: Map<string, Case> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private altAccounts: Map<string, AltAccount> = new Map();
  private appeals: Map<string, Appeal> = new Map();
  private passwordResetRequests: Map<string, PasswordResetRequest> = new Map();
  private caseUpdates: Map<string, CaseUpdate> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private staffAssignments: Map<string, StaffAssignment> = new Map();
  private tribunalProceedings: Map<string, TribunalProceeding> = new Map();
  private vouches: Map<string, Vouch> = new Map();
  private disputeResolutions: Map<string, DisputeResolution> = new Map();
  private disputeVotes: Map<string, DisputeVote> = new Map();
  private altDetectionReports: Map<string, AltDetectionReport> = new Map();
  private userSessions: Map<string, UserSession> = new Map();
  private staffPermissions: Map<string, StaffPermission> = new Map();
  private staffPerformance: Map<string, StaffPerformance> = new Map();
  private utilityCategories: Map<string, UtilityCategory> = new Map();
  private utilityDocuments: Map<string, UtilityDocument> = new Map();
  private documentRatings: Map<string, DocumentRating> = new Map();
  private userReputation: Map<string, UserReputation> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private aiToolCategories: Map<string, AiToolCategory> = new Map();
  private aiTools: Map<string, AiTool> = new Map();
  private aiToolUsage: Map<string, AiToolUsage> = new Map();
  private aiToolRatings: Map<string, AiToolRating> = new Map();
  private freelancerProfiles: Map<string, FreelancerProfile> = new Map();
  private projects: Map<string, Project> = new Map();
  private projectApplications: Map<string, ProjectApplication> = new Map();
  private projectReviews: Map<string, ProjectReview> = new Map();
  private collaborationSpaces: Map<string, CollaborationSpace> = new Map();
  private collaborationMembers: Map<string, CollaborationMember> = new Map();
  private collaborationTasks: Map<string, CollaborationTask> = new Map();
  private collaborationMessages: Map<string, CollaborationMessage> = new Map();
  private verificationRequests: Map<string, VerificationRequest> = new Map();

  constructor() {
    this.initializeData();
  }

  private generateId(): string {
    return randomBytes(16).toString("hex");
  }

  private async initializeData() {
    // Create default admin user
    const adminId = "admin-1";
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    
    const adminUser: User = {
      id: adminId,
      username: "admin",
      email: "admin@ownersalliance.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: null,
      isActive: true,
      department: "administration",
      specialization: "management",
      staffId: "STAFF-001",
      phoneNumber: null,
      officeLocation: null,
      emergencyContact: null,
      certifications: [],
      discordId: null,
      discordUsername: null,
      discordDiscriminator: null,
      discordAvatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminId, adminUser);

    // Create sample AI tool categories
    const dealGenCategory: AiToolCategory = {
      id: "cat-1",
      name: "Deal Generator",
      description: "AI tools for generating business deals and contracts",
      icon: "handshake",
      targetRole: "all",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
    };
    
    const codeCheckCategory: AiToolCategory = {
      id: "cat-2", 
      name: "Code Checker",
      description: "AI tools for code analysis and review",
      icon: "code",
      targetRole: "developer",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
    };

    const buildVisualizerCategory: AiToolCategory = {
      id: "cat-3",
      name: "Build Visualizer", 
      description: "AI tools for visualizing builds and structures",
      icon: "cube",
      targetRole: "builder",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
    };

    const serverOwnerCategory: AiToolCategory = {
      id: "cat-4",
      name: "Server Management",
      description: "AI tools for server owners and administrators",
      icon: "server",
      targetRole: "server_owner",
      isActive: true,
      sortOrder: 4,
      createdAt: new Date(),
    };

    this.aiToolCategories.set("cat-1", dealGenCategory);
    this.aiToolCategories.set("cat-2", codeCheckCategory);
    this.aiToolCategories.set("cat-3", buildVisualizerCategory);
    this.aiToolCategories.set("cat-4", serverOwnerCategory);

    // Create sample AI tools
    const dealGeneratorTool: AiTool = {
      id: "tool-1",
      categoryId: "cat-1",
      name: "Quick Deal Generator",
      description: "Generate professional business deals quickly with AI assistance",
      instructions: "You are a business deal generator. Create professional, legally sound business deals based on the provided details. Include all necessary terms, conditions, and clauses.",
      inputFields: {
        dealType: { type: "select", label: "Deal Type", options: ["Partnership", "Service Agreement", "Purchase Contract", "Licensing"] },
        parties: { type: "text", label: "Parties Involved", required: true },
        amount: { type: "number", label: "Deal Value ($)", required: false },
        duration: { type: "text", label: "Duration/Timeline", required: false },
        description: { type: "textarea", label: "Deal Description", required: true }
      },
      outputFormat: "markdown",
      requiredRole: "user",
      usageCount: 0,
      rating: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const codeCheckerTool: AiTool = {
      id: "tool-2",
      categoryId: "cat-2",
      name: "Code Security Analyzer",
      description: "Analyze code for security vulnerabilities and best practices",
      instructions: "You are a code security expert. Analyze the provided code for security vulnerabilities, performance issues, and adherence to best practices. Provide detailed recommendations.",
      inputFields: {
        language: { type: "select", label: "Programming Language", options: ["JavaScript", "Python", "Java", "C#", "PHP", "Go", "Rust"] },
        code: { type: "textarea", label: "Code to Analyze", required: true },
        framework: { type: "text", label: "Framework (optional)", required: false }
      },
      outputFormat: "markdown",
      requiredRole: "user",
      usageCount: 0,
      rating: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.aiTools.set("tool-1", dealGeneratorTool);
    this.aiTools.set("tool-2", codeCheckerTool);

    // Create sample utility categories
    const staffGuidesCategory: UtilityCategory = {
      id: "util-cat-1",
      name: "Staff Guides",
      description: "Guidelines and procedures for staff members",
      icon: "book",
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
    };

    this.utilityCategories.set("util-cat-1", staffGuidesCategory);

    // Create sample utility document
    const moderationGuide: UtilityDocument = {
      id: "doc-1",
      categoryId: "util-cat-1",
      title: "Case Moderation Guidelines",
      content: `# Case Moderation Guidelines

## Overview
This guide outlines the procedures and best practices for moderating cases in the OwnersAlliance system.

## Key Principles
1. **Fairness**: All cases should be reviewed objectively
2. **Transparency**: Document all decisions clearly
3. **Timeliness**: Respond to cases within 24 hours
4. **Accuracy**: Verify all evidence before making decisions

## Process Steps
1. Initial case review
2. Evidence verification
3. Risk assessment
4. Decision making
5. Documentation

## Common Scenarios
- Financial scams: Require transaction evidence
- Identity theft: Verify identity documents
- Fake services: Check service delivery proof

## Escalation Procedures
Complex cases should be escalated to senior staff or tribunal.`,
      description: "Complete guide for case moderation procedures",
      tags: ["moderation", "guidelines", "staff", "procedures"],
      authorId: adminId,
      lastEditedBy: null,
      version: 1,
      isPublic: false,
      accessLevel: "staff",
      downloadCount: 0,
      rating: null,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.utilityDocuments.set("doc-1", moderationGuide);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.discordId === discordId);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.generateId();
    const user: User = {
      id,
      ...userData,
      passwordHash: userData.passwordHash || null,
      role: userData.role || "user",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isActive: userData.isActive ?? true,
      department: userData.department || null,
      specialization: userData.specialization || null,
      staffId: userData.staffId || null,
      phoneNumber: userData.phoneNumber || null,
      officeLocation: userData.officeLocation || null,
      emergencyContact: userData.emergencyContact || null,
      certifications: userData.certifications || [],
      discordId: userData.discordId || null,
      discordUsername: userData.discordUsername || null,
      discordDiscriminator: userData.discordDiscriminator || null,
      discordAvatar: userData.discordAvatar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.passwordHash) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getStaffMembers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      ["admin", "tribunal_head", "senior_staff", "staff"].includes(user.role)
    );
  }

  // Case operations
  async getCases(filters?: { status?: string; type?: string; search?: string; limit?: number; offset?: number }): Promise<Case[]> {
    let result = Array.from(this.cases.values());
    
    if (filters?.status) {
      result = result.filter(case_ => case_.status === filters.status);
    }
    
    if (filters?.type) {
      result = result.filter(case_ => case_.type === filters.type);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(case_ => 
        case_.title.toLowerCase().includes(searchLower) ||
        case_.description.toLowerCase().includes(searchLower)
      );
    }
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return result.slice(offset, offset + limit);
  }

  async getCase(id: string): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getCaseCount(filters?: { status?: string; type?: string; search?: string }): Promise<number> {
    const cases = await this.getCases(filters);
    return cases.length;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const id = this.generateId();
    const caseNumber = `CASE-${Date.now()}`;
    
    const case_: Case = {
      id,
      caseNumber,
      ...caseData,
      status: caseData.status || "pending",
      priority: caseData.priority || "medium",
      staffUserId: caseData.staffUserId || null,
      amountInvolved: caseData.amountInvolved || null,
      currency: caseData.currency || "USD",
      tags: caseData.tags || [],
      metadata: caseData.metadata || null,
      aiAnalysis: caseData.aiAnalysis || null,
      aiRiskScore: caseData.aiRiskScore || null,
      aiUrgencyLevel: caseData.aiUrgencyLevel || null,
      moderationAdvice: caseData.moderationAdvice || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    };
    
    this.cases.set(id, case_);
    return case_;
  }

  async updateCase(id: string, caseData: Partial<InsertCase>): Promise<Case> {
    const existingCase = this.cases.get(id);
    if (!existingCase) {
      throw new Error("Case not found");
    }
    
    const updatedCase: Case = {
      ...existingCase,
      ...caseData,
      updatedAt: new Date(),
    };
    
    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  // Evidence operations
  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const id = this.generateId();
    const evidence: Evidence = {
      id,
      ...evidenceData,
      description: evidenceData.description || null,
      createdAt: new Date(),
    };
    this.evidence.set(id, evidence);
    return evidence;
  }

  async getEvidence(caseId: string): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(ev => ev.caseId === caseId);
  }

  // Alt account operations
  async createAltAccount(altAccountData: InsertAltAccount): Promise<AltAccount> {
    const id = this.generateId();
    const altAccount: AltAccount = {
      id,
      ...altAccountData,
      evidence: altAccountData.evidence || null,
      verifiedBy: altAccountData.verifiedBy || null,
      isActive: altAccountData.isActive ?? true,
      createdAt: new Date(),
      verifiedAt: null,
    };
    this.altAccounts.set(id, altAccount);
    return altAccount;
  }

  async getAltAccounts(userId: string): Promise<AltAccount[]> {
    return Array.from(this.altAccounts.values()).filter(
      alt => alt.primaryUserId === userId || alt.altUserId === userId
    );
  }

  // Appeal operations
  async createAppeal(appealData: InsertAppeal): Promise<Appeal> {
    const id = this.generateId();
    const appeal: Appeal = {
      id,
      ...appealData,
      status: appealData.status || "pending",
      reviewedBy: appealData.reviewedBy || null,
      reviewNotes: appealData.reviewNotes || null,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.appeals.set(id, appeal);
    return appeal;
  }

  async getAppeals(caseId: string): Promise<Appeal[]> {
    return Array.from(this.appeals.values()).filter(appeal => appeal.caseId === caseId);
  }

  // Password reset operations
  async createPasswordResetRequest(requestData: InsertPasswordResetRequest): Promise<PasswordResetRequest> {
    const id = this.generateId();
    const request: PasswordResetRequest = {
      id,
      ...requestData,
      status: requestData.status || "pending",
      approvedBy: requestData.approvedBy || null,
      token: null,
      expiresAt: null,
      createdAt: new Date(),
      approvedAt: null,
    };
    this.passwordResetRequests.set(id, request);
    return request;
  }

  async getPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    return Array.from(this.passwordResetRequests.values());
  }

  async updatePasswordResetRequest(id: string, requestData: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest> {
    const existing = this.passwordResetRequests.get(id);
    if (!existing) {
      throw new Error("Password reset request not found");
    }
    
    const updated: PasswordResetRequest = {
      ...existing,
      ...requestData,
    };
    this.passwordResetRequests.set(id, updated);
    return updated;
  }

  // Case update operations
  async createCaseUpdate(updateData: InsertCaseUpdate): Promise<CaseUpdate> {
    const id = this.generateId();
    const update: CaseUpdate = {
      id,
      ...updateData,
      oldValue: updateData.oldValue || null,
      newValue: updateData.newValue || null,
      comment: updateData.comment || null,
      createdAt: new Date(),
    };
    this.caseUpdates.set(id, update);
    return update;
  }

  // Contact message operations
  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const id = this.generateId();
    const message: ContactMessage = {
      id,
      ...messageData,
      priority: messageData.priority || "medium",
      status: messageData.status || "new",
      assignedTo: messageData.assignedTo || null,
      tags: messageData.tags || [],
      metadata: messageData.metadata || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  // Staff assignment operations
  async createStaffAssignment(assignmentData: InsertStaffAssignment): Promise<StaffAssignment> {
    const id = this.generateId();
    const assignment: StaffAssignment = {
      id,
      ...assignmentData,
      caseId: assignmentData.caseId || null,
      contactId: assignmentData.contactId || null,
      notes: assignmentData.notes || null,
      isActive: assignmentData.isActive ?? true,
      assignedAt: new Date(),
      completedAt: null,
    };
    this.staffAssignments.set(id, assignment);
    return assignment;
  }

  // Tribunal proceeding operations
  async createTribunalProceeding(proceedingData: InsertTribunalProceeding): Promise<TribunalProceeding> {
    const id = this.generateId();
    const proceeding: TribunalProceeding = {
      id,
      ...proceedingData,
      scheduledDate: proceedingData.scheduledDate || null,
      actualDate: proceedingData.actualDate || null,
      panelMembers: proceedingData.panelMembers || [],
      outcome: proceedingData.outcome || null,
      decisionReason: proceedingData.decisionReason || null,
      nextSteps: proceedingData.nextSteps || null,
      documents: proceedingData.documents || [],
      isPublic: proceedingData.isPublic ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tribunalProceedings.set(id, proceeding);
    return proceeding;
  }

  async getTribunalProceedings(): Promise<TribunalProceeding[]> {
    return Array.from(this.tribunalProceedings.values());
  }

  // Vouch/Devouch operations
  async createVouch(vouchData: InsertVouch): Promise<Vouch> {
    const id = this.generateId();
    const vouch: Vouch = {
      id,
      ...vouchData,
      evidence: vouchData.evidence || null,
      weight: vouchData.weight || 1,
      isAnonymous: vouchData.isAnonymous ?? false,
      expiresAt: vouchData.expiresAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vouches.set(id, vouch);
    return vouch;
  }

  async getVouches(userId: string): Promise<Vouch[]> {
    return Array.from(this.vouches.values()).filter(vouch => vouch.targetUserId === userId);
  }

  // Dispute resolution operations
  async createDisputeResolution(disputeData: InsertDisputeResolution): Promise<DisputeResolution> {
    const id = this.generateId();
    const dispute: DisputeResolution = {
      id,
      ...disputeData,
      isPublic: disputeData.isPublic ?? true,
      votingStartDate: disputeData.votingStartDate || new Date(),
      minimumVotes: disputeData.minimumVotes || 10,
      status: disputeData.status || "active",
      finalDecision: disputeData.finalDecision || null,
      implementation: disputeData.implementation || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.disputeResolutions.set(id, dispute);
    return dispute;
  }

  async getActiveDisputes(): Promise<DisputeResolution[]> {
    return Array.from(this.disputeResolutions.values()).filter(
      dispute => dispute.status === "active"
    );
  }

  async createDisputeVote(voteData: InsertDisputeVote): Promise<DisputeVote> {
    const id = this.generateId();
    const vote: DisputeVote = {
      id,
      ...voteData,
      reason: voteData.reason || null,
      weight: voteData.weight || 1,
      createdAt: new Date(),
    };
    this.disputeVotes.set(id, vote);
    return vote;
  }

  // Alt detection operations
  async createAltDetectionReport(reportData: InsertAltDetectionReport): Promise<AltDetectionReport> {
    const id = this.generateId();
    const report: AltDetectionReport = {
      id,
      ...reportData,
      mainAccountUserId: reportData.mainAccountUserId || null,
      reportedBy: reportData.reportedBy || null,
      status: reportData.status || "pending",
      reviewedBy: reportData.reviewedBy || null,
      reviewNotes: reportData.reviewNotes || null,
      actionTaken: reportData.actionTaken || null,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.altDetectionReports.set(id, report);
    return report;
  }

  async getAltDetectionReports(): Promise<AltDetectionReport[]> {
    return Array.from(this.altDetectionReports.values());
  }

  async updateAltDetectionReport(id: string, reportData: Partial<InsertAltDetectionReport>): Promise<AltDetectionReport> {
    const existing = this.altDetectionReports.get(id);
    if (!existing) {
      throw new Error("Alt detection report not found");
    }
    
    const updated: AltDetectionReport = {
      ...existing,
      ...reportData,
    };
    this.altDetectionReports.set(id, updated);
    return updated;
  }

  // User session operations
  async createUserSession(sessionData: InsertUserSession): Promise<UserSession> {
    const id = this.generateId();
    const session: UserSession = {
      id,
      ...sessionData,
      deviceFingerprint: sessionData.deviceFingerprint || null,
      isActive: sessionData.isActive ?? true,
      lastActivity: sessionData.lastActivity || new Date(),
      createdAt: new Date(),
    };
    this.userSessions.set(id, session);
    return session;
  }

  // Staff permission operations
  async createStaffPermission(permissionData: InsertStaffPermission): Promise<StaffPermission> {
    const id = this.generateId();
    const permission: StaffPermission = {
      id,
      ...permissionData,
      expiresAt: permissionData.expiresAt || null,
      isActive: permissionData.isActive ?? true,
      grantedAt: new Date(),
    };
    this.staffPermissions.set(id, permission);
    return permission;
  }

  async getStaffPermissions(userId?: string): Promise<StaffPermission[]> {
    const permissions = Array.from(this.staffPermissions.values());
    return userId ? permissions.filter(p => p.userId === userId) : permissions;
  }

  // Staff performance operations
  async createStaffPerformance(performanceData: InsertStaffPerformance): Promise<StaffPerformance> {
    const id = this.generateId();
    const performance: StaffPerformance = {
      id,
      ...performanceData,
      casesHandled: performanceData.casesHandled || 0,
      casesResolved: performanceData.casesResolved || 0,
      averageResolutionTime: performanceData.averageResolutionTime || null,
      qualityScore: performanceData.qualityScore || null,
      commendations: performanceData.commendations || 0,
      warnings: performanceData.warnings || 0,
      notes: performanceData.notes || null,
      createdAt: new Date(),
    };
    this.staffPerformance.set(id, performance);
    return performance;
  }

  async getStaffPerformance(userId?: string): Promise<StaffPerformance[]> {
    const performances = Array.from(this.staffPerformance.values());
    return userId ? performances.filter(p => p.staffId === userId) : performances;
  }

  // Utility operations
  async createUtilityCategory(categoryData: InsertUtilityCategory): Promise<UtilityCategory> {
    const id = this.generateId();
    const category: UtilityCategory = {
      id,
      ...categoryData,
      description: categoryData.description || null,
      icon: categoryData.icon || null,
      sortOrder: categoryData.sortOrder || 0,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date(),
    };
    this.utilityCategories.set(id, category);
    return category;
  }

  async getUtilityCategories(): Promise<UtilityCategory[]> {
    return Array.from(this.utilityCategories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createUtilityDocument(documentData: InsertUtilityDocument): Promise<UtilityDocument> {
    const id = this.generateId();
    const document: UtilityDocument = {
      id,
      ...documentData,
      description: documentData.description || null,
      tags: documentData.tags || [],
      lastEditedBy: documentData.lastEditedBy || null,
      version: documentData.version || 1,
      isPublic: documentData.isPublic ?? false,
      accessLevel: documentData.accessLevel || "staff",
      downloadCount: documentData.downloadCount || 0,
      rating: documentData.rating || null,
      ratingCount: documentData.ratingCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.utilityDocuments.set(id, document);
    return document;
  }

  async getUtilityDocuments(categoryId?: string): Promise<UtilityDocument[]> {
    let documents = Array.from(this.utilityDocuments.values());
    if (categoryId) {
      documents = documents.filter(doc => doc.categoryId === categoryId);
    }
    return documents;
  }

  async updateUtilityDocument(id: string, documentData: Partial<InsertUtilityDocument>): Promise<UtilityDocument> {
    const existing = this.utilityDocuments.get(id);
    if (!existing) {
      throw new Error("Utility document not found");
    }
    
    const updated: UtilityDocument = {
      ...existing,
      ...documentData,
      updatedAt: new Date(),
    };
    this.utilityDocuments.set(id, updated);
    return updated;
  }

  async createDocumentRating(ratingData: InsertDocumentRating): Promise<DocumentRating> {
    const id = this.generateId();
    const rating: DocumentRating = {
      id,
      ...ratingData,
      review: ratingData.review || null,
      createdAt: new Date(),
    };
    this.documentRatings.set(id, rating);
    return rating;
  }

  // User reputation operations
  async getUserReputation(userId: string): Promise<UserReputation | undefined> {
    return this.userReputation.get(userId);
  }

  async createUserReputation(reputationData: InsertUserReputation): Promise<UserReputation> {
    const id = this.generateId();
    const reputation: UserReputation = {
      id,
      userId: reputationData.userId,
      reputationScore: reputationData.reputationScore || 100,
      vouchesReceived: reputationData.vouchesReceived || 0,
      devouchesReceived: reputationData.devouchesReceived || 0,
      casesReported: reputationData.casesReported || 0,
      validReports: reputationData.validReports || 0,
      falseReports: reputationData.falseReports || 0,
      communityScore: reputationData.communityScore || 0,
      trustLevel: reputationData.trustLevel || "bronze",
      lastCalculated: new Date(),
      updatedAt: new Date(),
    };
    this.userReputation.set(id, reputation);
    return reputation;
  }

  // Audit log operations
  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const id = this.generateId();
    const log: AuditLog = {
      id,
      ...logData,
      entityId: logData.entityId || null,
      oldValues: logData.oldValues || null,
      newValues: logData.newValues || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      additionalData: logData.additionalData || null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Dashboard statistics
  async getDashboardStatistics(): Promise<any> {
    const totalCases = this.cases.size;
    const totalUsers = this.users.size;
    const pendingCases = Array.from(this.cases.values()).filter(c => c.status === "pending").length;
    const resolvedCases = Array.from(this.cases.values()).filter(c => c.status === "resolved").length;
    
    return {
      totalCases,
      totalUsers,
      pendingCases,
      resolvedCases,
      activeDisputes: this.disputeResolutions.size,
      totalReports: this.altDetectionReports.size
    };
  }

  // AI Tool operations
  async getAiToolCategories(): Promise<AiToolCategory[]> {
    return Array.from(this.aiToolCategories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createAiToolCategory(categoryData: InsertAiToolCategory): Promise<AiToolCategory> {
    const id = this.generateId();
    const category: AiToolCategory = {
      id,
      ...categoryData,
      description: categoryData.description || null,
      icon: categoryData.icon || null,
      targetRole: categoryData.targetRole || null,
      isActive: categoryData.isActive ?? true,
      sortOrder: categoryData.sortOrder || 0,
      createdAt: new Date(),
    };
    this.aiToolCategories.set(id, category);
    return category;
  }

  async getAiTools(categoryId?: string): Promise<AiTool[]> {
    let tools = Array.from(this.aiTools.values());
    if (categoryId) {
      tools = tools.filter(tool => tool.categoryId === categoryId);
    }
    return tools.filter(tool => tool.isActive);
  }

  async createAiTool(toolData: InsertAiTool): Promise<AiTool> {
    const id = this.generateId();
    const tool: AiTool = {
      id,
      ...toolData,
      outputFormat: toolData.outputFormat || "text",
      requiredRole: toolData.requiredRole || "user",
      usageCount: toolData.usageCount || 0,
      rating: toolData.rating || null,
      isActive: toolData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.aiTools.set(id, tool);
    return tool;
  }

  async getAiTool(id: string): Promise<AiTool | undefined> {
    return this.aiTools.get(id);
  }

  async createAiToolUsage(usageData: InsertAiToolUsage): Promise<AiToolUsage> {
    const id = this.generateId();
    const usage: AiToolUsage = {
      id,
      ...usageData,
      outputData: usageData.outputData || null,
      status: usageData.status || "pending",
      errorMessage: usageData.errorMessage || null,
      processingTime: usageData.processingTime || null,
      rating: usageData.rating || null,
      feedback: usageData.feedback || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.aiToolUsage.set(id, usage);
    return usage;
  }

  async updateAiToolUsage(id: string, usageData: Partial<InsertAiToolUsage>): Promise<AiToolUsage> {
    const existing = this.aiToolUsage.get(id);
    if (!existing) {
      throw new Error("AI tool usage not found");
    }
    
    const updated: AiToolUsage = {
      ...existing,
      ...usageData,
      completedAt: usageData.status === "completed" ? new Date() : existing.completedAt,
    };
    this.aiToolUsage.set(id, updated);
    return updated;
  }

  async createAiToolRating(ratingData: InsertAiToolRating): Promise<AiToolRating> {
    const id = this.generateId();
    const rating: AiToolRating = {
      id,
      ...ratingData,
      review: ratingData.review || null,
      isHelpful: ratingData.isHelpful || null,
      improvementSuggestions: ratingData.improvementSuggestions || null,
      createdAt: new Date(),
    };
    this.aiToolRatings.set(id, rating);
    return rating;
  }

  // Freelancer operations
  async createFreelancerProfile(profileData: InsertFreelancerProfile): Promise<FreelancerProfile> {
    const id = this.generateId();
    const profile: FreelancerProfile = {
      id,
      ...profileData,
      isVerified: profileData.isVerified ?? false,
      verificationLevel: profileData.verificationLevel || "basic",
      specializations: profileData.specializations || [],
      hourlyRate: profileData.hourlyRate || null,
      currency: profileData.currency || "USD",
      availability: profileData.availability || "available",
      portfolio: profileData.portfolio || null,
      completedJobs: profileData.completedJobs || 0,
      averageRating: profileData.averageRating || null,
      totalEarnings: profileData.totalEarnings || "0",
      responseTime: profileData.responseTime || null,
      languages: profileData.languages || [],
      timezone: profileData.timezone || null,
      isActive: profileData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.freelancerProfiles.set(id, profile);
    return profile;
  }

  async getFreelancerProfile(userId: string): Promise<FreelancerProfile | undefined> {
    return Array.from(this.freelancerProfiles.values()).find(profile => profile.userId === userId);
  }

  async getFreelancerProfiles(filters?: { skills?: string[]; verified?: boolean }): Promise<FreelancerProfile[]> {
    let profiles = Array.from(this.freelancerProfiles.values()).filter(profile => profile.isActive);
    
    if (filters?.verified !== undefined) {
      profiles = profiles.filter(profile => profile.isVerified === filters.verified);
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      profiles = profiles.filter(profile => 
        filters.skills!.some(skill => profile.skills.includes(skill))
      );
    }
    
    return profiles;
  }

  async updateFreelancerProfile(userId: string, profileData: Partial<InsertFreelancerProfile>): Promise<FreelancerProfile> {
    const existing = Array.from(this.freelancerProfiles.values()).find(profile => profile.userId === userId);
    if (!existing) {
      throw new Error("Freelancer profile not found");
    }
    
    const updated: FreelancerProfile = {
      ...existing,
      ...profileData,
      updatedAt: new Date(),
    };
    this.freelancerProfiles.set(existing.id, updated);
    return updated;
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.generateId();
    const project: Project = {
      id,
      ...projectData,
      freelancerId: projectData.freelancerId || null,
      budget: projectData.budget || null,
      budgetType: projectData.budgetType || "fixed",
      currency: projectData.currency || "USD",
      deadline: projectData.deadline || null,
      status: projectData.status || "draft",
      priority: projectData.priority || "medium",
      isPublic: projectData.isPublic ?? true,
      isVerifiedOnly: projectData.isVerifiedOnly ?? false,
      applicationCount: projectData.applicationCount || 0,
      attachments: projectData.attachments || [],
      estimatedHours: projectData.estimatedHours || null,
      actualHours: projectData.actualHours || null,
      milestones: projectData.milestones || null,
      tags: projectData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProjects(filters?: { status?: string; skills?: string[]; clientId?: string }): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    
    if (filters?.status) {
      projects = projects.filter(project => project.status === filters.status);
    }
    
    if (filters?.clientId) {
      projects = projects.filter(project => project.clientId === filters.clientId);
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      projects = projects.filter(project => 
        filters.skills!.some(skill => project.skills.includes(skill))
      );
    }
    
    return projects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async updateProject(id: string, projectData: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error("Project not found");
    }
    
    const updated: Project = {
      ...existing,
      ...projectData,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async createProjectApplication(applicationData: InsertProjectApplication): Promise<ProjectApplication> {
    const id = this.generateId();
    const application: ProjectApplication = {
      id,
      ...applicationData,
      proposedBudget: applicationData.proposedBudget || null,
      proposedTimeline: applicationData.proposedTimeline || null,
      portfolio: applicationData.portfolio || null,
      status: applicationData.status || "pending",
      clientNotes: applicationData.clientNotes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projectApplications.set(id, application);
    return application;
  }

  async getProjectApplications(projectId: string): Promise<ProjectApplication[]> {
    return Array.from(this.projectApplications.values()).filter(app => app.projectId === projectId);
  }

  async createProjectReview(reviewData: InsertProjectReview): Promise<ProjectReview> {
    const id = this.generateId();
    const review: ProjectReview = {
      id,
      ...reviewData,
      review: reviewData.review || null,
      skills: reviewData.skills || null,
      wouldWorkAgain: reviewData.wouldWorkAgain || null,
      isPublic: reviewData.isPublic ?? true,
      createdAt: new Date(),
    };
    this.projectReviews.set(id, review);
    return review;
  }

  // Collaboration operations
  async createCollaborationSpace(spaceData: InsertCollaborationSpace): Promise<CollaborationSpace> {
    const id = this.generateId();
    const space: CollaborationSpace = {
      id,
      ...spaceData,
      description: spaceData.description || null,
      isPublic: spaceData.isPublic ?? false,
      inviteCode: spaceData.inviteCode || null,
      maxMembers: spaceData.maxMembers || 10,
      memberCount: spaceData.memberCount || 1,
      tags: spaceData.tags || [],
      category: spaceData.category || null,
      rules: spaceData.rules || null,
      isActive: spaceData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.collaborationSpaces.set(id, space);
    return space;
  }

  async getCollaborationSpaces(userId: string): Promise<CollaborationSpace[]> {
    const memberSpaces = Array.from(this.collaborationMembers.values())
      .filter(member => member.userId === userId && member.isActive)
      .map(member => member.spaceId);
    
    return Array.from(this.collaborationSpaces.values())
      .filter(space => space.ownerId === userId || memberSpaces.includes(space.id));
  }

  async getCollaborationSpace(id: string): Promise<CollaborationSpace | undefined> {
    return this.collaborationSpaces.get(id);
  }

  async createCollaborationMember(memberData: InsertCollaborationMember): Promise<CollaborationMember> {
    const id = this.generateId();
    const member: CollaborationMember = {
      id,
      ...memberData,
      role: memberData.role || "member",
      permissions: memberData.permissions || [],
      lastActive: memberData.lastActive || new Date(),
      isActive: memberData.isActive ?? true,
      joinedAt: new Date(),
    };
    this.collaborationMembers.set(id, member);
    return member;
  }

  async createCollaborationTask(taskData: InsertCollaborationTask): Promise<CollaborationTask> {
    const id = this.generateId();
    const task: CollaborationTask = {
      id,
      ...taskData,
      description: taskData.description || null,
      assignedTo: taskData.assignedTo || null,
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      tags: taskData.tags || [],
      dueDate: taskData.dueDate || null,
      estimatedHours: taskData.estimatedHours || null,
      actualHours: taskData.actualHours || null,
      attachments: taskData.attachments || [],
      dependencies: taskData.dependencies || [],
      progress: taskData.progress || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };
    this.collaborationTasks.set(id, task);
    return task;
  }

  async getCollaborationTasks(spaceId: string): Promise<CollaborationTask[]> {
    return Array.from(this.collaborationTasks.values()).filter(task => task.spaceId === spaceId);
  }

  async createCollaborationMessage(messageData: InsertCollaborationMessage): Promise<CollaborationMessage> {
    const id = this.generateId();
    const message: CollaborationMessage = {
      id,
      ...messageData,
      taskId: messageData.taskId || null,
      messageType: messageData.messageType || "text",
      attachments: messageData.attachments || [],
      mentions: messageData.mentions || [],
      isEdited: messageData.isEdited ?? false,
      editedAt: null,
      createdAt: new Date(),
    };
    this.collaborationMessages.set(id, message);
    return message;
  }

  async getCollaborationMessages(spaceId: string, taskId?: string): Promise<CollaborationMessage[]> {
    let messages = Array.from(this.collaborationMessages.values()).filter(msg => msg.spaceId === spaceId);
    
    if (taskId) {
      messages = messages.filter(msg => msg.taskId === taskId);
    }
    
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Verification operations
  async createVerificationRequest(requestData: InsertVerificationRequest): Promise<VerificationRequest> {
    const id = this.generateId();
    const request: VerificationRequest = {
      id,
      ...requestData,
      status: requestData.status || "pending",
      reviewedBy: requestData.reviewedBy || null,
      reviewNotes: requestData.reviewNotes || null,
      expiresAt: requestData.expiresAt || null,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.verificationRequests.set(id, request);
    return request;
  }

  async getVerificationRequests(): Promise<VerificationRequest[]> {
    return Array.from(this.verificationRequests.values());
  }
}

export const storage = new MemStorage();

// Initialize default data
async function initializeDefaultData() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      console.log("Creating default admin user...");
      
      // Create default admin user
      await storage.createUser({
        username: "admin",
        email: "admin@ownersalliance.com",
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "admin",
        firstName: "System",
        lastName: "Administrator",
        profileImageUrl: null,
        isActive: true,
        department: "Administration",
        specialization: "System Management",
        staffId: "ADMIN-001",
        phoneNumber: null,
        officeLocation: null,
        emergencyContact: null,
        certifications: [],
        discordId: null,
        discordUsername: null,
        discordDiscriminator: null,
        discordAvatar: null,
      });

      console.log("Default admin user created successfully");
    }

    // Create some default staff users for testing
    const existingStaff = await storage.getUserByUsername("staff");
    if (!existingStaff) {
      console.log("Creating default staff user...");
      
      await storage.createUser({
        username: "staff",
        email: "staff@ownersalliance.com", 
        passwordHash: await bcrypt.hash("staff123", 10),
        role: "staff",
        firstName: "John",
        lastName: "Staff",
        profileImageUrl: null,
        isActive: true,
        department: "Case Management",
        specialization: "Fraud Investigation",
        staffId: "STAFF-001",
        phoneNumber: null,
        officeLocation: null,
        emergencyContact: null,
        certifications: [],
        discordId: null,
        discordUsername: null,
        discordDiscriminator: null,
        discordAvatar: null,
      });

      console.log("Default staff user created successfully");
    }

    console.log("Default data initialization completed");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}

// Initialize data after a small delay to ensure everything is set up
setTimeout(initializeDefaultData, 1000);