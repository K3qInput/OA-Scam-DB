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

        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-oa-surface bg-gradient-to-r from-oa-dark to-oa-surface">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-400 hover:text-white self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{caseData.title}</h1>
                  <Badge className={`border ${getStatusColor(caseData.status)}`}>
                    {caseData.status.toUpperCase()}
                  </Badge>
                  <Badge className={`border ${getPriorityColor(caseData.priority)}`}>
                    {caseData.priority.toUpperCase()}
                  </Badge>
                  {caseData.aiRiskScore && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      <Brain className="h-3 w-3 mr-1" />
                      Risk: {caseData.aiRiskScore}/10
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400">Case #{caseData.caseNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Created</div>
                <div className="text-white">
                  <RealTimeTimestamp date={caseData.createdAt} showFullDate={true} />
                </div>
              </div>
              {caseData.aiUrgencyLevel && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">
                    {caseData.aiUrgencyLevel.toUpperCase()} URGENCY
                  </span>
                </div>
              )}
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

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Case Information Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Basic Information */}
                <Card className="oa-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Reported User</label>
                        <p className="text-white mt-1">{caseData.reportedUserId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Case Type</label>
                        <p className="text-white mt-1">{caseData.type?.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Amount Involved</label>
                        <p className="text-white mt-1">
                          {caseData.amountInvolved ? `${caseData.currency} ${caseData.amountInvolved}` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Reporter</label>
                        <p className="text-white mt-1">{caseData.reporterUserId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="oa-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Case Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-oa-surface rounded-lg">
                        <div className="text-2xl font-bold text-oa-red">{caseData.aiRiskScore || 'N/A'}</div>
                        <div className="text-sm text-gray-400">AI Risk Score</div>
                      </div>
                      <div className="text-center p-4 bg-oa-surface rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.floor((Date.now() - new Date(caseData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-gray-400">Days Open</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card className="oa-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {caseData.description}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {caseData.tags && caseData.tags.length > 0 && (
                <Card className="oa-card">
                  <CardHeader>
                    <CardTitle className="text-white">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {caseData.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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