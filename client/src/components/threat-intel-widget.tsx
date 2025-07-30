import { useState, useEffect } from "react";
import { Shield, AlertTriangle, TrendingUp, Globe, MapPin, Clock } from "lucide-react";
import EnhancedCard from "./enhanced-card";
import AnimatedCounter from "./animated-counter";
import { LoadingSkeleton } from "./loading-spinner";

interface ThreatData {
  totalThreats: number;
  activeThreats: number;
  resolvedToday: number;
  topRegions: Array<{ region: string; count: number; }>;
  threatTypes: Array<{ type: string; count: number; percentage: number; }>;
  recentAlerts: Array<{ id: string; type: string; severity: "low" | "medium" | "high" | "critical"; timestamp: string; }>;
}

export default function ThreatIntelWidget({ className = "" }: { className?: string }) {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading threat intelligence data
    const loadThreatData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setThreatData({
        totalThreats: 1247,
        activeThreats: 89,
        resolvedToday: 23,
        topRegions: [
          { region: "North America", count: 456 },
          { region: "Europe", count: 321 },
          { region: "Asia Pacific", count: 289 },
          { region: "Other", count: 181 }
        ],
        threatTypes: [
          { type: "Financial Scams", count: 542, percentage: 43.5 },
          { type: "Identity Theft", count: 298, percentage: 23.9 },
          { type: "Fake Services", count: 234, percentage: 18.8 },
          { type: "Account Fraud", count: 173, percentage: 13.8 }
        ],
        recentAlerts: [
          { id: "1", type: "Cryptocurrency Scam", severity: "critical", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
          { id: "2", type: "Phishing Campaign", severity: "high", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
          { id: "3", type: "Fake Marketplace", severity: "medium", timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString() }
        ]
      });
      
      setIsLoading(false);
    };

    loadThreatData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-900/20";
      case "high": return "text-orange-400 bg-orange-900/20";
      case "medium": return "text-yellow-400 bg-yellow-900/20";
      case "low": return "text-green-400 bg-green-900/20";
      default: return "text-gray-400 bg-gray-900/20";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  if (isLoading) {
    return (
      <EnhancedCard className={`p-6 ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <LoadingSkeleton className="h-6 w-48" />
            <LoadingSkeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <LoadingSkeleton className="h-8 w-16" />
                <LoadingSkeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Threat Intelligence</h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={threatData?.totalThreats || 0} />
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              <AnimatedCounter value={threatData?.activeThreats || 0} />
            </div>
            <div className="text-xs text-gray-400 mt-1">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              <AnimatedCounter value={threatData?.resolvedToday || 0} />
            </div>
            <div className="text-xs text-gray-400 mt-1">Resolved Today</div>
          </div>
        </div>

        {/* Threat Types Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Threat Distribution</h4>
          <div className="space-y-2">
            {threatData?.threatTypes.map((threat, index) => (
              <div key={threat.type} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-300">{threat.type}</span>
                  <span className="text-gray-400">{threat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="oa-progress-bar h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${threat.percentage}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Alerts</h4>
          <div className="space-y-2">
            {threatData?.recentAlerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity).split(' ')[1]}`} />
                  <span className="text-xs text-gray-300">{alert.type}</span>
                </div>
                <span className="text-xs text-gray-500">{getTimeAgo(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-1" />
            Top Regions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {threatData?.topRegions.map((region, index) => (
              <div 
                key={region.region} 
                className="flex items-center justify-between text-xs animate-bounce-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <span className="text-gray-300">{region.region}</span>
                <span className="text-red-400 font-medium">{region.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
}