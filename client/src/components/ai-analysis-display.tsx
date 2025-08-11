import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Zap, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  MessageSquare,
  FileText,
  User,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AIAnalysisData {
  overall: {
    riskScore: number;
    confidence: number;
    recommendation: 'approve' | 'reject' | 'investigate' | 'escalate';
    summary: string;
  };
  patterns: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    evidence: string[];
  }>;
  sentiment: {
    score: number;
    classification: 'positive' | 'neutral' | 'negative';
    indicators: string[];
  };
  timeline: Array<{
    timestamp: string;
    event: string;
    significance: number;
  }>;
  redFlags: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    automated: boolean;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  }>;
}

interface AIAnalysisDisplayProps {
  caseId?: string;
  data?: AIAnalysisData;
  loading?: boolean;
}

export function AIAnalysisDisplay({ caseId, data, loading }: AIAnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // If no data provided, fetch it
  const { data: analysisData, isLoading } = useQuery<AIAnalysisData>({
    queryKey: ["/api/ai-analysis", caseId],
    enabled: !data && !!caseId,
    initialData: data || {
      overall: {
        riskScore: 78,
        confidence: 85,
        recommendation: 'investigate',
        summary: 'Analysis indicates potential fraudulent activity with multiple red flags including suspicious communication patterns, financial irregularities, and behavior consistent with known scam tactics.'
      },
      patterns: [
        {
          type: "Communication Pattern",
          description: "Urgency-driven language with pressure tactics commonly used in scam scenarios",
          severity: "high",
          confidence: 92,
          evidence: ["Multiple urgency keywords", "Pressure for immediate action", "Avoidance of verification"]
        },
        {
          type: "Financial Pattern", 
          description: "Transaction structure matches known cryptocurrency scam methodologies",
          severity: "critical",
          confidence: 89,
          evidence: ["Upfront payment request", "Cryptocurrency preferred", "No refund policy mentioned"]
        },
        {
          type: "Identity Pattern",
          description: "Profile inconsistencies suggest potential fake identity or impersonation",
          severity: "medium",
          confidence: 76,
          evidence: ["Mismatched profile information", "Recent account creation", "Limited verification"]
        }
      ],
      sentiment: {
        score: -0.65,
        classification: 'negative',
        indicators: ["Aggressive language", "Deceptive promises", "Intimidation tactics"]
      },
      timeline: [
        { timestamp: "2024-01-15T10:00:00Z", event: "Initial contact made", significance: 3 },
        { timestamp: "2024-01-15T11:30:00Z", event: "Service offer presented", significance: 5 },
        { timestamp: "2024-01-15T14:15:00Z", event: "Payment requested", significance: 8 },
        { timestamp: "2024-01-15T15:45:00Z", event: "Victim compliance", significance: 9 },
        { timestamp: "2024-01-16T09:00:00Z", event: "Contact ceased", significance: 10 }
      ],
      redFlags: [
        {
          category: "Communication",
          description: "Excessive urgency and pressure tactics detected",
          severity: "high",
          automated: true
        },
        {
          category: "Financial",
          description: "Upfront payment request before service delivery",
          severity: "critical",
          automated: true
        },
        {
          category: "Behavior",
          description: "Pattern matches known cryptocurrency scams",
          severity: "high",
          automated: false
        },
        {
          category: "Identity",
          description: "Limited account history and verification",
          severity: "medium",
          automated: true
        }
      ],
      recommendations: [
        {
          action: "Escalate to senior investigator",
          priority: "high",
          reasoning: "Multiple critical red flags indicate sophisticated scam operation"
        },
        {
          action: "Cross-reference with known scammer database",
          priority: "high", 
          reasoning: "Communication patterns match previous reported cases"
        },
        {
          action: "Request additional evidence from reporter",
          priority: "medium",
          reasoning: "Additional transaction records could strengthen case"
        }
      ]
    }
  });

  const displayData = data || analysisData;
  const isLoadingState = loading || isLoading;

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

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'approve': return 'bg-green-900 text-green-200';
      case 'reject': return 'bg-red-900 text-red-200';
      case 'investigate': return 'bg-orange-900 text-orange-200';
      default: return 'bg-purple-900 text-purple-200';
    }
  };

  if (isLoadingState) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            AI Analysis Processing...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-600 rounded w-1/2"></div>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskColors = getRiskColor(displayData.overall.riskScore);

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Risk Score */}
            <div className={`p-4 rounded-lg border ${riskColors.bg} ${riskColors.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Risk Score</h4>
                <Target className={`h-4 w-4 ${riskColors.color}`} />
              </div>
              <div className="text-2xl font-bold mb-2">
                <span className={riskColors.color}>{displayData.overall.riskScore}</span>
                <span className="text-sm text-slate-400 ml-1">/100</span>
              </div>
              <Progress value={displayData.overall.riskScore} className="h-2" />
            </div>

            {/* Confidence */}
            <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Confidence</h4>
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {displayData.overall.confidence}%
              </div>
              <Progress value={displayData.overall.confidence} className="h-2" />
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg border bg-slate-700 border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Recommendation</h4>
                <Shield className="h-4 w-4 text-slate-400" />
              </div>
              <Badge className={`${getRecommendationColor(displayData.overall.recommendation)} text-sm font-medium`}>
                {displayData.overall.recommendation.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <Alert className="border-blue-700 bg-blue-900/20">
            <Brain className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>AI Summary:</strong> {displayData.overall.summary}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-slate-600">
                Patterns
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-600">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-slate-600">
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Red Flags */}
              <div className="space-y-3">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Red Flags Detected
                </h4>
                <div className="grid gap-2">
                  {displayData.redFlags.map((flag, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {flag.category}
                          </Badge>
                          <Badge className={getSeverityColor(flag.severity)}>
                            {flag.severity}
                          </Badge>
                          {flag.automated && (
                            <Badge variant="outline" className="text-xs bg-purple-900/20 text-purple-300">
                              Auto-detected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-300">{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="space-y-3">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Sentiment Analysis
                </h4>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Overall Sentiment</span>
                    <Badge className={`${
                      displayData.sentiment.classification === 'positive' ? 'bg-green-900 text-green-200' :
                      displayData.sentiment.classification === 'negative' ? 'bg-red-900 text-red-200' :
                      'bg-gray-900 text-gray-200'
                    }`}>
                      {displayData.sentiment.classification.toUpperCase()}
                    </Badge>
                  </div>
                  <Progress 
                    value={((displayData.sentiment.score + 1) / 2) * 100} 
                    className="h-2 mb-2" 
                  />
                  <div className="flex flex-wrap gap-1">
                    {displayData.sentiment.indicators.map((indicator, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid gap-4">
                {displayData.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white mb-1">{pattern.type}</h4>
                        <p className="text-sm text-slate-300">{pattern.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getSeverityColor(pattern.severity)}>
                          {pattern.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">{pattern.confidence}% confidence</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 mb-1">Evidence:</p>
                      {pattern.evidence.map((evidence, evidenceIndex) => (
                        <div key={evidenceIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-slate-300">{evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Event Timeline Analysis
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={displayData.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value, name) => [value, 'Significance']}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="significance" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {displayData.timeline.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                      <span className="text-slate-300">{event.event}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Impact: {event.significance}/10</span>
                        <span className="text-xs text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Recommended Actions
                </h4>
                <div className="grid gap-3">
                  {displayData.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-white">{rec.action}</h5>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-900 text-red-200' :
                          rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-blue-900 text-blue-200'
                        }>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIAnalysisDisplay;