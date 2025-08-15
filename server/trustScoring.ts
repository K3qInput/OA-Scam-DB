
import { z } from "zod";

export const TrustScoreFactors = z.object({
  successfulTransactions: z.number().default(0),
  feedbackQuality: z.number().min(0).max(100).default(50),
  reportHistory: z.number().default(0),
  timeInCommunity: z.number().default(0), // in days
  aiDetectionScore: z.number().min(0).max(100).default(50),
  verificationLevel: z.enum(['unverified', 'basic', 'advanced', 'premium']).default('unverified'),
});

export type TrustScoreFactors = z.infer<typeof TrustScoreFactors>;

export interface TrustScoreResult {
  score: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  factors: TrustScoreFactors;
  lastUpdated: Date;
  nextUpdate: Date;
}

export class TrustScoringEngine {
  private static weights = {
    successfulTransactions: 0.25,
    feedbackQuality: 0.20,
    reportHistory: -0.15, // negative weight for reports
    timeInCommunity: 0.15,
    aiDetectionScore: 0.15,
    verificationLevel: 0.20,
  };

  static calculateScore(factors: TrustScoreFactors): number {
    const verificationMultipliers = {
      unverified: 0.5,
      basic: 0.75,
      advanced: 1.0,
      premium: 1.25,
    };

    // Normalize factors
    const normalizedTransactions = Math.min(factors.successfulTransactions / 100, 1) * 100;
    const normalizedTime = Math.min(factors.timeInCommunity / 365, 1) * 100; // max 1 year
    const normalizedReports = Math.max(0, 100 - (factors.reportHistory * 10)); // each report reduces score

    const baseScore = 
      (normalizedTransactions * this.weights.successfulTransactions) +
      (factors.feedbackQuality * this.weights.feedbackQuality) +
      (normalizedReports * Math.abs(this.weights.reportHistory)) +
      (normalizedTime * this.weights.timeInCommunity) +
      (factors.aiDetectionScore * this.weights.aiDetectionScore);

    const verificationBonus = baseScore * this.weights.verificationLevel * 
      verificationMultipliers[factors.verificationLevel];

    return Math.max(0, Math.min(100, baseScore + verificationBonus));
  }

  static getTrustLevel(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (score >= 85) return 'platinum';
    if (score >= 70) return 'gold';
    if (score >= 50) return 'silver';
    return 'bronze';
  }

  static async updateTrustScore(userId: string, factors: Partial<TrustScoreFactors>): Promise<TrustScoreResult> {
    // In a real implementation, this would fetch current factors from database
    const currentFactors = TrustScoreFactors.parse(factors);
    const score = this.calculateScore(currentFactors);
    const level = this.getTrustLevel(score);

    return {
      score,
      level,
      factors: currentFactors,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  static scheduleRealTimeUpdate(userId: string, event: 'transaction' | 'feedback' | 'report' | 'verification') {
    // This would trigger real-time updates based on events
    console.log(`Scheduling trust score update for user ${userId} due to ${event}`);
  }
}
