
export interface ImpersonationMatch {
  platform: string;
  username: string;
  profilePicture?: string;
  similarity: number;
  confidence: number;
  lastSeen: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ImpersonationHeatmap {
  userId: string;
  targetUsername: string;
  matches: ImpersonationMatch[];
  riskScore: number;
  lastUpdated: Date;
  alertLevel: 'none' | 'low' | 'medium' | 'high';
}

export class ImpersonationDetectionSystem {
  private platforms = ['discord', 'twitter', 'reddit', 'telegram', 'forums'];
  
  async scanForImpersonation(username: string, profilePic?: string): Promise<ImpersonationHeatmap> {
    const matches: ImpersonationMatch[] = [];
    
    for (const platform of this.platforms) {
      const platformMatches = await this.scanPlatform(platform, username, profilePic);
      matches.push(...platformMatches);
    }
    
    const riskScore = this.calculateRiskScore(matches);
    const alertLevel = this.determineAlertLevel(riskScore);
    
    return {
      userId: `user_${username}`,
      targetUsername: username,
      matches,
      riskScore,
      lastUpdated: new Date(),
      alertLevel
    };
  }
  
  private async scanPlatform(platform: string, username: string, profilePic?: string): Promise<ImpersonationMatch[]> {
    // Mock implementation - in reality would use APIs to scan platforms
    const mockMatches: ImpersonationMatch[] = [];
    
    // Simulate finding similar usernames
    const variations = this.generateUsernameVariations(username);
    
    for (const variation of variations.slice(0, 3)) { // Limit for demo
      const similarity = this.calculateSimilarity(username, variation);
      
      if (similarity > 0.7) {
        mockMatches.push({
          platform,
          username: variation,
          similarity,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
          riskLevel: similarity > 0.9 ? 'critical' : similarity > 0.8 ? 'high' : 'medium'
        });
      }
    }
    
    return mockMatches;
  }
  
  private generateUsernameVariations(username: string): string[] {
    const variations = [
      username.replace(/o/g, '0'),
      username.replace(/i/g, '1'),
      username.replace(/l/g, '1'),
      username.replace(/s/g, '5'),
      username + '_',
      '_' + username,
      username + '1',
      username.replace(/a/g, '@'),
      username + 'official'
    ];
    
    return variations;
  }
  
  private calculateSimilarity(original: string, candidate: string): number {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(original.toLowerCase(), candidate.toLowerCase());
    const maxLength = Math.max(original.length, candidate.length);
    return 1 - (distance / maxLength);
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private calculateRiskScore(matches: ImpersonationMatch[]): number {
    if (matches.length === 0) return 0;
    
    const totalRisk = matches.reduce((sum, match) => {
      const riskWeight = match.riskLevel === 'critical' ? 4 : 
                        match.riskLevel === 'high' ? 3 : 
                        match.riskLevel === 'medium' ? 2 : 1;
      return sum + (match.similarity * match.confidence * riskWeight);
    }, 0);
    
    return Math.min(100, totalRisk * 10);
  }
  
  private determineAlertLevel(riskScore: number): 'none' | 'low' | 'medium' | 'high' {
    if (riskScore > 75) return 'high';
    if (riskScore > 50) return 'medium';
    if (riskScore > 25) return 'low';
    return 'none';
  }
}

export const impersonationDetector = new ImpersonationDetectionSystem();

// Route handlers
export const impersonationRoutes = {
  async getHeatmap(req: any, res: any) {
    try {
      const { userId } = req.query;
      const username = req.user?.username || 'demo_user';
      
      const heatmap = await impersonationDetector.scanForImpersonation(username);
      
      res.json(heatmap);
    } catch (error) {
      console.error('Get impersonation heatmap error:', error);
      res.status(500).json({ message: 'Failed to fetch impersonation heatmap' });
    }
  },

  async getAlerts(req: any, res: any) {
    try {
      const { search, platform } = req.query;
      
      // Mock alerts data
      const alerts = [
        {
          id: '1',
          platform: 'Discord',
          username: 'fake_admin_user',
          profileUrl: 'https://discord.com/users/fake123',
          similarity: 95,
          detectionMethod: 'AI Pattern Recognition',
          location: 'Global',
          createdAt: new Date().toISOString(),
          status: 'active',
          screenshots: []
        },
        {
          id: '2',
          platform: 'Twitter',
          username: 'admin_fake',
          profileUrl: 'https://twitter.com/admin_fake',
          similarity: 87,
          detectionMethod: 'Username Similarity',
          location: 'US',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'active',
          screenshots: []
        }
      ];

      let filteredAlerts = alerts;
      
      if (search) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.username.toLowerCase().includes(search.toLowerCase()) ||
          alert.platform.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (platform && platform !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.platform.toLowerCase() === platform.toLowerCase()
        );
      }

      res.json(filteredAlerts);
    } catch (error) {
      console.error('Get impersonation alerts error:', error);
      res.status(500).json({ message: 'Failed to fetch impersonation alerts' });
    }
  },

  async reportImpersonation(req: any, res: any) {
    try {
      const reportData = req.body;
      
      // Mock report creation
      const report = {
        id: 'report_' + Date.now(),
        ...reportData,
        reportedBy: req.user.id,
        createdAt: new Date(),
        status: 'pending'
      };

      res.status(201).json(report);
    } catch (error) {
      console.error('Report impersonation error:', error);
      res.status(400).json({ message: 'Failed to report impersonation' });
    }
  },

  async updateAlertStatus(req: any, res: any) {
    try {
      const { alertId } = req.params;
      const { status } = req.body;
      
      // Mock update
      const updatedAlert = {
        id: alertId,
        status,
        updatedAt: new Date(),
        updatedBy: req.user.id
      };

      res.json(updatedAlert);
    } catch (error) {
      console.error('Update alert status error:', error);
      res.status(400).json({ message: 'Failed to update alert status' });
    }
  }
};
