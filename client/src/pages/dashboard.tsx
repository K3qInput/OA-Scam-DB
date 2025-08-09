import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, AlertTriangle, CheckCircle, Users, Eye, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import DataTable from "@/components/ui/data-table";
import CaseModal from "@/components/case-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Link } from "wouter";
import AnimatedCounter from "@/components/animated-counter";
import LoadingSpinner, { LoadingCard } from "@/components/loading-spinner";
import EnhancedButton from "@/components/enhanced-button";
import EnhancedCard, { StatsCard } from "@/components/enhanced-card";
import ActivityFeed from "@/components/activity-feed";
import ThreatIntelWidget from "@/components/threat-intel-widget";
import QuickStats from "@/components/quick-stats";

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
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cases
  const { data: casesData, isLoading } = useQuery({
    queryKey: ["/api/cases", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/cases?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      return response.json();
    },
  });

  // Fetch enhanced statistics
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
    }
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
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
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

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Header onSearch={handleSearch} />
        
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-oa-surface bg-gradient-to-r from-oa-black to-oa-dark animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-bold text-white oa-glow-text">Scam Database</h2>
              <p className="text-gray-300 mt-1">Comprehensive fraud tracking and management portal</p>
            </div>
            
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 h-4 w-4" />
                <Select onValueChange={handleStatusFilter}>
                  <SelectTrigger className="oa-input w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-oa-dark border-oa-surface">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="appealed">Appealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select onValueChange={handleTypeFilter}>
                <SelectTrigger className="oa-input w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-oa-dark border-oa-surface">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="financial_scam">Financial Scam</SelectItem>
                  <SelectItem value="identity_theft">Identity Theft</SelectItem>
                  <SelectItem value="fake_services">Fake Services</SelectItem>
                  <SelectItem value="account_fraud">Account Fraud</SelectItem>
                </SelectContent>
              </Select>
              
              <Link href="/new-case">
                <EnhancedButton variant="primary" glow pulse>
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </EnhancedButton>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Content Area */}
          <div className="flex-1 p-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Cases"
                value={statistics?.totalCases || 0}
                icon={<TrendingUp className="h-6 w-6 text-red-400" />}
                trend={5}
                className="animate-slide-in-up"
              />
              
              <StatsCard
                title="Pending Review"
                value={statistics?.pendingCases || 0}
                icon={<AlertTriangle className="h-6 w-6 text-yellow-400" />}
                trend={-2}
                className="animate-slide-in-up"
              />
              
              <StatsCard
                title="Verified Scams"
                value={statistics?.verifiedCases || 0}
                icon={<CheckCircle className="h-6 w-6 text-red-400" />}
                trend={8}
                className="animate-slide-in-up"
              />
              
              <StatsCard
                title="Alt Accounts"
                value={statistics?.altAccounts || 0}
                icon={<Users className="h-6 w-6 text-blue-400" />}
                trend={3}
                className="animate-slide-in-up"
              />
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
              <EnhancedCard className="animate-fade-in">
                <DataTable
                  cases={cases}
                  onViewCase={(caseId) => setSelectedCaseId(caseId)}
                  onApproveCase={handleApproveCase}
                  onDeleteCase={handleDeleteCase}
                />

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex items-center justify-between p-4 border-t border-oa-surface">
                    <div className="text-sm text-gray-400">
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
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        const isActive = page === pagination.page;
                        return (
                          <EnhancedButton
                            key={page}
                            variant={isActive ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </EnhancedButton>
                        );
                      })}
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
              </EnhancedCard>
            )}
          </div>

          {/* Right Sidebar with Intelligence Widgets */}
          <aside className="w-80 border-l border-oa-surface bg-gradient-to-b from-oa-dark to-oa-black p-6 space-y-6 animate-slide-in-right">
            <ThreatIntelWidget />
            
            <QuickStats
              title="This Week"
              current={statistics?.totalCases || 0}
              previous={Math.max(0, (statistics?.totalCases || 0) - 15)}
              className="animate-bounce-in"
            />
            
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
          </aside>
        </div>
        
        <Footer />
      </main>

      {/* Case Detail Modal */}
      <CaseModal
        caseId={selectedCaseId}
        isOpen={!!selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
      />
    </div>
  );
}
