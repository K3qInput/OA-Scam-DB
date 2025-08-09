import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Brain, AlertTriangle, CheckCircle, DollarSign, User, Calendar, Tag } from "lucide-react";
import { insertCaseSchema } from "../../../shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

const enhancedCaseSchema = insertCaseSchema.extend({
  evidenceFiles: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  estimatedLoss: z.string().optional(),
  incidentDate: z.string().optional(),
});

type EnhancedCaseForm = z.infer<typeof enhancedCaseSchema>;

export function EnhancedNewCase() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiAnalysisInProgress, setAiAnalysisInProgress] = useState(false);
  const [previewAnalysis, setPreviewAnalysis] = useState<any>(null);

  const form = useForm<EnhancedCaseForm>({
    resolver: zodResolver(enhancedCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "other",
      priority: "medium",
      amountInvolved: undefined,
      currency: "USD",
      reportedUserId: "",
      tags: [],
      urgencyLevel: "medium",
      estimatedLoss: "",
      incidentDate: "",
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: EnhancedCaseForm) => {
      setAiAnalysisInProgress(true);
      try {
        const response = await apiRequest("/api/cases", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return response;
      } finally {
        setAiAnalysisInProgress(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Case Created Successfully",
        description: data.aiAnalysis 
          ? `Case created with AI analysis. Risk Score: ${data.aiAnalysis.riskScore}/10`
          : "Case created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Case",
        description: error.message || "Failed to create case",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnhancedCaseForm) => {
    createCaseMutation.mutate(data);
  };

  const handleQuickAnalysis = async () => {
    const formData = form.getValues();
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and description for analysis",
        variant: "destructive",
      });
      return;
    }

    setAiAnalysisInProgress(true);
    try {
      // Simulate AI analysis preview
      setPreviewAnalysis({
        riskScore: Math.floor(Math.random() * 10) + 1,
        confidence: Math.random() * 0.4 + 0.6,
        urgencyLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
        fraudIndicators: [
          "Suspicious transaction pattern detected",
          "Amount exceeds typical thresholds",
          "Multiple account associations found"
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        summary: "Preliminary analysis suggests potential fraudulent activity based on reported patterns and associated indicators."
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not perform AI analysis at this time",
        variant: "destructive",
      });
    } finally {
      setAiAnalysisInProgress(false);
    }
  };

  const caseTypes = [
    { value: "financial_scam", label: "Financial Scam" },
    { value: "identity_theft", label: "Identity Theft" },
    { value: "fake_services", label: "Fake Services" },
    { value: "account_fraud", label: "Account Fraud" },
    { value: "investment_fraud", label: "Investment Fraud" },
    { value: "cryptocurrency_scam", label: "Cryptocurrency Scam" },
    { value: "romance_scam", label: "Romance Scam" },
    { value: "tech_support_scam", label: "Tech Support Scam" },
    { value: "other", label: "Other" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-500" },
    { value: "medium", label: "Medium", color: "text-yellow-500" },
    { value: "high", label: "High", color: "text-orange-500" },
    { value: "critical", label: "Critical", color: "text-red-500" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-oa-dark to-oa-surface border border-oa-surface rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Case</h1>
            <p className="text-gray-400">
              Submit a detailed fraud report with AI-powered analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-400" />
            <div className="text-right">
              <div className="text-sm text-gray-400">AI-Enhanced</div>
              <div className="text-purple-400 font-semibold">Smart Detection</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-oa-surface">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="details">Case Details</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence & Files</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <Card className="oa-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Case Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Case Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Brief, descriptive title of the incident"
                                className="oa-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Detailed Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Provide a comprehensive description of the incident, including timeline, methods used, and any relevant details..."
                                className="oa-input min-h-32"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Case Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="oa-input">
                                    <SelectValue placeholder="Select case type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-oa-dark border-gray-600">
                                  {caseTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Priority Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="oa-input">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-oa-dark border-gray-600">
                                  {priorities.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      <span className={priority.color}>{priority.label}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card className="oa-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Subject & Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="reportedUserId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Reported User/Entity</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Username, email, or identifier of reported party"
                                className="oa-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="amountInvolved"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Amount Involved</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="0.00"
                                  className="oa-input"
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="oa-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-oa-dark border-gray-600">
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="BTC">BTC (₿)</SelectItem>
                                  <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incidentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Incident Date</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  className="oa-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-4">
                  <Card className="oa-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Evidence & Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Upload Evidence Files</h3>
                        <p className="text-gray-400 mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <Button type="button" variant="outline" className="mb-2">
                          Choose Files
                        </Button>
                        <p className="text-xs text-gray-500">
                          Supported: Images, PDFs, Documents (Max 10MB each)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="oa-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleQuickAnalysis}
                        disabled={aiAnalysisInProgress}
                        className="oa-btn-secondary"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        {aiAnalysisInProgress ? "Analyzing..." : "Quick AI Analysis"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/dashboard")}
                        className="oa-btn-secondary"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCaseMutation.isPending}
                        className="oa-btn-primary"
                      >
                        {createCaseMutation.isPending ? "Creating..." : "Create Case"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          {(aiAnalysisInProgress || createCaseMutation.isPending) && (
            <Card className="oa-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
                  <span className="text-white font-medium">
                    {aiAnalysisInProgress ? "AI Analysis in Progress" : "Creating Case"}
                  </span>
                </div>
                <Progress value={aiAnalysisInProgress ? 45 : 85} className="mb-2" />
                <p className="text-sm text-gray-400">
                  {aiAnalysisInProgress 
                    ? "Analyzing patterns and risk factors..." 
                    : "Finalizing case creation..."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Preview */}
          {previewAnalysis && (
            <Card className="oa-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Risk Score</span>
                  <Badge className={`${
                    previewAnalysis.riskScore >= 8 ? 'bg-red-500/20 text-red-400' :
                    previewAnalysis.riskScore >= 6 ? 'bg-orange-500/20 text-orange-400' :
                    previewAnalysis.riskScore >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {previewAnalysis.riskScore}/10
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Confidence</span>
                  <span className="text-white">
                    {(previewAnalysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Urgency</span>
                  <Badge variant="outline">
                    {previewAnalysis.urgencyLevel.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Fraud Indicators</h4>
                  <div className="space-y-1">
                    {previewAnalysis.fraudIndicators.map((indicator: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-400">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-blue-500/20 bg-blue-500/5">
                  <AlertTriangle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-100 text-sm">
                    {previewAnalysis.summary}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Case Guidelines */}
          <Card className="oa-card">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Reporting Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Provide as much detail as possible</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Include relevant screenshots or documents</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Specify exact amounts and dates</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">Maintain confidentiality of sensitive information</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}