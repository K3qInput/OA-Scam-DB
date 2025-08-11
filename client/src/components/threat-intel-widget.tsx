import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye, 
  Globe,
  Users,
  Activity,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ThreatIntelData {
  riskScore: number;
  activeThreats: number;
  blockedAttempts: number;
  riskTrend: number;
  topThreats: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    description: string;
    lastSeen: string;
  }>;
  regions: Array<{
    name: string;
    threatCount: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  indicators: Array<{
    type: 'ip' | 'domain' | 'email' | 'username';
    value: string;
    confidence: number;
    source: string;
    lastUpdated: string;
  }>;
}

export default function ThreatIntelWidget() {
  const { data: threatData, isLoading } = useQuery<ThreatIntelData>({
    queryKey: ["/api/threat-intel"],
    refetchInterval: 60000, // Update every minute
    initialData: {
      riskScore: 75,
      activeThreats: 12,
      blockedAttempts: 247,
      riskTrend: -8.5,
      topThreats: [
        {
          id: "1",
          type: "Phishing Campaign",
          severity: "high",
          count: 45,
          description: "Discord server impersonation targeting crypto users",
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          type: "Fake Service Provider",
          severity: "medium",
          count: 28,
          description: "Fraudulent Minecraft server hosting services",
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          type: "Account Takeover",
          severity: "critical",
          count: 15,
          description: "Compromised Discord accounts spreading malware",
          lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ],
      regions: [
        { name: "North America", threatCount: 89, riskLevel: "medium" },
        { name: "Europe", threatCount: 156, riskLevel: "high" },
        { name: "Asia", threatCount: 67, riskLevel: "low" },
        { name: "Other", threatCount: 23, riskLevel: "low" }
      ],
      indicators: [
        {
          type: "ip",
          value: "192.168.1.100",
          confidence: 95,
          source: "Community Reports",
          lastUpdated: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          type: "domain",
          value: "fake-discord.com",
          confidence: 88,
          source: "Automated Detection",
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ]
    }
  });

  const getRiskColor = (score: number) => {
    if (score >= 80) return { color: "text-red-400", bg: "bg-red-900/20", border: "border-red-700" };
    if (score >= 60) return { color: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-700" };
    if (score >= 40) return { color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-700" };
    return { color: "text-green-400", bg: "bg-green-900/20", border: "border-green-700" };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-200 border-red-700';
      case 'high': return 'bg-orange-900 text-orange-200 border-orange-700';
      case 'medium': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      default: return 'bg-blue-900 text-blue-200 border-blue-700';
    }
  };

  const getRegionRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const riskColors = getRiskColor(threatData.riskScore);

  return (
    <div className="space-y-4">
      {/* Threat Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Threat Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Score */}
            <div className={`p-4 rounded-lg border ${riskColors.bg} ${riskColors.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Risk Score</h4>
                <Zap className={`h-4 w-4 ${riskColors.color}`} />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${riskColors.color}`}>
                    {threatData.riskScore}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                  <div className={`flex items-center text-xs ${
                    threatData.riskTrend < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {threatData.riskTrend < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(threatData.riskTrend)}%
                  </div>
                </div>
                <Progress value={threatData.riskScore} className="h-2" />
              </div>
            </div>

            {/* Active Threats */}
            <div className="p-4 rounded-lg border bg-orange-900/20 border-orange-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Active Threats</h4>
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {threatData.activeThreats}
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently monitoring</p>
            </div>

            {/* Blocked Attempts */}
            <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Blocked Today</h4>
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {threatData.blockedAttempts}
              </div>
              <p className="text-xs text-slate-400 mt-1">Malicious attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Threats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Threat Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-slate-600 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-600 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                threatData.topThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className="p-3 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white text-sm">{threat.type}</h4>
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{threat.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-400">{threat.count}</div>
                        <p className="text-xs text-slate-400">reports</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Last seen: {formatDistanceToNow(new Date(threat.lastSeen), { addSuffix: true })}</span>
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-6 p-0">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Threat Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threatData.regions.map((region) => (
              <div key={region.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getRegionRiskColor(region.riskLevel)}`} />
                  <span className="text-sm text-slate-300">{region.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-medium">{region.threatCount}</span>
                  <div className="w-20">
                    <Progress 
                      value={(region.threatCount / Math.max(...threatData.regions.map(r => r.threatCount))) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threat Indicators */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {threatData.indicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-700 rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {indicator.type.toUpperCase()}
                    </Badge>
                    <code className="text-slate-300 bg-slate-600 px-1 rounded">
                      {indicator.value}
                    </code>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{indicator.confidence}%</div>
                    <div className="text-slate-500">{indicator.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}