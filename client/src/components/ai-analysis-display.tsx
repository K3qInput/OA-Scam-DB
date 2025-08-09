import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";
import type { AIAnalysisResult } from "../../../server/ai-analysis";

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
  moderationAdvice?: string;
  className?: string;
}

export function AIAnalysisDisplay({ analysis, moderationAdvice, className }: AIAnalysisDisplayProps) {
  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (score >= 6) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (score >= 4) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Analysis Header */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Brain className="h-5 w-5" />
            AI Analysis Results
            <Badge variant="outline" className="ml-auto text-xs">
              {(analysis.confidence * 100).toFixed(0)}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Risk Score</span>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full border ${getRiskColor(analysis.riskScore)}`}>
                <span className="text-sm font-bold">{analysis.riskScore}/10</span>
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Urgency Level</span>
            <div className="flex items-center gap-2">
              {getUrgencyIcon(analysis.urgencyLevel)}
              <Badge variant={analysis.urgencyLevel === 'critical' ? 'destructive' : 'secondary'}>
                {analysis.urgencyLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Analysis Summary</h4>
            <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
              {analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Indicators */}
      {analysis.fraudIndicators.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Target className="h-4 w-4" />
              Fraud Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.fraudIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{indicator}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {analysis.recommendedActions.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.recommendedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Patterns */}
      {analysis.similarPatterns.length > 0 && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400">Similar Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analysis.similarPatterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2">
                  {pattern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Assessment */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-400">Evidence Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">{analysis.evidenceAssessment}</p>
        </CardContent>
      </Card>

      {/* Moderation Advice */}
      {moderationAdvice && (
        <Alert className="border-amber-500/20 bg-amber-500/5">
          <Brain className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-100">
            <div className="font-medium mb-2">AI Moderation Advice</div>
            <div className="text-sm whitespace-pre-wrap">{moderationAdvice}</div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}