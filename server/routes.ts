import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertCaseSchema, 
  insertEvidenceSchema,
  insertAppealSchema,
  insertPasswordResetRequestSchema,
  insertCaseUpdateSchema,
  insertContactMessageSchema,
  insertStaffAssignmentSchema,
  insertTribunalProceedingSchema,
  insertVouchSchema,
  insertDisputeResolutionSchema,
  insertDisputeVoteSchema,
  insertAltDetectionReportSchema,
  insertUserSessionSchema,
  insertStaffPermissionSchema,
  insertStaffPerformanceSchema,
  insertUtilityCategorySchema,
  insertUtilityDocumentSchema,
  insertDocumentRatingSchema,
  insertUserReputationSchema,
  insertAuditLogSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendPasswordResetApprovalRequest, sendPasswordResetToken } from "./email";
import crypto from "crypto";
import passport from "passport";
import { analyzeCaseReport, generateModerationAdvice } from "./ai-analysis";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and text files
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based auth middleware
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

// Discord OAuth configuration
const configureDiscordAuth = (app: Express) => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.log("Discord OAuth not configured - missing client ID or secret");
    return;
  }

  const DiscordStrategy = require("passport-discord").Strategy;
  
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: "/api/auth/discord/callback",
    scope: ["identify", "email"],
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user exists with this Discord ID
      let user = await storage.getUserByDiscordId(profile.id);
      
      if (user) {
        // Update Discord info if needed
        user = await storage.updateUser(user.id, {
          discordUsername: profile.username,
          discordDiscriminator: profile.discriminator,
          discordAvatar: profile.avatar,
        });
      } else {
        // Create new user
        user = await storage.createUser({
          username: profile.username,
          email: profile.email,
          passwordHash: null, // No password for OAuth users
          role: "user",
          firstName: profile.username,
          lastName: "",
          profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
          isActive: true,
          department: null,
          specialization: null,
          staffId: null,
          phoneNumber: null,
          officeLocation: null,
          emergencyContact: null,
          certifications: [],
          discordId: profile.id,
          discordUsername: profile.username,
          discordDiscriminator: profile.discriminator,
          discordAvatar: profile.avatar,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
};

// Generate anonymized voter hash for dispute voting
const generateVoterHash = (userId: string, disputeId: string): string => {
  return crypto.createHash('sha256').update(`${userId}-${disputeId}-salt`).digest('hex');
};

// Audit logging helper
const createAuditLog = async (userId: string, action: string, entityType: string, entityId?: string, oldValues?: any, newValues?: any, req?: any) => {
  await storage.createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent'),
    additionalData: null,
  });
};

