import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Users, FileText, 
  MessageSquare, Shield, Eye, Calendar, Download,
  Filter, RefreshCw, AlertCircle, CheckCircle, Clock,
  Target, Zap, Award, Globe, Database, BarChart3
} from "lucide-react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [viewType, setViewType] = useState("overview");

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    initialData: {
      overview: {
        totalUsers: 1247,
        activeUsers: 892,
        totalCases: 156,
        resolvedCases: 134,
        pendingCases: 22,
        totalContent: 89,
        totalModerationActions: 45,
        averageResolutionTime: 3.2,
      },
      userActivity: [
        { date: '2025-08-04', users: 45, newUsers: 8, sessions: 127 },
        { date: '2025-08-05', users: 52, newUsers: 12, sessions: 145 },
        { date: '2025-08-06', users: 48, newUsers: 6, sessions: 132 },
        { date: '2025-08-07', users: 65, newUsers: 15, sessions: 178 },
        { date: '2025-08-08', users: 58, newUsers: 9, sessions: 156 },
        { date: '2025-08-09', users: 72, newUsers: 18, sessions: 201 },
        { date: '2025-08-10', users: 68, newUsers: 11, sessions: 189 },
      ],
      caseStats: [
        { name: 'Financial Scam', value: 35, color: '#8884d8' },
        { name: 'Identity Theft', value: 28, color: '#82ca9d' },
        { name: 'Fake Services', value: 22, color: '#ffc658' },
        { name: 'Account Fraud', value: 18, color: '#ff7c7c' },
        { name: 'Other', value: 12, color: '#8dd1e1' },
      ],
      moderationTrends: [
        { date: '2025-08-04', warnings: 3, bans: 1, deletions: 5 },
        { date: '2025-08-05', warnings: 5, bans: 2, deletions: 8 },
        { date: '2025-08-06', warnings: 2, bans: 0, deletions: 3 },
        { date: '2025-08-07', warnings: 7, bans: 3, deletions: 12 },
        { date: '2025-08-08', warnings: 4, bans: 1, deletions: 6 },
        { date: '2025-08-09', warnings: 6, bans: 2, deletions: 9 },
        { date: '2025-08-10', warnings: 3, bans: 1, deletions: 4 },
      ],
      contentPerformance: [
        { type: 'Announcements', views: 2547, engagement: 68 },
        { type: 'Guides', views: 1893, engagement: 82 },
        { type: 'Policies', views: 945, engagement: 34 },
        { type: 'News', views: 1567, engagement: 56 },
        { type: 'Tutorials', views: 1234, engagement: 74 },
        { type: 'FAQ', views: 891, engagement: 45 },
      ],
      topPerformers: [
        { name: 'Alex Chen', casesResolved: 23, avgTime: 2.1, rating: 4.9 },
        { name: 'Sarah Johnson', casesResolved: 19, avgTime: 2.8, rating: 4.7 },
        { name: 'Mike Rodriguez', casesResolved: 17, avgTime: 3.2, rating: 4.6 },
        { name: 'Emily Davis', casesResolved: 15, avgTime: 2.5, rating: 4.8 },
      ],
    },
  });

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "1d": return "Last 24 hours";
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      default: return "Last 7 days";
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

  return (
    <div className="container mx-auto p-6 bg-oa-dark min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-oa-red" />
            Advanced Analytics
          </h1>
          <p className="text-oa-gray mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-oa-light border-oa-border text-white w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="1d" className="text-white hover:bg-oa-light">Last 24 hours</SelectItem>
              <SelectItem value="7d" className="text-white hover:bg-oa-light">Last 7 days</SelectItem>
              <SelectItem value="30d" className="text-white hover:bg-oa-light">Last 30 days</SelectItem>
              <SelectItem value="90d" className="text-white hover:bg-oa-light">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-oa-red hover:bg-oa-red/80">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Total Users</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">+12.5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Active Cases</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.pendingCases}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-400">-8.2%</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Resolution Rate</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round((analyticsData.overview.resolvedCases / analyticsData.overview.totalCases) * 100)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">+5.7%</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.averageResolutionTime}d</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">-15.3%</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Activity Chart */}
        <Card className="bg-oa-light border-oa-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity Trends
            </CardTitle>
            <CardDescription className="text-oa-gray">
              Daily active users and new registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Case Distribution */}
        <Card className="bg-oa-light border-oa-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Case Type Distribution
            </CardTitle>
            <CardDescription className="text-oa-gray">
              Breakdown of case types by frequency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.caseStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.caseStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Moderation Activity */}
        <Card className="bg-oa-light border-oa-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Moderation Activity
            </CardTitle>
            <CardDescription className="text-oa-gray">
              Daily moderation actions taken by staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.moderationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Area type="monotone" dataKey="warnings" stackId="1" stroke="#ffc658" fill="#ffc658" />
                <Area type="monotone" dataKey="bans" stackId="1" stroke="#ff7c7c" fill="#ff7c7c" />
                <Area type="monotone" dataKey="deletions" stackId="1" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card className="bg-oa-light border-oa-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Performance
            </CardTitle>
            <CardDescription className="text-oa-gray">
              Views and engagement by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.contentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="type" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="views" fill="#8884d8" />
                <Bar dataKey="engagement" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-oa-light border-oa-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Staff
          </CardTitle>
          <CardDescription className="text-oa-gray">
            Staff members with highest performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformers.map((performer: any, index: number) => (
              <div key={performer.name} className="flex items-center justify-between p-4 bg-oa-dark rounded-lg border border-oa-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-oa-red rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{performer.name}</p>
                    <p className="text-sm text-oa-gray">
                      {performer.casesResolved} cases resolved • Avg: {performer.avgTime}d
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-yellow-600 hover:bg-yellow-700">
                    ⭐ {performer.rating}
                  </Badge>
                  <div className="w-24 bg-oa-border rounded-full h-2">
                    <div 
                      className="bg-oa-red h-2 rounded-full" 
                      style={{ width: `${(performer.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}