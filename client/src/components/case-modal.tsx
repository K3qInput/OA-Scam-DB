import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  Edit3, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Download,
  ExternalLink,
  Mail,
  Phone,
  UserCheck,
  Activity,
  Brain
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Case, Evidence } from "@shared/schema";
import { AIAnalysisDisplay } from "./ai-analysis-display";

interface CaseModalProps {
  caseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit';
}

const statusOptions = [
  { value: 'open', label: 'Open', color: 'bg-blue-900 text-blue-200' },
  { value: 'investigating', label: 'Investigating', color: 'bg-orange-900 text-orange-200' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-900 text-green-200' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-900 text-gray-200' },
  { value: 'escalated', label: 'Escalated', color: 'bg-red-900 text-red-200' }
];

export default function CaseModal({ caseId, isOpen, onClose, mode = 'view' }: CaseModalProps) {
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useQuery<Case & { evidence: Evidence[] }>({
    queryKey: ["/api/cases", caseId],
    enabled: !!caseId && isOpen,
    initialData: caseId ? {
      id: caseId,
      title: "Cryptocurrency Scam Investigation",
      description: "User reports being scammed out of 0.5 BTC through fake investment platform. Evidence includes chat logs, transaction receipts, and website screenshots.",
      accusedUsername: "CryptoKing2024",
      type: "financial_scam" as const,
      status: "investigating" as const,
      amountLost: 12500.00,
      contactInfo: "victim@email.com",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      evidence: [
        {
          id: "1",
          caseId: caseId,
          filename: "chat_logs.txt",
          originalName: "Discord_Chat_Evidence.txt",
          mimeType: "text/plain",
          size: 15842,
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2", 
          caseId: caseId,
          filename: "transaction_receipt.pdf",
          originalName: "BTC_Transaction_Proof.pdf",
          mimeType: "application/pdf",
          size: 245791,
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    } : undefined
  });

  const updateCaseMutation = useMutation({
    mutationFn: async (updates: Partial<Case>) => {
      const response = await apiRequest("PATCH", `/api/cases/${caseId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Case Updated",
        description: "Case details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      setEditMode(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update case.",
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState<Partial<Case>>({});

  const handleUpdate = () => {
    updateCaseMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || 'bg-gray-900 text-gray-200';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  if (!isOpen || !caseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-white">
                {editMode ? "Edit Case" : "Case Details"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Case ID: {caseData.id} • Created {formatDistanceToNow(new Date(caseData.createdAt), { addSuffix: true })}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(caseData.status)}>
                {caseData.status.toUpperCase()}
              </Badge>
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="text-blue-400 border-blue-400 hover:bg-blue-900/20"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="details" className="data-[state=active]:bg-slate-600">
                <FileText className="h-4 w-4 mr-1" />
                Details
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-slate-600">
                <Shield className="h-4 w-4 mr-1" />
                Evidence
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-slate-600">
                <Brain className="h-4 w-4 mr-1" />
                AI Analysis
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-slate-600">
                <Activity className="h-4 w-4 mr-1" />
                Activity
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="details" className="space-y-4">
                {/* Case Header */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-white">
                          {editMode ? (
                            <Input
                              value={formData.title || caseData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="bg-slate-800 border-slate-600 text-white"
                            />
                          ) : (
                            caseData.title
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Accused: <span className="text-white">{caseData.accusedUsername}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(caseData.updatedAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {caseData.amountLost && (
                          <div className="text-lg font-bold text-red-400">
                            ${caseData.amountLost.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">Amount Lost</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status and Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Status</Label>
                          {editMode ? (
                            <Select
                              value={formData.status || caseData.status}
                              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <Badge className={option.color}>
                                      {option.label}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusColor(caseData.status)}>
                              {caseData.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Type</Label>
                          <Badge variant="outline" className="text-slate-300">
                            {caseData.type.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="text-slate-300">Description</Label>
                        {editMode ? (
                          <Textarea
                            value={formData.description || caseData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                          />
                        ) : (
                          <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                            <p className="text-slate-300 whitespace-pre-wrap">{caseData.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Contact Information */}
                      {caseData.contactInfo && (
                        <div className="space-y-2">
                          <Label className="text-slate-300">Contact Information</Label>
                          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-600">
                            {caseData.contactInfo.includes('@') ? (
                              <Mail className="h-4 w-4 text-blue-400" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-green-400" />
                            )}
                            <span className="text-white">{caseData.contactInfo}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                        <div>
                          <h4 className="font-medium text-white">Mark Resolved</h4>
                          <p className="text-xs text-slate-400">Close this case</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                        <div>
                          <h4 className="font-medium text-white">Escalate</h4>
                          <p className="text-xs text-slate-400">Send to senior team</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-8 w-8 text-blue-400" />
                        <div>
                          <h4 className="font-medium text-white">Contact User</h4>
                          <p className="text-xs text-slate-400">Send update</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Evidence Files ({caseData.evidence.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {caseData.evidence.length > 0 ? (
                      <div className="space-y-3">
                        {caseData.evidence.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-blue-400" />
                              <div>
                                <h4 className="font-medium text-white">{file.originalName}</h4>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                  <span>{file.mimeType}</span>
                                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                                  <span>Uploaded {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="border-slate-600 bg-slate-800/50">
                        <FileText className="h-4 w-4" />
                        <AlertDescription className="text-slate-400">
                          No evidence files have been uploaded for this case.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <AIAnalysisDisplay caseId={caseData.id} />
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Case Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock activity timeline */}
                      {[
                        { action: "Case created by user", time: caseData.createdAt, user: "System" },
                        { action: "Evidence uploaded", time: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), user: "Reporter" },
                        { action: "Status changed to Investigating", time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), user: "Admin" },
                        { action: "AI analysis completed", time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), user: "System" },
                        { action: "Case assigned to investigator", time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), user: "Admin" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-white">{activity.action}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span>by {activity.user}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Last updated: {formatDistanceToNow(new Date(caseData.updatedAt), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  className="text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateCaseMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateCaseMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}