export function registerRoutes(app: Express): Server {
  // Configure Discord OAuth
  configureDiscordAuth(app);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // ============ AUTHENTICATION ROUTES ============
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Create user session
      await storage.createUserSession({
        userId: user.id,
        ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
        userAgent: req.get('User-Agent') || "unknown",
        deviceFingerprint: null,
        sessionToken: token,
        isActive: true,
        lastActivity: new Date(),
      });

      await createAuditLog(user.id, "login", "user", user.id, null, null, req);

      res.json({ 
        token, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Discord OAuth routes
  app.get("/api/auth/discord", passport.authenticate("discord"));
  
  app.get("/api/auth/discord/callback", 
    passport.authenticate("discord", { failureRedirect: "/login" }),
    async (req: any, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Create user session
      await storage.createUserSession({
        userId: user.id,
        ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
        userAgent: req.get('User-Agent') || "unknown",
        deviceFingerprint: null,
        sessionToken: token,
        isActive: true,
        lastActivity: new Date(),
      });

      await createAuditLog(user.id, "discord_login", "user", user.id, null, null, req);
      
      // Redirect to frontend with token
      res.redirect(`/dashboard?token=${token}`);
    }
  );

  // Get current user
  app.get("/api/auth/user", authenticateToken, async (req: any, res) => {
    const user = req.user;
    const reputation = await storage.getUserReputation(user.id);
    
    res.json({
      ...user,
      reputation
    });
  });

  // Logout
  app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
    await createAuditLog(req.user.id, "logout", "user", req.user.id, null, null, req);
    res.json({ message: "Logged out successfully" });
  });

  // ============ CASE MANAGEMENT ROUTES ============
  
  // Get cases with filtering
  app.get("/api/cases", authenticateToken, async (req: any, res) => {
    try {
      const { status, type, search, limit = 50, offset = 0 } = req.query;
      
      const cases = await storage.getCases({
        status,
        type,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      
      const total = await storage.getCaseCount({ status, type, search });
      
      res.json({ cases, total });
    } catch (error) {
      console.error("Get cases error:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Get specific case
  app.get("/api/cases/:id", authenticateToken, async (req, res) => {
    try {
      const caseData = await storage.getCase(req.params.id);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(caseData);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // Create new case
  app.post("/api/cases", authenticateToken, upload.array("evidence"), async (req: any, res) => {
    try {
      const validatedData = insertCaseSchema.parse(req.body);
      
      // AI analysis if available
      let aiAnalysis = null;
      let aiRiskScore = null;
      let aiUrgencyLevel = null;
      let moderationAdvice = null;

      try {
        if (req.body.description && req.body.description.length > 50) {
          aiAnalysis = await analyzeCaseReport(req.body.description);
          aiRiskScore = aiAnalysis?.riskScore || null;
          aiUrgencyLevel = aiAnalysis?.urgencyLevel || null;
          moderationAdvice = await generateModerationAdvice(req.body.description, req.body.type);
        }
      } catch (aiError) {
        console.log("AI analysis not available:", aiError);
      }

      const newCase = await storage.createCase({
        ...validatedData,
        reporterUserId: req.user.id,
        aiAnalysis,
        aiRiskScore,
        aiUrgencyLevel,
        moderationAdvice,
      });

      // Handle file uploads if any
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await storage.createEvidence({
            caseId: newCase.id,
            fileName: file.filename,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            filePath: file.path,
            uploadedBy: req.user.id,
            description: req.body.evidenceDescription || "Case evidence",
          });
        }
      }

      await createAuditLog(req.user.id, "create_case", "case", newCase.id, null, newCase, req);

      res.status(201).json(newCase);
    } catch (error) {
      console.error("Create case error:", error);
      res.status(400).json({ message: "Failed to create case" });
    }
  });

  // Update case
  app.put("/api/cases/:id", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const oldCase = await storage.getCase(req.params.id);
      if (!oldCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      const updatedCase = await storage.updateCase(req.params.id, req.body);
      
      await createAuditLog(req.user.id, "update_case", "case", req.params.id, oldCase, updatedCase, req);

      res.json(updatedCase);
    } catch (error) {
      console.error("Update case error:", error);
      res.status(400).json({ message: "Failed to update case" });
    }
  });

  // ============ VOUCH/DEVOUCH SYSTEM ROUTES ============
  
  // Get vouches for a user
  app.get("/api/vouches/:userId", authenticateToken, async (req, res) => {
    try {
      const vouches = await storage.getVouches(req.params.userId);
      res.json(vouches);
    } catch (error) {
      console.error("Get vouches error:", error);
      res.status(500).json({ message: "Failed to fetch vouches" });
    }
  });

  // Create vouch/devouch (one per user limit)
  app.post("/api/vouches", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertVouchSchema.parse(req.body);
      
      // Check if user is trying to vouch themselves
      if (validatedData.targetUserId === req.user.id) {
        return res.status(400).json({ message: "You cannot vouch for yourself" });
      }

      // Get voucher's reputation for weight calculation
      const voucherReputation = await storage.getUserReputation(req.user.id);
      const weight = voucherReputation?.trustLevel === "platinum" ? 3 : 
                    voucherReputation?.trustLevel === "gold" ? 2 : 1;

      const vouch = await storage.createVouch({
        ...validatedData,
        voucherUserId: req.user.id,
        weight,
      });

      await createAuditLog(req.user.id, "create_vouch", "vouch", vouch.id, null, vouch, req);

      res.status(201).json(vouch);
    } catch (error) {
      console.error("Create vouch error:", error);
      if (error instanceof Error && error.message.includes("already vouched")) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Failed to create vouch" });
      }
    }
  });

  // ============ DISPUTE RESOLUTION & VOTING ROUTES ============
  
  // Get active disputes for voting
  app.get("/api/disputes/active", authenticateToken, async (req, res) => {
    try {
      const disputes = await storage.getActiveDisputes();
      res.json(disputes);
    } catch (error) {
      console.error("Get active disputes error:", error);
      res.status(500).json({ message: "Failed to fetch active disputes" });
    }
  });

  // Create dispute resolution
  app.post("/api/disputes", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const validatedData = insertDisputeResolutionSchema.parse(req.body);
      
      const dispute = await storage.createDisputeResolution({
        ...validatedData,
        proposedBy: req.user.id,
      });

      await createAuditLog(req.user.id, "create_dispute", "dispute", dispute.id, null, dispute, req);

      res.status(201).json(dispute);
    } catch (error) {
      console.error("Create dispute error:", error);
      res.status(400).json({ message: "Failed to create dispute resolution" });
    }
  });

  // Vote on dispute (anonymous)
  app.post("/api/disputes/:id/vote", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertDisputeVoteSchema.parse(req.body);
      
      // Generate anonymous voter hash
      const voterHash = generateVoterHash(req.user.id, req.params.id);
      
      // Get voter's reputation for weight calculation
      const voterReputation = await storage.getUserReputation(req.user.id);
      const weight = voterReputation?.trustLevel === "platinum" ? 3 : 
                    voterReputation?.trustLevel === "gold" ? 2 : 1;

      const vote = await storage.createDisputeVote({
        ...validatedData,
        disputeId: req.params.id,
        voterHash,
        weight,
      });

      // Log vote anonymously (no user ID in logs for privacy)
      await storage.createAuditLog({
        userId: "anonymous", // Don't log actual user ID for vote privacy
        action: "vote_dispute",
        entityType: "dispute",
        entityId: req.params.id,
        oldValues: null,
        newValues: { choice: validatedData.choice, weight },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        additionalData: null,
      });

      res.status(201).json({ message: "Vote recorded successfully" });
    } catch (error) {
      console.error("Vote dispute error:", error);
      if (error instanceof Error && error.message.includes("already voted")) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Failed to record vote" });
      }
    }
  });

  // ============ ALT DETECTION SYSTEM ROUTES ============
  
  // Get alt detection reports
  app.get("/api/alt-detection", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const { status } = req.query;
      const reports = await storage.getAltDetectionReports(status);
      res.json(reports);
    } catch (error) {
      console.error("Get alt detection reports error:", error);
      res.status(500).json({ message: "Failed to fetch alt detection reports" });
    }
  });

  // Create alt detection report
  app.post("/api/alt-detection", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertAltDetectionReportSchema.parse(req.body);
      
      const report = await storage.createAltDetectionReport({
        ...validatedData,
        reportedBy: validatedData.reportedBy || req.user.id,
      });

      await createAuditLog(req.user.id, "create_alt_report", "alt_report", report.id, null, report, req);

      res.status(201).json(report);
    } catch (error) {
      console.error("Create alt detection report error:", error);
      res.status(400).json({ message: "Failed to create alt detection report" });
    }
  });

  // Update alt detection report
  app.put("/api/alt-detection/:id", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const updatedReport = await storage.updateAltDetectionReport(req.params.id, req.body);
      
      await createAuditLog(req.user.id, "update_alt_report", "alt_report", req.params.id, null, updatedReport, req);

      res.json(updatedReport);
    } catch (error) {
      console.error("Update alt detection report error:", error);
      res.status(400).json({ message: "Failed to update alt detection report" });
    }
  });

  // ============ STAFF MANAGEMENT ROUTES ============
  
  // Get staff members
  app.get("/api/staff", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff"]), async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      console.error("Get staff error:", error);
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  // Get staff permissions
  app.get("/api/staff/:id/permissions", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff"]), async (req, res) => {
    try {
      const permissions = await storage.getStaffPermissions(req.params.id);
      res.json(permissions);
    } catch (error) {
      console.error("Get staff permissions error:", error);
      res.status(500).json({ message: "Failed to fetch staff permissions" });
    }
  });

  // Grant staff permission
  app.post("/api/staff/permissions", authenticateToken, requireRole(["admin", "tribunal_head"]), async (req: any, res) => {
    try {
      const validatedData = insertStaffPermissionSchema.parse(req.body);
      
      const permission = await storage.createStaffPermission({
        ...validatedData,
        grantedBy: req.user.id,
      });

      await createAuditLog(req.user.id, "grant_permission", "permission", permission.id, null, permission, req);

      res.status(201).json(permission);
    } catch (error) {
      console.error("Grant permission error:", error);
      res.status(400).json({ message: "Failed to grant permission" });
    }
  });

  // Get staff performance
  app.get("/api/staff/:id/performance", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff"]), async (req: any, res) => {
    try {
      const { period } = req.query;
      const performance = await storage.getStaffPerformance(req.params.id, period);
      res.json(performance);
    } catch (error) {
      console.error("Get staff performance error:", error);
      res.status(500).json({ message: "Failed to fetch staff performance" });
    }
  });

  // Create staff performance review
  app.post("/api/staff/performance", authenticateToken, requireRole(["admin", "tribunal_head"]), async (req: any, res) => {
    try {
      const validatedData = insertStaffPerformanceSchema.parse(req.body);
      
      const performance = await storage.createStaffPerformance({
        ...validatedData,
        evaluatedBy: req.user.id,
      });

      await createAuditLog(req.user.id, "create_performance_review", "performance", performance.id, null, performance, req);

      res.status(201).json(performance);
    } catch (error) {
      console.error("Create performance review error:", error);
      res.status(400).json({ message: "Failed to create performance review" });
    }
  });

  // ============ UTILITY SYSTEM ROUTES ============
  
  // Get utility categories
  app.get("/api/utility/categories", authenticateToken, async (req, res) => {
    try {
      const categories = await storage.getUtilityCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get utility categories error:", error);
      res.status(500).json({ message: "Failed to fetch utility categories" });
    }
  });

  // Create utility category
  app.post("/api/utility/categories", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff"]), async (req: any, res) => {
    try {
      const validatedData = insertUtilityCategorySchema.parse(req.body);
      
      const category = await storage.createUtilityCategory(validatedData);

      await createAuditLog(req.user.id, "create_utility_category", "utility_category", category.id, null, category, req);

      res.status(201).json(category);
    } catch (error) {
      console.error("Create utility category error:", error);
      res.status(400).json({ message: "Failed to create utility category" });
    }
  });

  // Get utility documents
  app.get("/api/utility/documents", authenticateToken, async (req: any, res) => {
    try {
      const { categoryId } = req.query;
      const documents = await storage.getUtilityDocuments(categoryId);
      
      // Filter by access level
      const filteredDocuments = documents.filter(doc => {
        if (doc.accessLevel === "all") return true;
        if (doc.accessLevel === "staff" && ["admin", "tribunal_head", "senior_staff", "staff"].includes(req.user.role)) return true;
        if (doc.accessLevel === "senior_staff" && ["admin", "tribunal_head", "senior_staff"].includes(req.user.role)) return true;
        if (doc.accessLevel === "admin" && req.user.role === "admin") return true;
        return false;
      });
      
      res.json(filteredDocuments);
    } catch (error) {
      console.error("Get utility documents error:", error);
      res.status(500).json({ message: "Failed to fetch utility documents" });
    }
  });

  // Create utility document
  app.post("/api/utility/documents", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const validatedData = insertUtilityDocumentSchema.parse(req.body);
      
      const document = await storage.createUtilityDocument({
        ...validatedData,
        authorId: req.user.id,
      });

      await createAuditLog(req.user.id, "create_utility_document", "utility_document", document.id, null, document, req);

      res.status(201).json(document);
    } catch (error) {
      console.error("Create utility document error:", error);
      res.status(400).json({ message: "Failed to create utility document" });
    }
  });

  // Update utility document
  app.put("/api/utility/documents/:id", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const updatedDocument = await storage.updateUtilityDocument(req.params.id, {
        ...req.body,
        lastEditedBy: req.user.id,
      });

      await createAuditLog(req.user.id, "update_utility_document", "utility_document", req.params.id, null, updatedDocument, req);

      res.json(updatedDocument);
    } catch (error) {
      console.error("Update utility document error:", error);
      res.status(400).json({ message: "Failed to update utility document" });
    }
  });

  // Rate utility document
  app.post("/api/utility/documents/:id/rate", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertDocumentRatingSchema.parse(req.body);
      
      const rating = await storage.createDocumentRating({
        ...validatedData,
        documentId: req.params.id,
        userId: req.user.id,
      });

      res.status(201).json(rating);
    } catch (error) {
      console.error("Rate document error:", error);
      res.status(400).json({ message: "Failed to rate document" });
    }
  });

  // ============ USER REPUTATION ROUTES ============
  
  // Get user reputation
  app.get("/api/reputation/:userId", authenticateToken, async (req, res) => {
    try {
      const reputation = await storage.getUserReputation(req.params.userId);
      if (!reputation) {
        return res.status(404).json({ message: "Reputation not found" });
      }
      res.json(reputation);
    } catch (error) {
      console.error("Get reputation error:", error);
      res.status(500).json({ message: "Failed to fetch reputation" });
    }
  });

  // ============ STATISTICS & DASHBOARD ROUTES ============
  
  // Get dashboard statistics
  app.get("/api/statistics", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ============ AUDIT LOG ROUTES ============
  
  // Get audit logs
  app.get("/api/audit-logs", authenticateToken, requireRole(["admin", "tribunal_head"]), async (req: any, res) => {
    try {
      const { userId, entityType, limit = 100, offset = 0 } = req.query;
      const logs = await storage.getAuditLogs(userId, entityType);
      
      const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      res.json({
        logs: paginatedLogs,
        total: logs.length
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // ============ EXISTING ROUTES (LEGACY COMPATIBILITY) ============
  
  // Contact messages, appeals, tribunal proceedings, etc. (keeping existing functionality)
  app.get("/api/contact", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const { status, priority, search, limit = 50, offset = 0 } = req.query;
      
      const messages = await storage.getContactMessages({
        status,
        priority,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      
      res.json(messages);
    } catch (error) {
      console.error("Get contact messages error:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Create contact message error:", error);
      res.status(400).json({ message: "Failed to create contact message" });
    }
  });

  app.get("/api/appeals", authenticateToken, requireRole(["admin", "tribunal_head", "senior_staff", "staff"]), async (req: any, res) => {
    try {
      const { caseId } = req.query;
      const appeals = await storage.getAppeals(caseId);
      res.json(appeals);
    } catch (error) {
      console.error("Get appeals error:", error);
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  app.post("/api/appeals", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertAppealSchema.parse(req.body);
      
      const appeal = await storage.createAppeal({
        ...validatedData,
        appealedBy: req.user.id,
      });

      await createAuditLog(req.user.id, "create_appeal", "appeal", appeal.id, null, appeal, req);

      res.status(201).json(appeal);
    } catch (error) {
      console.error("Create appeal error:", error);
      res.status(400).json({ message: "Failed to create appeal" });
    }
  });

  // User search route for frontend components
  app.get("/api/users/search", authenticateToken, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.json([]);
      }

      const searchTerm = q.toLowerCase();
      const users = await storage.getStaffMembers();
      const allUsers = [...users, ...(await Promise.all(
        (await storage.getCases()).map(async (c) => {
          const reportedUser = await storage.getUser(c.reportedUserId);
          const reporterUser = await storage.getUser(c.reporterUserId);
          return [reportedUser, reporterUser];
        })
      )).flat().filter(Boolean)];

      const filteredUsers = Array.from(
        new Map(allUsers.map(user => [user?.id, user])).values()
      ).filter((user: any) => 
        user && (
          user.username?.toLowerCase().includes(searchTerm) ||
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        )
      );

      res.json(filteredUsers.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", authenticateToken, (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}