
export interface OwnershipClaim {
  id: string;
  userId: string;
  claimType: 'server' | 'company' | 'brand' | 'social_account';
  entityName: string;
  entityId?: string;
  evidence: string[];
  verificationMethod: 'dns' | 'api_key' | 'admin_verification' | 'document_upload';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
  badgeUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface OwnershipBadge {
  id: string;
  userId: string;
  claimId: string;
  badgeType: string;
  displayName: string;
  iconUrl: string;
  isPublic: boolean;
  verificationLevel: 'basic' | 'advanced' | 'premium';
  createdAt: Date;
}

export class OwnershipVerificationSystem {
  async submitClaim(userId: string, claimData: any): Promise<OwnershipClaim> {
    const claim: OwnershipClaim = {
      id: `claim_${Date.now()}`,
      userId,
      claimType: claimData.claimType,
      entityName: claimData.entityName,
      entityId: claimData.entityId,
      evidence: claimData.evidence || [],
      verificationMethod: claimData.verificationMethod,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: claimData.expiresAt ? new Date(claimData.expiresAt) : undefined
    };

    return claim;
  }

  async getClaims(userId?: string): Promise<OwnershipClaim[]> {
    // Mock claims data
    return [
      {
        id: 'claim_1',
        userId: userId || 'user_1',
        claimType: 'server',
        entityName: 'Gaming Community Server',
        entityId: '123456789',
        evidence: ['screenshot_admin.png', 'server_logs.txt'],
        verificationMethod: 'admin_verification',
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: 'admin',
        badgeUrl: 'https://example.com/badges/server_owner.png',
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];
  }

  async getBadges(userId: string): Promise<OwnershipBadge[]> {
    // Mock badges data
    return [
      {
        id: 'badge_1',
        userId,
        claimId: 'claim_1',
        badgeType: 'server_owner',
        displayName: 'Verified Server Owner',
        iconUrl: 'https://example.com/icons/server.png',
        isPublic: true,
        verificationLevel: 'advanced',
        createdAt: new Date()
      }
    ];
  }

  async verifyClaim(claimId: string, verifierId: string): Promise<OwnershipClaim> {
    // Mock verification
    const claim: OwnershipClaim = {
      id: claimId,
      userId: 'user_1',
      claimType: 'server',
      entityName: 'Gaming Community Server',
      entityId: '123456789',
      evidence: ['screenshot_admin.png'],
      verificationMethod: 'admin_verification',
      status: 'verified',
      verifiedAt: new Date(),
      verifiedBy: verifierId,
      badgeUrl: 'https://example.com/badges/server_owner.png',
      createdAt: new Date()
    };

    return claim;
  }
}

export const ownershipSystem = new OwnershipVerificationSystem();

// Route handlers
export const ownershipRoutes = {
  async getClaims(req: any, res: any) {
    try {
      const claims = await ownershipSystem.getClaims(req.user.id);
      res.json(claims);
    } catch (error) {
      console.error('Get ownership claims error:', error);
      res.status(500).json({ message: 'Failed to fetch ownership claims' });
    }
  },

  async submitClaim(req: any, res: any) {
    try {
      const claimData = req.body;
      const claim = await ownershipSystem.submitClaim(req.user.id, claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error('Submit ownership claim error:', error);
      res.status(400).json({ message: 'Failed to submit ownership claim' });
    }
  },

  async getBadges(req: any, res: any) {
    try {
      const badges = await ownershipSystem.getBadges(req.user.id);
      res.json(badges);
    } catch (error) {
      console.error('Get ownership badges error:', error);
      res.status(500).json({ message: 'Failed to fetch ownership badges' });
    }
  },

  async verifyClaim(req: any, res: any) {
    try {
      const { claimId } = req.params;
      const claim = await ownershipSystem.verifyClaim(claimId, req.user.id);
      res.json(claim);
    } catch (error) {
      console.error('Verify ownership claim error:', error);
      res.status(400).json({ message: 'Failed to verify ownership claim' });
    }
  }
};
