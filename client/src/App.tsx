import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import SimpleLogin from "@/pages/simple-login";
import DiscordLogin from "@/pages/discord-login";
import Dashboard from "@/pages/dashboard";
import CaseDetails from "@/pages/case-details";
import NewCase from "@/pages/new-case";
import NotFound from "@/pages/not-found";

function Router() {
  // Check if user has token and redirect accordingly
  const hasToken = typeof window !== 'undefined' && localStorage.getItem("auth_token");
  console.log("Router: Has token:", !!hasToken);

  return (
    <Switch>
      <Route path="/login">
        <DiscordLogin />
      </Route>
      <Route path="/">
        <DiscordLogin />
      </Route>
      <Route path="/dashboard">
        {hasToken ? <Dashboard /> : <DiscordLogin />}
      </Route>
      <Route path="/cases/:id">
        {hasToken ? <CaseDetails /> : <DiscordLogin />}
      </Route>
      <Route path="/new-case">
        {hasToken ? <NewCase /> : <DiscordLogin />}
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
