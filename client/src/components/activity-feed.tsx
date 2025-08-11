import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  UserPlus,
  Settings,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'case_created' | 'case_updated' | 'user_registered' | 'security_alert' | 'admin_action' | 'comment_added';
  title: string;
  description: string;
  user: {
    id: string;
    username: string;
    role: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: {
    caseId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: string;
    [key: string]: any;
  };
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  filter?: string[];
  className?: string;
}

export default function ActivityFeed({ 
  limit = 20, 
  showHeader = true, 
  filter,
  className = "" 
}: ActivityFeedProps) {
  const { data: activities = [], isLoading, refetch } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activity-feed", { limit, filter }],
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: [
      {
        id: "1",
        type: "case_created",
        title: "New Case Reported",
        description: "Financial scam case involving cryptocurrency transaction",
        user: {
          id: "user1",
          username: "reporter_user",
          role: "user",
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: {
          caseId: "case-123",
          severity: "high"
        }
      },
      {
        id: "2",
        type: "security_alert",
        title: "Alt Account Detected",
        description: "High-confidence alt account detection triggered",
        user: {
          id: "system",
          username: "System",
          role: "system",
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metadata: {
          severity: "high"
        }
      },
      {
        id: "3",
        type: "case_updated",
        title: "Case Status Updated",
        description: "Case marked as verified after review",
        user: {
          id: "admin1",
          username: "admin_user",
          role: "admin",
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: {
          caseId: "case-120",
          status: "verified"
        }
      },
      {
        id: "4",
        type: "user_registered",
        title: "New User Registration",
        description: "User completed account verification process",
        user: {
          id: "user2",
          username: "new_member",
          role: "user",
        },
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: "5",
        type: "admin_action",
        title: "User Role Updated",
        description: "User promoted to staff member",
        user: {
          id: "admin1",
          username: "admin_user",
          role: "admin",
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ]
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_created':
      case 'case_updated':
        return FileText;
      case 'user_registered':
        return UserPlus;
      case 'security_alert':
        return Shield;
      case 'admin_action':
        return Settings;
      case 'comment_added':
        return MessageSquare;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (severity) {
      switch (severity) {
        case 'critical': return 'text-red-400';
        case 'high': return 'text-orange-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-blue-400';
      }
    }

    switch (type) {
      case 'case_created': return 'text-blue-400';
      case 'case_updated': return 'text-green-400';
      case 'security_alert': return 'text-red-400';
      case 'user_registered': return 'text-green-400';
      case 'admin_action': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-900 text-red-200';
      case 'staff': return 'bg-blue-900 text-blue-200';
      case 'tribunal_head': return 'bg-purple-900 text-purple-200';
      case 'system': return 'bg-gray-900 text-gray-200';
      default: return 'bg-slate-900 text-slate-200';
    }
  };

  const formatUsername = (username: string) => {
    return username.charAt(0).toUpperCase() + username.slice(1).replace(/_/g, ' ');
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
      )}

      <CardContent className={showHeader ? "" : "p-0"}>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-slate-600 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-600 rounded w-3/4" />
                      <div className="h-3 bg-slate-600 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                const iconColor = getActivityColor(activity.type, activity.metadata?.severity);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg bg-slate-700 ${iconColor}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-slate-300 mt-1">
                            {activity.description}
                          </p>
                        </div>
                        
                        {activity.metadata?.severity && (
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${
                              activity.metadata.severity === 'critical' ? 'bg-red-900 text-red-200' :
                              activity.metadata.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                              activity.metadata.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-blue-900 text-blue-200'
                            }`}
                          >
                            {activity.metadata.severity}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                              {activity.user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <span>{formatUsername(activity.user.username)}</span>
                          
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleBadgeColor(activity.user.role)}`}
                          >
                            {activity.user.role}
                          </Badge>
                        </div>
                        
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {activity.metadata?.caseId && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-blue-400 hover:text-blue-300 p-0"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Case {activity.metadata.caseId}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}