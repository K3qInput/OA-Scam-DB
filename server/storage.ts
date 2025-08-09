import {
  users,
  cases,
  evidence,
  altAccounts,
  appeals,
  passwordResetRequests,
  caseUpdates,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, asc, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

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
  createPasswordResetRequest(requestData: InsertPasswordResetRequest): Promise<PasswordResetRequest>;
  getPasswordResetRequests(): Promise<(PasswordResetRequest & { user: User })[]>;
  updatePasswordResetRequest(id: string, updates: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest>;

  // Case update operations
  createCaseUpdate(updateData: InsertCaseUpdate): Promise<CaseUpdate>;
  getCaseUpdates(caseId: string): Promise<(CaseUpdate & { updatedByUser: User })[]>;

  // Statistics
  getStatistics(): Promise<{
    totalCases: number;
    pendingCases: number;
    verifiedCases: number;
    altAccounts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Only hash password if it's provided (for Discord OAuth users, password might not be set)
    let processedData = { ...userData };
    if (userData.passwordHash) {
      processedData.passwordHash = await bcrypt.hash(userData.passwordHash, 10);
    }
    
    const [user] = await db
      .insert(users)
      .values(processedData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    if (updates.passwordHash) {
      updates.passwordHash = await bcrypt.hash(updates.passwordHash, 10);
    }
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    console.log("Authenticating user:", username);
    try {
      const user = await this.getUserByUsername(username);
      console.log("User found:", !!user, user?.isActive);
      
      if (!user || !user.isActive) {
        console.log("User not found or inactive");
        return null;
      }

      // If user doesn't have a password (Discord OAuth user), deny password login
      if (!user.passwordHash) {
        console.log("User has no password (Discord OAuth user)");
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log("Password valid:", isValid);
      return isValid ? user : null;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  async getCase(id: string): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User; evidence: Evidence[] }) | undefined> {
    const [result] = await db
      .select()
      .from(cases)
      .leftJoin(users, eq(cases.reportedUserId, users.id))
      .where(eq(cases.id, id));

    if (!result) return undefined;

    const reportedUser = await this.getUser(result.cases.reportedUserId);
    const reporterUser = await this.getUser(result.cases.reporterUserId);
    const staffUser = result.cases.staffUserId ? await this.getUser(result.cases.staffUserId) : undefined;
    const evidenceList = await this.getEvidenceByCase(id);

    return {
      ...result.cases,
      reportedUser: reportedUser!,
      reporterUser: reporterUser!,
      staffUser,
      evidence: evidenceList,
    };
  }

  async getCases(filters?: {
    status?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<(Case & { reportedUser: User; reporterUser: User; staffUser?: User })[]> {
    let query = db.select().from(cases).orderBy(cases.createdAt);

    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(cases.status, filters.status as any));
    }
    if (filters?.type) {
      conditions.push(eq(cases.type, filters.type as any));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(cases.title, `%${filters.search}%`),
          like(cases.description, `%${filters.search}%`),
          like(cases.caseNumber, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(cases.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;

    // Fetch related users for each case
    const enrichedCases = await Promise.all(
      results.map(async (caseItem) => {
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
    let query = db.select({ count: count() }).from(cases);

    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(cases.status, filters.status as any));
    }
    if (filters?.type) {
      conditions.push(eq(cases.type, filters.type as any));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(cases.title, `%${filters.search}%`),
          like(cases.description, `%${filters.search}%`),
          like(cases.caseNumber, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const [result] = await query;
    return result.count;
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const caseNumber = await this.generateCaseNumber();
    const [newCase] = await db
      .insert(cases)
      .values({ ...caseData, caseNumber })
      .returning();
    return newCase;
  }

  async updateCase(id: string, updates: Partial<InsertCase>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await db
      .select({ count: count() })
      .from(cases)
      .where(sql`EXTRACT(YEAR FROM created_at) = ${year}`);
    
    const nextNumber = (result.count + 1).toString().padStart(4, '0');
    return `SC-${year}-${nextNumber}`;
  }

  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const [newEvidence] = await db.insert(evidence).values(evidenceData).returning();
    return newEvidence;
  }

  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    return await db.select().from(evidence).where(eq(evidence.caseId, caseId));
  }

  async deleteEvidence(id: string): Promise<void> {
    await db.delete(evidence).where(eq(evidence.id, id));
  }

  async getAltAccounts(userId: string): Promise<(AltAccount & { primaryUser: User; altUser: User })[]> {
    const results = await db
      .select()
      .from(altAccounts)
      .where(or(eq(altAccounts.primaryUserId, userId), eq(altAccounts.altUserId, userId)));

    const enrichedResults = await Promise.all(
      results.map(async (altAccount) => {
        const primaryUser = await this.getUser(altAccount.primaryUserId);
        const altUser = await this.getUser(altAccount.altUserId);
        return {
          ...altAccount,
          primaryUser: primaryUser!,
          altUser: altUser!,
        };
      })
    );

    return enrichedResults;
  }

  async createAltAccount(altAccountData: InsertAltAccount): Promise<AltAccount> {
    const [newAltAccount] = await db.insert(altAccounts).values(altAccountData).returning();
    return newAltAccount;
  }

  async updateAltAccount(id: string, updates: Partial<InsertAltAccount>): Promise<AltAccount> {
    const [updatedAltAccount] = await db
      .update(altAccounts)
      .set(updates)
      .where(eq(altAccounts.id, id))
      .returning();
    return updatedAltAccount;
  }

  async getAppeals(caseId?: string): Promise<(Appeal & { case: Case; appealedByUser: User })[]> {
    let query = db.select().from(appeals);
    
    if (caseId) {
      query = query.where(eq(appeals.caseId, caseId));
    }

    const results = await query.orderBy(desc(appeals.createdAt));

    const enrichedResults = await Promise.all(
      results.map(async (appeal) => {
        const caseData = await db.select().from(cases).where(eq(cases.id, appeal.caseId));
        const appealedByUser = await this.getUser(appeal.appealedBy);
        return {
          ...appeal,
          case: caseData[0],
          appealedByUser: appealedByUser!,
        };
      })
    );

    return enrichedResults;
  }

  async createAppeal(appealData: InsertAppeal): Promise<Appeal> {
    const [newAppeal] = await db.insert(appeals).values(appealData).returning();
    return newAppeal;
  }

  async updateAppeal(id: string, updates: Partial<InsertAppeal>): Promise<Appeal> {
    const [updatedAppeal] = await db
      .update(appeals)
      .set({ ...updates, reviewedAt: new Date() })
      .where(eq(appeals.id, id))
      .returning();
    return updatedAppeal;
  }

  async createPasswordResetRequest(requestData: InsertPasswordResetRequest): Promise<PasswordResetRequest> {
    const [newRequest] = await db.insert(passwordResetRequests).values(requestData).returning();
    return newRequest;
  }

  async getPasswordResetRequests(): Promise<(PasswordResetRequest & { user: User })[]> {
    const results = await db
      .select()
      .from(passwordResetRequests)
      .orderBy(desc(passwordResetRequests.createdAt));

    const enrichedResults = await Promise.all(
      results.map(async (request) => {
        const user = await this.getUser(request.userId);
        return {
          ...request,
          user: user!,
        };
      })
    );

    return enrichedResults;
  }

  async updatePasswordResetRequest(id: string, updates: Partial<InsertPasswordResetRequest>): Promise<PasswordResetRequest> {
    const [updatedRequest] = await db
      .update(passwordResetRequests)
      .set({ ...updates, approvedAt: new Date() })
      .where(eq(passwordResetRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async createCaseUpdate(updateData: InsertCaseUpdate): Promise<CaseUpdate> {
    const [newUpdate] = await db.insert(caseUpdates).values(updateData).returning();
    return newUpdate;
  }

  async getCaseUpdates(caseId: string): Promise<(CaseUpdate & { updatedByUser: User })[]> {
    const results = await db
      .select()
      .from(caseUpdates)
      .where(eq(caseUpdates.caseId, caseId))
      .orderBy(asc(caseUpdates.createdAt));

    const enrichedResults = await Promise.all(
      results.map(async (update) => {
        const updatedByUser = await this.getUser(update.updatedBy);
        return {
          ...update,
          updatedByUser: updatedByUser!,
        };
      })
    );

    return enrichedResults;
  }

  async getStatistics(): Promise<{
    totalCases: number;
    pendingCases: number;
    verifiedCases: number;
    altAccounts: number;
  }> {
    const [totalCases] = await db.select({ count: count() }).from(cases);
    const [pendingCases] = await db
      .select({ count: count() })
      .from(cases)
      .where(eq(cases.status, "pending"));
    const [verifiedCases] = await db
      .select({ count: count() })
      .from(cases)
      .where(eq(cases.status, "verified"));
    const [altAccountsCount] = await db.select({ count: count() }).from(altAccounts);

    return {
      totalCases: totalCases.count,
      pendingCases: pendingCases.count,
      verifiedCases: verifiedCases.count,
      altAccounts: altAccountsCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
