import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, DollarSign, Eye, EyeOff, ExternalLink, Calendar, User, Tag } from "lucide-react";

interface ReportVaultEntry {
  id: string;
  reportedUserId?: string;
  reportedUsername: string;
  reportedDiscordId?: string;
  scamType: string;
  description: string;
  evidenceUrls: string[];
  damageClaimed?: number;
  status: string;
  reportedBy: string;
  verifiedBy?: string;
  isPublic: boolean;
  warningLevel: string;
  tags: string[];
  caseId?: string;
  createdAt: string;
  verifiedAt?: string;
}

export default function ReportVault() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScamType, setFilterScamType] = useState("");
  const [filterWarningLevel, setFilterWarningLevel] = useState("");
  const [reportForm, setReportForm] = useState({
    reportedUsername: "",
    reportedDiscordId: "",
    scamType: "",
    description: "",
    evidenceUrls: [] as string[],
    damageClaimed: "",
    warningLevel: "high",
    tags: [] as string[]
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/report-vault", { search: searchQuery, scamType: filterScamType, warningLevel: filterWarningLevel }],
  });

  const { data: myReports } = useQuery({
    queryKey: ["/api/report-vault/my"],
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/report-vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          ...data,
          damageClaimed: data.damageClaimed ? parseInt(data.damageClaimed) * 100 : null // Convert to cents
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/report-vault"] });
      setReportForm({
        reportedUsername: "",
        reportedDiscordId: "",
        scamType: "",
        description: "",
        evidenceUrls: [],
        damageClaimed: "",
        warningLevel: "high",
        tags: []
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit report", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const verifyReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/report-vault/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Failed to verify report");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report verified successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/report-vault"] });
    }
  });

  const handleSubmitReport = () => {
    if (!reportForm.reportedUsername || !reportForm.scamType || !reportForm.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    submitReportMutation.mutate(reportForm);
  };

  const getWarningLevelColor = (level: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getScamTypeDisplay = (type: string) => {
    const types = {
      payment_scam: "Payment Scam",
      fake_services: "Fake Services",
      impersonation: "Impersonation",
      exit_scam: "Exit Scam",
      phishing: "Phishing",
      social_engineering: "Social Engineering"
    };
    return types[type as keyof typeof types] || type;
  };

  const ReportCard = ({ report }: { report: ReportVaultEntry }) => (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              {report.reportedUsername}
              {!report.isPublic && <EyeOff className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getWarningLevelColor(report.warningLevel)}>
                {report.warningLevel} risk
              </Badge>
              <Badge variant="outline">
                {getScamTypeDisplay(report.scamType)}
              </Badge>
              {report.status === "confirmed" && (
                <Badge variant="destructive">Confirmed</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            {report.damageClaimed && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <DollarSign className="w-4 h-4" />
                ${(report.damageClaimed / 100).toFixed(0)} claimed
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Reported {new Date(report.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm">{report.description}</p>

        {report.reportedDiscordId && (
          <div className="text-sm">
            <strong>Discord ID:</strong> <code className="bg-muted px-1 rounded">{report.reportedDiscordId}</code>
          </div>
        )}

        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {report.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {report.evidenceUrls.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Evidence:</div>
            <div className="space-y-1">
              {report.evidenceUrls.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Evidence {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Reported by: {report.reportedBy}</span>
          {report.verifiedBy && (
            <span>Verified by: {report.verifiedBy}</span>
          )}
        </div>

        {report.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => verifyReportMutation.mutate({ id: report.id, status: "confirmed" })}
              disabled={verifyReportMutation.isPending}
            >
              Confirm Report
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => verifyReportMutation.mutate({ id: report.id, status: "disputed" })}
              disabled={verifyReportMutation.isPending}
            >
              Mark as Disputed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ReportSubmissionForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Submit Scammer Report
        </CardTitle>
        <CardDescription>
          Help protect the community by reporting confirmed scammers and bad actors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only submit reports for confirmed scams with evidence. False reports will result in penalties.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportedUsername">Username/Handle *</Label>
            <Input
              id="reportedUsername"
              value={reportForm.reportedUsername}
              onChange={(e) => setReportForm(prev => ({ ...prev, reportedUsername: e.target.value }))}
              placeholder="Discord username, platform handle, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportedDiscordId">Discord ID (if known)</Label>
            <Input
              id="reportedDiscordId"
              value={reportForm.reportedDiscordId}
              onChange={(e) => setReportForm(prev => ({ ...prev, reportedDiscordId: e.target.value }))}
              placeholder="18-digit Discord user ID"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scamType">Scam Type *</Label>
            <Select 
              value={reportForm.scamType} 
              onValueChange={(value) => setReportForm(prev => ({ ...prev, scamType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_scam">Payment Scam</SelectItem>
                <SelectItem value="fake_services">Fake Services</SelectItem>
                <SelectItem value="impersonation">Impersonation</SelectItem>
                <SelectItem value="exit_scam">Exit Scam</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="social_engineering">Social Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warningLevel">Warning Level</Label>
            <Select 
              value={reportForm.warningLevel} 
              onValueChange={(value) => setReportForm(prev => ({ ...prev, warningLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={reportForm.description}
            onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the scam, what happened, how it was conducted, etc."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evidenceUrls">Evidence URLs (one per line)</Label>
          <Textarea
            id="evidenceUrls"
            value={reportForm.evidenceUrls.join("\n")}
            onChange={(e) => setReportForm(prev => ({ 
              ...prev, 
              evidenceUrls: e.target.value.split("\n").filter(url => url.trim())
            }))}
            placeholder="https://imgur.com/evidence1
https://pastebin.com/chatlog
https://screenshot-link"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="damageClaimed">Financial Damage ($)</Label>
            <Input
              id="damageClaimed"
              type="number"
              value={reportForm.damageClaimed}
              onChange={(e) => setReportForm(prev => ({ ...prev, damageClaimed: e.target.value }))}
              placeholder="Estimated financial loss"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={reportForm.tags.join(", ")}
              onChange={(e) => setReportForm(prev => ({ 
                ...prev, 
                tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
              }))}
              placeholder="discord, paypal, cryptocurrency"
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmitReport}
          disabled={submitReportMutation.isPending}
          className="w-full"
        >
          {submitReportMutation.isPending ? "Submitting..." : "Submit Report"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Report Vault</h1>
          <p className="text-muted-foreground">
            Public database of confirmed scammers and fraud reports to protect the community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Reports</TabsTrigger>
            <TabsTrigger value="submit">Submit Report</TabsTrigger>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by username, Discord ID, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterScamType} onValueChange={setFilterScamType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by scam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="payment_scam">Payment Scam</SelectItem>
                        <SelectItem value="fake_services">Fake Services</SelectItem>
                        <SelectItem value="impersonation">Impersonation</SelectItem>
                        <SelectItem value="exit_scam">Exit Scam</SelectItem>
                        <SelectItem value="phishing">Phishing</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterWarningLevel} onValueChange={setFilterWarningLevel}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : !reports || reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports found matching your criteria
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report: ReportVaultEntry) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit">
            <ReportSubmissionForm />
          </TabsContent>

          <TabsContent value="my-reports">
            <Card>
              <CardHeader>
                <CardTitle>My Submitted Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {!myReports || myReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports submitted yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReports.map((report: ReportVaultEntry) => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}