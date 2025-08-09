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
  insertTribunalProceedingSchema
} from "@shared/schema";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendPasswordResetApprovalRequest, sendPasswordResetToken } from "./email";
import crypto from "crypto";
import passport from "passport";

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
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Staff-only middleware (includes all staff levels)
const requireStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["staff", "senior_staff", "tribunal_head", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Staff access required" });
  }
  next();
};

// Senior staff middleware
const requireSeniorStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["senior_staff", "tribunal_head", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Senior staff access required" });
  }
  next();
};

// Tribunal head middleware
const requireTribunalHead = (req: any, res: any, next: any) => {
  if (!req.user || !["tribunal_head", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Tribunal head access required" });
  }
  next();
};

// Admin-only middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user if not exists
  const initializeAdmin = async () => {
    try {
      const adminUser = await storage.getUserByUsername("admin");
      if (!adminUser) {
        await storage.createUser({
          username: "admin",
          email: "admin@oa.com",
          passwordHash: "admin123", // Default password, should be changed
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        });
        console.log("Admin user created with email: admin@oa.com, password: admin123");
      }
    } catch (error) {
      console.error("Failed to initialize admin user:", error);
    }
  };

  await initializeAdmin();

  // Discord OAuth routes
  app.get("/api/auth/discord", passport.authenticate("discord"));
  app.get("/auth/discord", passport.authenticate("discord"));

  app.get("/api/auth/discord/callback", 
    passport.authenticate("discord", { failureRedirect: "/login?error=discord_failed" }),
    async (req: any, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: "24h" });
        
        // Redirect to frontend with token
        res.redirect(`/login?token=${token}&discord_success=true`);
      } catch (error) {
        console.error("Discord callback error:", error);
        res.redirect("/login?error=auth_failed");
      }
    }
  );

  app.get("/auth/discord/callback", 
    passport.authenticate("discord", { failureRedirect: "/login?error=discord_failed" }),
    async (req: any, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: "24h" });
        
        // Redirect to frontend with token
        res.redirect(`/login?token=${token}&discord_success=true`);
      } catch (error) {
        console.error("Discord callback error:", error);
        res.redirect("/login?error=auth_failed");
      }
    }
  );

  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      console.log("=== LOGIN REQUEST ===");
      console.log("Body:", req.body);
      
      const { username, password } = loginSchema.parse(req.body);
      console.log("Parsed credentials:", { username, passwordLength: password.length });
      
      const user = await storage.authenticateUser(username, password);
      console.log("Authentication result:", !!user);
      
      if (!user) {
        console.log("Authentication failed - returning 401");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
      console.log("Token generated, sending response");
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username, 
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Database error", error: error.message });
    }
  });

  app.get("/api/me", authenticateToken, (req: any, res) => {
    const { passwordHash, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Case routes
  app.get("/api/cases", async (req, res) => {
    try {
      const { status, type, search, page = "1", limit = "10" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const filters = {
        status: status as string,
        type: type as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset,
      };

      const cases = await storage.getCases(filters);
      const total = await storage.getCaseCount({
        status: filters.status,
        type: filters.type,
        search: filters.search,
      });

      res.json({
        cases,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      const caseData = await storage.getCase(req.params.id);
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(caseData);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.post("/api/cases", authenticateToken, async (req: any, res) => {
    try {
      const caseData = insertCaseSchema.parse({
        ...req.body,
        reporterUserId: req.user.id,
      });
      const newCase = await storage.createCase(caseData);

      // Create case update for creation
      await storage.createCaseUpdate({
        caseId: newCase.id,
        updatedBy: req.user.id,
        updateType: "creation",
        comment: "Case created",
      });

      res.status(201).json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(400).json({ message: "Invalid case data" });
    }
  });

  app.patch("/api/cases/:id", authenticateToken, requireStaff, async (req: any, res) => {
    try {
      const updates = req.body;
      const oldCase = await storage.getCase(req.params.id);
      
      if (!oldCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      const updatedCase = await storage.updateCase(req.params.id, {
        ...updates,
        staffUserId: req.user.id,
      });

      // Create case update for status change
      if (updates.status && updates.status !== oldCase.status) {
        await storage.createCaseUpdate({
          caseId: updatedCase.id,
          updatedBy: req.user.id,
          updateType: "status_change",
          oldValue: oldCase.status,
          newValue: updates.status,
          comment: `Status changed from ${oldCase.status} to ${updates.status}`,
        });
      }

      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(400).json({ message: "Failed to update case" });
    }
  });

  // Evidence routes
  app.post("/api/cases/:caseId/evidence", authenticateToken, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const evidence = await storage.createEvidence({
        caseId: req.params.caseId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        uploadedBy: req.user.id,
        description: req.body.description || "",
      });

      res.status(201).json(evidence);
    } catch (error) {
      console.error("Error uploading evidence:", error);
      res.status(500).json({ message: "Failed to upload evidence" });
    }
  });

  app.get("/api/evidence/:id/download", authenticateToken, async (req, res) => {
    try {
      // Get evidence details from database first
      const evidenceList = await storage.getEvidenceByCase(""); // This needs to be fixed to get by evidence ID
      const evidence = evidenceList.find(e => e.id === req.params.id);
      
      if (!evidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }

      const filePath = evidence.filePath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(filePath, evidence.originalName);
    } catch (error) {
      console.error("Error downloading evidence:", error);
      res.status(500).json({ message: "Failed to download evidence" });
    }
  });

  // Alt account routes
  app.get("/api/alt-accounts/:userId", authenticateToken, requireStaff, async (req, res) => {
    try {
      const altAccounts = await storage.getAltAccounts(req.params.userId);
      res.json(altAccounts);
    } catch (error) {
      console.error("Error fetching alt accounts:", error);
      res.status(500).json({ message: "Failed to fetch alt accounts" });
    }
  });

  // Appeal routes
  app.get("/api/appeals", authenticateToken, requireStaff, async (req, res) => {
    try {
      const appeals = await storage.getAppeals();
      res.json(appeals);
    } catch (error) {
      console.error("Error fetching appeals:", error);
      res.status(500).json({ message: "Failed to fetch appeals" });
    }
  });

  app.post("/api/appeals", authenticateToken, async (req: any, res) => {
    try {
      const appealData = insertAppealSchema.parse(req.body);
      const newAppeal = await storage.createAppeal({
        ...appealData,
        appealedBy: req.user.id,
      });
      res.status(201).json(newAppeal);
    } catch (error) {
      console.error("Error creating appeal:", error);
      res.status(400).json({ message: "Invalid appeal data" });
    }
  });

  app.patch("/api/appeals/:id", authenticateToken, requireStaff, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedAppeal = await storage.updateAppeal(req.params.id, {
        ...updates,
        reviewedBy: req.user.id,
      });
      res.json(updatedAppeal);
    } catch (error) {
      console.error("Error updating appeal:", error);
      res.status(400).json({ message: "Failed to update appeal" });
    }
  });

  // Password reset routes
  app.post("/api/auth/request-password-reset", authenticateToken, async (req: any, res) => {
    try {
      const { reason } = insertPasswordResetRequestSchema.parse(req.body);
      
      // Only allow admin user to request password reset
      if (req.user.email !== "admin@oa.com") {
        return res.status(403).json({ message: "Only admin can request password reset" });
      }

      const request = await storage.createPasswordResetRequest({
        userId: req.user.id,
        reason,
        status: "pending",
      });

      // Send email to approval address
      try {
        await sendPasswordResetApprovalRequest(request.id, req.user.email, reason);
        res.json({ message: "Password reset request sent for approval" });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        res.status(500).json({ message: "Failed to send approval email" });
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Admin approval routes (accessible via email links)
  app.get("/api/admin/approve-password-reset/:requestId", async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const allRequests = await storage.getPasswordResetRequests();
      const currentRequest = allRequests.find(r => r.id === requestId);
      if (currentRequest) {
        // Create a new request with the token since updatePasswordResetRequest doesn't support token
        await storage.createPasswordResetRequest({
          userId: currentRequest.userId,
          reason: currentRequest.reason,
          status: "approved",
        });
      }

      // Get the request to send reset email
      const requests = await storage.getPasswordResetRequests();
      const request = requests.find(r => r.id === requestId);
      
      if (request) {
        await sendPasswordResetToken(request.user.email, token);
      }

      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: white; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; text-align: center;">
              <h1 style="color: #ef4444;">✅ Password Reset Approved</h1>
              <p>The password reset request has been approved. A reset link has been sent to the user's email.</p>
              <p style="color: #9ca3af;">You can close this window.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error approving password reset:", error);
      res.status(500).send("Error approving password reset");
    }
  });

  app.get("/api/admin/reject-password-reset/:requestId", async (req, res) => {
    try {
      await storage.updatePasswordResetRequest(req.params.requestId, {
        status: "rejected",
      });

      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: white; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; text-align: center;">
              <h1 style="color: #ef4444;">❌ Password Reset Rejected</h1>
              <p>The password reset request has been rejected.</p>
              <p style="color: #9ca3af;">You can close this window.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error rejecting password reset:", error);
      res.status(500).send("Error rejecting password reset");
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password required" });
      }

      const requests = await storage.getPasswordResetRequests();
      const request = requests.find(r => r.token === token && r.status === "approved");

      if (!request || !request.expiresAt || request.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Update user password
      await storage.updateUser(request.userId, {
        passwordHash: newPassword,
      });

      // Mark request as used
      await storage.updatePasswordResetRequest(request.id, {
        status: "completed",
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Statistics route
  app.get("/api/statistics", authenticateToken, requireStaff, async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Case updates route
  app.get("/api/cases/:caseId/updates", authenticateToken, async (req, res) => {
    try {
      const updates = await storage.getCaseUpdates(req.params.caseId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching case updates:", error);
      res.status(500).json({ message: "Failed to fetch case updates" });
    }
  });

  // Contact Messages Routes
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const newMessage = await storage.createContactMessage(contactData);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.get("/api/contact", authenticateToken, requireStaff, async (req, res) => {
    try {
      const { status, priority, assignedTo } = req.query;
      const filters = {
        status: status as string,
        priority: priority as string,
        assignedTo: assignedTo as string,
      };
      const messages = await storage.getContactMessages(filters);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.get("/api/contact/:id", authenticateToken, requireStaff, async (req, res) => {
    try {
      const message = await storage.getContactMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching contact message:", error);
      res.status(500).json({ message: "Failed to fetch contact message" });
    }
  });

  app.patch("/api/contact/:id", authenticateToken, requireStaff, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedMessage = await storage.updateContactMessage(req.params.id, updates);
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(400).json({ message: "Failed to update contact message" });
    }
  });

  // Staff Management Routes
  app.get("/api/staff", authenticateToken, requireStaff, async (req, res) => {
    try {
      const { role } = req.query;
      const staff = await storage.getStaffMembers(role as string);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  app.post("/api/staff/create", authenticateToken, requireSeniorStaff, async (req: any, res) => {
    try {
      const userData = req.body;
      // Generate staff ID if not provided
      if (!userData.staffId) {
        const staffCount = await storage.getStaffMembers();
        userData.staffId = `STAFF-${(staffCount.length + 1).toString().padStart(4, '0')}`;
      }
      const newStaff = await storage.createUser(userData);
      res.status(201).json(newStaff);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(400).json({ message: "Failed to create staff member" });
    }
  });

  // Staff Assignment Routes
  app.get("/api/assignments", authenticateToken, requireStaff, async (req, res) => {
    try {
      const { staffId, caseId, contactId } = req.query;
      const filters = {
        staffId: staffId as string,
        caseId: caseId as string,
        contactId: contactId as string,
      };
      const assignments = await storage.getStaffAssignments(filters);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching staff assignments:", error);
      res.status(500).json({ message: "Failed to fetch staff assignments" });
    }
  });

  app.post("/api/assignments", authenticateToken, requireSeniorStaff, async (req: any, res) => {
    try {
      const assignmentData = insertStaffAssignmentSchema.parse({
        ...req.body,
        assignedBy: req.user.id,
      });
      const newAssignment = await storage.createStaffAssignment(assignmentData);
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error("Error creating staff assignment:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.patch("/api/assignments/:id", authenticateToken, requireSeniorStaff, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedAssignment = await storage.updateStaffAssignment(req.params.id, updates);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating staff assignment:", error);
      res.status(400).json({ message: "Failed to update assignment" });
    }
  });

  // Tribunal Proceedings Routes
  app.get("/api/tribunal/proceedings", authenticateToken, requireStaff, async (req, res) => {
    try {
      const { caseId } = req.query;
      const proceedings = await storage.getTribunalProceedings(caseId as string);
      res.json(proceedings);
    } catch (error) {
      console.error("Error fetching tribunal proceedings:", error);
      res.status(500).json({ message: "Failed to fetch proceedings" });
    }
  });

  app.post("/api/tribunal/proceedings", authenticateToken, requireTribunalHead, async (req: any, res) => {
    try {
      const proceedingData = insertTribunalProceedingSchema.parse({
        ...req.body,
        chairperson: req.user.id,
      });
      const newProceeding = await storage.createTribunalProceeding(proceedingData);
      res.status(201).json(newProceeding);
    } catch (error) {
      console.error("Error creating tribunal proceeding:", error);
      res.status(400).json({ message: "Invalid proceeding data" });
    }
  });

  app.patch("/api/tribunal/proceedings/:id", authenticateToken, requireTribunalHead, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedProceeding = await storage.updateTribunalProceeding(req.params.id, updates);
      res.json(updatedProceeding);
    } catch (error) {
      console.error("Error updating tribunal proceeding:", error);
      res.status(400).json({ message: "Failed to update proceeding" });
    }
  });

  // Dashboard Statistics for different roles
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const baseStats = await storage.getStatistics();
      
      // Add role-specific statistics
      const contactMessages = await storage.getContactMessages();
      const staffAssignments = await storage.getStaffAssignments({ staffId: req.user.id });
      const allStaff = await storage.getStaffMembers();
      
      const enhancedStats = {
        ...baseStats,
        contactMessages: {
          total: contactMessages.length,
          new: contactMessages.filter(m => m.status === 'new').length,
          inProgress: contactMessages.filter(m => m.status === 'in_progress').length,
          resolved: contactMessages.filter(m => m.status === 'resolved').length,
        },
        staffAssignments: {
          total: staffAssignments.length,
          active: staffAssignments.filter(a => a.isActive).length,
          completed: staffAssignments.filter(a => a.completedAt).length,
        },
        staffMembers: {
          total: allStaff.length,
          admin: allStaff.filter(s => s.role === 'admin').length,
          tribunalHead: allStaff.filter(s => s.role === 'tribunal_head').length,
          seniorStaff: allStaff.filter(s => s.role === 'senior_staff').length,
          staff: allStaff.filter(s => s.role === 'staff').length,
        }
      };
      
      res.json(enhancedStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
