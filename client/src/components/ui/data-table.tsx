import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, Trash2, AlertTriangle, Clock, FileText, User, Check, Scale, Edit } from "lucide-react";
import type { Case, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { RealTimeTimestamp } from "../real-time-timestamp";
import { useIsMobile } from "@/hooks/use-mobile";

interface DataTableProps {
  cases: (Case & { reportedUser: User; reporterUser: User; staffUser?: User })[];
  onViewCase: (caseId: string) => void;
  onApproveCase?: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
  onEditCase?: (caseId: string) => void;
  onReviewAppeal?: (caseId: string) => void;
}

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

const formatCaseType = (type: string) => {
  return type.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getUserInitial = (username: string) => {
  return username.charAt(username.startsWith("@") ? 1 : 0).toUpperCase();
};

export default function DataTable({
  cases,
  onViewCase,
  onApproveCase,
  onDeleteCase,
  onEditCase,
  onReviewAppeal,
}: DataTableProps) {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (isMobile) {
    // Mobile card layout
    return (
      <div className="oa-card rounded-lg border border-oa-surface p-4 space-y-4">
        <div className="px-6 py-4 border-b border-oa-surface">
          <h3 className="text-lg font-semibold">Recent Cases</h3>
        </div>
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="bg-oa-surface backdrop-blur-sm border border-oa-surface rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">{caseItem.title || `Case #${caseItem.caseNumber}`}</h3>
                <p className="text-gray-400 text-xs">ID: {caseItem.reportedUser?.id?.slice(-8) || caseItem.reportedUserId?.slice(-8) || "N/A"}</p>
              </div>
              <Badge className={`oa-badge ${getStatusBadgeVariant(caseItem.status)} text-xs`}>
                {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs capitalize ${getTypeBadgeVariant(caseItem.type)}`}>
                {formatCaseType(caseItem.type)}
              </span>
              <RealTimeTimestamp 
                date={caseItem.createdAt} 
                showRelative={true}
                className="text-xs text-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 h-8 w-8">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitial(caseItem.reportedUser?.username || caseItem.reportedUserId || "Unknown")}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">
                  {caseItem.reportedUser?.username 
                    ? (caseItem.reportedUser.username.startsWith("@") 
                        ? caseItem.reportedUser.username 
                        : `@${caseItem.reportedUser.username}`)
                    : caseItem.reportedUserId || "Unknown User"}
                </div>
                <div className="text-sm text-gray-400">
                  Reporter: {caseItem.reporterUser?.username 
                    ? (caseItem.reporterUser.username.startsWith("@") 
                        ? caseItem.reporterUser.username 
                        : `@${caseItem.reporterUser.username}`)
                    : caseItem.reporterUserId || "Unknown Reporter"}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewCase(caseItem.id)}
                className="flex-1 text-xs text-blue-400 hover:text-blue-300 p-1"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              {caseItem.status === "pending" && onApproveCase && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApproveCase(caseItem.id)}
                  className="flex-1 text-xs text-green-400 hover:text-green-300 p-1"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {caseItem.status === "appealed" && onReviewAppeal && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReviewAppeal(caseItem.id)}
                  className="flex-1 text-xs text-orange-400 hover:text-orange-300 p-1"
                >
                  <Scale className="h-4 w-4" />
                  Review
                </Button>
              )}
              {(caseItem.status === "verified" || caseItem.status === "resolved") && onEditCase && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditCase(caseItem.id)}
                  className="flex-1 text-xs text-yellow-400 hover:text-yellow-300 p-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDeleteCase && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteCase(caseItem.id)}
                  className="flex-1 text-xs text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className="oa-card rounded-lg border border-oa-surface">
      <div className="px-6 py-4 border-b border-oa-surface">
        <h3 className="text-lg font-semibold">Recent Cases</h3>
      </div>

      <div className="overflow-x-auto">
        <Table className="oa-table">
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id} className="hover:bg-oa-surface transition-colors">
                <TableCell>
                  <span className="text-sm font-mono text-blue-400">
                    {caseItem.caseNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getUserInitial(caseItem.reportedUser?.username || caseItem.reportedUserId || "Unknown")}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">
                        {caseItem.reportedUser?.username 
                          ? (caseItem.reportedUser.username.startsWith("@") 
                              ? caseItem.reportedUser.username 
                              : `@${caseItem.reportedUser.username}`)
                          : caseItem.reportedUserId || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-400">
                        ID: {caseItem.reportedUser?.id?.slice(-8) || caseItem.reportedUserId?.slice(-8) || "N/A"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`oa-badge ${getTypeBadgeVariant(caseItem.type)}`}>
                    {formatCaseType(caseItem.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`oa-badge ${getStatusBadgeVariant(caseItem.status)}`}>
                    {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-400">
                  {caseItem.reporterUser?.username 
                    ? (caseItem.reporterUser.username.startsWith("@") 
                        ? caseItem.reporterUser.username 
                        : `@${caseItem.reporterUser.username}`)
                    : caseItem.reporterUserId || "Unknown Reporter"}
                </TableCell>
                <TableCell className="text-gray-400">
                  <RealTimeTimestamp 
                    date={caseItem.createdAt} 
                    showRelative={true}
                    className="text-sm text-gray-400"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewCase(caseItem.id)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {caseItem.status === "pending" && onApproveCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApproveCase(caseItem.id)}
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {caseItem.status === "appealed" && onReviewAppeal && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReviewAppeal(caseItem.id)}
                        className="text-orange-400 hover:text-orange-300 p-1"
                      >
                        <Scale className="h-4 w-4" />
                      </Button>
                    )}
                    {(caseItem.status === "verified" || caseItem.status === "resolved") && onEditCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCase(caseItem.id)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCase(caseItem.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}