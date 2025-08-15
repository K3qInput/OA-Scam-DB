
import { Request, Response } from 'express';
import { db } from './db';
import { insurancePolicies, insuranceClaims } from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export const insuranceRoutes = {
  // Get user's insurance policies
  async getPolicies(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const policies = await db
        .select()
        .from(insurancePolicies)
        .where(eq(insurancePolicies.userId, userId))
        .orderBy(desc(insurancePolicies.createdAt));

      res.json(policies);
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Purchase insurance policy
  async purchasePolicy(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { coverageAmount, premium, trustScoreThreshold } = req.body;

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

      const [policy] = await db
        .insert(insurancePolicies)
        .values({
          userId,
          coverageAmount,
          premium,
          trustScoreThreshold,
          status: 'active',
          expiresAt,
        })
        .returning();

      res.json(policy);
    } catch (error) {
      console.error('Error purchasing insurance policy:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Submit insurance claim
  async submitClaim(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { policyId, reason, evidenceUrls } = req.body;

      // Verify policy ownership
      const policy = await db
        .select()
        .from(insurancePolicies)
        .where(and(
          eq(insurancePolicies.id, policyId),
          eq(insurancePolicies.userId, userId),
          eq(insurancePolicies.status, 'active')
        ))
        .limit(1);

      if (!policy.length) {
        return res.status(404).json({ error: 'Policy not found or inactive' });
      }

      const [claim] = await db
        .insert(insuranceClaims)
        .values({
          policyId,
          reason,
          evidenceUrls,
          status: 'pending',
        })
        .returning();

      res.json(claim);
    } catch (error) {
      console.error('Error submitting insurance claim:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
export interface InsurancePolicy {
  id: string;
  userId: string;
  trustScore: number;
  premiumPaid: number;
  coverage: {
    falseReportProtection: boolean;
    trustScoreGuarantee: number;
    evidenceVerification: boolean;
  };
  status: 'active' | 'expired' | 'claimed';
  createdAt: Date;
  expiresAt: Date;
  claims: InsuranceClaim[];
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  reportId: string;
  claimReason: string;
  evidence: string[];
  status: 'pending' | 'approved' | 'denied';
  payout: number;
  processedAt?: Date;
}

export class ReputationInsuranceSystem {
  async createPolicy(userId: string, trustScore: number): Promise<InsurancePolicy> {
    const premium = this.calculatePremium(trustScore);
    
    const policy: InsurancePolicy = {
      id: `policy_${Date.now()}`,
      userId,
      trustScore,
      premiumPaid: premium,
      coverage: {
        falseReportProtection: true,
        trustScoreGuarantee: trustScore * 0.8, // Guarantee 80% of current score
        evidenceVerification: true
      },
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      claims: []
    };

    // In real implementation, save to database
    console.log('Insurance policy created:', policy.id);
    return policy;
  }

  private calculatePremium(trustScore: number): number {
    // Higher trust score = lower premium
    const basePremium = 100;
    const trustMultiplier = Math.max(0.1, (100 - trustScore) / 100);
    return basePremium * trustMultiplier;
  }

  async fileClaim(policyId: string, reportId: string, evidence: string[]): Promise<InsuranceClaim> {
    const claim: InsuranceClaim = {
      id: `claim_${Date.now()}`,
      policyId,
      reportId,
      claimReason: 'False report affecting trust score',
      evidence,
      status: 'pending',
      payout: 0
    };

    // AI-powered evidence verification
    const verificationResult = await this.verifyEvidence(evidence);
    
    if (verificationResult.confidence > 0.8) {
      claim.status = 'approved';
      claim.payout = this.calculatePayout(policyId, reportId);
      claim.processedAt = new Date();
    }

    return claim;
  }

  private async verifyEvidence(evidence: string[]): Promise<{confidence: number, analysis: string}> {
    // AI analysis of evidence authenticity
    return {
      confidence: Math.random() * 0.4 + 0.6, // Mock confidence 60-100%
      analysis: 'Evidence appears authentic based on metadata and content analysis'
    };
  }

  private calculatePayout(policyId: string, reportId: string): number {
    // Calculate payout based on policy terms and damage assessment
    return 50; // Mock payout
  }
}

export const insuranceSystem = new ReputationInsuranceSystem();

// Route handlers
export const insuranceRoutes = {
  async getPolicies(req: any, res: any) {
    try {
      const policies = await insuranceSystem.getUserPolicies(req.user.id);
      res.json(policies);
    } catch (error) {
      console.error('Get insurance policies error:', error);
      res.status(500).json({ message: 'Failed to fetch insurance policies' });
    }
  },

  async purchasePolicy(req: any, res: any) {
    try {
      const policyData = req.body;
      const policy = await insuranceSystem.purchasePolicy(req.user.id, policyData);
      res.status(201).json(policy);
    } catch (error) {
      console.error('Purchase insurance policy error:', error);
      res.status(400).json({ message: 'Failed to purchase insurance policy' });
    }
  },

  async submitClaim(req: any, res: any) {
    try {
      const claimData = req.body;
      const claim = await insuranceSystem.submitClaim(req.user.id, claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error('Submit insurance claim error:', error);
      res.status(400).json({ message: 'Failed to submit insurance claim' });
    }
  }
};
