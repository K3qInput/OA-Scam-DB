
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
