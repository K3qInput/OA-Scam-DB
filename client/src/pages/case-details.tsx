import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, DollarSign, User, FileText, Brain, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { AIAnalysisDisplay } from "@/components/ai-analysis-display";
import { RealTimeTimestamp, CurrentTime } from "@/components/real-time-timestamp";

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ["/api/cases", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`/api/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error('Case not found');
      }
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-oa-black">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="px-8 py-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oa-red"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || (!caseData && !isLoading)) {
    return (
      <div className="flex h-screen bg-oa-black">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header />
          <div className="px-8 py-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Case Not Found</h2>
            <p className="text-gray-400 mb-4">The requested case could not be found.</p>
            <Button onClick={() => setLocation("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <Header />

        {/* Responsive Mobile-First Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-oa-surface bg-gradient-to-r from-oa-dark to-oa-surface">
          <div className="max-w-7xl mx-auto">
            {/* Mobile: Stack all elements vertically */}
            <div className="space-y-4">
              {/* Back Button - Always on top */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-400 hover:text-white w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>

              {/* Title and Badges */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight break-words">
                    {caseData.title}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Case #{caseData.caseNumber}</p>
                </div>
                
                {/* Badges - Responsive grid */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`border text-xs ${getStatusColor(caseData.status)}`}>
                    {caseData.status.toUpperCase()}
                  </Badge>
                  <Badge className={`border text-xs ${getPriorityColor(caseData.priority)}`}>
                    {caseData.priority.toUpperCase()}
                  </Badge>
                  {caseData.aiRiskScore && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      Risk: {caseData.aiRiskScore}/10
                    </Badge>
                  )}
                  {caseData.aiUrgencyLevel && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {caseData.aiUrgencyLevel.toUpperCase()} URGENCY
                    </Badge>
                  )}
                </div>
              </div>

              {/* Timestamps - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-gray-700">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Created</div>
                  <div className="text-white text-sm font-medium">
                    <RealTimeTimestamp date={caseData.createdAt} showFullDate={true} />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Last Updated</div>
                  <div className="text-white text-sm font-medium">
                    <RealTimeTimestamp date={caseData.updatedAt} showRelative={true} />
                  </div>
                </div>
                {caseData.resolvedAt && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Resolved</div>
                    <div className="text-white text-sm font-medium">
                      <RealTimeTimestamp date={caseData.resolvedAt} showFullDate={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-oa-surface">
              <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
              <TabsTrigger value="ai-analysis" className="text-xs sm:text-sm">AI Analysis</TabsTrigger>
              <TabsTrigger value="evidence" className="text-xs sm:text-sm">Evidence</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 sm:space-y-6 mt-6">
              {/* Responsive Mobile-First Layout */}
              <div className="space-y-4 sm:space-y-6">
                
                {/* Primary Case Information Card */}
                <Card className="oa-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Report Details (As Originally Submitted)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Key Information Grid - Mobile Responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Reported User</label>
                          <p className="text-white font-medium break-all">{caseData.reportedUserId}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Reporter</label>
                          <p className="text-white font-medium break-all">{caseData.reporterUserId}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Case Type</label>
                          <p className="text-white font-medium capitalize">
                            {caseData.type?.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Priority Level</label>
                          <Badge className={`${getPriorityColor(caseData.priority)} inline-flex w-fit`}>
                            {caseData.priority?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Status</label>
                          <Badge className={`${getStatusColor(caseData.status)} inline-flex w-fit`}>
                            {caseData.status?.toUpperCase()}
                          </Badge>
                        </div>
                        {caseData.amountInvolved && (
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Financial Impact</label>
                            <p className="text-white font-medium text-lg">
                              {caseData.currency || 'USD'} {parseFloat(caseData.amountInvolved).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Case Numbers and Timing */}
                      <div className="pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Case Number</label>
                            <p className="text-white font-medium">#{caseData.caseNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Created</label>
                            <p className="text-white font-medium">
                              <RealTimeTimestamp date={caseData.createdAt} showFullDate={true} />
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Last Update</label>
                            <p className="text-white font-medium">
                              <RealTimeTimestamp date={caseData.updatedAt} showRelative={true} />
                            </p>
                          </div>
                          {caseData.staffUserId && (
                            <div className="space-y-1">
                              <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Assigned Staff</label>
                              <p className="text-white font-medium">{caseData.staffUserId}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Report Description Card */}
                <Card className="oa-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Original Report Description
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">This is the exact description as provided by the user</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6">
                      <div className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {caseData.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional User-Provided Details */}
                {(caseData.tags && caseData.tags.length > 0) || caseData.metadata && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Tags Section */}
                    {caseData.tags && caseData.tags.length > 0 && (
                      <Card className="oa-card">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">User-Provided Tags</CardTitle>
                          <p className="text-sm text-gray-400">Original tags as submitted</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {caseData.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-blue-400 border-blue-500/50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metadata Section */}
                    {caseData.metadata && Object.keys(caseData.metadata).length > 0 && (
                      <Card className="oa-card">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">Additional Information</CardTitle>
                          <p className="text-sm text-gray-400">Extra details provided by user</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(caseData.metadata).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span className="text-gray-400 capitalize text-sm font-medium">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-white break-words text-sm">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* AI Analysis Summary (if available) */}
                {(caseData.aiRiskScore || caseData.aiUrgencyLevel || caseData.moderationAdvice) && (
                  <Card className="oa-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Brain className="h-5 w-5 text-purple-400" />
                        AI Analysis Summary
                      </CardTitle>
                      <p className="text-sm text-gray-400">Automated analysis of the case</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {caseData.aiRiskScore && (
                          <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="text-3xl font-bold text-purple-400">{caseData.aiRiskScore}/10</div>
                            <div className="text-sm text-gray-400 mt-1">Risk Score</div>
                          </div>
                        )}
                        {caseData.aiUrgencyLevel && (
                          <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div className="text-xl font-bold text-orange-400 capitalize">{caseData.aiUrgencyLevel}</div>
                            <div className="text-sm text-gray-400 mt-1">Urgency Level</div>
                          </div>
                        )}
                        <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-xl font-bold text-blue-400">
                            {Math.floor((Date.now() - new Date(caseData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">Days Since Report</div>
                        </div>
                      </div>
                      {caseData.moderationAdvice && (
                        <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            AI Moderation Advice:
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{caseData.moderationAdvice}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>



            <TabsContent value="ai-analysis" className="mt-6">
              {caseData.aiAnalysis ? (
                <AIAnalysisDisplay 
                  data={caseData.aiAnalysis} 
                  caseId={caseData.id}
                />
              ) : (
                <Card className="oa-card">
                  <CardContent className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No AI Analysis Available</h3>
                    <p className="text-gray-400">AI analysis was not performed for this case.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="evidence" className="mt-6">
              <Card className="oa-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Evidence Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Evidence display functionality coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card className="oa-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Case Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-oa-surface rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <div className="text-white font-medium">Case Created</div>
                        <div className="text-sm text-gray-400">
                          <RealTimeTimestamp date={caseData.createdAt} showFullDate={true} />
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          Initial report submitted by user (<RealTimeTimestamp date={caseData.createdAt} showRelative={true} />)
                        </div>
                      </div>
                    </div>

                    {caseData.aiAnalysis && (
                      <div className="flex items-start gap-4 p-4 bg-oa-surface rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <div className="text-white font-medium">AI Analysis Completed</div>
                          <div className="text-sm text-gray-400">
                            <RealTimeTimestamp date={caseData.updatedAt || caseData.createdAt} showFullDate={true} />
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            Risk assessment: {caseData.aiRiskScore}/10, Urgency: {caseData.aiUrgencyLevel}
                            <br />
                            <RealTimeTimestamp date={caseData.updatedAt || caseData.createdAt} showRelative={true} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}