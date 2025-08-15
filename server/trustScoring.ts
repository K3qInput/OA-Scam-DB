import { z } from "zod";

// Trust Scoring Algorithm for OwnersAlliance
// Calculates dynamic trust scores based on multiple factors

export interface TrustFactors {
  successfulTransactions: number;
  feedbackQuality: number; // 0-100 scale
  reportHistory: number; // Number of times reported
  timeInCommunity: number; // Days since joining
  verificationLevel: 'none' | 'basic' | 'advanced' | 'premium';
  vouchCount: number;
  devouchCount: number;
  aiRiskScore?: number; // Optional AI-generated risk assessment
}

export interface TrustScore {
  score: number; // 0-100
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  factors: TrustFactors;
  lastUpdated: Date;
  nextUpdate: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export class TrustScoringEngine {
  private static readonly WEIGHTS = {
    successfulTransactions: 0.25,
    feedbackQuality: 0.20,
    reportHistory: -0.30, // Negative weight
    timeInCommunity: 0.15,
    verificationLevel: 0.10,
    vouchBalance: 0.10, // (vouches - devouches)
  };

  private static readonly VERIFICATION_MULTIPLIERS = {
    none: 1.0,
    basic: 1.1,
    advanced: 1.25,
    premium: 1.5,
  };

  private static readonly TRUST_LEVELS = [
    { min: 0, max: 20, level: 'bronze' as const },
    { min: 21, max: 40, level: 'silver' as const },
    { min: 41, max: 65, level: 'gold' as const },
    { min: 66, max: 85, level: 'platinum' as const },
    { min: 86, max: 100, level: 'diamond' as const },
  ];

  static calculateTrustScore(factors: TrustFactors): TrustScore {
    let baseScore = 50; // Start with neutral score

    // Transaction success component (0-25 points)
    const transactionScore = Math.min(factors.successfulTransactions * 2, 25);
    baseScore += transactionScore * this.WEIGHTS.successfulTransactions;

    // Feedback quality component (0-20 points)
    const feedbackScore = (factors.feedbackQuality / 100) * 20;
    baseScore += feedbackScore * this.WEIGHTS.feedbackQuality;

    // Report history penalty (negative impact)
    const reportPenalty = Math.min(factors.reportHistory * 10, 30);
    baseScore += reportPenalty * this.WEIGHTS.reportHistory;

    // Time in community component (0-15 points)
    const timeScore = Math.min(factors.timeInCommunity / 30, 15); // Max at 30 days
    baseScore += timeScore * this.WEIGHTS.timeInCommunity;

    // Verification level bonus (0-10 points)
    const verificationScore = 10;
    baseScore += verificationScore * this.WEIGHTS.verificationLevel;

    // Vouch balance component (0-10 points)
    const vouchBalance = Math.max(0, factors.vouchCount - factors.devouchCount);
    const vouchScore = Math.min(vouchBalance * 2, 10);
    baseScore += vouchScore * this.WEIGHTS.vouchBalance;

    // Apply verification multiplier
    const multiplier = this.VERIFICATION_MULTIPLIERS[factors.verificationLevel];
    let finalScore = baseScore * multiplier;

    // Apply AI risk adjustment if available
    if (factors.aiRiskScore !== undefined) {
      const aiAdjustment = (1 - factors.aiRiskScore / 100) * 0.1; // Max 10% adjustment
      finalScore *= (1 + aiAdjustment);
    }

    // Ensure score stays within bounds
    finalScore = Math.max(0, Math.min(100, finalScore));

    // Determine trust level
    const level = this.TRUST_LEVELS.find(
      l => finalScore >= l.min && finalScore <= l.max
    )?.level || 'bronze';

    // Calculate trend (simplified - would need historical data)
    const trend = finalScore > 60 ? 'increasing' : finalScore < 40 ? 'decreasing' : 'stable';

    return {
      score: Math.round(finalScore),
      level,
      factors,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      trend,
    };
  }

  static shouldUpdateScore(lastUpdate: Date): boolean {
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24; // Update every 24 hours
  }

  static getInsurableTrustLevels(): string[] {
    return ['silver', 'gold', 'platinum', 'diamond'];
  }
}