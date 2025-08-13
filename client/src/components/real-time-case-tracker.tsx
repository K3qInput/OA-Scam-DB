import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Users,
  Activity,
  Zap
} from "lucide-react";
import { RealTimeTimestamp } from "./real-time-timestamp";
import { useLocation } from "wouter";

interface RecentCase {
  id: string;
  caseNumber: string;
  title: string;
  status: 'pending' | 'verified' | 'resolved' | 'appealed' | 'rejected';
  type: string;
  reportedUserId: string;
  reporterUserId: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  damageAmount?: number;
}

interface CaseMetrics {
  totalToday: number;
  pendingReview: number;
  avgResolutionTime: string;
  activeInvestigators: number;
  successRate: number;
  recentCases: RecentCase[];
}

export function RealTimeCaseTracker() {
  const [, setLocation] = useLocation();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Fetch real-time case metrics
  const { data: metrics, isLoading, refetch } = useQuery<CaseMetrics>({
    queryKey: ['/api/cases/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/cases/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch case metrics');
      }
      return response.json();
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Update timestamp when data changes
  useEffect(() => {
    if (metrics) {
      setLastUpdate(new Date());
    }
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'appealed': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <Card className="oa-card animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="oa-card">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-white">Unable to load case metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="oa-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">Cases Today</p>
                <p className="text-xl font-bold text-white">{metrics.totalToday}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">Pending Review</p>
                <p className="text-xl font-bold text-white">{metrics.pendingReview}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">Avg Resolution</p>
                <p className="text-xl font-bold text-white">{metrics.avgResolutionTime}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="oa-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">Success Rate</p>
                <p className="text-xl font-bold text-white">{metrics.successRate}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <Progress value={metrics.successRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Recent Cases */}
      <Card className="oa-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Recent Cases (Live)
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <RealTimeTimestamp date={lastUpdate} showRelative={true} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentCases && metrics.recentCases.length > 0 ? (
              metrics.recentCases.slice(0, 8).map((caseItem) => (
                <div 
                  key={caseItem.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                  onClick={() => setLocation(`/case-details/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getPriorityIcon(caseItem.priority)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          #{caseItem.caseNumber}
                        </p>
                        <Badge className={`oa-badge ${getStatusColor(caseItem.status)} text-xs`}>
                          {caseItem.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {caseItem.title || `${caseItem.type.replace('_', ' ')}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {caseItem.damageAmount && (
                      <span className="text-xs text-red-400 font-medium">
                        ${caseItem.damageAmount.toLocaleString()}
                      </span>
                    )}
                    <RealTimeTimestamp 
                      date={caseItem.updatedAt} 
                      showRelative={true} 
                      className="text-xs text-gray-500"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent cases</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Update Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Zap className="h-3 w-3 text-green-500" />
        <span>Updates every 15 seconds • Last refresh: </span>
        <RealTimeTimestamp date={lastUpdate} showRelative={true} />
      </div>
    </div>
  );
}