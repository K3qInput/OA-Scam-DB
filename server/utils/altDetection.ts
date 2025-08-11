import type { IStorage } from '../storage';
import type { UserSession, AltDetectionReport, User, InsertAltDetectionReport } from '../../shared/schema';

export interface AltDetectionConfig {
  ipSimilarityThreshold: number;
  deviceSimilarityThreshold: number;
  behaviorSimilarityThreshold: number;
  timeWindowMinutes: number;
  maxAccountsPerIP: number;
  maxAccountsPerDevice: number;
}

const DEFAULT_CONFIG: AltDetectionConfig = {
  ipSimilarityThreshold: 85,
  deviceSimilarityThreshold: 90,
  behaviorSimilarityThreshold: 80,
  timeWindowMinutes: 60,
  maxAccountsPerIP: 3,
  maxAccountsPerDevice: 2,
};

export class AltDetectionEngine {
  private storage: IStorage;
  private config: AltDetectionConfig;

  constructor(storage: IStorage, config: AltDetectionConfig = DEFAULT_CONFIG) {
    this.storage = storage;
    this.config = config;
  }

  // Check for IP-based alt accounts
  private async detectIPBasedAlts(userId: string, ipAddress: string): Promise<{
    suspiciousUsers: string[];
    confidence: number;
    evidence: any;
  }> {
    const sessions = await this.getAllUserSessions();
    const ipSessions = sessions.filter(s => s.ipAddress === ipAddress && s.userId !== userId);
    
    if (ipSessions.length === 0) {
      return { suspiciousUsers: [], confidence: 0, evidence: {} };
    }

    const uniqueUsers = Array.from(new Set(ipSessions.map((s: UserSession) => s.userId)));
    const evidence = {
      sharedIP: ipAddress,
      totalSessions: ipSessions.length,
      uniqueUsersCount: uniqueUsers.length,
      sessionTimes: ipSessions.map(s => ({
        userId: s.userId,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity
      }))
    };

    // Calculate confidence based on number of users and session patterns
    let confidence = Math.min((uniqueUsers.length * 25), 100);
    
    // Increase confidence if sessions are created close in time
    const sessionTimes = ipSessions.map(s => s.createdAt.getTime()).sort();
    for (let i = 1; i < sessionTimes.length; i++) {
      const timeDiff = (sessionTimes[i] - sessionTimes[i-1]) / (1000 * 60); // minutes
      if (timeDiff < this.config.timeWindowMinutes) {
        confidence += 10;
      }
    }

    return {
      suspiciousUsers: uniqueUsers,
      confidence: Math.min(confidence, 100),
      evidence
    };
  }

  // Check for device fingerprint-based alt accounts
  private async detectDeviceBasedAlts(userId: string, deviceFingerprint: string): Promise<{
    suspiciousUsers: string[];
    confidence: number;
    evidence: any;
  }> {
    if (!deviceFingerprint) {
      return { suspiciousUsers: [], confidence: 0, evidence: {} };
    }

    const sessions = await this.getAllUserSessions();
    const deviceSessions = sessions.filter(s => 
      s.deviceFingerprint === deviceFingerprint && s.userId !== userId
    );

    if (deviceSessions.length === 0) {
      return { suspiciousUsers: [], confidence: 0, evidence: {} };
    }

    const uniqueUsers = Array.from(new Set(deviceSessions.map((s: UserSession) => s.userId)));
    const evidence = {
      sharedFingerprint: deviceFingerprint,
      totalSessions: deviceSessions.length,
      uniqueUsersCount: uniqueUsers.length,
      deviceDetails: {
        screenResolution: deviceSessions[0]?.screenResolution,
        platform: deviceSessions[0]?.platform,
        browserVersion: deviceSessions[0]?.browserVersion,
      }
    };

    // Device fingerprint sharing is more suspicious than IP sharing
    const confidence = Math.min((uniqueUsers.length * 40), 100);

    return {
      suspiciousUsers: uniqueUsers,
      confidence,
      evidence
    };
  }

