import express from 'express';
import serverless from 'serverless-http';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';
import ws from "ws";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Database schema (inline for serverless)
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
import { sql } from "drizzle-orm";

// Enums
const caseStatusEnum = pgEnum("case_status", [
  "pending", "verified", "resolved", "appealed", "rejected", "archived"
]);
const caseTypeEnum = pgEnum("case_type", [
  "financial_scam", "identity_theft", "fake_services", "account_fraud", "other"
]);
const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
const userRoleEnum = pgEnum("user_role", ["admin", "staff", "user"]);

// Tables
const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const cases = pgTable("cases", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Set up Neon WebSocket for serverless
neonConfig.webSocketConstructor = ws;

// Initialize database
let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: { users, cases } });
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS middleware for Netlify
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db?.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user?.[0] || !user[0].isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OwnersAlliance API is running on Netlify' });
});

// Authentication routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!db) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user[0].passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role,
        firstName: user[0].firstName,
        lastName: user[0].lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  const { passwordHash, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Get cases
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const caseList = await db.select().from(cases).orderBy(desc(cases.createdAt));
    res.json(caseList);
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ message: 'Failed to fetch cases' });
  }
});

// Create case
app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ message: 'Database not configured' });
    }

    const caseData = {
      ...req.body,
      reporterUserId: req.user.id,
      caseNumber: `OA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    const newCase = await db.insert(cases).values(caseData).returning();
    res.status(201).json(newCase[0]);
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ message: 'Failed to create case' });
  }
});

// Fallback for other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    note: 'This is a simplified Netlify version. Some features may be limited.'
  });
});

// Export the serverless function
export const handler = serverless(app);