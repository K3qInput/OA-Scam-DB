
export interface TrustScoreFactors {
  successfulTransactions: number;
  feedbackQuality: number;
  reportHistory: number;
  timeInCommunity: number;
  aiFraudProbability: number;
  verificationLevel: number;
  communityEndorsements: number;
}

export interface TrustScoreResult {
  score: number;
  level: 'untrusted' | 'new' | 'trusted' | 'veteran' | 'elite';
  factors: TrustScoreFactors;
  lastUpdated: Date;
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
  };
}

export class TrustScoringEngine {
  private weights = {
    successfulTransactions: 0.25,
    feedbackQuality: 0.20,
    reportHistory: -0.30, // negative weight for bad reports
    timeInCommunity: 0.15,
    aiFraudProbability: -0.25, // negative weight for fraud probability
    verificationLevel: 0.10,
    communityEndorsements: 0.05
  };

  calculateTrustScore(factors: TrustScoreFactors): TrustScoreResult {
    let rawScore = 0;
    const reasons: string[] = [];

    // Calculate weighted score
    rawScore += factors.successfulTransactions * this.weights.successfulTransactions;
    rawScore += factors.feedbackQuality * this.weights.feedbackQuality;
    rawScore += factors.reportHistory * this.weights.reportHistory;
    rawScore += factors.timeInCommunity * this.weights.timeInCommunity;
    rawScore += factors.aiFraudProbability * this.weights.aiFraudProbability;
    rawScore += factors.verificationLevel * this.weights.verificationLevel;
    rawScore += factors.communityEndorsements * this.weights.communityEndorsements;

    // Normalize to 0-100 scale
    const score = Math.max(0, Math.min(100, rawScore * 10 + 50));

    // Determine trust level
    let level: TrustScoreResult['level'];
    if (score >= 80) level = 'elite';
    else if (score >= 65) level = 'veteran';
    else if (score >= 50) level = 'trusted';
    else if (score >= 30) level = 'new';
    else level = 'untrusted';

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (factors.aiFraudProbability > 0.8) {
      riskLevel = 'critical';
      reasons.push('High AI fraud probability detected');
    } else if (factors.reportHistory > 5) {
      riskLevel = 'high';
      reasons.push('Multiple negative reports');
    } else if (score < 40) {
      riskLevel = 'medium';
      reasons.push('Low trust score');
    } else {
      riskLevel = 'low';
    }

    return {
      score,
      level,
      factors,
      lastUpdated: new Date(),
      riskAssessment: {
        level: riskLevel,
        reasons
      }
    };
  }

  updateTrustScore(userId: string, newFactors: Partial<TrustScoreFactors>): TrustScoreResult {
    // In a real implementation, this would fetch existing factors from database
    // and update them with new values
    const existingFactors: TrustScoreFactors = {
      successfulTransactions: 0,
      feedbackQuality: 0,
      reportHistory: 0,
      timeInCommunity: 0,
      aiFraudProbability: 0,
      verificationLevel: 0,
      communityEndorsements: 0,
      ...newFactors
    };

    return this.calculateTrustScore(existingFactors);
  }

  // Real-time trust score monitoring
  async monitorTrustScore(userId: string): Promise<void> {
    // This would integrate with real-time systems to update scores
    // when new transactions, reports, or activities occur
    console.log(`Monitoring trust score for user: ${userId}`);
  }
}

export const trustScoringEngine = new TrustScoringEngine();
