import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, X, Archive, AlertTriangle, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import type { Case, User, Evidence } from "@shared/schema";

interface CaseModalProps {
  caseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CaseWithDetails extends Case {
  reportedUser: User;
  reporterUser: User;
  staffUser?: User;
  evidence: Evidence[];
}

export default function CaseModal({ caseId, isOpen, onClose }: CaseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["/api/cases", caseId],
    enabled: !!caseId && isOpen,
  });

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await apiRequest("PATCH", `/api/cases/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (status: string) => {
    if (!caseId) return;
    updateCaseMutation.mutate({ id: caseId, updates: { status } });
  };

  if (!caseData && !isLoading) return null;

  const case_data = caseData as CaseWithDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-oa-dark border border-oa-surface">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-xl font-bold text-white">
                Case Details
              </DialogTitle>
              {case_data && (
                <>
                  <span className="text-sm font-mono text-blue-400">
                    {case_data.caseNumber}
                  </span>
                  <Badge className={`oa-badge ${getStatusBadgeVariant(case_data.status)}`}>
                    {case_data.status.charAt(0).toUpperCase() + case_data.status.slice(1)}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : case_data ? (
          <ScrollArea className="max-h-[calc(90vh-100px)]">
            <div className="space-y-6 p-1">
              {/* Case Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Reported User
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-oa-surface rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                        {case_data.reportedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {case_data.reportedUser.username.startsWith("@") 
                            ? case_data.reportedUser.username 
                            : `@${case_data.reportedUser.username}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          User ID: {case_data.reportedUser.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Reporter
                    </label>
                    <div className="p-3 bg-oa-surface rounded-lg">
                      <div className="font-medium text-white">
                        {case_data.reporterUser.username.startsWith("@") 
                          ? case_data.reporterUser.username 
                          : `@${case_data.reporterUser.username}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        User ID: {case_data.reporterUser.id.slice(-8)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Scam Type
                    </label>
                    <Badge className={`oa-badge ${getTypeBadgeVariant(case_data.type)}`}>
                      {formatCaseType(case_data.type)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Date Reported
                    </label>
                    <div className="p-3 bg-oa-surface rounded-lg text-sm text-white">
                      {new Date(case_data.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {case_data.amountInvolved && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Amount Involved
                      </label>
                      <div className="p-3 bg-oa-surface rounded-lg text-sm font-semibold text-red-400">
                        ${case_data.amountInvolved} {case_data.currency}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Priority Level
                    </label>
                    <Badge className={`oa-badge ${getPriorityBadgeVariant(case_data.priority)}`}>
                      {case_data.priority.charAt(0).toUpperCase() + case_data.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-oa-surface" />

              {/* Case Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <div className="p-4 bg-oa-surface rounded-lg">
                  <p className="text-sm leading-relaxed text-white">
                    {case_data.description}
                  </p>
                </div>
              </div>

              {/* Evidence Section */}
              {case_data.evidence && case_data.evidence.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Evidence
                  </label>
                  <div className="space-y-3">
                    {case_data.evidence.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-center justify-between p-3 bg-oa-surface rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileIcon fileType={evidence.fileType} />
                          <div>
                            <span className="text-sm text-white">{evidence.originalName}</span>
                            {evidence.description && (
                              <p className="text-xs text-gray-400">{evidence.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            window.open(`/api/evidence/${evidence.id}/download`, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-oa-surface" />

              {/* Staff Actions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-red-500">Staff Actions</h4>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => handleStatusUpdate("verified")}
                    disabled={updateCaseMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Verify Case
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("pending")}
                    disabled={updateCaseMutation.isPending}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Need More Info
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updateCaseMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Case
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("archived")}
                    disabled={updateCaseMutation.isPending}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const FileIcon = ({ fileType }: { fileType: string }) => {
  if (fileType.startsWith("image/")) {
    return <div className="h-5 w-5 bg-blue-500 rounded flex items-center justify-center text-xs text-white">IMG</div>;
  }
  if (fileType === "application/pdf") {
    return <div className="h-5 w-5 bg-red-500 rounded flex items-center justify-center text-xs text-white">PDF</div>;
  }
  return <div className="h-5 w-5 bg-gray-500 rounded flex items-center justify-center text-xs text-white">DOC</div>;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending": return "oa-badge-pending";
    case "verified": return "oa-badge-verified";
    case "resolved": return "oa-badge-resolved";
    case "appealed": return "oa-badge-appealed";
    case "rejected": return "oa-badge-rejected";
    case "archived": return "oa-badge-archived";
    default: return "oa-badge-pending";
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "financial_scam": return "oa-badge-rejected";
    case "fake_services": return "bg-orange-900 text-orange-200";
    case "identity_theft": return "bg-purple-900 text-purple-200";
    case "account_fraud": return "bg-blue-900 text-blue-200";
    default: return "oa-badge-pending";
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "low": return "bg-green-900 text-green-200";
    case "medium": return "oa-badge-pending";
    case "high": return "bg-orange-900 text-orange-200";
    case "critical": return "oa-badge-rejected";
    default: return "oa-badge-pending";
  }
};

const formatCaseType = (type: string) => {
  return type.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};
