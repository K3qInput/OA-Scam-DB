// Global type definitions for the OwnersAlliance platform

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  verifiedCases: number;
  resolvedCases: number;
  altAccounts: number;
  activeUsers: number;
  staffMembers: {
    total: number;
    admin: number;
    tribunalHead: number;
    seniorStaff: number;
    staff: number;
  };
  contactMessages: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'case_created' | 'case_updated' | 'user_registered' | 'message_received' | 'staff_assigned';
  title: string;
  description?: string;
  userId?: string;
  username?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  actionUrl?: string;
  createdAt: Date;
}

export interface DeviceFingerprint {
  fingerprint: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  browserVersion: string;
  plugins: string[];
  fonts: string[];
  hardwareConcurrency: number;
  deviceMemory: number;
  connectionType: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  riskScore: number;
}

export interface AiToolResult {
  success: boolean;
  output: any;
  processingTime: number;
  tokens?: number;
  cost?: number;
  error?: string;
}

export interface MarketplaceProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  currency: string;
  category: string;
  skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  clientId: string;
  freelancerId?: string;
  applications: number;
  createdAt: Date;
  deadline?: Date;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate?: number;
  rating: number;
  completedJobs: number;
  responseTime: number;
  languages: string[];
  timezone: string;
  isVerified: boolean;
  portfolio: any[];
  availability: 'available' | 'busy' | 'unavailable';
}