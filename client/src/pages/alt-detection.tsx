import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Search, Shield, Eye, UserX, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AltDetectionReport {
  id: string;
  suspectedAltUserId: string;
  mainAccountUserId?: string;
  reportedBy?: string;
  detectionMethod: string;
  confidenceScore: number;
  evidence: any;
  status: string;
  reviewedBy?: string;
  reviewNotes?: string;
  actionTaken?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function AltDetectionPage() {
  const [reportForm, setReportForm] = useState({
    suspectedAltUserId: "",
    mainAccountUserId: "",
    detectionMethod: "manual_report",
    confidenceScore: 50,
    evidence: {},
    status: "pending",
    reviewNotes: "",
  });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user has staff permissions
  const isStaff = currentUser?.role && ["admin", "tribunal_head", "senior_staff", "staff"].includes(currentUser.role);

  // Search users for alt report
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      return response;
    },
    enabled: searchQuery.length >= 2,
  });

  // Get alt detection reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/alt-detection", selectedStatus],
    queryFn: () => {
      const params = selectedStatus !== "all" ? `?status=${selectedStatus}` : "";
      return apiRequest(`/api/alt-detection${params}`);
    },
    enabled: isStaff,
  });

  // Create alt detection report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return apiRequest("/api/alt-detection", {
        method: "POST",
        body: JSON.stringify(reportData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Alt detection report submitted successfully",
      });
      setReportForm({
        suspectedAltUserId: "",
        mainAccountUserId: "",
        detectionMethod: "manual_report",
        confidenceScore: 50,
        evidence: {},
        status: "pending",
        reviewNotes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alt-detection"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update alt detection report mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/alt-detection/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/alt-detection"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReport = () => {
    if (!reportForm.suspectedAltUserId) {
      toast({
        title: "Validation Error",
        description: "Please select a suspected alt account",
        variant: "destructive",
      });
      return;
    }

    const evidenceData = {
      description: reportForm.reviewNotes,
      reportedBehavior: "Manual report submitted",
      // Add more evidence fields as needed
    };

    createReportMutation.mutate({
      ...reportForm,
      evidence: evidenceData,
    });
  };

  const handleUpdateReport = (reportId: string, updates: any) => {
    updateReportMutation.mutate({ id: reportId, updates });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-100 dark:bg-red-900";
    if (score >= 60) return "text-orange-600 bg-orange-100 dark:bg-orange-900";
    if (score >= 40) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
    return "text-green-600 bg-green-100 dark:bg-green-900";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "false_positive": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "investigating": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const detectionMethods = [
    { value: "ip_match", label: "IP Address Match" },
    { value: "device_fingerprint", label: "Device Fingerprint" },
    { value: "behavior_pattern", label: "Behavior Pattern" },
    { value: "manual_report", label: "Manual Report" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Anti-Alt Detection System</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          The anti-alt detection system helps identify suspicious account relationships and prevent abuse. 
          Reports are reviewed by staff before any action is taken.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Report Suspected Alt Account
            </CardTitle>
            <CardDescription>
              Submit a report about a suspected alternative account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="suspectedUser">Suspected Alt Account</Label>
              <Input
                id="suspectedUser"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {users.length > 0 && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {users.map((user: any) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setReportForm({ ...reportForm, suspectedAltUserId: user.id });
                        setSearchQuery(`${user.firstName} ${user.lastName} (@${user.username})`);
                      }}
                    >
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="mainAccount">Main Account (Optional)</Label>
              <Input
                id="mainAccount"
                placeholder="If known, enter main account username"
                onChange={(e) => setReportForm({ ...reportForm, mainAccountUserId: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="detectionMethod">Detection Method</Label>
              <Select
                value={reportForm.detectionMethod}
                onValueChange={(value) => setReportForm({ ...reportForm, detectionMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {detectionMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="confidence">Confidence Score: {reportForm.confidenceScore}%</Label>
              <input
                type="range"
                id="confidence"
                min="0"
                max="100"
                value={reportForm.confidenceScore}
                onChange={(e) => setReportForm({ ...reportForm, confidenceScore: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <Label htmlFor="evidence">Evidence & Notes</Label>
              <Textarea
                id="evidence"
                placeholder="Describe the evidence and reasoning for this report..."
                value={reportForm.reviewNotes}
                onChange={(e) => setReportForm({ ...reportForm, reviewNotes: e.target.value })}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmitReport}
              disabled={!reportForm.suspectedAltUserId || createReportMutation.isPending}
              className="w-full"
            >
              {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Detection Reports</h2>
            {isStaff && (
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="investigating">Under Investigation</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {!isStaff ? (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Staff permissions required to view reports</p>
              </CardContent>
            </Card>
          ) : reportsLoading ? (
            <div>Loading reports...</div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No reports found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report: AltDetectionReport) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Suspected Alt: {report.suspectedAltUserId}
                        </CardTitle>
                        <CardDescription>
                          {report.mainAccountUserId && `Main Account: ${report.mainAccountUserId}`}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div className={`px-2 py-1 rounded text-xs ${getConfidenceColor(report.confidenceScore)}`}>
                          {report.confidenceScore}% confidence
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Detection Method:</strong> {report.detectionMethod.replace("_", " ")}
                      </div>
                      <div>
                        <strong>Reported:</strong> {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {report.evidence && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <h4 className="font-medium mb-2">Evidence:</h4>
                        <pre className="text-sm whitespace-pre-wrap">
                          {typeof report.evidence === "string" 
                            ? report.evidence 
                            : JSON.stringify(report.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {report.reviewNotes && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <h4 className="font-medium mb-2">Review Notes:</h4>
                        <p className="text-sm">{report.reviewNotes}</p>
                      </div>
                    )}

                    {report.actionTaken && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <h4 className="font-medium mb-2">Action Taken:</h4>
                        <p className="text-sm">{report.actionTaken}</p>
                      </div>
                    )}

                    {isStaff && report.status === "pending" && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateReport(report.id, { status: "investigating" })}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateReport(report.id, { status: "confirmed", actionTaken: "Account flagged for review" })}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateReport(report.id, { status: "false_positive" })}
                        >
                          False Positive
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}