  // Check for email similarity patterns
  private async detectEmailBasedAlts(email: string): Promise<{
    suspiciousUsers: string[];
    confidence: number;
    evidence: any;
  }> {
    const users = await this.getAllUsers();
    const suspiciousUsers: string[] = [];
    const evidence: any = { patterns: [] };

    const emailParts = email.toLowerCase().split('@');
    if (emailParts.length !== 2) {
      return { suspiciousUsers: [], confidence: 0, evidence: {} };
    }

    const [localPart, domain] = emailParts;
    
    for (const user of users) {
      if (!user.email || user.email === email) continue;
      
      const otherEmailParts = user.email.toLowerCase().split('@');
      if (otherEmailParts.length !== 2) continue;
      
      const [otherLocal, otherDomain] = otherEmailParts;
      
      // Check for similar patterns
      let similarity = 0;
      const reasons: string[] = [];
      
      // Same domain
      if (domain === otherDomain) {
        similarity += 30;
        reasons.push('same_domain');
      }
      
      // Similar local parts (e.g., john.doe vs john_doe)
      const normalizedLocal = localPart.replace(/[._-]/g, '');
      const normalizedOtherLocal = otherLocal.replace(/[._-]/g, '');
      
      if (normalizedLocal === normalizedOtherLocal) {
        similarity += 50;
        reasons.push('similar_username');
      } else if (normalizedLocal.includes(normalizedOtherLocal) || 
                 normalizedOtherLocal.includes(normalizedLocal)) {
        similarity += 25;
        reasons.push('username_substring');
      }
      
      // Sequential numbers (e.g., user123 vs user124)
      const numberPattern = /(\d+)$/;
      const localMatch = localPart.match(numberPattern);
      const otherMatch = otherLocal.match(numberPattern);
      
      if (localMatch && otherMatch) {
        const localNum = parseInt(localMatch[1]);
        const otherNum = parseInt(otherMatch[1]);
        const baseName = localPart.replace(numberPattern, '');
        const otherBaseName = otherLocal.replace(numberPattern, '');
        
        if (baseName === otherBaseName && Math.abs(localNum - otherNum) <= 5) {
          similarity += 40;
          reasons.push('sequential_numbers');
        }
      }
      
      if (similarity >= 50) {
        suspiciousUsers.push(user.id);
        evidence.patterns.push({
          userId: user.id,
          email: user.email,
          similarity,
          reasons
        });
      }
    }

    const confidence = suspiciousUsers.length > 0 ? Math.min(60 + (suspiciousUsers.length * 10), 90) : 0;
    
    return { suspiciousUsers, confidence, evidence };
  }

  // Check for behavioral patterns
  private async detectBehaviorBasedAlts(userId: string): Promise<{
    suspiciousUsers: string[];
    confidence: number;
    evidence: any;
  }> {
    // This would analyze user behavior patterns like:
    // - Login times
    // - Case creation patterns
    // - Navigation patterns
    // - Typing patterns (if available)
    
    // For now, implementing a basic version
    const user = await this.storage.getUser(userId);
    if (!user) {
      return { suspiciousUsers: [], confidence: 0, evidence: {} };
    }

    const userSessions = await this.getUserSessions(userId);
    const allSessions = await this.getAllUserSessions();
    
    const suspiciousUsers: string[] = [];
    const evidence: any = { behaviorMatches: [] };
    
    // Group sessions by user
    const sessionsByUser = new Map<string, UserSession[]>();
    allSessions.forEach(session => {
      if (session.userId === userId) return;
      
      if (!sessionsByUser.has(session.userId)) {
        sessionsByUser.set(session.userId, []);
      }
      sessionsByUser.get(session.userId)!.push(session);
    });
    
    // Analyze patterns for each user
    for (const [otherUserId, otherSessions] of Array.from(sessionsByUser.entries())) {
      let behaviorScore = 0;
      const matches: string[] = [];
      
      // Check timezone consistency
      const userTimezones = userSessions.map((s: UserSession) => s.timezone).filter(Boolean);
      const otherTimezones = otherSessions.map((s: UserSession) => s.timezone).filter(Boolean);
      
      if (userTimezones.length > 0 && otherTimezones.length > 0) {
        const commonTimezones = userTimezones.filter(tz => otherTimezones.includes(tz));
        if (commonTimezones.length > 0) {
          behaviorScore += 20;
          matches.push('timezone_match');
        }
      }
      
      // Check active hours patterns
      const userHours = userSessions.map((s: UserSession) => s.createdAt.getHours());
      const otherHours = otherSessions.map((s: UserSession) => s.createdAt.getHours());
      
      if (userHours.length > 0 && otherHours.length > 0) {
        const hourOverlap = userHours.filter(h => otherHours.includes(h)).length;
        const overlapRatio = hourOverlap / Math.max(userHours.length, otherHours.length);
        
        if (overlapRatio > 0.7) {
          behaviorScore += 15;
          matches.push('activity_hours_match');
        }
      }
      
      // Check browser/platform consistency
      const userBrowsers = userSessions.map((s: UserSession) => s.browserVersion).filter(Boolean);
      const otherBrowsers = otherSessions.map((s: UserSession) => s.browserVersion).filter(Boolean);
      
      if (userBrowsers.length > 0 && otherBrowsers.length > 0) {
        const commonBrowsers = userBrowsers.filter(b => otherBrowsers.includes(b));
        if (commonBrowsers.length > 0) {
          behaviorScore += 10;
          matches.push('browser_match');
        }
      }
      
      if (behaviorScore >= this.config.behaviorSimilarityThreshold) {
        suspiciousUsers.push(otherUserId);
        evidence.behaviorMatches.push({
          userId: otherUserId,
          score: behaviorScore,
          matches
        });
      }
    }
    
    const confidence = suspiciousUsers.length > 0 ? 
      Math.min(50 + (suspiciousUsers.length * 15), 85) : 0;
    
    return { suspiciousUsers, confidence, evidence };
  }

