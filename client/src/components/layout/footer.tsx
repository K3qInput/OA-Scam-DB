import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CurrentTime } from "@/components/real-time-timestamp";
import { Users, FileText, Shield, Activity } from "lucide-react";

export default function Footer() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => apiRequest("GET", "/api/dashboard/stats"),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  return (
    <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800 px-4 sm:px-6 py-3 sm:py-4 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-6 gap-3 sm:gap-0 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center space-x-2 min-w-0">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Users: {stats?.totalUsers || 0}</span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Cases: {stats?.totalCases || 0}</span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Verified: {stats?.verifiedCases || 0}</span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Active: <CurrentTime className="text-white font-medium" /></span>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-1">
          <span>Updated:</span>
          <CurrentTime className="text-slate-400" />
        </div>
      </div>
    </footer>
  );
}