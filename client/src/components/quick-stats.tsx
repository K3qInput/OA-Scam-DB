import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Brain, Target, Shield } from "lucide-react";

interface QuickStatsProps {
  totalCases: number;
  pendingCases: number;
  resolvedCases: number;
  averageRiskScore: number;
  weeklyChange: number;
  resolutionRate: number;
}

export default function QuickStats({
  totalCases,
  pendingCases,
  resolvedCases,
  averageRiskScore,
  weeklyChange,
  resolutionRate
}: QuickStatsProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 8) return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" };
    if (score >= 6) return { label: "High", color: "text-orange-500", bg: "bg-orange-500/10" };
    if (score >= 4) return { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Low", color: "text-green-500", bg: "bg-green-500/10" };
  };

  const riskLevel = getRiskLevel(averageRiskScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Total Cases */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-white">{totalCases.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            {weeklyChange > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={weeklyChange > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(weeklyChange)}%
            </span>
            <span className="text-gray-400 ml-1">this week</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Cases */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingCases}</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="mt-2">
            <Progress 
              value={(pendingCases / totalCases) * 100} 
              className="h-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resolved Cases */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-400">{resolvedCases}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <Progress 
              value={(resolvedCases / totalCases) * 100} 
              className="h-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Score */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Risk Score</p>
              <p className={`text-2xl font-bold ${riskLevel.color}`}>
                {averageRiskScore.toFixed(1)}
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <Badge className={`${riskLevel.bg} ${riskLevel.color} text-xs`}>
              {riskLevel.label} Risk
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Resolution Rate</p>
              <p className="text-2xl font-bold text-cyan-400">{resolutionRate}%</p>
            </div>
            <Target className="h-8 w-8 text-cyan-500" />
          </div>
          <div className="mt-2">
            <Progress 
              value={resolutionRate} 
              className="h-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Score */}
      <Card className="oa-card hover:scale-105 transition-transform duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Efficiency</p>
              <p className="text-2xl font-bold text-indigo-400">
                {Math.round(resolutionRate * 0.8 + (10 - averageRiskScore) * 2)}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Based on resolution rate & risk management
          </div>
        </CardContent>
      </Card>
    </div>
  );
}