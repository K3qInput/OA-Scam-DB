import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NewCase from "@/pages/new-case";
import CaseDetails from "@/pages/case-details";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Contact from "@/pages/contact";
import Disputes from "@/pages/disputes";
import Vouches from "@/pages/vouches";
import AltDetection from "@/pages/alt-detection";
import AdminPanel from "@/pages/admin-panel";
import StaffManagement from "@/pages/staff-management";
import StaffAssignments from "@/pages/staff-assignments";
import TribunalProceedings from "@/pages/tribunal-proceedings";
import CustomRoles from "@/pages/custom-roles";
import LiveActivityFeed from "@/pages/live-activity-feed";
import ReputationInsurance from "@/pages/reputation-insurance";
import ImpersonationHeatmap from "@/pages/impersonation-heatmap";
import ProofOfOwnership from "@/pages/proof-of-ownership";
import MemberVerification from "@/pages/member-verification";
import AITools from "@/pages/ai-tools";
import Marketplace from "@/pages/marketplace";
import ReportVault from "@/pages/report-vault";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-950">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/new-case" component={NewCase} />
            <Route path="/case/:id" component={CaseDetails} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route path="/contact" component={Contact} />
            <Route path="/disputes" component={Disputes} />
            <Route path="/vouches" component={Vouches} />
            <Route path="/alt-detection" component={AltDetection} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin-panel" component={AdminPanel} />
            <Route path="/staff-management" component={StaffManagement} />
            <Route path="/staff-assignments" component={StaffAssignments} />
            <Route path="/tribunal-proceedings" component={TribunalProceedings} />
            <Route path="/custom-roles" component={CustomRoles} />
            <Route path="/live-activity-feed" component={LiveActivityFeed} />
            <Route path="/reputation-insurance" component={ReputationInsurance} />
            <Route path="/impersonation-heatmap" component={ImpersonationHeatmap} />
            <Route path="/proof-of-ownership" component={ProofOfOwnership} />
            <Route path="/member-verification" component={MemberVerification} />
            <Route path="/ai-tools" component={AITools} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/report-vault" component={ReportVault} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;