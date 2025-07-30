import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import DataTable from "@/components/ui/data-table";
import CaseModal from "@/components/case-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Link } from "wouter";

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

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
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
      
      <main className="flex-1 overflow-auto">
        <Header onSearch={handleSearch} />
        
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-oa-surface">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Scam Database</h2>
              <p className="text-gray-400">Manage and track reported scam cases</p>
            </div>
            
            <div className="flex items-center space-x-4">
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
                <Button className="oa-btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="oa-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Cases</p>
                    <p className="text-3xl font-bold text-white">
                      {statistics?.totalCases || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="oa-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-500">
                      {statistics?.pendingCases || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-lg">⏱️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="oa-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Verified Scams</p>
                    <p className="text-3xl font-bold text-red-500">
                      {statistics?.verifiedCases || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="oa-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Alt Accounts</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {statistics?.altAccounts || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <>
              <DataTable
                cases={cases}
                onViewCase={(caseId) => setSelectedCaseId(caseId)}
                onApproveCase={handleApproveCase}
                onDeleteCase={handleDeleteCase}
              />

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="oa-btn-secondary"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      const isActive = page === pagination.page;
                      return (
                        <Button
                          key={page}
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={isActive ? "oa-btn-primary" : "oa-btn-secondary"}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="oa-btn-secondary"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
