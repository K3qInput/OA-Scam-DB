import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  Activity
} from "lucide-react";
import AnimatedCounter from "@/components/animated-counter";

interface QuickStatsData {
  cases: {
    total: number;
    pending: number;
    resolved: number;
    trend: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    trend: number;
  };
  security: {
    alerts: number;
    resolved: number;
    high: number;
    trend: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    load: number;
  };
}

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery<QuickStatsData>({
    queryKey: ["/api/dashboard/quick-stats"],
    initialData: {
      cases: {
        total: 245,
        pending: 12,
        resolved: 198,
        trend: 8.5
      },
      users: {
        total: 1247,
        active: 89,
        new: 23,
        trend: 12.3
      },
      security: {
        alerts: 3,
        resolved: 15,
        high: 1,
        trend: -15.2
      },
      system: {
        uptime: 99.8,
        responseTime: 125,
        load: 32
      }
    }
  });

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon, 
    color = "blue" 
  }: {
    title: string;
    value: number;
    subtitle?: string;
    trend?: number;
    icon: any;
    color?: "blue" | "green" | "yellow" | "red" | "purple";
  }) => {
    const colorClasses = {
      blue: "text-blue-400 bg-blue-900/20 border-blue-700",
      green: "text-green-400 bg-green-900/20 border-green-700",
      yellow: "text-yellow-400 bg-yellow-900/20 border-yellow-700",
      red: "text-red-400 bg-red-900/20 border-red-700",
      purple: "text-purple-400 bg-purple-900/20 border-purple-700"
    };

    const iconColorClasses = {
      blue: "text-blue-400",
      green: "text-green-400",
      yellow: "text-yellow-400",
      red: "text-red-400",
      purple: "text-purple-400"
    };

    return (
      <Card className={`bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400">{title}</p>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <div className="w-12 h-8 bg-slate-600 animate-pulse rounded" />
                  ) : (
                    <AnimatedCounter value={value} />
                  )}
                </div>
                {trend !== undefined && (
                  <div className={`flex items-center text-xs ${
                    trend >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trend >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(trend)}%
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={stats.cases.total}
          subtitle={`${stats.cases.pending} pending`}
          trend={stats.cases.trend}
          icon={FileText}
          color="blue"
        />
        
        <StatCard
          title="Active Users"
          value={stats.users.active}
          subtitle={`${stats.users.new} new today`}
          trend={stats.users.trend}
          icon={Users}
          color="green"
        />
        
        <StatCard
          title="Security Alerts"
          value={stats.security.alerts}
          subtitle={`${stats.security.high} high priority`}
          trend={stats.security.trend}
          icon={Shield}
          color={stats.security.high > 0 ? "red" : "yellow"}
        />
        
        <StatCard
          title="Cases Resolved"
          value={stats.cases.resolved}
          subtitle="This month"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* System Health Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Uptime */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-300">Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{stats.system.uptime}%</span>
              <Progress value={stats.system.uptime} className="w-20 h-2" />
            </div>
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.system.responseTime < 200 ? 'bg-green-400' : 
                stats.system.responseTime < 500 ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-slate-300">Response Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{stats.system.responseTime}ms</span>
              <Progress 
                value={Math.max(0, 100 - (stats.system.responseTime / 10))} 
                className="w-20 h-2" 
              />
            </div>
          </div>

          {/* System Load */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.system.load < 50 ? 'bg-green-400' : 
                stats.system.load < 80 ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-slate-300">System Load</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{stats.system.load}%</span>
              <Progress value={stats.system.load} className="w-20 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <h4 className="font-medium text-white">Pending Review</h4>
                <p className="text-2xl font-bold text-white">{stats.cases.pending}</p>
                <p className="text-xs text-slate-400">Cases waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-400" />
              <div>
                <h4 className="font-medium text-white">Under Review</h4>
                <p className="text-2xl font-bold text-white">
                  {stats.cases.total - stats.cases.pending - stats.cases.resolved}
                </p>
                <p className="text-xs text-slate-400">Being processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <h4 className="font-medium text-white">High Priority</h4>
                <p className="text-2xl font-bold text-white">{stats.security.high}</p>
                <p className="text-xs text-slate-400">Security alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}