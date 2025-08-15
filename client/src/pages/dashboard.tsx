import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, AlertTriangle, CheckCircle, Users, Eye, Filter, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DataTable from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Link, useLocation } from "wouter";
import AnimatedCounter from "@/components/animated-counter";
import LoadingSpinner, { LoadingCard } from "@/components/loading-spinner";
import EnhancedButton from "@/components/enhanced-button";
import EnhancedCard, { StatsCard } from "@/components/enhanced-card";
import ActivityFeed from "@/components/activity-feed";
import ThreatIntelWidget from "@/components/threat-intel-widget";
import QuickStats from "@/components/quick-stats";
import { RealTimeTimestamp, CurrentTime } from "@/components/real-time-timestamp";
import { RealTimeDashboardStats } from "@/components/real-time-dashboard-stats";
import { RealTimeCaseTracker } from "@/components/real-time-case-tracker";

interface Filters {
  status?: string;
  type?: string;
  search?: string;
  page: number;
  limit: number;
}

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cases
  const { data: casesData, isLoading, error: casesError } = useQuery({
    queryKey: ["/api/cases", filters],
    refetchInterval: 10000, // Refetch every 10 seconds for real-time case updates
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      params.append("limit", "50");
      params.append("offset", ((filters.page - 1) * 50).toString());

      const response = await fetch(`/api/cases?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      return response.json();
    },
  });

  // Fetch statistics with real-time updates
  const { data: statistics } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    initialData: {
      totalCases: 0,
      pendingCases: 0,
      verifiedCases: 0,
      altAccounts: 0,
      contactMessages: {
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0,
      },
      staffAssignments: {
        total: 0,
        active: 0,
        completed: 0,
      },
      staffMembers: {
        total: 0,
        admin: 0,
        tribunalHead: 0,
        seniorStaff: 0,
        staff: 0,
      }
    },
    refetchInterval: 15000, // Refetch every 15 seconds for real-time stats
    refetchIntervalInBackground: true,
  });

  // Update case mutation
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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === "all" ? undefined : status,
      page: 1
    }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: type === "all" ? undefined : type,
      page: 1
    }));
  };

  const handleApproveCase = (caseId: string) => {
    updateCaseMutation.mutate({ id: caseId, updates: { status: "verified" } });
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm("Are you sure you want to delete this case?")) {
      updateCaseMutation.mutate({ id: caseId, updates: { status: "archived" } });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const cases = casesData?.cases || [];
  const pagination = casesData?.pagination || { page: 1, pages: 1, total: 0 };
  const stats = statistics; // Alias for clarity

  return (
    <DashboardLayout title="Tribunal Management Dashboard" subtitle="Comprehensive fraud tracking and tribunal operations portal">
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 lg:mb-6 gap-4">
          <div className="flex flex-wrap items-center space-x-2 md:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white w-36 sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select onValueChange={handleTypeFilter}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white w-36 sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="financial_scam">Financial Scam</SelectItem>
                <SelectItem value="identity_theft">Identity Theft</SelectItem>
                <SelectItem value="fake_services">Fake Services</SelectItem>
                <SelectItem value="account_fraud">Account Fraud</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64 lg:w-80 ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search cases..."
                className="bg-gray-900 border-gray-700 text-white pl-10 w-full"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <Link href="/new-case">
            <EnhancedButton variant="primary" glow pulse>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </EnhancedButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Real-time Dashboard Stats */}
            {/* <RealTimeDashboardStats /> */}
            {/* Placeholder for Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <StatsCard title="Total Cases" value={stats?.totalCases || 0} icon={<FileText className="h-6 w-6 text-blue-400" />} trend="+12%" trendColor="text-green-400" />
              <StatsCard title="Pending Cases" value={stats?.pendingCases || 0} icon={<AlertTriangle className="h-6 w-6 text-yellow-400" />} trend="-3%" trendColor="text-red-400" />
              <StatsCard title="Verified Cases" value={stats?.verifiedCases || 0} icon={<CheckCircle className="h-6 w-6 text-green-400" />} trend="+5%" trendColor="text-green-400" />
            </div>

            {/* Real-time Case Tracker */}
            {/* <RealTimeCaseTracker /> */}
            {/* Placeholder for Case Tracker */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Case Activity</h3>
              <div className="space-y-3">
                {/* Sample Activity Items */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>New Financial Scam Reported</span>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Case #12345 Verified</span>
                  <span className="text-xs text-gray-500">5 minutes ago</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Identity Theft Claim Appealed</span>
                  <span className="text-xs text-gray-500">10 minutes ago</span>
                </div>
              </div>
              <EnhancedButton variant="link" size="sm" className="mt-4 text-blue-400 hover:text-blue-300">
                View All Activity
              </EnhancedButton>
            </div>

            {/* Main Cases Table */}
            {isLoading ? (
              <div className="space-y-4">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" text="Loading cases" />
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl animate-fade-in">
                <DataTable
                  cases={cases}
                  onViewCase={(caseId) => setLocation(`/case/${caseId}`)}
                  onApproveCase={handleApproveCase}
                  onDeleteCase={handleDeleteCase}
                />

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                      Showing{" "}
                      <span className="font-medium">{(pagination.page - 1) * filters.limit + 1}</span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(pagination.page * filters.limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span> results
                    </div>
                    <div className="flex space-x-2">
                      <EnhancedButton
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </EnhancedButton>
                      {/* Simple pagination display for brevity */}
                      <span className="text-sm text-gray-400 px-3 py-1.5 rounded-md bg-gray-800">
                        {pagination.page} of {pagination.pages}
                      </span>
                      <EnhancedButton
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </EnhancedButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar with Intelligence Widgets */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            <ThreatIntelWidget />

            <QuickStats />

            <ActivityFeed className="animate-fade-in" />

            {/* Additional Quick Actions */}
            <EnhancedCard className="p-4 animate-scale-in">
              <h4 className="text-sm font-semibold text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Link href="/new-case">
                  <EnhancedButton variant="primary" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Report New Case
                  </EnhancedButton>
                </Link>
                <EnhancedButton variant="secondary" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Public Lookup
                </EnhancedButton>
                </div>
            </EnhancedCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}