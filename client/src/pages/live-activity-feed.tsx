
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  Ban, 
  MessageSquare, 
  Shield, 
  User, 
  Clock,
  Eye,
  Filter
} from "lucide-react";

interface ActivityEvent {
  id: string;
  type: 'report' | 'ban' | 'mute' | 'ai_alert' | 'case_update' | 'login' | 'verification';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  staff?: string;
  timestamp: Date;
  caseId?: string;
  automated: boolean;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'report',
      title: 'New Scam Report',
      description: 'User reported potential Discord scam involving crypto trading',
      severity: 'high',
      user: 'UserA#1234',
      timestamp: new Date(Date.now() - 5 * 60000),
      automated: false,
    },
    {
      id: '2',
      type: 'ai_alert',
      title: 'AI Fraud Detection',
      description: 'Suspicious pattern detected: User creating multiple accounts',
      severity: 'critical',
      user: 'SuspiciousUser#5678',
      timestamp: new Date(Date.now() - 10 * 60000),
      automated: true,
    },
    {
      id: '3',
      type: 'ban',
      title: 'User Banned',
      description: 'Permanent ban applied for confirmed scamming',
      severity: 'medium',
      user: 'ScammerUser#9012',
      staff: 'Moderator#1',
      timestamp: new Date(Date.now() - 15 * 60000),
      automated: false,
    },
    {
      id: '4',
      type: 'case_update',
      title: 'Case Resolved',
      description: 'Case #125 marked as resolved - user verified innocent',
      severity: 'low',
      staff: 'SeniorMod#2',
      caseId: '125',
      timestamp: new Date(Date.now() - 20 * 60000),
      automated: false,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'reports' | 'bans' | 'ai_alerts' | 'cases'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new activity
      const newActivity: ActivityEvent = {
        id: Date.now().toString(),
        type: ['report', 'ai_alert', 'ban', 'mute', 'case_update'][Math.floor(Math.random() * 5)] as any,
        title: 'New Activity',
        description: `Simulated activity at ${new Date().toLocaleTimeString()}`,
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date(),
        automated: Math.random() > 0.5,
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
    }, 30000); // New activity every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return <AlertTriangle className="h-4 w-4" />;
      case 'ban': return <Ban className="h-4 w-4" />;
      case 'mute': return <MessageSquare className="h-4 w-4" />;
      case 'ai_alert': return <Shield className="h-4 w-4" />;
      case 'case_update': return <Eye className="h-4 w-4" />;
      case 'login': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'text-orange-400';
      case 'ban': return 'text-red-400';
      case 'mute': return 'text-yellow-400';
      case 'ai_alert': return 'text-purple-400';
      case 'case_update': return 'text-blue-400';
      case 'login': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'reports') return activity.type === 'report';
    if (filter === 'bans') return activity.type === 'ban' || activity.type === 'mute';
    if (filter === 'ai_alerts') return activity.type === 'ai_alert';
    if (filter === 'cases') return activity.type === 'case_update';
    return true;
  });

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex h-screen bg-oa-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-oa-dark p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Live Activity Feed</h1>
                <p className="text-gray-400">Real-time view of reports, bans, mutes, and AI alerts</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge 
                  className={autoRefresh ? 'bg-green-600' : 'bg-gray-600'}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {autoRefresh ? 'Live' : 'Paused'}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
                All Activity
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="bans" className="data-[state=active]:bg-red-600">
                <Ban className="h-4 w-4 mr-2" />
                Bans/Mutes
              </TabsTrigger>
              <TabsTrigger value="ai_alerts" className="data-[state=active]:bg-red-600">
                <Shield className="h-4 w-4 mr-2" />
                AI Alerts
              </TabsTrigger>
              <TabsTrigger value="cases" className="data-[state=active]:bg-red-600">
                <Eye className="h-4 w-4 mr-2" />
                Cases
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`${getTypeColor(activity.type)} mt-1`}>
                            {getTypeIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white">{activity.title}</h3>
                              <Badge className={`${getSeverityColor(activity.severity)} text-white text-xs`}>
                                {activity.severity}
                              </Badge>
                              {activity.automated && (
                                <Badge variant="outline" className="text-xs bg-purple-900/20 text-purple-300">
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {activity.user && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {activity.user}
                                </span>
                              )}
                              {activity.staff && (
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {activity.staff}
                                </span>
                              )}
                              {activity.caseId && (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  Case #{activity.caseId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredActivities.length === 0 && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Activity</h3>
                    <p className="text-gray-400">No recent activity to display for this filter.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
