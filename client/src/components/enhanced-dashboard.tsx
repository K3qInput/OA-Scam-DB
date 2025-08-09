import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Target,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  resolvedCases: number;
  rejectedCases: number;
  highRiskCases: number;
  averageRiskScore: number;
  aiAnalysisCount: number;
  urgentCases: number;
  recentTrends: {
    period: string;
    cases: number;
    change: number;
  };
}

export function EnhancedDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/enhanced-stats"],
    initialData: {
      totalCases: 0,
      pendingCases: 0,
      resolvedCases: 0,
      rejectedCases: 0,
      highRiskCases: 0,
      averageRiskScore: 0,
      aiAnalysisCount: 0,
      urgentCases: 0,
      recentTrends: { period: "7d", cases: 0, change: 0 }
    } as DashboardStats
  });

  const { data: recentCases } = useQuery({
    queryKey: ["/api/cases", { limit: 5, sort: "recent" }],
    initialData: []
  });

  const getResolutionRate = () => {
    if (!stats.totalCases) return 0;
    return Math.round((stats.resolvedCases / stats.totalCases) * 100);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" };
    if (score >= 6) return { label: "High", color: "text-orange-500", bg: "bg-orange-500/10" };
    if (score >= 4) return { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Low", color: "text-green-500", bg: "bg-green-500/10" };
  };

  const riskLevel = getRiskLevel(stats.averageRiskScore);

  return (
    <div className="space-y-6">
      {/* AI-Powered Analytics Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-400" />
              AI-Enhanced Dashboard
            </h2>
            <p className="text-gray-400">
              Intelligent fraud detection with real-time risk assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">AI Analysis Coverage</div>
            <div className="text-2xl font-bold text-purple-400">
              {stats.totalCases ? Math.round((stats.aiAnalysisCount / stats.totalCases) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cases */}
        <Card className="oa-card hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalCases.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className={stats.recentTrends.change > 0 ? "text-green-500" : "text-red-500"}>
                {stats.recentTrends.change > 0 ? "+" : ""}{stats.recentTrends.change}%
              </span>
              <span className="text-gray-400">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Cases */}
        <Card className="oa-card hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {stats.pendingCases}
            </div>
            <div className="text-sm text-gray-400">
              Requires attention
            </div>
          </CardContent>
        </Card>

        {/* High Risk Cases */}
        <Card className="oa-card hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400 mb-1">
              {stats.highRiskCases}
            </div>
            <div className="text-sm text-gray-400">
              AI Risk Score ≥ 7
            </div>
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card className="oa-card hover:scale-105 transition-transform duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {getResolutionRate()}%
            </div>
            <div className="text-sm text-gray-400">
              Cases resolved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Assessment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="oa-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Average Risk Score</span>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full ${riskLevel.bg} ${riskLevel.color} text-sm font-medium`}>
                  {stats.averageRiskScore.toFixed(1)}/10
                </div>
                <Badge className={riskLevel.bg}>{riskLevel.label}</Badge>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Risk Distribution</span>
                <span className="text-gray-400">{stats.aiAnalysisCount} analyzed</span>
              </div>
              <Progress 
                value={stats.averageRiskScore * 10} 
                className="h-2"
                style={{
                  background: `linear-gradient(to right, 
                    #22c55e 0%, 
                    #eab308 40%, 
                    #f97316 70%, 
                    #ef4444 100%)`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-oa-surface rounded-lg">
                <div className="text-lg font-bold text-orange-400">{stats.urgentCases}</div>
                <div className="text-xs text-gray-400">Urgent Cases</div>
              </div>
              <div className="text-center p-3 bg-oa-surface rounded-lg">
                <div className="text-lg font-bold text-blue-400">{stats.aiAnalysisCount}</div>
                <div className="text-xs text-gray-400">AI Analyzed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Status Breakdown */}
        <Card className="oa-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Case Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-300">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.pendingCases}</span>
                  <Progress value={(stats.pendingCases / stats.totalCases) * 100} className="w-16 h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-300">Resolved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.resolvedCases}</span>
                  <Progress value={(stats.resolvedCases / stats.totalCases) * 100} className="w-16 h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-gray-300">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.rejectedCases}</span>
                  <Progress value={(stats.rejectedCases / stats.totalCases) * 100} className="w-16 h-2" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Processing Efficiency</span>
                <span className="text-green-400 font-medium">
                  {getResolutionRate()}% resolved
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent High-Risk Cases */}
      <Card className="oa-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-400" />
            Recent High-Risk Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(recentCases as any[]).slice(0, 5).map((case_: any, index: number) => (
              <div key={case_.id} className="flex items-center justify-between p-3 bg-oa-surface rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    case_.aiRiskScore >= 8 ? 'bg-red-500' :
                    case_.aiRiskScore >= 6 ? 'bg-orange-500' :
                    case_.aiRiskScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <div className="text-white font-medium">{case_.title}</div>
                    <div className="text-sm text-gray-400">
                      {case_.type?.replace('_', ' ')} • {case_.reportedUserId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {case_.aiRiskScore && (
                    <Badge className="bg-purple-500/20 text-purple-400">
                      Risk: {case_.aiRiskScore}/10
                    </Badge>
                  )}
                  <Badge variant={case_.status === 'pending' ? 'default' : 'secondary'}>
                    {case_.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {(!recentCases || recentCases.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                No recent cases to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}