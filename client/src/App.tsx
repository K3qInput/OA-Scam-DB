import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { lazy } from 'react';

// Import pages
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import NewCase from '@/pages/new-case';
import Profile from '@/pages/profile';
import Settings from '@/pages/settings';
import AdminPanel from '@/pages/admin-panel';
import StaffManagement from '@/pages/staff-management';
import AdvancedAnalytics from '@/pages/advanced-analytics';
import AITools from '@/pages/ai-tools';
import ThreatIntel from '@/pages/threat-intel';
import AltDetection from '@/pages/alt-detection';
import ImpersonationHeatmap from '@/pages/impersonation-heatmap';
import Marketplace from '@/pages/marketplace';
import Vouches from '@/pages/vouches';
import CommunityEvents from '@/pages/community-events';
import ResourceHub from '@/pages/resource-hub';
import MemberVerification from '@/pages/member-verification';
import ReputationProfiles from '@/pages/reputation-profiles';
import ReputationInsurance from '@/pages/reputation-insurance';
import ProofOfOwnership from '@/pages/proof-of-ownership';
import CustomRoles from '@/pages/custom-roles';
import TribunalProceedings from '@/pages/tribunal-proceedings';
import StaffAssignments from '@/pages/staff-assignments';
import Disputes from '@/pages/disputes';
import ReportVault from '@/pages/report-vault';
import LiveActivityFeed from '@/pages/live-activity-feed';
import NotFound from '@/pages/not-found';

// Lazy load new pages
const ActionPlaybooks = lazy(() => import('./pages/action-playbooks'));
const AIModerationControls = lazy(() => import('./pages/ai-moderation-controls'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced token check with error handling
const hasToken = () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Router: Has token:', !!token);
    return !!token;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <Routes>
            <Route 
              path="/login" 
              element={!hasToken() ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/" 
              element={hasToken() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
            />

            {/* Protected Routes */}
            <Route path="/*" element={
              hasToken() ? (
                <DashboardLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/new-case" element={<NewCase />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin-panel" element={<AdminPanel />} />
                    <Route path="/staff-management" element={<StaffManagement />} />
                    <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                    <Route path="/ai-tools" element={<AITools />} />
                    <Route path="/threat-intel" element={<ThreatIntel />} />
                    <Route path="/alt-detection" element={<AltDetection />} />
                    <Route path="/impersonation-heatmap" element={<ImpersonationHeatmap />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/vouches" element={<Vouches />} />
                    <Route path="/community-events" element={<CommunityEvents />} />
                    <Route path="/resource-hub" element={<ResourceHub />} />
                    <Route path="/member-verification" element={<MemberVerification />} />
                    <Route path="/reputation-profiles" element={<ReputationProfiles />} />
                    <Route path="/reputation-insurance" element={<ReputationInsurance />} />
                    <Route path="/proof-of-ownership" element={<ProofOfOwnership />} />
                    <Route path="/custom-roles" element={<CustomRoles />} />
                    <Route path="/tribunal-proceedings" element={<TribunalProceedings />} />
                    <Route path="/staff-assignments" element={<StaffAssignments />} />
                    <Route path="/disputes" element={<Disputes />} />
                    <Route path="/report-vault" element={<ReportVault />} />
                    <Route path="/live-activity-feed" element={<LiveActivityFeed />} />
                    
                    {/* New feature pages */}
                    <Route path="/action-playbooks" element={<ActionPlaybooks />} />
                    <Route path="/ai-moderation-controls" element={<AIModerationControls />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;