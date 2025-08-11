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
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Clock, Upload, User, FileText, Globe, Star } from "lucide-react";

interface MemberVerification {
  id: string;
  userId: string;
  verificationType: string;
  status: string;
  verificationData: any;
  submittedBy: string;
  reviewedBy?: string;
  reviewNotes?: string;
  verificationLevel: number;
  expiresAt?: string;
  createdAt: string;
  reviewedAt?: string;
  user?: {
    username: string;
    email: string;
    profileImageUrl?: string;
  };
}

export default function MemberVerification() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submit");
  const [verificationForm, setVerificationForm] = useState({
    verificationType: "",
    verificationData: {},
    documents: [] as File[]
  });

  const { data: verifications, isLoading } = useQuery({
    queryKey: ["/api/member-verification"],
  });

  const { data: myVerifications } = useQuery({
    queryKey: ["/api/member-verification/my"],
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("verificationType", data.verificationType);
      formData.append("verificationData", JSON.stringify(data.verificationData));
      
      data.documents.forEach((file: File) => {
        formData.append("documents", file);
      });

      const response = await fetch("/api/member-verification", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to submit verification");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Verification submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/member-verification"] });
      setVerificationForm({ verificationType: "", verificationData: {}, documents: [] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit verification", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const reviewVerificationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const response = await fetch(`/api/member-verification/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ status, reviewNotes: notes })
      });

      if (!response.ok) {
        throw new Error("Failed to review verification");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Verification reviewed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/member-verification"] });
    }
  });

  const handleSubmitVerification = () => {
    if (!verificationForm.verificationType) {
      toast({ title: "Please select a verification type", variant: "destructive" });
      return;
    }

    submitVerificationMutation.mutate(verificationForm);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVerificationForm(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getVerificationTypeDisplay = (type: string) => {
    const types = {
      manual: "Manual Review",
      document: "Document Verification", 
      social: "Social Media Verification",
      reputation: "Reputation-Based",
      automated: "Automated Checks"
    };
    return types[type as keyof typeof types] || type;
  };

  const VerificationSubmissionForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Submit Verification Request
        </CardTitle>
        <CardDescription>
          Choose your verification method and provide required information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="verificationType">Verification Type</Label>
          <Select 
            value={verificationForm.verificationType} 
            onValueChange={(value) => setVerificationForm(prev => ({ ...prev, verificationType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select verification method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Verification (ID, Business License)
                </div>
              </SelectItem>
              <SelectItem value="social">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Social Media Verification
                </div>
              </SelectItem>
              <SelectItem value="reputation">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Reputation-Based (Portfolio, References)
                </div>
              </SelectItem>
              <SelectItem value="manual">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Manual Review (Video Call)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {verificationForm.verificationType === "document" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Upload Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div className="text-sm text-gray-600 mb-2">
                  Upload government ID, business license, or other verification documents
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="max-w-xs mx-auto"
                />
                {verificationForm.documents.length > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    {verificationForm.documents.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {verificationForm.verificationType === "social" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="socialLinks">Social Media Links</Label>
              <Textarea
                placeholder="Provide links to your verified social media accounts, GitHub, portfolio website, etc."
                value={(verificationForm.verificationData as any)?.socialLinks || ""}
                onChange={(e) => setVerificationForm(prev => ({
                  ...prev,
                  verificationData: { ...prev.verificationData, socialLinks: e.target.value }
                }))}
              />
            </div>
          </div>
        )}

        {verificationForm.verificationType === "reputation" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Work Examples</Label>
              <Textarea
                placeholder="Provide links to your best work, client testimonials, or references"
                value={(verificationForm.verificationData as any)?.portfolio || ""}
                onChange={(e) => setVerificationForm(prev => ({
                  ...prev,
                  verificationData: { ...prev.verificationData, portfolio: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Description</Label>
              <Textarea
                placeholder="Describe your relevant experience and achievements"
                value={(verificationForm.verificationData as any)?.experience || ""}
                onChange={(e) => setVerificationForm(prev => ({
                  ...prev,
                  verificationData: { ...prev.verificationData, experience: e.target.value }
                }))}
              />
            </div>
          </div>
        )}

        {verificationForm.verificationType === "manual" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Interview Time</Label>
              <Input
                type="datetime-local"
                value={(verificationForm.verificationData as any)?.preferredTime || ""}
                onChange={(e) => setVerificationForm(prev => ({
                  ...prev,
                  verificationData: { ...prev.verificationData, preferredTime: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Manual Verification</Label>
              <Textarea
                placeholder="Explain why you need manual verification and what you'd like to discuss"
                value={(verificationForm.verificationData as any)?.reason || ""}
                onChange={(e) => setVerificationForm(prev => ({
                  ...prev,
                  verificationData: { ...prev.verificationData, reason: e.target.value }
                }))}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmitVerification}
          disabled={submitVerificationMutation.isPending}
          className="w-full"
        >
          {submitVerificationMutation.isPending ? "Submitting..." : "Submit Verification Request"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Member Verification</h1>
          <p className="text-muted-foreground">
            Get verified to unlock full platform access and build trust with the community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="submit">Submit Request</TabsTrigger>
            <TabsTrigger value="my-status">My Status</TabsTrigger>
            <TabsTrigger value="review">Review Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <VerificationSubmissionForm />
          </TabsContent>

          <TabsContent value="my-status">
            <Card>
              <CardHeader>
                <CardTitle>My Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!myVerifications || myVerifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No verification requests submitted yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myVerifications.map((verification: MemberVerification) => (
                      <div key={verification.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(verification.status)}
                            <span className="font-medium">
                              {getVerificationTypeDisplay(verification.verificationType)}
                            </span>
                          </div>
                          <Badge variant={verification.status === "approved" ? "default" : verification.status === "rejected" ? "destructive" : "secondary"}>
                            {verification.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {verification.verificationLevel} • Submitted {new Date(verification.createdAt).toLocaleDateString()}
                        </div>
                        {verification.reviewNotes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Review Notes:</strong> {verification.reviewNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>
                  Review and approve member verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : !verifications || verifications.filter((v: MemberVerification) => v.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending verification requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifications.filter((v: MemberVerification) => v.status === "pending").map((verification: MemberVerification) => (
                      <div key={verification.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {verification.user?.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getVerificationTypeDisplay(verification.verificationType)} • 
                              Submitted {new Date(verification.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge>Level {verification.verificationLevel}</Badge>
                        </div>

                        {verification.verificationData && (
                          <div className="mb-4 p-3 bg-muted rounded">
                            <div className="font-medium mb-2">Submitted Data:</div>
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(verification.verificationData, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => reviewVerificationMutation.mutate({ 
                              id: verification.id, 
                              status: "approved", 
                              notes: "Verification approved" 
                            })}
                            disabled={reviewVerificationMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => reviewVerificationMutation.mutate({ 
                              id: verification.id, 
                              status: "rejected", 
                              notes: "Verification rejected - insufficient evidence" 
                            })}
                            disabled={reviewVerificationMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
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