  // Main detection method
  public async detectAltAccounts(
    userId: string,
    ipAddress: string,
    deviceFingerprint?: string,
    email?: string
  ): Promise<AltDetectionReport[]> {
    const reports: AltDetectionReport[] = [];
    
    // Run all detection methods in parallel
    const [ipResults, deviceResults, emailResults, behaviorResults] = await Promise.all([
      this.detectIPBasedAlts(userId, ipAddress),
      deviceFingerprint ? this.detectDeviceBasedAlts(userId, deviceFingerprint) : 
        { suspiciousUsers: [], confidence: 0, evidence: {} },
      email ? this.detectEmailBasedAlts(email) : 
        { suspiciousUsers: [], confidence: 0, evidence: {} },
      this.detectBehaviorBasedAlts(userId),
    ]);
    
    // Combine results and create reports
    const allSuspiciousUsers = Array.from(new Set([
      ...ipResults.suspiciousUsers,
      ...deviceResults.suspiciousUsers,
      ...emailResults.suspiciousUsers,
      ...behaviorResults.suspiciousUsers,
    ]));
    
    for (const suspiciousUserId of allSuspiciousUsers) {
      const detectionMethods: string[] = [];
      const combinedEvidence: any = {};
      let maxConfidence = 0;
      
      if (ipResults.suspiciousUsers.includes(suspiciousUserId)) {
        detectionMethods.push('ip_match');
        combinedEvidence.ipMatch = ipResults.evidence;
        maxConfidence = Math.max(maxConfidence, ipResults.confidence);
      }
      
      if (deviceResults.suspiciousUsers.includes(suspiciousUserId)) {
        detectionMethods.push('device_fingerprint');
        combinedEvidence.deviceMatch = deviceResults.evidence;
        maxConfidence = Math.max(maxConfidence, deviceResults.confidence);
      }
      
      if (emailResults.suspiciousUsers.includes(suspiciousUserId)) {
        detectionMethods.push('email_similarity');
        combinedEvidence.emailMatch = emailResults.evidence;
        maxConfidence = Math.max(maxConfidence, emailResults.confidence);
      }
      
      if (behaviorResults.suspiciousUsers.includes(suspiciousUserId)) {
        detectionMethods.push('behavior_pattern');
        combinedEvidence.behaviorMatch = behaviorResults.evidence;
        maxConfidence = Math.max(maxConfidence, behaviorResults.confidence);
      }
      
      // Increase confidence for multiple detection methods
      if (detectionMethods.length > 1) {
        maxConfidence = Math.min(maxConfidence + (detectionMethods.length * 10), 100);
      }
      
      // Determine status and severity
      let status = 'pending';
      let severity = 'medium';
      let actionTaken = 'none';
      
      if (maxConfidence >= 90) {
        status = 'confirmed';
        severity = 'critical';
        actionTaken = 'verification_required';
      } else if (maxConfidence >= 75) {
        severity = 'high';
        actionTaken = 'verification_required';
      } else if (maxConfidence >= 60) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      
      const report: InsertAltDetectionReport = {
        suspectedAltUserId: userId,
        mainAccountUserId: suspiciousUserId,
        detectionMethod: detectionMethods.join(', '),
        confidenceScore: maxConfidence,
        evidence: combinedEvidence,
        status,
        severity,
        actionTaken,
        autoGenerated: true,
        falsePositiveProbability: Math.max(0, 100 - maxConfidence),
        similarityMetrics: {
          ipSimilarity: ipResults.confidence,
          deviceSimilarity: deviceResults.confidence,
          emailSimilarity: emailResults.confidence,
          behaviorSimilarity: behaviorResults.confidence,
        }
      };
      
      const createdReport = await this.storage.createAltDetectionReport(report);
      reports.push(createdReport);
    }
    
    return reports;
  }

  // Helper methods 
  private async getAllUserSessions(): Promise<UserSession[]> {
    return this.storage.getAllUserSessions?.() || [];
  }

  private async getUserSessions(userId: string): Promise<UserSession[]> {
    const allSessions = await this.getAllUserSessions();
    return allSessions.filter((s: UserSession) => s.userId === userId);
  }

  private async getAllUsers(): Promise<User[]> {
    return this.storage.getAllUsers?.() || [];
  }
}

export default AltDetectionEngine;