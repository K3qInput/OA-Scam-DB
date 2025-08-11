import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,

  Globe,
  UserCheck
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AnimatedCounter from "@/components/animated-counter";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  verifiedCases: number;
  resolvedCases: number;
  altAccounts: number;
  activeUsers: number;
  staffMembers: {
    total: number;
    admin: number;
    tribunalHead: number;
    seniorStaff: number;
    staff: number;
  };
  securityEvents: {
    total: number;
    highSeverity: number;
    resolved: number;
    lastHour: number;
  };
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

interface ActivityData {
  date: string;
  cases: number;
  users: number;
  alerts: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function EnhancedDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Fetch comprehensive dashboard data
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/enhanced-stats"],
    initialData: {
      totalCases: 0,
      pendingCases: 0,
      verifiedCases: 0,
      resolvedCases: 0,
      altAccounts: 0,
      activeUsers: 0,
      staffMembers: {
        total: 0,
        admin: 0,
        tribunalHead: 0,
        seniorStaff: 0,
        staff: 0,
      },
      securityEvents: {
        total: 0,
        highSeverity: 0,
        resolved: 0,
        lastHour: 0,
      },
      systemHealth: {
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1,
        activeConnections: 45,
      }
    }
  });

  // Fetch activity data for charts
  const { data: activityData = [] } = useQuery<ActivityData[]>({
    queryKey: ["/api/dashboard/activity", selectedTimeRange],
    initialData: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cases: Math.floor(Math.random() * 10) + 1,
      users: Math.floor(Math.random() * 25) + 5,
      alerts: Math.floor(Math.random() * 3),
    }))
  });

  // Fetch recent security alerts
  const { data: recentAlerts = [] } = useQuery<SecurityAlert[]>({
    queryKey: ["/api/security-events/recent"],
    initialData: [
      {
        id: "1",
        type: "Alt Account Detection",
        severity: "high" as const,
        message: "High-confidence alt account detected",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: "2",
        type: "Rate Limit Exceeded",
        severity: "medium" as const,
        message: "User exceeded API rate limits",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolved: true
      }
    ]
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-200 border-red-700';
      case 'high': return 'bg-orange-900 text-orange-200 border-orange-700';
      case 'medium': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      default: return 'bg-blue-900 text-blue-200 border-blue-700';
    }
  };

  const getHealthIndicator = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { color: 'text-green-400', status: 'Excellent' };
    if (value >= thresholds.warning) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Needs Attention' };
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Cases</p>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats.totalCases} />
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400">
              <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
              +12% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Pending Review</p>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats.pendingCases} />
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400">
              <TrendingDown className="h-3 w-3 mr-1 text-green-400" />
              -5% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Security Alerts</p>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats.securityEvents.total} />
                </div>
              </div>
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <div className="mt-4 flex items-center text-xs">
              <Badge className={`text-xs ${stats.securityEvents.highSeverity > 0 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                {stats.securityEvents.highSeverity} High Priority
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Users</p>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats.activeUsers} />
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400">
              <Activity className="h-3 w-3 mr-1" />
              Online now
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Activity Overview
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                    className="text-xs"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="cases" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="alerts" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Uptime</span>
                <span className={getHealthIndicator(stats.systemHealth.uptime, { good: 99, warning: 95 }).color}>
                  {stats.systemHealth.uptime}%
                </span>
              </div>
              <Progress value={stats.systemHealth.uptime} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Response Time</span>
                <span className={getHealthIndicator(200 - stats.systemHealth.responseTime, { good: 100, warning: 50 }).color}>
                  {stats.systemHealth.responseTime}ms
                </span>
              </div>
              <Progress value={Math.max(0, 100 - stats.systemHealth.responseTime / 5)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Error Rate</span>
                <span className={getHealthIndicator(5 - stats.systemHealth.errorRate, { good: 4, warning: 2 }).color}>
                  {stats.systemHealth.errorRate}%
                </span>
              </div>
              <Progress value={Math.max(0, 100 - stats.systemHealth.errorRate * 20)} className="h-2" />
            </div>

            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Active Connections</span>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-400" />
                  <span className="text-white font-medium">{stats.systemHealth.activeConnections}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p>No recent security alerts</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{alert.type}</h4>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}