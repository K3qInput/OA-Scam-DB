
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertTriangle, Eye, ExternalLink, Search, Filter } from 'lucide-react';
import { apiRequest } from '@/lib/auth-utils';

interface ImpersonationAlert {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  similarity: number;
  detectionMethod: string;
  location: string;
  createdAt: string;
  status: 'active' | 'resolved' | 'false_positive';
  screenshots: string[];
}

interface HeatmapData {
  platform: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recentActivity: ImpersonationAlert[];
}

export default function ImpersonationHeatmap() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<ImpersonationAlert | null>(null);

  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['/api/impersonation/heatmap'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/impersonation/heatmap');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/impersonation/alerts', searchTerm, selectedPlatform],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      
      const response = await apiRequest('GET', `/api/impersonation/alerts?${params}`);
      return response.json();
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-red-600';
    if (similarity >= 70) return 'text-orange-600';
    if (similarity >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const platforms = [
    'Discord', 'Twitter', 'Instagram', 'LinkedIn', 'GitHub', 
    'Reddit', 'Telegram', 'YouTube', 'Twitch', 'TikTok'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Impersonation Heatmap</h1>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform.toLowerCase()}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 10 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          heatmapData?.map((data: HeatmapData) => (
            <Card 
              key={data.platform}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPlatform(data.platform.toLowerCase())}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{data.platform}</h3>
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(data.severity)}`}></div>
                </div>
                <div className="text-2xl font-bold">{data.count}</div>
                <div className="text-xs text-muted-foreground">
                  {data.severity} severity
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              Latest impersonation attempts detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts?.map((alert: ImpersonationAlert) => (
                <div 
                  key={alert.id}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{alert.username}</div>
                      <div className="text-sm text-muted-foreground">{alert.platform}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getSimilarityColor(alert.similarity)}`}>
                        {alert.similarity}%
                      </div>
                      <div className="text-xs text-muted-foreground">similarity</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                      {alert.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Details */}
        {selectedAlert && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Alert Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <div>{selectedAlert.platform}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <div>{selectedAlert.username}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Similarity</label>
                  <div className={getSimilarityColor(selectedAlert.similarity)}>
                    {selectedAlert.similarity}%
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Detection Method</label>
                  <div>{selectedAlert.detectionMethod}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div>{selectedAlert.location}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedAlert.status === 'active' ? 'destructive' : 'secondary'}>
                    {selectedAlert.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Profile URL</label>
                <div className="flex items-center gap-2">
                  <a 
                    href={selectedAlert.profileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate flex-1"
                  >
                    {selectedAlert.profileUrl}
                  </a>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedAlert.screenshots.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Screenshots</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedAlert.screenshots.map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="destructive" size="sm">
                  Report False Positive
                </Button>
                <Button variant="default" size="sm">
                  Take Action
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
