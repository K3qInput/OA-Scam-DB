import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CaseModal from "@/components/case-modal";

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["/api/cases", id],
    enabled: !!id,
  });

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="px-8 py-6 border-b border-oa-surface">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-white">Case Details</h2>
              {caseData && (
                <p className="text-gray-400">{caseData.caseNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <CaseModal
              caseId={id || null}
              isOpen={true}
              onClose={() => setLocation("/dashboard")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
