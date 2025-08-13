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
    <footer className="bg-oa-dark border-t border-oa-gray/20 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Real-time Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <FileText className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-xs text-slate-500">Cases</div>
              <div className="text-sm text-white font-medium">
                {stats?.totalCases || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Users className="h-4 w-4 text-green-400" />
            <div>
              <div className="text-xs text-slate-500">Users</div>
              <div className="text-sm text-white font-medium">
                {stats?.totalUsers || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Shield className="h-4 w-4 text-yellow-400" />
            <div>
              <div className="text-xs text-slate-500">Active</div>
              <div className="text-sm text-white font-medium">
                {stats?.activeCases || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Activity className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div className="text-sm text-green-400 font-medium">
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="text-center sm:text-left mb-3">
          <div className="text-xs text-slate-500">System Time</div>
          <CurrentTime className="text-sm text-slate-300" />
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-700">
          <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
            © 2025 OwnersAlliance. All rights reserved.
          </div>
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-right">
            Made by Kiro.java - "I was too lazy 💀"
          </div>
        </div>
      </div>
    </footer>
  );
}