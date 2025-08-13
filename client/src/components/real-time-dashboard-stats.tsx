import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Zap,
  Shield,
  Eye
} from "lucide-react";
import { RealTimeTimestamp } from "./real-time-timestamp";

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  resolvedCases: number;
  activeUsers: number;
  todayActivity: number;
  systemHealth: number;
  recentActivity: Array<{
    id: string;
    type: 'case_created' | 'case_resolved' | 'user_login' | 'case_updated';
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

export function RealTimeDashboardStats() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Fetch dashboard stats with real-time updates
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update timestamp when data changes
  useEffect(() => {
    if (stats) {
      setLastUpdate(new Date());
    }
  }, [stats]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_created': return <FileText className="h-4 w-4 text-blue-400" />;
      case 'case_resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'user_login': return <Users className="h-4 w-4 text-purple-400" />;
      case 'case_updated': return <Activity className="h-4 w-4 text-orange-400" />;
      default: return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'case_created': return 'border-l-blue-500';
      case 'case_resolved': return 'border-l-green-500';
      case 'user_login': return 'border-l-purple-500';
      case 'case_updated': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="oa-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="oa-card mb-8">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-white">Unable to load dashboard stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="oa-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Cases</p>
                <p className="text-2xl font-bold text-white">{stats.totalCases}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingCases}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-white">{stats.systemHealth}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card className="oa-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Real-time Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="h-3 w-3" />
            Last updated: <RealTimeTimestamp date={lastUpdate} showRelative={true} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.slice(0, 6).map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-2 bg-slate-900/50 ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-400">by {activity.user}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <RealTimeTimestamp 
                      date={activity.timestamp} 
                      showRelative={true} 
                      className="text-xs text-gray-400"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Data Refresh Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live data updates every 30 seconds</span>
      </div>
    </div>
  );
}