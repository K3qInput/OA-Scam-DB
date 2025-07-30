import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import SimpleLogin from "@/pages/simple-login";
import Dashboard from "@/pages/dashboard";
import CaseDetails from "@/pages/case-details";
import NewCase from "@/pages/new-case";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("Router state:", { isAuthenticated, isLoading, hasUser: !!user });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-oa-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Dashboard /> : <SimpleLogin />}
      </Route>
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <SimpleLogin />}
      </Route>
      <Route path="/dashboard">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      <Route path="/cases/:id">
        {isAuthenticated ? <CaseDetails /> : <Login />}
      </Route>
      <Route path="/new-case">
        {isAuthenticated ? <NewCase /> : <Login />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-oa-black text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
