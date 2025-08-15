
import { Request, Response } from 'express';
import { db } from './db';
import { impersonationAlerts } from '../shared/schema';
import { eq, like, desc, count, and } from 'drizzle-orm';

export const impersonationRoutes = {
  // Get impersonation heatmap data
  async getHeatmap(req: Request, res: Response) {
    try {
      // Aggregate data by platform
      const heatmapData = await db
        .select({
          platform: impersonationAlerts.platform,
          count: count(),
        })
        .from(impersonationAlerts)
        .where(eq(impersonationAlerts.status, 'active'))
        .groupBy(impersonationAlerts.platform);

      // Add severity calculation
      const enhancedData = heatmapData.map(item => {
        let severity = 'low';
        if (item.count >= 20) severity = 'critical';
        else if (item.count >= 10) severity = 'high';
        else if (item.count >= 5) severity = 'medium';

        return {
          ...item,
          severity,
          recentActivity: [], // Will be populated separately if needed
        };
      });

      res.json(enhancedData);
    } catch (error) {
      console.error('Error fetching impersonation heatmap:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get impersonation alerts with filtering
  async getAlerts(req: Request, res: Response) {
    try {
      const { search, platform } = req.query;
      
      let query = db.select().from(impersonationAlerts);
      const conditions = [];

      if (search) {
        conditions.push(like(impersonationAlerts.username, `%${search}%`));
      }

      if (platform && platform !== 'all') {
        conditions.push(eq(impersonationAlerts.platform, platform as string));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const alerts = await query
        .orderBy(desc(impersonationAlerts.createdAt))
        .limit(50);

      res.json(alerts);
    } catch (error) {
      console.error('Error fetching impersonation alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Report new impersonation
  async reportImpersonation(req: Request, res: Response) {
    try {
      const { platform, username, profileUrl, similarity, detectionMethod, location, screenshots } = req.body;

      const [alert] = await db
        .insert(impersonationAlerts)
        .values({
          platform,
          username,
          profileUrl,
          similarity,
          detectionMethod,
          location,
          screenshots: screenshots || [],
          status: 'active',
        })
        .returning();

      res.json(alert);
    } catch (error) {
      console.error('Error reporting impersonation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update alert status
  async updateAlertStatus(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const { status } = req.body;

      const [updatedAlert] = await db
        .update(impersonationAlerts)
        .set({ status })
        .where(eq(impersonationAlerts.id, alertId))
        .returning();

      res.json(updatedAlert);
    } catch (error) {
      console.error('Error updating alert status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
