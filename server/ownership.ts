
import { Request, Response } from 'express';
import { db } from './db';
import { ownershipClaims, ownershipBadges } from '../shared/schema';
import { eq, desc } from 'drizzle-orm';

export const ownershipRoutes = {
  // Get user's ownership claims
  async getClaims(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const claims = await db
        .select()
        .from(ownershipClaims)
        .where(eq(ownershipClaims.userId, userId))
        .orderBy(desc(ownershipClaims.createdAt));

      res.json(claims);
    } catch (error) {
      console.error('Error fetching ownership claims:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Submit ownership claim
  async submitClaim(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type, name, description, verificationMethod, proofUrls } = req.body;

      const [claim] = await db
        .insert(ownershipClaims)
        .values({
          userId,
          type,
          name,
          description,
          verificationMethod,
          proofUrls,
          status: 'pending',
        })
        .returning();

      res.json(claim);
    } catch (error) {
      console.error('Error submitting ownership claim:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's verified badges
  async getBadges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const badges = await db
        .select()
        .from(ownershipBadges)
        .where(eq(ownershipBadges.userId, userId))
        .orderBy(desc(ownershipBadges.verifiedAt));

      res.json(badges);
    } catch (error) {
      console.error('Error fetching ownership badges:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin: Verify ownership claim
  async verifyClaim(req: Request, res: Response) {
    try {
      const { claimId } = req.params;
      const { status, badgeName, badgeImageUrl } = req.body;

      const [updatedClaim] = await db
        .update(ownershipClaims)
        .set({ 
          status,
          verifiedAt: status === 'verified' ? new Date() : null
        })
        .where(eq(ownershipClaims.id, claimId))
        .returning();

      // If verified, create badge
      if (status === 'verified' && badgeName) {
        await db
          .insert(ownershipBadges)
          .values({
            userId: updatedClaim.userId,
            claimId: updatedClaim.id,
            name: badgeName,
            imageUrl: badgeImageUrl || '/default-badge.png',
            verifiedAt: new Date(),
          });
      }

      res.json(updatedClaim);
    } catch (error) {
      console.error('Error verifying ownership claim:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
