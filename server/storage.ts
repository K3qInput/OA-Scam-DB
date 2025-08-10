import {
  users,
  cases,
  evidence,
  altAccounts,
  appeals,
  passwordResetRequests,
  caseUpdates,
  contactMessages,
  staffAssignments,
  tribunalProceedings,
  vouches,
  disputeResolutions,
  disputeVotes,
  altDetectionReports,
  userSessions,
  staffPermissions,
  staffPerformance,
  utilityCategories,
  utilityDocuments,
  documentRatings,
  userReputation,
  auditLogs,
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
} from "@shared/schema";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Case operations
  getCase(id: string): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User; evidence: Evidence[] }) | undefined>;
  getCases(filters?: {
    status?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User })[]>;
  getCaseCount(filters?: { status?: string; type?: string; search?: string }): Promise<number>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<InsertCase>): Promise<Case>;
  generateCaseNumber(): Promise<string>;

  // Evidence operations
  createEvidence(evidenceData: InsertEvidence): Promise<Evidence>;
  getEvidenceByCase(caseId: string): Promise<Evidence[]>;
  deleteEvidence(id: string): Promise<void>;

  // Alt account operations
  getAltAccounts(userId: string): Promise<(AltAccount & { primaryUser: User; altUser: User })[]>;
  createAltAccount(altAccountData: InsertAltAccount): Promise<AltAccount>;
  updateAltAccount(id: string, updates: Partial<InsertAltAccount>): Promise<AltAccount>;

  // Appeal operations
  getAppeals(caseId?: string): Promise<(Appeal & { case: Case; appealedByUser: User })[]>;
  createAppeal(appealData: InsertAppeal): Promise<Appeal>;
  updateAppeal(id: string, updates: Partial<InsertAppeal>): Promise<Appeal>;

  // Password reset operations
  createPasswordResetRequest(request: InsertPasswordResetRequest): Promise<PasswordResetRequest>;
  getPasswordResetRequest(id: string): Promise<PasswordResetRequest | undefined>;
  updatePasswordResetRequest(id: string, updates: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest>;

  // Case update operations
  createCaseUpdate(update: InsertCaseUpdate): Promise<CaseUpdate>;
  getCaseUpdates(caseId: string): Promise<CaseUpdate[]>;

  // Contact message operations
  getContactMessages(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: string, updates: Partial<InsertContactMessage>): Promise<ContactMessage>;

  // Staff assignment operations
  getStaffAssignments(staffId?: string, caseId?: string): Promise<StaffAssignment[]>;
  createStaffAssignment(assignment: InsertStaffAssignment): Promise<StaffAssignment>;
  updateStaffAssignment(id: string, updates: Partial<InsertStaffAssignment>): Promise<StaffAssignment>;

  // Tribunal proceedings operations
  getTribunalProceedings(caseId?: string): Promise<TribunalProceeding[]>;
  createTribunalProceeding(proceeding: InsertTribunalProceeding): Promise<TribunalProceeding>;
  updateTribunalProceeding(id: string, updates: Partial<InsertTribunalProceeding>): Promise<TribunalProceeding>;

  // Vouch/Devouch system
  getVouches(targetUserId: string): Promise<(Vouch & { voucherUser: User })[]>;
  createVouch(vouch: InsertVouch): Promise<Vouch>;
  getVouchByUsers(targetUserId: string, voucherUserId: string): Promise<Vouch | undefined>;
  updateVouch(id: string, updates: Partial<InsertVouch>): Promise<Vouch>;

  // Dispute resolution system
  getActiveDisputes(): Promise<(DisputeResolution & { votes: DisputeVote[] })[]>;
  createDisputeResolution(dispute: InsertDisputeResolution): Promise<DisputeResolution>;
  updateDisputeResolution(id: string, updates: Partial<InsertDisputeResolution>): Promise<DisputeResolution>;
  createDisputeVote(vote: InsertDisputeVote): Promise<DisputeVote>;
  getDisputeVotes(disputeId: string): Promise<DisputeVote[]>;

  // Alt detection system
  getAltDetectionReports(status?: string): Promise<AltDetectionReport[]>;
  createAltDetectionReport(report: InsertAltDetectionReport): Promise<AltDetectionReport>;
  updateAltDetectionReport(id: string, updates: Partial<InsertAltDetectionReport>): Promise<AltDetectionReport>;

  // User session tracking
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  updateUserSession(id: string, updates: Partial<InsertUserSession>): Promise<UserSession>;

  // Staff management
  getStaffPermissions(userId: string): Promise<StaffPermission[]>;
  createStaffPermission(permission: InsertStaffPermission): Promise<StaffPermission>;
  getStaffPerformance(staffId: string, period?: string): Promise<StaffPerformance[]>;
  createStaffPerformance(performance: InsertStaffPerformance): Promise<StaffPerformance>;

  // Utility system
  getUtilityCategories(): Promise<UtilityCategory[]>;
  createUtilityCategory(category: InsertUtilityCategory): Promise<UtilityCategory>;
  getUtilityDocuments(categoryId?: string): Promise<(UtilityDocument & { category: UtilityCategory; author: User })[]>;
  createUtilityDocument(document: InsertUtilityDocument): Promise<UtilityDocument>;
  updateUtilityDocument(id: string, updates: Partial<InsertUtilityDocument>): Promise<UtilityDocument>;
  createDocumentRating(rating: InsertDocumentRating): Promise<DocumentRating>;

  // User reputation system
  getUserReputation(userId: string): Promise<UserReputation | undefined>;
  createUserReputation(reputation: InsertUserReputation): Promise<UserReputation>;
  updateUserReputation(userId: string, updates: Partial<InsertUserReputation>): Promise<UserReputation>;

  // Audit logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId?: string, entityType?: string): Promise<AuditLog[]>;

  // Additional missing methods for routes compatibility
  getPasswordResetRequests(status?: string): Promise<PasswordResetRequest[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  getStaffMembers(): Promise<User[]>;
  getStatistics(): Promise<any>;
  getDashboardStatistics(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private cases: Case[] = [];
  private evidence: Evidence[] = [];
  private altAccounts: AltAccount[] = [];
  private appeals: Appeal[] = [];
  private passwordResetRequests: PasswordResetRequest[] = [];
  private caseUpdates: CaseUpdate[] = [];
  private contactMessages: ContactMessage[] = [];
  private staffAssignments: StaffAssignment[] = [];
  private tribunalProceedings: TribunalProceeding[] = [];
  private vouches: Vouch[] = [];
  private disputeResolutions: DisputeResolution[] = [];
  private disputeVotes: DisputeVote[] = [];
  private altDetectionReports: AltDetectionReport[] = [];
  private userSessions: UserSession[] = [];
  private staffPermissions: StaffPermission[] = [];
  private staffPerformance: StaffPerformance[] = [];
  private utilityCategories: UtilityCategory[] = [];
  private utilityDocuments: UtilityDocument[] = [];
  private documentRatings: DocumentRating[] = [];
  private userReputation: UserReputation[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      email: "admin@tribunal.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: null,
      isActive: true,
      department: "administration",
      specialization: "system_management",
      staffId: "STAFF-001",
      phoneNumber: "+1-555-0001",
      officeLocation: "Main Office",
      emergencyContact: "+1-555-0002",
      certifications: ["Admin Certification"],
      discordId: null,
      discordUsername: null,
      discordDiscriminator: null,
      discordAvatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create sample tribunal head
    const tribunalHead: User = {
      id: "tribunal-1",
      username: "tribunal_head",
      email: "head@tribunal.com",
      passwordHash: await bcrypt.hash("tribunal123", 10),
      role: "tribunal_head",
      firstName: "Tribunal",
      lastName: "Head",
      profileImageUrl: null,
      isActive: true,
      department: "tribunal",
      specialization: "case_review",
      staffId: "STAFF-002",
      phoneNumber: "+1-555-0003",
      officeLocation: "Tribunal Chamber",
      emergencyContact: "+1-555-0004",
      certifications: ["Tribunal Leadership", "Case Management"],
      discordId: null,
      discordUsername: null,
      discordDiscriminator: null,
      discordAvatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create sample staff user
    const staffUser: User = {
      id: "staff-1",
      username: "staff_member",
      email: "staff@tribunal.com",
      passwordHash: await bcrypt.hash("staff123", 10),
      role: "staff",
      firstName: "Staff",
      lastName: "Member",
      profileImageUrl: null,
      isActive: true,
      department: "investigation",
      specialization: "financial_crimes",
      staffId: "STAFF-003",
      phoneNumber: "+1-555-0005",
      officeLocation: "Investigation Unit",
      emergencyContact: "+1-555-0006",
      certifications: ["Financial Crime Investigation"],
      discordId: null,
      discordUsername: null,
      discordDiscriminator: null,
      discordAvatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create sample regular user
    const regularUser: User = {
      id: "user-1",
      username: "john_doe",
      email: "john@example.com",
      passwordHash: await bcrypt.hash("user123", 10),
      role: "user",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: null,
      isActive: true,
      department: null,
      specialization: null,
      staffId: null,
      phoneNumber: null,
      officeLocation: null,
      emergencyContact: null,
      certifications: [],
      discordId: "123456789",
      discordUsername: "johndoe",
      discordDiscriminator: "0001",
      discordAvatar: "avatar_hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [adminUser, tribunalHead, staffUser, regularUser];

    // Initialize utility categories
    const categories: UtilityCategory[] = [
      {
        id: "cat-1",
        name: "Staff Guides",
        description: "Comprehensive guides for staff members",
        icon: "book",
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "cat-2",
        name: "Case Management",
        description: "Resources for managing cases effectively",
        icon: "folder",
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "cat-3",
        name: "Legal Resources",
        description: "Legal documentation and procedures",
        icon: "scale",
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
      }
    ];

    this.utilityCategories = categories;

    // Create reputation records for all users
    this.userReputation = this.users.map(user => ({
      id: `rep-${user.id}`,
      userId: user.id,
      reputationScore: user.role === "admin" ? 1000 : user.role === "tribunal_head" ? 800 : user.role === "staff" ? 500 : 100,
      vouchesReceived: 0,
      devouchesReceived: 0,
      casesReported: 0,
      validReports: 0,
      falseReports: 0,
      communityScore: 0,
      trustLevel: user.role === "admin" ? "platinum" : user.role === "tribunal_head" ? "gold" : user.role === "staff" ? "silver" : "bronze",
      lastCalculated: new Date(),
      updatedAt: new Date(),
    }));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return this.users.find(u => u.discordId === discordId);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    
    // Create initial reputation
    const reputation: UserReputation = {
      id: `rep-${newUser.id}`,
      userId: newUser.id,
      reputationScore: 100,
      vouchesReceived: 0,
      devouchesReceived: 0,
      casesReported: 0,
      validReports: 0,
      falseReports: 0,
      communityScore: 0,
      trustLevel: "bronze",
      lastCalculated: new Date(),
      updatedAt: new Date(),
    };
    this.userReputation.push(reputation);
    
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error("User not found");
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.users[userIndex];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.username === username);
    if (!user || !user.passwordHash) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  // Case operations
  async getCase(id: string): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User; evidence: Evidence[] }) | undefined> {
    const caseItem = this.cases.find(c => c.id === id);
    if (!caseItem) return undefined;

    const reportedUser = await this.getUser(caseItem.reportedUserId);
    const reporterUser = await this.getUser(caseItem.reporterUserId);
    const staffUser = caseItem.staffUserId ? await this.getUser(caseItem.staffUserId) : undefined;
    const evidence = await this.getEvidenceByCase(id);

    if (!reportedUser || !reporterUser) return undefined;

    return {
      ...caseItem,
      reportedUser,
      reporterUser,
      staffUser,
      evidence,
    };
  }

  async getCases(filters?: {
    status?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User })[]> {
    let filteredCases = this.cases;

    if (filters?.status) {
      filteredCases = filteredCases.filter(c => c.status === filters.status);
    }
    if (filters?.type) {
      filteredCases = filteredCases.filter(c => c.type === filters.type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredCases = filteredCases.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.caseNumber.toLowerCase().includes(search)
      );
    }

    // Sort by creation date (newest first)
    filteredCases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.offset) {
      filteredCases = filteredCases.slice(filters.offset);
    }
    if (filters?.limit) {
      filteredCases = filteredCases.slice(0, filters.limit);
    }

    const enrichedCases = await Promise.all(
      filteredCases.map(async (caseItem) => {
        const reportedUser = await this.getUser(caseItem.reportedUserId);
        const reporterUser = await this.getUser(caseItem.reporterUserId);
        const staffUser = caseItem.staffUserId ? await this.getUser(caseItem.staffUserId) : undefined;

        return {
          ...caseItem,
          reportedUser: reportedUser!,
          reporterUser: reporterUser!,
          staffUser,
        };
      })
    );

    return enrichedCases;
  }

  async getCaseCount(filters?: { status?: string; type?: string; search?: string }): Promise<number> {
    let filteredCases = this.cases;

    if (filters?.status) {
      filteredCases = filteredCases.filter(c => c.status === filters.status);
    }
    if (filters?.type) {
      filteredCases = filteredCases.filter(c => c.type === filters.type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredCases = filteredCases.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.caseNumber.toLowerCase().includes(search)
      );
    }

    return filteredCases.length;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const caseNumber = await this.generateCaseNumber();
    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber,
      ...caseData,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    };
    this.cases.push(newCase);
    return newCase;
  }

  async updateCase(id: string, updates: Partial<InsertCase>): Promise<Case> {
    const caseIndex = this.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) throw new Error("Case not found");
    
    this.cases[caseIndex] = {
      ...this.cases[caseIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.cases[caseIndex];
  }

  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const existingCases = this.cases.filter(c => c.caseNumber.startsWith(`TR-${year}`));
    const nextNumber = existingCases.length + 1;
    return `TR-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }

  // Evidence operations
  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const newEvidence: Evidence = {
      id: `evidence-${Date.now()}`,
      ...evidenceData,
      createdAt: new Date(),
    };
    this.evidence.push(newEvidence);
    return newEvidence;
  }

  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    return this.evidence.filter(e => e.caseId === caseId);
  }

  async deleteEvidence(id: string): Promise<void> {
    const index = this.evidence.findIndex(e => e.id === id);
    if (index !== -1) {
      this.evidence.splice(index, 1);
    }
  }

  // Alt account operations
  async getAltAccounts(userId: string): Promise<(AltAccount & { primaryUser: User; altUser: User })[]> {
    const alts = this.altAccounts.filter(a => a.primaryUserId === userId || a.altUserId === userId);
    
    const enrichedAlts = await Promise.all(
      alts.map(async (alt) => {
        const primaryUser = await this.getUser(alt.primaryUserId);
        const altUser = await this.getUser(alt.altUserId);
        
        return {
          ...alt,
          primaryUser: primaryUser!,
          altUser: altUser!,
        };
      })
    );

    return enrichedAlts;
  }

  async createAltAccount(altAccountData: InsertAltAccount): Promise<AltAccount> {
    const newAltAccount: AltAccount = {
      id: `alt-${Date.now()}`,
      ...altAccountData,
      createdAt: new Date(),
      verifiedAt: null,
    };
    this.altAccounts.push(newAltAccount);
    return newAltAccount;
  }

  async updateAltAccount(id: string, updates: Partial<InsertAltAccount>): Promise<AltAccount> {
    const index = this.altAccounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Alt account not found");
    
    this.altAccounts[index] = {
      ...this.altAccounts[index],
      ...updates,
    };
    return this.altAccounts[index];
  }

  // Appeal operations
  async getAppeals(caseId?: string): Promise<(Appeal & { case: Case; appealedByUser: User })[]> {
    let appeals = this.appeals;
    if (caseId) {
      appeals = appeals.filter(a => a.caseId === caseId);
    }

    const enrichedAppeals = await Promise.all(
      appeals.map(async (appeal) => {
        const caseItem = this.cases.find(c => c.id === appeal.caseId);
        const appealedByUser = await this.getUser(appeal.appealedBy);
        
        return {
          ...appeal,
          case: caseItem!,
          appealedByUser: appealedByUser!,
        };
      })
    );

    return enrichedAppeals;
  }

  async createAppeal(appealData: InsertAppeal): Promise<Appeal> {
    const newAppeal: Appeal = {
      id: `appeal-${Date.now()}`,
      ...appealData,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.appeals.push(newAppeal);
    return newAppeal;
  }

  async updateAppeal(id: string, updates: Partial<InsertAppeal>): Promise<Appeal> {
    const index = this.appeals.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Appeal not found");
    
    this.appeals[index] = {
      ...this.appeals[index],
      ...updates,
    };
    return this.appeals[index];
  }

  // Password reset operations
  async createPasswordResetRequest(request: InsertPasswordResetRequest): Promise<PasswordResetRequest> {
    const newRequest: PasswordResetRequest = {
      id: `reset-${Date.now()}`,
      ...request,
      token: null,
      expiresAt: null,
      createdAt: new Date(),
      approvedAt: null,
    };
    this.passwordResetRequests.push(newRequest);
    return newRequest;
  }

  async getPasswordResetRequest(id: string): Promise<PasswordResetRequest | undefined> {
    return this.passwordResetRequests.find(r => r.id === id);
  }

  async updatePasswordResetRequest(id: string, updates: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest> {
    const index = this.passwordResetRequests.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Password reset request not found");
    
    this.passwordResetRequests[index] = {
      ...this.passwordResetRequests[index],
      ...updates,
    };
    return this.passwordResetRequests[index];
  }

  // Case update operations
  async createCaseUpdate(update: InsertCaseUpdate): Promise<CaseUpdate> {
    const newUpdate: CaseUpdate = {
      id: `update-${Date.now()}`,
      ...update,
      createdAt: new Date(),
    };
    this.caseUpdates.push(newUpdate);
    return newUpdate;
  }

  async getCaseUpdates(caseId: string): Promise<CaseUpdate[]> {
    return this.caseUpdates.filter(u => u.caseId === caseId);
  }

  // Contact message operations
  async getContactMessages(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContactMessage[]> {
    let messages = this.contactMessages;

    if (filters?.status) {
      messages = messages.filter(m => m.status === filters.status);
    }
    if (filters?.priority) {
      messages = messages.filter(m => m.priority === filters.priority);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      messages = messages.filter(m => 
        m.subject.toLowerCase().includes(search) ||
        m.message.toLowerCase().includes(search) ||
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search)
      );
    }

    // Sort by creation date (newest first)
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.offset) {
      messages = messages.slice(filters.offset);
    }
    if (filters?.limit) {
      messages = messages.slice(0, filters.limit);
    }

    return messages;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      id: `contact-${Date.now()}`,
      ...message,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    };
    this.contactMessages.push(newMessage);
    return newMessage;
  }

  async updateContactMessage(id: string, updates: Partial<InsertContactMessage>): Promise<ContactMessage> {
    const index = this.contactMessages.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Contact message not found");
    
    this.contactMessages[index] = {
      ...this.contactMessages[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.contactMessages[index];
  }

  // Staff assignment operations
  async getStaffAssignments(staffId?: string, caseId?: string): Promise<StaffAssignment[]> {
    let assignments = this.staffAssignments;
    
    if (staffId) {
      assignments = assignments.filter(a => a.staffId === staffId);
    }
    if (caseId) {
      assignments = assignments.filter(a => a.caseId === caseId);
    }

    return assignments;
  }

  async createStaffAssignment(assignment: InsertStaffAssignment): Promise<StaffAssignment> {
    const newAssignment: StaffAssignment = {
      id: `assignment-${Date.now()}`,
      ...assignment,
      assignedAt: new Date(),
      completedAt: null,
    };
    this.staffAssignments.push(newAssignment);
    return newAssignment;
  }

  async updateStaffAssignment(id: string, updates: Partial<InsertStaffAssignment>): Promise<StaffAssignment> {
    const index = this.staffAssignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Staff assignment not found");
    
    this.staffAssignments[index] = {
      ...this.staffAssignments[index],
      ...updates,
    };
    return this.staffAssignments[index];
  }

  // Tribunal proceedings operations
  async getTribunalProceedings(caseId?: string): Promise<TribunalProceeding[]> {
    let proceedings = this.tribunalProceedings;
    
    if (caseId) {
      proceedings = proceedings.filter(p => p.caseId === caseId);
    }

    return proceedings;
  }

  async createTribunalProceeding(proceeding: InsertTribunalProceeding): Promise<TribunalProceeding> {
    const newProceeding: TribunalProceeding = {
      id: `proceeding-${Date.now()}`,
      ...proceeding,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tribunalProceedings.push(newProceeding);
    return newProceeding;
  }

  async updateTribunalProceeding(id: string, updates: Partial<InsertTribunalProceeding>): Promise<TribunalProceeding> {
    const index = this.tribunalProceedings.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Tribunal proceeding not found");
    
    this.tribunalProceedings[index] = {
      ...this.tribunalProceedings[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.tribunalProceedings[index];
  }

  // Vouch/Devouch system
  async getVouches(targetUserId: string): Promise<(Vouch & { voucherUser: User })[]> {
    const vouches = this.vouches.filter(v => v.targetUserId === targetUserId);
    
    const enrichedVouches = await Promise.all(
      vouches.map(async (vouch) => {
        const voucherUser = await this.getUser(vouch.voucherUserId);
        return {
          ...vouch,
          voucherUser: voucherUser!,
        };
      })
    );

    return enrichedVouches;
  }

  async createVouch(vouch: InsertVouch): Promise<Vouch> {
    // Check if this user already vouched/devouched this target
    const existingVouch = await this.getVouchByUsers(vouch.targetUserId, vouch.voucherUserId);
    if (existingVouch) {
      throw new Error("You have already vouched or devouched this user");
    }

    const newVouch: Vouch = {
      id: `vouch-${Date.now()}`,
      ...vouch,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vouches.push(newVouch);

    // Update target user's reputation
    await this.updateUserReputationAfterVouch(vouch.targetUserId, vouch.status, vouch.weight || 1);

    return newVouch;
  }

  async getVouchByUsers(targetUserId: string, voucherUserId: string): Promise<Vouch | undefined> {
    return this.vouches.find(v => v.targetUserId === targetUserId && v.voucherUserId === voucherUserId);
  }

  async updateVouch(id: string, updates: Partial<InsertVouch>): Promise<Vouch> {
    const index = this.vouches.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Vouch not found");
    
    this.vouches[index] = {
      ...this.vouches[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.vouches[index];
  }

  private async updateUserReputationAfterVouch(targetUserId: string, status: string, weight: number) {
    const reputation = this.userReputation.find(r => r.userId === targetUserId);
    if (!reputation) return;

    if (status === "vouched") {
      reputation.vouchesReceived += 1;
      reputation.reputationScore += (weight * 10);
    } else if (status === "devouched") {
      reputation.devouchesReceived += 1;
      reputation.reputationScore -= (weight * 15);
    }

    // Update trust level based on reputation score
    if (reputation.reputationScore >= 1000) reputation.trustLevel = "platinum";
    else if (reputation.reputationScore >= 500) reputation.trustLevel = "gold";
    else if (reputation.reputationScore >= 200) reputation.trustLevel = "silver";
    else reputation.trustLevel = "bronze";

    reputation.updatedAt = new Date();
  }

  // Dispute resolution system
  async getActiveDisputes(): Promise<(DisputeResolution & { votes: DisputeVote[] })[]> {
    const activeDisputes = this.disputeResolutions.filter(d => 
      d.status === "active" && new Date(d.votingEndDate) > new Date()
    );

    const enrichedDisputes = await Promise.all(
      activeDisputes.map(async (dispute) => {
        const votes = await this.getDisputeVotes(dispute.id);
        return {
          ...dispute,
          votes,
        };
      })
    );

    return enrichedDisputes;
  }

  async createDisputeResolution(dispute: InsertDisputeResolution): Promise<DisputeResolution> {
    const newDispute: DisputeResolution = {
      id: `dispute-${Date.now()}`,
      ...dispute,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.disputeResolutions.push(newDispute);
    return newDispute;
  }

  async updateDisputeResolution(id: string, updates: Partial<InsertDisputeResolution>): Promise<DisputeResolution> {
    const index = this.disputeResolutions.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Dispute resolution not found");
    
    this.disputeResolutions[index] = {
      ...this.disputeResolutions[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.disputeResolutions[index];
  }

  async createDisputeVote(vote: InsertDisputeVote): Promise<DisputeVote> {
    // Check if this voter hash already voted on this dispute
    const existingVote = this.disputeVotes.find(v => 
      v.disputeId === vote.disputeId && v.voterHash === vote.voterHash
    );
    if (existingVote) {
      throw new Error("You have already voted on this dispute");
    }

    const newVote: DisputeVote = {
      id: `vote-${Date.now()}`,
      ...vote,
      createdAt: new Date(),
    };
    this.disputeVotes.push(newVote);
    return newVote;
  }

  async getDisputeVotes(disputeId: string): Promise<DisputeVote[]> {
    return this.disputeVotes.filter(v => v.disputeId === disputeId);
  }

  // Alt detection system
  async getAltDetectionReports(status?: string): Promise<AltDetectionReport[]> {
    let reports = this.altDetectionReports;
    
    if (status) {
      reports = reports.filter(r => r.status === status);
    }

    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAltDetectionReport(report: InsertAltDetectionReport): Promise<AltDetectionReport> {
    const newReport: AltDetectionReport = {
      id: `alt-report-${Date.now()}`,
      ...report,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.altDetectionReports.push(newReport);
    return newReport;
  }

  async updateAltDetectionReport(id: string, updates: Partial<InsertAltDetectionReport>): Promise<AltDetectionReport> {
    const index = this.altDetectionReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Alt detection report not found");
    
    this.altDetectionReports[index] = {
      ...this.altDetectionReports[index],
      ...updates,
    };
    return this.altDetectionReports[index];
  }

  // User session tracking
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const newSession: UserSession = {
      id: `session-${Date.now()}`,
      ...session,
      createdAt: new Date(),
    };
    this.userSessions.push(newSession);
    return newSession;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.userSessions.filter(s => s.userId === userId && s.isActive);
  }

  async updateUserSession(id: string, updates: Partial<InsertUserSession>): Promise<UserSession> {
    const index = this.userSessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("User session not found");
    
    this.userSessions[index] = {
      ...this.userSessions[index],
      ...updates,
    };
    return this.userSessions[index];
  }

  // Staff management
  async getStaffPermissions(userId: string): Promise<StaffPermission[]> {
    return this.staffPermissions.filter(p => p.userId === userId && p.isActive);
  }

  async createStaffPermission(permission: InsertStaffPermission): Promise<StaffPermission> {
    const newPermission: StaffPermission = {
      id: `permission-${Date.now()}`,
      ...permission,
      grantedAt: new Date(),
    };
    this.staffPermissions.push(newPermission);
    return newPermission;
  }

  async getStaffPerformance(staffId: string, period?: string): Promise<StaffPerformance[]> {
    let performance = this.staffPerformance.filter(p => p.staffId === staffId);
    
    if (period) {
      performance = performance.filter(p => p.period === period);
    }

    return performance.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createStaffPerformance(performance: InsertStaffPerformance): Promise<StaffPerformance> {
    const newPerformance: StaffPerformance = {
      id: `performance-${Date.now()}`,
      ...performance,
      createdAt: new Date(),
    };
    this.staffPerformance.push(newPerformance);
    return newPerformance;
  }

  // Utility system
  async getUtilityCategories(): Promise<UtilityCategory[]> {
    return this.utilityCategories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createUtilityCategory(category: InsertUtilityCategory): Promise<UtilityCategory> {
    const newCategory: UtilityCategory = {
      id: `category-${Date.now()}`,
      ...category,
      createdAt: new Date(),
    };
    this.utilityCategories.push(newCategory);
    return newCategory;
  }

  async getUtilityDocuments(categoryId?: string): Promise<(UtilityDocument & { category: UtilityCategory; author: User })[]> {
    let documents = this.utilityDocuments;
    
    if (categoryId) {
      documents = documents.filter(d => d.categoryId === categoryId);
    }

    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const category = this.utilityCategories.find(c => c.id === doc.categoryId);
        const author = await this.getUser(doc.authorId);
        
        return {
          ...doc,
          category: category!,
          author: author!,
        };
      })
    );

    return enrichedDocuments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createUtilityDocument(document: InsertUtilityDocument): Promise<UtilityDocument> {
    const newDocument: UtilityDocument = {
      id: `document-${Date.now()}`,
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.utilityDocuments.push(newDocument);
    return newDocument;
  }

  async updateUtilityDocument(id: string, updates: Partial<InsertUtilityDocument>): Promise<UtilityDocument> {
    const index = this.utilityDocuments.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Utility document not found");
    
    this.utilityDocuments[index] = {
      ...this.utilityDocuments[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.utilityDocuments[index];
  }

  async createDocumentRating(rating: InsertDocumentRating): Promise<DocumentRating> {
    const newRating: DocumentRating = {
      id: `rating-${Date.now()}`,
      ...rating,
      createdAt: new Date(),
    };
    this.documentRatings.push(newRating);

    // Update document average rating
    await this.updateDocumentAverageRating(rating.documentId);

    return newRating;
  }

  private async updateDocumentAverageRating(documentId: string) {
    const ratings = this.documentRatings.filter(r => r.documentId === documentId);
    const document = this.utilityDocuments.find(d => d.id === documentId);
    
    if (!document || ratings.length === 0) return;

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    document.rating = Number(averageRating.toFixed(2));
    document.ratingCount = ratings.length;
    document.updatedAt = new Date();
  }

  // User reputation system
  async getUserReputation(userId: string): Promise<UserReputation | undefined> {
    return this.userReputation.find(r => r.userId === userId);
  }

  async createUserReputation(reputation: InsertUserReputation): Promise<UserReputation> {
    const newReputation: UserReputation = {
      id: `reputation-${Date.now()}`,
      ...reputation,
      lastCalculated: new Date(),
      updatedAt: new Date(),
    };
    this.userReputation.push(newReputation);
    return newReputation;
  }

  async updateUserReputation(userId: string, updates: Partial<InsertUserReputation>): Promise<UserReputation> {
    const index = this.userReputation.findIndex(r => r.userId === userId);
    if (index === -1) throw new Error("User reputation not found");
    
    this.userReputation[index] = {
      ...this.userReputation[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.userReputation[index];
  }

  // Audit logging
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      ...log,
      createdAt: new Date(),
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  async getAuditLogs(userId?: string, entityType?: string): Promise<AuditLog[]> {
    let logs = this.auditLogs;
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    if (entityType) {
      logs = logs.filter(l => l.entityType === entityType);
    }

    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Additional missing methods implementation
  async getPasswordResetRequests(status?: string): Promise<PasswordResetRequest[]> {
    let requests = this.passwordResetRequests;
    
    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.find(m => m.id === id);
  }

  async getStaffMembers(): Promise<User[]> {
    return this.users.filter(u => u.role !== "user" && u.isActive);
  }

  async getStatistics(): Promise<any> {
    const totalCases = this.cases.length;
    const pendingCases = this.cases.filter(c => c.status === "pending").length;
    const resolvedCases = this.cases.filter(c => c.status === "resolved").length;
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(u => u.isActive).length;
    const totalVouches = this.vouches.filter(v => v.status === "vouched").length;
    const totalDevouches = this.vouches.filter(v => v.status === "devouched").length;
    const activeDisputes = this.disputeResolutions.filter(d => d.status === "active").length;
    const altReports = this.altDetectionReports.filter(r => r.status === "pending").length;

    return {
      totalCases,
      pendingCases,
      resolvedCases,
      totalUsers,
      activeUsers,
      totalVouches,
      totalDevouches,
      activeDisputes,
      altReports,
      caseResolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(1) : "0",
      averageCaseTime: "3.2 days", // Mock calculation
    };
  }

  async getDashboardStatistics(): Promise<any> {
    return this.getStatistics();
  }
}

export const storage = new MemStorage();