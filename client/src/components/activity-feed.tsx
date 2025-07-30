import { useQuery } from "@tanstack/react-query";
import { Clock, User, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import EnhancedCard from "./enhanced-card";
import { LoadingSkeleton } from "./loading-spinner";

interface ActivityItem {
  id: string;
  type: "case_created" | "case_verified" | "case_resolved" | "case_appealed" | "user_created";
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: any;
}

export default function ActivityFeed({ className = "" }: { className?: string }) {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      // For now, return mock data since we don't have this endpoint yet
      return [
        {
          id: "1",
          type: "case_created",
          title: "New Financial Scam Reported",
          description: "High priority case involving $50,000 cryptocurrency fraud",
          user: "Admin",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          metadata: { caseId: "OA-001", priority: "high" }
        },
        {
          id: "2", 
          type: "case_verified",
          title: "Case Verified",
          description: "Identity theft case confirmed and flagged",
          user: "Staff Member",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          metadata: { caseId: "OA-002" }
        },
        {
          id: "3",
          type: "case_resolved",
          title: "Case Resolved",
          description: "Fake service provider case closed successfully",
          user: "Admin",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          metadata: { caseId: "OA-003" }
        }
      ];
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "case_created":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "case_verified":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "case_resolved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "case_appealed":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "user_created":
        return <User className="h-4 w-4 text-purple-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <EnhancedCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{getTimeAgo(activity.timestamp)}</span>
                  {activity.metadata?.caseId && (
                    <>
                      <span>•</span>
                      <span className="text-red-400">{activity.metadata.caseId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </EnhancedCard>
  );
}